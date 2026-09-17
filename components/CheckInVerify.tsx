"use client";
import { useState } from "react";
import { MapPin, Check, AlertTriangle, Loader2 } from "lucide-react";

export default function CheckInVerify({ listingId }: { listingId: string }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  
  async function handleCheckIn() {
    if (!("geolocation" in navigator)) {
      setResult("FAIL: Geolocation unavailable on device");
      return;
    }
    setBusy(true);
    setResult(null);
    
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        try {
          const res = await fetch("/api/bounty/geo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              listingId, 
              lat: p.coords.latitude, 
              lng: p.coords.longitude, 
              accuracy: p.coords.accuracy 
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setResult(`Oracle error: ${data.error || res.statusText}`);
          } else if (data.pass) {
            setResult(`PASS · ${data.reason}`);
          } else {
            setResult(`FAIL · ${data.reason}`);
          }
        } catch (e) {
          setResult(e instanceof Error ? e.message : "verify failed");
        } finally {
          setBusy(false);
        }
      },
      (err) => {
        setResult(`FAIL: Location denied or timeout (${err.message})`);
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/60 p-3">
      <button
        onClick={handleCheckIn}
        disabled={busy}
        className={`w-full flex items-center justify-center gap-2 rounded-lg bg-sky-400 py-2.5 text-xs font-bold text-slate-950 disabled:opacity-50 transition-all btn-press`}
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
        {busy ? "Acquiring satellites..." : "Check In via GPS"}
      </button>

      {result && (
        <div className={`mt-3 flex items-start gap-2 rounded-xl p-3 animate-scale-in ${
          result.startsWith("PASS") ? "bg-emerald-950/30 border border-emerald-500/30 text-emerald-200" : "bg-rose-950/30 border border-rose-500/30 text-rose-200"
        }`}>
          {result.startsWith("PASS") ? (
            <Check className="mt-0.5 shrink-0 text-emerald-400" size={16} />
          ) : (
            <AlertTriangle className="mt-0.5 shrink-0 text-rose-400" size={16} />
          )}
          <p className="text-xs leading-relaxed">{result}</p>
        </div>
      )}
    </div>
  );
}
