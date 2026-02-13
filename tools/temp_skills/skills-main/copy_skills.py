import shutil
import os

src_base = r"C:\Users\Tomasz\.gemini\antigravity\skills"
dst_base = r"c:\APLIKACJE\skills\skills"

skills = ["vercel-react-best-practices", "writing-skills"]

for skill in skills:
    src = os.path.join(src_base, skill)
    dst = os.path.join(dst_base, skill)
    print(f"Copying {src} to {dst}")
    if os.path.exists(dst):
        # Remove destination if it exists to ensure clean copy
        shutil.rmtree(dst)
    try:
        shutil.copytree(src, dst)
        print("Success")
    except Exception as e:
        print(f"Failed: {e}")
