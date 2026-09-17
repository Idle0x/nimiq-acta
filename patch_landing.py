import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# 1. Update the Doctrine cards
old_doctrine_cards = """          <div className="grid md:grid-cols-3 gap-5 mt-14">
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
          </div>"""

new_doctrine_cards = """          <div className="grid md:grid-cols-3 gap-5 mt-14">
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
          </div>"""

content = content.replace(old_doctrine_cards, new_doctrine_cards)

# 2. Add subtle links to Oracles
content = re.sub(
    r'<p className="font-display text-2xl text-\[var\(--ink\)\] leading-tight">\{o\.name\}</p>',
    r'<p className="font-display text-2xl text-[var(--ink)] leading-tight">{o.name}</p>',
    content
)

# 3. Add Tech Stack Section and Footer
colophon_pattern = r'\{\/\* ================= COLOPHON ================= \*\/\}.*?<\/footer>'
tech_and_footer = """{/* ================= ARCHITECTURE & TECH STACK ================= */}
      <section className="px-6 py-24 bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] border-t border-[var(--line)]">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <Kicker index="§ 5">Architecture</Kicker>
            <h2 className="h-display text-4xl sm:text-5xl mt-4 text-[var(--ink)]">
              Woven from modern threads.
            </h2>
            <Marginalia className="mt-4 max-w-lg">
              Acta is a zero-trust orchestrator. It does not reinvent consensus; it connects robust, bleeding-edge primitives into a seamless action economy.
            </Marginalia>
          </Reveal>

          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[
              { title: "Nimiq Pay Mini-App", desc: "Native integration with window.nimiq. Funds are locked strictly on-chain using Nimiq's fast, lightweight consensus without bridging volatile assets." },
              { title: "Qwen3.6 Vision Oracle", desc: "A sceptical AI evaluator hosted via Hetzner inference. It analyzes submitted photo proofs against the listing's constraints, substituting human arbitration." },
              { title: "Ed25519 Cryptography", desc: "Secure, offline QR handshakes. Lenders sign ten-minute disposable tokens locally; borrowers scan to execute cryptographic zero-knowledge returns." },
              { title: "Next.js & React 19", desc: "Server-side hydration, edge-ready API routes, and instantaneous state transitions wrapped in a strict TypeScript architecture." },
              { title: "Neon Serverless Postgres", desc: "Robust, branching database layer maintaining the off-chain index of active bounties, reputation histories, and the global treasury ledger." },
              { title: "Haversine Geolocation", desc: "HTML5 secure contexts verifying physical check-ins with mathematically rigorous bounding box accuracy limits." }
            ].map((t, i) => (
              <Reveal key={t.title} delay={i * 100}>
                <h4 className="caps text-[10px] text-[var(--gold)] mb-3">{t.title}</h4>
                <p className="text-[14px] leading-relaxed text-[var(--ink2)]">{t.desc}</p>
              </Reveal>
            ))}
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
                Built for the Nimiq Hackathon. Acta proves that Web3 isn't just about moving money — it's about moving reality. By linking fast consensus with physical deeds, we turn trust into a protocol.
              </p>
            </div>
            
            <div>
              <h4 className="caps text-[9px] text-[var(--ink3)] mb-4">Nimiq Ecosystem</h4>
              <ul className="space-y-3 text-[13px]">
                <li><a href="https://nimiq.com" target="_blank" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Nimiq Platform</a></li>
                <li><a href="https://nimiq.com/developers/" target="_blank" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Developer Documentation</a></li>
                <li><a href="https://forum.nimiq.community/" target="_blank" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Community Forum</a></li>
                <li><a href="https://nimiq.com/wallet/" target="_blank" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Nimiq Wallet</a></li>
              </ul>
            </div>

            <div>
              <h4 className="caps text-[9px] text-[var(--ink3)] mb-4">Acta Project</h4>
              <ul className="space-y-3 text-[13px]">
                <li><a href="/app" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Launch the App</a></li>
                <li><a href="/app?tab=passport" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors flex items-center gap-1">Check Trust Score <ArrowUpRight size={12}/></a></li>
                <li><a href="https://github.com" target="_blank" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">GitHub Repository</a></li>
                <li><a href="#" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Hackathon Submission</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[var(--line-strong)]">
            <p className="caps text-[9px] text-[var(--ink3)]">Acta — MMXXVI</p>
            <p className="marginalia text-xs text-center">
              Set in Cormorant, Garamond, Grotesk & Plex. Printed on the Nimiq blockchain.
            </p>
            <p className="caps text-[9px] text-[var(--ink3)]">Money moves when reality changes.</p>
          </div>
        </div>
      </footer>"""
content = re.sub(colophon_pattern, tech_and_footer, content, flags=re.DOTALL)

with open('app/page.tsx', 'w') as f:
    f.write(content)
