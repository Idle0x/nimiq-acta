// DB test plumbing. Suites that need Postgres gate on hasTestDb() via
// describe.runIf — without DATABASE_URL_TEST they skip with a clear reason
// instead of failing. With it, every suite truncates all tables first.
import { neon } from "@neondatabase/serverless";
import { describe } from "vitest";

export const hasTestDb = !!process.env.DATABASE_URL_TEST;

export const dbSuite = hasTestDb
  ? describe
  : describe.skip;

const TABLES = [
  "acts", "checkins", "escrows", "listings", "notifications", "pending_drips",
  "referral_settlements", "referrals", "reports", "users", "venture_submissions",
  "idempotent_actions", "consumed_nonces", "auth_nonces", "lender_keys",
];

export async function resetTestDb() {
  if (!hasTestDb) return;
  const { ensureDbSchema, getSql } = await import("@/lib/db");
  await ensureDbSchema();
  const sql = getSql()!;
  await sql`TRUNCATE TABLE acts, checkins, escrows, listings, notifications, pending_drips, referral_settlements, referrals, reports, users, venture_submissions, idempotent_actions, consumed_nonces, auth_nonces, lender_keys CASCADE`;
  void TABLES;
}

export function reqJson(url: string, body?: unknown, headers?: Record<string, string>): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(headers ?? {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
