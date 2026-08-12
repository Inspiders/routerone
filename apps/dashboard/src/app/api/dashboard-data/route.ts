import { NextResponse } from "next/server";

// ─── Mock data ────────────────────────────────────────────────────────────────
// Used when the database / Redis is not available (local dev without Docker).
// Remove this and uncomment the real DB code below once you have Postgres running.

function generateMockDaily() {
  const days = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const baseline = parseFloat((Math.random() * 2 + 1).toFixed(4));
    const cost = parseFloat((baseline * (0.15 + Math.random() * 0.25)).toFixed(4));
    days.push({
      date: d.toISOString().split("T")[0],
      cost,
      baseline,
      savings: parseFloat((baseline - cost).toFixed(4)),
      requests: Math.floor(Math.random() * 300 + 80),
    });
  }
  return days;
}

const MOCK_DATA = {
  daily: generateMockDaily(),
  byRoute: [
    { name: "support-ticket-classify", cost: 0.0312, baseline: 0.2180, savings: 0.1868, requests: 847 },
    { name: "code-review",             cost: 0.1240, baseline: 0.5600, savings: 0.4360, requests: 312 },
    { name: "summarize",               cost: 0.0089, baseline: 0.0980, savings: 0.0891, requests: 1204 },
  ],
  byModel: [
    { model: "llama3-8b-8192",  cost: 0.0180, requests: 1102, avgLatency: 420  },
    { model: "gpt-3.5-turbo",   cost: 0.0890, requests: 743,  avgLatency: 680  },
    { model: "llama3-70b-8192", cost: 0.0640, requests: 312,  avgLatency: 890  },
    { model: "gpt-4o",          cost: 0.1931, requests: 206,  avgLatency: 1240 },
  ],
  fallbackRate: 3.2,
  totalRequests: 2363,
  totalCost:     0.3641,
  totalBaseline: 1.8920,
  totalSavings:  1.5279,
  latencyP50: 510,
  latencyP95: 1180,
  cacheStats: [
    { name: "support-ticket-classify", hits: 203, misses: 644, rate: "24.0" },
    { name: "code-review",             hits: 48,  misses: 264, rate: "15.4" },
    { name: "summarize",               hits: 387, misses: 817, rate: "32.1" },
  ],
};

// ─── Real DB route (uncomment when Docker / Postgres is running) ──────────────
// import { db, requestLogs, routes } from "@routerone/shared";
// import { sql, eq } from "drizzle-orm";
// import Redis from "ioredis";
// const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
//
// export async function GET() {
//   ... (real queries)
// }

export async function GET() {
  // Try to hit the real DB. If it fails, return mock data so you can
  // see the dashboard UI without running Docker.
  try {
    const { db, requestLogs, routes } = await import("@routerone/shared");
    const { sql, eq } = await import("drizzle-orm");
    const Redis = (await import("ioredis")).default;
    const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      lazyConnect: true,
      connectTimeout: 2000,
      maxRetriesPerRequest: 0,
    });

    const daily = await db.select({
      date: sql<string>`DATE(${requestLogs.createdAt})`,
      cost: sql<number>`SUM(${requestLogs.cost})`,
      baseline: sql<number>`SUM(${requestLogs.baselineCost})`,
      savings: sql<number>`SUM(${requestLogs.savings})`,
      requests: sql<number>`COUNT(*)`,
    }).from(requestLogs)
      .where(sql`${requestLogs.createdAt} > NOW() - INTERVAL '30 days'`)
      .groupBy(sql`DATE(${requestLogs.createdAt})`)
      .orderBy(sql`DATE(${requestLogs.createdAt})`);

    const byRoute = await db.select({
      name: routes.name,
      cost: sql<number>`SUM(${requestLogs.cost})`,
      baseline: sql<number>`SUM(${requestLogs.baselineCost})`,
      savings: sql<number>`SUM(${requestLogs.savings})`,
      requests: sql<number>`COUNT(*)`,
    }).from(requestLogs)
      .innerJoin(routes, eq(requestLogs.routeId, routes.id))
      .groupBy(routes.name);

    const byModel = await db.select({
      model: requestLogs.model,
      cost: sql<number>`SUM(${requestLogs.cost})`,
      requests: sql<number>`COUNT(*)`,
      avgLatency: sql<number>`AVG(${requestLogs.latencyMs})`,
    }).from(requestLogs).groupBy(requestLogs.model);

    const fallbackData = await db.select({
      total: sql<number>`COUNT(*)`,
      fallbacks: sql<number>`SUM(CASE WHEN ${requestLogs.fallback} = true THEN 1 ELSE 0 END)`,
    }).from(requestLogs);

    const totals = await db.select({
      totalCost: sql<number>`SUM(${requestLogs.cost})`,
      totalBaseline: sql<number>`SUM(${requestLogs.baselineCost})`,
      totalSavings: sql<number>`SUM(${requestLogs.savings})`,
      totalRequests: sql<number>`COUNT(*)`,
    }).from(requestLogs);

    const latencies = await db.select({ latency: requestLogs.latencyMs })
      .from(requestLogs)
      .where(sql`${requestLogs.latencyMs} > 0`)
      .orderBy(requestLogs.latencyMs);

    const fb = fallbackData[0];
    const t  = totals[0];
    const n  = latencies.length;
    const fallbackRate = fb.total > 0 ? (Number(fb.fallbacks) / Number(fb.total)) * 100 : 0;
    const p50 = n > 0 ? latencies[Math.floor(n * 0.50)]?.latency || 0 : 0;
    const p95 = n > 0 ? latencies[Math.floor(n * 0.95)]?.latency || 0 : 0;

    const allRoutes = await db.select().from(routes);
    const cacheStats = await Promise.all(allRoutes.map(async (r) => {
      let hits = 0, misses = 0;
      try {
        hits   = parseInt(await redis.get(`stats:${r.name}:cache_hits`)   || "0");
        misses = parseInt(await redis.get(`stats:${r.name}:cache_misses`) || "0");
      } catch { /* Redis not available */ }
      const total = hits + misses;
      return { name: r.name, hits, misses, rate: total > 0 ? (hits / total * 100).toFixed(1) : "0.0" };
    }));

    redis.disconnect();

    return NextResponse.json({
      daily:    daily.map(d => ({ ...d, cost: Number(d.cost), baseline: Number(d.baseline), savings: Number(d.savings) })),
      byRoute:  byRoute.map(r => ({ ...r, cost: Number(r.cost), baseline: Number(r.baseline), savings: Number(r.savings) })),
      byModel:  byModel.map(m => ({ ...m, cost: Number(m.cost), avgLatency: Math.round(Number(m.avgLatency)) })),
      fallbackRate,
      totalRequests: Number(t.totalRequests),
      totalCost:     Number(t.totalCost),
      totalBaseline: Number(t.totalBaseline),
      totalSavings:  Number(t.totalSavings),
      latencyP50: p50,
      latencyP95: p95,
      cacheStats,
    });
  } catch {
    // Database not available — return realistic mock data so the UI is testable
    console.warn("[dashboard-data] DB/Redis not available — serving mock data");
    return NextResponse.json({ ...MOCK_DATA, _mock: true });
  }
}
