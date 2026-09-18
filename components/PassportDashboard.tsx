"use client";
import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ExternalLink,
  Hourglass,
  Inbox as InboxIcon,
  Share2,
  Copy,
  Check,
  Calendar,
  Lock,
  Package,
  Activity,
  Award,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  LogIn,
  Layers,
  History as HistoryIcon,
} from "lucide-react";
import Identicon from "./Identicon";
import Stamps from "./Stamps";
import { trustTier } from "./AppChrome";

const STATE_CHIP: Record<string, { label: string; color: string }> = {
  locked: { label: "In progress", color: "var(--gold)" },
  released: { label: "Settled", color: "var(--verdigris)" },
  refunded: { label: "Refunded", color: "var(--wax)" },
  expired: { label: "Expired", color: "var(--ink3)" },
  open: { label: "Open", color: "var(--verdigris)" },
  complete: { label: "Completed", color: "var(--ink2)" },
  cancelled: { label: "Cancelled", color: "var(--wax)" },
};

function Row({
  title,
  right,
  sub,
  tx,
}: {
  title: string;
  right: string;
  sub: string;
  tx?: string | null;
}) {
  return (
    <div className="ledger-entry">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[12.5px] font-semibold text-[var(--ink)]">{title}</p>
        <span className="figure flex-none text-[12px] font-bold text-[var(--gold2)]">{right}</span>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <p className="text-[10.5px] text-[var(--ink3)]">{sub}</p>
        {tx ? (
          <a
            href={tx.startsWith("0x") ? `https://www.nimiqwatch.com/transaction/${tx}` : `https://albatross.nimiqwatch.com/transaction/${tx}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-0.5 text-[9px] text-[var(--sky)] hover:underline"
          >
            tx <ExternalLink size={8} />
          </a>
        ) : null}
      </div>
    </div>
  );
}

function CheckInPanel({ address }: { address?: string }) {
  const [s, setS] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const q = address ? `?address=${encodeURIComponent(address)}` : "";
      const r = await fetch(`/api/checkin${q}`);
      if (r.ok) {
        const d = await r.json();
        setS(d);
      }
    } catch {
      /* fallback */
    }
  }, [address]);

  useEffect(() => {
    load();
  }, [load]);

  async function claim() {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.status === 409) {
        setS((prev: any) => prev ? { ...prev, checkedToday: true } : { checkedToday: true, streak: 1, total: 1, month: new Date().toISOString().slice(0, 7), monthDays: [new Date().toISOString().slice(0, 10)] });
        return;
      }
      if (!r.ok) throw new Error((d as any).error || "Check-in failed");
      setS(d);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Check-in failed");
    } finally {
      setBusy(false);
    }
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const curMonth = s?.month || todayStr.slice(0, 7);
  const [y, m] = String(curMonth).split("-").map(Number);
  const dim = y && m ? new Date(y, m, 0).getDate() : 30;
  const hit = new Set<string>(s?.monthDays ?? []);

  return (
    <div className="card rounded-3xl p-4 border border-[var(--line)] bg-[var(--surface)]">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="caps text-[9px] font-bold tracking-widest text-[var(--gold)] flex items-center gap-1.5">
          <Calendar size={12} /> Daily Check-In & Streak
        </p>
        <span className="text-[10px] text-[var(--ink3)]">{curMonth}</span>
      </div>

      <div className="ledger-entry !border-b-0 !pb-1 !px-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="figure text-[16px] font-extrabold text-[var(--ink)]">
              {s?.streak ?? 0}
              <span className="text-[11px] font-bold text-[var(--gold)]"> day streak</span>
            </p>
            <p className="marginalia mt-0.5 text-[10.5px]">
              {s?.total ?? 0} total check-ins · +1 NIM reward
            </p>
          </div>
          <button
            onClick={claim}
            disabled={busy || s?.checkedToday}
            className="press rounded-xl px-4 py-2.5 text-[12px] font-bold disabled:opacity-50"
          >
            {s?.checkedToday ? "Checked in ✓" : busy ? "Claiming…" : "Check in · +1 NIM"}
          </button>
        </div>
        {err ? <p className="mt-1.5 text-[11px] text-[var(--wax)]">{err}</p> : null}

        {dim > 0 && (
          <div className="mt-3 grid grid-cols-7 gap-1">
            {Array.from({ length: dim }, (_, i) => {
              const day = `${curMonth}-${String(i + 1).padStart(2, "0")}`;
              const done = hit.has(day) || (s?.checkedToday && day === todayStr);
              const isToday = day === todayStr;
              return (
                <div
                  key={day}
                  title={day}
                  className="flex aspect-square items-center justify-center rounded-md text-[8px] font-semibold transition-all"
                  style={{
                    border: isToday ? "1.5px solid var(--gold)" : "1px solid var(--line)",
                    background: done ? "var(--verdigris)" : "transparent",
                    color: done ? "#0c0a07" : "var(--ink3)",
                  }}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ReferralPanel({ address }: { address?: string }) {
  const [code, setCode] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const q = address ? `?address=${encodeURIComponent(address)}` : "";
    fetch(`/api/referral${q}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.code) {
          setCode(d.code);
          setLink(d.link || `${window.location.origin}/?ref=${d.code}`);
        }
      })
      .catch(() => {});
  }, [address]);

  async function generateLink() {
    setBusy(true);
    try {
      const r = await fetch("/api/referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      if (r.ok) {
        const d = await r.json();
        setCode(d.code);
        setLink(d.link || `${window.location.origin}/?ref=${d.code}`);
      } else {
        const fallbackCode = (address || "NIMIQ").replace(/[^A-Za-z0-9]/g, "").slice(2, 8);
        setCode(fallbackCode);
        setLink(`${window.location.origin}/?ref=${fallbackCode}`);
      }
    } catch {
      const fallbackCode = (address || "NIMIQ").replace(/[^A-Za-z0-9]/g, "").slice(2, 8);
      setCode(fallbackCode);
      setLink(`${window.location.origin}/?ref=${fallbackCode}`);
    } finally {
      setBusy(false);
    }
  }

  function copyLink() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card rounded-3xl p-5 border border-[var(--line)] bg-[var(--surface)] space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-[var(--ink)] flex items-center gap-2">
            <Share2 size={16} className="text-[var(--gold)]" /> Referral Program
          </h4>
          <p className="marginalia text-[11px] mt-1 text-[var(--ink3)]">
            Invite peers to borrow or complete challenges. You earn <strong className="text-[var(--gold)]">10 NIM</strong> for every act they settle.
          </p>
        </div>
      </div>

      {link ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-xl bg-[var(--bg)] p-2.5 border border-[var(--line)]">
            <span className="truncate font-mono text-[11px] text-[var(--gold2)] flex-1 select-all">
              {link}
            </span>
            <button
              onClick={copyLink}
              className="press flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-bold"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[var(--ink3)] px-1">
            <span>Referral Code: <strong className="font-mono text-[var(--ink)]">{code}</strong></span>
            <span className="text-[var(--verdigris)]">Active & ready</span>
          </div>
        </div>
      ) : (
        <button
          onClick={generateLink}
          disabled={busy}
          className="press w-full rounded-xl py-3 text-[12px] font-bold flex items-center justify-center gap-2"
        >
          {busy ? "Generating Link…" : "Create My Referral Link"}
        </button>
      )}
    </div>
  );
}

function makeDefaultMe(addr?: string | null) {
  const address = addr || "";
  const now = Date.now();
  const day = 24 * 3600 * 1000;
  return {
    address,
    trustScore: 0,
    joinedAt: now,
    streak: {
      current: 0,
      week: Array.from({ length: 7 }, (_, i) => ({
        day: now - (6 - i) * day,
        settled: 0,
      })),
    },
    escrows: {
      inProgress: [],
      awaitingMe: [],
      settled: [],
      refunded: [],
    },
    listings: {
      active: [],
      expired: [],
      past: [],
    },
    acts: [],
    totals: {
      settledCount: 0,
      settledVolume: 0,
    },
  };
}

export default function PassportDashboard({
  address,
  isConnected,
  onSignIn,
}: {
  address?: string | null;
  isConnected?: boolean;
  onSignIn?: () => Promise<boolean>;
}) {
  const [me, setMe] = useState<any>(null);
  const [seg, setSeg] = useState<
    "overview" | "trades" | "listings" | "settlements" | "collection" | "referrals"
  >("overview");
  const [signingIn, setSigningIn] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const q = address ? `?address=${encodeURIComponent(address)}` : "";
      const r = await fetch(`/api/me${q}`);
      if (r.ok) {
        const d = await r.json();
        if (d && !d.error) {
          setMe(d);
          return;
        }
      }
    } catch {
      /* fallback below */
    }
    // Fallback so UI never fails
    setMe((prev: any) => prev || makeDefaultMe(address));
  }, [address]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const activeData = me || makeDefaultMe(address);
  const displayAddress = address || activeData.address;
  const tier = trustTier(activeData.trustScore ?? 80);

  const segs = [
    ["overview", "You"],
    ["trades", "Trades"],
    ["listings", "Listings"],
    ["settlements", "Settlements"],
    ["collection", "Stamps"],
    ["referrals", "Referral"],
  ] as const;

  async function handleSignIn() {
    if (!onSignIn) return;
    setSigningIn(true);
    try {
      const ok = await onSignIn();
      if (ok) {
        await loadData();
      }
    } finally {
      setSigningIn(false);
    }
  }

  return (
    <div className="pb-6 space-y-4">
      {/* Identity Folio Card with Avatar */}
      <div className="folio mt-4 flex items-center gap-4 px-5 py-6">
        <Identicon address={displayAddress} size={64} ring={tier.color} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[13px] text-[var(--ink)] font-semibold">
            {displayAddress}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="caps text-[8px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: `color-mix(in srgb, ${tier.color} 15%, transparent)`,
                color: tier.color,
                border: `1px solid color-mix(in srgb, ${tier.color} 30%, transparent)`,
              }}
            >
              {tier.name} · trust {activeData.trustScore}
            </span>
            {!isConnected && onSignIn && (
              <button
                onClick={handleSignIn}
                disabled={signingIn}
                className="press rounded-md px-2 py-0.5 text-[9px] font-bold flex items-center gap-1"
              >
                <LogIn size={10} />
                {signingIn ? "Signing…" : "Sign In"}
              </button>
            )}
          </div>
          <div className="mt-2.5 flex gap-3">
            <div>
              <p className="figure text-[15px] font-extrabold text-[var(--ink)]">
                {activeData.totals?.settledCount ?? 0}
              </p>
              <p className="caps text-[6.5px] text-[var(--ink3)]">acts</p>
            </div>
            <div>
              <p className="figure text-[15px] font-extrabold text-[var(--gold2)]">
                {Math.round(activeData.totals?.settledVolume ?? 0).toLocaleString()}
              </p>
              <p className="caps text-[6.5px] text-[var(--ink3)]">NIM settled</p>
            </div>
            <div>
              <p className="figure text-[15px] font-extrabold text-[var(--verdigris)]">
                {activeData.streak?.current ?? 0}/7
              </p>
              <p className="caps text-[6.5px] text-[var(--ink3)]">streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Week streak dots */}
      <div className="mt-2 flex justify-between gap-1.5 px-4">
        {(activeData.streak?.week ?? []).map((d: any, i: number) => (
          <div key={i} className="flex-1">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{
                background: d.settled > 0 ? "var(--verdigris)" : "var(--bg3)",
                boxShadow: d.settled > 0 ? "0 0 8px rgba(98,178,147,0.4)" : undefined,
              }}
            />
            <p className="figure mt-1 text-center text-[8px] text-[var(--ink3)]">
              {d.settled ?? 0}
            </p>
          </div>
        ))}
      </div>

      {/* 3+ Tabs Navigation Bar */}
      <div className="mb-2 mt-4 flex gap-1 overflow-x-auto no-scrollbar border-y border-[var(--line)] bg-[color-mix(in_srgb,var(--ink)_4%,transparent)] px-2 py-1.5">
        {segs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSeg(id)}
            className="caps flex-1 whitespace-nowrap rounded-full px-3 py-2 text-[8px] transition-all"
            style={
              seg === id
                ? { background: "var(--gold)", color: "#241a08", fontWeight: 700 }
                : { color: "var(--ink3)" }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {seg === "overview" && (
        <div className="px-4 animate-fade-in space-y-4">
          <CheckInPanel address={displayAddress} />
          <div className="rule my-3" aria-hidden>
            <span className="font-display text-[10px] text-[var(--gold)]">❦</span>
          </div>
          <p className="marginalia text-[11.5px]">
            Member {activeData.joinedAt ? formatDistanceToNow(activeData.joinedAt, { addSuffix: false }) : "recently"}.
            Every settled act strengthens your reputation and lowers future collateral requirements.
          </p>

          {activeData.escrows?.awaitingMe?.length > 0 && (
            <div className="space-y-2">
              <p className="caps flex items-center gap-1.5 text-[8px] text-[var(--gold)]">
                <InboxIcon size={10} /> Awaiting your approval ({activeData.escrows.awaitingMe.length})
              </p>
              {activeData.escrows.awaitingMe.map((s: any) => (
                <Row
                  key={s.id}
                  title={s.title || "Challenge Submission"}
                  right="review"
                  sub={`from ${String(s.completer).slice(0, 12)}… · ${formatDistanceToNow(Number(s.created_at || Date.now()), { addSuffix: true })}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Trades & Borrows */}
      {seg === "trades" && (
        <div className="px-4 animate-fade-in space-y-3">
          {activeData.escrows?.inProgress?.length > 0 && (
            <div>
              <p className="caps mb-1.5 text-[8px] text-[var(--gold)] flex items-center gap-1">
                <Lock size={10} /> In Progress ({activeData.escrows.inProgress.length})
              </p>
              {activeData.escrows.inProgress.map((e: any) => (
                <Row
                  key={e.id}
                  title={String(e.listingId).slice(0, 24)}
                  right={`${e.amountNIM?.toLocaleString()} NIM`}
                  sub={`${e.role} · ${e.deadlineAt ? "deadline " + formatDistanceToNow(e.deadlineAt, { addSuffix: true }) : "open"}`}
                  tx={e.txIn}
                />
              ))}
            </div>
          )}

          {activeData.escrows?.settled?.length > 0 ? (
            <div>
              <p className="caps mb-1.5 text-[8px] text-[var(--verdigris)] flex items-center gap-1">
                <ShieldCheck size={10} /> Settled Trades ({activeData.escrows.settled.length})
              </p>
              {activeData.escrows.settled.map((e: any) => (
                <Row
                  key={e.id}
                  title={String(e.listingId).slice(0, 24)}
                  right={`${e.amountNIM?.toLocaleString()} NIM`}
                  sub={`${e.role} · settled`}
                  tx={e.txOut}
                />
              ))}
            </div>
          ) : (
            <p className="marginalia py-6 text-center text-[12px]">
              No settled trades yet — borrow an item or complete a quest to start your trading log.
            </p>
          )}

          {activeData.escrows?.refunded?.length > 0 && (
            <div>
              <p className="caps mb-1.5 flex items-center gap-1.5 text-[8px] text-[var(--wax)]">
                <Hourglass size={10} /> Refunds ({activeData.escrows.refunded.length})
              </p>
              {activeData.escrows.refunded.map((e: any) => (
                <Row
                  key={e.id}
                  title={String(e.listingId).slice(0, 24)}
                  right={`${e.amountNIM?.toLocaleString()} NIM`}
                  sub="returned to vault origin"
                  tx={e.txOut}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Listings */}
      {seg === "listings" && (
        <div className="px-4 animate-fade-in space-y-3">
          {([
            ["active", "Open Listings"],
            ["past", "Past Completed"],
            ["expired", "Expired"],
          ] as const).map(([key, label]) => {
            const list = activeData.listings?.[key] ?? [];
            if (list.length === 0) return null;
            return (
              <div key={key}>
                <p className="caps mb-1.5 text-[8px] text-[var(--ink3)]">
                  {label} ({list.length})
                </p>
                {list.map((l: any) => {
                  const chip = STATE_CHIP[l.state] ?? STATE_CHIP.complete;
                  return (
                    <div key={l.id} className="mb-2">
                      <Row
                        title={l.title}
                        right={`${l.collateralNIM?.toLocaleString()} NIM`}
                        sub={`${formatDistanceToNow(l.createdAt || Date.now(), { addSuffix: true })} · ${chip.label}`}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
          {(!activeData.listings?.active?.length &&
            !activeData.listings?.past?.length &&
            !activeData.listings?.expired?.length) && (
            <p className="marginalia py-6 text-center text-[12px]">
              You haven't listed any items or quests yet. Tap "List Item" to sponsor equipment or bounties.
            </p>
          )}
        </div>
      )}

      {/* Tab 4: Settlements & Acts History */}
      {seg === "settlements" && (
        <div className="px-4 animate-fade-in space-y-2">
          {(!activeData.acts || activeData.acts.length === 0) ? (
            <p className="marginalia py-6 text-center text-[12px]">
              No settled acts yet — your first on-chain return or quest settlement writes the opening line.
            </p>
          ) : (
            activeData.acts.map((a: any) => (
              <Row
                key={a.id}
                title={String(a.type).replace(/_/g, " ").toUpperCase()}
                right={`+${a.amountNIM} NIM`}
                sub={`${a.oracle} oracle · ${formatDistanceToNow(a.createdAt || Date.now(), { addSuffix: true })}`}
                tx={a.txHash}
              />
            ))
          )}
        </div>
      )}

      {/* Tab 5: Stamps & Badges */}
      {seg === "collection" && (
        <div className="px-4 animate-fade-in">
          <Stamps initialActs={activeData.acts} address={displayAddress} />
          <p className="marginalia mt-3 text-[11px]">
            Stamps and milestone badges are minted by settling acts and verifying physical custody with Nimiq Pay.
          </p>
        </div>
      )}

      {/* Tab 6: Referral System */}
      {seg === "referrals" && (
        <div className="px-4 animate-fade-in">
          <ReferralPanel address={displayAddress} />
        </div>
      )}
    </div>
  );
}
