import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation — Acta Protocol Specification",
  description:
    "Comprehensive engineering, architectural, and developer documentation for Acta: the proof-of-action protocol on Nimiq. Explore oracles, smart covenants, API references, and reputation mathematics.",
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-ink bg-[var(--bg)] text-[var(--ink)] min-h-screen antialiased selection:bg-[var(--gold)]/30 selection:text-[var(--ink)]">
      {children}
    </div>
  );
}
