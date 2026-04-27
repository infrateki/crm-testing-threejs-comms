Read CLAUDE.md. You are T1 — Foundation + Design System owner. You run FIRST before all other terminals.

Your job is to create the complete project scaffold, design system, layout shell, shared UI components, and routing that T2–T5 will build on.

IMPORTANT: Initialize the project IN THE CURRENT DIRECTORY (it's already a git repo). Do NOT create a subdirectory.

Tasks P1 + P2 + P3 + P4 + P5:

### Steps

1. Initialize project IN THE CURRENT DIRECTORY:
```bash
# We're already in C:\Infratek\repos\crm-testing-threejs-comms
# Set up git remote if not already done
git remote add origin https://github.com/infrateki/crm-testing-threejs-comms.git 2>/dev/null || true
git checkout -b t1/foundation

# Initialize Vite project in current directory
npm create vite@latest . -- --template react-ts
```

2. Install ALL dependencies for the ENTIRE project (T2–T5 need these):
```bash
npm install three @react-three/fiber @react-three/drei zustand @tanstack/react-query react-router-dom framer-motion
npm install -D @types/three vitest playwright @playwright/test eslint prettier
```

3. Configure `vite.config.ts` with path aliases:
   - `@/` → `src/`
   - Enable Web Worker support
   - Set server port to 5173

4. Configure `tsconfig.json`:
   - Strict mode enabled
   - Path alias `@/*` → `src/*`
   - Include Web Worker types

5. Create `src/design/tokens.ts` — export ALL design tokens as typed constants:
   - Colors: bg-primary (#FFFFFF), bg-cream (#FAF8F3), bg-warm (#F5F3EF), bg-card (#FAFAFA)
   - Ink colors: primary (#1a1a1a), secondary (#4B5563), tertiary (#6B7280), muted (#9CA3AF), ghost (#D1D5DB)
   - Accent: slate (#2C3E50), steel (#34495E), sage (#5C7C6B)
   - Status: tracking (#6B7280), pursuing (#2563EB), submitted (#D97706), won (#059669), lost (#DC2626)
   - Kanban stage colors: radar (#94A3B8), qualified (#8B5CF6), jorge_review (#F59E0B), contact (#3B82F6), proposal (#6366F1), won (#059669), lost (#EF4444)
   - Border: default (#E5E7EB), subtle (#F3F4F6)
   - Typography scale with all font/size/weight/color/spacing combos from design system
   - Spacing: content padding 40/24/16, grid gap 24, section spacing 32

6. Create `src/design/global.css`:
   - CSS reset (box-sizing, margin, padding)
   - All CSS custom properties from tokens (--bg-primary, --ink-primary, etc.)
   - Base body styles: bg #FFFFFF, font DM Sans, color #1a1a1a
   - Selection color using accent slate

7. Create `src/design/fonts.css`:
   - @font-face declarations for Playfair Display (900), DM Sans (400,500,600,700), JetBrains Mono (400,700)
   - Use Google Fonts CDN with local fallback
   - System font fallback stack

8. Create `src/components/layout/Header.tsx`:
   - "BIMSEARCH" wordmark in JetBrains Mono 14px/700, letter-spacing 0.06em
   - "Command Center" subtitle in DM Sans 12px/400, #9CA3AF
   - Nav tabs: Dashboard, Showcase, Pipeline, Portals, Processor — using React Router NavLink
   - Active tab: DM Sans 12px/600 #1a1a1a. Inactive: 12px/400 #9CA3AF
   - Bottom border: 1px solid var(--border)

9. Create `src/components/layout/KPIBar.tsx`:
   - Horizontal stats bar below header
   - Accepts `stats: { label: string; value: string | number }[]`
   - JetBrains Mono for values, DM Sans for labels
   - Dividers: 1px solid var(--border), padding 20px vertical
   - Background: var(--bg-cream)

10. Create `src/components/layout/Footer.tsx`:
    - "BIMSEARCH Command Center v2.0 · PDBM Consulting · INFRATEK LLC"
    - DM Sans 11px/400 #9CA3AF, centered, padding 16px

11. Create `src/components/layout/Shell.tsx`:
    - Layout wrapper: Header → KPIBar → {children} → Footer
    - Max-width 1440px, centered, min-height 100vh

12. Create shared UI components:
    - `StatusBadge.tsx`: Uppercase DM Sans 12px/700, pill shape, color-coded per status enum. Max border-radius 3px. Background is 10% opacity of status color.
    - `TierBadge.tsx`: "T1" / "T2" / "T3" — JetBrains Mono 11px, subtle border
    - `Tag.tsx`: Metadata chip — DM Sans 11px/500, border 1px solid var(--border), border-radius 3px, padding 2px 8px
    - `SectionLabel.tsx`: Uppercase DM Sans 12px/500 #6B7280, letter-spacing 0.08em
    - `SearchInput.tsx`: Input with search icon, DM Sans 14px, border 1px solid var(--border), border-radius 3px
    - `DeadlineCountdown.tsx`: Shows "X days" with color coding — green >30d, yellow 7-30d, red <7d. JetBrains Mono for number.

13. Create `src/App.tsx`:
    - React Router with routes: / (Dashboard), /showcase, /opportunities/:id, /pipeline, /portals, /processor, /card-builder
    - Wrap in QueryClientProvider (TanStack) and Shell layout
    - Lazy-load all view components with React.lazy + Suspense

14. Create `src/main.tsx`:
    - Import global.css and fonts.css
    - Render App with StrictMode
    - BrowserRouter wrapper

15. Add a `.gitignore` with node_modules, dist, .env, .env.*

16. Verify: `npm run build` must pass with zero errors

17. Commit and push:
```bash
git add -A
git commit -m "feat(T1): foundation scaffold, design system, layout, UI primitives, routing"
git push -u origin t1/foundation
```

### Files you own (ONLY modify these)
- package.json
- vite.config.ts
- tsconfig.json
- index.html
- .gitignore
- public/fonts/*
- src/main.tsx
- src/App.tsx
- src/design/tokens.ts
- src/design/global.css
- src/design/fonts.css
- src/components/layout/Header.tsx
- src/components/layout/KPIBar.tsx
- src/components/layout/Footer.tsx
- src/components/layout/Shell.tsx
- src/components/ui/StatusBadge.tsx
- src/components/ui/TierBadge.tsx
- src/components/ui/Tag.tsx
- src/components/ui/SectionLabel.tsx
- src/components/ui/SearchInput.tsx
- src/components/ui/DeadlineCountdown.tsx

### Files you must NOT touch
- CLAUDE.md (orchestrator only)
- src/types/* (T2)
- src/store/* (T2)
- src/api/* (T2)
- server/* (T2)
- src/engine/* (T3)
- src/components/three/* (T3)
- src/views/* (T4)
- src/components/cards/* (T4)
- src/components/stats/* (T4)
- tests/* (T5)

### Constraints
- NO Tailwind — write vanilla CSS with custom properties only
- NO component libraries — everything from scratch
- Card border-radius MUST be 3px max
- All components must use named exports (no default exports)
- Use `/compact` if context exceeds 60%

### When done
1. Run `npx tsc --noEmit` — must pass
2. Run `npm run build` — must pass
3. Update COMMS.md: mark T1 tasks P1–P5 as ✅ DONE
4. List all exports T2–T5 will need in COMMS.md
5. Commit and push to t1/foundation branch
