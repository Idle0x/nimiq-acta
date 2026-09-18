"use client";

import { useState } from "react";
import { Lock, Clock, X } from "lucide-react";
import {
  ESCROW_VAULT,
  SETTLE_FEE_NIM,
  discountedCollateral,
  type Escrow,
  type Listing,
} from "@/lib/escrow";
import { nimToLunas } from "@/lib/nimiq";

export default function BorrowWizard({
  listing,
  trustScore,
  borrower,
  onLock,
  onClose,
  locking,
  price,
}: {
  listing: Listing;
  trustScore: number;
  borrower: string;
  locking: boolean;
  price?: number;
  onLock: (listing: Listing, amountNIM: number) => Promise<Escrow | null>;
  onClose: () => void;
}) {
  const [step, setStep] = useState(1);
  const due = listing.kind.startsWith("bounty") ? 0 : discountedCollateral(listing.collateralNIM, trustScore);

  return (
    <div className="app-ink fixed inset-0 z-40 flex items-end justify-center bg-[color-mix(in_srgb,var(--ink)_60%,transparent)] backdrop-blur-sm sm:items-center animate-fade-in">
      <div className="card w-full max-w-[480px] rounded-t-3xl p-5 pb-8 sm:rounded-3xl animate-slide-up">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--ink3)]">
            Step {step} of 3
          </p>
          <button onClick={onClose} className="text-[var(--ink3)] hover:text-[var(--ink)] transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        <div className="mb-5 flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-[var(--gold)]" : "bg-[color-mix(in_srgb,var(--gold)_8%,transparent)]/10"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold">Review collateral</h3>
            <p className="mt-1 text-sm text-[var(--ink3)]">
              {listing.title} · {listing.owner}
            </p>
            <div className="mt-4 rounded-2xl border border-[var(--line)]/10 bg-[var(--bg)]/60 p-4">
              <p className="text-xs text-[var(--ink3)]">Locked to {ESCROW_VAULT}</p>
              <p className="tnum mt-1 text-3xl font-extrabold text-[var(--ink)]">
                {due.toLocaleString()}{" "}
                <span className="text-base font-bold text-[var(--gold)]">NIM</span>
              </p>
              <p className="tnum mt-1 text-xs text-[var(--ink3)]">
                {nimToLunas(due).toLocaleString()} lunas · {SETTLE_FEE_NIM} NIM settlement fee on release (0.001 to the vault, 0.0001 network)
              </p>
              {due < listing.collateralNIM && (
                <p className="mt-2 text-xs font-semibold text-[var(--verdigris)]">
                  Trust discount applied (−{(listing.collateralNIM - due).toLocaleString()} NIM)
                </p>
              )}
            </div>
            <button
              onClick={() => setStep(2)}
              className="mt-5 w-full rounded-2xl bg-[var(--gold)] py-3.5 font-bold text-[#1c1508] transition-transform btn-press"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold">Confirm in Nimiq Pay</h3>
            <p className="mt-1 text-sm text-[var(--ink3)]">
              Borrower {borrower}. One signature locks the full amount. No marketplace custody.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[var(--ink2)]">
                <Lock size={16} className="text-[var(--gold)]" /> Collateral held in escrow vault
              </div>
              <div className="flex items-center gap-2 text-[var(--ink2)]">
                <Clock size={16} className="text-[var(--sky)]" /> Auto-release on lender QR proof
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-2xl border border-[var(--line)]/15 py-3.5 font-semibold text-[var(--ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--gold)_8%,transparent)]/5 btn-press"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 rounded-2xl bg-[var(--sky)] py-3.5 font-bold text-[#1c1508] transition-transform btn-press"
              >
                Review terms
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold">Sign Contract</h3>
            <p className="mt-1 text-sm text-[var(--ink3)]">
              Tap below to sign with window.nimiq. Skeleton state masks chain latency.
            </p>
            
            <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border-[2px] border-[var(--gold)]/40 bg-[var(--bg)]/60 py-6 animate-pulse-border">
              <Lock size={28} className="text-[var(--gold)] mb-2" />
              <p className="text-sm font-medium text-[var(--ink3)]">
                {listing.kind.startsWith("bounty") ? "Required Collateral" : "Total Lock Amount"}
              </p>
              <p className="tnum mt-1 text-3xl font-extrabold text-[var(--ink)]">
                {due.toLocaleString()} <span className="text-[var(--gold)]">NIM</span>
              </p>
              {price && <p className="text-sm text-[var(--ink3)] mt-2">~${((due * price).toFixed(2))} USD</p>}
            </div>

            <button
              disabled={locking}
              onClick={async () => {
                const e = await onLock(listing, due);
                if (e) onClose();
              }}
              className="tnum mt-5 w-full rounded-2xl bg-gradient-to-r from-[var(--gold2)] to-[var(--gold)] shadow-[0_0_15px_rgba(154,116,24,0.3)] py-4 text-lg font-extrabold text-[#1c1508] transition-all hover:shadow-[0_0_20px_rgba(154,116,24,0.5)] disabled:opacity-60 disabled:shadow-none btn-press"
            >
              {locking ? "Locking… (confirm in wallet)" : listing.kind.startsWith("bounty") ? "Accept Challenge" : `Sign & lock ${due.toLocaleString()} NIM`}
            </button>
            <button
              onClick={() => setStep(2)}
              className="mt-2 w-full py-2 text-sm text-[var(--ink3)] hover:text-[var(--ink)] transition-colors"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
