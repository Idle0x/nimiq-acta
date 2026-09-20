// Global test setup: deterministic env + next/headers cookie jar mock.
// DB-backed suites additionally require DATABASE_URL_TEST (see helpers/db.ts);
// without it they report as skipped instead of failing.
import { vi, beforeAll } from "vitest";

vi.stubEnv("NODE_ENV", "test");
// Fixed 64-hex secret: exercises the real HMAC path (never the dev fallback).
process.env.ENCRYPTION_KEY =
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
process.env.CRON_SECRET = "test-cron-secret";
process.env.NIMIQ_RPC_URL = "https://rpc.nimiqwatch.com";
process.env.NIMIQ_NETWORK_ID = "24";
// Intentionally UNSET here: VAULT_SEED_PHRASE (simulated payouts),
// OPENAI_API_KEY (simulated oracle), DATABASE_URL (mem mode).
delete process.env.VAULT_SEED_PHRASE;
delete process.env.OPENAI_API_KEY;
delete process.env.DATABASE_URL;
if (process.env.DATABASE_URL_TEST) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
}

type CookieVal = { value: string };
const jar = new Map<string, string>();
const testHeaders = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string): CookieVal | undefined =>
      jar.has(name) ? { value: jar.get(name)! } : undefined,
    set: (name: string, value: string) => {
      jar.set(name, value);
    },
    delete: (name: string) => {
      jar.delete(name);
    },
  }),
  headers: async () => ({
    get: (name: string): string | null => testHeaders.get(name.toLowerCase()) ?? null,
    has: (name: string): boolean => testHeaders.has(name.toLowerCase()),
  }),
}));

(globalThis as Record<string, unknown>).__actaCookieJar = jar;
(globalThis as Record<string, unknown>).__actaHeaders = testHeaders;

beforeAll(() => {
  jar.clear();
  testHeaders.clear();
});
