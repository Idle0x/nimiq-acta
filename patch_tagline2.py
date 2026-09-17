import re

with open('app/globals.css', 'r') as f:
    css = f.read()

old_gradient = """  background: linear-gradient(
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

new_gradient = """  background: linear-gradient(
    110deg,
    #8DEBFF 0%,
    white 7%,
    white 15%,
    white 20%,
    #CFFAFF 25%,
    white 32%,
    white 38%,
    white 42%,
    #D7C7FF 48%,
    white 54%,
    white 60%,
    white 64%,
    #B8FFD9 70%,
    white 76%,
    white 82%,
    white 86%,
    #8DEBFF 92%,
    #D7C7FF 100%
  );
  background-size: 250% 250%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: flow 8s ease-in-out infinite;"""

css = css.replace(old_gradient, new_gradient)

with open('app/globals.css', 'w') as f:
    f.write(css)

