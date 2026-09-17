import { useEffect, useState } from "react";
import { CheckIcon } from "lucide-react";

export function SuccessPayoff({ amount, onClose }: { amount?: number, onClose: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // 0 = Initial pop, 1 = numbers rolling, 2 = fade out
    setTimeout(() => setStage(1), 100);
    setTimeout(() => setStage(2), 2000);
    setTimeout(() => onClose(), 2500);
  }, [onClose]);

  if (stage === 2) return null;

  return (
    <div className={`fixed inset-0 z-[100] pointer-events-none flex items-center justify-center transition-opacity duration-500 ${stage === 2 ? "opacity-0" : "opacity-100"}`}>
      <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm" />
      
      {/* Sunburst background */}
      <div className="absolute w-[200vw] h-[200vw] animate-spin-slow bg-[conic-gradient(from_0deg,transparent_0deg,rgba(52,211,153,0.1)_10deg,transparent_20deg)]" style={{ animationDuration: '10s' }} />
      
      <div className={`relative z-10 flex flex-col items-center transform transition-all duration-700 ${stage === 0 ? "scale-50 translate-y-10 opacity-0" : "scale-100 translate-y-0 opacity-100"}`}>
        <div className="w-24 h-24 bg-emerald-400 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(52,211,153,0.8)] border-4 border-emerald-200">
           <CheckIcon size={48} className="text-emerald-950 stroke-[3]" />
        </div>
        <h2 className="text-3xl font-black text-white mt-6 tracking-tight drop-shadow-md">ACT SETTLED</h2>
        {amount !== undefined && amount > 0 && (
          <p className="text-2xl font-bold text-emerald-400 mt-2 tnum drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
            +{amount.toLocaleString()} NIM
          </p>
        )}
      </div>
    </div>
  );
}
