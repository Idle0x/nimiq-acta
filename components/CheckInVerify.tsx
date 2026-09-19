"use client";
import { useEffect, useRef, useState } from "react";
import { MapPin, Check, AlertTriangle, Loader2, Camera } from "lucide-react";
import { humanize } from "@/lib/errors";

export default function CheckInVerify({ listingId, onSuccess }: { listingId: string; onSuccess?: () => void }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [needsPhoto, setNeedsPhoto] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/listings/${listingId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setNeedsPhoto(Boolean(d?.listing?.contract?.ai?.presenceCheck)))
      .catch(() => {});
  }, [listingId]);

  async function fileToDataUrl(f: File): Promise<string> {
    const { fileToOptimizedDataUrl } = await import("@/lib/image");
    return fileToOptimizedDataUrl(f);
  }

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
              accuracy: p.coords.accuracy,
              ...(photo ? { imageUrl: photo } : {}),
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            setResult(humanize(`Oracle error: ${data.error || res.statusText}`));
          } else if (data.pass) {
            setResult(`PASS · ${data.reason}`);
        onSuccess?.();
          } else {
            setResult(`FAIL · ${data.reason}`);
          }
        } catch (e) {
          setResult(humanize(e));
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
    <div className="mt-3 rounded-xl border border-[var(--line)]/10 bg-[var(--bg)]/60 p-3">
      {needsPhoto && (
        <button
          onClick={() => fileRef.current?.click()}
          className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--line)]/10 py-2 text-xs font-semibold text-[var(--ink2)] transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] btn-press"
        >
          <Camera size={14} className="text-[var(--gold)]" />
          {photo ? "Retake scene photo" : "Add scene photo (required)"}
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) setPhoto(await fileToDataUrl(f));
        }} />
      <button
        onClick={handleCheckIn}
        disabled={busy || (needsPhoto && !photo)}
        className={`w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--sky)] py-2.5 text-xs font-bold text-[#1c1508] disabled:opacity-50 transition-all btn-press`}
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
        {busy ? "Acquiring satellites..." : "Check In via GPS"}
      </button>

      {result && (
        <div className={`mt-3 flex items-start gap-2 rounded-xl p-3 animate-scale-in ${
          result.startsWith("PASS") ? "bg-[var(--verdigris)]/30 border border-[var(--verdigris)]/30 text-[var(--verdigris)]" : "bg-[var(--wax)]/30 border border-[var(--wax)]/30 text-[var(--wax)]"
        }`}>
          {result.startsWith("PASS") ? (
            <Check className="mt-0.5 shrink-0 text-[var(--verdigris)]" size={16} />
          ) : (
            <AlertTriangle className="mt-0.5 shrink-0 text-[var(--wax)]" size={16} />
          )}
          <p className="text-xs leading-relaxed">{result}</p>
        </div>
      )}
    </div>
  );
}
