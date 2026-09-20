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

  const [claimCode, setClaimCode] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  async function handleClaim() {
    if (!claimCode.trim()) return;
    setClaiming(true);
    try {
      const res = await fetch("/api/referral/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: claimCode.trim(), address }),
      });
      const d = await res.json();
      if (res.ok) {
        setClaimed(true);
        toast({ type: "success", title: "10 NIM Claimed!", body: "Referral reward sent immediately from the treasury." });
      } else {
        toast({ type: "error", title: "Claim failed", body: d?.error || "Could not claim code" });
      }
    } catch {
      toast({ type: "error", title: "Network error", body: "Failed to connect to referral treasury." });
    } finally {
      setClaiming(false);
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

        <h3 className="font-display text-xl font-semibold text-[var(--ink)]">You both earn 10 NIM.</h3>
        <p className="marginalia mt-1.5 text-[12.5px]">
          Share your link or code. The treasury immediately drips 10 NIM to each of you upon joining, recorded on the Nimiq ledger.
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

        {/* Claim friend's code */}
        <div className="mt-5 pt-4 border-t border-[var(--line)] space-y-2">
          <p className="caps text-[9px] text-[var(--gold)]">Have a friend's referral code?</p>
          {claimed ? (
            <div className="rounded-xl bg-[color-mix(in_srgb,var(--verdigris)_15%,transparent)] border border-[var(--verdigris)]/40 p-2.5 text-center text-xs text-[var(--verdigris)] font-semibold">
              ✓ 10 NIM Referral Bonus Claimed!
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                placeholder="Enter Code (e.g. 7A1F2C)"
                className="flex-1 rounded-xl bg-black/40 border border-[var(--line)] px-3 py-2 text-xs font-mono tracking-wider uppercase text-[var(--ink)] placeholder:text-[var(--ink3)]/50 focus:border-[var(--gold)] outline-none"
              />
              <button
                onClick={handleClaim}
                disabled={claiming || !claimCode.trim()}
                className="press rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap"
              >
                {claiming ? "Claiming…" : "Claim 10 NIM"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
