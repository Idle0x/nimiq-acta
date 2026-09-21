"use client";
import { Radio, Shield, Fingerprint, Bell, Plus } from "lucide-react";
import { Seal } from "./Paper";

export type Tab = "radar" | "active" | "passport";

export function trustTier(score: number) {
  if (score >= 60) return { name: "Proven", color: "var(--verdigris)" };
  if (score >= 30) return { name: "Rising", color: "var(--gold)" };
  return { name: "Unproven", color: "var(--wax)" };
}

export function AppHeader({
  trustScore,
  connected,
  onCreate,
  onOpenInbox,
  unread = 0,
}: {
  trustScore: number;
  connected: boolean;
  onCreate: () => void;
  onOpenInbox: () => void;
  unread?: number;
}) {
  const tier = trustTier(trustScore);
  return (
    <header className="app-ink shrink-0 flex items-center justify-between border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] px-4 py-2.5 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <a href="/" title="Return to Landing Page">
          <Seal size={32} className="!text-[11px]">A</Seal>
        </a>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="caps text-[13px] font-semibold tracking-[0.28em] text-[var(--ink)]">Acta</h1>
            <a
              href="/docs"
              className="text-[9px] font-mono tracking-normal px-1.5 py-0.5 rounded bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20 hover:bg-[var(--gold)]/20 hover:border-[var(--gold)]/40 transition-colors"
              title="Acta Protocol Documentation & Specification"
            >
              Docs
            </a>
          </div>
          <p className="caps mt-0.5 text-[7.5px] tracking-[0.26em] text-[var(--ink3)]">Action Economy</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenInbox}
          aria-label="Inbox"
          className="ghost relative rounded-full p-2"
        >
          <Bell size={15} />
          {unread > 0 && <span className="unread-dot" />}
        </button>

        <span
          className="plate flex items-center gap-2 rounded-full py-1.5 pl-3 pr-3"
          style={{ boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${tier.color} 35%, transparent), inset 0 1px 0 rgba(255,255,255,0.05)` }}
          title={`Trust: ${tier.name}`}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: connected ? "var(--verdigris)" : "var(--wax)",
              animation: connected ? "pulseDot 2.4s ease-in-out infinite" : undefined,
            }}
          />
          <span className="figure text-xs font-semibold text-[var(--gold2)]">{trustScore}</span>
          <span className="caps text-[7.5px] text-[var(--ink3)]">{tier.name}</span>
        </span>

        <button
          onClick={onCreate}
          className="press relative group flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs overflow-visible"
          title="Create New Listing or Bounty"
        >
          <span className="relative flex h-3.5 w-3.5 items-center justify-center">
            <span className="radar-scan-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gold)]" />
            <Plus size={13} strokeWidth={2.5} className="relative text-[#1c1508] group-hover:rotate-90 transition-transform duration-300" />
          </span>
          <span className="font-semibold tracking-wide">New</span>
        </button>
      </div>
    </header>
  );
}

export function EngravedTabs({
  tab,
  setTab,
  activeCount,
  pulse = false,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  activeCount: number;
  pulse?: boolean;
}) {
  const items = [
    { id: "radar" as const, label: "Radar", icon: <Radio size={18} strokeWidth={1.75} /> },
    { id: "active" as const, label: "Contracts", icon: <Shield size={18} strokeWidth={1.75} /> },
    { id: "passport" as const, label: "Passport", icon: <Fingerprint size={18} strokeWidth={1.75} /> },
  ];
  return (
    <nav className="app-ink shrink-0 z-40 border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_92%,transparent)] backdrop-blur-md">
      <div className="grid grid-cols-3 px-6 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] pt-1.5">
        {items.map((it) => {
          const on = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className={`relative flex flex-col items-center gap-0.5 rounded-xl py-1 text-[9px] font-medium transition-all duration-300 ${
                on ? "text-[var(--gold2)]" : "text-[var(--ink3)] hover:text-[var(--ink2)]"
              }`}
            >
              <span
                className="absolute -top-2 h-[3px] w-10 rounded-full bg-[var(--gold)] transition-all duration-300"
                style={{
                  boxShadow: "0 1px 0 var(--glow), 0 4px 8px -2px var(--shadow)",
                  opacity: on ? 1 : 0,
                  transform: on ? "scale(1)" : "scale(0.4)",
                }}
              />
              <span className={on ? "breathe" : ""}>{it.icon}</span>
              <span className="caps flex items-center gap-1.5 text-[8px] tracking-[0.14em]">
                {it.label}
                {it.id === "active" && activeCount > 0 && (
                  <span
                    className="figure rounded-full bg-[var(--gold)] px-1.5 text-[9px] font-bold text-[#1c1508]"
                    style={pulse ? { animation: "breathe 1.6s ease-in-out infinite" } : undefined}
                  >
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
