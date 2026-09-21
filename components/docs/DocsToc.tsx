"use client";

import { useState } from "react";
import { Copy, Check, ArrowUp } from "lucide-react";
import { GitHubIcon } from "./SourceLink";

export interface TocItem {
  id: string;
  label: string;
  level?: 2 | 3;
}

export default function DocsToc({
  headings,
  activeId,
}: {
  headings: TocItem[];
  activeId: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <aside className="hidden xl:block w-64 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto pl-6 py-8 border-l border-[var(--line)]/50 text-[12.5px] space-y-5 scrollbar-thin">
      <div>
        <h5 className="caps text-[9px] font-bold text-[var(--gold)] tracking-widest uppercase mb-3">
          On This Page
        </h5>
        <ul className="space-y-2">
          {headings.map((h) => {
            const isActive = activeId === h.id;
            return (
              <li key={h.id} className={h.level === 3 ? "pl-3 text-[11.5px]" : ""}>
                <a
                  href={`#${h.id}`}
                  className={`block transition-colors leading-snug ${
                    isActive
                      ? "text-[var(--gold)] font-bold"
                      : "text-[var(--ink3)] hover:text-[var(--ink)]"
                  }`}
                >
                  {h.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pt-4 border-t border-[var(--line)]/50 space-y-2.5 text-[11.5px]">
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 text-[var(--ink3)] hover:text-[var(--ink)] transition-colors w-full text-left"
        >
          {copied ? <Check size={13} className="text-[var(--verdigris)]" /> : <Copy size={13} />}
          <span>{copied ? "Link Copied" : "Copy Page URL"}</span>
        </button>

        <a
          href="https://github.com/Idle0x/nimiq-acta"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-[var(--ink3)] hover:text-[var(--gold)] transition-colors"
        >
          <GitHubIcon size={13} className="text-[var(--gold)]" />
          <span>Browse GitHub Repository</span>
        </a>

        <button
          onClick={scrollToTop}
          className="flex items-center gap-2 text-[var(--ink3)] hover:text-[var(--gold)] transition-colors pt-1"
        >
          <ArrowUp size={13} />
          <span>Return to Top</span>
        </button>
      </div>
    </aside>
  );
}
