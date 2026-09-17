import re

with open('app/page.tsx', 'r') as f:
    content = f.read()

# Replace the broken gradient text
old_text = '<p className="caps text-[10px] bg-clip-text text-transparent bg-gradient-to-r from-[#CCD4D9] via-white to-[#C3CBD1] font-bold drop-shadow-[0_0_8px_rgba(204,212,217,0.3)] tracking-widest animate-twirl">Money moves when reality changes.</p>'
new_text = '<p className="caps text-[10px] font-bold tracking-widest animate-text-shimmer">Money moves when reality changes.</p>'
content = content.replace(old_text, new_text)

with open('app/page.tsx', 'w') as f:
    f.write(content)
