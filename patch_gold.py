import re

with open('app/globals.css', 'r') as f:
    css = f.read()

# Replace '#FFFFFF' with 'var(--gold)' in the tagline gradient
css = css.replace('#FFFFFF', 'var(--gold)')

with open('app/globals.css', 'w') as f:
    f.write(css)

