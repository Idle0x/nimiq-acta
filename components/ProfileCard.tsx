"use client";
import { formatDistanceToNow } from "date-fns";
import Identicon from "./Identicon";
import { trustTier } from "./AppChrome";

/** Public record card — shown before anyone accepts anything. */
export default function ProfileCard({
  address,
  trustScore,
  actsCount,
  settledVolume,
  joinedAt,
  recentActs,
}: {
  address: string;
  trustScore: number;
  actsCount: number;
  settledVolume: number;
  joinedAt: number | null;
  recentActs?: { id: string; type: string; amountNIM: number; createdAt: number }[];
}) {
  const tier = trustTier(trustScore);
  return (
    <div className="plate rounded-2xl p-3.5">
      <div className="flex items-center gap-3">
        <Identicon address={address} size={44} ring={tier.color} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[12px] text-[var(--ink)]">{address}</p>
          <p className="caps mt-0.5 text-[7.5px]" style={{ color: tier.color }}>
            {tier.name} · trust {trustScore}
          </p>
        </div>
        <div className="text-right">
          <p className="figure text-[15px] font-extrabold text-[var(--ink)]">{actsCount}</p>
          <p className="caps text-[7px] text-[var(--ink3)]">acts</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--line)] pt-3 text-center">
        <div>
          <p className="figure text-[13px] font-bold text-[var(--gold2)]">
            {Math.round(settledVolume).toLocaleString()}
          </p>
          <p className="caps text-[6.5px] text-[var(--ink3)]">NIM settled</p>
        </div>
        <div>
          <p className="figure text-[13px] font-bold text-[var(--ink)]">
            {joinedAt ? formatDistanceToNow(joinedAt, { addSuffix: false }) : "—"}
          </p>
          <p className="caps text-[6.5px] text-[var(--ink3)]">member</p>
        </div>
        <div>
          <p className="figure text-[13px] font-bold text-[var(--ink)]">{trustScore}</p>
          <p className="caps text-[6.5px] text-[var(--ink3)]">trust</p>
        </div>
      </div>

      {recentActs && recentActs.length > 0 && (
        <div className="mt-3 border-t border-[var(--line)] pt-2.5">
          <p className="caps mb-1.5 text-[7px] text-[var(--ink3)]">Recent record</p>
          <div className="space-y-1">
            {recentActs.slice(0, 3).map((a) => (
              <div key={a.id} className="flex items-center justify-between text-[11px]">
                <span className="text-[var(--ink2)]">{String(a.type).replace(/_/g, " ")}</span>
                <span className="figure text-[10px] text-[var(--ink3)]">
                  {formatDistanceToNow(a.createdAt, { addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
