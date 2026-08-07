import type { UnifiedRequest } from "@routerone/shared";

export type Difficulty = "easy" | "medium" | "hard";

interface HeuristicScore {
  difficulty: Difficulty;
  score: number;
  reasons: string[];
}

function countTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function hasCode(text: string): boolean {
  const codePatterns = [
    /```[\s\S]*?```/,
    /`[^`]+`/,
    /(def|function|class|const|let|var|import|from|return|if|else|for|while)/,
    /\{[\s\S]*?\}/,
    /[a-zA-Z_]+\([^)]*\)/,
    /(https?:\/\/|git@|npm|pip|docker)/,
  ];
  return codePatterns.some(p => p.test(text));
}

function hasAmbiguity(text: string): boolean {
  const ambiguityPatterns = [
    /(or|either|maybe|perhaps|unclear|ambiguous|confusing|vague)/i,
    /\?.*\?/,
    /(compare|vs|versus|difference between|pros and cons)/i,
    /(what if|how about|alternatively)/i,
  ];
  return ambiguityPatterns.some(p => p.test(text));
}

function hasReasoning(text: string): boolean {
  const reasoningPatterns = [
    /(why|explain|reason|cause|because|therefore|thus|consequently)/i,
    /(analyze|evaluate|assess|critique|review)/i,
    /(step by step|detailed|thorough|comprehensive|in-depth)/i,
  ];
  return reasoningPatterns.some(p => p.test(text));
}

function hasMath(text: string): boolean {
  const mathPatterns = [
    /(calculate|compute|solve|equation|formula|derivative|integral|matrix|vector)/i,
    /[\d]+[\s]*[\+\-\*\/\^][\s]*[\d]+/,
    /\$[\s]*[\d,.]+/,
    /(percent|percentage|ratio|proportion|statistics)/i,
  ];
  return mathPatterns.some(p => p.test(text));
}

export function classifyDifficulty(req: UnifiedRequest): HeuristicScore {
  const fullText = req.messages.map(m => m.content).join(" ");
  const tokenCount = countTokens(fullText);
  const reasons: string[] = [];
  let score = 0;

  if (tokenCount > 2000) {
    score += 3;
    reasons.push("very long input (>2000 tokens)");
  } else if (tokenCount > 800) {
    score += 2;
    reasons.push("long input (>800 tokens)");
  } else if (tokenCount > 300) {
    score += 1;
    reasons.push("medium input (>300 tokens)");
  }

  if (hasCode(fullText)) {
    score += 2;
    reasons.push("contains code");
  }

  if (hasAmbiguity(fullText)) {
    score += 1;
    reasons.push("ambiguity detected");
  }

  if (hasReasoning(fullText)) {
    score += 1;
    reasons.push("requires complex reasoning");
  }

  if (hasMath(fullText)) {
    score += 2;
    reasons.push("contains math/calculations");
  }

  const questionCount = (fullText.match(/\?/g) || []).length;
  if (questionCount > 3) {
    score += 1;
    reasons.push(`multiple questions (${questionCount})`);
  }

  let difficulty: Difficulty;
  if (score >= 5) {
    difficulty = "hard";
  } else if (score >= 2) {
    difficulty = "medium";
  } else {
    difficulty = "easy";
  }

  return { difficulty, score, reasons };
}

export function modelIndexForDifficulty(difficulty: Difficulty, modelCount: number): number {
  if (modelCount === 0) return 0;
  switch (difficulty) {
    case "easy":   return 0;
    case "medium": return Math.min(1, modelCount - 1);
    case "hard":   return Math.min(2, modelCount - 1);
  }
}
