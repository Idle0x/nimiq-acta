import re

with open('app/globals.css', 'r') as f:
    content = f.read()

old_css = """@keyframes twirl-shimmer {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animate-twirl {
  background-size: 200% 200%;
  animation: twirl-shimmer 8s ease-in-out infinite;
}"""

new_css = """@keyframes color-shimmer {
  0% { color: #CCD4D9; text-shadow: 0 0 6px rgba(204, 212, 217, 0.3); }
  50% { color: #ffffff; text-shadow: 0 0 10px rgba(255, 255, 255, 0.5); }
  100% { color: #C3CBD1; text-shadow: 0 0 6px rgba(195, 203, 209, 0.3); }
}
.animate-text-shimmer {
  animation: color-shimmer 6s ease-in-out infinite alternate;
}"""

content = content.replace(old_css, new_css)

with open('app/globals.css', 'w') as f:
    f.write(content)
