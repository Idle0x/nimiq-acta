import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";

export const dynamic = "force-dynamic";

// Lightweight probe so the client can cache auth state and avoid
// re-signing on every action.
export async function GET() {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "No session" }, { status: 401 });
  return NextResponse.json({ address });
}
