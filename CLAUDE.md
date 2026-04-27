# CLAUDE.md — Project Instructions for All Terminals

## Project: BIMSEARCH Command Center

### What this is
Operational frontend for PDBM Consulting's procurement intelligence pipeline. Transforms Postgres opportunity data into an executive-grade visual interface using Three.js parallax depth compositing, a custom Canvas ink-sketch processor, and Arcus/Titan editorial design language. 4 users: Jorge (principal), Sergio (developer), Julio & Shami (team). NOT a demo — a production deployable app.

### Repo
- **Local:** `C:\Infratek\repos\crm-testing-threejs-comms`
- **Remote:** `https://github.com/infrateki/crm-testing-threejs-comms.git`
- **Deploy:** Vercel (frontend) — Fastify server deployed separately or as Vercel serverless

### Stack
- React 18.3+ with Vite 5.x (ESM-native, fast HMR)
- TypeScript 5.4+ strict mode
- Three.js r160+ via @react-three/fiber 8.x + @react-three/drei 9.x
- Zustand 4.x for state management
- TanStack Query 5.x for data fetching
- React Router 6.x with lazy-loaded routes
- Framer Motion 11.x for page transitions and parallax fallback
- Fastify 4.x API server with node-postgres 8.x
- Vanilla CSS + CSS custom properties — NO Tailwind, NO shadcn, NO MUI, NO component libraries
- Vitest + Playwright for testing
- Web Workers for ink-sketch processing (mandatory — never block main thread)

### Before doing any work
1. **Read COMMS.md** — check current status, blockers, and your terminal's ownership
2. **Check file ownership** — do NOT modify files owned by another terminal
3. **Update COMMS.md** when you start and finish work
4. Use `/compact` if context exceeds 60%
5. One task per session — use `/clear` between unrelated tasks

### Confirmed facts (source of truth)
- Fonts: **Playfair Display** (900), **DM Sans** (400/500/600/700), **JetBrains Mono** (400/700)
- BG: `#FFFFFF` primary, `#FAF8F3` cream, `#F5F3EF` warm, `#FAFAFA` card
- Ink: `#1a1a1a` primary, `#4B5563` secondary, `#6B7280` tertiary, `#9CA3AF` muted
- Accent: `#2C3E50` slate, `#34495E` steel, `#5C7C6B` sage
- Status colors: tracking `#6B7280`, pursuing `#2563EB`, submitted `#D97706`, won `#059669`, lost `#DC2626`
- Kanban stage colors: radar `#94A3B8`, qualified `#8B5CF6`, jorge_review `#F59E0B`, contact `#3B82F6`, proposal `#6366F1`, won `#059669`, lost `#EF4444`
- Border: `#E5E7EB`, subtle `#F3F4F6`
- Card border-radius: **3px maximum** — never more
- Card shadow: `0 1px 3px rgba(0,0,0,0.06)` only
- Card border: `1px solid var(--border)`
- NO dark mode anywhere — light backgrounds only
- GHL Pipeline: `Q3g21ryPyzfgR2P8OVE1`, Location: `qEBUCUfMOYfwnWI8huL6`
- 7 pipeline stages: `radar → qualified → jorge_review → contact → proposal → won → lost`
- Users/owners: `jorge`, `sergio`, `julio`, `shami`, `jarvis`
- Three.js: OrthographicCamera, 3 depth layers (BG z=-10 factor=0.3, MG z=-5 factor=0.8, FG z=-1 factor=1.5)
- Ink processor presets: ink-heavy (thresh=25, σ=1.0), ink-light (thresh=55, σ=1.8), ink-architectural (thresh=40, σ=1.4)
- Parallax intensity default: 0.02
- Paper color: `#FAF8F3`

### Design system rules
- Headline: Playfair Display 36–48px/900/#1a1a1a/-0.02em
- Section label: DM Sans 12–13px/500/#6B7280/0.08em uppercase
- Body: DM Sans 15–16px/400/#4B5563
- Stats value: JetBrains Mono 28–32px/700/#1a1a1a/-0.02em
- Stats label: DM Sans 11–12px/400/#9CA3AF/0.04em
- Content padding: 40px desktop, 24px tablet, 16px mobile
- Grid gap: 24px. Section spacing: 32px between major sections
- Stats bar padding: 20px vertical, 1px solid var(--border) dividers
- Illustration area: no border-radius, bleeds to card edge

### Critical constraints
- NO Tailwind — vanilla CSS with CSS custom properties for pixel-level control
- NO component libraries (shadcn, MUI, Chakra, etc.) — all components from scratch
- NO localStorage or sessionStorage in artifacts
- Mobile: skip Three.js entirely, use CSS transform: translate3d() fallback
- Web Worker is MANDATORY for ink processing — never run Sobel on main thread
- Texture size capped at 2048×2048 for Three.js
- Cap pixel ratio: `Math.min(window.devicePixelRatio, 2)`
- Three.js: use `invalidateFrameloop` — only render when mouse moving
- Dispose textures and geometries on unmount (useEffect cleanup)

### File ownership
See COMMS.md for the full ownership table. Terminals MUST NOT modify files owned by another terminal.

### Commands
```bash
npm run dev          # Start Vite dev server (frontend)
npm run build        # Production build
npx tsc --noEmit     # Type check
npm run lint         # ESLint
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright E2E
npm run server       # Start Fastify API server
```

### Git workflow
```bash
# Each terminal works on its own branch
git checkout -b t1/foundation     # T1
git checkout -b t2/data-layer     # T2
git checkout -b t3/ink-threejs    # T3
git checkout -b t4/views-cards    # T4
git checkout -b t5/export-polish  # T5
# Push and PR to main when done
git push origin <branch>
```

### When you finish a task
1. Run `npx tsc --noEmit` to verify types
2. Run `npm run build` to verify production build
3. Update your section in COMMS.md with status and notes
4. If you created new exports other terminals need, note them in COMMS.md
5. Commit and push to your branch

### Mistakes to avoid
- Don't use default exports — use named exports everywhere
- Don't use Tailwind classes anywhere — vanilla CSS only
- Don't use border-radius > 3px on cards
- Don't use dark backgrounds — this is a light-theme-only design
- Don't process images on main thread — always use Web Worker
- Don't load Three.js on mobile — detect and use CSS fallback
- Don't use `useFrame` without checking `meshRef.current` first
- Don't forget `transparent: true` and `depthWrite: false` on Three.js layer materials
- Don't put decisions only in prompts — update CLAUDE.md or COMMS.md
- Don't forget to `git push` your branch before finishing
