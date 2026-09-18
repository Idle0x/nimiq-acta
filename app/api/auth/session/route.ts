import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";

export async function GET() {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "No session" }, { status: 401 });
  return NextResponse.json({ address });
}
