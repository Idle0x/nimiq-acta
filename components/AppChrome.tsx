"use client";
import { Radio, Shield, Fingerprint } from "lucide-react";
import { Seal } from "./Paper";

/* ---------- Engraved app header ---------- */
export function AppHeader({
  trustScore,
  connected,
  onCreate,
}: {
  trustScore: number;
  connected: boolean;
  onCreate: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 px-4 pt-[max(0.9rem,env(safe-area-inset-top))] pb-3 flex justify-between items-center bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-md shrink-0 border-b border-[var(--line)]">
      <div className="flex items-center gap-3">
        <Seal size={34} className="!text-[11px]">A</Seal>
        <div>
          <h1 className="caps text-sm font-semibold tracking-[0.28em] text-[var(--ink)]">
            Acta
          </h1>
          <p className="caps text-[8px] tracking-[0.24em] text-[var(--ink3)] mt-0.5">
            Action Economy
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Trust chip — engraved, tappable to Passport */}
        <span className="plate rounded-full px-3 py-1.5 flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-[var(--verdigris)]" : "bg-[var(--wax)]"}`}
            style={connected ? { animation: "pulseDot 2.4s ease-in-out infinite" } : undefined}
          />
          <span className="figure text-xs font-semibold text-[var(--gold2)]">
            {trustScore}
          </span>
          <span className="caps text-[8px] text-[var(--ink3)]">Trust</span>
        </span>

        <button
          onClick={onCreate}
          className="press rounded-full px-4 py-2 text-xs"
        >
          + New
        </button>
      </div>
    </header>
  );
}

/* ---------- Engraved bottom tabs ---------- */
export function EngravedTabs({
  tab,
  setTab,
  activeCount,
}: {
  tab: "radar" | "active" | "passport";
  setTab: (t: "radar" | "active" | "passport") => void;
  activeCount: number;
}) {
  const items = [
    { id: "radar" as const, label: "Radar", icon: <Radio size={19} strokeWidth={1.75} /> },
    { id: "active" as const, label: "Active", icon: <Shield size={19} strokeWidth={1.75} /> },
    { id: "passport" as const, label: "Passport", icon: <Fingerprint size={19} strokeWidth={1.75} /> },
  ];
  return (
    <nav className="sticky bottom-0 z-30 border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--bg2)_92%,transparent)] backdrop-blur-md">
      <div className="grid grid-cols-3 px-6 pb-[max(0.9rem,env(safe-area-inset-bottom))] pt-2">
        {items.map((it) => {
          const on = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className={`relative flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-all duration-300 ${
                on ? "text-[var(--gold2)]" : "text-[var(--ink3)] hover:text-[var(--ink2)]"
              }`}
              style={{ fontFamily: "var(--font-grotesk)" }}
            >
              {/* engraved active notch */}
              <span
                className={`absolute -top-2 h-[3px] w-10 rounded-full bg-[var(--gold)] transition-all duration-300 ${
                  on ? "opacity-100 scale-100" : "opacity-0 scale-50"
                }`}
                style={{ boxShadow: "0 1px 0 var(--glow), 0 4px 8px -2px var(--shadow)" }}
              />
              <span className={on ? "breathe" : ""}>{it.icon}</span>
              <span className="flex items-center gap-1.5 caps tracking-[0.14em] text-[9px]">
                {it.label}
                {it.id === "active" && activeCount > 0 && (
                  <span className="figure rounded-full bg-[var(--gold)] px-1.5 text-[9px] font-bold text-[#1c1508]">
                    {activeCount}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
