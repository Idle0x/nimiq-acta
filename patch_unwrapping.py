import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# 1. Replace Architecture & Tech Stack with Unwrapping the Protocol
arch_pattern = r'\{\/\* ================= ARCHITECTURE & TECH STACK ================= \*\/\}.*?\{\/\* ================= COLOPHON & FOOTER ================= \*\/\}'
unwrapping_section = """{/* ================= UNWRAPPING THE PROTOCOL ================= */}
      <section className="px-6 py-32 bg-[color-mix(in_srgb,var(--surface)_30%,transparent)] border-t border-[var(--line)]">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <Kicker index="§ 5">Unwrapping the Protocol</Kicker>
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

      {/* ================= COLOPHON & FOOTER ================= */}"""
content = re.sub(arch_pattern, unwrapping_section, content, flags=re.DOTALL)


# 2. Fix the Footer text (Web3 -> distributed consensus) and the shiny blue text
footer_old = """              <p className="text-[13px] leading-relaxed text-[var(--ink2)] max-w-sm">
                Built for the Nimiq Hackathon. Acta proves that Web3 isn't just about moving money — it's about moving reality. By linking fast consensus with physical deeds, we turn trust into a protocol.
              </p>"""
footer_new = """              <p className="text-[13px] leading-relaxed text-[var(--ink2)] max-w-sm">
                Built for the Nimiq Hackathon. Acta proves that distributed ledger technology isn't just about moving money — it's about moving reality. By linking fast consensus with physical deeds, we turn trust into a protocol.
              </p>"""
content = content.replace(footer_old, footer_new)

blue_text_old = '<p className="caps text-[9px] text-[var(--ink3)]">Money moves when reality changes.</p>'
blue_text_new = '<p className="caps text-[10px] bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-200 font-bold drop-shadow-[0_0_12px_rgba(56,189,248,0.45)] tracking-widest">Money moves when reality changes.</p>'
# We only want to replace the last occurrence which is the one on the right in the flex container
# wait, there are two occurrences of that string! 
# Wait, actually the first one is "Acta — MMXXVI" and the third is "Money moves when reality changes."
content = content.replace(blue_text_old, blue_text_new)


with open('app/page.tsx', 'w') as f:
    f.write(content)
