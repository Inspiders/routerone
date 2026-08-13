from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import asyncio
import json
from datetime import datetime
import httpx
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI(title="RouterOne Evaluation Engine")

DB_URL = os.environ.get("DATABASE_URL", "postgresql://routerone:routerone@localhost:5432/routerone")
LITELLM_URL = os.environ.get("LITELLM_URL", "http://localhost:4000")
LITELLM_KEY = os.environ.get("LITELLM_MASTER_KEY", "")

def get_db():
    return psycopg2.connect(DB_URL, cursor_factory=RealDictCursor)

class EvaluationRequest(BaseModel):
    golden_dataset_id: int
    model: str
    provider: str

class BatchEvaluationRequest(BaseModel):
    route_id: int
    models: List[Dict[str, str]]

async def call_llm(provider: str, model: str, messages: List[Dict[str, str]], max_tokens: int = 500) -> Dict[str, Any]:
    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.post(
            f"{LITELLM_URL}/chat/completions",
            headers={"Authorization": f"Bearer {LITELLM_KEY}", "Content-Type": "application/json"},
            json={"model": f"{provider}/{model}", "messages": messages, "max_tokens": max_tokens}
        )
        res.raise_for_status()
        return res.json()

async def judge_response(expected: str, actual: str, criteria: List[str]) -> Dict[str, Any]:
    judge_prompt = (
        "You are an exacting evaluator. Compare the EXPECTED output with the ACTUAL output.\n"
        "Score from 0.0 to 1.0 based on how well the actual matches the expected.\n\n"
        f"Criteria: {', '.join(criteria) if criteria else 'accuracy, completeness'}\n\n"
        f"EXPECTED:\n{expected}\n\n"
        f"ACTUAL:\n{actual}\n\n"
        'Respond ONLY with a JSON object: {"score": 0.0-1.0, "reason": "brief explanation"}'
    )

    try:
        res = await call_llm("openai", "gpt-3.5-turbo", [
            {"role": "user", "content": judge_prompt}
        ], max_tokens=200)
        content = res["choices"][0]["message"]["content"]
        import re
        match = re.search(r'\{[^}]+\}', content)
        if match:
            return json.loads(match.group())
    except Exception:
        pass

    expected_words = set(expected.lower().split())
    actual_words = set(actual.lower().split())
    overlap = len(expected_words & actual_words)
    score = overlap / max(len(expected_words), 1)
    return {"score": min(score, 1.0), "reason": "heuristic word overlap fallback"}

async def evaluate_model(dataset_id: int, provider: str, model: str) -> Dict[str, Any]:
    conn = get_db()
    cur = conn.cursor()

    cur.execute("SELECT * FROM golden_datasets WHERE id = %s", (dataset_id,))
    dataset = cur.fetchone()
    if not dataset:
        return {"error": "Dataset not found"}

    cases = dataset["cases"]
    results = []
    total_score = 0.0

    for case in cases:
        input_text = case["input"]
        expected = case.get("expected_output", "")
        criteria = case.get("criteria", ["accuracy"])

        try:
            llm_res = await call_llm(provider, model, [{"role": "user", "content": input_text}])
            actual = llm_res["choices"][0]["message"]["content"]

            judge = await judge_response(expected, actual, criteria)
            score = judge["score"]
            total_score += score

            results.append({
                "input": input_text[:200],
                "expected": expected[:200],
                "actual": actual[:500],
                "score": score,
                "reason": judge["reason"],
            })
        except Exception as e:
            results.append({
                "input": input_text[:200],
                "error": str(e),
                "score": 0.0,
            })

    avg_score = total_score / len(cases) if cases else 0.0

    cur.execute(
        "INSERT INTO evaluation_results (golden_dataset_id, model, provider, score, details, created_at) VALUES (%s, %s, %s, %s, %s, NOW()) RETURNING id",
        (dataset_id, model, provider, avg_score, json.dumps({"cases": results}))
    )
    result_id = cur.fetchone()["id"]
    conn.commit()
    cur.close()
    conn.close()

    return {
        "evaluation_id": result_id,
        "dataset_id": dataset_id,
        "provider": provider,
        "model": model,
        "score": avg_score,
        "cases_evaluated": len(cases),
        "results": results,
    }

@app.post("/evaluate")
async def run_evaluation(req: EvaluationRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(evaluate_model, req.golden_dataset_id, req.provider, req.model)
    return {"status": "started", "dataset_id": req.golden_dataset_id, "model": req.model, "provider": req.provider}

@app.post("/evaluate/batch")
async def run_batch_evaluation(req: BatchEvaluationRequest, background_tasks: BackgroundTasks):
    for m in req.models:
        background_tasks.add_task(evaluate_model, req.route_id, m["provider"], m["model"])
    return {"status": "started", "route_id": req.route_id, "models_count": len(req.models)}

@app.get("/results/{dataset_id}")
async def get_results(dataset_id: int):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT * FROM evaluation_results WHERE golden_dataset_id = %s ORDER BY created_at DESC", (dataset_id,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"results": rows}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.on_event("startup")
async def startup():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT 1")
    cur.close()
    conn.close()
    print("Evaluation engine connected to DB")
