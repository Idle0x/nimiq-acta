"use client";
import { useState } from "react";
import { UserCheck, Scan } from "lucide-react";
import QRCode from "react-qr-code";
import { useNimiq } from "@/lib/nimiq";

export default function ManualVerify({
  listingId,
  isOwner = false,
  onScan,
}: {
  listingId: string;
  isOwner?: boolean;
  onScan?: () => void;
}) {
  const { accounts, status } = useNimiq();
  const [showQr, setShowQr] = useState(false);

  // If viewer is the listing creator/sponsor, show verification guidance & scanner trigger
  if (isOwner) {
    return (
      <div className="mt-3 rounded-xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 p-3.5 text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1.5 text-xs font-bold text-[var(--gold)]">
          <UserCheck size={14} /> Sponsor Verification
        </div>
        <p className="text-xs text-[var(--ink2)] mb-3 leading-relaxed">
          Waiting for hunter completion. When the hunter shows you their completion QR code, scan it to approve and release the vault reward.
        </p>
        {onScan && (
          <button
            onClick={onScan}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--gold)] py-2.5 text-xs font-bold text-[#1c1508] btn-press shadow-sm"
          >
            <Scan size={14} /> Scan Hunter QR to Approve
          </button>
        )}
      </div>
    );
  }

  // Completer/Hunter path:
  // No connected wallet, no QR: encoding "undefined" as the completer would
  // mint a valid-looking code that pays nobody and confuses the creator.
  const completer = accounts[0];
  if (!completer) {
    return (
      <div className="mt-3 rounded-xl border border-[var(--line)]/10 bg-[var(--bg)]/60 p-3 text-center">
        <p className="text-xs text-[var(--ink3)]">
          {status === "loading" ? "Connecting wallet…" : "Connect your wallet to request approval."}
        </p>
      </div>
    );
  }

  // We simply encode "manual_req:listingId:completerAddress"
  const qrData = `manual_req:${listingId}:${completer}`;

  return (
    <div className="mt-3 rounded-xl border border-[var(--line)]/10 bg-[var(--bg)]/60 p-3 text-center">
      {!showQr ? (
        <>
          <p className="text-xs text-[var(--ink3)] mb-3">When complete, show this QR code to the sponsor to get approved.</p>
          <button
            onClick={() => setShowQr(true)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--sky)] py-2.5 text-xs font-bold text-[#1c1508] btn-press"
          >
            <UserCheck size={14} /> Request Approval
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center">
          <div className="bg-[color-mix(in_srgb,var(--gold)_8%,transparent)] p-2 rounded-lg mb-2">
            <QRCode value={qrData} size={150} />
          </div>
          <p className="text-xs text-[var(--gold)]">Waiting for creator to scan...</p>
        </div>
      )}
    </div>
  );
}
