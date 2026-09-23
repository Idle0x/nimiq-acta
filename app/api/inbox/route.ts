import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getSessionAddress } from "@/lib/session";

type Row = {
  id: string; address: string; kind: string; title: string;
  body: string | null; link: string | null; read: boolean; created_at: string | number;
};

export async function GET() {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const sql = getSql();
  if (!sql) return NextResponse.json({ notifications: [], unread: 0 });
  const rows = (await sql`
    SELECT * FROM notifications WHERE address = ${address}
    ORDER BY created_at DESC LIMIT 30
  `) as unknown as Row[];
  const notifications = rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    title: r.title,
    body: r.body,
    link: r.link,
    read: r.read,
    createdAt: Number(r.created_at),
  }));
  return NextResponse.json({ notifications, unread: notifications.filter((n) => !n.read).length });
}

export async function PATCH(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const sql = getSql();
  const body = await req.json().catch(() => ({}));
  if (sql) {
    if (body.id) {
      await sql`UPDATE notifications SET read = TRUE WHERE address = ${address} AND id = ${body.id}`;
    } else {
      await sql`UPDATE notifications SET read = TRUE WHERE address = ${address}`;
    }
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const address = await getSessionAddress();
  if (!address) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const sql = getSql();
  const body = await req.json().catch(() => ({}));
  if (sql) {
    if (body.id) {
      await sql`DELETE FROM notifications WHERE address = ${address} AND id = ${body.id}`;
    } else {
      await sql`DELETE FROM notifications WHERE address = ${address} AND read = TRUE`;
    }
  }
  return NextResponse.json({ ok: true });
}
