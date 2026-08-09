import type { UnifiedRequest } from "@routerone/shared";

export interface CompressionResult {
  messages: Array<{ role: string; content: string }>;
  originalTokenCount: number;
  compressedTokenCount: number;
  compressionRatio: number;
  actions: string[];
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function deduplicateHistory(messages: Array<{ role: string; content: string }>): Array<{ role: string; content: string }> {
  const seen = new Set<string>();
  const result: typeof messages = [];
  for (const msg of messages) {
    const key = `${msg.role}:${msg.content.trim()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(msg);
  }
  return result;
}

function summarizeOldMessages(messages: Array<{ role: string; content: string }>, keepRecent: number): Array<{ role: string; content: string }> {
  if (messages.length <= keepRecent + 1) return messages;

  const systemMsg = messages[0].role === "system" ? [messages[0]] : [];
  const toSummarize = messages.slice(systemMsg.length, -keepRecent);
  const recent = messages.slice(-keepRecent);

  const summaryContent = toSummarize
    .map(m => `[${m.role}]: ${m.content.slice(0, 200)}`)
    .join("\n");

  const summary = {
    role: "system",
    content: `Previous conversation summary:\n${summaryContent.slice(0, 1000)}`,
  };

  return [...systemMsg, summary, ...recent];
}

function capMaxTokens(requestedMax: number | undefined, routeMax: number): number | undefined {
  if (requestedMax === undefined) return routeMax;
  return Math.min(requestedMax, routeMax);
}

export function compressContext(
  req: UnifiedRequest,
  routeMaxTokens: number,
  options: {
    deduplicate?: boolean;
    summarize?: boolean;
    summarizeKeepRecent?: number;
  } = {}
): CompressionResult {
  const actions: string[] = [];
  let messages = [...req.messages];
  const originalTokens = messages.reduce((sum, m) => sum + estimateTokens(m.content), 0);

  if (options.deduplicate !== false) {
    const before = messages.length;
    messages = deduplicateHistory(messages);
    if (messages.length < before) {
      actions.push(`deduplicated ${before - messages.length} messages`);
    }
  }

  if (options.summarize && messages.length > (options.summarizeKeepRecent || 3) + 1) {
    const before = messages.length;
    messages = summarizeOldMessages(messages, options.summarizeKeepRecent || 3);
    actions.push(`summarized ${before - messages.length} old messages`);
  }

  const compressedMax = capMaxTokens(req.max_tokens, routeMaxTokens);
  if (compressedMax !== req.max_tokens) {
    actions.push(`capped max_tokens from ${req.max_tokens} to ${compressedMax}`);
  }

  const compressedTokens = messages.reduce((sum, m) => sum + estimateTokens(m.content), 0);
  const ratio = originalTokens > 0 ? (1 - compressedTokens / originalTokens) : 0;

  return {
    messages,
    originalTokenCount: originalTokens,
    compressedTokenCount: compressedTokens,
    compressionRatio: parseFloat(ratio.toFixed(4)),
    actions,
  };
}

export function shouldCompress(req: UnifiedRequest, thresholdTokens: number = 2000): boolean {
  const totalTokens = req.messages.reduce((sum, m) => sum + estimateTokens(m.content), 0);
  return totalTokens > thresholdTokens;
}
