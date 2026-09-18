"use client";
import { Map as MapIcon } from "lucide-react";
import TreasuryCard from "./cards/TreasuryCard";
import ListingCard, { type ListingLike } from "./cards/ListingCard";
import { CreatePrompt } from "./cards/CreatePrompt";
import { SectionHeader } from "./SectionHeader";
import { ActivityFeed, Leaderboard } from "./LivenessLayer";

export default function RadarFeed({
  listings,
  price,
  treasury,
  feed,
  leaderboard,
  showMap,
  onToggleMap,
  onCreateBorrow,
  onCreateBounty,
  onReview,
  mapView,
}: {
  listings: ListingLike[];
  price?: number;
  treasury: { vaultBalanceNIM: number; feesCollectedNIM: number; distributedNIM: number; vaultAddress: string };
  feed?: any[];
  leaderboard?: any[];
  showMap?: boolean;
  onToggleMap?: () => void;
  onCreateBorrow: () => void;
  onCreateBounty: () => void;
  onReview: (l: ListingLike) => void;
  mapView?: React.ReactNode;
}) {
  const bounties = listings.filter((l) => l.kind.startsWith("bounty"));
  const borrows = listings.filter((l) => l.kind === "borrow");

  return (
    <div className="px-4 pb-6">
      <SectionHeader
        no="01 · Ledger"
        title="Protocol Treasury"
        note="Not a prize pool — a public vault. Fees flow in, rewards flow back out, and anyone can read the balance on-chain."
      />
      <TreasuryCard {...treasury} />

      <SectionHeader
        no="02 · Earn"
        title="Bounties"
        note="Rewards are locked by the sponsor before the challenge goes live. Pass the oracle and the vault pays out — no trust, no chasing anyone for payment."
        action={
          onToggleMap ? (
            <button onClick={onToggleMap} className="ghost flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px]">
              <MapIcon size={11} /> {showMap ? "List" : "Map"}
            </button>
          ) : undefined
        }
      />
      <div className="mb-3">
        <CreatePrompt
          title="Fund a challenge"
          sub="Lock the reward, set the proof — the oracle does the rest."
          accent="gold"
          onClick={onCreateBounty}
        />
      </div>
      {showMap && mapView ? (
        mapView
      ) : (
        <div className="space-y-3">
          {bounties.map((l, i) => (
            <ListingCard key={l.id} listing={l} price={price} index={i} onReview={onReview} />
          ))}
        </div>
      )}

      <SectionHeader
        no="03 · Borrow"
        title="Nearby items"
        note="Collateral replaces handshakes. Lock NIM, take the item, and scan the Return Code when you bring it back — your funds never leave the contract."
      />
      <div className="mb-3">
        <CreatePrompt
          title="Lend an item"
          sub="List something you own — collateral protects it while it's out."
          accent="sky"
          onClick={onCreateBorrow}
        />
      </div>
      <div className="space-y-3">
        {borrows.map((l, i) => (
          <ListingCard key={l.id} listing={l} price={price} index={i} onReview={onReview} />
        ))}
      </div>

      <SectionHeader
        no="04 · Pulse"
        title="Community"
        note="A live record of acts settling around you — the economy, writing itself."
      />
      <ActivityFeed data={feed ?? []} />
      <Leaderboard data={leaderboard ?? []} />
    </div>
  );
}
