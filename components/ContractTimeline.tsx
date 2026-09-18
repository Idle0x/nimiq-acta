"use client";
import { useEffect, useState } from "react";
import { Check, Clock, XCircle, Hourglass } from "lucide-react";

const STEPS = ["Accepted", "Proof submitted", "Verified", "Settled"];

export function Countdown({ deadlineAt }: { deadlineAt: number }) {
  const [left, setLeft] = useState(Math.max(0, deadlineAt - Date.now()));
  useEffect(() => {
    const t = setInterval(() => setLeft(Math.max(0, deadlineAt - Date.now())), 1000);
    return () => clearInterval(t);
  }, [deadlineAt]);
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  const urgent = left < 3600000;
  return (
    <span
      className="chip figure"
      style={{
        color: urgent ? "var(--wax)" : "var(--gold2)",
        borderColor: urgent ? "color-mix(in srgb, var(--wax) 50%, transparent)" : "color-mix(in srgb, var(--gold) 40%, transparent)",
        animation: urgent ? "breathe 1.6s ease-in-out infinite" : undefined,
      }}
    >
      <Clock size={9} /> {h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`}
    </span>
  );
}

/** The living state of an accepted contract. No guessing what happens next. */
export default function ContractTimeline({
  escrow,
  onCancel,
}: {
  escrow: {
    state: string;
    progress?: string;
    deadlineAt: number | null;
    amountNIM: number;
    role?: string;
  };
  onCancel?: () => void;
}) {
  const progress = escrow.progress ?? "awaiting_proof";
  const currentIdx =
    escrow.state === "released" || escrow.state === "settled" ? 3 :
    progress === "submitted" ? 1 :
    progress === "verified" ? 2 : 0;

  if (escrow.state === "refunded" || escrow.state === "expired") {
    return (
      <div className="plate mt-3 flex items-center gap-2.5 rounded-2xl border-[var(--line)] p-3.5" style={{ borderColor: "color-mix(in srgb, var(--wax) 30%, transparent)" }}>
        <XCircle size={16} className="flex-none text-[var(--wax)]" />
        <div>
          <p className="text-[12.5px] font-semibold text-[var(--ink)]">
            {escrow.state === "expired" ? "Deadline passed — refunded" : "Cancelled — refunded"}
          </p>
          <p className="marginalia text-[11px]">
            {escrow.amountNIM.toLocaleString()} NIM returned to the locker. Nothing was lost.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="plate mt-3 rounded-2xl p-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <p className="caps text-[8px] text-[var(--ink3)]">Progress</p>
        {escrow.deadlineAt ? <Countdown deadlineAt={escrow.deadlineAt} /> : null}
      </div>
      <div className="space-y-0">
        {STEPS.map((label, i) => {
          const done = i < currentIdx || (i === 3 && escrow.state === "released");
          const active = i === currentIdx;
          return (
            <div key={label} className="flex gap-2.5">
              <div className="flex flex-col items-center">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full border"
                  style={{
                    borderColor: done ? "var(--verdigris)" : active ? "var(--gold)" : "var(--line2)",
                    background: done ? "var(--verdigris)" : "transparent",
                  }}
                >
                  {done ? (
                    <Check size={10} strokeWidth={3} className="text-[#1c1508]" />
                  ) : active ? (
                    <Hourglass size={9} className="text-[var(--gold2)]" />
                  ) : null}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="h-3.5 w-px" style={{ background: done ? "var(--verdigris)" : "var(--line2)" }} />
                )}
              </div>
              <p
                className="pb-3 text-[12px]"
                style={{ color: done ? "var(--ink)" : active ? "var(--gold2)" : "var(--ink3)" }}
              >
                {label}
              </p>
            </div>
          );
        })}
      </div>
      {onCancel && escrow.state === "locked" && (
        <button onClick={onCancel} className="ghost mt-1 w-full rounded-xl py-2 text-[11.5px] text-[var(--wax)]">
          Cancel — full refund
        </button>
      )}
    </div>
  );
}
