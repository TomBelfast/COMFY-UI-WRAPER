# Projekt COMFY-UI-WRAPER

## Przeznaczenie
Projekt służy do zarządzania, instalacji i dystrybucji skilli dla różnych agentów AI (Antigravity/Gemini (Claude), Cursor). Zawiera narzędzia do pobierania skilli z GitHub oraz do lokalnej dystrybucji.

## Tech Stack
- **Języki**: Python (skrypty instalacyjne), Markdown (definicje skilli).
- **Narzędzia**: Git, urllib, shutil.

## Struktura Codebase
- `install_remote.py`: Skrypt do pobierania skilli z repozytorium `TomBelfast/skills`.
- `distribute_skills.py`: Skrypt do kopiowania skilli z `temp_skills` do folderów domowych użytkownika.
- `temp_skills/`: Lokalny magazyn skilli (pobrany/rozpakowany).
- `.cursor/rules/`: Zasady dla edytora Cursor.

## Konwencje i Style
- Skille Antigravity/Claude są przechowywane w folderach `name/SKILL.md`.
- Skille Cursora są spłaszczane do plików `.mdc` w `.cursor/rules/`.

## Komendy
- `python distribute_skills.py`: Instalacja lokalna.
- `python install_remote.py --all`: Pobieranie i instalacja wszystkich skilli z GitHub.
- `ls ~/.gemini/antigravity/skills`: Sprawdzenie zainstalowanych skilli.
