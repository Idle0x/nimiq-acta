import re

with open('app/globals.css', 'r') as f:
    css = f.read()

old_tagline = """  background-size: 250% 250%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: flow 8s ease-in-out infinite;
}"""

new_tagline = """  background-size: 250% 250%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: flow 8s ease-in-out infinite;
  display: inline-block;
  -webkit-transform: translate3d(0,0,0);
  transform: translate3d(0,0,0);
}"""

css = css.replace(old_tagline, new_tagline)

# Replace 'white' with '#FFFFFF' just in case
css = css.replace('white ', '#FFFFFF ')

with open('app/globals.css', 'w') as f:
    f.write(css)

