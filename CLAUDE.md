# CLAUDE.md — BIMSEARCH Command Center

## What this is
Production procurement intelligence dashboard for PDBM Consulting. React + Three.js + Fastify. Arcus/Titan editorial design language — architectural ink-sketch illustrations with Three.js parallax depth compositing.

## Repo
- Remote: https://github.com/infrateki/crm-testing-threejs-comms.git
- Deploy: Vercel (frontend), Fastify server separate

## Stack
- React 18 + Vite 5 + TypeScript 5.4 strict
- Three.js r160+ via @react-three/fiber 8 + @react-three/drei 9
- Zustand 4 (state) + TanStack Query 5 (data fetching)
- React Router 6 (lazy-loaded routes) + Framer Motion 11
- Fastify 4 + node-postgres 8 (server — deps not yet in package.json)
- Vanilla CSS + custom properties — NO Tailwind, NO component libraries
- Vitest (48 tests passing) + Playwright (E2E scaffolded)

## Commands
```bash
npm run dev          # Vite dev server
npm run build        # Production build (tsc + vite)
npx tsc --noEmit     # Type check
npm run lint         # ESLint (flat config v9)
npm run test         # Vitest unit tests
```

## What's built (Phase 1 complete)
- Design system: tokens, CSS vars, fonts (Playfair Display, DM Sans, JetBrains Mono)
- Layout: Header, KPIBar, Footer, Shell (max-1440px)
- UI primitives: StatusBadge, TierBadge, Tag, SectionLabel, SearchInput, DeadlineCountdown, ErrorBoundary, LoadingSkeleton, EmptyState
- Types: Opportunity, Portal, Contact, CardConfig, Pipeline stages
- Stores: useOpportunityStore, useUIStore, useProcessorStore (Zustand)
- API: TanStack Query hooks, Fastify routes (server code written, deps not installed)
- Ink engine: InkSketchProcessor (8-step pipeline), Web Worker, 3 presets, LayerSplitter
- Three.js: ParallaxScene, DepthLayer, IllustrationViewer, procedural SceneGenerator
- Cards: OpportunityCard, HeroSplitCard, CompactKanbanCard, CardExporter
- Stats: StatsBar, StatValue, CountUp
- Views: Dashboard, Showcase, OpportunityDetail, Pipeline (kanban), InkProcessor, PortalHealth, CardBuilder
- Tests: 48 unit tests passing, E2E scaffolded
- Demo data in _fixtures.ts (12 opportunities)

## Design rules
- Headline: Playfair Display 36-48px/900/#1a1a1a/-0.02em
- Body: DM Sans 15-16px/400/#4B5563
- Stats: JetBrains Mono 28-32px/700/#1a1a1a
- Labels: DM Sans 11-12px/500/#6B7280/0.08em uppercase
- Card: 3px max border-radius, shadow 0 1px 3px rgba(0,0,0,0.06), 1px border #E5E7EB
- Backgrounds: #FFFFFF, #FAF8F3 (cream), #F5F3EF (warm) — NO dark mode
- Illustrations: ink #1a1a1a at varying opacities on #FAF8F3 paper

## Critical constraints
- NO Tailwind, NO component libraries — vanilla CSS only
- Mobile: skip Three.js, use CSS transform fallback
- Web Worker mandatory for ink processing
- Three.js: frameloop="demand", dispose on unmount, texture cap 2048x2048
- Named exports only (no default exports)
- All CRUD works client-side with Zustand — API calls attempted but fall back gracefully

## Illustration quality bar
Target: Titan/Arcus website level. Detailed architectural ink drawings with cross-hatching, atmospheric perspective, varying line weights (0.3-2px), 200+ path elements per scene. Must look hand-drawn, not computer-generated.

## Mistakes to avoid
- Don't use border-radius > 3px on cards
- Don't load Three.js on mobile
- Don't process images on main thread
- Don't forget transparent: true and depthWrite: false on Three.js materials
- Don't use default exports
- Don't create unnecessarily complex abstractions — keep it simple
- Don't re-read completed task history from COMMS.md — it's been archived
