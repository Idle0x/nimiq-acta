"use client";
import { useEffect, useState } from "react";
import { X, Share2, Copy, Users } from "lucide-react";
import { useToast } from "./Feedback";

export default function ReferralSheet({ open, onClose, address }: { open: boolean; onClose: () => void; address?: string | null }) {
  const toast = useToast();
  const [link, setLink] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFailed(false);
    setLink(null);
    fetch("/api/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: address || undefined }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.link) setLink(d.link);
        else setFailed(true);
      })
      .catch(() => setFailed(true));
  }, [open, address]);

  if (!open) return null;

  async function share() {
    if (!link) return;
    const text = "Reality pays on Acta — borrow, quest and earn NIM. Join with my link:";
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as any).share({ title: "Acta", text, url: link });
        return;
      } catch { /* user cancelled — fall through to copy */ }
    }
    await copy();
  }

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast({ type: "success", title: "Link copied", body: "Send it anywhere — rewards settle on-chain." });
    } catch {
      toast({ type: "error", title: "Copy failed", body: link });
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 backdrop-blur-sm animate-fade-in sm:items-center" onClick={onClose}>
      <div className="plate w-full max-w-[480px] rounded-t-3xl p-6 pb-8 animate-slide-up sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <p className="caps flex items-center gap-2 text-[9px] text-[var(--ink2)]">
            <Users size={12} className="text-[var(--verdigris)]" /> Bring a friend
          </p>
          <button onClick={onClose} className="ghost rounded-full p-1.5"><X size={13} /></button>
        </div>

        <h3 className="font-display text-xl font-semibold text-[var(--ink)]">You both earn 30 NIM.</h3>
        <p className="marginalia mt-1.5 text-[12.5px]">
          When their first act settles, the treasury drips 30 NIM to each of you — recorded in the act ledger.
        </p>

        <div className="mt-4 rounded-xl border border-[var(--line2)] bg-black/30 p-3">
          <p className="truncate font-mono text-[11px] text-[var(--ink2)]">{
            link ?? (failed ? "Sign in and connect the database to mint your link." : "Preparing your link…")
          }</p>
        </div>

        <div className="mt-3 flex gap-2">
          <button onClick={share} disabled={!link} className="press flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold">
            <Share2 size={14} /> Share
          </button>
          <button onClick={copy} disabled={!link} className="ghost flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[13px]">
            <Copy size={14} /> Copy link
          </button>
        </div>
      </div>
    </div>
  );
}
