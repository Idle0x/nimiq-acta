import re

with open('app/globals.css', 'r') as f:
    css = f.read()

old_gradient = """  background: linear-gradient(
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
  animation: flow 8s ease-in-out infinite;"""

new_gradient = """  background: linear-gradient(
    110deg,
    #8DEBFF 0%,
    #FFFFFF 12%,
    #FFFFFF 18%,
    #CFFAFF 30%,
    #FFFFFF 42%,
    #FFFFFF 48%,
    #D7C7FF 60%,
    #FFFFFF 72%,
    #FFFFFF 78%,
    #B8FFD9 90%,
    #FFFFFF 96%,
    #FFFFFF 98%,
    #8DEBFF 100%
  );
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: flow 20s ease-in-out infinite;"""

css = css.replace(old_gradient, new_gradient)

with open('app/globals.css', 'w') as f:
    f.write(css)

