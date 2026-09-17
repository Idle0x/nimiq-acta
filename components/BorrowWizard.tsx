"use client";

import { useState } from "react";
import { Lock, Clock, X } from "lucide-react";
import {
  ESCROW_VAULT,
  MICRO_FEE_NIM,
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
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center animate-fade-in">
      <div className="card w-full max-w-[480px] rounded-t-3xl p-5 pb-8 sm:rounded-3xl animate-slide-up">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Step {step} of 3
          </p>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        <div className="mb-5 flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-amber-300" : "bg-white/10"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold">Review collateral</h3>
            <p className="mt-1 text-sm text-slate-400">
              {listing.title} · {listing.owner}
            </p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <p className="text-xs text-slate-400">Locked to {ESCROW_VAULT}</p>
              <p className="tnum mt-1 text-3xl font-extrabold text-white">
                {due.toLocaleString()}{" "}
                <span className="text-base font-bold text-amber-300">NIM</span>
              </p>
              <p className="tnum mt-1 text-xs text-slate-500">
                {nimToLunas(due).toLocaleString()} lunas · fee {MICRO_FEE_NIM} NIM on release
              </p>
              {due < listing.collateralNIM && (
                <p className="mt-2 text-xs font-semibold text-emerald-300">
                  Trust discount applied (−{(listing.collateralNIM - due).toLocaleString()} NIM)
                </p>
              )}
            </div>
            <button
              onClick={() => setStep(2)}
              className="mt-5 w-full rounded-2xl bg-amber-300 py-3.5 font-bold text-slate-950 transition-transform btn-press"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold">Confirm in Nimiq Pay</h3>
            <p className="mt-1 text-sm text-slate-400">
              Borrower {borrower}. One signature locks the full amount. No marketplace custody.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <Lock size={16} className="text-amber-300" /> Collateral held in escrow vault
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock size={16} className="text-sky-400" /> Auto-release on lender QR proof
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-2xl border border-white/15 py-3.5 font-semibold text-slate-200 transition-colors hover:bg-white/5 btn-press"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 rounded-2xl bg-sky-400 py-3.5 font-bold text-slate-950 transition-transform btn-press"
              >
                Review terms
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold">Sign Contract</h3>
            <p className="mt-1 text-sm text-slate-400">
              Tap below to sign with window.nimiq. Skeleton state masks chain latency.
            </p>
            
            <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border-[2px] border-amber-300/40 bg-slate-950/60 py-6 animate-pulse-border">
              <Lock size={28} className="text-amber-300 mb-2" />
              <p className="text-sm font-medium text-slate-400">
                {listing.kind.startsWith("bounty") ? "Required Collateral" : "Total Lock Amount"}
              </p>
              <p className="tnum mt-1 text-3xl font-extrabold text-white">
                {due.toLocaleString()} <span className="text-amber-300">NIM</span>
              </p>
              {price && <p className="text-sm text-slate-500 mt-2">~${((due * price).toFixed(2))} USD</p>}
            </div>

            <button
              disabled={locking}
              onClick={async () => {
                const e = await onLock(listing, due);
                if (e) onClose();
              }}
              className="tnum mt-5 w-full rounded-2xl bg-gradient-to-r from-amber-300 to-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] py-4 text-lg font-extrabold text-slate-950 transition-all hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] disabled:opacity-60 disabled:shadow-none btn-press"
            >
              {locking ? "Locking… (confirm in wallet)" : listing.kind.startsWith("bounty") ? "Accept Challenge" : `Sign & lock ${due.toLocaleString()} NIM`}
            </button>
            <button
              onClick={() => setStep(2)}
              className="mt-2 w-full py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
