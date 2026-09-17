"use client";

import { useEffect, useState } from "react";
import Reveal from "@/components/Reveal";
import {
  Plate,
  Seal,
  PressLink,
  GhostLink,
  Rule,
  Marginalia,
  Kicker,
} from "@/components/Paper";
import { Lock, Scan, Unlock, Eye, MapPin, UserCheck, ArrowUpRight } from "lucide-react";

const HEADLINE = ["Money", "moves", "when", "reality", "changes."];

const ORACLES = [
  {
    n: "I",
    name: "Cryptographic Signature",
    proof: "Ed25519 QR handshake",
    detail:
      "A lender's device signs a single-use, ten-minute token. The chain of custody is mathematical — no photograph, no trust, no intermediary. Replay is impossible by construction.",
  },
  {
    n: "II",
    name: "Machine Vision",
    proof: "Qwen vision oracle",
    detail:
      "A photo is submitted to a vision model sceptical by instruction. It answers one question only: does this image prove the act occurred? Doubt defaults to refusal.",
  },
  {
    n: "III",
    name: "Geolocation",
    proof: "GPS + accuracy bound",
    detail:
      "A check-in is accepted only inside a 50-metre accuracy bound and, where the creator pinned a location, within true haversine distance of it. HTML5 geolocation; hardened SDKs on the roadmap.",
  },
  {
    n: "IV",
    name: "Human Attestation",
    proof: "Creator-as-oracle",
    detail:
      "The creator who locked the funds attests completion personally, releasing the escrow with their own key. For everything a machine cannot yet see.",
  },
];

const DOCTRINE = [
  {
    icon: Lock,
    clause: "First Clause",
    title: "Lock",
    body: "Collateral is sealed in the protocol vault by a real on-chain transaction. One signature. No marketplace ever holds what is yours.",
    hover: "Every lock is a NIM transaction you can read on the explorer — the vault address is public, the flow is auditable.",
  },
  {
    icon: Scan,
    clause: "Second Clause",
    title: "Prove",
    body: "Reality answers. A QR scanned, a photograph judged, a coordinate crossed, a creator's nod. One of four oracles must be satisfied.",
    hover: "Each oracle type used deepens your Trust Score — the protocol rewards those who prove in many ways.",
  },
  {
    icon: Unlock,
    clause: "Third Clause",
    title: "Release",
    body: "The moment proof lands, funds move. Collateral returns minus a half-NIM protocol fee that sustains the treasury.",
    hover: "The fee is not rent — it is what funds every community reward, milestone and drip the protocol pays forward.",
  },
];

export default function Landing() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const s = data?.stats;
  const feed = (data?.feed ?? []).slice(0, 6);
  const fmt = (n: number) =>
    n?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? "—";

  return (
    <main className="relative">
      {/* ================= MASTHEAD ================= */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-md border-b border-[var(--line)]">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-3">
            <Seal size={36} className="!text-xs">A</Seal>
            <span className="caps text-sm tracking-[0.3em] font-semibold">Acta</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 caps text-[11px] text-[var(--ink2)]">
            <a href="#doctrine" className="hover:text-[var(--gold)] transition-colors">Doctrine</a>
            <a href="#oracles" className="hover:text-[var(--gold)] transition-colors">Oracles</a>
            <a href="#ledger" className="hover:text-[var(--gold)] transition-colors">Ledger</a>
          </nav>
          <PressLink href="/app" className="!px-5 !py-2.5 !text-xs">
            Enter the Protocol
          </PressLink>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section id="top" className="relative pt-36 pb-24 px-6 overflow-hidden">
        {/* breathing compass ornament */}
        <div className="pointer-events-none absolute -right-40 -top-24 opacity-[0.16] select-none" aria-hidden>
          <div className="breathe relative w-[520px] h-[520px]">
            <div className="absolute inset-0 rounded-full border border-[var(--ink)]" />
            <div className="absolute inset-[12%] rounded-full border border-dashed border-[var(--ink)] spin-slow" />
            <div className="absolute inset-[26%] rounded-full border border-[var(--ink)]" />
            <div className="absolute inset-[40%] rounded-full border border-dashed border-[var(--gold)] spin-slow" style={{ animationDirection: "reverse", animationDuration: "28s" }} />
            <div className="absolute inset-[48%] rounded-full bg-[var(--gold)]" />
          </div>
        </div>

        <div className="mx-auto max-w-5xl relative">
          <Reveal>
            <Kicker index="§ 1">A proof-of-action protocol for Nimiq</Kicker>
          </Reveal>

          <h1 className="h-display mt-6 text-[13.5vw] sm:text-7xl lg:text-8xl text-[var(--ink)] max-w-4xl">
            {HEADLINE.map((w, i) => (
              <span key={i} className="ink-word mr-[0.24em]" style={{ "--d": `${200 + i * 130}ms` } as React.CSSProperties}>
                {w === "reality" ? <em className="not-italic text-[var(--gold)]">{w}</em> : w}
              </span>
            ))}
          </h1>

          <Reveal delay={500} className="mt-8 max-w-xl">
            <p className="lede text-[var(--ink2)]">
              Acta binds digital value to physical deeds. Borrow a neighbour&apos;s drill
              by locking NIM; it returns when reality says so. Bounties, quests and
              favours settle the same way — <em>act, prove, paid.</em>
            </p>
          </Reveal>

          <Reveal delay={700} className="mt-10 flex flex-wrap items-center gap-4">
            <PressLink href="/app">Open the App</PressLink>
            <GhostLink href="#doctrine">Read the Doctrine</GhostLink>
            <Marginalia className="w-full md:w-auto md:ml-2">
              No installation. Lives inside Nimiq Pay.
            </Marginalia>
          </Reveal>

          {/* live stat ribbon */}
          <Reveal delay={900} className="mt-20">
            <div className="grid grid-cols-2 md:grid-cols-4 border-y border-[var(--line)] divide-x divide-[var(--line)]">
              {[
                { k: "Value Locked", v: s ? `${fmt(s.tvl_nim)} NIM` : "···" },
                { k: "30-Day Volume", v: s ? `${fmt(s.volume_30d)} NIM` : "···" },
                { k: "Protocol Fees", v: s ? `${fmt(s.treasury_fees)} NIM` : "···" },
                { k: "Rewards Paid", v: s ? `${fmt(s.treasury_distributed)} NIM` : "···" },
              ].map((st) => (
                <div key={st.k} className="px-5 py-6">
                  <p className="caps text-[9px] text-[var(--ink3)]">{st.k}</p>
                  <p className="figure text-xl md:text-2xl font-semibold mt-2 text-[var(--ink)]">{st.v}</p>
                </div>
              ))}
            </div>
            <Marginalia className="mt-3 text-xs">
              Figures read live from the protocol database and vault address.
            </Marginalia>
          </Reveal>
        </div>
      </section>

      {/* ================= DOCTRINE ================= */}
      <section id="doctrine" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <Rule className="mb-10"><span className="font-serif text-lg">&#10086;</span></Rule>
            <Kicker index="§ 2">The Doctrine</Kicker>
            <h2 className="h-display text-4xl sm:text-5xl mt-4 text-[var(--ink)]">
              Three clauses, <em className="not-italic text-[var(--gold)]">one loop.</em>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5 mt-14">
            {DOCTRINE.map((d, i) => (
              <Reveal key={d.title} delay={i * 140}>
                <Plate hover className="group relative p-7 h-full min-h-[300px] overflow-hidden">
                  <p className="caps text-[9px] text-[var(--gold)]">{d.clause}</p>
                  <div className="flex items-center gap-4 mt-5">
                    <span className="seal !bg-none bg-[var(--gold)] !shadow-none flex items-center justify-center w-11 h-11 rounded-full" style={{ background: "var(--gold)" }}>
                      <d.icon size={18} className="text-[#1c1508]" strokeWidth={1.8} />
                    </span>
                    <h3 className="h-display text-3xl text-[var(--ink)]">{d.title}</h3>
                  </div>
                  <p className="mt-5 text-[15px] leading-relaxed text-[var(--ink2)]">{d.body}</p>

                  {/* hover reveal — the plate's hidden margin note */}
                  <div className="absolute inset-x-0 bottom-0 p-7 pt-10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] border-t border-[var(--line)] backdrop-blur-sm">
                    <p className="marginalia text-[13px]">{d.hover}</p>
                  </div>
                </Plate>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ORACLES ================= */}
      <section id="oracles" className="px-6 py-24 bg-[color-mix(in_srgb,var(--surface)_55%,transparent)] border-y border-[var(--line)]">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <Kicker index="§ 3">The Oracle Registry</Kicker>
            <h2 className="h-display text-4xl sm:text-5xl mt-4 text-[var(--ink)]">
              Reality, witnessed four ways.
            </h2>
            <Marginalia className="mt-4 max-w-lg">
              Every act type names its oracle. A scan cannot satisfy a photograph;
              a photograph cannot satisfy a signature. The proof must fit the deed.
            </Marginalia>
          </Reveal>

          <div className="mt-12">
            {ORACLES.map((o, i) => (
              <Reveal key={o.n} delay={i * 90}>
                <div className="ledger-row group cursor-default">
                  <span className="figure text-sm text-[var(--gold)] w-8 shrink-0">{o.n}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-2xl text-[var(--ink)] leading-tight">{o.name}</p>
                    <p className="caps text-[9px] text-[var(--ink3)] mt-1">{o.proof}</p>
                    <p className="marginalia text-sm mt-3 max-h-0 opacity-0 overflow-hidden group-hover:max-h-40 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                      {o.detail}
                    </p>
                  </div>
                  <ArrowUpRight size={16} className="text-[var(--ink3)] group-hover:text-[var(--gold)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= LEDGER (live feed) ================= */}
      <section id="ledger" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <Rule className="mb-10"><span className="font-serif text-lg">&#10086;</span></Rule>
            <Kicker index="§ 4">The Ledger</Kicker>
            <h2 className="h-display text-4xl sm:text-5xl mt-4 text-[var(--ink)]">
              The protocol never sleeps.
            </h2>
          </Reveal>

          <div className="mt-12 grid lg:grid-cols-5 gap-8 items-start">
            <Reveal className="lg:col-span-3">
              <Plate className="p-2 sm:p-4">
                {feed.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="marginalia">The first entries are waiting to be written. Be clause one.</p>
                  </div>
                ) : (
                  <ul>
                    {feed.map((a: any) => (
                      <li key={a.id} className="ledger-row !border-b last:!border-0">
                        <span className="figure text-xs text-[var(--ink3)] w-24 shrink-0">
                          {new Date(a.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex-1 text-[15px] text-[var(--ink2)] truncate">
                          <span className="figure text-[var(--ink3)]">{a.actor?.slice(0, 10)}…</span>{" "}
                          settled a {a.oracle === "vision" ? "vision" : a.oracle === "geo" ? "geo" : a.oracle === "qr_sig" ? "signature" : a.oracle === "creator" ? "attested" : "protocol"} act
                        </span>
                        <span className="figure text-sm font-semibold text-[var(--gold)] shrink-0">
                          +{fmt(a.amountNIM)} NIM
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Plate>
            </Reveal>

            <Reveal delay={150} className="lg:col-span-2">
              <div className="space-y-5">
                <div className="plate p-6">
                  <p className="caps text-[9px] text-[var(--gold)]">The Trust Mechanic</p>
                  <p className="mt-4 text-[15px] leading-relaxed text-[var(--ink2)]">
                    Every settled act compounds a public score — completion, volume,
                    tenure, oracle diversity, community value — and a higher score
                    permanently lowers your collateral. Reputation is not a badge;
                    it is <em>buying power.</em>
                  </p>
                </div>
                <div className="plate p-6">
                  <p className="caps text-[9px] text-[var(--gold)]">The Treasury</p>
                  <p className="figure text-3xl font-semibold mt-3 text-[var(--ink)]">
                    {data?.vault?.balance_nim != null
                      ? `${data.vault.balance_nim.toLocaleString(undefined, { maximumFractionDigits: 0 })} NIM`
                      : "···"}
                  </p>
                  <Marginalia className="mt-2 text-xs">
                    Held at a public vault address, sustained entirely by protocol
                    fees — every reward the protocol pays comes from deeds already proven.
                  </Marginalia>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="px-6 py-28 text-center border-t border-[var(--line)]">
        <div className="mx-auto max-w-2xl">
          <Reveal>
            <div className="flex justify-center mb-8">
              <Seal size={72} className="!text-2xl">A</Seal>
            </div>
            <h2 className="h-display text-5xl sm:text-6xl text-[var(--ink)]">
              Put your NIM where<br /><em className="not-italic text-[var(--gold)]">the world is.</em>
            </h2>
            <Marginalia className="mt-6">
              Deeds settle in seconds. Reputation compounds forever.
            </Marginalia>
            <div className="mt-10 flex justify-center gap-4 flex-wrap">
              <PressLink href="/app" className="!px-8 !py-4">Enter the Protocol</PressLink>
              <GhostLink href="https://github.com/your-org/acta" className="!px-8 !py-4">Read the Code</GhostLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= COLOPHON ================= */}
      <footer className="px-6 py-10 border-t border-[var(--line)]">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="caps text-[9px] text-[var(--ink3)]">Acta — MMXXVI</p>
          <p className="marginalia text-xs text-center">
            Set in Cormorant, Garamond, Grotesk &amp; Plex. Printed on the Nimiq blockchain.
          </p>
          <p className="caps text-[9px] text-[var(--ink3)]">Money moves when reality changes.</p>
        </div>
      </footer>
    </main>
  );
}
