---
name: tldr-setup
description: Instrukcje instalacji, konfiguracji i użycia TLDR (LLM code analysis tool) wraz z konfiguracją MCP server dla Antigravity/Claude.
---

# Skill: TLDR Setup & MCP Configuration

Ten skill zawiera kompletne instrukcje instalacji narzędzia **llm-tldr** do analizy kodu oraz konfiguracji MCP server dla integracji z Antigravity, Claude Code i Cursor.

## Co to jest TLDR?

TLDR to narzędzie do efektywnej nawigacji po kodzie, które buduje indeks projektu i udostępnia funkcje analizy przez MCP (Model Context Protocol). Zamiast używać `grep_search`, TLDR oferuje strukturalne narzędzia do:
- Znajdowania kto importuje dany moduł
- Budowania grafu wywołań (call graph)
- Analizy struktury plików (funkcje, klasy, importy)
- Wyszukiwania semantycznego po kodzie

---

## Część 1: Instalacja TLDR

### Wymagania
- Python 3.10+
- pip

### Instalacja pakietu

```bash
pip install llm-tldr
```

### Weryfikacja instalacji

```bash
tldr --version
```

---

## Część 2: Indeksowanie projektu

### Podstawowe indeksowanie

```bash
cd /sciezka/do/projektu
tldr index .
```

### Tworzenie pliku `.tldrignore`

Utwórz plik `.tldrignore` w katalogu głównym projektu, aby wykluczyć niepotrzebne ścieżki:

```
# Zależności
node_modules/
.venv/
venv/
__pycache__/

# Build
dist/
build/
*.pyc
*.pyo

# Cache
.cache/
.pytest_cache/
.mypy_cache/

# IDE
.idea/
.vscode/

# Inne
*.log
*.tmp
```

### Re-indeksowanie

Uruchom ponownie po:
- Dodaniu nowych plików/modułów
- Znacznych zmianach w strukturze kodu
- Zmianie zależności projektu

```bash
tldr index .
```

---

## Część 3: Konfiguracja MCP Server

### Dla Antigravity / Gemini CLI

Edytuj plik konfiguracyjny MCP (zazwyczaj `~/.config/gemini/settings.json` lub analogiczny):

```json
{
  "mcpServers": {
    "tldr": {
      "command": "tldr",
      "args": ["mcp"],
      "env": {}
    }
  }
}
```

### Dla Claude Code (claude.ai)

Edytuj plik `~/.config/claude/mcp_servers.json`:

```json
{
  "mcpServers": {
    "tldr": {
      "command": "tldr",
      "args": ["mcp"]
    }
  }
}
```

### Dla Cursor

W ustawieniach Cursor (Settings > MCP), dodaj:

```json
{
  "tldr": {
    "command": "tldr",
    "args": ["mcp"]
  }
}
```

### Weryfikacja MCP

Po restarcie narzędzia AI sprawdź, czy dostępne są narzędzia `mcp_tldr_*`.

---

## Część 4: Dostępne narzędzia MCP

| Narzędzie | Opis | Zamiast |
|-----------|------|---------|
| `mcp_tldr_structure` | Funkcje/klasy w plikach | `grep "def\|class"` |
| `mcp_tldr_importers` | Kto importuje dany moduł | `grep "import X"` |
| `mcp_tldr_calls` | Graf wywołań projektu | Manualne śledzenie |
| `mcp_tldr_context` | Kontekst dla funkcji (LLM-ready) | Czytanie całych plików |
| `mcp_tldr_extract` | Pełna analiza pliku | Wiele grep-ów |
| `mcp_tldr_impact` | Kto wywołuje funkcję (reverse) | Szukanie referencji |
| `mcp_tldr_dead` | Martwy/nieużywany kod | - |
| `mcp_tldr_arch` | Warstwy architektoniczne | - |
| `mcp_tldr_cfg` | Control flow graph | - |
| `mcp_tldr_dfg` | Data flow graph | - |
| `mcp_tldr_semantic` | Wyszukiwanie semantyczne | - |
| `mcp_tldr_tree` | Struktura katalogów | `find` / `tree` |

---

## Część 5: Przykłady użycia

### Znajdź strukturę projektu Python

```
mcp_tldr_structure(project="/sciezka/projektu", language="python")
```

### Znajdź kto importuje moduł

```
mcp_tldr_importers(project="/sciezka/projektu", module="utils.helpers")
```

### Pobierz kontekst dla funkcji

```
mcp_tldr_context(project="/sciezka/projektu", entry="MyClass.my_method", depth=2)
```

### Znajdź martwy kod

```
mcp_tldr_dead(project="/sciezka/projektu")
```

---

## Część 6: Reguły dla AI Agenta

Dodaj te reguły do swojego pliku `GEMINI.md` lub globalnych ustawień:

```markdown
### Code Navigation Rules

* **ALWAYS USE TLDR BEFORE GREP:** When searching for code, imports, or function relationships, ALWAYS use the `mcp_tldr_*` tools first instead of `grep_search`.
* **Fall back to grep only when:** tldr doesn't support the language, or you need to search for literal strings/comments that aren't code structures.

### TLDR Quick Reference

| Task | Use This | NOT This |
|------|----------|----------|
| Find who imports a module | `mcp_tldr_importers` | grep "import X" |
| Get functions/classes in file | `mcp_tldr_structure` | grep "def\|class" |
| Build call graph | `mcp_tldr_calls` | manual tracing |
| Get context for function | `mcp_tldr_context` | reading whole files |
| Full file analysis | `mcp_tldr_extract` | multiple greps |
```

---

## Troubleshooting

### Problem: "tldr: command not found"

Upewnij się, że ścieżka do pip packages jest w PATH:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Lub użyj pełnej ścieżki:

```bash
which tldr
# np. /home/user/.local/bin/tldr
```

W konfiguracji MCP użyj pełnej ścieżki:

```json
{
  "command": "/home/user/.local/bin/tldr",
  "args": ["mcp"]
}
```

### Problem: Brak wyników indeksowania

1. Sprawdź czy `.tldrignore` nie wyklucza zbyt wiele
2. Upewnij się, że język jest obsługiwany (Python, TypeScript, Go, Rust)
3. Uruchom `tldr index . --verbose` dla debugowania

### Problem: MCP nie widzi narzędzi

1. Zrestartuj aplikację AI po zmianie konfiguracji
2. Sprawdź logi MCP
3. Uruchom `tldr mcp` ręcznie, aby sprawdzić czy działa
