"use client";
import { useEffect, useState } from "react";
import { UserCheck, ExternalLink, Loader2 } from "lucide-react";

// Renders in the Active tab for creators: pending Venture submissions
// awaiting your approval. Approving triggers the real vault payout.
export default function CreatorApprovals({ onApproved, onCount, showEmpty, onView }: { onApproved?: () => void; onCount?: (n: number) => void; showEmpty?: boolean; onView?: (address: string) => void }) {
  const [subs, setSubs] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/bounty/submit");
      const data = await res.json();
      if (res.ok) { setSubs(data.submissions ?? []); onCount?.((data.submissions ?? []).length); }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function decide(sub: any, decision?: "reject") {
    setBusy(sub.id);
    try {
      const res = await fetch("/api/bounty/manual_approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: sub.listingId, completerAddress: sub.completer, ...(decision ? { decision } : {}) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Decision failed");
      setSubs((p) => { const nx = p.filter((s) => s.id !== sub.id); onCount?.(nx.length); return nx; });
      onApproved?.();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Decision failed");
    } finally {
      setBusy(null);
    }
  }
  const approve = (sub: any) => decide(sub);

  if (loading) return null;
  if (subs.length === 0) {
    if (!showEmpty) return null;
    return <p className="marginalia py-6 text-center text-[12px]">Nothing awaiting your approval — submissions from your challenges land here.</p>;
  }

  return (
    <div className="card rounded-2xl p-4 border border-[var(--sky)]/20 bg-[var(--sky)]/20 mb-4">
      <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--sky)] mb-3 flex items-center gap-2">
        <UserCheck size={14} /> Awaiting Your Approval ({subs.length})
      </h4>
      <div className="space-y-3">
        {subs.map((s) => (
          <div key={s.id} className="rounded-xl bg-[var(--bg)]/60 border border-[var(--line)]/10 p-3">
            <p className="text-sm font-bold text-[var(--ink)]">{s.title}</p>
            <button onClick={() => onView?.(s.completer)} className="mt-0.5 font-mono text-[10px] text-[var(--sky)] hover:underline">from {s.completer.slice(0, 16)}… · view record</button>
            {s.recommendation ? (
              <p className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${s.recommendation === "approve" ? "bg-[var(--verdigris)]/15 text-[var(--verdigris)]" : s.recommendation === "reject" ? "bg-[var(--wax)]/15 text-[var(--wax)]" : "bg-[var(--gold)]/15 text-[var(--gold)]"}`}>
                AI recommends {s.recommendation}{typeof s.confidence === "number" ? ` · ${s.confidence}%` : ""}{s.reason ? ` — ${s.reason}` : ""}
              </p>
            ) : null}
            <p className="text-xs text-[var(--ink2)] mt-2 break-all bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] rounded-lg p-2 border border-[var(--line)]/5">{s.proof}</p>
            <div className="mt-3 flex gap-2">
            <button
              onClick={() => approve(s)}
              disabled={busy === s.id}
              className="flex-1 py-2 bg-[var(--verdigris)] hover:bg-[var(--verdigris)] text-[#1c1508] rounded-lg text-xs font-bold btn-press flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {busy === s.id ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
              Approve & Release
            </button>
              <button
                onClick={() => { if (confirm("Reject this submission? Their lock stands; they can refine and resubmit.")) decide(s, "reject"); }}
                disabled={busy === s.id}
                className="ghost rounded-lg px-3.5 py-2 text-xs font-semibold text-[var(--wax)] disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
