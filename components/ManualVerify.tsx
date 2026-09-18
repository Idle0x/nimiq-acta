"use client";
import { useState } from "react";
import { UserCheck, Loader2 } from "lucide-react";
import QRCode from "react-qr-code";
import { useNimiq } from "@/lib/nimiq";

export default function ManualVerify({ listingId }: { listingId: string }) {
  const { accounts } = useNimiq();
  const [showQr, setShowQr] = useState(false);

  // We simply encode "manual_req:listingId:completerAddress"
  const qrData = `manual_req:${listingId}:${accounts[0]}`;

  return (
    <div className="mt-3 rounded-xl border border-[var(--line)]/10 bg-[var(--bg)]/60 p-3 text-center">
      {!showQr ? (
        <>
          <p className="text-xs text-[var(--ink3)] mb-3">Show this QR code to the creator to get approved.</p>
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
