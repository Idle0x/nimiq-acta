import { NextResponse } from "next/server";
import { newId } from "@/lib/escrow";

export async function GET() {
  return NextResponse.json({ nonce: newId("auth") });
}
