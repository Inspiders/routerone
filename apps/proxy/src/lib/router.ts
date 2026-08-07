import { db, routes } from "@routerone/shared";
import { eq } from "drizzle-orm";
import type { ModelConfig, UnifiedRequest } from "@routerone/shared";
import { classifyDifficulty, modelIndexForDifficulty } from "./classifier";

export interface RoutingDecision {
  provider: string;
  model: string;
  costPer1kInput: number;
  costPer1kOutput: number;
  qualityScore: number;
  isFallback: boolean;
  fallbackFrom?: string;
  difficulty?: "easy" | "medium" | "hard";
}

export async function decideRoute(unified: UnifiedRequest): Promise<{ route: typeof routes.$inferSelect; decision: RoutingDecision }> {
  if (!unified.route) throw new Error("Missing 'route' in request body");
  const routeRows = await db.select().from(routes).where(eq(routes.name, unified.route)).limit(1);
  if (!routeRows.length) throw new Error(`Route '${unified.route}' not found`);
  const route = routeRows[0];
  const cfg = route.modelsConfig as { models: ModelConfig[] };
  if (!cfg?.models?.length) throw new Error(`Route '${unified.route}' has no models configured`);

  // Classificar dificuldade
  const classification = classifyDifficulty(unified);
  const sorted = [...cfg.models].sort((a, b) => (a.costPer1kInput + a.costPer1kOutput) - (b.costPer1kInput + b.costPer1kOutput));
  const idx = modelIndexForDifficulty(classification.difficulty, sorted.length);
  const chosen = sorted[idx];

  return {
    route,
    decision: {
      provider: chosen.provider,
      model: chosen.model,
      costPer1kInput: chosen.costPer1kInput,
      costPer1kOutput: chosen.costPer1kOutput,
      qualityScore: chosen.qualityScore,
      isFallback: false,
      difficulty: classification.difficulty,
    },
  };
}

export function pickNextModel(route: typeof routes.$inferSelect, failedModel: string): RoutingDecision | null {
  const cfg = route.modelsConfig as { models: ModelConfig[] };
  const sorted = [...cfg.models].sort((a, b) => (a.costPer1kInput + a.costPer1kOutput) - (b.costPer1kInput + b.costPer1kOutput));
  const idx = sorted.findIndex(m => m.model === failedModel);
  if (idx === -1 || idx + 1 >= sorted.length) return null;
  const next = sorted[idx + 1];
  return {
    provider: next.provider,
    model: next.model,
    costPer1kInput: next.costPer1kInput,
    costPer1kOutput: next.costPer1kOutput,
    qualityScore: next.qualityScore,
    isFallback: true,
    fallbackFrom: failedModel,
  };
}
