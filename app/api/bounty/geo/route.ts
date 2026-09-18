import { NextResponse } from "next/server";
import { getSessionAddress } from "@/lib/session";
import { fetchListing, hasDb } from "@/lib/db";
import { claimListing, finalizeListing, unclaimListing, settleAct } from "@/lib/settle";
import { newId, MIN_NETWORK_FEE_NIM, SETTLE_FEE_NIM, explorerTxUrl } from "@/lib/escrow";
import { verifyReturn } from "@/lib/qr";
import { getLenderKey, consumeNonce } from "@/lib/db";
import { awardRecurring } from "@/lib/milestones";

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "Database not available" }, { status: 500 });

  try {
    const body = await req.json();
    if (!body.listingId || typeof body.lat !== "number" || typeof body.lng !== "number" || typeof body.accuracy !== "number") {
      return NextResponse.json({ error: "Missing location parameters" }, { status: 400 });
    }

    const listing = await fetchListing(body.listingId);
    if (!listing || !["bounty_geo", "bounty", "bounty_venture"].includes(listing.kind)) {
      return NextResponse.json({ error: "Invalid listing or not a Geo bounty" }, { status: 404 });
    }
    // Plain PhotoProof bounties only accept GPS proof when the sponsor demanded location.
    if (listing.kind === "bounty") {
      const c = (listing as any).contract as { geo?: unknown } | null;
      if (!(listing as any).requireLocation && !c?.geo) {
        return NextResponse.json({ error: "This bounty is judged by photo proof — GPS alone cannot settle it" }, { status: 400 });
      }
    }

    if (listing.owner === address) {
      return NextResponse.json({ error: "You cannot win your own bounty" }, { status: 403 });
    }
    if (body.accuracy > 50) {
      return NextResponse.json({ pass: false, reason: "Location too inaccurate (>50m)" });
    }

    // AI photo-at-location: sponsor demands two oracles agreeing, not just GPS.
    const gContract = ((listing as any).contract ?? null) as {
      criteria?: string; ai?: { presenceCheck?: boolean };
    } | null;
    let geoScene: string | null = null;
    if (gContract?.ai?.presenceCheck || body.imageUrl) {
      if (!body.imageUrl || typeof body.imageUrl !== "string") {
        return NextResponse.json({ error: "This check-in requires a photo of the place — GPS alone is not enough" }, { status: 422 });
      }
      const { verifyScenePhoto, OracleError } = await import("@/lib/vision");
      try {
        const v = await verifyScenePhoto(String(listing.title), String(gContract?.criteria ?? ""), body.imageUrl);
        if (!v.pass) return NextResponse.json({ pass: false, reason: `Photo check failed: ${v.reason}` });
        geoScene = v.reason;
      } catch (e) {
        if (e instanceof OracleError) {
          return NextResponse.json({ error: (e as Error).message, retryable: true }, { status: 502 });
        }
        throw e;
      }
    }

    // If the creator pinned a target (contract.geo first, legacy columns fallback),
    // enforce real proximity (haversine).
    const cg = (gContract as { geo?: { lat?: number; lng?: number; radiusM?: number } } | null)?.geo;
    const targetLat = cg?.lat ?? (listing as any).targetLat;
    const targetLng = cg?.lng ?? (listing as any).targetLng;
    const radiusM = cg?.radiusM ?? 150;
    if (targetLat != null && targetLng != null) {
      const dist = haversineM(body.lat, body.lng, targetLat, targetLng);
      if (dist > radiusM) {
        return NextResponse.json({ pass: false, reason: `You are ${Math.round(dist)}m from the target (within ${radiusM}m)` });
      }
    }

    const result = await settleAct(
      {
        id: newId("act"),
        actorAddress: address,
        type: "bounty",
        oracle: "geo",
        listingId: listing.id,
        amountNIM: listing.collateralNIM,
        feeNIM: MIN_NETWORK_FEE_NIM,
        proofJson: { lat: body.lat, lng: body.lng, accuracy: body.accuracy, scene: geoScene },
        createdAt: listing.createdAt,
      },
      {
        to: address,
        amountNIM: listing.collateralNIM - SETTLE_FEE_NIM,
        feeNIM: SETTLE_FEE_NIM,
        message: `Acta: GPS Check-In reward for "${listing.title}"`,
      },
      () => claimListing(body.listingId),
      () => finalizeListing(body.listingId),
      () => unclaimListing(body.listingId)
    );
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    awardRecurring(address, "settle").catch(() => {});
    awardRecurring(address, "bounty").catch(() => {});
    try {
      const { getSql } = await import("@/lib/db");
      await getSql()!`UPDATE escrows SET progress = 'settled' WHERE listing_id = ${body.listingId} AND state = 'released'`;
    } catch { /* informational */ }
    const { notify } = await import("@/lib/notify");
    await notify(address, "payout", "CheckIn settled",
      `${listing.collateralNIM.toLocaleString()} NIM paid out for "${listing.title}".`,
      explorerTxUrl(result.txHashOut));
    await notify(listing.owner, "released", "Your CheckIn was completed",
      `"${listing.title}" was verified by GPS and paid from the vault.`);
    return NextResponse.json({ pass: true, reason: "Verified location", txHashOut: result.txHashOut });
  } catch (err) {
    console.error("Geo Verify Route Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
