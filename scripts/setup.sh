#!/usr/bin/env bash
# =============================================================================
# RouterOne — First-time setup script (Linux / macOS)
#
# Run this ONCE after cloning the repo.
# It checks your tools, creates .env, starts the database, and seeds the data.
#
# Usage:
#   chmod +x scripts/setup.sh
#   ./scripts/setup.sh
# =============================================================================

set -e  # Stop immediately if any command fails

# ── Colors (makes the output easier to read) ──────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

info()    { echo -e "${CYAN}[INFO]${RESET}  $1"; }
success() { echo -e "${GREEN}[OK]${RESET}    $1"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $1"; }
error()   { echo -e "${RED}[ERROR]${RESET} $1" >&2; exit 1; }
step()    { echo -e "\n${BOLD}── $1 ──────────────────────────────────────${RESET}"; }

# Move to the project root no matter where the script is called from
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

echo ""
echo "  ██████╗  ██████╗ ██╗   ██╗████████╗███████╗██████╗  ██████╗ ███╗   ██╗███████╗"
echo "  ██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝██╔════╝██╔══██╗██╔═══██╗████╗  ██║██╔════╝"
echo "  ██████╔╝██║   ██║██║   ██║   ██║   █████╗  ██████╔╝██║   ██║██╔██╗ ██║█████╗  "
echo "  ██╔══██╗██║   ██║██║   ██║   ██║   ██╔══╝  ██╔══██╗██║   ██║██║╚██╗██║██╔══╝  "
echo "  ██║  ██║╚██████╔╝╚██████╔╝   ██║   ███████╗██║  ██║╚██████╔╝██║ ╚████║███████╗"
echo "  ╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝"
echo ""
echo "  First-time setup — this will take about 2 minutes."
echo ""

# =============================================================================
# STEP 1 — Check required tools
# =============================================================================
step "Step 1 / 5 — Checking required tools"

check_tool() {
  if command -v "$1" &>/dev/null; then
    success "$1 is installed ($(command -v "$1"))"
  else
    error "$1 is not installed. See scripts/README.md for install links."
  fi
}

check_tool docker
check_tool bun
check_tool node
check_tool npm

# Check Docker is actually running (not just installed)
if ! docker info &>/dev/null; then
  error "Docker is installed but not running. Please start Docker Desktop and try again."
fi
success "Docker daemon is running"

# =============================================================================
# STEP 2 — Create .env file
# =============================================================================
step "Step 2 / 5 — Setting up environment variables"

if [ -f ".env" ]; then
  warn ".env already exists — skipping. Edit it manually to change API keys."
else
  # Copy the example file and adjust the URLs to point to localhost
  # (the .env.example uses Docker service names like "postgres" and "redis")
  sed \
    -e 's|postgresql://routerone:routerone@postgres:|postgresql://routerone:routerone@localhost:|g' \
    -e 's|redis://redis:|redis://localhost:|g' \
    .env.example > .env
  success "Created .env from .env.example"
  echo ""
  warn "ACTION REQUIRED: Open .env and fill in your LLM provider API keys."
  warn "At minimum, add one of: OPENAI_API_KEY, GROQ_API_KEY, or ANTHROPIC_API_KEY."
  warn "You can skip this for now and fill them in before making real LLM calls."
  echo ""
fi

# =============================================================================
# STEP 3 — Install Node/Bun dependencies
# =============================================================================
step "Step 3 / 5 — Installing dependencies"

info "Installing workspace packages with Bun..."
bun install
success "Dependencies installed"

info "Installing dashboard dependencies with npm..."
cd apps/dashboard && npm install && cd "$ROOT"
success "Dashboard dependencies installed"

info "Installing landing dependencies with npm..."
cd apps/landing && npm install && cd "$ROOT"
success "Landing dependencies installed"

# =============================================================================
# STEP 4 — Start infrastructure (PostgreSQL + Redis)
# =============================================================================
step "Step 4 / 5 — Starting PostgreSQL and Redis"

info "Starting postgres and redis containers..."
docker compose up -d postgres redis

info "Waiting for PostgreSQL to be ready..."
until docker compose exec postgres pg_isready -U routerone -d routerone &>/dev/null; do
  printf "."
  sleep 1
done
echo ""
success "PostgreSQL is ready"

info "Waiting for Redis to be ready..."
until docker compose exec redis redis-cli ping 2>/dev/null | grep -q "PONG"; do
  printf "."
  sleep 1
done
echo ""
success "Redis is ready"

# =============================================================================
# STEP 5 — Run migrations and seed the database
# =============================================================================
step "Step 5 / 5 — Database migrations and seed data"

info "Running Drizzle migrations (creates all tables)..."
cd packages/shared
DATABASE_URL="postgresql://routerone:routerone@localhost:5432/routerone" \
  bunx drizzle-kit migrate
cd "$ROOT"
success "Migrations applied"

info "Seeding with sample routes and golden dataset..."
cd packages/shared
DATABASE_URL="postgresql://routerone:routerone@localhost:5432/routerone" \
  bun seed.ts
cd "$ROOT"
success "Seed complete"

# =============================================================================
# DONE
# =============================================================================
echo ""
echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${GREEN}${BOLD}  Setup complete!${RESET}"
echo -e "${GREEN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo "  Next steps:"
echo ""
echo "  1. Fill in your API keys in .env (if you haven't already)"
echo ""
echo "  2. Start the dev servers:"
echo "     ${CYAN}./scripts/dev.sh${RESET}"
echo ""
echo "  3. Open the apps:"
echo "     Landing page  →  http://localhost:3003"
echo "     Dashboard     →  http://localhost:3001"
echo "     Proxy (API)   →  http://localhost:3000"
echo ""
echo "  4. To run tests:"
echo "     ${CYAN}bun test apps/proxy/tests${RESET}"
echo ""
