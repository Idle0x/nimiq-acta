"use client";
import { Vault, ArrowUpRight } from "lucide-react";
import { explorerAddressUrl } from "@/lib/escrow";

/** Full-bleed treasury folio — no box. Written on the page. */
export default function TreasuryCard({
  vaultBalanceNIM,
  feesCollectedNIM,
  distributedNIM,
  vaultAddress,
}: {
  vaultBalanceNIM: number;
  feesCollectedNIM: number;
  distributedNIM: number;
  vaultAddress: string;
}) {
  const total = feesCollectedNIM + distributedNIM;
  const pct = total > 0 ? Math.round((distributedNIM / total) * 100) : 0;

  return (
    <section className="folio px-5 pb-7 pt-6">
      <div className="flex items-center justify-between">
        <p className="caps flex items-center gap-2 text-[9px] text-[var(--ink2)]">
          <Vault size={13} className="text-[var(--gold)]" /> Protocol Treasury
        </p>
        <span
          className="chip"
          style={{ color: "var(--verdigris)", borderColor: "color-mix(in srgb, var(--verdigris) 40%, transparent)" }}
        >
          <span className="h-1 w-1 rounded-full bg-[var(--verdigris)]" style={{ animation: "pulseDot 2.4s infinite" }} />
          On-chain
        </span>
      </div>

      <p className="figure mt-4 text-[44px] font-extrabold leading-none text-[var(--ink)]">
        {Math.round(vaultBalanceNIM).toLocaleString()}{" "}
        <span className="text-[15px] font-bold text-[var(--gold)]">NIM in the vault</span>
      </p>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="caps text-[7.5px] text-[var(--ink3)]">Given back to the community</p>
          <p className="figure mt-1 text-[22px] font-extrabold leading-none text-[var(--verdigris)]">
            {Math.round(distributedNIM).toLocaleString()} <span className="text-[12px] font-bold">NIM</span>
          </p>
        </div>
        <p className="figure text-[10px] text-[var(--ink3)]">
          fees in · {feesCollectedNIM.toLocaleString()} NIM · {pct}% returned
        </p>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--gold)] to-[var(--verdigris)] transition-all duration-700"
          style={{ width: `${Math.max(4, pct)}%` }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3">
        <p className="font-mono text-[10.5px] text-[var(--ink3)]">{vaultAddress.slice(0, 22)}…</p>
        <a
          href={explorerAddressUrl(vaultAddress)}
          target="_blank"
          rel="noreferrer"
          className="caps flex items-center gap-1 text-[8.5px] font-bold text-[var(--gold)] hover:underline"
        >
          View Vault <ArrowUpRight size={11} />
        </a>
      </div>

      <p className="marginalia mt-3 text-[11.5px]">
        Every settlement leaves 0.001 NIM in the vault (+0.0001 network). That retained drip
        funds milestones, check-ins and referrals — visible on-chain, not promised.
      </p>
    </section>
  );
}
