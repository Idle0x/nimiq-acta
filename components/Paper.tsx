import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

/* ---------- Engraved plate ---------- */
export function Plate({
  children,
  hover = false,
  className = "",
}: {
  children: ReactNode;
  hover?: boolean;
  className?: string;
}) {
  return (
    <div className={`plate rounded-2xl ${hover ? "plate-hover" : ""} ${className}`}>
      {children}
    </div>
  );
}

/* ---------- Floating panel ---------- */
export function Floaty({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`floaty rounded-2xl ${className}`}>{children}</div>;
}

/* ---------- Wax seal ---------- */
export function Seal({
  children,
  size = 56,
  className = "",
}: {
  children: ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`seal font-display select-none ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {children}
    </span>
  );
}

/* ---------- 3D press button ---------- */
export function PressButton({
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button {...rest} className={`press rounded-xl px-6 py-3.5 text-sm ${className}`}>
      {children}
    </button>
  );
}

export function PressLink({
  children,
  className = "",
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a {...rest} className={`press inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm ${className}`}>
      {children}
    </a>
  );
}

export function GhostButton({
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button {...rest} className={`ghost rounded-xl px-6 py-3.5 text-sm ${className}`}>
      {children}
    </button>
  );
}

export function GhostLink({
  children,
  className = "",
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode }) {
  return (
    <a {...rest} className={`ghost inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm ${className}`}>
      {children}
    </a>
  );
}

/* ---------- Ornamental rule ---------- */
export function Rule({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`rule ${className}`} aria-hidden>
      {children ?? <span className="font-serif text-lg leading-none">&#10086;</span>}
    </div>
  );
}

/* ---------- Marginalia (editorial side-note) ---------- */
export function Marginalia({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`marginalia text-sm leading-relaxed ${className}`}>{children}</p>;
}

/* ---------- Section kicker ---------- */
export function Kicker({ index, children }: { index?: string; children: ReactNode }) {
  return (
    <p className="caps text-[11px] text-[var(--gold)]">
      {index ? <span className="figure mr-2 text-[var(--ink3)]">{index}</span> : null}
      {children}
    </p>
  );
}
