import { describe, it, expect } from "bun:test";
import { compressContext, shouldCompress } from "../src/lib/compression";

describe("compression", () => {
  it("deduplicates repeated messages", () => {
    const req = {
      messages: [
        { role: "user", content: "hello" },
        { role: "user", content: "hello" },
        { role: "assistant", content: "hi" },
      ],
      format: "openai" as const,
    };
    const result = compressContext(req, 4096, { deduplicate: true });
    expect(result.messages.length).toBe(2);
    expect(result.actions).toContain("deduplicated 1 messages");
  });

  it("caps max_tokens", () => {
    const req = {
      messages: [{ role: "user", content: "hello" }],
      max_tokens: 10000,
      format: "openai" as const,
    };
    const result = compressContext(req, 4096, { deduplicate: true });
    expect(result.compressedTokenCount).toBeLessThanOrEqual(4096);
  });

  it("summarizes old messages when enabled", () => {
    const req = {
      messages: [
        { role: "system", content: "be helpful" },
        { role: "user", content: "q1" },
        { role: "assistant", content: "a1" },
        { role: "user", content: "q2" },
        { role: "assistant", content: "a2" },
        { role: "user", content: "q3" },
        { role: "assistant", content: "a3" },
        { role: "user", content: "q4" },
      ],
      format: "openai" as const,
    };
    const result = compressContext(req, 4096, { deduplicate: true, summarize: true, summarizeKeepRecent: 2 });
    expect(result.messages.length).toBeLessThan(req.messages.length);
    expect(result.actions.some(a => a.includes("summarized"))).toBe(true);
  });

  it("shouldCompress returns true for long inputs", () => {
    const req = {
      messages: [{ role: "user", content: "a".repeat(10000) }],
      format: "openai" as const,
    };
    expect(shouldCompress(req, 2000)).toBe(true);
  });

  it("shouldCompress returns false for short inputs", () => {
    const req = {
      messages: [{ role: "user", content: "hello" }],
      format: "openai" as const,
    };
    expect(shouldCompress(req, 2000)).toBe(false);
  });
});
