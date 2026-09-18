import { getSql } from "./db";

/**
 * Server-side idempotency. Client sends an `Idempotency-Key` header
 * (crypto.randomUUID() generated once per user action, reused on retry).
 * First call inserts and returns { replay: null }; retries return the
 * original stored payload so the client can render the same result.
 */
export async function beginIdempotent<T>(key: string | null, kind: string, payload: unknown): Promise<{ replay: T | null }> {
  const sql = getSql();
  if (!sql || !key) return { replay: null };
  const rows = await sql`
    INSERT INTO idempotent_actions (key, kind, payload, created_at)
    VALUES (${key}, ${kind}, ${JSON.stringify(payload ?? {})}, ${Date.now()})
    ON CONFLICT (key) DO NOTHING
    RETURNING key
  `;
  if (rows.length > 0) return { replay: null };
  const prev = await sql`SELECT payload FROM idempotent_actions WHERE key = ${key}`;
  return { replay: (prev[0]?.payload as T) ?? null };
}
