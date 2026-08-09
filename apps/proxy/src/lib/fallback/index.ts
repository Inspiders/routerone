import { db, requestLogs } from "@routerone/shared";
import type { UnifiedRequest, ModelConfig } from "@routerone/shared";
import { sql } from "drizzle-orm";
import type { RoutingDecision } from "../router";
import { calculateCost } from "../cost";

export interface FallbackAttempt {
  decision: RoutingDecision;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  error?: string;
  qualityPassed: boolean;
}

interface QualityCheckResult {
  passed: boolean;
  score: number;
  reason: string;
}

function checkResponseQuality(response: string, req: UnifiedRequest, routeQualityThreshold: number): QualityCheckResult {
  const text = response.trim();
  const fullInput = req.messages.map(m => m.content).join(" ").toLowerCase();

  if (text.length < 10) {
    return { passed: false, score: 0.1, reason: "response too short or empty" };
  }

  const refusalPatterns = [
    /não (sei|posso|tenho|consigo)/i,
    /não tenho (informação|acesso|dados)/i,
    /i (don't|cannot|can't|do not) (know|have|understand)/i,
    /unable to (answer|respond|help)/i,
    /não tenho certeza/i,
    /não tenho a certeza/i,
  ];
  if (refusalPatterns.some(p => p.test(text))) {
    return { passed: false, score: 0.2, reason: "model refused to answer" };
  }

  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 5);
  const uniqueSentences = new Set(sentences.map(s => s.trim().toLowerCase()));
  if (sentences.length > 3 && uniqueSentences.size / sentences.length < 0.5) {
    return { passed: false, score: 0.3, reason: "excessive repetition detected" };
  }

  const asksForCode = /(código|code|script|função|function|class|implementar|implement)/i.test(fullInput);
  const hasCode = /```|`[^`]+`|(def|function|const|let|var|class|return)/.test(text);
  if (asksForCode && !hasCode) {
    return { passed: false, score: 0.4, reason: "code requested but none in response" };
  }

  const inputTokens = Math.ceil(fullInput.length / 4);
  const outputTokens = Math.ceil(text.length / 4);
  if (inputTokens > 100 && outputTokens < 20) {
    return { passed: false, score: 0.5, reason: "disproportionately short response for long input" };
  }

  const isPortuguese = /(ao|para|como|porque|quando|onde|quem|qual|o que|este|esta|esse|essa)/i.test(fullInput);
  if (isPortuguese && !/(ao|para|como|porque|quando|onde|é|são|tem|faz|vai)/i.test(text)) {
    return { passed: false, score: 0.6, reason: "response language does not match request" };
  }

  let score = 0.7;
  if (text.length > 100) score += 0.1;
  if (text.includes("\n")) score += 0.1;
  if (/\d/.test(text)) score += 0.05;
  if (text.includes("?")) score -= 0.1;

  return { passed: score >= routeQualityThreshold, score: Math.min(score, 1.0), reason: "heuristics passed" };
}

export function validateQuality(response: string, req: UnifiedRequest, routeQualityThreshold: number): QualityCheckResult {
  return checkResponseQuality(response, req, routeQualityThreshold);
}

export async function logFallbackChargeback(
  apiKeyId: number | null,
  routeId: number | null,
  attempt: FallbackAttempt,
  unified: UnifiedRequest
): Promise<void> {
  await db.insert(requestLogs).values({
    apiKeyId,
    routeId,
    provider: attempt.decision.provider,
    model: attempt.decision.model,
    inputTokens: attempt.inputTokens,
    outputTokens: attempt.outputTokens,
    cost: attempt.cost,
    baselineCost: attempt.cost,
    savings: 0,
    latencyMs: 0,
    fallback: true,
    fallbackFromModel: attempt.decision.fallbackFrom || null,
    statusCode: 200,
    errorMessage: attempt.error || `Failed attempt: ${attempt.qualityPassed ? "quality" : "error"}`,
    requestBody: unified,
    responseBody: { qualityScore: attempt.qualityPassed ? 1 : 0 },
    createdAt: new Date(),
  });
}

export async function getFallbackStats(routeId: number): Promise<{
  totalAttempts: number;
  totalFallbackCost: number;
  avgCostPerAttempt: number;
}> {
  const rows = await db.select().from(requestLogs)
    .where(sql`${requestLogs.routeId} = ${routeId} and ${requestLogs.fallback} = true and ${requestLogs.savings} = 0`);

  const totalAttempts = rows.length;
  const totalFallbackCost = rows.reduce((sum, r) => sum + Number(r.cost), 0);
  return {
    totalAttempts,
    totalFallbackCost,
    avgCostPerAttempt: totalAttempts > 0 ? totalFallbackCost / totalAttempts : 0,
  };
}
