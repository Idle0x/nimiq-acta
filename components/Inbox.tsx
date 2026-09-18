"use client";
import { useCallback, useEffect, useState } from "react";
import { X, Check, Zap, UserCheck, Users, Vault, Bell, Info, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const KIND_ICON: Record<string, { Icon: any; color: string }> = {
  released: { Icon: Check, color: "var(--verdigris)" },
  payout: { Icon: Vault, color: "var(--gold)" },
  milestone: { Icon: Zap, color: "var(--gold)" },
  submission: { Icon: UserCheck, color: "var(--sky)" },
  referral: { Icon: Users, color: "var(--verdigris)" },
  info: { Icon: Info, color: "var(--ink3)" },
};

export function useUnread() {
  const [unread, setUnread] = useState(0);
  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/inbox");
      if (r.ok) setUnread((await r.json()).unread ?? 0);
    } catch { /* silent */ }
  }, []);
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 20000);
    return () => clearInterval(t);
  }, [refresh]);
  return { unread, refresh };
}

export default function Inbox({ open, onClose, onChanged }: { open: boolean; onClose: () => void; onChanged?: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/inbox")
      .then((r) => (r.ok ? r.json() : { notifications: [] }))
      .then((d) => setItems(d.notifications ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [open]);

  async function markAll() {
    await fetch("/api/inbox", { method: "PATCH" });
    setItems((xs) => xs.map((x) => ({ ...x, read: true })));
    onChanged?.();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="floaty absolute inset-x-3 top-[max(3rem,env(safe-area-inset-top))] max-h-[70vh] overflow-y-auto rounded-3xl p-4 animate-slide-down"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="caps flex items-center gap-2 text-[9px] text-[var(--ink2)]">
            <Bell size={12} className="text-[var(--gold)]" /> Inbox
          </p>
          <div className="flex items-center gap-2">
            <button onClick={markAll} className="caps text-[8px] text-[var(--gold2)] hover:underline">Mark all read</button>
            <button onClick={onClose} className="ghost rounded-full p-1.5"><X size={13} /></button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-12" />)}</div>
        ) : items.length === 0 ? (
          <p className="marginalia py-8 text-center text-[12.5px]">
            All quiet. Every act you settle will write a line here.
          </p>
        ) : (
          <div className="space-y-2">
            {items.map((n) => {
              const k = KIND_ICON[n.kind] ?? KIND_ICON.info;
              return (
                <div key={n.id} className={`flex items-start gap-2.5 rounded-2xl border p-3 ${n.read ? "border-[var(--line)] opacity-60" : "border-[var(--line2)]"}`}>
                  <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${k.color} 15%, transparent)`, color: k.color }}>
                    <k.Icon size={12} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-semibold leading-tight text-[var(--ink)]">{n.title}</p>
                    {n.body ? <p className="marginalia mt-0.5 text-[11px] leading-snug">{n.body}</p> : null}
                    {n.link ? (
                      n.link.startsWith("http") ? (
                        <a href={n.link} target="_blank" rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-semibold text-[var(--sky)] hover:underline">
                          View transaction <ExternalLink size={9} />
                        </a>
                      ) : (
                        <span className="marginalia mt-1 block text-[10px]">See {n.link === "/active" ? "Active" : n.link} tab →</span>
                      )
                    ) : null}
                  </div>
                  <span className="figure flex-none text-[9px] text-[var(--ink3)]">
                    {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
