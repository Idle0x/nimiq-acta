import { NextResponse } from "next/server";
import { getSql, hasDb } from "@/lib/db";
import { newId } from "@/lib/escrow";

const NONCE_TTL_MS = 5 * 60 * 1000;

export async function GET() {
  const nonce = newId("n");
  if (hasDb()) {
    const sql = getSql()!;
    await sql`INSERT INTO auth_nonces (nonce, created_at) VALUES (${nonce}, ${Date.now()})`;
    // Opportunistic TTL cleanup
    sql`DELETE FROM auth_nonces WHERE created_at < ${Date.now() - NONCE_TTL_MS}`
      .catch(() => {});
  }
  return NextResponse.json({ nonce });
}
