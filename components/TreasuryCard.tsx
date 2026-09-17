import { WalletIcon, TrendingUpIcon, ActivityIcon, ArrowUpRight } from "lucide-react";

export function TreasuryCard({
  fees,
  distributed,
  balance,
  vaultAddress,
  price,
}: {
  fees: number;
  distributed: number;
  balance: number | null;   // real on-chain NIM; null = RPC unreachable
  vaultAddress: string;
  price: number;
}) {
  return (
    <div className="card rounded-3xl p-5 border border-white/5 bg-slate-900/50 mb-8 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-50" />

      <div className="relative z-10 flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <WalletIcon size={14} className="text-amber-400" /> Protocol Treasury
        </h3>
        <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">
          <ActivityIcon size={10} /> On-chain
        </span>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Vault Balance</p>
          <p className="text-2xl font-black text-white tnum">
            {balance == null ? "—" : balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            {balance == null ? "RPC unreachable" : `~$${(balance * price).toFixed(2)}`}
          </p>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5 flex items-center gap-1">
              <TrendingUpIcon size={10} className="text-amber-400" /> Fees Collected
            </p>
            <p className="text-sm font-bold text-amber-400 tnum">+{fees.toLocaleString()} NIM</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Community Rewards</p>
            <p className="text-sm font-bold text-sky-400 tnum">{distributed.toLocaleString()} NIM</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-3">
        <p className="text-[10px] text-slate-500 leading-tight">
          Sustained entirely by protocol fees.<br />
          <span className="text-slate-600 font-mono">{vaultAddress.slice(0, 20)}...</span>
        </p>
        <a
          href={`https://albatross.nimiqwatch.com/address/${vaultAddress.replace(/\s/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-slate-950 bg-amber-400 px-3 py-1.5 rounded-lg btn-press"
        >
          View Vault <ArrowUpRight size={10} />
        </a>
      </div>
    </div>
  );
}
