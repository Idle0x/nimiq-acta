// Daily check-in: one drip per address per UTC day, streak math,
// session-only identity.
import { describe, it, expect, beforeEach } from "vitest";
import { dbSuite, resetTestDb, reqJson } from "../helpers/db";
import { mintSession, clearSession } from "../helpers/session";

const A = "NQ07 0000 0000 0000 0000 0000 0000 0000 000A";

dbSuite("check-in", () => {
  beforeEach(async () => {
    await resetTestDb();
    clearSession();
    mintSession(A);
  });

  it("first claim ok (simulated drip offline), second → 409", async () => {
    const { POST } = await import("@/app/api/checkin/route");
    const first = await (await POST(reqJson("http://t/api/checkin", {}))).json();
    expect(first.ok).toBe(true);
    expect(first.checkedToday).toBe(true);
    const second = await POST(reqJson("http://t/api/checkin", {}));
    expect(second.status).toBe(409);
  });

  it("streak counts consecutive UTC days", async () => {
    const { getSql } = await import("@/lib/db");
    const day = (off: number) => {
      const d = new Date(Date.now() - off * 86400_000);
      return d.toISOString().slice(0, 10);
    };
    for (const off of [0, 1, 2]) {
      await getSql()!`INSERT INTO checkins (address, day, created_at, tx_hash) VALUES (${A}, ${day(off)}, ${Date.now()}, '0x') ON CONFLICT DO NOTHING`;
    }
    const { GET } = await import("@/app/api/checkin/route");
    const j = await (await GET(new Request("http://t/api/checkin"))).json();
    expect(j.streak).toBe(3);
    expect(j.total).toBe(3);
  });

  it("broken streak restarts at 1", async () => {
    const { getSql } = await import("@/lib/db");
    const day = (off: number) => {
      const d = new Date(Date.now() - off * 86400_000);
      return d.toISOString().slice(0, 10);
    };
    for (const off of [0, 2]) {
      await getSql()!`INSERT INTO checkins (address, day, created_at, tx_hash) VALUES (${A}, ${day(off)}, ${Date.now()}, '0x') ON CONFLICT DO NOTHING`;
    }
    const { GET } = await import("@/app/api/checkin/route");
    const j = await (await GET(new Request("http://t/api/checkin"))).json();
    expect(j.streak).toBe(1);
  });

  it("unauthenticated GET/POST → 401", async () => {
    clearSession();
    const mod = await import("@/app/api/checkin/route");
    expect((await mod.POST(reqJson("http://t/api/checkin", {}))).status).toBe(401);
    expect((await mod.GET(new Request("http://t/api/checkin"))).status).toBe(401);
  });
});
