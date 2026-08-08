import Redis from "ioredis";
import type { UnifiedRequest } from "@routerone/shared";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const EMBEDDING_MODEL = "text-embedding-3-small";
const LITELLM_URL = process.env.LITELLM_URL || "http://localhost:4000";
const LITELLM_KEY = process.env.LITELLM_MASTER_KEY || "";

interface CacheEntry {
  response: string;
  model: string;
  provider: string;
  cost: number;
  createdAt: number;
}

function getCacheKey(route: string, embedding: number[]): string {
  // Quantização simples: 3 casas decimais para reduzir variação
  const quantized = embedding.map(v => Math.round(v * 1000) / 1000);
  return `semantic:${route}:${quantized.slice(0, 10).join(",")}`;
}

async function getEmbedding(text: string): Promise<number[]> {
  const res = await fetch(`${LITELLM_URL}/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${LITELLM_KEY}` },
    body: JSON.stringify({ model: `openai/${EMBEDDING_MODEL}`, input: text }),
  });
  if (!res.ok) throw new Error(`Embedding failed: ${res.status}`);
  const json = await res.json();
  return json.data?.[0]?.embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function checkSemanticCache(
  req: UnifiedRequest,
  route: string,
  threshold: number
): Promise<{ hit: false } | { hit: true; entry: CacheEntry; similarity: number }> {
  const text = req.messages.map(m => m.content).join(" ").slice(0, 4000);
  const embedding = await getEmbedding(text);
  const key = getCacheKey(route, embedding);

  // Procurar entradas existentes para esta rota
  const keys = await redis.keys(`semantic:${route}:*`);
  let best: { entry: CacheEntry; similarity: number } | null = null;

  for (const k of keys) {
    const raw = await redis.get(k);
    if (!raw) continue;
    const entry: CacheEntry = JSON.parse(raw);
    const cachedEmbedding = k.split(":").slice(2).join(":").split(",").map(Number);
    if (cachedEmbedding.length !== embedding.length) continue;
    const sim = cosineSimilarity(embedding, cachedEmbedding);
    if (sim >= threshold && (!best || sim > best.similarity)) {
      best = { entry, similarity: sim };
    }
  }

  if (best) {
    return { hit: true, entry: best.entry, similarity: best.similarity };
  }

  return { hit: false };
}

export async function storeSemanticCache(
  req: UnifiedRequest,
  route: string,
  response: string,
  model: string,
  provider: string,
  cost: number,
  ttlSeconds: number = 3600
): Promise<void> {
  const text = req.messages.map(m => m.content).join(" ").slice(0, 4000);
  const embedding = await getEmbedding(text);
  const key = getCacheKey(route, embedding);
  const entry: CacheEntry = { response, model, provider, cost, createdAt: Date.now() };
  await redis.setex(key, ttlSeconds, JSON.stringify(entry));
}

export async function getCacheStats(route: string): Promise<{ hits: number; misses: number; entries: number }> {
  const keys = await redis.keys(`semantic:${route}:*`);
  const hits = parseInt(await redis.get(`stats:${route}:cache_hits`) || "0");
  const misses = parseInt(await redis.get(`stats:${route}:cache_misses`) || "0");
  return { hits, misses, entries: keys.length };
}

export async function incrementCacheHit(route: string): Promise<void> {
  await redis.incr(`stats:${route}:cache_hits`);
}

export async function incrementCacheMiss(route: string): Promise<void> {
  await redis.incr(`stats:${route}:cache_misses`);
}
