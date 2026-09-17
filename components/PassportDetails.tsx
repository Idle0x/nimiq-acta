"use client";
import { useEffect, useState } from "react";
import { Award, Zap, Activity, Grid } from "lucide-react";

export default function PassportDetails() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/passport")
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d) })
      .catch(console.error);
  }, []);

  if (!data) return <div className="animate-pulse h-40 bg-slate-900/50 rounded-3xl" />;

  const bd = data.breakdown || { completion: 0, volume: 0, tenure: 0, diversity: 0, community: 0 };
  const maxes = { completion: 35, volume: 25, tenure: 20, diversity: 10, community: 10 };

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Trust Score Breakdown */}
      <div className="card rounded-3xl p-5 border border-white/5 bg-slate-900/50">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
          <Activity size={14} className="text-emerald-400" /> Trust Mechanics
        </h3>
        <div className="space-y-4">
          {[
            { key: "completion", label: "Completion Rate", color: "bg-emerald-400" },
            { key: "volume", label: "Volume History", color: "bg-blue-400" },
            { key: "tenure", label: "Account Tenure", color: "bg-purple-400" },
            { key: "diversity", label: "Oracle Diversity", color: "bg-amber-400" },
            { key: "community", label: "Community Value", color: "bg-rose-400" },
          ].map((item) => (
            <div key={item.key}>
              <div className="flex justify-between items-end mb-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{item.label}</span>
                <span className="text-[10px] font-bold text-slate-200 tnum">{bd[item.key as keyof typeof bd]} / {maxes[item.key as keyof typeof maxes]} pts</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} rounded-full`} 
                  style={{ width: `${(bd[item.key as keyof typeof bd] / maxes[item.key as keyof typeof maxes]) * 100}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestones */}
      {data.milestones && data.milestones.length > 0 && (
        <div className="card rounded-3xl p-5 border border-white/5 bg-slate-900/50">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
            <Zap size={14} className="text-amber-400" /> Milestones Unlocked
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.milestones.map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-amber-400/10 border border-amber-400/20 rounded-lg">
                <Award size={12} className="text-amber-400" />
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  {m.m_id?.replace("ms_", "").replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Act Stamps */}
      {data.stamps && data.stamps.length > 0 && (
        <div className="card rounded-3xl p-5 border border-white/5 bg-slate-900/50">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-4">
            <Grid size={14} className="text-sky-400" /> Act Stamps
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {data.stamps.map((stamp: any) => (
              <div key={stamp.id} className="aspect-[3/4] rounded-xl bg-slate-800 border-2 border-slate-700 p-2 flex flex-col justify-between items-center text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
                <div className="text-[8px] uppercase tracking-widest text-slate-500 font-bold w-full truncate border-b border-white/5 pb-1">{stamp.oracle}</div>
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shadow-inner border border-white/5">
                  <span className="text-[10px]">{stamp.type.slice(0,2).toUpperCase()}</span>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-sky-400 tnum">{stamp.amount_nim} NIM</div>
                  <div className="text-[8px] text-slate-500">{new Date(stamp.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
