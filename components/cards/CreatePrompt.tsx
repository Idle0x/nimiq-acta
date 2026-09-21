"use client";
import { Plus, ArrowRight } from "lucide-react";

export function CreatePrompt({
  title,
  sub,
  onClick,
  accent = "gold",
}: {
  title: string;
  sub: string;
  onClick: () => void;
  accent?: "gold" | "sky" | "verdigris";
}) {
  const c = accent === "sky" ? "var(--sky)" : accent === "verdigris" ? "var(--verdigris)" : "var(--gold)";
  return (
    <button
      onClick={onClick}
      className="create-prompt group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-dashed p-3.5 text-left"
      style={{
        borderColor: `color-mix(in srgb, ${c} 38%, transparent)`,
        background: `color-mix(in srgb, ${c} 6%, transparent)`,
      }}
    >
      <span
        className="relative flex h-8 w-8 flex-none items-center justify-center rounded-full transition-transform duration-500 group-hover:rotate-90 group-hover:scale-105 overflow-visible"
        style={{
          background: `color-mix(in srgb, ${c} 16%, transparent)`,
          color: c,
          boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${c} 30%, transparent)`,
        }}
      >
        <span
          className="radar-scan-ping absolute inline-flex h-full w-full rounded-full pointer-events-none"
          style={{ background: c }}
        />
        <Plus size={15} strokeWidth={2.5} className="relative" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-[var(--ink)]">{title}</span>
        <span className="marginalia block text-[11.5px] leading-snug">{sub}</span>
      </span>
      <ArrowRight
        size={15}
        className="flex-none opacity-40 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-90"
        style={{ color: c }}
      />
    </button>
  );
}
