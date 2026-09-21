"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Share2, Copy, Users, Check } from "lucide-react";
import { useToast } from "./Feedback";

export default function ReferralSheet({
  open,
  onClose,
  address,
}: {
  open: boolean;
  onClose: () => void;
  address?: string | null;
}) {
  const toastContext = useToast();
  const [mounted, setMounted] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [claimCode, setClaimCode] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [claimedReferrerCode, setClaimedReferrerCode] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (t: { type: "success" | "error" | "info"; title: string; body?: string }) => {
    try {
      if (typeof toastContext === "function") {
        toastContext(t);
      } else if (toastContext && typeof (toastContext as any).push === "function") {
        (toastContext as any).push(t);
      } else if (toastContext && typeof (toastContext as any).toast === "function") {
        (toastContext as any).toast(t.title, t.type);
      }
    } catch {
      // safe fallback
    }
  };

  useEffect(() => {
    if (!open) return;
    setFailed(false);
    setLink(null);

    const fallbackCode = (address || "NIMIQ").replace(/[^A-Za-z0-9]/g, "").slice(2, 8).toUpperCase();
    const fallbackLink = typeof window !== "undefined" ? `${window.location.origin}/?ref=${fallbackCode}` : null;

    const q = address ? `?address=${encodeURIComponent(address)}` : "";
    fetch(`/api/referral${q}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.code) {
          setCode(d.code);
        }
        if (d?.link) {
          setLink(d.link);
        } else if (d?.code && typeof window !== "undefined") {
          setLink(`${window.location.origin}/?ref=${d.code}`);
        } else if (fallbackLink) {
          setLink(fallbackLink);
        } else {
          setFailed(true);
        }

        if (typeof d?.alreadyClaimed === "boolean") {
          setAlreadyClaimed(d.alreadyClaimed);
        }
        if (d?.claimedReferrerCode) {
          setClaimedReferrerCode(d.claimedReferrerCode);
        }
      })
      .catch(() => {
        if (fallbackLink) setLink(fallbackLink);
        else setFailed(true);
      });
  }, [open, address]);

  async function share() {
    if (!link) return;
    const text = "Reality pays on Acta — borrow, quest and earn NIM. Join with my link:";
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await (navigator as any).share({ title: "Acta Protocol", text, url: link });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    await copy();
  }

  async function copy() {
    if (!link) return;
    try {
      if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else if (typeof document !== "undefined") {
        const ta = document.createElement("textarea");
        ta.value = link;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      showToast({ type: "success", title: "Link copied!", body: "Share with peers — both wallets earn 10 NIM." });
    } catch {
      showToast({ type: "error", title: "Copy failed", body: link });
    }
  }

  async function handleClaim() {
    const trimmed = claimCode.trim().toUpperCase();
    if (!trimmed) return;
    setClaiming(true);
    try {
      const res = await fetch("/api/referral/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed, address }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setAlreadyClaimed(true);
        setClaimedReferrerCode(trimmed);
        showToast({
          type: "success",
          title: "🎉 10 NIM Claimed!",
          body: "Referral reward sent immediately from the protocol treasury.",
        });
      } else {
        if (d?.error && d.error.includes("already claimed")) {
          setAlreadyClaimed(true);
        }
        showToast({
          type: "error",
          title: "Claim failed",
          body: d?.error || "Could not claim code",
        });
      }
    } catch {
      showToast({
        type: "error",
        title: "Network error",
        body: "Failed to connect to referral treasury.",
      });
    } finally {
      setClaiming(false);
    }
  }

  if (!open || !mounted || typeof document === "undefined") return null;

  const content = (
    <div
      className="theme-ink app-ink fixed inset-0 z-[99999] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-fade-in sm:items-center text-[var(--ink)]"
      onClick={onClose}
    >
      <div
        className="plate app-ink w-full max-w-[480px] rounded-t-3xl p-6 pb-8 animate-slide-up sm:rounded-3xl border border-[rgba(236,226,203,0.16)] bg-[#17140f] text-[#ece2cb] shadow-[0_20px_60px_rgba(0,0,0,0.85)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="caps flex items-center gap-2 text-[9px] text-[#b3a68a] font-semibold">
            <Users size={12} className="text-[var(--verdigris)]" /> Bring a friend
          </p>
          <button
            onClick={onClose}
            className="ghost rounded-full p-1.5 text-[#b3a68a] hover:text-[#ece2cb] transition-colors"
            aria-label="Close"
          >
            <X size={13} />
          </button>
        </div>

        <h3 className="font-display text-xl font-semibold text-[#ece2cb]">You both earn 10 NIM.</h3>
        <p className="marginalia mt-1.5 text-[12.5px] text-[#b3a68a]">
          Share your link or code. The treasury immediately drips 10 NIM to each of you upon joining, recorded on the Nimiq ledger.
        </p>

        <div className="mt-4 rounded-xl border border-[rgba(236,226,203,0.16)] bg-black/50 p-3">
          <p className="truncate font-mono text-[11px] text-[var(--gold2)] select-all">
            {link ?? (failed ? "Connect your wallet to mint your permanent referral code." : "Preparing your link…")}
          </p>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            onClick={share}
            disabled={!link}
            className="press flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[13px] font-bold disabled:opacity-50 text-[#1a1408]"
          >
            <Share2 size={14} /> Share
          </button>
          <button
            onClick={copy}
            disabled={!link}
            className="ghost flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[13px] disabled:opacity-50 text-[#ece2cb] border border-[rgba(236,226,203,0.14)] bg-white/[0.03] hover:bg-white/[0.06]"
          >
            <Copy size={14} /> Copy link
          </button>
        </div>

        {/* Claim friend's code section */}
        <div className="mt-5 pt-4 border-t border-[rgba(236,226,203,0.12)] space-y-2">
          {alreadyClaimed ? (
            <div className="rounded-xl bg-[color-mix(in_srgb,var(--verdigris)_18%,transparent)] border border-[var(--verdigris)]/50 p-3 text-center text-xs text-[var(--verdigris)] font-semibold flex items-center justify-center gap-2 animate-fade-in">
              <Check size={14} />
              <span>
                You have redeemed {claimedReferrerCode ? `code "${claimedReferrerCode}"` : "a referral code"} (+10 NIM received)
              </span>
            </div>
          ) : (
            <>
              <p className="caps text-[9px] text-[var(--gold)] font-bold">Have a friend's referral code?</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                  placeholder="Enter Code (e.g. 7A1F2C)"
                  className="flex-1 rounded-xl bg-black/50 border border-[rgba(236,226,203,0.18)] px-3 py-2 text-xs font-mono tracking-wider uppercase text-[#ece2cb] placeholder:text-[#7c715c]/60 focus:border-[var(--gold)] outline-none"
                />
                <button
                  onClick={handleClaim}
                  disabled={claiming || !claimCode.trim()}
                  className="press rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap disabled:opacity-50 text-[#1a1408]"
                >
                  {claiming ? "Claiming…" : "Claim 10 NIM"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
