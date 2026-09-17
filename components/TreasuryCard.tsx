import { WalletIcon, TrendingUpIcon, ActivityIcon } from "lucide-react";

export function TreasuryCard({ fees, distributed, price }: { fees: number, distributed: number, price: number }) {
  const vaultBalance = 450000 + fees - distributed; // Seeded base
  
  return (
    <div className="card rounded-3xl p-5 border border-white/5 bg-slate-900/50 mb-8 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-50" />
      
      <div className="relative z-10 flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <WalletIcon size={14} className="text-amber-400" /> Protocol Treasury
        </h3>
        <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md">
          <ActivityIcon size={10} /> Yielding
        </span>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Vault Balance</p>
          <p className="text-2xl font-black text-white tnum">{vaultBalance.toLocaleString()}</p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">~${(vaultBalance * price).toFixed(2)}</p>
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
      
      <div className="relative z-10 mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
         <p className="text-[10px] text-slate-500 leading-tight">
           Treasury funds are delegated to <span className="text-amber-400 font-medium">Nimiq Validators</span>.<br/>Yield funds the action economy.
         </p>
         <button className="text-[10px] font-bold text-slate-950 bg-amber-400 px-3 py-1.5 rounded-lg btn-press">
           View Node
         </button>
      </div>
    </div>
  );
}
