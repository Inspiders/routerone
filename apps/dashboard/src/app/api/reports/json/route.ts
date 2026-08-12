import { NextResponse } from "next/server";
import { db, requestLogs, routes } from "@routerone/shared";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const logs = await db.select()
    .from(requestLogs)
    .leftJoin(routes, eq(requestLogs.routeId, routes.id))
    .orderBy(desc(requestLogs.createdAt));

  const data = logs.map((row) => ({
    id: row.request_logs.id,
    route: row.routes?.name || null,
    provider: row.request_logs.provider,
    model: row.request_logs.model,
    inputTokens: row.request_logs.inputTokens,
    outputTokens: row.request_logs.outputTokens,
    cost: Number(row.request_logs.cost),
    baselineCost: Number(row.request_logs.baselineCost),
    savings: Number(row.request_logs.savings),
    latencyMs: row.request_logs.latencyMs,
    fallback: row.request_logs.fallback,
    fallbackFromModel: row.request_logs.fallbackFromModel,
    statusCode: row.request_logs.statusCode,
    createdAt: row.request_logs.createdAt,
  }));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    count: data.length,
    data,
  });
}
