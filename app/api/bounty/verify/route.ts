import { NextResponse } from "next/server";
import { checkVisionBudget, verifyBountyPhoto } from "@/lib/vision";

export async function POST(req: Request) {
  let body: { task?: string; imageUrl?: string };
  try {
    body = (await req.json()) as { task?: string; imageUrl?: string };
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.task || !body.imageUrl) {
    return NextResponse.json({ error: "task and imageUrl required" }, { status: 400 });
  }
  if (body.imageUrl.length > 6_000_000) {
    return NextResponse.json({ error: "image too large (6MB cap)" }, { status: 413 });
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
    return NextResponse.json({ ...verdict, model: process.env.VISION_MODEL ?? "Qwen/Qwen3.6-35B-A3B-FP8" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "vision call failed";
    const status = /429/.test(msg) ? 429 : 502;
    return NextResponse.json({ error: msg }, { status });
  }
}
