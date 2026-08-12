import { NextResponse } from "next/server";
import { db, requestLogs, routes } from "@routerone/shared";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const logs = await db.select()
    .from(requestLogs)
    .leftJoin(routes, eq(requestLogs.routeId, routes.id))
    .orderBy(desc(requestLogs.createdAt));

  const headers = [
    "id", "route", "provider", "model", "input_tokens", "output_tokens",
    "cost", "baseline_cost", "savings", "latency_ms", "fallback",
    "fallback_from", "status_code", "created_at"
  ];

  const rows = logs.map((row) => [
    row.request_logs.id,
    row.routes?.name || "",
    row.request_logs.provider,
    row.request_logs.model,
    row.request_logs.inputTokens,
    row.request_logs.outputTokens,
    row.request_logs.cost,
    row.request_logs.baselineCost,
    row.request_logs.savings,
    row.request_logs.latencyMs,
    row.request_logs.fallback,
    row.request_logs.fallbackFromModel || "",
    row.request_logs.statusCode,
    row.request_logs.createdAt,
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="routerone-report-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
