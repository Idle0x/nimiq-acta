import { NextResponse } from "next/server";
import { getSql, ensureDbSchema } from "@/lib/db";
import { getSessionAddress } from "@/lib/session";
import { notify } from "@/lib/notify";
import { explorerTxUrl } from "@/lib/escrow";

export const CHECKIN_REWARD_NIM = 1;

function utcDay(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function dayBefore(day: string): string {
  const d = new Date(day + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Claim today's 1 NIM check-in. One per address per UTC day. */
export async function POST(req: Request) {
  let address = await getSessionAddress();
  if (!address) {
    try {
      const body = await req.clone().json().catch(() => ({}));
      if (body?.address && typeof body.address === "string") address = body.address;
    } catch { /* ignore */ }
  }
  if (!address) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const sql = getSql();
  const day = utcDay();

  if (!sql) {
    const { getMemStore } = await import("@/lib/db");
    const { memCheckins } = getMemStore();
    let userDays = memCheckins.get(address);
    if (!userDays) {
      userDays = new Set<string>();
      memCheckins.set(address, userDays);
    }
    if (userDays.has(day)) {
      return NextResponse.json({ error: "Already checked in today — come back tomorrow" }, { status: 409 });
    }
    userDays.add(day);

    let streak = 0;
    let cursor = userDays.has(day) ? day : dayBefore(day);
    if (userDays.has(cursor)) {
      streak = 1;
      let prev = dayBefore(cursor);
      while (userDays.has(prev)) {
        streak++;
        prev = dayBefore(prev);
      }
    }
    const allDays = Array.from(userDays);
    const monthDays = allDays.filter((d) => d.startsWith(day.slice(0, 7)));

    return NextResponse.json({
      ok: true,
      txHash: "0xsimulated_checkin_" + day.replace(/-/g, ""),
      queued: false,
      checkedToday: true,
      streak,
      total: userDays.size,
      month: day.slice(0, 7),
      monthDays,
    });
  }

  try {
    await ensureDbSchema();
    const claimed = await sql`
      INSERT INTO checkins (address, day, created_at, tx_hash)
      VALUES (${address}, ${day}, ${Date.now()}, NULL)
      ON CONFLICT (address, day) DO NOTHING
      RETURNING day
    `;
    if (claimed.length === 0) {
      return NextResponse.json({ error: "Already checked in today — come back tomorrow" }, { status: 409 });
    }

    let tx: string | null = null;
    try {
      const { dripTreasury } = await import("@/lib/milestones");
      tx = await dripTreasury(address, CHECKIN_REWARD_NIM, {
        type: "checkin",
        proof: { day },
        refId: `checkin:${day}`,
        message: `Acta: Daily check-in reward (${day})`,
      });
      if (tx) {
        await sql`UPDATE checkins SET tx_hash = ${tx} WHERE address = ${address} AND day = ${day}`;
        await notify(address, "payout", "Daily check-in settled",
          `1 NIM for showing up — streak kept alive.`, explorerTxUrl(tx));
      }
    } catch (dripErr) {
      console.warn("Treasury drip error during check-in:", dripErr);
    }

    const status = await readStatus(sql, address, day);
    return NextResponse.json({ ok: true, txHash: tx, queued: !tx, ...status });
  } catch (err: any) {
    console.error("Checkin POST error:", err);
    return NextResponse.json({ error: err?.message || "Check-in failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = (await getSessionAddress()) || url.searchParams.get("address");
  if (!address) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const sql = getSql();
  const today = utcDay();

  if (!sql) {
    const { getMemStore } = await import("@/lib/db");
    const { memCheckins } = getMemStore();
    const userDays = memCheckins.get(address) || new Set<string>();
    let streak = 0;
    let cursor = userDays.has(today) ? today : dayBefore(today);
    if (userDays.has(cursor)) {
      streak = 1;
      let prev = dayBefore(cursor);
      while (userDays.has(prev)) {
        streak++;
        prev = dayBefore(prev);
      }
    }
    const allDays = Array.from(userDays);
    const monthDays = allDays.filter((d) => d.startsWith(today.slice(0, 7)));

    return NextResponse.json({
      checkedToday: userDays.has(today),
      streak,
      total: userDays.size,
      month: today.slice(0, 7),
      monthDays,
    });
  }

  try {
    await ensureDbSchema();
    return NextResponse.json(await readStatus(sql, address, today));
  } catch (err) {
    console.error("Checkin GET error:", err);
    return NextResponse.json({
      checkedToday: false,
      streak: 0,
      total: 0,
      month: today.slice(0, 7),
      monthDays: [],
    });
  }
}

async function readStatus(sql: NonNullable<ReturnType<typeof getSql>>, address: string, today: string) {
  const [mine, month] = await Promise.all([
    sql`SELECT day, tx_hash FROM checkins WHERE address = ${address} ORDER BY day DESC LIMIT 60`,
    sql`SELECT day FROM checkins WHERE address = ${address} AND day LIKE ${today.slice(0, 7) + "%"}`,
  ]);
  const days = new Set((mine as unknown as Record<string, unknown>[]).map((r) => String(r.day)));
  const monthDays = (month as unknown as Record<string, unknown>[]).map((r) => String(r.day));
  let streak = 0;
  let cursor = days.has(today) ? today : dayBefore(today);
  if (days.has(cursor)) {
    streak = 1;
    let prev = dayBefore(cursor);
    while (days.has(prev)) {
      streak++;
      prev = dayBefore(prev);
    }
  }
  return {
    checkedToday: days.has(today),
    streak,
    total: (mine as unknown[]).length,
    month: today.slice(0, 7),
    monthDays,
  };
}
