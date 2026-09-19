// Backward-compat shim over Feedback.SuccessPayoff (which cleans up its timers).
// Old API: <SuccessPayoff amount={n} onClose={...}> — payoff fires on releases only.
"use client";
import { SuccessPayoff as NewPayoff } from "@/components/Feedback";
import { SETTLE_FEE_NIM } from "@/lib/escrow";

export function SuccessPayoff({
  amount,
  onClose,
}: {
  amount?: number;
  onClose: () => void;
}) {
  if (amount == null || amount <= 0) return null;
  return (
    <NewPayoff open locked={amount} fee={SETTLE_FEE_NIM} onDone={onClose} />
  );
}
