"use client";
import { useState } from "react";
import { Send, Check, Loader2 } from "lucide-react";

export default function VentureVerify({ listingId }: { listingId: string }) {
  const [proof, setProof] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit() {
    if (!proof) return;
    setBusy(true);
    // In a real app, this would submit the proof to the server for creator review.
    // For now, we simulate submission recording.
    setTimeout(() => {
      setBusy(false);
      setSubmitted(true);
    }, 1200);
  }

  if (submitted) {
    return (
      <div className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-3 text-center text-emerald-200 animate-fade-in flex items-center justify-center gap-2">
        <Check size={16} /> <span className="text-xs">Proof recorded. Awaiting creator approval.</span>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/60 p-3">
      <p className="text-xs text-slate-400 mb-2">Submit your proof (link, text, etc.):</p>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          placeholder="https://..." 
          className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-amber-300 focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!proof || busy}
          className="bg-amber-400 text-slate-950 px-3 rounded-lg font-bold disabled:opacity-50 btn-press flex items-center justify-center w-10"
        >
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
    </div>
  );
}
