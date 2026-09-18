"use client";
import { useState } from "react";
import {
  Info, Lock, QrCode, UserCheck, Camera, MapPin,
} from "lucide-react";
import { protocolNotes } from "@/lib/contract";

export interface ListingLike {
  id: string;
  title: string;
  kind: string; // borrow | bounty | bounty_qr | bounty_manual | bounty_venture
  owner: string;
  collateralNIM: number;
  description?: string;
  yieldNIM?: number;
  requireLocation?: boolean;
}

const KIND_META: Record<string, { label: string; color: string; Icon: any }> = {
  borrow: { label: "Borrow", color: "var(--sky)", Icon: Lock },
  bounty: { label: "PhotoProof", color: "var(--gold)", Icon: Camera },
  bounty_qr: { label: "ScanQuest", color: "var(--verdigris)", Icon: QrCode },
  bounty_manual: { label: "Request", color: "var(--wax)", Icon: UserCheck },
  bounty_venture: { label: "Venture", color: "var(--verdigris)", Icon: MapPin },
};

/** Protocol rules — single source of truth in lib/contract.ts (fee 0.0001 NIM). */
function Dossier({ listing }: { listing: ListingLike }) {
  const notes = protocolNotes({ kind: listing.kind, collateralNIM: listing.collateralNIM }, null);
  return (
    <div className="mt-3 border-l-2 border-[var(--gold)] pl-3">
      <p className="caps text-[7.5px] text-[var(--gold)]">From the sponsor</p>
      <blockquote className="font-serif mt-1 text-[13px] italic leading-relaxed text-[var(--ink2)]">
        “{listing.description?.trim() || "No description was given for this listing."}”
      </blockquote>
      <p className="caps mt-3 text-[7.5px] text-[var(--gold)]">How this settles</p>
      <ul className="mt-1.5 space-y-1.5">
        {notes.map((n, i) => (
          <li key={i} className="flex gap-2 text-[12px] leading-snug text-[var(--ink2)]">
            <span className="mt-[5px] h-1 w-1 flex-none rotate-45 bg-[var(--gold)]" />
            {n}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A ledger line on the page — no box, divided by rule below. */
export default function ListingCard({
  listing,
  price,
  index = 0,
  onReview,
  badge,
}: {
  listing: ListingLike;
  price?: number;
  index?: number;
  onReview: (l: ListingLike) => void;
  badge?: string;
}) {
  const [open, setOpen] = useState(false);
  const meta = KIND_META[listing.kind] ?? KIND_META.bounty;

  return (
    <article className="rise w-full px-4 py-4" style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}>
      <div className="flex items-start justify-between gap-3">
        <span
          className="chip"
          style={{
            color: meta.color,
            borderColor: `color-mix(in srgb, ${meta.color} 40%, transparent)`,
            background: `color-mix(in srgb, ${meta.color} 10%, transparent)`,
          }}
        >
          <meta.Icon size={10} /> {meta.label}
        </span>
        <div className="text-right">
          <p className="figure text-xl font-extrabold leading-none text-[var(--ink)]">
            {listing.collateralNIM.toLocaleString()} <span className="text-xs font-bold text-[var(--gold)]">NIM</span>
          </p>
          {price ? (
            <p className="figure mt-1 text-[10px] text-[var(--ink3)]">
              ~${(listing.collateralNIM * price).toFixed(2)} USD
            </p>
          ) : null}
        </div>
      </div>

      <h3 className="font-display mt-2 text-[17px] font-semibold leading-snug text-[var(--ink)]">
        {listing.title}
      </h3>

      <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--ink3)]">
        <span className="font-mono">{listing.owner.slice(0, 12)}… vouches for this contract</span>
        {badge ? <span className="caps text-[8px] text-[var(--gold)]">{badge}</span> : null}
      </div>

      {open && (
        <div className="animate-slide-down">
          <Dossier listing={listing} />
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => onReview(listing)}
          className="press flex-1 rounded-xl py-2.5 text-[12.5px] font-bold"
        >
          Review Contract
        </button>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Details"
          className={`ghost rounded-xl p-2.5 transition-colors ${open ? "text-[var(--gold)]" : ""}`}
        >
          <Info size={15} />
        </button>
      </div>

      <div className="rule mt-4" aria-hidden>
        <span className="font-display text-[10px] text-[var(--gold)]">❦</span>
      </div>
    </article>
  );
}
