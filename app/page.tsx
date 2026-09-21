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
import { Lock, Scan, Unlock, Eye, MapPin, UserCheck, ArrowUpRight, Calendar, Award, Share2, Coins, History, ShieldCheck } from "lucide-react";

const HEADLINE = ["Money", "moves", "when", "reality", "changes."];

const RITES = [
  {
    num: "I",
    title: "Daily Vigil & Continuous Streaks",
    tag: "Attestation of Presence",
    icon: Calendar,
    summary: "Mark daily physical presence with a single tap to build unbroken calendar streaks.",
    privilege: "Honors active network participants with compounding streak attestation. Maintaining continuous daily attendance unlocks periodic treasury honorariums and boosts your tenure weight across all protocol calculations.",
    route: "/app?tab=passport",
    actionText: "Verify Daily Attendance",
  },
  {
    num: "II",
    title: "Sovereign Proof Stamps",
    tag: "Verifiable Deed Insignias",
    icon: Award,
    summary: "Mint permanent cryptographic seals directly onto your Acta Passport for verified actions.",
    privilege: "Every completed deed — from custody returns to vision-judged tasks and quest discoveries — etches an undeniable badge into the ledger. These seals directly elevate your Trust Score, granting up to 50% collateral discounts on future borrowings.",
    route: "/app?tab=passport",
    actionText: "Inspect Collection",
  },
  {
    num: "III",
    title: "Herald's Call & Peer Covenants",
    tag: "Reciprocal Community Bonds",
    icon: Share2,
    summary: "Onboard peers via your unique cryptographic referral covenant link.",
    privilege: "When an invited peer settles their inaugural deed, the protocol treasury pays autonomous grants to both counterparty wallets simultaneously. A reciprocal pact ensuring collective expansion is mutually endowed.",
    route: "/app?tab=passport",
    actionText: "Invite Counterparties",
  },
  {
    num: "IV",
    title: "Autonomous Milestone Drips",
    tag: "Treasury Performance Grants",
    icon: Coins,
    summary: "Unlock milestone rewards as your covenant volume and track record mature.",
    privilege: "The protocol fee treasury continuously reinvests in its participants. Achieving career milestones — your first lock, first settlement, volume thresholds, or dispute-free loan records — triggers direct, autonomous grants from the vault reserve.",
    route: "/app?tab=passport",
    actionText: "Track Milestones",
  },
  {
    num: "V",
    title: "The Immutable Deed Scroll",
    tag: "Mathematical Memory",
    icon: History,
    summary: "An undeniable, explorer-linked ledger of every transaction and verdict.",
    privilege: "No central database can wipe or fabricate your integrity. Every act records its cryptographic nonces, oracle proof JSON, and on-chain transaction hashes. A portable proof-of-action resume valid across the decentralized web.",
    route: "/app?tab=active",
    actionText: "Examine Public Registers",
  },
];

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
  const [activeRite, setActiveRite] = useState<number>(0);

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});

    try {
      if (typeof window !== "undefined") {
        const ref = new URLSearchParams(window.location.search).get("ref");
        if (ref) localStorage.setItem("acta_ref", ref);
      }
    } catch {}
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
            <a href="#privileges" className="hover:text-[var(--gold)] transition-colors">Privileges</a>
            <a href="/docs" className="hover:text-[var(--gold)] transition-colors text-[var(--gold)] font-bold">Docs</a>
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
            <GhostLink href="/docs">Protocol Docs</GhostLink>
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
                <Plate hover className="group flex flex-col h-fit overflow-hidden">
                  <div className="p-7">
                    <p className="caps text-[9px] text-[var(--gold)]">{d.clause}</p>
                    <div className="flex items-center gap-4 mt-5">
                      <span className="seal !bg-none bg-[var(--gold)] !shadow-none flex items-center justify-center w-11 h-11 rounded-full" style={{ background: "var(--gold)" }}>
                        <d.icon size={18} className="text-[#1c1508]" strokeWidth={1.8} />
                      </span>
                      <h3 className="h-display text-3xl text-[var(--ink)]">{d.title}</h3>
                    </div>
                    <p className="mt-5 text-[15px] leading-relaxed text-[var(--ink2)]">{d.body}</p>
                  </div>
                  <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                    <div className="overflow-hidden">
                      <div className="p-7 pt-6 bg-[color-mix(in_srgb,var(--verdigris)_12%,transparent)] border-t border-[color-mix(in_srgb,var(--verdigris)_20%,transparent)]">
                        <p className="marginalia text-[13px] text-[color-mix(in_srgb,var(--ink)_80%,var(--verdigris))] saturate-150">
                          {d.hover}
                        </p>
                      </div>
                    </div>
                  </div>
                </Plate>
              </Reveal>
            ))}
          </div>

          <Reveal delay={450} className="mt-10">
            <div className="p-6 sm:p-7 rounded-2xl bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] border border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-1 max-w-xl">
                <span className="caps text-[9px] text-[var(--gold)] font-bold tracking-widest block">
                  Protocol Specification
                </span>
                <h3 className="h-display text-2xl text-[var(--ink)]">
                  Explore the Complete Proof-of-Action Architecture
                </h3>
                <p className="text-xs text-[var(--ink2)] leading-relaxed">
                  Deep-dive into the formal protocol specification: Nimiq PoS Albatross sub-second finality, 0.0001 NIM fees, Qwen 3.6 vision oracles, algorithmic trust formulas, and interactive escrow calculators.
                </p>
              </div>
              <a
                href="/docs"
                className="press self-start sm:self-auto px-5 py-3 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 shrink-0"
              >
                Read Protocol Docs <ArrowUpRight size={13} />
              </a>
            </div>
          </Reveal>
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
                <a href={o.n === "I" ? "/app" : o.n === "II" ? "/app?tab=active" : o.n === "III" ? "/app?tab=radar" : "/app?tab=passport"} className="ledger-row group block">
                  <div className="flex items-start">
                    <span className="figure text-sm text-[var(--gold)] w-8 shrink-0 mt-1">{o.n}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-2xl text-[var(--ink)] leading-tight group-hover:text-[var(--gold)] transition-colors">{o.name}</p>
                      <p className="caps text-[9px] text-[var(--ink3)] mt-1">{o.proof}</p>
                      <p className="marginalia text-sm mt-3 max-h-0 opacity-0 overflow-hidden group-hover:max-h-40 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                        {o.detail}
                      </p>
                    </div>
                    <ArrowUpRight size={16} className="text-[var(--ink3)] group-hover:text-[var(--gold)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
                  </div>
                </a>
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
            <a href="/app?tab=active" className="block hover:opacity-80 transition-opacity"><Kicker index="§ 4">The Ledger</Kicker></a>
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
                  <a href="/app?tab=passport" className="caps text-[9px] text-[var(--gold)] hover:underline flex items-center gap-1 w-fit">The Trust Mechanic <ArrowUpRight size={10}/></a>
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

      {/* ================= PROTOCOL INVOCATION CALLOUT ================= */}
      <section className="px-6 py-10 sm:py-12 text-center border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_25%,transparent)]">
        <div className="mx-auto max-w-xl">
          <Reveal>
            <div className="flex justify-center mb-3">
              <Seal size={44} className="!text-lg">A</Seal>
            </div>
            <h2 className="h-display text-3xl sm:text-4xl text-[var(--ink)] leading-tight">
              Put your NIM where<br /><em className="not-italic text-[var(--gold)]">the world is.</em>
            </h2>
            <Marginalia className="mt-2 text-xs sm:text-sm">
              Deeds settle in seconds. Reputation compounds forever.
            </Marginalia>
            <div className="mt-5 flex justify-center gap-3 flex-wrap">
              <PressLink href="/app" className="!px-6 !py-2.5 sm:!px-8 sm:!py-3 !text-xs sm:!text-sm font-semibold">Enter the Protocol</PressLink>
              <GhostLink href="/docs" className="!px-6 !py-2.5 sm:!px-8 sm:!py-3 !text-xs sm:!text-sm font-semibold">Protocol Docs</GhostLink>
              <GhostLink href="https://github.com/Idle0x/nimiq-acta" className="!px-6 !py-2.5 sm:!px-8 sm:!py-3 !text-xs sm:!text-sm font-semibold">Read the Code</GhostLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= SOVEREIGN PRIVILEGES ================= */}
      <section id="privileges" className="px-6 py-24 border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_40%,transparent)]">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <Kicker index="§ 5">The Sovereign Privileges</Kicker>
            <h2 className="h-display text-4xl sm:text-5xl mt-4 text-[var(--ink)]">
              Honorariums of the Perpetual Ledger.
            </h2>
            <Marginalia className="mt-4 max-w-xl">
              Beyond escrow settlements, Acta actively endows continuous participation. The protocol fee treasury autonomously disburses performance grants, streak honorariums, and reputation privileges across five sovereign rites.
            </Marginalia>
          </Reveal>

          {/* Interactive Folio Selector */}
          <div className="mt-12 grid lg:grid-cols-12 gap-8 items-stretch">
            {/* Left: Illuminated Rite Navigation */}
            <div className="lg:col-span-5 flex flex-col gap-2.5">
              {RITES.map((rite, idx) => {
                const Icon = rite.icon;
                const isActive = activeRite === idx;
                return (
                  <button
                    key={rite.num}
                    onClick={() => setActiveRite(idx)}
                    className={`text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 group ${
                      isActive
                        ? "bg-[color-mix(in_srgb,var(--surface)_85%,var(--gold)_15%)] border-[var(--gold)] shadow-[0_4px_20px_rgba(212,175,55,0.12)] translate-x-1"
                        : "bg-[var(--surface)]/60 border-[var(--line)]/15 hover:border-[var(--line)]/30 hover:bg-[var(--surface)]"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl transition-colors ${
                        isActive
                          ? "bg-[var(--gold)] text-[#1c1508]"
                          : "bg-[var(--surface2)] text-[var(--ink3)] group-hover:text-[var(--ink)]"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="caps text-[8.5px] font-bold tracking-wider text-[var(--gold)]">
                          Rite {rite.num} · {rite.tag}
                        </span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
                        )}
                      </div>
                      <h4 className="font-serif text-base font-bold text-[var(--ink)] mt-0.5 truncate">
                        {rite.title}
                      </h4>
                      <p className="text-[11.5px] text-[var(--ink3)] mt-1 line-clamp-1 leading-snug">
                        {rite.summary}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Illuminated Parchment Folio Detail */}
            <div className="lg:col-span-7 flex">
              <Plate className="p-6 sm:p-8 flex flex-col justify-between w-full border-[var(--gold)]/30 bg-gradient-to-b from-[var(--surface)] to-[color-mix(in_srgb,var(--surface)_92%,var(--gold)_8%)] relative overflow-hidden">
                {/* Background Watermark */}
                <div
                  className="absolute -right-8 -bottom-8 font-serif text-9xl text-[var(--gold)]/5 select-none pointer-events-none"
                  aria-hidden
                >
                  {RITES[activeRite].num}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-4 border-b border-[var(--line)]/15 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/30">
                        {(() => {
                          const ActiveIcon = RITES[activeRite].icon;
                          return <ActiveIcon size={24} />;
                        })()}
                      </div>
                      <div>
                        <span className="caps text-[8px] text-[var(--gold)] font-bold tracking-widest block">
                          Rite {RITES[activeRite].num} · {RITES[activeRite].tag}
                        </span>
                        <h3 className="font-display text-2xl font-bold text-[var(--ink)] mt-0.5">
                          {RITES[activeRite].title}
                        </h3>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-[var(--gold2)] font-bold px-2.5 py-1 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20">
                      Treasury Endowed
                    </span>
                  </div>

                  <div className="py-6 space-y-4">
                    <div>
                      <p className="caps text-[8px] tracking-wider text-[var(--ink3)] font-bold mb-1.5">
                        Ceremonial Function
                      </p>
                      <p className="text-sm font-serif italic leading-relaxed text-[var(--ink2)]">
                        “{RITES[activeRite].summary}”
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--ink)_4%,transparent)] border-l-2 border-[var(--gold)]">
                      <p className="caps text-[8px] tracking-wider text-[var(--gold)] font-bold mb-1.5">
                        Protocol Privilege & Perpetual Reward
                      </p>
                      <p className="text-[13px] leading-relaxed text-[var(--ink)]">
                        {RITES[activeRite].privilege}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--line)]/15 flex items-center justify-between gap-4 flex-wrap">
                  <p className="marginalia text-[11px]">
                    Autonomous disbursals powered by the on-chain vault reserve.
                  </p>
                  <a
                    href={RITES[activeRite].route}
                    className="press !py-2.5 !px-5 rounded-xl text-xs font-bold inline-flex items-center gap-2"
                  >
                    <span>{RITES[activeRite].actionText}</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </Plate>
            </div>
          </div>
        </div>
      </section>

      {/* ================= UNWRAPPING THE PROTOCOL ================= */}
      <section className="px-6 py-32 bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] border-t border-[var(--line)]">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <Kicker index="§ 6">Unwrapping the Protocol</Kicker>
            <h2 className="h-display text-4xl sm:text-5xl mt-4 text-[var(--ink)] max-w-2xl">
              Nimiq at the core. Reality at the edge.
            </h2>
            <Marginalia className="mt-6 max-w-xl">
              Acta is not a traditional web application; it is a zero-trust orchestrator. By stripping away intermediaries and embedding directly into the Nimiq Pay ecosystem, we expose the bare metal of distributed consensus. Here is how the skeleton moves.
            </Marginalia>
          </Reveal>

          <div className="mt-20 grid md:grid-cols-2 gap-x-12 gap-y-16">
            <Reveal delay={100}>
              <div className="border-t border-[var(--line-strong)] pt-6">
                <h4 className="caps text-[11px] text-[var(--gold)] mb-3 flex items-center justify-between">
                  <span>I. The Mini-App Runtime</span>
                  <span className="font-mono text-[9px] opacity-50">window.nimiq</span>
                </h4>
                <p className="text-[15px] leading-relaxed text-[var(--ink2)]">
                  Acta does not ask you to install an extension or manage a seed phrase in your browser. It runs purely as an embedded Mini-App within Nimiq Pay. By invoking the native <code className="text-xs bg-[var(--surface)] px-1 py-0.5 rounded">sendBasicTransaction()</code>, funds are locked straight from your wallet into the protocol's vault. No bridging volatile assets, no middleman routing.
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="border-t border-[var(--line-strong)] pt-6">
                <h4 className="caps text-[11px] text-[var(--gold)] mb-3 flex items-center justify-between">
                  <span>II. Albatross & Sub-Second Settlement</span>
                  <span className="font-mono text-[9px] opacity-50">Nimiq PoS</span>
                </h4>
                <p className="text-[15px] leading-relaxed text-[var(--ink2)]">
                  Proof of Action requires instant execution. Because Nimiq operates on the Albatross Proof-of-Stake consensus—capable of generating Micro Blocks in under a second—Acta's oracle verifications trigger immediate on-chain settlement. The moment you scan the return QR, the network reaches consensus, and the escrow unlocks instantly.
                </p>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="border-t border-[var(--line-strong)] pt-6">
                <h4 className="caps text-[11px] text-[var(--gold)] mb-3 flex items-center justify-between">
                  <span>III. Cryptographic Handshakes</span>
                  <span className="font-mono text-[9px] opacity-50">Ed25519</span>
                </h4>
                <p className="text-[15px] leading-relaxed text-[var(--ink2)]">
                  The ScanQuest and Borrowing oracles rely on zero-knowledge physical proximity. The lender's device uses Nimiq's native cryptographic curves to sign a ten-minute disposable payload locally. When the borrower scans the QR, they are literally transmitting mathematical proof of return. It is unforgeable by construction.
                </p>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="border-t border-[var(--line-strong)] pt-6">
                <h4 className="caps text-[11px] text-[var(--gold)] mb-3 flex items-center justify-between">
                  <span>IV. Sceptical Machine Vision</span>
                  <span className="font-mono text-[9px] opacity-50">Qwen3.6 & Neon</span>
                </h4>
                <p className="text-[15px] leading-relaxed text-[var(--ink2)]">
                  For photo proofs, Acta delegates human arbitration to a stateless AI oracle. We stream image buffers to a heavily-prompted vision model instructed to default to refusal upon any doubt. The state machine and reputation histories are then permanently etched into our Neon Serverless Postgres index, acting as the memory of the protocol.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= COLOPHON & FOOTER ================= */}
      <footer className="px-6 py-16 bg-[var(--bg2)] border-t border-[var(--line)]">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6 mb-16">
            <div className="md:col-span-2">
              <Seal size={32} className="!text-xs mb-4">A</Seal>
              <h3 className="h-display text-2xl text-[var(--ink)] mb-3">Acta</h3>
              <p className="text-[13px] leading-relaxed text-[var(--ink2)] max-w-sm">
                Built for the Nimiq Hackathon. Acta proves that distributed ledger technology isn't just about moving money — it's about moving reality. By linking fast consensus with physical deeds, we turn trust into a protocol.
              </p>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-2 gap-6">
              <div>
                <h4 className="caps text-[9px] mb-4 text-[#CDBB8A]">Nimiq Ecosystem</h4>
                <ul className="space-y-3 text-[13px]">
                  <li><a href="https://nimiq.com" target="_blank" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Nimiq Platform</a></li>
                  <li><a href="https://nimiq.com/developers/" target="_blank" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Developer Documentation</a></li>
                  <li><a href="https://forum.nimiq.community/" target="_blank" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Community Forum</a></li>
                  <li><a href="https://nimiq.com/wallet/" target="_blank" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Nimiq Wallet</a></li>
                </ul>
              </div>

              <div>
                <h4 className="caps text-[9px] mb-4 text-[#BEB0D8]">Acta Project</h4>
                <ul className="space-y-3 text-[13px]">
                  <li><a href="/app" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Launch the App</a></li>
                  <li><a href="/docs" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Protocol Documentation</a></li>
                  <li><a href="/app?tab=passport" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors flex items-center gap-1">Check Trust Score <ArrowUpRight size={12}/></a></li>
                  <li><a href="https://github.com/Idle0x/nimiq-acta" target="_blank" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">GitHub Repository</a></li>
                  <li><a href="#" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Hackathon Submission</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[var(--line-strong)]">
            <p className="caps text-[9px] text-[var(--ink3)]">Acta — MMXXVI</p>
            <p className="marginalia text-xs text-center">
              Set in Cormorant, Garamond, Grotesk & Plex. Printed on the Nimiq blockchain.
            </p>
            <p className="caps text-[10px] font-bold tracking-widest tagline">Money moves when reality changes.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
