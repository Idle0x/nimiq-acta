import { getSql } from "./db";

/** Write an inbox notification for a user. Fire-and-forget safe. */
export async function notify(address: string, kind: string, title: string, body: string, link?: string): Promise<void> {
  const sql = getSql();
  if (!sql || !address) return;
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `n_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    await sql`
      INSERT INTO notifications (id, address, kind, title, body, link, read, created_at)
      VALUES (${id}, ${address}, ${kind}, ${title}, ${body}, ${link ?? null}, FALSE, ${Date.now()})
    `;
  } catch {
    // never let a notification break a settlement
  }
}
