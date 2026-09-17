import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# 1. Update GitHub Links
content = re.sub(r'href="https://github.com[^"]*"', 'href="https://github.com/Idle0x/nimiq-acta"', content)

# 2. Update Footer layout for side-by-side on mobile
old_footer_grid = """          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6 mb-16">
            <div className="md:col-span-2">
              <Seal size={32} className="!text-xs mb-4">A</Seal>
              <h3 className="h-display text-2xl text-[var(--ink)] mb-3">Acta</h3>
              <p className="text-[13px] leading-relaxed text-[var(--ink2)] max-w-sm">
                Built for the Nimiq Hackathon. Acta proves that distributed ledger technology isn't just about moving money — it's about moving reality. By linking fast consensus with physical deeds, we turn trust into a protocol.
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
                <li><a href="https://github.com/Idle0x/nimiq-acta" target="_blank" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">GitHub Repository</a></li>
                <li><a href="#" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Hackathon Submission</a></li>
              </ul>
            </div>
          </div>"""

new_footer_grid = """          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6 mb-16">
            <div className="md:col-span-2">
              <Seal size={32} className="!text-xs mb-4">A</Seal>
              <h3 className="h-display text-2xl text-[var(--ink)] mb-3">Acta</h3>
              <p className="text-[13px] leading-relaxed text-[var(--ink2)] max-w-sm">
                Built for the Nimiq Hackathon. Acta proves that distributed ledger technology isn't just about moving money — it's about moving reality. By linking fast consensus with physical deeds, we turn trust into a protocol.
              </p>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-2 gap-6">
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
                  <li><a href="https://github.com/Idle0x/nimiq-acta" target="_blank" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">GitHub Repository</a></li>
                  <li><a href="#" className="text-[var(--ink2)] hover:text-[var(--gold)] transition-colors">Hackathon Submission</a></li>
                </ul>
              </div>
            </div>
          </div>"""
content = content.replace(old_footer_grid, new_footer_grid)

# 3. Update the shiny text
old_shiny = '<p className="caps text-[10px] bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-200 font-bold drop-shadow-[0_0_12px_rgba(56,189,248,0.45)] tracking-widest">Money moves when reality changes.</p>'
new_shiny = '<p className="caps text-[10px] bg-clip-text text-transparent bg-gradient-to-r from-[#CCD4D9] via-white to-[#C3CBD1] font-bold drop-shadow-[0_0_8px_rgba(204,212,217,0.3)] tracking-widest animate-twirl">Money moves when reality changes.</p>'
content = content.replace(old_shiny, new_shiny)

with open('app/page.tsx', 'w') as f:
    f.write(content)
