# =============================================================================
# RouterOne — Dev server launcher (Windows PowerShell)
#
# Starts all three apps in separate terminal windows:
#   - Proxy (Hono + Bun)  → http://localhost:3000
#   - Dashboard (Next.js) → http://localhost:3001
#   - Landing (Next.js)   → http://localhost:3003
#
# Requires: setup.ps1 to have been run at least once.
#
# Usage (from the project root):
#   .\scripts\dev.ps1
#
# Each app opens in its own PowerShell window.
# Close all three windows to stop everything.
# =============================================================================

$ErrorActionPreference = "Stop"

$ROOT = Split-Path -Parent $PSScriptRoot
Set-Location $ROOT

# ── Load environment variables from .env ─────────────────────────────────────
# We override the Docker service-name URLs with localhost because the apps
# run directly on your machine, not inside a Docker container.
$env:DATABASE_URL      = "postgresql://routerone:routerone@localhost:5432/routerone"
$env:REDIS_URL         = "redis://localhost:6379"
$env:LITELLM_URL       = "http://localhost:4000"
$env:NEXT_PUBLIC_API_URL = "http://localhost:3000"

# Also load any extra vars from .env (like API keys)
if (Test-Path ".env") {
    Get-Content ".env" | Where-Object { $_ -notmatch '^#' -and $_ -match '=' } | ForEach-Object {
        $parts = $_ -split '=', 2
        [System.Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
    }
}

Write-Host ""
Write-Host "  Starting RouterOne dev servers..." -ForegroundColor Green
Write-Host ""
Write-Host "  Proxy (Hono/Bun)  →  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Dashboard (Next)  →  http://localhost:3001" -ForegroundColor Cyan
Write-Host "  Landing (Next)    →  http://localhost:3003" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Three terminal windows will open — one per server."
Write-Host "  Close them to stop the servers."
Write-Host ""

# ── Make sure database containers are running ─────────────────────────────────
Write-Host "  Ensuring PostgreSQL and Redis are running..."
docker compose up -d postgres redis 2>&1 | Out-Null
Write-Host ""

# ── Helper: open a new PowerShell window with a title and command ─────────────
function StartServer {
    param(
        [string]$Title,
        [string]$WorkDir,
        [string]$Command
    )
    $fullDir = Join-Path $ROOT $WorkDir
    $script = "Set-Location '$fullDir'; `$host.UI.RawUI.WindowTitle = '$Title'; $Command; pause"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $script
    Write-Host "  [STARTED] $Title" -ForegroundColor Green
}

# ── Open one window per app ───────────────────────────────────────────────────
StartServer `
    -Title   "RouterOne — Proxy :3000" `
    -WorkDir "apps/proxy" `
    -Command "Write-Host 'Starting proxy on http://localhost:3000' -ForegroundColor Cyan; bun --watch src/index.ts"

Start-Sleep -Milliseconds 500

StartServer `
    -Title   "RouterOne — Dashboard :3001" `
    -WorkDir "apps/dashboard" `
    -Command "Write-Host 'Starting dashboard on http://localhost:3001' -ForegroundColor Cyan; npm run dev"

Start-Sleep -Milliseconds 500

StartServer `
    -Title   "RouterOne — Landing :3003" `
    -WorkDir "apps/landing" `
    -Command "Write-Host 'Starting landing on http://localhost:3003' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "  All servers launched in separate windows." -ForegroundColor Green
Write-Host "  It may take 10-15 seconds for Next.js to compile on first run." -ForegroundColor Yellow
Write-Host ""
