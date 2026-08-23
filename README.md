# Routerone

<p align="center">
  <img src="https://i.ibb.co/5X8bbQPN/Gemini-Generated-Image-3ko1vx3ko1vx3ko1.jpg" alt="Routerone Banner" width="100%" />
</p>

> Open-source, self-hosted LLM proxy that automatically routes each request
> to the cheapest model capable of answering with sufficient quality.
> Change only the `base_url`. Zero code changes in your app.

```diff
 const client = new OpenAI({
-  apiKey: process.env.OPENAI_API_KEY,
+  apiKey: "sk-r1-<your-key>",
+  baseURL: "http://localhost:3000/v1",  // ← just this
 });
```

---

## What it does

Routerone sits between your app and the LLM providers:

```
Your App  →  Routerone Proxy  →  LiteLLM  →  OpenAI / Anthropic / Groq / DeepSeek
```

For every request it:
1. **Classifies difficulty** (easy / medium / hard) using heuristics
2. **Checks the semantic cache** — similar past questions return instantly at zero cost
3. **Picks the cheapest model** capable of handling the difficulty level
4. **Validates the response** quality — if it fails, retries with the next model and logs the chargeback
5. **Logs everything** to PostgreSQL for the dashboard

---

## Stack

| Layer | Tech |
|-------|------|
| Proxy | Hono + Bun (TypeScript) |
| Dashboard | Next.js 14 + Recharts |
| Landing | Next.js 14 + Tailwind (brutalist) |
| Evaluation | Python + FastAPI |
| Multi-provider | LiteLLM |
| Database | PostgreSQL + Drizzle ORM |
| Cache | Redis (semantic similarity) |
| Deploy | Docker Compose / Vercel (Landing) |

---

## Quick start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) — for PostgreSQL and Redis
- [Bun](https://bun.sh) — for the proxy
- [Node.js 20+](https://nodejs.org) — for the Next.js apps

### 1. Clone and run setup

**Windows:**
```powershell
git clone https://github.com/Inspiders/routerone.git
cd routerone
.\scripts\setup.ps1
```

**Linux / macOS:**
```bash
git clone https://github.com/Inspiders/routerone.git
cd routerone
chmod +x scripts/setup.sh scripts/dev.sh
./scripts/setup.sh
```

The setup script will:
- Check all tools are installed
- Create `.env` from `.env.example`
- Install all dependencies
- Start PostgreSQL and Redis via Docker
- Run database migrations
- Seed 3 sample routes + a 20-case golden dataset

### 2. Add your API keys

Open `.env` and fill in at least one provider key:
```
OPENAI_API_KEY=sk-...        # or
GROQ_API_KEY=gsk-...         # free tier available at groq.com
ANTHROPIC_API_KEY=sk-ant-... # or
```

### 3. Start the dev servers

**Windows:**
```powershell
.\scripts\dev.ps1
```

**Linux / macOS:**
```bash
./scripts/dev.sh
```

| App | URL |
|-----|-----|
| Landing page | http://localhost:3003 |
| Dashboard | http://localhost:3001 |
| Proxy API | http://localhost:3000 |

---

## Deploy Landing to Vercel

To deploy only the landing page to Vercel:

1. Import the repository in Vercel.
2. Set **Root Directory** to `apps/landing`.
3. Vercel will automatically detect Next.js and deploy the landing page.

Or use Vercel CLI:
```bash
cd apps/landing
vercel
```

---

## Run tests

```bash
bun test apps/proxy/tests
```

---

## End-to-end test

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer sk-r1-<your-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "route": "support-ticket-classify",
    "messages": [{"role": "user", "content": "Server is down! URGENT!"}],
    "max_tokens": 100
  }'
```

---

## Full Docker Compose (all services)

If you want to run everything in containers:

```bash
cp .env.example .env
# fill in your API keys in .env
docker compose up --build
```

---

## Project structure

```
routerone/
├── apps/
│   ├── proxy/        # Hono + Bun — the main gateway (port 3000)
│   ├── dashboard/    # Next.js — cost/savings analytics (port 3001)
│   ├── evaluation/   # Python FastAPI — LLM-as-judge (port 3002)
│   └── landing/      # Next.js — marketing page (port 3003)
├── packages/
│   └── shared/       # Drizzle schema, types, DB client
├── scripts/
│   ├── setup.ps1     # Windows first-time setup
│   ├── setup.sh      # Linux/macOS first-time setup
│   ├── dev.ps1       # Windows dev launcher
│   └── dev.sh        # Linux/macOS dev launcher
└── docker-compose.yml
```

---

## License

MIT
