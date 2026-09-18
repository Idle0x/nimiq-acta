"use client";
import {
  createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode,
} from "react";
import { Check, X, Info, Vault } from "lucide-react";

/* ---------------- toasts ---------------- */

type Toast = { id: number; type: "success" | "error" | "info"; title: string; body?: string };
const ToastCtx = createContext<(t: Omit<Toast, "id">) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

function ToastCard({ t }: { t: Toast }) {
  const color = t.type === "success" ? "var(--verdigris)" : t.type === "error" ? "var(--wax)" : "var(--sky)";
  const Icon = t.type === "success" ? Check : t.type === "error" ? X : Info;
  return (
    <div className="floaty animate-slide-down pointer-events-auto flex items-start gap-2.5 rounded-2xl p-3">
      <span
        className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full"
        style={{ background: `color-mix(in srgb, ${color} 18%, transparent)`, color }}
      >
        <Icon size={12} strokeWidth={3} />
      </span>
      <div className="min-w-0">
        <p className="text-[12.5px] font-semibold leading-tight text-[var(--ink)]">{t.title}</p>
        {t.body ? <p className="marginalia mt-0.5 text-[11px] leading-snug">{t.body}</p> : null}
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts.slice(-2), { ...t, id }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 4200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed left-1/2 top-3 z-[300] w-[min(92vw,380px)] -translate-x-1/2 space-y-2">
        {toasts.map((t) => <ToastCard key={t.id} t={t} />)}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------------- success payoff ceremony ---------------- */

export function SuccessPayoff({
  open,
  locked,
  fee,
  onDone,
}: {
  open: boolean;
  locked: number;
  fee: number;
  onDone: () => void;
}) {
  const [shown, setShown] = useState(locked);
  const [feeGone, setFeeGone] = useState(false);
  const [check, setCheck] = useState(false);
  const raf = useRef<number>(0);
  const feeGoneRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    const net = Math.max(0, locked - fee);
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 1300);
      const e = 1 - Math.pow(1 - p, 3);
      setShown(Math.round((locked - (locked - net) * e) * 100) / 100);
      if (p > 0.5 && !feeGoneRef.current) {
        feeGoneRef.current = true;
        setFeeGone(true);
      }
      if (p < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        setCheck(true);
        setTimeout(onDone, 1000);
      }
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm animate-fade-in">
      <div className="plate relative w-full max-w-[340px] overflow-visible rounded-3xl p-7 text-center animate-scale-in">
        <div className="sunburst animate-spin-slow" />
        <div className="relative">
          <p className="caps text-[9px] text-[var(--gold)]">Act settled</p>

          <p className="figure mt-3 text-[40px] font-extrabold leading-none text-[var(--ink)]">
            {shown.toLocaleString()} <span className="text-lg font-bold text-[var(--gold2)]">NIM</span>
          </p>

          <div className="relative mx-auto mt-4 flex h-9 items-center justify-center">
            <span
              className="fee-fly figure absolute rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-bold text-[var(--wax)]"
              style={{
                border: "1px solid color-mix(in srgb, var(--wax) 45%, transparent)",
                transform: feeGone ? "translate(52px, -34px) scale(0.5)" : "translate(0,0)",
                opacity: feeGone ? 0 : 1,
              }}
            >
              −{fee} NIM fee
            </span>
            <span
              className="flex items-center gap-1.5 text-[10px] text-[var(--ink3)] transition-opacity duration-500"
              style={{ opacity: feeGone ? 1 : 0.35 }}
            >
              <Vault size={11} className="text-[var(--gold)]" /> to the treasury
            </span>
          </div>

          <svg viewBox="0 0 52 52" className="mx-auto mt-2 h-12 w-12">
            <circle
              cx="26" cy="26" r="24" fill="none"
              stroke="var(--verdigris)" strokeWidth="2.5"
              strokeDasharray="151" strokeDashoffset={check ? 0 : 151}
              style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.2,0.8,0.2,1)", transform: "rotate(-90deg)", transformOrigin: "center" }}
            />
            <path
              d="M15 27l8 8 15-17" fill="none"
              stroke="var(--verdigris)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="40" strokeDashoffset={check ? 0 : 40}
              style={{ transition: "stroke-dashoffset 0.5s ease 0.25s" }}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
