import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getSessionAddress } from "@/lib/session";

function num(r: Record<string, unknown>, ...keys: string[]): number {
  for (const k of keys) {
    const v = r[k];
    if (v !== null && v !== undefined && v !== "") {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const sql = getSql();
  const me = await getSessionAddress();

  if (!sql) {
    const { fetchListing, getMemStore } = await import("@/lib/db");
    const listing = await fetchListing(id);
    if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { memUsers, memActs, memEscrows } = getMemStore();
    const owner = listing.owner;
    const user = memUsers.get(owner);
    const ownerActs = memActs.filter((a) => a.actorAddress === owner);
    const listingEscrows = memEscrows.filter((e) => e.listingId === id);
    const myEscrow = me ? listingEscrows.find((e) => e.borrower === me) : undefined;
    return NextResponse.json({
      listing: {
        id: listing.id,
        title: listing.title,
        kind: listing.kind,
        owner: listing.owner,
        collateralNIM: listing.collateralNIM,
        description: listing.description ?? "",
        yieldNIM: listing.yieldNIM ?? 0,
        requireLocation: Boolean(listing.requireLocation),
        state: listing.state ?? (listing.isActive ? "open" : "complete"),
        expiresAt: listing.expiresAt ?? null,
        contract: listing.contract ?? null,
        createdAt: listing.createdAt || Date.now(),
      },
      sponsor: {
        address: owner,
        trustScore: user?.trustScore ?? 80,
        joinedAt: user?.joinedAt ?? Date.now() - 86400000 * 14,
        actsCount: ownerActs.length,
        settledVolume: ownerActs.reduce((s, a) => s + (a.amountNIM || 0), 0),
        recentActs: ownerActs.slice(0, 8).map((a) => ({
          id: a.id,
          type: a.type,
          amountNIM: a.amountNIM,
          createdAt: a.createdAt,
        })),
      },
      viewer: {
        isOwner: me === owner,
        escrow: myEscrow
          ? {
              id: myEscrow.id,
              state: myEscrow.state,
              progress: "awaiting_proof",
              deadlineAt: myEscrow.deadlineAt,
              amountNIM: myEscrow.amountNIM,
            }
          : null,
        activeParticipants: listingEscrows.filter((e) => e.state === "locked").length,
      },
    });
  }

  const rows = await sql`SELECT * FROM listings WHERE id = ${id} LIMIT 1`;
  const l = rows[0] as Record<string, unknown> | undefined;
  if (!l) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const owner = l.owner as string;
  const [users, acts, escrows] = await Promise.all([
    sql`SELECT trust_score, joined_at FROM users WHERE address = ${owner} LIMIT 1`,
    sql`SELECT id, type, amount_nim, created_at FROM acts WHERE actor_address = ${owner} ORDER BY created_at DESC LIMIT 8`,
    sql`SELECT id, state, borrower, completer, progress, deadline_at, amount_nim, created_at
        FROM escrows WHERE listing_id = ${id} ORDER BY created_at DESC LIMIT 20`,
  ]);

  const u = (users[0] ?? {}) as Record<string, unknown>;
  const myEscrow = me
    ? (escrows as unknown as Record<string, unknown>[]).find(
        (e) => e.borrower === me || e.completer === me
      )
    : undefined;

  return NextResponse.json({
    listing: {
      id: l.id,
      title: l.title,
      kind: l.kind,
      owner,
      collateralNIM: num(l, "collateral_nim", "collateralNIM"),
      description: l.description ?? "",
      yieldNIM: num(l, "yield_nim", "yieldNIM"),
      requireLocation: Boolean(l.require_location ?? l.requireLocation),
      state: l.state ?? (l.is_active ? "open" : "complete"),
      expiresAt: l.expires_at ? Number(l.expires_at) : null,
      contract: l.contract ?? null,
      createdAt: Number(l.created_at ?? Date.now()),
    },
    sponsor: {
      address: owner,
      trustScore: num(u, "trust_score", "trustScore"),
      joinedAt: u.joined_at ? Number(u.joined_at) : null,
      actsCount: (acts as unknown[]).length,
      settledVolume: (acts as unknown as Record<string, unknown>[])
        .reduce((s, a) => s + num(a, "amount_nim", "amountNIM"), 0),
      recentActs: (acts as unknown as Record<string, unknown>[]).map((a) => ({
        id: a.id, type: a.type, amountNIM: num(a, "amount_nim", "amountNIM"), createdAt: Number(a.created_at),
      })),
    },
    viewer: {
      isOwner: me === owner,
      escrow: myEscrow
        ? {
            id: myEscrow.id,
            state: myEscrow.state,
            progress: myEscrow.progress ?? "awaiting_proof",
            deadlineAt: myEscrow.deadline_at ? Number(myEscrow.deadline_at) : null,
            amountNIM: num(myEscrow, "amount_nim", "amountNIM"),
          }
        : null,
      activeParticipants: (escrows as unknown as Record<string, unknown>[]).filter(
        (e) => e.state === "locked"
      ).length,
    },
  });
}
