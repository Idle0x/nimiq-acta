"use client";

import { useState } from "react";
import { Lock, Clock, X, Zap, Sparkles, ShieldCheck } from "lucide-react";
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
  const isBounty = listing.kind.startsWith("bounty");
  const isRentRequest = listing.kind === "borrow" && listing.borrowMode === "rent";
  const due = (isBounty || isRentRequest) ? 0 : discountedCollateral(listing.collateralNIM, trustScore);

  return (
    <div className="app-ink fixed inset-0 z-40 flex items-end justify-center bg-[color-mix(in_srgb,var(--ink)_60%,transparent)] backdrop-blur-sm sm:items-center animate-fade-in">
      <div className="card w-full max-w-[480px] rounded-t-3xl p-5 pb-8 sm:rounded-3xl animate-slide-up">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--ink3)]">
            Step {step} of 3 · {isBounty ? "Bounty Challenge" : isRentRequest ? "Rental Fulfillment" : "Equipment Borrow"}
          </p>
          <button onClick={onClose} className="text-[var(--ink3)] hover:text-[var(--ink)] transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        <div className="mb-5 flex gap-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? (isBounty ? "bg-[var(--gold)]" : "bg-[var(--sky)]") : "bg-[color-mix(in_srgb,var(--gold)_8%,transparent)]/10"}`}
            />
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold">
              {isBounty ? "Review Bounty Challenge" : isRentRequest ? "Review Rental Fulfillment" : "Review Collateral Deposit"}
            </h3>
            <p className="mt-1 text-sm text-[var(--ink3)]">
              {listing.title} · {listing.owner.slice(0, 12)}…
            </p>

            {isBounty ? (
              <div className="mt-4 rounded-2xl border border-[var(--gold)]/30 bg-[var(--gold)]/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[var(--gold)] font-bold">Funded in Escrow Vault</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--verdigris)]/15 text-[var(--verdigris)] font-bold">
                    0 NIM required from you
                  </span>
                </div>
                <p className="tnum mt-1 text-3xl font-extrabold text-[var(--ink)]">
                  {listing.collateralNIM.toLocaleString()}{" "}
                  <span className="text-base font-bold text-[var(--gold)]">NIM</span>
                </p>
                <p className="mt-1 text-xs text-[var(--ink2)] leading-relaxed">
                  The sponsor already locked this reward into the autonomous vault. Accepting is 100% free and places this challenge into your active Contracts tab.
                </p>
                {(listing as any).contract?.criteria && (
                  <div className="mt-3 pt-2.5 border-t border-[var(--gold)]/20">
                    <span className="caps text-[7.5px] text-[var(--gold)] font-bold block mb-0.5">Proof Criteria:</span>
                    <p className="text-xs italic text-[var(--ink)] font-serif">“{(listing as any).contract.criteria}”</p>
                  </div>
                )}
              </div>
            ) : isRentRequest ? (
              <div className="mt-4 rounded-2xl border border-[var(--sky)]/30 bg-[var(--sky)]/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[var(--sky)] font-bold">Requester Collateral Vaulted</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--verdigris)]/15 text-[var(--verdigris)] font-bold">
                    0 NIM required from you
                  </span>
                </div>
                <p className="tnum mt-1 text-3xl font-extrabold text-[var(--ink)]">
                  {listing.collateralNIM.toLocaleString()}{" "}
                  <span className="text-base font-bold text-[var(--sky)]">NIM</span>
                </p>
                <p className="mt-1 text-xs text-[var(--ink2)] leading-relaxed">
                  The requester already deposited this collateral into the autonomous vault upon posting. You are agreeing to provide the requested equipment.
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-[var(--line)]/10 bg-[var(--bg)]/60 p-4">
                <p className="text-xs text-[var(--ink3)]">Locked to {ESCROW_VAULT}</p>
                <p className="tnum mt-1 text-3xl font-extrabold text-[var(--ink)]">
                  {due.toLocaleString()}{" "}
                  <span className="text-base font-bold text-[var(--sky)]">NIM</span>
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
            )}

            <button
              onClick={() => setStep(2)}
              className={`mt-5 w-full rounded-2xl py-3.5 font-bold transition-transform btn-press ${
                isBounty ? "bg-[var(--gold)] text-[#1c1508]" : "bg-[var(--sky)] text-[#1c1508]"
              }`}
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold">
              {isBounty ? "Challenge Terms" : isRentRequest ? "Rental Fulfillment Terms" : "Confirm in Nimiq Pay"}
            </h3>
            <p className="mt-1 text-sm text-[var(--ink3)]">
              {isBounty
                ? `Challenger: ${borrower.slice(0, 14)}…`
                : isRentRequest
                ? `Provider/Lender: ${borrower.slice(0, 14)}… Fulfill request with zero collateral required.`
                : `Borrower: ${borrower}. One signature locks the full amount.`}
            </p>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[var(--ink2)]">
                <ShieldCheck size={16} className={isBounty ? "text-[var(--gold)]" : "text-[var(--sky)]"} />
                <span>Autonomous Smart Vault holds all escrow funds</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--ink2)]">
                <Clock size={16} className="text-[var(--sky)]" />
                <span>
                  {isBounty
                    ? `${(listing as any).contract?.deadlineHours ? `${(listing as any).contract.deadlineHours}h window once accepted` : "Valid until claimed"}`
                    : `Auto-release on lender Return QR proof (${listing.durationDays || 1} day covenant)`}
                </span>
              </div>
              {(isBounty || isRentRequest) && (
                <div className="flex items-center gap-2 text-[var(--ink2)]">
                  <Zap size={16} className={isBounty ? "text-[var(--gold)]" : "text-[var(--sky)]"} />
                  <span>0 NIM cost to participate · Collateral already vaulted</span>
                </div>
              )}
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
                className={`flex-1 rounded-2xl py-3.5 font-bold text-[#1c1508] transition-transform btn-press ${
                  isBounty ? "bg-[var(--gold)]" : "bg-[var(--sky)]"
                }`}
              >
                Review & Accept
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h3 className="text-lg font-bold">
              {isBounty ? "Accept Challenge" : isRentRequest ? "Accept Rental Request" : "Sign Contract"}
            </h3>
            <p className="mt-1 text-sm text-[var(--ink3)]">
              {isBounty
                ? "Tap below to register this challenge in your active Contracts."
                : isRentRequest
                ? "Tap below to register fulfillment and begin the covenant."
                : "Tap below to sign with window.nimiq and lock collateral."}
            </p>

            <div className={`mt-4 flex flex-col items-center justify-center rounded-2xl border-[2px] p-6 ${
              isBounty ? "border-[var(--gold)]/40 bg-[var(--gold)]/5" : "border-[var(--sky)]/40 bg-[var(--sky)]/5"
            }`}>
              {isBounty ? (
                <Zap size={28} className="text-[var(--gold)] mb-2 fill-current" />
              ) : (
                <Lock size={28} className="text-[var(--sky)] mb-2" />
              )}
              <p className="text-sm font-medium text-[var(--ink3)]">
                {isBounty ? "Your Cost to Accept" : isRentRequest ? "Required from You" : "Total Collateral Lock"}
              </p>
              <p className="tnum mt-1 text-3xl font-extrabold text-[var(--ink)]">
                {due.toLocaleString()}{" "}
                <span className={isBounty ? "text-[var(--gold)]" : "text-[var(--sky)]"}>NIM</span>
              </p>
              {isBounty ? (
                <p className="text-xs text-[var(--gold2)] font-semibold mt-2">
                  Potential Reward: {listing.collateralNIM.toLocaleString()} NIM upon verified proof
                </p>
              ) : isRentRequest ? (
                <p className="text-xs text-[var(--sky)] font-semibold mt-2">
                  Vault Secured: {listing.collateralNIM.toLocaleString()} NIM pre-deposited by requester
                </p>
              ) : (
                price && <p className="text-sm text-[var(--ink3)] mt-2">~${((due * price).toFixed(2))} USD</p>
              )}
            </div>

            <button
              disabled={locking}
              onClick={async () => {
                const e = await onLock(listing, due);
                if (e) onClose();
              }}
              className={`tnum mt-5 w-full rounded-2xl shadow-md py-4 text-base font-extrabold text-[#1c1508] transition-all disabled:opacity-60 disabled:shadow-none btn-press ${
                isBounty
                  ? "bg-gradient-to-r from-[var(--gold2)] to-[var(--gold)] shadow-[0_0_15px_rgba(154,116,24,0.3)]"
                  : "bg-gradient-to-r from-[var(--sky)] to-[color-mix(in_srgb,var(--sky)_80%,#1e3a8a)] text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]"
              }`}
            >
              {locking
                ? isBounty ? "Enrolling…" : isRentRequest ? "Enrolling…" : "Locking… (confirm in wallet)"
                : isBounty ? "Accept Challenge & Start" : isRentRequest ? "Accept & Fulfill Rental" : `Sign & lock ${due.toLocaleString()} NIM`}
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
