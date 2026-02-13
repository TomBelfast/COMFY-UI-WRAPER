---
name: ui-gen
description: Generates high-quality, self-contained interactive UI components using React and Tailwind CSS, then showcases them in the Styleguide.
---

# UI Generation Skill (The "Cinematic Engine")

This skill generates premium React components based on the "FILM" Cinematic Design System and automatically adds them to the project for review.

## Workflow

1.  **Analyze Request**: Understand the desired component (e.g., "A holographic user card" or "An animated download button").
2.  **Generate Code**: Create a `.tsx` file in `/root/FilmGoogle/frontend/src/components/ui/`.
3.  **Register in Styleguide**: Import and display the new component in `/root/FilmGoogle/frontend/src/pages/MoneyPipeline.tsx`.

## Coding Rules (The "Augmented Prompt" for Myself)

When generating the component, I MUST strictly follow these rules:
1.  **Format**: Valid TypeScript React Functional Component.
2.  **Imports**: 
    - `import React from 'react';`
    - `import { motion, AnimatePresence } from 'framer-motion';` (Use for ALL complex animations).
    - `import { IconName } from 'lucide-react';`
    - `import { cva } from 'class-variance-authority';`
3.  **Styling & Animation**: 
    - Use **Tailwind CSS** for layout/colors.
    - **DUAL-THEME MANDATORY (STRICT)**:
        - **NEVER** use hardcoded `bg-white` or `bg-black` for main containers.
        - **ALWAYS** use semantic system variables:
            - Backgrounds: `bg-card`, `bg-background`, `bg-secondary`
            - Text: `text-foreground`, `text-muted-foreground`
            - Borders: `border-border`, `border-input`
        - This ensures automatic, glitch-free switching between Light and Dark modes.
    - Use **Framer Motion** (`<motion.div>`) for interactions.
    - **Premium Feel**: Use spring physics (`type: "spring", stiffness: 400, damping: 30`) instead of linear opacity scans.
    - **No external CSS files**.
    - **Responsiveness**: Ensure `w-full` support but good default viewing.
4.  **Aesthetics (Cinematic DNA)**:
    - **Glassmorphism**: `backdrop-blur-xl bg-card/10 border border-white/10`.
    - **Glows**: Subtle gradients and shadows (`shadow-green-500/20`).
    - **Typography**: Clean sans-serif, uppercase labels for technical feel.
5.  **Export**: `export default function ComponentName ...`

## Integration Step

After creating the file:
1.  Open `/root/FilmGoogle/frontend/src/pages/MoneyPipeline.tsx`.
2.  Add the import: `import ComponentName from '../components/ui/component-name';`.
3.  Add a new section in the JSX to display the component, wrapped in a `NeonCard` or appropriate container with a label.

## Example Command to Trigger

"Create a 3D hologram card for user profile."

-> I will generate `src/components/ui/hologram-profile-card.tsx` and update `MoneyPipeline.tsx`.
