#!/usr/bin/env bash
# =============================================================================
# RouterOne — Dev server launcher (Linux / macOS)
#
# Starts all three apps in parallel:
#   - Proxy (Hono + Bun)  → http://localhost:3000
#   - Dashboard (Next.js) → http://localhost:3001
#   - Landing (Next.js)   → http://localhost:3003
#
# Requires: setup.sh to have been run at least once.
#
# Usage:
#   ./scripts/dev.sh
#
# Press Ctrl+C to stop all servers at once.
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

# ── Load .env so local processes pick up the right DATABASE_URL, REDIS_URL etc.
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

# Override the Docker service-name URLs with localhost equivalents
# (since we're running the apps directly, not inside Docker)
export DATABASE_URL="postgresql://routerone:routerone@localhost:5432/routerone"
export REDIS_URL="redis://localhost:6379"
export LITELLM_URL="http://localhost:4000"
export NEXT_PUBLIC_API_URL="http://localhost:3000"

echo ""
echo "  Starting RouterOne dev servers..."
echo ""
echo "  Proxy (Hono/Bun)  →  http://localhost:3000"
echo "  Dashboard (Next)  →  http://localhost:3001"
echo "  Landing (Next)    →  http://localhost:3003"
echo ""
echo "  Press Ctrl+C to stop all servers."
echo ""

# ── Make sure the database containers are running ─────────────────────────────
echo "  Ensuring PostgreSQL and Redis are running..."
docker compose up -d postgres redis 2>/dev/null || true
echo ""

# ── Cleanup handler: kill all child processes when Ctrl+C is pressed ──────────
cleanup() {
  echo ""
  echo "  Stopping all dev servers..."
  kill 0
}
trap cleanup INT TERM

# ── Start all three servers in the background ─────────────────────────────────

# Proxy
(
  cd apps/proxy
  echo "[proxy]   Starting on port 3000..."
  bun --watch src/index.ts 2>&1 | sed 's/^/[proxy]   /'
) &

# Dashboard
(
  cd apps/dashboard
  echo "[dashboard] Starting on port 3001..."
  npm run dev 2>&1 | sed 's/^/[dashboard] /'
) &

# Landing
(
  cd apps/landing
  echo "[landing]  Starting on port 3003..."
  npm run dev 2>&1 | sed 's/^/[landing]  /'
) &

# Wait for all background processes (keeps the script alive)
wait
