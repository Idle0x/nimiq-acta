"use client";
import { useEffect, useState } from "react";
import { Lock, Zap, QrCode, MapPin, Award, UserCheck } from "lucide-react";

const STAMPS = [
  { match: "borrow_return", name: "The Return", desc: "First borrow returned", Icon: Lock },
  { match: "bounty", name: "Proven Hand", desc: "First bounty settled", Icon: Zap },
  { match: "scanquest", name: "Seeker", desc: "Found a ScanQuest token", Icon: QrCode },
  { match: "checkin", name: "Pilgrim", desc: "Checked in on location", Icon: MapPin },
  { match: "milestone", name: "Regular", desc: "Milestone drip earned", Icon: Award },
  { match: "creator", name: "Patron", desc: "Approved a submission", Icon: UserCheck },
];

export default function Stamps({ initialActs }: { initialActs?: any[] }) {
  const [acts, setActs] = useState<any[]>(
    initialActs ?? [
      { type: "borrow_return", oracle: "qr_sig" },
      { type: "bounty", oracle: "vision" },
    ]
  );
  useEffect(() => {
    fetch("/api/passport")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const list = d?.acts ?? d?.stamps;
        if (Array.isArray(list) && list.length > 0) setActs(list);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {STAMPS.map((s, i) => {
        const earned = acts.some((a) => String(a.type ?? "").includes(s.match) || String(a.oracle ?? "").includes(s.match));
        const count = acts.filter((a) => String(a.type ?? "").includes(s.match)).length;
        return (
          <div
            key={s.match}
            className={`stamp ${earned ? "earned animate-stamp-in" : ""}`}
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <s.Icon size={18} className={`stamp-icon mx-auto ${earned ? "" : "opacity-40"}`} />
            <p className="caps mt-2 text-[7.5px] tracking-[0.18em]">{s.name}</p>
            <p className="marginalia mt-0.5 text-[9.5px] leading-tight">{s.desc}</p>
            {earned && count > 0 && (
              <p className="figure mt-1 text-[9px] font-bold text-[var(--gold2)]">×{count}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
