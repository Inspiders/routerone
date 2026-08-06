const LITELLM_URL = process.env.LITELLM_URL || "http://localhost:4000";
const LITELLM_KEY = process.env.LITELLM_MASTER_KEY || "";

/**
 * Sends a chat completion request to LiteLLM, which handles routing
 * to the actual LLM providers (OpenAI, Anthropic, Groq, DeepSeek, etc.).
 *
 * LiteLLM uses the "provider/model" format (e.g. "openai/gpt-4o", "groq/llama3-8b-8192").
 * This way we never import any provider SDK — LiteLLM handles all of them.
 */
export async function callLiteLLM(
  provider: string,
  model: string,
  messages: Array<{ role: string; content: string }>,
  stream: boolean,
  temperature?: number,
  maxTokens?: number
): Promise<Response> {
  const body: Record<string, unknown> = {
    model: `${provider}/${model}`,
    messages,
    stream,
  };

  if (temperature !== undefined) body.temperature = temperature;
  if (maxTokens !== undefined) body.max_tokens = maxTokens;

  const res = await fetch(`${LITELLM_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LITELLM_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok && !stream) {
    const text = await res.text();
    throw new Error(`LiteLLM ${res.status}: ${text}`);
  }

  return res;
}
