"use client";
import { useEffect, useState } from "react";
import { X, Lock, ShieldAlert } from "lucide-react";
import ProfileCard from "./ProfileCard";
import ContractTimeline from "./ContractTimeline";
import { protocolNotes, hoursLabel, type ListingContract } from "@/lib/contract";
import { trustTier } from "./AppChrome";
import { useToast } from "./Feedback";

function OwnerControls({ listingId, hasLocks, onDone }: { listingId: string; hasLocks: boolean; onDone: () => void }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  async function act(mode?: "close") {
    setBusy(true);
    try {
      const res = await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "listing", id: listingId, ...(mode ? { mode } : {}) }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((d as any).error || "Action failed");
      toast({ type: "success", title: mode === "close" ? "Closed to new accepts" : "Listing cancelled — refunded in full" });
      onDone();
    } catch (e) {
      toast({ type: "error", title: e instanceof Error ? e.message : "Action failed" });
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-3 flex gap-2">
      {hasLocks ? (
        <button onClick={() => act("close")} disabled={busy}
          className="ghost flex-1 rounded-xl py-2.5 text-[12px] font-semibold text-[var(--gold)] disabled:opacity-50">
          {busy ? "Closing…" : "Close to new accepts"}
        </button>
      ) : (
        <button onClick={() => act()} disabled={busy}
          className="ghost flex-1 rounded-xl py-2.5 text-[12px] font-semibold text-[var(--wax)] disabled:opacity-50">
          {busy ? "Cancelling…" : "Cancel — full refund"}
        </button>
      )}
    </div>
  );
}

const REPORT_REASONS = [
  ["scam", "Scam or fraud"],
  ["unfunded", "Reward not actually locked"],
  ["abusive", "Abusive content"],
  ["miscategorized", "Wrong type / misleading"],
  ["other", "Something else"],
] as const;

function ReportControl({ listingId, isOwner }: { listingId: string; isOwner: boolean }) {
  const toast = useToast();
  const [count, setCount] = useState(0);
  const [mine, setMine] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<Record<string, number>>({});
  const [reason, setReason] = useState<string>("scam");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch(`/api/reports?listingId=${listingId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setCount(Number(d.count ?? 0));
          setMine((d.mine as string) ?? null);
          setBreakdown((d.breakdown ?? {}) as Record<string, number>);
        }
      })
      .catch(() => {});
  }, [listingId]);
  async function submit() {
    setBusy(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, reason }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((d as any).error || "Report failed");
      setMine(reason);
      setCount((c) => (mine ? c : c + 1));
      toast({ type: "success", title: "Reported for review", body: "Reputation, not deletion: the record stands while this is reviewed." });
    } catch (e) {
      toast({ type: "error", title: e instanceof Error ? e.message : "Report failed" });
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mt-4 flex items-center gap-2">
      {mine ? (
        <p className="marginalia text-[11px]">You flagged this ({mine}) — thanks, it is in the review queue.</p>
      ) : (
        <>
          <select value={reason} onChange={(e) => setReason(e.target.value)}
            className="flex-1 rounded-xl border border-[var(--line)] bg-transparent px-2.5 py-2 text-[11.5px] text-[var(--ink2)]">
            {REPORT_REASONS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
          <button onClick={submit} disabled={busy}
            className="ghost rounded-xl px-3.5 py-2 text-[11.5px] disabled:opacity-50">
            {busy ? "Flagging…" : "Flag"}
          </button>
        </>
      )}
      {isOwner && count > 0 && (
        <span className="chip flex-none" style={{ color: "var(--wax)", borderColor: "color-mix(in srgb, var(--wax) 40%, transparent)" }}
          title={Object.entries(breakdown).map(([k, v]) => `${k} ×${v}`).join(", ")}>
          {count} report{count === 1 ? "" : "s"}{Object.keys(breakdown).length > 0 ? `: ${Object.entries(breakdown).map(([k, v]) => `${k}×${v}`).join(" ")}` : ""}
        </span>
      )}
    </div>
  );
}

export default function ListingDetailSheet({
  listingId,
  viewerTrust = 0,
  onAccept,
  onClose,
}: {
  listingId: string | null;
  viewerTrust?: number;
  onAccept: (l: any) => void;
  onClose: () => void;
}) {
  const toast = useToast();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!listingId) return;
    setLoading(true);
    setData(null);
    fetch(`/api/listings/${listingId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [listingId]);

  if (!listingId) return null;
  const l = data?.listing;
  const contract: ListingContract | null = l?.contract ?? null;
  const notes = l ? protocolNotes(l, contract) : [];
  const lockedOut = Boolean(contract && contract.minTrust > viewerTrust && !data?.viewer?.isOwner);

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/75 backdrop-blur-sm animate-fade-in sm:items-center" onClick={onClose}>
      <div
        className="floaty flex max-h-[88dvh] w-full max-w-[480px] flex-col rounded-t-3xl animate-slide-up sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] p-4">
          <p className="caps text-[9px] text-[var(--gold)]">The Contract</p>
          <button onClick={onClose} className="ghost rounded-full p-1.5"><X size={14} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading || !l ? (
            <div className="space-y-3">
              <div className="skeleton h-8 w-2/3" />
              <div className="skeleton h-24" />
              <div className="skeleton h-40" />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-xl font-semibold leading-tight text-[var(--ink)]">{l.title}</h2>
                <p className="figure flex-none text-xl font-extrabold text-[var(--gold2)]">
                  {l.collateralNIM.toLocaleString()} <span className="text-xs">NIM</span>
                </p>
              </div>

              {/* who you're dealing with */}
              <p className="caps mb-2 mt-5 text-[8px] text-[var(--ink3)]">The sponsor</p>
              <ProfileCard {...data.sponsor} />

              {/* the requirements, verbatim */}
              {contract?.criteria ? (
                <>
                  <p className="caps mb-2 mt-5 text-[8px] text-[var(--ink3)]">What the proof must show</p>
                  <blockquote className="font-serif rounded-xl border-l-2 border-[var(--gold)] bg-black/25 p-3 text-[13.5px] italic leading-relaxed text-[var(--ink2)]">
                    “{contract.criteria}”
                  </blockquote>
                </>
              ) : l.description ? (
                <>
                  <p className="caps mb-2 mt-5 text-[8px] text-[var(--ink3)]">From the sponsor</p>
                  <blockquote className="font-serif rounded-xl border-l-2 border-[var(--gold)] bg-black/25 p-3 text-[13.5px] italic leading-relaxed text-[var(--ink2)]">
                    “{l.description}”
                  </blockquote>
                </>
              ) : null}

              {/* the rules */}
              <p className="caps mb-2 mt-5 text-[8px] text-[var(--ink3)]">The rules</p>
              <div className="plate rounded-2xl p-3.5">
                <ul className="space-y-2">
                  {notes.map((n, i) => (
                    <li key={i} className="flex gap-2 text-[12px] leading-snug text-[var(--ink2)]">
                      <span className="mt-[5px] h-1 w-1 flex-none rotate-45 bg-[var(--gold)]" />
                      {n}
                    </li>
                  ))}
                </ul>
              </div>

              {/* your relationship to this contract */}
              {data.viewer?.escrow ? (
                <>
                  <p className="caps mb-2 mt-5 text-[8px] text-[var(--ink3)]">Your position</p>
                  <ContractTimeline escrow={{ ...data.viewer.escrow, amountNIM: l.collateralNIM }} />
                </>
              ) : data.viewer?.isOwner ? (
                <div className="plate mt-5 rounded-2xl p-3.5">
                  <p className="text-[12.5px] font-semibold text-[var(--ink)]">This is your listing.</p>
                  <p className="marginalia mt-1 text-[11.5px]">
                    {data.viewer.activeParticipants > 0
                      ? `${data.viewer.activeParticipants} participant(s) currently hold a lock. You can close it to new accepts, but active contracts run to completion.`
                      : "Nothing is locked against it yet — you can cancel for a full vault refund."}
                  </p>
                  <OwnerControls
                    listingId={String(l.id)}
                    hasLocks={Number(data.viewer.activeParticipants) > 0}
                    onDone={onClose}
                  />
                </div>
              ) : null}

              <ReportControl listingId={String(l.id)} isOwner={Boolean(data.viewer?.isOwner)} />

              {lockedOut && (
                <div className="mt-5 flex items-start gap-2.5 rounded-2xl p-3.5" style={{ background: "var(--wax-dim)", border: "1px solid color-mix(in srgb, var(--wax) 35%, transparent)" }}>
                  <ShieldAlert size={15} className="mt-0.5 flex-none text-[var(--wax)]" />
                  <p className="text-[12px] leading-snug text-[var(--ink2)]">
                    This contract asks for trust ≥ {contract!.minTrust} (you're at {viewerTrust},{" "}
                    {trustTier(viewerTrust).name.toLowerCase()}). Settle a few acts to unlock it.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {l && !data.viewer?.escrow && !data.viewer?.isOwner && (
          <div className="border-t border-[var(--line)] p-4">
            <p className="marginalia mb-2.5 text-center text-[11px]">
              {(() => {
                const oracle = { vision: "AI photo judge", qr: "signed QR scan", geo: "GPS check-in", creator: "sponsor approval" } as Record<string, string>;
                const o = (contract && (contract as any).ai?.primary) || "vision";
                const win = contract?.deadlineHours ? `${contract.deadlineHours}h to complete after accepting` : "complete before the deadline";
                return `Locks ${l.collateralNIM.toLocaleString()} NIM · ${win} · judged by ${oracle[o] ?? o}.`;
              })()}
            </p>
            <button
              disabled={lockedOut}
              onClick={() => { onAccept(l); onClose(); }}
              className="press flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-[14px] font-bold"
            >
              <Lock size={14} /> Accept & lock {l.collateralNIM.toLocaleString()} NIM
            </button>
            <p className="marginalia mt-2 text-center text-[11px]">
              One signature in Nimiq Pay. The funds move to the vault, not to the sponsor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
