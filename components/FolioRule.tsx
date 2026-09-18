"use client";

/** Fleuron page-break — authentic 17th-century section divider. */
export default function FolioRule({
  mark = "❦",
  label,
}: {
  mark?: string;
  label?: string;
}) {
  let displayMark = mark;
  if (mark === "\\u2042" || mark === "\u2042" || mark.includes("u2042")) {
    displayMark = "⁂";
  } else if (mark === "\\u2766" || mark === "\u2766" || mark.includes("u2766")) {
    displayMark = "❦";
  }

  return (
    <div className="folio-rule my-6 select-none" aria-hidden>
      <div className="flex items-center gap-2 font-display">
        <span className="text-xs opacity-40">❧</span>
        <span className="text-sm font-bold text-[var(--gold)]">{displayMark}</span>
        {label && (
          <span className="caps text-[8.5px] font-semibold tracking-[0.22em] text-[var(--ink3)]">
            {label}
          </span>
        )}
        <span className="text-xs opacity-40">☙</span>
      </div>
    </div>
  );
}
