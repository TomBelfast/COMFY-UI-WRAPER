---
name: cinematic-ui
description: "Strict enforcement of the 'Cinematic Matrix' design system: emerald gradients, glassmorphism, and bold italic typography."
category: frontend
complexity: intermediate
---

# /sk:cinematic-ui - Cinematic Matrix Design System

This skill enforces a specific, premium aesthetic called **Cinematic Matrix**. It is characterized by deep dark backgrounds, vibrant emerald gradients, high-contrast white labels, and advanced glassmorphism effects.

## Core Design Tokens

### 1. Typography
- **Primary Titles (`.text-title`)**: 
  - Font: Black, Italic, Uppercase.
  - Tracking: Tighter.
  - Gradient: `from-emerald-300 via-emerald-500 to-emerald-800`.
  - Effect: Sharp drop shadow for depth.
- **System Labels (`.text-label`)**:
  - Font: Sans, Black, Uppercase.
  - Tracking: Wide (`0.3em`).
  - Color: `text-white/60`.
  - Size: Small (`11px`).
- **Global Rule**: Any text that is both **Bold** and **Italic** automatically receives the Emerald Gradient.

### 2. Glassmorphism
- **Glass Card (`.glass-card`)**:
  - Background: `rgba(255, 255, 255, 0.03)`
  - Blur: `40px`
  - Border: `1px solid rgba(255, 255, 255, 0.08)`
  - Hover: Emerald glow and increased border opacity.
- **3D Cinematic Card (`.card-3d-cinematic`)**:
  - Preserve-3d transform.
  - Tilt on hover.
  - Deep shadow on hover.

### 3. Palette
- **Background**: `#121212` (or Tailwind `neutral-950`).
- **Accent**: Emerald (300-800).
- **Secondary**: Blue/Purple (used sparingly for secondary labels).

## Directives for the AI
When this skill is active, you MUST:
1. **Prefer Glass over Solid**: Never use solid background containers; always use `.glass-card`.
2. **Title Hierarchy**: Always use `.text-title` for section headers and `.text-label` for section metadata.
3. **Cinematic Motion**: Every interactive element must have a smooth transition (minimum `duration-500`).
4. **Gradient Consistency**: Use the specific emerald hex codes: `#6ee7b7` -> `#10b981` -> `#065f46`.

## Setup
To apply this style to a new project, run:
```bash
bash /root/skills/skills/cinematic-ui/scripts/install.sh
```
This will:
- Inject base CSS into `index.css`.
- Update `tailwind.config.js` with cinematic presets.
- Configure base colors.
