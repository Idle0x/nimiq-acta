"use client";
import { useState } from "react";
import { Send, Check, Loader2, AlertTriangle } from "lucide-react";

// REAL submission: stores the proof server-side for the creator to approve.
export default function VentureVerify({ listingId }: { listingId: string }) {
  const [proof, setProof] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!proof.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/bounty/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, proof: proof.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-center text-emerald-200 animate-fade-in flex items-center justify-center gap-2">
        <Check size={16} /> <span className="text-xs">Proof recorded. The creator has been notified.</span>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/60 p-3">
      <p className="text-xs text-slate-400 mb-2">Submit your proof (link, description, evidence):</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          placeholder="https://... or describe what you did"
          className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-amber-300 focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!proof.trim() || busy}
          className="bg-amber-400 text-slate-950 px-3 rounded-lg font-bold disabled:opacity-50 btn-press flex items-center justify-center w-10"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-2 text-rose-400 text-xs">
          <AlertTriangle size={12} /> {error}
        </div>
      )}
    </div>
  );
}
