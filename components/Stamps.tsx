"use client";
import { useEffect, useState } from "react";
import { Lock, Zap, QrCode, MapPin, Award, UserCheck, X, ShieldCheck } from "lucide-react";

export interface StampMeta {
  match: string;
  name: string;
  desc: string;
  howEarned: string;
  purpose: string;
  Icon: any;
}

export const STAMPS: StampMeta[] = [
  {
    match: "borrow_return",
    name: "The Return",
    desc: "First borrow returned",
    howEarned: "Borrow equipment, return it in good condition before the deadline, and have the lender scan your cryptographic return QR code.",
    purpose: "Proves peer custody reliability. Compounds your Trust Score and lowers collateral requirements by up to 50% on all future peer loans.",
    Icon: Lock,
  },
  {
    match: "bounty",
    name: "Proven Hand",
    desc: "First bounty settled",
    howEarned: "Complete a real-world task, challenge, or bounty and satisfy the AI Vision or Creator oracle criteria.",
    purpose: "Attests physical task execution. Directly advances your completion rate and unlocks high-tier protocol bounties.",
    Icon: Zap,
  },
  {
    match: "scanquest",
    name: "Seeker",
    desc: "Found a ScanQuest token",
    howEarned: "Locate a hidden physical QR token in the real world and scan it using the in-app scanner.",
    purpose: "Provides mathematical, non-repudiable proof of exploration. Broadens oracle diversity in your passport trust formula.",
    Icon: QrCode,
  },
  {
    match: "checkin",
    name: "Pilgrim",
    desc: "Checked in on location",
    howEarned: "Verify physical presence at a designated GPS coordinate within an accurate bound (±50m), accompanied by scene photo proof if demanded.",
    purpose: "Attests real-world geographical presence and local community participation, strengthening your tenure rating.",
    Icon: MapPin,
  },
  {
    match: "milestone",
    name: "Regular",
    desc: "Milestone drip earned",
    howEarned: "Achieve key protocol milestones such as first lock, 7-day activity streaks, volume thresholds, or trust tier elevations.",
    purpose: "Honors sustained protocol activity and triggers automated treasury micro-grants disbursed directly from the vault.",
    Icon: Award,
  },
  {
    match: "creator",
    name: "Patron",
    desc: "Approved a submission",
    howEarned: "Deploy a funded bounty or rental listing and review/approve a participant's verified submission with your signature.",
    purpose: "Establishes your standing as a community sponsor and counterparty, unlocking elevated network visibility and fee discounts.",
    Icon: UserCheck,
  },
];

export default function Stamps({ initialActs, address }: { initialActs?: any[]; address?: string }) {
  const [acts, setActs] = useState<any[]>(initialActs ?? []);
  const [activeStamp, setActiveStamp] = useState<StampMeta | null>(null);

  useEffect(() => {
    if (initialActs !== undefined) {
      setActs(initialActs);
      return;
    }
    const q = address ? `?address=${encodeURIComponent(address)}` : "";
    fetch(`/api/passport${q}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const list = d?.acts ?? d?.stamps ?? [];
        if (Array.isArray(list)) setActs(list);
      })
      .catch(() => {});
  }, [address, initialActs]);

  return (
    <div className="space-y-3">
      {/* Informative Header Banner */}
      <div className="p-3.5 rounded-2xl bg-[color-mix(in_srgb,var(--surface)_80%,var(--gold)_10%)] border border-[var(--gold)]/20 flex items-start gap-3">
        <ShieldCheck size={18} className="text-[var(--gold)] mt-0.5 shrink-0" />
        <div>
          <p className="text-[12px] font-bold text-[var(--ink)]">Protocol Seals & Proofs of Mastery</p>
          <p className="text-[11px] text-[var(--ink3)] leading-relaxed mt-0.5">
            Stamps are immutable on-chain reputation seals etched into your passport. They verify real-world integrity, boost your Trust Score, and unlock reduced collateral on borrowed assets. Tap any stamp for details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {STAMPS.map((s, i) => {
          const earned = acts.some((a) => String(a.type ?? "").includes(s.match) || String(a.oracle ?? "").includes(s.match));
          const count = acts.filter((a) => String(a.type ?? "").includes(s.match)).length;
          return (
            <button
              type="button"
              key={s.match}
              onClick={() => setActiveStamp(s)}
              className={`stamp text-left transition-transform active:scale-95 cursor-pointer ${earned ? "earned animate-stamp-in" : "opacity-75 hover:opacity-100"}`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <s.Icon size={18} className={`stamp-icon mx-auto ${earned ? "" : "opacity-40"}`} />
              <p className="caps mt-2 text-[7.5px] tracking-[0.18em] text-center">{s.name}</p>
              <p className="marginalia mt-0.5 text-[9.5px] leading-tight text-center truncate">{s.desc}</p>
              {earned && count > 0 && (
                <p className="figure mt-1 text-[9px] font-bold text-[var(--gold2)] text-center">×{count}</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Stamp Detail Modal */}
      {activeStamp && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setActiveStamp(null)}>
          <div className="card w-full max-w-sm rounded-3xl p-5 border border-[var(--gold)]/30 bg-[var(--surface)] animate-slide-up shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[var(--gold)]/10 text-[var(--gold)]">
                  <activeStamp.Icon size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--ink)]">{activeStamp.name}</h4>
                  <p className="text-[10.5px] text-[var(--gold)] font-medium">
                    {acts.some((a) => String(a.type ?? "").includes(activeStamp.match) || String(a.oracle ?? "").includes(activeStamp.match))
                      ? `Earned (${acts.filter((a) => String(a.type ?? "").includes(activeStamp.match)).length} time${acts.filter((a) => String(a.type ?? "").includes(activeStamp.match)).length === 1 ? "" : "s"})`
                      : "Not yet earned"}
                  </p>
                </div>
              </div>
              <button onClick={() => setActiveStamp(null)} className="p-1 rounded-full text-[var(--ink3)] hover:text-[var(--ink)]">
                <X size={16} />
              </button>
            </div>

            <div className="py-4 space-y-3.5">
              <div>
                <p className="caps text-[8px] tracking-wider text-[var(--gold)] font-bold mb-1">How to Earn</p>
                <p className="text-xs text-[var(--ink2)] leading-relaxed">{activeStamp.howEarned}</p>
              </div>

              <div>
                <p className="caps text-[8px] tracking-wider text-[var(--sky)] font-bold mb-1">Reputation & Protocol Utility</p>
                <p className="text-xs text-[var(--ink2)] leading-relaxed">{activeStamp.purpose}</p>
              </div>
            </div>

            <button
              onClick={() => setActiveStamp(null)}
              className="w-full py-2.5 rounded-xl bg-[var(--gold)] text-[#1c1508] font-bold text-xs btn-press transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
