import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { parseOpenAI, parseAnthropic, toOpenAIResponse, toAnthropicResponse, toOpenAIStreamChunk } from "../lib/parser";
import { decideRoute, pickNextModel } from "../lib/router";
import { calculateCost } from "../lib/cost";
import { validateApiKey } from "../lib/auth";
import { callLiteLLM } from "../lib/litellm";
import { logRequest } from "../lib/logger";
import { checkSemanticCache, storeSemanticCache, incrementCacheHit, incrementCacheMiss } from "../lib/cache/semantic";
import { validateQuality, logFallbackChargeback } from "../lib/fallback";
import { compressContext, shouldCompress } from "../lib/compression";
import { randomUUID } from "crypto";

const proxy = new Hono();

async function handleRequest(c: any, format: "openai" | "anthropic") {
  const start = Date.now();
  const auth = c.req.header("Authorization") || "";
  const apiKey = auth.replace("Bearer ", "").trim();
  const apiKeyId = apiKey ? await validateApiKey(apiKey) : null;
  if (!apiKeyId) return c.json({ error: { message: "Invalid API key", type: "authentication_error" } }, 401);

  let unified;
  try {
    const body = await c.req.json();
    unified = format === "openai" ? parseOpenAI(body) : parseAnthropic(body);
  } catch (e: any) {
    return c.json({ error: { message: e.message, type: "invalid_request_error" } }, 400);
  }

  let { route, decision } = await decideRoute(unified);

  // === COMPRESSÃO DE CONTEXTO ===
  let compressionInfo = null;
  const routeConfig = route.modelsConfig as any;
  const routeMaxTokens = routeConfig?.maxTokens || 4096;
  if (shouldCompress(unified, 1500)) {
    const compressed = compressContext(unified, routeMaxTokens, {
      deduplicate: true,
      summarize: true,
      summarizeKeepRecent: 3,
    });
    unified.messages = compressed.messages;
    unified.max_tokens = compressed.compressedTokenCount < routeMaxTokens ? undefined : routeMaxTokens;
    compressionInfo = compressed;
  }

  // === CACHE SEMÂNTICO ===
  const cacheThreshold = route.qualityThreshold;
  const cacheCheck = await checkSemanticCache(unified, route.name, cacheThreshold);
  if (cacheCheck.hit) {
    await incrementCacheHit(route.name);
    const cached = cacheCheck.entry;
    const latency = Date.now() - start;
    await logRequest({
      apiKeyId, routeId: route.id, provider: cached.provider, model: cached.model,
      inputTokens: 0, outputTokens: 0, cost: 0, baselineCost: 0, savings: 0,
      latencyMs: latency, fallback: false, statusCode: 200,
      requestBody: unified, responseBody: { cached: true, similarity: cacheCheck.similarity, compression: compressionInfo },
    });
    if (format === "openai") {
      return c.json(toOpenAIResponse(cached.response, cached.model, { prompt_tokens: 0, completion_tokens: 0 }, randomUUID()));
    }
    return c.json(toAnthropicResponse(cached.response, cached.model, { prompt_tokens: 0, completion_tokens: 0 }, randomUUID()));
  }
  await incrementCacheMiss(route.name);

  let attempt = 0;
  let lastError: any = null;

  while (attempt < 3) {
    attempt++;
    try {
      const llmRes = await callLiteLLM(
        decision.provider, decision.model,
        unified.messages, unified.stream ?? false,
        unified.temperature, unified.max_tokens
      );

      if (unified.stream) {
        c.header("Content-Type", "text/event-stream");
        c.header("Cache-Control", "no-cache");
        c.header("Connection", "keep-alive");
        let inputTokens = 0;
        let outputTokens = 0;
        let fullContent = "";
        let chunkIndex = 0;

        return streamText(c, async (stream) => {
          const reader = llmRes.body?.getReader();
          if (!reader) throw new Error("No body");
          const decoder = new TextDecoder();
          let buffer = "";
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";
              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const data = line.slice(6);
                if (data === "[DONE]") {
                  await stream.write("data: [DONE]\n\n");
                  continue;
                }
                try {
                  const parsed = JSON.parse(data);
                  const delta = parsed.choices?.[0]?.delta?.content || "";
                  if (delta) {
                    fullContent += delta;
                    outputTokens += Math.ceil(delta.length / 4);
                  }
                  if (parsed.usage?.prompt_tokens) inputTokens = parsed.usage.prompt_tokens;
                  if (parsed.usage?.completion_tokens) outputTokens = parsed.usage.completion_tokens;
                  if (format === "openai") {
                    await stream.write(`data: ${JSON.stringify(toOpenAIStreamChunk(delta, decision.model, chunkIndex++))}\n\n`);
                  } else {
                    await stream.write(`data: ${JSON.stringify({ type: "content_block_delta", index: chunkIndex++, delta: { type: "text_delta", text: delta } })}\n\n`);
                  }
                } catch { /* ignore */ }
              }
            }
          } finally {
            reader.releaseLock?.();
            const { cost, baselineCost, savings } = calculateCost(inputTokens || 1, outputTokens || 1, decision);
            const quality = validateQuality(fullContent, unified, route.qualityThreshold);
            if (!quality.passed && attempt < 3) {
              const next = pickNextModel(route, decision.model);
              if (next) {
                await logFallbackChargeback(apiKeyId, route.id, {
                  decision, inputTokens: inputTokens || 1, outputTokens: outputTokens || 1,
                  cost, qualityPassed: false, error: quality.reason,
                }, unified);
                decision = next;
              }
            }
            await storeSemanticCache(unified, route.name, fullContent, decision.model, decision.provider, cost, 3600);
            await logRequest({
              apiKeyId, routeId: route.id, provider: decision.provider, model: decision.model,
              inputTokens: inputTokens || 1, outputTokens: outputTokens || 1,
              cost, baselineCost, savings,
              latencyMs: Date.now() - start, fallback: decision.isFallback,
              fallbackFromModel: decision.fallbackFrom || null, statusCode: 200,
              requestBody: unified, responseBody: { content: fullContent, qualityScore: quality.score, compression: compressionInfo },
            });
          }
        });
      }

      const json = await llmRes.json();
      const content = json.choices?.[0]?.message?.content || json.content?.[0]?.text || "";
      const usage = json.usage || { prompt_tokens: 0, completion_tokens: 0 };
      const { cost, baselineCost, savings } = calculateCost(usage.prompt_tokens, usage.completion_tokens, decision);

      const quality = validateQuality(content, unified, route.qualityThreshold);
      if (!quality.passed) {
        const next = pickNextModel(route, decision.model);
        if (next) {
          await logFallbackChargeback(apiKeyId, route.id, {
            decision, inputTokens: usage.prompt_tokens, outputTokens: usage.completion_tokens,
            cost, qualityPassed: false, error: quality.reason,
          }, unified);
          decision = next;
          continue;
        }
      }

      await storeSemanticCache(unified, route.name, content, decision.model, decision.provider, cost, 3600);
      await logRequest({
        apiKeyId, routeId: route.id, provider: decision.provider, model: decision.model,
        inputTokens: usage.prompt_tokens, outputTokens: usage.completion_tokens,
        cost, baselineCost, savings,
        latencyMs: Date.now() - start, fallback: decision.isFallback,
        fallbackFromModel: decision.fallbackFrom || null, statusCode: 200,
        requestBody: unified, responseBody: { ...json, qualityScore: quality.score, compression: compressionInfo },
      });

      if (format === "openai") {
        return c.json(toOpenAIResponse(content, decision.model, usage, randomUUID()));
      }
      return c.json(toAnthropicResponse(content, decision.model, usage, randomUUID()));

    } catch (e: any) {
      lastError = e;
      const next = pickNextModel(route, decision.model);
      if (!next) break;
      decision = next;
    }
  }

  const status = lastError?.message?.includes("401") ? 401 : lastError?.message?.includes("429") ? 429 : 502;
  await logRequest({
    apiKeyId, routeId: route.id, provider: decision.provider, model: decision.model,
    inputTokens: 0, outputTokens: 0, cost: 0, baselineCost: 0, savings: 0,
    latencyMs: Date.now() - start, fallback: decision.isFallback,
    fallbackFromModel: decision.fallbackFrom || null, statusCode: status,
    errorMessage: lastError?.message || "Unknown error",
    requestBody: unified,
  });
  return c.json({ error: { message: lastError?.message || "Proxy error", type: "api_error" } }, status);
}

proxy.post("/v1/chat/completions", (c) => handleRequest(c, "openai"));
proxy.post("/v1/messages", (c) => handleRequest(c, "anthropic"));

export default proxy;
