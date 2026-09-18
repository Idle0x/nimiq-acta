"use client";

import { Radio, Shield, Fingerprint } from "lucide-react";

export type Tab = "radar" | "active" | "passport";

export default function BottomTabs({
  tab,
  setTab,
  activeCount,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  activeCount: number;
}) {
  const items = [
    { id: "radar", label: "Radar", icon: <Radio size={20} /> },
    { id: "active", label: "Active", icon: <Shield size={20} /> },
    { id: "passport", label: "Passport", icon: <Fingerprint size={20} /> },
  ] as const;
  
  return (
    <nav className="sticky bottom-0 z-20 border-t border-[var(--line)]/10 bg-[#0B1226]/95 backdrop-blur">
      <div className="grid grid-cols-3 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        {items.map((it) => {
          const on = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id as Tab)}
              className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-xs font-medium transition-all duration-200 ${
                on ? "text-[var(--gold)] scale-105 opacity-100" : "text-[var(--ink3)] hover:text-[var(--ink)] opacity-80"
              }`}
            >
              <span className="flex h-6 items-center justify-center leading-none">{it.icon}</span>
              <span className="flex items-center gap-1.5">
                {it.label}
                {it.id === "active" && activeCount > 0 && (
                  <span className="tnum rounded-full bg-[var(--gold)] px-1.5 text-[10px] font-bold text-[#1c1508]">
                    {activeCount}
                  </span>
                )}
              </span>
              <span
                className={`mt-0.5 h-1 w-8 rounded-full transition-all duration-200 ${
                  on ? "bg-[var(--gold)] scale-100 opacity-100" : "bg-transparent scale-50 opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
