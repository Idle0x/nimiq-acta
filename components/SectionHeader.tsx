import type { ReactNode } from "react";

/**
 * Every section carries its own one-breath explanation (serif marginalia),
 * so the app explains itself without ever feeling like a manual.
 */
export function SectionHeader({
  no,
  title,
  note,
  action,
}: {
  no: string;
  title: ReactNode;
  note: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 mt-8 first:mt-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="caps text-[8.5px] text-[var(--gold)]">{no}</p>
          <h2 className="font-display mt-1 truncate text-[17px] font-semibold tracking-wide text-[var(--ink)]">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <p className="marginalia mt-1.5 text-[12.5px]">{note}</p>
    </div>
  );
}
