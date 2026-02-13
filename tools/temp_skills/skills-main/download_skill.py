import urllib.request
import os

base_url = "https://raw.githubusercontent.com/obra/superpowers/main/skills/writing-skills"
base_dir = r"C:\Users\Tomasz\.gemini\antigravity\skills\writing-skills"
files = [
    "SKILL.md",
    "anthropic-best-practices.md",
    "graphviz-conventions.dot",
    "persuasion-principles.md",
    "render-graphs.js",
    "testing-skills-with-subagents.md"
]

print(f"Ensuring directory exists: {base_dir}")
if not os.path.exists(base_dir):
    os.makedirs(base_dir)

for f in files:
    url = f"{base_url}/{f}"
    dest = os.path.join(base_dir, f)
    print(f"Downloading {url} to {dest}")
    try:
        urllib.request.urlretrieve(url, dest)
        print("Success")
    except Exception as e:
        print(f"Failed: {e}")
