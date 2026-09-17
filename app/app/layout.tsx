// The app interior lives at /app. Move your current app/page.tsx here
// (app/app/page.tsx) — it needs no other changes.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-ink min-h-dvh bg-[var(--bg)] text-[var(--ink)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col border-x border-[var(--line)]">
        {children}
      </div>
    </div>
  );
}
