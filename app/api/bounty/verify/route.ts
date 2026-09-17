import { NextResponse } from "next/server";
import { checkVisionBudget, verifyBountyPhoto } from "@/lib/vision";
import { getSessionAddress } from "@/lib/session";
import { fetchListing, atomicReleaseListing, insertAct, hasDb } from "@/lib/db";
import { executeVaultPayout } from "@/lib/backend-nimiq";
import { newId, MIN_NETWORK_FEE_NIM } from "@/lib/escrow";
import { checkAndAwardMilestone } from "@/lib/milestones";

export async function POST(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb()) return NextResponse.json({ error: "No DB" }, { status: 500 });

  let body: { task?: string; imageUrl?: string; listingId?: string; geo?: { lat: number; lng: number; accuracy: number } };
  try {
    body = (await req.json()) as { task?: string; imageUrl?: string; listingId?: string; geo?: { lat: number; lng: number; accuracy: number } };
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.task || !body.imageUrl || !body.listingId) {
    return NextResponse.json({ error: "task, listingId, and imageUrl required" }, { status: 400 });
  }
  if (body.imageUrl.length > 6_000_000) {
    return NextResponse.json({ error: "image too large (6MB cap)" }, { status: 413 });
  }
  
  if (body.geo && body.geo.accuracy > 50) {
    return NextResponse.json({ error: `Geolocation accuracy too low (${Math.round(body.geo.accuracy)}m > 50m)` }, { status: 400 });
  }
  
  const listing = await fetchListing(body.listingId);
  if (!listing || !listing.isActive || listing.kind !== "bounty") {
    return NextResponse.json({ error: "Bounty inactive or not found" }, { status: 400 });
  }

  const budget = checkVisionBudget();
  if (!budget.ok) {
    return NextResponse.json(
      { error: "hetzner rate limit (10 req/60s)", retryAfterSec: budget.retryAfterSec },
      { status: 429 }
    );
  }
  
  try {
    const verdict = await verifyBountyPhoto(body.task, body.imageUrl);
    const model = process.env.VISION_MODEL ?? "Qwen/Qwen3.6-35B-A3B-FP8";
    
    if (verdict.pass) {
       const released = await atomicReleaseListing(body.listingId);
       if (!released) return NextResponse.json({ error: "Bounty already completed" }, { status: 400 });
       
       // Real Network Payout using Vault
       let txHashOut = "0x" + Date.now().toString(16);
       try {
         txHashOut = await executeVaultPayout(address, listing.collateralNIM, 0.5);
       } catch (e) {
         console.error("Bounty payout broadcast failed:", e);
         return NextResponse.json({ error: "Failed to broadcast bounty reward" }, { status: 500 });
       }
       
       await insertAct({
         id: newId("act"),
         actorAddress: address,
         type: "bounty",
         oracle: "vision",
         listingId: listing.id,
         amountNIM: listing.collateralNIM,
         feeNIM: 0.5,
         proofJson: { verdict, model },
         txHashOut,
         createdAt: listing.createdAt,
         settledAt: Date.now()
       });
       
       checkAndAwardMilestone(address, "FIRST_BOUNTY").catch(() => {});
       
       return NextResponse.json({ pass: true, reason: verdict.reason, model });
    }

    return NextResponse.json({ ...verdict, model });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "vision call failed";
    const status = /429/.test(msg) ? 429 : 502;
    return NextResponse.json({ error: msg }, { status });
  }
}
