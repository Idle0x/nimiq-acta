"use client";
import { Camera, QrCode, MapPin, UserCheck, Sparkles } from "lucide-react";
import { DEFAULT_CONTRACT, hoursLabel, oracleForKind, type ListingContract } from "@/lib/contract";

function Toggle({ on, onClick, label, sub }: { on: boolean; onClick: () => void; label: string; sub: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--line2)] bg-black/20 p-3 text-left transition-colors"
      style={on ? { borderColor: "color-mix(in srgb, var(--gold) 45%, transparent)" } : undefined}
    >
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--ink)]">
          <Sparkles size={11} className={on ? "text-[var(--gold2)]" : "text-[var(--ink3)]"} /> {label}
        </span>
        <span className="marginalia mt-0.5 block text-[10.5px] leading-snug">{sub}</span>
      </span>
      <span
        className="flex h-6 w-11 flex-none items-center rounded-full p-1 transition-colors"
        style={{ background: on ? "var(--gold)" : "var(--bg3)", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)" }}
      >
        <span
          className="h-4 w-4 rounded-full bg-[var(--ink)] transition-transform"
          style={{ transform: on ? "translateX(20px)" : "translateX(0)" }}
        />
      </span>
    </button>
  );
}

function ChipRow({ options, value, onPick }: { options: number[]; value: number; onPick: (v: number) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onPick(o)}
          className="chip figure"
          style={
            value === o
              ? { color: "var(--gold2)", borderColor: "color-mix(in srgb, var(--gold) 55%, transparent)", background: "var(--gold-dim)" }
              : undefined
          }
        >
          {hoursLabel(o)}
        </button>
      ))}
    </div>
  );
}

/**
 * The contract-writing step for challenge creation.
 * PhotoProof: AI primary, non-negotiable. The others: AI as an optional second witness.
 */
export default function AiOracleConfig({
  kind,
  value,
  onChange,
}: {
  kind: string;
  value: ListingContract;
  onChange: (c: ListingContract) => void;
}) {
  const oracle = oracleForKind(kind);
  const set = (patch: Partial<ListingContract>) => onChange({ ...value, ...patch });
  const setAi = (patch: Partial<ListingContract["ai"]>) => onChange({ ...value, ai: { ...value.ai, ...patch } });

  const KIND_COPY: Record<string, { Icon: any; title: string; sub: string }> = {
    vision: { Icon: Camera, title: "PhotoProof", sub: "The AI is the judge. Every photo is checked against your criteria — non-negotiable." },
    qr: { Icon: QrCode, title: "ScanQuest", sub: "The signed QR is the proof. Add AI vision if the token could be shared online." },
    geo: { Icon: MapPin, title: "CheckIn", sub: "GPS is the proof. Add AI vision to demand a photo of the actual place." },
    creator: { Icon: UserCheck, title: "Request", sub: "You are the judge. Let the AI pre-screen submissions so you only review real matches." },
  };
  const copy = KIND_COPY[oracle] ?? KIND_COPY.vision;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl" style={{ background: "var(--gold-dim)", color: "var(--gold2)" }}>
          <copy.Icon size={16} />
        </span>
        <div>
          <p className="font-display text-[15px] font-semibold text-[var(--ink)]">{copy.title}</p>
          <p className="marginalia text-[11.5px] leading-snug">{copy.sub}</p>
        </div>
      </div>

      <div>
        <label className="caps mb-1.5 block text-[8px] text-[var(--ink3)]">
          What must the proof show? <span className="text-[var(--wax)]">required</span>
        </label>
        <textarea
          value={value.criteria}
          onChange={(e) => set({ criteria: e.target.value })}
          rows={3}
          placeholder="e.g. A clear daylight photo of the broken bench on Elm St, the park sign visible, no people in frame."
          className="w-full resize-none rounded-xl border border-[var(--line2)] bg-black/25 p-3 font-serif text-[13.5px] italic leading-relaxed text-[var(--ink)] placeholder:text-[var(--ink3)] focus:outline-none"
          style={{ borderColor: value.criteria.trim() ? "color-mix(in srgb, var(--gold) 40%, transparent)" : undefined }}
        />
        <p className="marginalia mt-1 text-[10.5px]">
          This text is inserted into the oracle's prompt verbatim. Vague criteria get vague verdicts.
        </p>
      </div>

      {oracle === "qr" && (
        <Toggle
          on={value.ai.presenceCheck}
          onClick={() => setAi({ presenceCheck: !value.ai.presenceCheck })}
          label="AI scene check"
          sub="Completers must also submit a photo of the location. Stops the QR being shared online."
        />
      )}
      {oracle === "geo" && (
        <Toggle
          on={value.ai.presenceCheck}
          onClick={() => setAi({ presenceCheck: !value.ai.presenceCheck })}
          label="AI photo at location"
          sub="GPS alone can be spoofed; a matching photo of the place cannot."
        />
      )}
      {oracle === "creator" && (
        <Toggle
          on={value.ai.preScreen}
          onClick={() => setAi({ preScreen: !value.ai.preScreen })}
          label="AI pre-screening"
          sub="The AI scores each submission against your criteria and recommends approve / reject. You always sign the release."
        />
      )}

      {oracle === "geo" && (
        <div className="rounded-xl border border-[var(--line2)] bg-black/20 p-3">
          <label className="caps mb-1.5 block text-[8px] text-[var(--ink3)]">Where must they stand?</label>
          {value.geo ? (
            <p className="figure text-[12px] text-[var(--ink)]">
              {value.geo.lat.toFixed(5)}, {value.geo.lng.toFixed(5)} <span className="text-[var(--ink3)]">± {value.geo.radiusM}m</span>
            </p>
          ) : (
            <p className="marginalia text-[11px]">No pin yet — anyone within GPS accuracy can check in. Pin this spot to draw a radius.</p>
          )}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button type="button"
              onClick={() => {
                if (!("geolocation" in navigator)) return;
                navigator.geolocation.getCurrentPosition(
                  (pos) => set({ geo: { lat: pos.coords.latitude, lng: pos.coords.longitude, radiusM: value.geo?.radiusM ?? 150 } }),
                  () => {},
                  { enableHighAccuracy: true, timeout: 8000 }
                );
              }}
              className="chip">
              <MapPin size={9} /> Pin my location
            </button>
            {[50, 150, 500].map((r) => (
              <button key={r} type="button" onClick={() => value.geo && set({ geo: { ...value.geo, radiusM: r } })}
                className="chip figure"
                style={value.geo?.radiusM === r
                  ? { color: "var(--gold2)", borderColor: "color-mix(in srgb, var(--gold) 55%, transparent)", background: "var(--gold-dim)" }
                  : undefined}>
                ±{r}m
              </button>
            ))}
            {value.geo && (
              <button type="button" onClick={() => set({ geo: undefined })}
                className="chip" style={{ color: "var(--wax)" }}>Clear pin</button>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="caps mb-1.5 block text-[8px] text-[var(--ink3)]">Complete within (after accepting)</label>
        <ChipRow options={[24, 72, 168, 720]} value={value.deadlineHours} onPick={(v) => set({ deadlineHours: v })} />
      </div>

      <div>
        <label className="caps mb-1.5 block text-[8px] text-[var(--ink3)]">Listing stays open for</label>
        <ChipRow options={[24, 168, 720]} value={value.expiresInHours} onPick={(v) => set({ expiresInHours: v })} />
      </div>

      <div>
        <label className="caps mb-1.5 block text-[8px] text-[var(--ink3)]">Who may accept</label>
        <div className="flex gap-1.5">
          {[0, 30, 60].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set({ minTrust: t })}
              className="chip figure"
              style={
                value.minTrust === t
                  ? { color: "var(--gold2)", borderColor: "color-mix(in srgb, var(--gold) 55%, transparent)", background: "var(--gold-dim)" }
                  : undefined
              }
            >
              {t === 0 ? "Anyone" : `Trust ≥ ${t}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
