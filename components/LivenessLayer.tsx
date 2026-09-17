import { ZapIcon, TrendingUpIcon, TargetIcon, UserCheck, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function Leaderboard({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="card rounded-3xl p-5 border border-white/5 bg-slate-900/50 mb-8">
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
        <TrendingUpIcon size={14} className="text-emerald-400" /> Trust Leaderboard
      </h3>
      <div className="space-y-3">
        {data.map((user, idx) => (
          <div key={user.address} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/50 border border-white/5">
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${idx === 0 ? "bg-amber-400 text-amber-950" : idx === 1 ? "bg-slate-300 text-slate-900" : idx === 2 ? "bg-amber-700 text-amber-100" : "bg-slate-800 text-slate-400"}`}>
                #{idx + 1}
              </div>
              <div>
                <p className="text-xs font-mono text-slate-300">{user.address.substring(0, 12)}...</p>
                <p className="text-[10px] text-slate-500">{user.itemsCompleted} challenges</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-emerald-400">+{user.trustScore}</p>
              <p className="text-[9px] uppercase tracking-widest text-slate-500">Trust</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityFeed({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="card rounded-3xl p-5 border border-white/5 bg-slate-900/50 mb-8">
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
        <TargetIcon size={14} className="text-sky-400" /> Global Activity
      </h3>
      <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
        {data.map((act) => {
          let Icon = CheckCircle2;
          let color = "text-emerald-400";
          let bg = "bg-emerald-400/10";
          let desc = `Completed ${act.type} challenge`;

          if (act.type === "milestone") {
            Icon = ZapIcon;
            color = "text-amber-400";
            bg = "bg-amber-400/10";
            desc = `Earned ${act.proofJson?.milestone_id?.replace("ms_", "").replace("_", " ")} milestone`;
          } else if (act.oracle === "geo") {
            desc = "Verified location physically";
          } else if (act.oracle === "vision") {
            desc = `AI verified: ${act.proofJson?.verdict?.reason || "Success"}`;
          } else if (act.oracle === "qr_sig") {
            desc = "Scanned quest token in the real world";
          } else if (act.oracle === "creator") {
            Icon = UserCheck;
            color = "text-sky-400";
            bg = "bg-sky-400/10";
            desc = "Manually verified by creator";
          }

          return (
            <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-slate-900 bg-slate-800 text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <div className={`p-1.5 rounded-full ${bg} ${color}`}>
                  <Icon size={12} />
                </div>
              </div>
              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-2xl bg-slate-950/50 border border-white/5 shadow">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-400">{act.actor.substring(0, 9)}...</span>
                  <time className="text-[9px] text-slate-500 font-medium">
                    {formatDistanceToNow(act.createdAt, { addSuffix: true })}
                  </time>
                </div>
                <p className="text-xs text-slate-300 leading-snug">{desc}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-amber-400">+{act.amountNIM} NIM</p>
                  <a href={`https://albatross.nimiqwatch.com/transaction/${act.txHash}`} target="_blank" className="text-[9px] text-sky-400 hover:underline">View Tx</a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
