import os
import shutil
from pathlib import Path

# Ścieżki źródłowe
source_base = Path(r"c:\APLIKACJE\COMFY-UI-WRAPER\temp_skills\skills-main\skills")
skills = [d for d in source_base.iterdir() if d.is_dir()]

# Ścieżki docelowe
home = Path.home()
targets = {
    "Antigravity": home / ".gemini" / "skills",
    "Claude": home / ".claude" / "skills",
    "Cursor": Path(r"c:\APLIKACJE\COMFY-UI-WRAPER") / ".cursor" / "rules"
}

def install_skills():
    print("--- Instalacja Skilli (Local script) ---")
    
    for name, target_dir in targets.items():
        print(f"\n[TARGET] {name}: {target_dir}")
        target_dir.mkdir(parents=True, exist_ok=True)
        
        for skill_dir in skills:
            skill_name = skill_dir.name
            
            if name == "Cursor":
                # Flatten mode: SKILL.md -> name.mdc
                skill_md = skill_dir / "SKILL.md"
                if skill_md.exists():
                    dest_file = target_dir / f"{skill_name}.mdc"
                    print(f"  -> {dest_file.name}")
                    shutil.copy2(skill_md, dest_file)
            else:
                # Normal mode: directory structure
                dest_skill_dir = target_dir / skill_name
                dest_skill_dir.mkdir(parents=True, exist_ok=True)
                print(f"  -> {skill_name}/")
                for item in skill_dir.iterdir():
                    if item.is_file():
                        shutil.copy2(item, dest_skill_dir / item.name)
                    elif item.is_dir():
                        shutil.copytree(item, dest_skill_dir / item.name, dirs_exist_ok=True)

if __name__ == "__main__":
    install_skills()
    print("\nZakończono pomyślnie!")
