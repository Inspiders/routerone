import type { OpenAIChatRequest, AnthropicRequest, UnifiedRequest } from "@routerone/shared";

/**
 * Parses an OpenAI-format request body into the internal UnifiedRequest format.
 * The proxy uses UnifiedRequest internally so it doesn't care which SDK the client uses.
 */
export function parseOpenAI(body: OpenAIChatRequest): UnifiedRequest {
  if (!body.messages || !Array.isArray(body.messages)) {
    throw new Error("'messages' is required and must be an array");
  }
  return {
    messages: body.messages.map((m) => ({ role: m.role, content: m.content })),
    stream: body.stream ?? false,
    temperature: body.temperature,
    max_tokens: body.max_tokens,
    route: body.route,
    format: "openai",
  };
}

/**
 * Parses an Anthropic-format request body into the internal UnifiedRequest format.
 * The proxy accepts both /v1/chat/completions (OpenAI) and /v1/messages (Anthropic).
 */
export function parseAnthropic(body: AnthropicRequest): UnifiedRequest {
  if (!body.messages || !Array.isArray(body.messages)) {
    throw new Error("'messages' is required and must be an array");
  }
  const messages: UnifiedRequest["messages"] = [];

  // Anthropic puts the system prompt at the top level — move it into messages
  if (body.system) {
    messages.push({ role: "system", content: body.system });
  }

  for (const m of body.messages) {
    messages.push({ role: m.role, content: m.content });
  }

  return {
    messages,
    stream: body.stream ?? false,
    temperature: body.temperature,
    max_tokens: body.max_tokens,
    route: body.route,
    format: "anthropic",
  };
}

/**
 * Formats the internal response as an OpenAI-compatible chat completion object.
 */
export function toOpenAIResponse(
  content: string,
  model: string,
  usage: { prompt_tokens: number; completion_tokens: number },
  id: string
) {
  return {
    id: `chatcmpl-${id}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      total_tokens: usage.prompt_tokens + usage.completion_tokens,
    },
  };
}

/**
 * Formats the internal response as an Anthropic-compatible Messages response.
 */
export function toAnthropicResponse(
  content: string,
  model: string,
  usage: { prompt_tokens: number; completion_tokens: number },
  id: string
) {
  return {
    id: `msg_${id}`,
    type: "message",
    role: "assistant",
    content: [{ type: "text", text: content }],
    model,
    stop_reason: "end_turn",
    usage: {
      input_tokens: usage.prompt_tokens,
      output_tokens: usage.completion_tokens,
    },
  };
}

/**
 * Formats a single SSE chunk for streaming OpenAI-format responses.
 */
export function toOpenAIStreamChunk(delta: string, model: string, index: number) {
  return {
    id: `chatcmpl-stream-${index}`,
    object: "chat.completion.chunk",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        delta: { content: delta },
        finish_reason: null,
      },
    ],
  };
}
