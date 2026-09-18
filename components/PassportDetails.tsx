"use client";
import { useEffect, useState } from "react";
import { Award, Zap, Activity, Grid, Sparkles, ShieldCheck } from "lucide-react";

const ZERO_DATA = {
  breakdown: { completion: 0, volume: 0, tenure: 0, diversity: 0, community: 0, total: 0 },
  milestones: [],
  stamps: [],
};

export default function PassportDetails({ address }: { address?: string }) {
  const [data, setData] = useState<any>(ZERO_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) {
      setData(ZERO_DATA);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = `?address=${encodeURIComponent(address)}`;
    fetch(`/api/passport${q}`)
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) {
          setData(d);
        } else {
          setData(ZERO_DATA);
        }
      })
      .catch(() => setData(ZERO_DATA))
      .finally(() => setLoading(false));
  }, [address]);

  const bd = data.breakdown || ZERO_DATA.breakdown;
  const maxes = { completion: 35, volume: 25, tenure: 20, diversity: 10, community: 10 };
  const milestones = data.milestones || [];
  const stamps = data.stamps || [];

  return (
    <div className="animate-fade-in relative -mx-4">
      {/* Swipe Header Hint */}
      <div className="flex items-center justify-between px-4 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink3)] flex items-center gap-1.5">
          <ShieldCheck size={12} className="text-[var(--gold)]" />
          Verification Dossier & Stamps
        </span>
        <span className="marginalia text-[10px] text-[var(--ink3)]">Swipe cards ↔</span>
      </div>

      {/* Horizontal Carousel for the 3 Passport Cards */}
      <div className="flex gap-3 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory no-scrollbar px-4">
        
        {/* CARD 1: Trust Score Breakdown */}
        <div className="w-[88vw] max-w-[420px] shrink-0 snap-center">
          <div className="card rounded-2xl p-4 border border-[var(--line)] bg-[var(--surface)] h-[270px] flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--ink3)] flex items-center gap-2">
                  <Activity size={14} className="text-[var(--verdigris)]" /> Trust Mechanics
                </h3>
                <span className="font-mono text-[11px] font-bold text-[var(--verdigris)] tnum">
                  {bd.total ?? 0} / 100
                </span>
              </div>
              <div className="space-y-2.5">
                {[
                  { key: "completion", label: "Completion Rate", color: "bg-[var(--verdigris)]" },
                  { key: "volume", label: "Volume History", color: "bg-[var(--sky)]" },
                  { key: "tenure", label: "Account Tenure", color: "bg-[var(--gold2)]" },
                  { key: "diversity", label: "Oracle Diversity", color: "bg-[var(--gold)]" },
                  { key: "community", label: "Community Value", color: "bg-[var(--wax)]" },
                ].map((item) => {
                  const val = bd[item.key as keyof typeof bd] ?? 0;
                  const max = maxes[item.key as keyof typeof maxes];
                  const pct = Math.min(100, Math.round((val / max) * 100));
                  return (
                    <div key={item.key}>
                      <div className="flex justify-between items-end mb-0.5">
                        <span className="text-[9.5px] uppercase tracking-wider text-[var(--ink3)] font-semibold">{item.label}</span>
                        <span className="text-[9.5px] font-bold text-[var(--ink)] tnum">{val} / {max} pts</span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--surface2)] rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all duration-500`} 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="marginalia text-[9.5px] text-[var(--ink3)]/80 pt-2 border-t border-[var(--line)]/10 text-center">
              Trust is mathematically re-calculated upon every on-chain settlement.
            </p>
          </div>
        </div>

        {/* CARD 2: Milestones Unlocked */}
        <div className="w-[88vw] max-w-[420px] shrink-0 snap-center">
          <div className="card rounded-2xl p-4 border border-[var(--line)] bg-[var(--surface)] h-[270px] flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--ink3)] flex items-center gap-2">
                  <Zap size={14} className="text-[var(--gold)]" /> Milestones Unlocked
                </h3>
                <span className="font-mono text-[11px] font-bold text-[var(--gold)]">
                  {milestones.length} Badges
                </span>
              </div>

              {milestones.length === 0 ? (
                <div className="h-[160px] flex flex-col items-center justify-center text-center p-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center mb-2">
                    <Award size={18} className="text-[var(--gold)]" />
                  </div>
                  <p className="font-serif text-sm font-semibold text-[var(--ink)]">No Milestones Claimed</p>
                  <p className="marginalia text-[10.5px] text-[var(--ink3)] mt-1 max-w-[220px]">
                    Connect your wallet, lock an asset, or complete your first act to mint protocol milestone honors.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto custom-parchment-scrollbar max-h-[165px] pr-1 flex flex-wrap gap-2">
                  {milestones.map((m: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 bg-[var(--gold-dim)] border border-[var(--gold)]/40 rounded-xl">
                      <Award size={13} className="text-[var(--gold)] shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold text-[var(--gold)] uppercase tracking-wider leading-none">
                          {m.m_id?.replace("ms_", "").replace(/_/g, " ")}
                        </p>
                        {m.created_at && (
                          <p className="text-[8.5px] text-[var(--ink3)] mt-0.5">
                            {new Date(Number(m.created_at)).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="marginalia text-[9.5px] text-[var(--ink3)]/80 pt-2 border-t border-[var(--line)]/10 text-center">
              Milestones drip real NIM rewards directly from the treasury vault.
            </p>
          </div>
        </div>

        {/* CARD 3: Act Stamps */}
        <div className="w-[88vw] max-w-[420px] shrink-0 snap-center">
          <div className="card rounded-2xl p-4 border border-[var(--line)] bg-[var(--surface)] h-[270px] flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--ink3)] flex items-center gap-2">
                  <Grid size={14} className="text-[var(--sky)]" /> Act Stamps
                </h3>
                <span className="font-mono text-[11px] font-bold text-[var(--sky)]">
                  {stamps.length} Stamps
                </span>
              </div>

              {stamps.length === 0 ? (
                <div className="h-[160px] flex flex-col items-center justify-center text-center p-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--sky)]/10 border border-[var(--sky)]/20 flex items-center justify-center mb-2">
                    <Sparkles size={18} className="text-[var(--sky)]" />
                  </div>
                  <p className="font-serif text-sm font-semibold text-[var(--ink)]">No Act Stamps Yet</p>
                  <p className="marginalia text-[10.5px] text-[var(--ink3)] mt-1 max-w-[220px]">
                    Settling real-world tasks, physical check-ins, or equipment returns stamps your public passport.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 overflow-y-auto custom-parchment-scrollbar max-h-[165px] pr-1">
                  {stamps.map((stamp: any) => (
                    <div key={stamp.id} className="aspect-[3/4] rounded-xl bg-[var(--surface2)] border border-[var(--line)]/20 p-2 flex flex-col justify-between items-center text-center relative overflow-hidden group shadow-inner">
                      <div className="absolute inset-0 bg-gradient-to-b from-[color-mix(in_srgb,var(--gold)_6%,transparent)] to-transparent pointer-events-none" />
                      <div className="text-[8px] uppercase tracking-widest text-[var(--ink3)] font-bold w-full truncate border-b border-[var(--line)]/10 pb-0.5">{stamp.oracle}</div>
                      <div className="w-7 h-7 rounded-full bg-[var(--surface)] flex items-center justify-center shadow-inner border border-[var(--line)]/15">
                        <span className="text-[9px] font-bold text-[var(--gold)]">{String(stamp.type).slice(0, 2).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-[var(--sky)] tnum">+{stamp.amount_nim} NIM</div>
                        <div className="text-[7.5px] text-[var(--ink3)]">{new Date(Number(stamp.created_at)).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="marginalia text-[9.5px] text-[var(--ink3)]/80 pt-2 border-t border-[var(--line)]/10 text-center">
              Each stamp proves verifiable real-world reality on the Nimiq ledger.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
