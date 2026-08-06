import type { RoutingDecision } from "./router";

// Baseline model used to calculate how much the client would have paid
// without RouterOne (always GPT-4o full price).
const BASELINE_MODEL = "gpt-4o";
const BASELINE_COST_PER_1K_INPUT = 5.0;
const BASELINE_COST_PER_1K_OUTPUT = 15.0;

/**
 * Calculates the actual cost of a request and compares it against the
 * GPT-4o baseline to determine how much the user saved.
 *
 * Costs are in USD per 1,000 tokens.
 */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  decision: RoutingDecision
): { cost: number; baselineCost: number; savings: number } {
  const cost =
    (inputTokens / 1000) * decision.costPer1kInput +
    (outputTokens / 1000) * decision.costPer1kOutput;

  const baselineCost =
    (inputTokens / 1000) * BASELINE_COST_PER_1K_INPUT +
    (outputTokens / 1000) * BASELINE_COST_PER_1K_OUTPUT;

  const savings = Math.max(0, baselineCost - cost);

  return { cost, baselineCost, savings };
}
