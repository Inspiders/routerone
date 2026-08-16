# scripts/

This folder contains helper scripts that make running RouterOne locally as simple as possible.
No expertise required — just follow the steps in order.

---

## Which script should I run?

| Your OS | First time setup | Start dev servers |
|---------|-----------------|-------------------|
| **Windows** | `setup.ps1` | `dev.ps1` |
| **Linux / macOS** | `setup.sh` | `dev.sh` |

---

## What does "setup" do?

1. Checks that the required tools are installed (Docker, Bun, Node.js)
2. Creates your `.env` file from the example (so you can fill in your API keys)
3. Starts PostgreSQL and Redis via Docker
4. Runs the database migrations (creates all tables)
5. Seeds the database with 3 sample routes and a 20-case golden dataset
6. Prints what to do next

## What does "dev" do?

Starts all three applications in parallel in the same terminal window:

- **Proxy** → http://localhost:3000 (Hono + Bun)
- **Dashboard** → http://localhost:3001 (Next.js)
- **Landing** → http://localhost:3003 (Next.js)

---

## Prerequisites

You need these installed before running any script:

| Tool | Why | Install |
|------|-----|---------|
| Docker Desktop | Runs PostgreSQL and Redis | https://www.docker.com/products/docker-desktop |
| Bun | Runs the proxy and handles packages | https://bun.sh |
| Node.js 20+ | Runs the Next.js apps | https://nodejs.org |

---

## API Keys

RouterOne routes requests to real LLM providers.
You need at least one of these to make end-to-end requests:

| Provider | Where to get a key | Cost |
|----------|--------------------|------|
| **Groq** | https://console.groq.com | Free tier available |
| **OpenAI** | https://platform.openai.com | Pay per use |
| **Anthropic** | https://console.anthropic.com | Pay per use |
| **DeepSeek** | https://platform.deepseek.com | Very cheap |

Fill them in your `.env` file after setup runs.

---

## Running tests

```bash
# From the project root
bun test apps/proxy/tests
```

## End-to-end test (after setup)

```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer <your-sk-r1-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "route": "support-ticket-classify",
    "messages": [{"role": "user", "content": "Server is down! URGENT!"}],
    "max_tokens": 100
  }'
```

You'll find your API key printed by the setup script after seeding.
