import re

with open('app/globals.css', 'r') as f:
    css = f.read()

# The block to remove starts with `.tagline {` and ends after `@keyframes flow { ... }`
# We'll just find `.tagline {` and everything after it to the end of the file since it's at the end.
old_css_pattern = r'\.tagline \{.*'
new_css = """@keyframes color-shimmer {
  0% { color: var(--ink2); text-shadow: 0 0 4px rgba(179, 166, 138, 0.1); }
  33% { color: var(--gold); text-shadow: 0 0 10px rgba(210, 168, 78, 0.4); }
  66% { color: #ffffff; text-shadow: 0 0 12px rgba(255, 255, 255, 0.6); }
  100% { color: var(--ink2); text-shadow: 0 0 4px rgba(179, 166, 138, 0.1); }
}
.tagline {
  animation: color-shimmer 10s ease-in-out infinite;
}"""

css = re.sub(old_css_pattern, new_css, css, flags=re.DOTALL)

with open('app/globals.css', 'w') as f:
    f.write(css)

