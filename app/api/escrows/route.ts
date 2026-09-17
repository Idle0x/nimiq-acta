import { NextResponse } from "next/server";
import {
  fetchEscrows,
  fetchListings,
  hasDb,
  insertEscrow,
  setEscrowLenderKey,
  setEscrowReleased,
} from "@/lib/db";
import type { Escrow } from "@/lib/escrow";

// In-memory fallback when DATABASE_URL is not set (single-device demo).
const mem: Escrow[] = [];

export async function GET() {
  if (!hasDb()) {
    return NextResponse.json({ listings: await fetchListings(), escrows: mem, shared: false });
  }
  const [listings, escrows] = await Promise.all([fetchListings(), fetchEscrows()]);
  return NextResponse.json({ listings, escrows, shared: true });
}

export async function POST(req: Request) {
  const e = (await req.json()) as Escrow;
  if (!e?.id || !e?.listingId) {
    return NextResponse.json({ error: "bad escrow payload" }, { status: 400 });
  }
  if (!hasDb()) {
    mem.unshift(e);
    return NextResponse.json({ ok: true, shared: false });
  }
  await insertEscrow(e);
  return NextResponse.json({ ok: true, shared: true });
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as { id?: string; lenderPubkey?: string; state?: string };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  if (!hasDb()) {
    const i = mem.findIndex((x) => x.id === body.id);
    if (i >= 0) {
      if (body.lenderPubkey) mem[i] = { ...mem[i], lenderPubkey: body.lenderPubkey };
      if (body.state === "released") mem[i] = { ...mem[i], state: "released" };
    }
    return NextResponse.json({ ok: true, shared: false });
  }
  if (body.lenderPubkey) await setEscrowLenderKey(body.id, body.lenderPubkey);
  if (body.state === "released") await setEscrowReleased(body.id);
  return NextResponse.json({ ok: true, shared: true });
}
