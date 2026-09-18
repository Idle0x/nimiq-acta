"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Share2, X } from "lucide-react";
import type { Escrow } from "@/lib/escrow";

export default function QrOverlay({
  token,
  escrow,
  onClose,
}: {
  token: string;
  escrow: Escrow;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="app-ink fixed inset-0 z-40 flex items-center justify-center bg-[color-mix(in_srgb,var(--ink)_65%,transparent)] p-6 backdrop-blur-sm animate-fade-in">
      <div className="glass relative w-full max-w-sm rounded-3xl border border-[var(--line)]/15 p-5 text-center animate-scale-in">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 rounded-full bg-[color-mix(in_srgb,var(--gold)_8%,transparent)]/5 p-1.5 text-[var(--ink3)] transition-colors hover:bg-[color-mix(in_srgb,var(--gold)_8%,transparent)]/10 hover:text-[var(--ink)]"
        >
          <X size={16} />
        </button>

        <h2 className="mt-2 text-xl font-bold text-gradient-gold">Return Confirmed</h2>
        <p className="mt-1 text-sm text-[var(--ink3)]">Scan lender QR to release funds</p>
        <p className="tnum mt-2 text-xs font-medium text-[var(--ink2)]">
          {escrow.title} · <span className="text-[var(--sky)]">{(escrow.amountNIM - escrow.feeNIM).toLocaleString()} NIM back</span>
        </p>

        <div className="mx-auto mt-6 w-fit rounded-2xl bg-gradient-to-tr from-[color-mix(in_srgb,var(--gold)_35%,transparent)] via-transparent to-[color-mix(in_srgb,var(--gold)_35%,transparent)] p-[2px] animate-pulse-border">
          <div className="rounded-[14px] bg-[color-mix(in_srgb,var(--gold)_8%,transparent)] p-3">
            <QRCodeSVG value={token} size={200} />
          </div>
        </div>

        <p className="mt-5 break-all rounded-xl bg-[var(--bg)]/70 p-2 text-[10px] text-[var(--ink3)]">
          {token.slice(0, 120)}…
        </p>

        <div className="mt-4 flex gap-2">
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(token);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              } catch {}
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[var(--line)]/15 py-3 text-sm font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--gold)_8%,transparent)]/5 btn-press"
          >
            {copied ? <Check size={16} className="text-[var(--verdigris)]" /> : <Copy size={16} className="text-[var(--ink2)]" />}
            {copied ? "Copied" : "Copy"}
          </button>
          
          <button
            onClick={async () => {
              try {
                if (navigator.share) {
                  await navigator.share({
                    title: 'Acta payload',
                    text: token
                  });
                }
              } catch {}
            }}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--gold)] py-3 text-sm font-bold text-[#1c1508] transition-transform btn-press"
          >
            <Share2 size={16} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
