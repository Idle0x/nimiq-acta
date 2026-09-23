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

export default function Inbox({
  open,
  onClose,
  onChanged,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onChanged?: () => void;
  onNavigate?: (link: string) => void;
}) {
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

  async function markSingle(id: string) {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, read: true } : x)));
    onChanged?.();
    try {
      await fetch("/api/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {}
  }

  async function dismissSingle(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setItems((xs) => xs.filter((x) => x.id !== id));
    onChanged?.();
    try {
      await fetch("/api/inbox", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch {}
  }

  async function clearRead() {
    setItems((xs) => xs.filter((x) => !x.read));
    onChanged?.();
    try {
      await fetch("/api/inbox", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearAll: true }),
      });
    } catch {}
  }

  function handleItemClick(n: any) {
    if (!n.read) {
      markSingle(n.id);
    }
    if (n.link) {
      if (n.link.startsWith("http")) {
        window.open(n.link, "_blank", "noreferrer");
      } else if (onNavigate) {
        onNavigate(n.link);
        onClose();
      }
    }
  }

  const unreadCount = items.filter((x) => !x.read).length;
  const readCount = items.length - unreadCount;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="floaty absolute inset-x-3 top-[max(3rem,env(safe-area-inset-top))] max-h-[75vh] overflow-y-auto rounded-3xl p-4 animate-slide-down"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="caps flex items-center gap-1.5 text-[10px] font-bold text-[var(--ink)]">
              <Bell size={13} className="text-[var(--gold)]" /> Inbox
            </p>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[var(--gold)]/15 border border-[var(--gold)]/30 px-1.5 py-0.2 text-[9px] font-bold text-[var(--gold)]">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            {unreadCount > 0 && (
              <button onClick={markAll} className="caps text-[8.5px] font-semibold text-[var(--gold2)] hover:underline">
                Mark all read
              </button>
            )}
            {readCount > 0 && (
              <button onClick={clearRead} className="caps text-[8.5px] text-[var(--ink3)] hover:text-[var(--ink)] hover:underline">
                Clear read
              </button>
            )}
            <button onClick={onClose} className="ghost rounded-full p-1.5 text-[var(--ink2)] hover:text-[var(--ink)]">
              <X size={14} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-14 rounded-2xl" />)}</div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center">
            <p className="marginalia text-[12.5px]">All quiet. Every act you settle will write a line here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => {
              const k = KIND_ICON[n.kind] ?? KIND_ICON.info;
              return (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`group relative flex items-start gap-3 rounded-2xl border p-3.5 transition-all cursor-pointer ${
                    n.read
                      ? "border-[var(--line)] bg-transparent opacity-65 hover:opacity-90"
                      : "border-[var(--gold)]/35 bg-[var(--surface)] hover:border-[var(--gold)] shadow-sm"
                  }`}
                >
                  <span
                    className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full"
                    style={{ background: `color-mix(in srgb, ${k.color} 15%, transparent)`, color: k.color }}
                  >
                    <k.Icon size={13} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-[12.5px] leading-tight ${n.read ? "font-medium text-[var(--ink2)]" : "font-bold text-[var(--ink)]"}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] shrink-0 animate-pulse" title="Unread" />
                      )}
                    </div>
                    {n.body ? <p className="marginalia mt-0.5 text-[11px] leading-snug">{n.body}</p> : null}
                    {n.link ? (
                      n.link.startsWith("http") ? (
                        <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--sky)] group-hover:underline">
                          View on Nimiq Explorer <ExternalLink size={9} />
                        </span>
                      ) : (
                        <span className="marginalia mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-[var(--gold)] group-hover:underline">
                          Open in {n.link === "/active" ? "Active Queue" : n.link.replace("/", "")} →
                        </span>
                      )
                    ) : null}
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-none">
                    <span className="figure text-[9px] text-[var(--ink3)]">
                      {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                    </span>
                    <button
                      onClick={(e) => dismissSingle(n.id, e)}
                      title="Dismiss notification"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[var(--ink3)] hover:text-[var(--wax)] rounded-full hover:bg-[var(--surface2)]"
                    >
                      <X size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
