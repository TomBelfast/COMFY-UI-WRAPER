import os
import json
import urllib.request
import argparse
from pathlib import Path

# Konfiguracja
REPO_OWNER = "TomBelfast"
REPO_NAME = "skills"
BRANCH = "main"

API_BASE = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/contents"
RAW_BASE = f"https://raw.githubusercontent.com/{REPO_OWNER}/{REPO_NAME}/{BRANCH}"

def get_json(url):
    try:
        with urllib.request.urlopen(url) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        if e.code == 404: return None
        raise e

def download_file(file_url, dest_path):
    try:
        with urllib.request.urlopen(file_url) as response:
            content = response.read()
            with open(dest_path, "wb") as f:
                f.write(content)
        return True
    except Exception as e:
        print(f" (!) Blad pobierania {file_url}: {e}")
        return False

def install_skill_files(skill_name, skill_files, target_dir, flatten=False):
    """Instaluje pliki skilla w docelowym folderze"""
    
    # Dla Cursora (flatten=True): .cursor/rules/skill-name.mdc
    # Dla innych (flatten=False): target_dir/skill-name/SKILL.md
    
    final_dir = target_dir
    if not flatten:
        final_dir = target_dir / skill_name
    
    final_dir.mkdir(parents=True, exist_ok=True)
    
    count = 0
    for file_info in skill_files:
        if file_info['type'] != 'file':
            continue
            
        filename = file_info['name']
        download_url = file_info['download_url']
        
        if flatten:
            # Logika dla Cursora: tylko markdowny, zmiana rozszerzenia na .mdc
            if filename.lower() == 'skill.md':
                dest_file = final_dir / f"{skill_name}.mdc"
            elif filename.lower().endswith('.md'):
                # Inne pliki md dolaczamy jako pomocnicze? 
                # Cursor glownie patrzy na reguly. Dla uproszczenia bierzemy SKILL.md jako glowna regule.
                # Mozemy ewentualnie dodac inne jako skill-name-extra.mdc
                continue 
            else:
                continue
        else:
            # Logika dla Antigravity/Claude: zachowaj nazwy i strukture
            dest_file = final_dir / filename
            
        print(f" -> {dest_file.name} ...", end="")
        if download_file(download_url, dest_file):
            print(" OK")
            count += 1
            
    return count

def main():
    parser = argparse.ArgumentParser(description="Instalator Skilli AI (Remote)")
    parser.add_argument("--antigravity", action="store_true", help="Instaluj dla Antigravity (~/.gemini/antigravity/skills)")
    parser.add_argument("--claude", action="store_true", help="Instaluj dla Claude (~/.claude/skills)")
    parser.add_argument("--cursor", action="store_true", help="Instaluj dla Cursora (./.cursor/rules)")
    parser.add_argument("--all", action="store_true", help="Instaluj dla wszystkich znalezionych")
    args = parser.parse_args()

    # Wykrywanie sciezek
    home = Path.home()
    targets = []

    # 1. Antigravity
    # 1. Antigravity / Gemini (Standard path from GEMINI.md)
    ag_path = home / ".gemini" / "skills"
    if args.antigravity or (args.all and ag_path.parent.exists()):
        targets.append({"name": "Gemini/Antigravity", "path": ag_path, "flatten": False})

    # 2. Claude
    claude_path = home / ".claude" / "skills"
    if args.claude or (args.all and claude_path.parent.exists()):
        targets.append({"name": "Claude", "path": claude_path, "flatten": False})

    # 3. Cursor (biezacy katalog)
    cursor_path = Path.cwd() / ".cursor" / "rules"
    if args.cursor or args.all or (not args.antigravity and not args.claude):
        targets.append({"name": "Cursor", "path": cursor_path, "flatten": True})

    print(f"--- Instalator Skilli: {REPO_OWNER}/{REPO_NAME} ---")
    
    # Pobierz liste skilli
    print("Pobieranie listy skilli...")
    skills_list = get_json(f"{API_BASE}/skills?ref={BRANCH}")
    
    if not skills_list:
        print("Blad: Nie znaleziono folderu skills w repozytorium.")
        return

    for target in targets:
        print(f"\n[TARGET] Instalacja dla: {target['name']}")
        print(f"Sciezka: {target['path']}")
        
        for item in skills_list:
            if item['type'] == 'dir':
                skill_name = item['name']
                if skill_name.startswith('.'): continue
                
                print(f"Skill: {skill_name}")
                
                # Pobierz zawartosc folderu skilla
                skill_files = get_json(item['url'])
                if skill_files:
                    install_skill_files(skill_name, skill_files, target['path'], flatten=target['flatten'])

    print("\nZakonczono!")

if __name__ == "__main__":
    main()
