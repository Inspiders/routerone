# =============================================================================
# RouterOne — First-time setup script (Windows PowerShell)
#
# Run this ONCE after cloning the repo.
# It checks your tools, creates .env, starts the database, and seeds the data.
#
# Usage (from the project root):
#   .\scripts\setup.ps1
#
# If you get an execution policy error, run this first:
#   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
# =============================================================================

$ErrorActionPreference = "Stop"

# Move to the project root no matter where the script is called from
$ROOT = Split-Path -Parent $PSScriptRoot
Set-Location $ROOT

# ── Helper functions ───────────────────────────────────────────────────────────
function Info    { param($msg) Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Ok      { param($msg) Write-Host "[OK]    $msg" -ForegroundColor Green }
function Warn    { param($msg) Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Fail    { param($msg) Write-Host "[ERROR] $msg" -ForegroundColor Red; exit 1 }
function Step    { param($msg) Write-Host "`n── $msg ────────────────────────────────────────" -ForegroundColor White }

Write-Host @"

  ██████╗  ██████╗ ██╗   ██╗████████╗███████╗██████╗  ██████╗ ███╗   ██╗███████╗
  ██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝██╔════╝██╔══██╗██╔═══██╗████╗  ██║██╔════╝
  ██████╔╝██║   ██║██║   ██║   ██║   █████╗  ██████╔╝██║   ██║██╔██╗ ██║█████╗
  ██╔══██╗██║   ██║██║   ██║   ██║   ██╔══╝  ██╔══██╗██║   ██║██║╚██╗██║██╔══╝
  ██║  ██║╚██████╔╝╚██████╔╝   ██║   ███████╗██║  ██║╚██████╔╝██║ ╚████║███████╗
  ╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝

  First-time setup — this will take about 2 minutes.

"@ -ForegroundColor Green

# =============================================================================
# STEP 1 — Check required tools
# =============================================================================
Step "Step 1 / 5 — Checking required tools"

function CheckTool {
    param([string]$Name, [string]$InstallUrl)
    $path = Get-Command $Name -ErrorAction SilentlyContinue
    if ($path) {
        Ok "$Name is installed → $($path.Source)"
    } else {
        Fail "$Name is not installed. Install it from: $InstallUrl"
    }
}

CheckTool "docker"  "https://www.docker.com/products/docker-desktop"
CheckTool "bun"     "https://bun.sh"
CheckTool "node"    "https://nodejs.org"
CheckTool "npm"     "https://nodejs.org"

# Check Docker is actually running (not just installed)
try {
    docker info 2>&1 | Out-Null
    Ok "Docker daemon is running"
} catch {
    Fail "Docker is installed but not running. Please start Docker Desktop and try again."
}

# =============================================================================
# STEP 2 — Create .env file
# =============================================================================
Step "Step 2 / 5 — Setting up environment variables"

if (Test-Path ".env") {
    Warn ".env already exists — skipping. Edit it manually to change API keys."
} else {
    # Copy the example and swap Docker service names (postgres, redis)
    # for localhost so local dev works without Docker Compose for the apps.
    $content = Get-Content ".env.example" -Raw
    $content = $content -replace 'postgresql://routerone:routerone@postgres:', 'postgresql://routerone:routerone@localhost:'
    $content = $content -replace 'redis://redis:', 'redis://localhost:'
    Set-Content ".env" $content -Encoding UTF8
    Ok "Created .env from .env.example"
    Write-Host ""
    Warn "ACTION REQUIRED: Open .env and fill in your LLM provider API keys."
    Warn "At minimum, add one of: OPENAI_API_KEY, GROQ_API_KEY, or ANTHROPIC_API_KEY."
    Warn "You can skip this for now and fill them in before making real LLM calls."
    Write-Host ""
}

# =============================================================================
# STEP 3 — Install dependencies
# =============================================================================
Step "Step 3 / 5 — Installing dependencies"

Info "Installing workspace packages with Bun..."
bun install
Ok "Bun workspace packages installed"

Info "Installing dashboard dependencies with npm..."
Set-Location "apps/dashboard"
npm install
Set-Location $ROOT
Ok "Dashboard dependencies installed"

Info "Installing landing dependencies with npm..."
Set-Location "apps/landing"
npm install
Set-Location $ROOT
Ok "Landing dependencies installed"

# =============================================================================
# STEP 4 — Start infrastructure (PostgreSQL + Redis)
# =============================================================================
Step "Step 4 / 5 — Starting PostgreSQL and Redis"

Info "Starting postgres and redis via Docker Compose..."
docker compose up -d postgres redis

Info "Waiting for PostgreSQL to be ready..."
$attempts = 0
do {
    Start-Sleep -Seconds 2
    $attempts++
    $result = docker compose exec postgres pg_isready -U routerone -d routerone 2>&1
    if ($attempts -gt 30) { Fail "PostgreSQL did not become ready in time." }
} while ($result -notmatch "accepting connections")
Ok "PostgreSQL is ready"

Info "Waiting for Redis to be ready..."
$attempts = 0
do {
    Start-Sleep -Seconds 1
    $attempts++
    $result = docker compose exec redis redis-cli ping 2>&1
    if ($attempts -gt 20) { Fail "Redis did not become ready in time." }
} while ($result -notmatch "PONG")
Ok "Redis is ready"

# =============================================================================
# STEP 5 — Migrations and seed
# =============================================================================
Step "Step 5 / 5 — Database migrations and seed data"

Info "Running Drizzle migrations (creates all tables)..."
Set-Location "packages/shared"
$env:DATABASE_URL = "postgresql://routerone:routerone@localhost:5432/routerone"
bunx drizzle-kit migrate
Set-Location $ROOT
Ok "Migrations applied"

Info "Seeding with sample routes and golden dataset..."
Set-Location "packages/shared"
$env:DATABASE_URL = "postgresql://routerone:routerone@localhost:5432/routerone"
bun seed.ts
Set-Location $ROOT
Ok "Seed complete"

# =============================================================================
# DONE
# =============================================================================
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "  Next steps:"
Write-Host ""
Write-Host "  1. Fill in your API keys in .env (if you haven't already)"
Write-Host ""
Write-Host "  2. Start the dev servers:" -ForegroundColor White
Write-Host "     .\scripts\dev.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "  3. Open the apps:"
Write-Host "     Landing page  ->  http://localhost:3003" -ForegroundColor Cyan
Write-Host "     Dashboard     ->  http://localhost:3001" -ForegroundColor Cyan
Write-Host "     Proxy (API)   ->  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  4. To run tests:"
Write-Host "     bun test apps/proxy/tests" -ForegroundColor Cyan
Write-Host ""
