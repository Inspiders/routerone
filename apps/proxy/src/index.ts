import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import proxyRouter from "./routes/proxy";

const app = new Hono();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use("*", cors());
app.use("*", logger());

// ── Health check ──────────────────────────────────────────────────────────────
// Used by Docker health checks and load balancers.
app.get("/health", (c) => c.json({ status: "ok", version: "0.1.0" }));

// ── Proxy routes ──────────────────────────────────────────────────────────────
// /v1/chat/completions — OpenAI-compatible endpoint
// /v1/messages         — Anthropic-compatible endpoint
app.route("/", proxyRouter);

// ── Start server ──────────────────────────────────────────────────────────────
const port = Number(process.env.PROXY_PORT) || 3000;
const host = process.env.PROXY_HOST || "0.0.0.0";

console.log(`RouterOne proxy listening on http://${host}:${port}`);

export default {
  port,
  hostname: host,
  fetch: app.fetch,
};
