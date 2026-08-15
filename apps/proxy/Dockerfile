# ── Stage 1: dependencies ─────────────────────────────────────────────────────
# Install only production deps using Bun's lockfile for reproducible installs.
FROM oven/bun:1.1-alpine AS deps

WORKDIR /app

# Copy manifests first — Docker layer cache means we only re-install
# when package.json or bun.lockb actually changes.
COPY package.json bun.lockb* ./
COPY apps/proxy/package.json ./apps/proxy/
COPY packages/shared/package.json ./packages/shared/

RUN bun install --frozen-lockfile

# ── Stage 2: builder ──────────────────────────────────────────────────────────
FROM oven/bun:1.1-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/proxy/node_modules ./apps/proxy/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules

COPY packages/shared ./packages/shared
COPY apps/proxy ./apps/proxy

RUN cd apps/proxy && bun build src/index.ts --outdir dist --target bun

# ── Stage 3: runner ───────────────────────────────────────────────────────────
# Minimal image — only the compiled bundle + Bun runtime.
FROM oven/bun:1.1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/proxy/dist ./dist
COPY --from=builder /app/apps/proxy/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared

EXPOSE 3000

CMD ["bun", "dist/index.js"]
