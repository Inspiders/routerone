import { db, apiKeys } from "@routerone/shared";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

/**
 * Validates a raw API key (e.g. "sk-r1-abc123") against the hashed keys
 * stored in the database.
 *
 * Returns the apiKey row ID if valid, or null if the key is not found or invalid.
 * We check the prefix first to skip bcrypt for obviously wrong keys (fast path).
 */
export async function validateApiKey(rawKey: string): Promise<number | null> {
  if (!rawKey.startsWith("sk-r1-")) return null;

  // Extract the last 8 characters to narrow down which key to check
  const lastChars = rawKey.slice(-8);

  const candidates = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.lastChars, lastChars));

  for (const key of candidates) {
    if (!key.active) continue;
    const match = await bcrypt.compare(rawKey, key.hash);
    if (match) return key.id;
  }

  return null;
}
