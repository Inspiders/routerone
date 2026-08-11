import { describe, it, expect } from "bun:test";
import { classifyDifficulty, modelIndexForDifficulty } from "../src/lib/classifier";

describe("classifier", () => {
  it("classifies as easy for simple questions", () => {
    const r = classifyDifficulty({
      messages: [{ role: "user", content: "Hello, how are you?" }],
      format: "openai",
    });
    expect(r.difficulty).toBe("easy");
    expect(r.score).toBeLessThan(2);
  });

  it("classifies as medium for requests with code", () => {
    const r = classifyDifficulty({
      messages: [{ role: "user", content: "How do I write a loop in JavaScript? `for (let i=0; i<10; i++)`" }],
      format: "openai",
    });
    expect(r.difficulty).toBe("medium");
  });

  it("classifies as hard for long input + code + math", () => {
    const r = classifyDifficulty({
      messages: [{ role: "user", content: "Solve this differential equation: dy/dx = x^2 + y^2. I need the full step-by-step with Python code to verify numerically. Here is my current code: ```python\nimport numpy as np\n...\n``` and it doesn't work for x > 100." }],
      format: "openai",
    });
    expect(r.difficulty).toBe("hard");
    expect(r.score).toBeGreaterThanOrEqual(5);
  });

  it("modelIndexForDifficulty: easy -> 0", () => {
    expect(modelIndexForDifficulty("easy", 3)).toBe(0);
    expect(modelIndexForDifficulty("easy", 1)).toBe(0);
  });

  it("modelIndexForDifficulty: medium -> min(1, count-1)", () => {
    expect(modelIndexForDifficulty("medium", 3)).toBe(1);
    expect(modelIndexForDifficulty("medium", 1)).toBe(0);
  });

  it("modelIndexForDifficulty: hard -> min(2, count-1)", () => {
    expect(modelIndexForDifficulty("hard", 5)).toBe(2);
    expect(modelIndexForDifficulty("hard", 2)).toBe(1);
    expect(modelIndexForDifficulty("hard", 1)).toBe(0);
  });
});
