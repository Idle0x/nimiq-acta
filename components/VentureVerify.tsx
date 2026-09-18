"use client";
import { useState } from "react";
import { Send, Check, Loader2, AlertTriangle } from "lucide-react";
import { humanize } from "@/lib/errors";

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
      setError(humanize(e));
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="mt-3 rounded-xl border border-[var(--verdigris)]/30 bg-[var(--verdigris)]/30 p-3 text-center text-[var(--verdigris)] animate-fade-in flex items-center justify-center gap-2">
        <Check size={16} /> <span className="text-xs">Proof recorded. The creator has been notified.</span>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-[var(--line)]/10 bg-[var(--bg)]/60 p-3">
      <p className="text-xs text-[var(--ink3)] mb-2">Submit your proof (link, description, evidence):</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          placeholder="https://... or describe what you did"
          className="flex-1 bg-[var(--surface)] border border-[var(--line)]/10 rounded-lg px-3 py-2 text-xs text-[var(--ink)] focus:border-[var(--gold)] focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!proof.trim() || busy}
          className="bg-[var(--gold)] text-[#1c1508] px-3 rounded-lg font-bold disabled:opacity-50 btn-press flex items-center justify-center w-10"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
      {error && (
        <div className="mt-2 flex items-center gap-2 text-[var(--wax)] text-xs">
          <AlertTriangle size={12} /> {error}
        </div>
      )}
    </div>
  );
}
