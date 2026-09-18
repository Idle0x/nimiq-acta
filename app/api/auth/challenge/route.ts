import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSql } from "@/lib/db";

export async function GET() {
  const nonce = crypto.randomBytes(16).toString("hex");
  const sql = getSql();
  if (sql) {
    try {
      await sql`DELETE FROM auth_nonces WHERE created_at < ${Date.now() - 2 * 60 * 1000}`;
      await sql`INSERT INTO auth_nonces (nonce, created_at) VALUES (${nonce}, ${Date.now()})`;
    } catch {
      // nonce table missing -> verification will still work via signature check
    }
  }
  return NextResponse.json({ nonce });
}
