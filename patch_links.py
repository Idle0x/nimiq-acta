import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# Add link to Oracles
old_oracles = """                <div className="ledger-row group cursor-default">
                  <span className="figure text-sm text-[var(--gold)] w-8 shrink-0">{o.n}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-2xl text-[var(--ink)] leading-tight">{o.name}</p>
                    <p className="caps text-[9px] text-[var(--ink3)] mt-1">{o.proof}</p>
                    <p className="marginalia text-sm mt-3 max-h-0 opacity-0 overflow-hidden group-hover:max-h-40 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
                      {o.detail}
                    </p>
                  </div>
                  <ArrowUpRight size={16} className="text-[var(--ink3)] group-hover:text-[var(--gold)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </div>"""

new_oracles = """                <a href={o.n === "I" ? "/app" : o.n === "II" ? "/app?tab=active" : o.n === "III" ? "/app?tab=radar" : "/app?tab=passport"} className="ledger-row group block">
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
                </a>"""

content = content.replace(old_oracles, new_oracles)

# Make "The Ledger" a link to /app?tab=active
content = content.replace('<Kicker index="§ 4">The Ledger</Kicker>', '<a href="/app?tab=active" className="block hover:opacity-80 transition-opacity"><Kicker index="§ 4">The Ledger</Kicker></a>')

# Make "The Trust Mechanic" a link
content = content.replace('<p className="caps text-[9px] text-[var(--gold)]">The Trust Mechanic</p>', '<a href="/app?tab=passport" className="caps text-[9px] text-[var(--gold)] hover:underline flex items-center gap-1 w-fit">The Trust Mechanic <ArrowUpRight size={10}/></a>')

with open('app/page.tsx', 'w') as f:
    f.write(content)
