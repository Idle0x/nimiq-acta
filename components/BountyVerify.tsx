"use client";

import { useRef, useState } from "react";
import { MapPin, Camera, Check, AlertTriangle, Loader2 } from "lucide-react";

type Verdict = { pass: boolean; reason: string; model?: string } | { error: string };

export default function BountyVerify({ task, listingId }: { task: string; listingId: string }) {
  const [geo, setGeo] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  
  const [busy, setBusy] = useState(false);
  const [geoData, setGeoData] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
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
    setBusy(true);
    
    try {
      const res = await fetch("/api/bounty/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, imageUrl: preview, listingId, geo: geoData }),
      });
      const data = (await res.json()) as Verdict;
      
      if (!res.ok) {
        setResult(`Oracle error: ${"error" in data ? data.error : res.statusText}`);
      } else if ("pass" in data) {
        setResult(`${data.pass ? "PASS" : "FAIL"} · ${data.reason} (${data.model ?? "vision"})`);
      }
    } catch (err) {
      setResult(err instanceof Error ? err.message : "verify failed");
    } finally {
      setBusy(false);
    }
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
      
      <button
        onClick={onVerify}
        disabled={!preview || busy}
        className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-amber-400 py-2.5 text-xs font-bold text-slate-950 disabled:opacity-50 transition-all btn-press ${
          preview && !busy ? "shadow-[0_0_12px_rgba(251,191,36,0.4)]" : ""
        }`}
      >
        {busy ? <Loader2 size={14} className="animate-spin text-slate-950" /> : null}
        {busy ? "Verifying with Vision Oracle..." : "Submit to Vision Oracle"}
      </button>


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
