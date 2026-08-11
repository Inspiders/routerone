import { describe, it, expect } from "bun:test";
import { validateQuality } from "../src/lib/fallback";

describe("fallback quality validation", () => {
  it("rejects empty response", () => {
    const r = validateQuality("", { messages: [{ role: "user", content: "hello" }], format: "openai" }, 0.7);
    expect(r.passed).toBe(false);
    expect(r.reason).toContain("short");
  });

  it("rejects refusal response", () => {
    const r = validateQuality("I don't know the answer.", { messages: [{ role: "user", content: "hello" }], format: "openai" }, 0.7);
    expect(r.passed).toBe(false);
    expect(r.reason).toContain("refused");
  });

  it("rejects response without code when requested", () => {
    const r = validateQuality("Here is the explanation.", { messages: [{ role: "user", content: "Write a Python function" }], format: "openai" }, 0.7);
    expect(r.passed).toBe(false);
    expect(r.reason).toContain("code");
  });

  it("accepts response with code when requested", () => {
    const r = validateQuality("```python\ndef foo():\n    pass\n```", { messages: [{ role: "user", content: "Write a Python function" }], format: "openai" }, 0.7);
    expect(r.passed).toBe(true);
  });

  it("rejects excessive repetition", () => {
    const r = validateQuality("Hello. Hello. Hello. Hello. Hello. Hello.", { messages: [{ role: "user", content: "hello" }], format: "openai" }, 0.7);
    expect(r.passed).toBe(false);
    expect(r.reason).toContain("repetition");
  });

  it("accepts good response in Portuguese", () => {
    const r = validateQuality("Para resolver isto, primeiro devemos analisar os dados. Depois, aplicamos a fórmula.", { messages: [{ role: "user", content: "Como resolver isto?" }], format: "openai" }, 0.7);
    expect(r.passed).toBe(true);
    expect(r.score).toBeGreaterThan(0.7);
  });
});
