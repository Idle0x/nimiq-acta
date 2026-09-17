"use client";

import { useRef, useState } from "react";
import { MapPin, Camera, Check, AlertTriangle, Loader2 } from "lucide-react";

type Verdict = { pass: boolean; reason: string; model?: string } | { error: string };

export default function BountyVerify({ task, listingId }: { task: string; listingId: string }) {
  const [geo, setGeo] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  
  const [busy, setBusy] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const [geoData, setGeoData] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);

  // Simulated live terminal streaming
  async function streamLogs(resultFn: () => Promise<void>) {
    setBusy(true);
    setLogs(["> Encrypting image payload..."]);
    
    setTimeout(() => setLogs(l => [...l, "> Establishing connection to Hetzner Inference (Vision Oracle)..."]), 600);
    setTimeout(() => setLogs(l => [...l, "> Analyzing scene context and geometa..."]), 1500);
    setTimeout(() => setLogs(l => [...l, `> Cross-referencing task: "${task}"...`]), 2500);
    
    try {
      await resultFn();
    } finally {
      setBusy(false);
    }
  }

  const fileRef = useRef<HTMLInputElement>(null);

  function captureGeo() {
    if (!("geolocation" in navigator)) {
      setGeo("geolocation unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setGeoData({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy });
        setGeo(
          `${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)} (±${Math.round(p.coords.accuracy)}m)`
        );
      },
      () => setGeo("location denied — bounty needs location"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function fileToDataUrl(f: File): Promise<string> {
    const buf = await f.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let bin = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return `data:${f.type || "image/jpeg"};base64,${btoa(bin)}`;
  }

  async function onFile(f: File | undefined) {
    if (!f) return;
    setResult(null);
    const url = await fileToDataUrl(f);
    setPreview(url);
  }

  
  async function onVerify() {
    if (!preview) return;
    setResult(null);
    
    await streamLogs(async () => {
      try {
        const res = await fetch("/api/bounty/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task, imageUrl: preview, listingId, geo: geoData }),
        });
        const data = (await res.json()) as Verdict;
        
        setTimeout(() => {
            if (!res.ok) {
              setResult(`Oracle error: ${"error" in data ? data.error : res.statusText}`);
            } else if ("pass" in data) {
              setResult(`${data.pass ? "PASS" : "FAIL"} · ${data.reason} (${data.model ?? "vision"})`);
              setLogs(l => [...l, data.pass ? "> VERIFIED: Reality check passed. Funds unlocked." : "> REJECTED: Task criteria not met."]);
            }
        }, 3200); // Wait for the terminal animation
      } catch (err) {
        setTimeout(() => setResult(err instanceof Error ? err.message : "verify failed"), 3200);
      }
    });
  }


  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={captureGeo}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/15 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/5 btn-press"
        >
          <MapPin size={14} className="text-amber-300" />
          {geo ? geo : "Capture location"}
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/15 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/5 btn-press"
        >
          <Camera size={14} className="text-amber-300" />
          {preview ? "Retake photo" : "Take photo"}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="bounty proof" className="mt-2 max-h-40 w-full rounded-lg object-cover" />
      )}
      
      
      {busy && (
        <div className="mt-2 rounded-xl bg-black border border-amber-500/20 p-3 font-mono text-[10px] text-amber-500/80 animate-fade-in shadow-[inset_0_0_10px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
            <Loader2 size={12} className="animate-spin text-amber-400" />
            <span className="font-bold text-amber-400 tracking-wider">ORACLE TERMINAL</span>
          </div>
          <div className="space-y-1.5 opacity-90 h-[70px] overflow-hidden flex flex-col justify-end">
            {logs.map((log, i) => (
              <p key={i} className="animate-slide-up leading-tight">{log}</p>
            ))}
          </div>
        </div>
      )}
      
      {!busy && (
          <button
            onClick={onVerify}
            disabled={!preview}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 py-2.5 text-xs font-bold text-slate-950 disabled:opacity-50 transition-all btn-press ${
              preview ? "shadow-[0_0_12px_rgba(251,191,36,0.4)]" : ""
            }`}
          >
            Submit to Vision Oracle
          </button>
      )}


      {result && (
        <div
          className={`mt-3 flex items-start gap-2 rounded-xl p-3 animate-scale-in ${
            result.startsWith("PASS")
              ? "bg-emerald-950/30 border border-emerald-500/30 text-emerald-200"
              : "bg-rose-950/30 border border-rose-500/30 text-rose-200"
          }`}
        >
          {result.startsWith("PASS") ? (
            <Check className="mt-0.5 shrink-0 text-emerald-400" size={16} />
          ) : (
            <AlertTriangle className="mt-0.5 shrink-0 text-rose-400" size={16} />
          )}
          <p className="text-xs leading-relaxed">{result}</p>
        </div>
      )}
      
      <p className="mt-2 text-[10px] text-slate-500 text-center">
        Hetzner Inference · Qwen3.6 vision · 10 req/60s limit · disclosed: screens can spoof.
      </p>
    </div>
  );
}
