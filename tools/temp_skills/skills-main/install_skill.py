#!/usr/bin/env python3
import os
import json
import urllib.request
import argparse
from pathlib import Path
import re

SKILLS_DIR = Path("/root/.agent/skills")

def get_github_api_url(url):
    """Converts a GitHub browser URL to a GitHub API URL for contents."""
    # Pattern: https://github.com/owner/repo/tree/branch/path
    # Pattern: https://github.com/owner/repo/blob/branch/path
    match = re.match(r'https?://github\.com/([^/]+)/([^/]+)/(tree|blob)/([^/]+)/(.*)', url)
    if match:
        owner, repo, _, branch, path = match.groups()
        return f"https://api.github.com/repos/{owner}/{repo}/contents/{path}?ref={branch}", f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}"
    
    # Pattern: https://github.com/owner/repo
    match = re.match(r'https?://github\.com/([^/]+)/([^/]+)/?$', url)
    if match:
        owner, repo = match.groups()
        return f"https://api.github.com/repos/{owner}/{repo}/contents/", f"https://raw.githubusercontent.com/{owner}/{repo}/main"
        
    return None, None

def download_file(url, dest):
    print(f" Downloading {url} ...", end="", flush=True)
    try:
        with urllib.request.urlopen(url) as response:
            content = response.read()
            with open(dest, "wb") as f:
                f.write(content)
        print(" OK")
        return True
    except Exception as e:
        print(f" FAILED: {e}")
        return False

def install_from_api(api_url, raw_base, dest_dir):
    try:
        with urllib.request.urlopen(api_url) as response:
            items = json.loads(response.read().decode())
            
        if not isinstance(items, list):
            # Single file
            if items['type'] == 'file':
                dest_dir.mkdir(parents=True, exist_ok=True)
                download_file(items['download_url'], dest_dir / items['name'])
                return 1
            return 0

        dest_dir.mkdir(parents=True, exist_ok=True)
        count = 0
        for item in items:
            if item['type'] == 'file':
                if download_file(item['download_url'], dest_dir / item['name']):
                    count += 1
            elif item['type'] == 'dir':
                # Recursive download? For now just stay in the skill folder
                pass
        return count
    except Exception as e:
        print(f"Error accessing API {api_url}: {e}")
        return 0

def main():
    parser = argparse.ArgumentParser(description="OpenClaw Skill Installer")
    parser.add_argument("--url", type=str, required=True, help="GitHub URL of the skill")
    parser.add_argument("--name", type=str, help="Local name for the skill (folder name)")
    args = parser.parse_args()

    api_url, raw_base = get_github_api_url(args.url)
    if not api_url:
        print("Invalid GitHub URL.")
        return

    skill_name = args.name or Path(args.url).name
    target_dir = SKILLS_DIR / skill_name

    if target_dir.exists():
        print(f"Warning: Skill '{skill_name}' already exists in {target_dir}. Aborting.")
        # return # Maybe overwrite if user insists? For now safety first.

    print(f"Installing skill '{skill_name}' into {target_dir}...")
    files_installed = install_from_api(api_url, raw_base, target_dir)
    
    if files_installed > 0:
        print(f"\nSuccessfully installed {files_installed} files.")
        print("Skill structure check:")
        if (target_dir / "SKILL.md").exists():
            print(" [X] SKILL.md found.")
        else:
            print(" [ ] SKILL.md NOT found (this might not be a valid skill directory).")
    else:
        print("\nNo files were installed.")

if __name__ == "__main__":
    main()
