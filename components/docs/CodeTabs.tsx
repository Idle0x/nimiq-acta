"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export interface CodeSnippet {
  label: string;
  language: string;
  code: string;
}

export default function CodeTabs({
  snippets,
  title,
}: {
  snippets: CodeSnippet[];
  title?: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeSnippet = snippets[activeIdx] || snippets[0];

  async function handleCopy() {
    if (!activeSnippet) return;
    try {
      await navigator.clipboard.writeText(activeSnippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[#0d0b09] overflow-hidden my-4 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--line)]/50 bg-[#14110d]">
        <div className="flex items-center gap-2">
          {title && (
            <span className="text-[11px] font-mono text-[var(--gold)] font-medium mr-2">
              {title}
            </span>
          )}
          <div className="flex gap-1">
            {snippets.map((snip, i) => (
              <button
                key={snip.label}
                onClick={() => setActiveIdx(i)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all ${
                  activeIdx === i
                    ? "bg-[var(--gold)]/15 text-[var(--gold)] font-semibold border border-[var(--gold)]/30"
                    : "text-[var(--ink3)] hover:text-[var(--ink2)] hover:bg-white/5"
                }`}
              >
                {snip.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-[var(--ink3)] hover:text-[var(--ink)] hover:bg-white/5 rounded-md transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} className="text-[var(--verdigris)]" />
              <span className="text-[var(--verdigris)]">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto max-h-[480px] scrollbar-thin">
        <pre className="font-mono text-[12px] leading-relaxed text-[var(--ink)] whitespace-pre">
          <code>{activeSnippet?.code}</code>
        </pre>
      </div>
    </div>
  );
}
