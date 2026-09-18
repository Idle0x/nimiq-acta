// Honest treasury shim: old war-room props render the calm on-chain card.
// No fabricated seeded balances, no yield/delegation claims — balance comes
// from the chain via /api/dashboard (getAccountByAddress), copy synced to 0.0001 NIM.
"use client";
import NewTreasuryCard from "@/components/cards/TreasuryCard";

export function TreasuryCard({
  fees,
  distributed,
  balance,
  vaultAddress,
}: {
  fees: number;
  distributed: number;
  balance: number | null;
  vaultAddress: string;
  price?: number;
  tvl?: number;
  volume?: number;
}) {
  return (
    <NewTreasuryCard
      vaultBalanceNIM={balance ?? 0}
      feesCollectedNIM={fees}
      distributedNIM={distributed}
      vaultAddress={vaultAddress}
    />
  );
}
