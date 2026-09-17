import re

# 1. Update globals.css
with open('app/globals.css', 'r') as f:
    css = f.read()

# Remove old color-shimmer
css = re.sub(r'@keyframes color-shimmer \{.*?\.animate-text-shimmer \{.*?\}', '', css, flags=re.DOTALL)

# Add new tagline
new_css = """
.tagline {
  background: linear-gradient(
    110deg,
    #8DEBFF 0%,
    #CFFAFF 25%,
    #D7C7FF 45%,
    #B8FFD9 65%,
    #8DEBFF 85%,
    #D7C7FF 100%
  );
  background-size: 250% 250%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: flow 8s ease-in-out infinite;
}

@keyframes flow {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
"""
css += new_css

with open('app/globals.css', 'w') as f:
    f.write(css)


# 2. Update page.tsx
with open('app/page.tsx', 'r') as f:
    tsx = f.read()

# Update Nimiq Ecosystem header
tsx = tsx.replace('<h4 className="caps text-[9px] text-[var(--ink3)] mb-4">Nimiq Ecosystem</h4>',
                  '<h4 className="caps text-[9px] mb-4 text-[#CDBB8A]">Nimiq Ecosystem</h4>')

# Update Acta Project header
tsx = tsx.replace('<h4 className="caps text-[9px] text-[var(--ink3)] mb-4">Acta Project</h4>',
                  '<h4 className="caps text-[9px] mb-4 text-[#BEB0D8]">Acta Project</h4>')

# Update tagline
tsx = re.sub(r'<p className="caps text-\[10px\] font-bold tracking-widest animate-text-shimmer">Money moves when reality changes.</p>',
             r'<p className="caps text-[10px] font-bold tracking-widest tagline">Money moves when reality changes.</p>',
             tsx)

with open('app/page.tsx', 'w') as f:
    f.write(tsx)

