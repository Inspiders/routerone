# Architecture Decisions — RouterOne

## 1. LiteLLM as separate Python service
**Decision:** Use LiteLLM as standalone HTTP service (Python/FastAPI) instead of direct integration in TypeScript proxy.
**Rationale:** LiteLLM has tested adapters for 100+ providers. Rewriting this in TypeScript would be weeks of work with guaranteed bugs. The HTTP boundary allows replacing LiteLLM in the future without touching the proxy.

## 2. Hono + Bun for the proxy
**Decision:** Hono on Bun instead of Express/Node.
**Rationale:** Minimal overhead, native SSE streaming, and much faster cold starts. For a high-throughput proxy, every ms counts.

## 3. Drizzle ORM instead of Prisma
**Decision:** Drizzle for PostgreSQL.
**Rationale:** Type-safe query builder without heavy codegen, better runtime performance, and smaller memory footprint. Schema is pure TypeScript code.

## 4. Static routing in Phase 1
**Decision:** Fixed route→models table (JSONB in DB) instead of dynamic classifier.
**Rationale:** Difficulty classifier is Phase 2. In Phase 1 we need to prove the proxy works end-to-end with a real provider. Static routing is immediately testable.

## 5. Next.js App Router for dashboard
**Decision:** App Router instead of Pages Router.
**Rationale:** Server Components reduce JS sent to client. For a data dashboard, this is ideal. shadcn/ui is native on App Router.

## 6. Redis for cache and queue
**Decision:** Redis instead of RabbitMQ/SQS for evaluation queue.
**Rationale:** Evaluation volume in Phase 1 is low. Redis with simple lists is sufficient and avoids another service. In Phase 3 we evaluate if Kafka/RabbitMQ is needed.

## 7. API keys with bcrypt hash + visible prefix
**Decision:** bcrypt for hash, `sk-r1-` visible prefix.
**Rationale:** bcrypt is standard and secure. Prefix allows quick identification without DB lookup. Full key is never stored in plaintext.

## 8. OpenTelemetry with stdout exporter in MVP
**Decision:** OTel configured but exporting to stdout/logs in MVP.
**Rationale:** No Jaeger/Tempo dependency in MVP. stdout is sufficient to validate instrumentation is correct. Change exporter in production.

## 9. MIT License
**Decision:** MIT instead of Apache-2.0.
**Rationale:** MIT is more permissive and standard for open-source infrastructure projects. Zero adoption barriers.

## 10. Docker Compose for dev; multi-stage Dockerfile for prod
**Decision:** Compose for local dev; each app has multi-stage Dockerfile.
**Rationale:** Clear separation between dev (volume mounts, hot reload) and prod (optimized images, no devDependencies).

## 11. Landing page as separate Next.js app
**Decision:** Separate `apps/landing` app instead of route within dashboard.
**Rationale:** Separation of concerns. Dashboard is an internal tool (requires DB). Landing is static and can be deployed on CDN (Vercel, Netlify) without dependencies. Also allows different branding/SEO.

## 12. Pure brutalist design
**Decision:** Zero border-radius, zero shadows, zero gradients, zero decorative colors. Only black (#000) and white (#fff).
**Rationale:** Brief explicitly specified brutalism. Extreme contrast IS the visual identity. No "dark mode with soft grays". Typography as main graphic element.

## 13. No pricing section
**Decision:** Completely omit any reference to plans, prices or savings calculator.
**Rationale:** Project is open-source and self-hosted. No SaaS business model. The value pitch is the "self-hosted, always" section — there is no billing anywhere.

## 14. Single CTA pointing to GitHub/docs
**Decision:** Only "View on GitHub" + "Get Started in 5 min". No "Contact us", "Talk to sales" or "Demo".
**Rationale:** Open-source project. Goal is adoption via GitHub, not commercial leads.
