import { ZapIcon, TrendingUpIcon, TargetIcon, UserCheck, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function Leaderboard({ data, onView }: { data: any[]; onView?: (address: string) => void }) {
  const list = data || [];
  return (
    <div className="card rounded-2xl p-3.5 border border-[var(--line)]/10 bg-[var(--surface)]/90 h-[165px] flex flex-col justify-between">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink3)] flex items-center gap-1.5 mb-2 shrink-0">
        <TrendingUpIcon size={13} className="text-[var(--verdigris)]" /> Trust Leaderboard
      </h3>
      {list.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
          <p className="marginalia text-[11px] text-[var(--ink3)]">No signers yet.</p>
          <p className="text-[9px] text-[var(--ink3)]/60 mt-0.5">Settle contracts or complete bounties to top the register.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-parchment-scrollbar pr-1 space-y-1.5">
          {list.map((user, idx) => (
            <div key={user.address} className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg)]/50 border border-[var(--line)]/5">
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${idx === 0 ? "bg-[var(--gold)] text-[#1c1508]" : idx === 1 ? "bg-[var(--surface2)] text-[var(--ink)]" : idx === 2 ? "bg-[var(--gold)]/80 text-[#1c1508]" : "bg-[var(--surface2)] text-[var(--ink3)]"}`}>
                  #{idx + 1}
                </div>
                <div>
                  <button onClick={() => onView?.(user.address)} className="font-mono text-[11px] text-[var(--sky)] hover:underline">{user.address.substring(0, 11)}…</button>
                  <p className="text-[9px] text-[var(--ink3)]">{user.itemsCompleted} acts</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-[var(--verdigris)]">+{user.trustScore}</p>
                <p className="text-[8px] uppercase tracking-widest text-[var(--ink3)]">Trust</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ActivityFeed({ data, onView }: { data: any[]; onView?: (address: string) => void }) {
  const list = data || [];

  return (
    <div className="card rounded-2xl p-3.5 border border-[var(--line)]/10 bg-[var(--surface)]/90 h-[165px] flex flex-col justify-between">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink3)] flex items-center gap-1.5 mb-2 shrink-0">
        <TargetIcon size={13} className="text-[var(--sky)]" /> Global Activity
      </h3>
      {list.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
          <p className="marginalia text-[11px] text-[var(--ink3)]">No activity recorded yet.</p>
          <p className="text-[9px] text-[var(--ink3)]/60 mt-0.5">Physical proofs and on-chain settlements will stream here.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-parchment-scrollbar pr-1 space-y-1.5">
          {list.map((act) => {
            let Icon = CheckCircle2;
            let color = "text-[var(--verdigris)]";
            let bg = "bg-[var(--verdigris)]/10";
            let desc = `Completed ${act.type} challenge`;

            if (act.type === "milestone") {
              Icon = ZapIcon;
              color = "text-[var(--gold)]";
              bg = "bg-[var(--gold)]/10";
              desc = `Earned ${act.proofJson?.milestone_id?.replace("ms_", "").replace("_", " ")} milestone`;
            } else if (act.oracle === "geo") {
              desc = "Verified location physically";
            } else if (act.oracle === "vision") {
              desc = `AI verified: ${act.proofJson?.verdict?.reason || "Success"}`;
            } else if (act.oracle === "qr_sig") {
              desc = "Scanned quest token in the real world";
            } else if (act.oracle === "creator") {
              Icon = UserCheck;
              color = "text-[var(--sky)]";
              bg = "bg-[var(--sky)]/10";
              desc = "Manually verified by creator";
            }

            return (
              <div key={act.id} className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg)]/50 border border-[var(--line)]/5">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-full ${bg} ${color} shrink-0`}>
                    <Icon size={11} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => onView?.(act.actor)} className="font-mono text-[10px] text-[var(--sky)] hover:underline truncate max-w-[100px]">{act.actor.substring(0, 8)}…</button>
                      <time className="text-[8.5px] text-[var(--ink3)]">{formatDistanceToNow(act.createdAt, { addSuffix: true })}</time>
                    </div>
                    <p className="text-[10px] text-[var(--ink2)] truncate max-w-[180px]">{desc}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-bold text-[var(--gold)]">+{act.amountNIM} NIM</p>
                  {act.txHash && <a href={`https://albatross.nimiqwatch.com/transaction/${act.txHash}`} target="_blank" className="text-[8px] text-[var(--sky)] hover:underline">Tx</a>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
