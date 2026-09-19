import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";

export async function GET() {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "No session" }, { status: 401 });
  return NextResponse.json({ address });
}

// NOTE: an unsigned POST that minted sessions for any address used to live
// here. It made every session-gated route spoofable (any public address could
// be impersonated), so it was removed. Sessions are established ONLY via
// POST /api/auth/verify with a wallet signature. Demo mode is read-only
// client state and never receives a server session.
