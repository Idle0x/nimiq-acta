"use client";

import { useState } from "react";
import { Eye, QrCode, MapPin, CheckCircle, XCircle, Sparkles, Send } from "lucide-react";

export default function OracleSimulator() {
  const [oracleType, setOracleType] = useState<"vision" | "qr" | "geo">("vision");

  // Vision state
  const [criteria, setCriteria] = useState("Photo must show cleared street gutter with green recyclable bag filled and tied.");
  const [submission, setSubmission] = useState("A photo showing clean pavement and a green tied bag beside the curb.");
  const [visionVerdict, setVisionVerdict] = useState<{ pass: boolean; reason: string } | null>({
    pass: true,
    reason: "Pavement cleared with green bag tied beside curb as requested.",
  });
  const [evaluating, setEvaluating] = useState(false);

  // Geo state
  const [targetLat, setTargetLat] = useState(48.8584);
  const [targetLng, setTargetLng] = useState(2.2945);
  const [userLat, setUserLat] = useState(48.8585);
  const [userLng, setUserLng] = useState(2.2946);
  const [accuracy, setAccuracy] = useState(15);

  // Calculate haversine distance
  function calcDistanceM(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }

  const geoDistance = calcDistanceM(targetLat, targetLng, userLat, userLng);
  const geoPass = geoDistance <= 50 && accuracy <= 50;

  function handleSimulateVision() {
    setEvaluating(true);
    setTimeout(() => {
      // Sceptical logic heuristic simulation of Qwen 3.6
      const critLower = criteria.toLowerCase();
      const subLower = submission.toLowerCase();

      const keywords = critLower
        .split(" ")
        .filter((w) => w.length > 3)
        .map((w) => w.replace(/[^a-z]/g, ""));
      const matchCount = keywords.filter((k) => subLower.includes(k)).length;
      const pass = matchCount >= Math.max(1, Math.floor(keywords.length * 0.4));

      if (pass) {
        setVisionVerdict({
          pass: true,
          reason: "Scene clearly satisfies all sponsor criteria under sceptical review.",
        });
      } else {
        setVisionVerdict({
          pass: false,
          reason: "Doubt in proof satisfaction. Image does not unambiguously fulfill stated criteria.",
        });
      }
      setEvaluating(false);
    }, 400);
  }

  return (
    <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 my-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[var(--line)]">
        <div>
          <span className="caps text-[9px] text-[var(--gold)] tracking-widest font-bold block mb-1">
            Oracle Testbed
          </span>
          <h3 className="font-display text-2xl font-bold text-[var(--ink)]">
            Autonomous Oracle Verification Playground
          </h3>
          <p className="marginalia text-xs mt-1 text-[var(--ink2)] max-w-xl">
            Test how Acta's deterministic and AI oracles judge real-world evidence and trigger smart settlements.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={() => setOracleType("vision")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            oracleType === "vision"
              ? "bg-[var(--gold)] text-[#1c1508]"
              : "bg-black/20 text-[var(--ink2)] hover:text-[var(--ink)]"
          }`}
        >
          <Eye size={14} /> Vision Oracle (Qwen 3.6 on Hetzner)
        </button>
        <button
          onClick={() => setOracleType("qr")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            oracleType === "qr"
              ? "bg-[var(--gold)] text-[#1c1508]"
              : "bg-black/20 text-[var(--ink2)] hover:text-[var(--ink)]"
          }`}
        >
          <QrCode size={14} /> ScanQuest / QR Token (Ed25519)
        </button>
        <button
          onClick={() => setOracleType("geo")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            oracleType === "geo"
              ? "bg-[var(--gold)] text-[#1c1508]"
              : "bg-black/20 text-[var(--ink2)] hover:text-[var(--ink)]"
          }`}
        >
          <MapPin size={14} /> Geofence (Haversine 50m)
        </button>
      </div>

      {/* Vision Oracle Simulator */}
      {oracleType === "vision" && (
        <div className="mt-6 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--gold)] block mb-1">
                Sponsor Criteria Prompt (Input to Qwen 3.6 System)
              </label>
              <textarea
                rows={2}
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                className="w-full rounded-xl bg-black/30 border border-[var(--line)] p-3 text-xs text-[var(--ink)] outline-none focus:border-[var(--gold)] font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--sky)] block mb-1">
                Challenger Submitted Proof Scene Description
              </label>
              <textarea
                rows={2}
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                className="w-full rounded-xl bg-black/30 border border-[var(--line)] p-3 text-xs text-[var(--ink)] outline-none focus:border-[var(--gold)] font-mono"
              />
            </div>
            <button
              onClick={handleSimulateVision}
              disabled={evaluating}
              className="press px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Send size={12} /> {evaluating ? "Evaluating Proof…" : "Run Oracle Inspection"}
            </button>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-2xl bg-black/40 border border-[var(--line)]">
            <div>
              <span className="caps text-[9px] text-[var(--ink3)] block mb-2">Oracle Verdict Payload (JSON)</span>
              {visionVerdict ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {visionVerdict.pass ? (
                      <span className="caps text-[9px] px-2.5 py-1 rounded-full font-bold bg-[var(--verdigris)]/15 border border-[var(--verdigris)] text-[var(--verdigris)] flex items-center gap-1">
                        <CheckCircle size={12} /> VERDICT: PASS (SETTLED)
                      </span>
                    ) : (
                      <span className="caps text-[9px] px-2.5 py-1 rounded-full font-bold bg-[var(--wax)]/15 border border-[var(--wax)] text-[var(--wax)] flex items-center gap-1">
                        <XCircle size={12} /> VERDICT: REFUSED (DOUBT)
                      </span>
                    )}
                  </div>
                  <pre className="font-mono text-[11px] p-3 rounded-xl bg-black/50 border border-[var(--line)] text-[var(--ink)] overflow-x-auto">
                    {JSON.stringify(visionVerdict, null, 2)}
                  </pre>
                  <p className="text-[11px] text-[var(--ink3)] leading-relaxed">
                    Sceptical AI instruction: "When in doubt, pass=false". Rejects stock photos, screenshots, and ambiguous angles.
                  </p>
                </div>
              ) : (
                <p className="marginalia text-xs">Run inspection to view JSON output.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Oracle Simulator */}
      {oracleType === "qr" && (
        <div className="mt-6 p-5 rounded-2xl bg-black/30 border border-[var(--line)] space-y-4">
          <span className="caps text-[9px] text-[var(--gold)] block">Ed25519 Proximity Handshake Token Format</span>
          <pre className="font-mono text-[11px] p-3.5 rounded-xl bg-black/50 border border-[var(--line)] text-[var(--gold2)] overflow-x-auto">
{`// Cryptographic return payload structure (lib/qr.ts)
{
  "escrowId": "esc_94f8a12e...",
  "amount": 2500,
  "chain": "nimiq-pos",
  "lender": "NQ86 845N NUJ3...",
  "nonce": "c948e1a7b5d2f4a1",    // Consumed into DB on verify (zero replay)
  "exp": ${Date.now() + 600000}       // 10-minute expiry window
}
// Signature: Ed25519 curve over sha512(payload) -> Base64URL`}
          </pre>
          <div className="grid sm:grid-cols-2 gap-4 text-xs text-[var(--ink2)]">
            <div className="p-3 rounded-xl bg-white/5 border border-[var(--line)]/50">
              <strong className="text-[var(--ink)] block mb-1">Mathematical Guarantee</strong>
              The signature cannot be forged or replayed. The moment the QR is scanned, the nonce is burned in the database, and the vault fires the sub-second payout.
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-[var(--line)]/50">
              <strong className="text-[var(--ink)] block mb-1">WebRTC Video Scanner</strong>
              Uses direct camera video streams with continuous frame analysis and photo upload fallback for mobile browsers.
            </div>
          </div>
        </div>
      )}

      {/* Geofence Simulator */}
      {oracleType === "geo" && (
        <div className="mt-6 space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-[var(--ink3)] block mb-1">Target Coordinates (Pinned)</label>
              <input
                type="text"
                disabled
                value={`${targetLat}, ${targetLng}`}
                className="w-full rounded-xl bg-black/30 border border-[var(--line)] p-2 font-mono text-xs text-[var(--gold)]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[var(--ink3)] block mb-1">Your Simulated Coordinates</label>
              <input
                type="text"
                value={`${userLat}, ${userLng}`}
                onChange={(e) => {
                  const [lat, lng] = e.target.value.split(",").map((v) => Number(v.trim()));
                  if (!isNaN(lat) && !isNaN(lng)) {
                    setUserLat(lat);
                    setUserLng(lng);
                  }
                }}
                className="w-full rounded-xl bg-black/30 border border-[var(--line)] p-2 font-mono text-xs text-[var(--ink)]"
              />
            </div>
            <div>
              <label className="text-[11px] text-[var(--ink3)] block mb-1">GPS Accuracy Radius (Metres)</label>
              <input
                type="number"
                value={accuracy}
                onChange={(e) => setAccuracy(Number(e.target.value))}
                className="w-full rounded-xl bg-black/30 border border-[var(--line)] p-2 font-mono text-xs text-[var(--ink)]"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-[var(--ink2)]">Computed Haversine Distance: </span>
              <strong className="font-mono text-sm text-[var(--ink)]">{geoDistance} metres</strong>
              <span className="text-[11px] text-[var(--ink3)] block mt-0.5">
                Protocol threshold: &le; 50m distance AND &le; 50m accuracy
              </span>
            </div>
            <span
              className={`caps text-[10px] font-bold px-3 py-1.5 rounded-full border ${
                geoPass
                  ? "bg-[var(--verdigris)]/15 border-[var(--verdigris)] text-[var(--verdigris)]"
                  : "bg-[var(--wax)]/15 border-[var(--wax)] text-[var(--wax)]"
              }`}
            >
              {geoPass ? "✓ Within Geofence (Eligible)" : "✕ Outside Geofence (Rejected)"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
