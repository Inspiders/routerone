import { db, requestLogs } from "@routerone/shared";

interface LogRequestParams {
  apiKeyId: number | null;
  routeId: number | null;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  baselineCost: number;
  savings: number;
  latencyMs: number;
  fallback?: boolean;
  fallbackFromModel?: string | null;
  statusCode: number;
  errorMessage?: string;
  requestBody?: unknown;
  responseBody?: unknown;
}

/**
 * Persists a request log entry to PostgreSQL.
 * Every request — including cache hits, fallbacks, and errors — is logged.
 * This is what powers the dashboard charts and the cost/savings reports.
 *
 * We fire-and-forget (no await at call site) to avoid adding latency to the response.
 */
export async function logRequest(params: LogRequestParams): Promise<void> {
  await db.insert(requestLogs).values({
    apiKeyId: params.apiKeyId,
    routeId: params.routeId,
    provider: params.provider,
    model: params.model,
    inputTokens: params.inputTokens,
    outputTokens: params.outputTokens,
    cost: params.cost.toFixed(6),
    baselineCost: params.baselineCost.toFixed(6),
    savings: params.savings.toFixed(6),
    latencyMs: params.latencyMs,
    fallback: params.fallback ?? false,
    fallbackFromModel: params.fallbackFromModel ?? null,
    statusCode: params.statusCode,
    errorMessage: params.errorMessage ?? null,
    requestBody: params.requestBody ?? null,
    responseBody: params.responseBody ?? null,
    createdAt: new Date(),
  });
}
