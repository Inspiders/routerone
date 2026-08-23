<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rect&color=000000&height=220&section=header&text=ROUTERONE&fontSize=65&fontColor=FFFFFF&fontAlignY=45&desc=CUT%20YOUR%20LLM%20API%20COSTS%20IN%20SECONDS%20%7C%20OPEN%20SOURCE%20%26%20SELF-HOSTED&descAlignY=68&descAlign=50&descSize=15" width="100%"/>

<br/>

<p align="center">
  <img src="https://i.ibb.co/5X8bbQPN/Gemini-Generated-Image-3ko1vx3ko1vx3ko1.jpg" alt="Routerone Banner" width="100%" />
</p>

<br/>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=16&duration=2800&pause=900&color=000000&background=FFFFFF00&center=true&vCenter=true&width=750&lines=OPEN-SOURCE+LLM+PROXY+%7C+SAVE+60%E2%80%9385%25+ON+API+COSTS;ZERO+CODE+CHANGES+%C2%B7+JUST+SWAP+YOUR+BASE_URL;SELF-HOSTED+%C2%B7+HONO+%C2%B7+BUN+%C2%B7+NEXT.JS+14+%C2%B7+REDIS;INTELLIGENT+DIFFICULTY+ROUTING+%26+SEMANTIC+CACHE)](https://github.com/Inspiders/routerone)

<br/>

![License](https://img.shields.io/badge/LICENSE-MIT-000000?style=flat-square&logo=opensourceinitiative&logoColor=white)
![Bun](https://img.shields.io/badge/RUNTIME-BUN-000000?style=flat-square&logo=bun&logoColor=white)
![Hono](https://img.shields.io/badge/FRAMEWORK-HONO-000000?style=flat-square&logo=hono&logoColor=white)
![Next.js](https://img.shields.io/badge/FRONTEND-NEXT.JS_14-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![Docker](https://img.shields.io/badge/DEPLOY-DOCKER_COMPOSE-000000?style=flat-square&logo=docker&logoColor=white)

</div>

<br/>

<!-- BOX 1: OVERVIEW -->
<table width="100%">
<tr>
<td>
<h2 align="center">🚀 OVERVIEW</h2>

**Routerone** is an open-source, self-hosted LLM gateway that automatically routes each incoming request to the cheapest model capable of answering with optimal quality. 

Drop it into your application by simply changing the `base_url` — **zero code changes required**.

```diff
 const client = new OpenAI({
-  apiKey: process.env.OPENAI_API_KEY,
+  apiKey: "sk-r1-<your-key>",
+  baseURL: "http://localhost:3000/v1",  // ← just this line
 });
```

```
[ Your Application ]  →  [ Routerone Proxy ]  →  [ LiteLLM Gateway ]  →  [ OpenAI / Anthropic / Groq / DeepSeek ]
```
</td>
</tr>
</table>

<br/>

<!-- BOX 2: KEY FEATURES -->
<table width="100%">
<tr>
<td>
<h2 align="center">💡 KEY FEATURES</h2>

```
> ⚡ Difficulty Classifier   : Analyzes prompt complexity (length, code, reasoning, math) to pick the right tier
> 🧠 Semantic Cache         : Redis + cosine similarity embeddings — repeat questions hit 0ms cost
> 🔄 Smart Quality Fallback : Validates responses automatically; falls back to higher model if quality fails
> 📊 Real-time Dashboard     : Track daily spend, cost by route, cost by model, and cumulative savings
> 🎯 Evaluation Engine     : Built-in Python/FastAPI LLM-as-judge benchmark against golden datasets
> 🔐 Multi-tenant Isolation  : Isolated semantic cache keys per account/API key namespace
```
</td>
</tr>
</table>

<br/>

<!-- BOX 3: TECH STACK -->
<table width="100%">
<tr>
<td colspan="2"><h2 align="center">🛠️ TECH STACK</h2></td>
</tr>
<tr><td valign="top" width="25%"><b>PROXY & CORE</b></td><td valign="top">
<img src="https://img.shields.io/badge/HONO-000000?style=flat-square&logo=hono&logoColor=white"/>
<img src="https://img.shields.io/badge/BUN-000000?style=flat-square&logo=bun&logoColor=white"/>
<img src="https://img.shields.io/badge/TYPESCRIPT-000000?style=flat-square&logo=typescript&logoColor=white"/>
</td></tr>
<tr><td valign="top"><b>DASHBOARD & LANDING</b></td><td valign="top">
<img src="https://img.shields.io/badge/NEXT.JS_14-000000?style=flat-square&logo=nextdotjs&logoColor=white"/>
<img src="https://img.shields.io/badge/TAILWIND_CSS-000000?style=flat-square&logo=tailwindcss&logoColor=white"/>
<img src="https://img.shields.io/badge/RECHARTS-000000?style=flat-square&logo=react&logoColor=white"/>
</td></tr>
<tr><td valign="top"><b>EVALUATION ENGINE</b></td><td valign="top">
<img src="https://img.shields.io/badge/PYTHON_3.11-000000?style=flat-square&logo=python&logoColor=white"/>
<img src="https://img.shields.io/badge/FASTAPI-000000?style=flat-square&logo=fastapi&logoColor=white"/>
<img src="https://img.shields.io/badge/LITELLM-000000?style=flat-square&logo=pypi&logoColor=white"/>
</td></tr>
<tr><td valign="top"><b>DATABASE & CACHE</b></td><td valign="top">
<img src="https://img.shields.io/badge/POSTGRESQL_16-000000?style=flat-square&logo=postgresql&logoColor=white"/>
<img src="https://img.shields.io/badge/DRIZZLE_ORM-000000?style=flat-square&logo=drizzle&logoColor=white"/>
<img src="https://img.shields.io/badge/REDIS_7-000000?style=flat-square&logo=redis&logoColor=white"/>
</td></tr>
<tr><td valign="top"><b>DEVOPS & DEPLOY</b></td><td valign="top">
<img src="https://img.shields.io/badge/DOCKER-000000?style=flat-square&logo=docker&logoColor=white"/>
<img src="https://img.shields.io/badge/VERCEL-000000?style=flat-square&logo=vercel&logoColor=white"/>
</td></tr>
</table>

<br/>

<!-- BOX: DASHBOARD & BENCHMARKS -->
<h2 align="center">📊 DASHBOARD & BENCHMARKS</h2>

<p align="center">
  <a href="https://ibb.co/wZJxnPKL"><img src="https://i.ibb.co/wZJxnPKL/Bench1.png" alt="Routerone Dashboard Top" width="100%" /></a>
</p>
<p align="center">
  <a href="https://ibb.co/Q7SSpPFq"><img src="https://i.ibb.co/Q7SSpPFq/Bench2.png" alt="Routerone Dashboard Bottom" width="100%" /></a>
</p>

<p align="center">
  <i>Real-time performance analytics, cost optimization benchmarks, and model latency metrics captured live from the Routerone Dashboard.</i>
</p>

<br/>

<!-- BOX 4: QUICK START -->
<table width="100%">
<tr>
<td>
<h2 align="center">🏁 QUICK START</h2>

### Prerequisites

- **[Docker Desktop](https://www.docker.com/products/docker-desktop)** — for PostgreSQL and Redis
- **[Bun](https://bun.sh)** — for running the proxy and workspace scripts
- **[Node.js 20+](https://nodejs.org)** — for Next.js applications

### 1. Clone & Run Automated Setup

**Windows (PowerShell):**
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

### 2. Configure Environment Keys

Open `.env` and add your LLM provider API keys:
```env
OPENAI_API_KEY=sk-...
GROQ_API_KEY=gsk-...        # Free tier available at groq.com
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Launch Dev Servers

**Windows:**
```powershell
.\scripts\dev.ps1
```

**Linux / macOS:**
```bash
./scripts/dev.sh
```

| Service | Local URL | Description |
| :--- | :--- | :--- |
| **Landing Page** | `http://localhost:3003` | Brutalist product landing page |
| **Dashboard** | `http://localhost:3001` | Real-time cost & savings analytics |
| **Proxy API** | `http://localhost:3000` | OpenAI & Anthropic compatible gateway |
</td>
</tr>
</table>

<br/>

<!-- BOX 5: DEPLOYMENT -->
<table width="100%">
<tr>
<td>
<h2 align="center">📦 DEPLOYMENT</h2>

### Docker Compose (Full Stack)

To run all services (PostgreSQL, Redis, LiteLLM, Proxy, Dashboard, Evaluation, Landing) in containers:

```bash
cp .env.example .env
# Edit .env with your API keys
docker compose up --build
```

### Deploy Landing Page to Vercel

The landing page is pre-configured for instant Vercel deployment:

1. Import your repository in **[Vercel](https://vercel.com)**.
2. Set **Root Directory** to `apps/landing`.
3. Deploy!

Or deploy via Vercel CLI:
```bash
cd apps/landing
vercel
```
</td>
</tr>
</table>

<br/>

<!-- BOX 6: PROJECT STRUCTURE -->
<table width="100%">
<tr>
<td>
<h2 align="center">📂 PROJECT STRUCTURE</h2>

```
routerone/
├── apps/
│   ├── proxy/        # Hono + Bun gateway (port 3000)
│   ├── dashboard/    # Next.js cost & metrics UI (port 3001)
│   ├── evaluation/   # Python FastAPI LLM-as-judge service (port 3002)
│   └── landing/      # Next.js brutalist landing page (port 3003)
├── packages/
│   └── shared/       # Drizzle database schemas, types, DB client
├── scripts/
│   ├── setup.ps1     # Windows automated setup
│   ├── setup.sh      # Linux/macOS automated setup
│   ├── dev.ps1       # Windows dev launcher
│   └── dev.sh        # Linux/macOS dev launcher
├── docker-compose.yml
└── vercel.json
```
</td>
</tr>
</table>

<br/>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rect&color=000000&height=100&section=footer&text=ROUTERONE%20%7C%20GITHUB.COM/INSPIDERS/ROUTERONE&fontSize=18&fontColor=FFFFFF&fontAlignY=60" width="100%"/>

</div>
