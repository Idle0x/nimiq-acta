"use client";
import { useEffect, useState } from "react";
import { UserCheck, ExternalLink, Loader2 } from "lucide-react";

// Renders in the Active tab for creators: pending Venture submissions
// awaiting your approval. Approving triggers the real vault payout.
export default function CreatorApprovals({ onApproved }: { onApproved?: () => void }) {
  const [subs, setSubs] = useState<any[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/bounty/submit");
      const data = await res.json();
      if (res.ok) setSubs(data.submissions ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function approve(sub: any) {
    setBusy(sub.id);
    try {
      const res = await fetch("/api/bounty/manual_approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: sub.listingId, completerAddress: sub.completer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval failed");
      setSubs((p) => p.filter((s) => s.id !== sub.id));
      onApproved?.();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Approval failed");
    } finally {
      setBusy(null);
    }
  }

  if (loading || subs.length === 0) return null;

  return (
    <div className="card rounded-2xl p-4 border border-sky-500/20 bg-sky-950/20 mb-4">
      <h4 className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-3 flex items-center gap-2">
        <UserCheck size={14} /> Awaiting Your Approval ({subs.length})
      </h4>
      <div className="space-y-3">
        {subs.map((s) => (
          <div key={s.id} className="rounded-xl bg-slate-950/60 border border-white/10 p-3">
            <p className="text-sm font-bold text-white">{s.title}</p>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">from {s.completer.slice(0, 16)}...</p>
            <p className="text-xs text-slate-300 mt-2 break-all bg-black/40 rounded-lg p-2 border border-white/5">{s.proof}</p>
            <button
              onClick={() => approve(s)}
              disabled={busy === s.id}
              className="mt-3 w-full py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-lg text-xs font-bold btn-press flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {busy === s.id ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
              Approve & Release Reward
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
