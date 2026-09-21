"use client";

import { useState } from "react";
import { ShieldCheck, Sparkles, ArrowRight, Coins, Percent, Info } from "lucide-react";

export default function TrustCalculator() {
  const [collateral, setCollateral] = useState<number>(1000);
  const [trustScore, setTrustScore] = useState<number>(65);

  // Math from lib/escrow.ts & lib/trust.ts
  const discountRate = Math.min(0.30, trustScore * 0.003); // 0 to 30%
  const discountPercent = Math.round(discountRate * 1000) / 10; // e.g. 19.5%
  const discountAmount = Math.round(collateral * discountRate * 100) / 100;
  const requiredLock = Math.max(0.01, Math.round((collateral - discountAmount) * 100) / 100);
  
  const vaultFee = 0.001;
  const networkFee = 0.0001;
  const settleFee = 0.0011;
  const netReturn = Math.max(0, Math.round((requiredLock - settleFee) * 10000) / 10000);

  const tier =
    trustScore >= 85
      ? { name: "Grandmaster", color: "text-[#BEB0D8]", bg: "bg-[#BEB0D8]/10", border: "border-[#BEB0D8]/30" }
      : trustScore >= 60
      ? { name: "Sovereign", color: "text-[var(--gold)]", bg: "bg-[var(--gold)]/10", border: "border-[var(--gold)]/30" }
      : trustScore >= 30
      ? { name: "Proven", color: "text-[var(--verdigris)]", bg: "bg-[var(--verdigris)]/10", border: "border-[var(--verdigris)]/30" }
      : { name: "Novice", color: "text-[var(--ink3)]", bg: "bg-white/5", border: "border-white/10" };

  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 my-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--gold)]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[var(--line)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="caps text-[9px] text-[var(--gold)] tracking-widest font-bold">
              Interactive Simulator
            </span>
            <span className={`caps text-[9px] px-2 py-0.5 rounded-full font-bold border ${tier.color} ${tier.bg} ${tier.border}`}>
              {tier.name} Tier
            </span>
          </div>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Reputation & Collateral Discount Calculator
          </h3>
          <p className="marginalia text-xs mt-1 text-[var(--ink2)] max-w-xl">
            Simulate how your historical on-chain integrity lowers required vault collateral across equipment covenants.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 mt-6">
        {/* Sliders Area */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5">
                <Coins size={14} className="text-[var(--gold)]" /> Item Value / Gross Collateral
              </label>
              <span className="font-mono text-sm font-bold text-[var(--gold)]">
                {collateral.toLocaleString()} NIM
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={25000}
              step={10}
              value={collateral}
              onChange={(e) => setCollateral(Number(e.target.value))}
              className="w-full h-1.5 bg-[var(--line)] rounded-lg appearance-none cursor-pointer accent-[var(--gold)]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[var(--ink3)] mt-1">
              <span>10 NIM</span>
              <span>10,000 NIM</span>
              <span>25,000 NIM</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-[var(--ink)] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[var(--verdigris)]" /> Your Trust Score
              </label>
              <span className="font-mono text-sm font-bold text-[var(--verdigris)]">
                {trustScore} / 100
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={trustScore}
              onChange={(e) => setTrustScore(Number(e.target.value))}
              className="w-full h-1.5 bg-[var(--line)] rounded-lg appearance-none cursor-pointer accent-[var(--verdigris)]"
            />
            <div className="flex justify-between text-[10px] font-mono text-[var(--ink3)] mt-1">
              <span>0 (Novice · 0% off)</span>
              <span>50 (Proven · 15% off)</span>
              <span>100 (Grandmaster · 30% off)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/20 border border-[var(--line)]/50 text-[12px] text-[var(--ink2)] space-y-1.5">
            <div className="flex items-center gap-1.5 text-[var(--gold)] font-medium">
              <Info size={13} />
              <span>Algorithmic Formula</span>
            </div>
            <p className="font-mono text-[11px] text-[var(--ink3)]">
              discountRate = min(0.30, trustScore * 0.003)
            </p>
            <p className="text-[11.5px] leading-snug">
              At Trust Score {trustScore}, you receive a <strong className="text-[var(--ink)] font-semibold">{discountPercent}% discount</strong>. Reputation is direct financial purchasing power.
            </p>
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-6 flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-black/40 to-black/20 border border-[var(--gold)]/30">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="caps text-[9px] text-[var(--ink3)] block">Upfront Vault Deposit</span>
                <p className="font-mono text-3xl font-extrabold text-[var(--gold)] mt-0.5">
                  {requiredLock.toLocaleString()} <span className="text-base font-normal text-[var(--ink3)]">NIM</span>
                </p>
              </div>
              <div className="text-right">
                <span className="caps text-[9px] text-[var(--verdigris)] block">Upfront Savings</span>
                <p className="font-mono text-lg font-bold text-[var(--verdigris)] mt-0.5">
                  -{discountAmount.toLocaleString()} NIM
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-[var(--line)] text-[12px]">
              <div className="flex justify-between items-center text-[var(--ink2)]">
                <span>Gross Item Collateral:</span>
                <span className="font-mono text-[var(--ink)]">{collateral.toLocaleString()} NIM</span>
              </div>
              <div className="flex justify-between items-center text-[var(--ink2)]">
                <span>Reputation Discount ({discountPercent}%):</span>
                <span className="font-mono text-[var(--verdigris)]">-{discountAmount.toLocaleString()} NIM</span>
              </div>
              <div className="flex justify-between items-center text-[var(--ink2)]">
                <span>Protocol Vault Retention:</span>
                <span className="font-mono text-[var(--ink3)]">-{vaultFee} NIM</span>
              </div>
              <div className="flex justify-between items-center text-[var(--ink2)]">
                <span>Nimiq Network Gas Fee:</span>
                <span className="font-mono text-[var(--ink3)]">-{networkFee} NIM</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-[var(--line)]/50 font-medium">
                <span className="text-[var(--ink)]">Net Returned Upon Safe Handshake:</span>
                <span className="font-mono font-bold text-[var(--gold)]">
                  {netReturn.toLocaleString(undefined, { minimumFractionDigits: 4 })} NIM
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between text-[11px] text-[var(--ink3)]">
            <span>Sub-second refund on return scan</span>
            <span className="text-[var(--gold)] font-mono flex items-center gap-1">
              Deterministic PoS <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
