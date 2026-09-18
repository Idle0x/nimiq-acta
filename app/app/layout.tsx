// The app interior lives at /app — a full-bleed notebook page.
// Parchment runs edge to edge; sections are torn sheets (folio)
// and ledger entries divided by fleuron rules, never floating boxes.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="acta-app theme-paper min-h-dvh w-full bg-[var(--bg)] text-[var(--ink)]">
      <div className="flex min-h-dvh w-full flex-col">{children}</div>
    </div>
  );
}
