import { NextResponse } from "next/server";
import { getSessionAddress, setSession } from "@/lib/session";
import { ensureDbSchema, ensureUser } from "@/lib/db";

export async function GET() {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "No session" }, { status: 401 });
  return NextResponse.json({ address });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const address = body?.address;
    if (!address || typeof address !== "string" || !address.trim().startsWith("NQ")) {
      return NextResponse.json({ error: "Valid Nimiq address required" }, { status: 400 });
    }
    const cleanAddress = address.trim();
    await ensureDbSchema();
    await setSession(cleanAddress);
    await ensureUser(cleanAddress).catch(() => {});
    return NextResponse.json({ ok: true, address: cleanAddress });
  } catch (err) {
    return NextResponse.json({ error: "Failed to establish session" }, { status: 500 });
  }
}
