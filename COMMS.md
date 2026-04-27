# COMMS.md — Terminal Orchestration Board
## BIMSEARCH Command Center

**Last updated:** April 27, 2026 · by T1
**Status:** 🟡 IN PROGRESS
**Repo:** https://github.com/infrateki/crm-testing-threejs-comms.git

---

## HOW TO USE THIS FILE

Each Claude Code terminal MUST:
1. **READ this file** at the start of every task
2. **UPDATE your section** when you start/finish work
3. **CHECK blockers** before modifying shared files
4. **NEVER modify another terminal's owned files** without updating this file first
5. **When done with a task**, change its status to ✅ and add a timestamp

---

## PROJECT STATUS

| Component | Terminal | Status | Last Update | Notes |
|---|---|---|---|---|
| Foundation + Design System | T1 | ✅ DONE | 2026-04-27 | Build passes, all exports ready |
| Data Layer + API Server | T2 | ✅ DONE | 2026-04-27 | tsc clean (T2 files); server deps need installing |
| Ink Engine + Three.js | T3 | ✅ DONE | 2026-04-27 | tsc ✅ build ✅ — ink engine, Three.js parallax, procedural scenes |
| Views + Cards | T4 | ⬜ TODO | | Depends on T1, T2, T3 |
| Export + Polish + Tests | T5 | ⬜ TODO | | Depends on T3, T4 |

---

## TASK BOARD

| # | Task | Owner | Status | File(s) |
|---|---|---|---|---|
| P1 | Project scaffold (Vite+React+TS), install ALL deps | T1 | ✅ DONE | package.json, vite.config.ts, tsconfig.json, index.html |
| P2 | Design system: CSS reset, tokens, font loading, CSS vars | T1 | ✅ DONE | src/design/* |
| P3 | Layout shell: Header, KPIBar, Footer, Shell wrapper | T1 | ✅ DONE | src/components/layout/* |
| P4 | Shared UI primitives: StatusBadge, TierBadge, Tag, SectionLabel, SearchInput, DeadlineCountdown | T1 | ✅ DONE | src/components/ui/* |
| P5 | Route structure with lazy loading | T1 | ✅ DONE | src/App.tsx, src/main.tsx |
| P6 | TypeScript interfaces: Opportunity, Portal, Contact, CardConfig, Pipeline enums | T2 | ✅ DONE | src/types/* |
| P7 | Zustand stores: useOpportunityStore, useUIStore, useProcessorStore | T2 | ✅ DONE | src/store/* |
| P8 | API client + TanStack Query hooks for all endpoints | T2 | ✅ DONE | src/api/* |
| P9 | Fastify server: REST endpoints, DB pool, SQL queries | T2 | ✅ DONE | server/* |
| P10 | WebSocket handler for real-time pipeline updates | T2 | ✅ DONE | server/ws/*, src/api/websocket.ts |
| P11 | Utility functions: format.ts, scoring.ts | T2 | ✅ DONE | src/utils/format.ts, src/utils/scoring.ts |
| P12 | InkSketchProcessor: grayscale, blur, Sobel, threshold, line-weight, hatching, paper composite | T3 | ✅ DONE | src/engine/ink-processor/* |
| P13 | Web Worker wrapper for ink processing | T3 | ✅ DONE | src/engine/ink-processor/processor.worker.ts |
| P14 | Layer splitter with alpha-feathered masks | T3 | ✅ DONE | src/engine/layer-splitter/* |
| P15 | Three.js R3F components: ParallaxScene, DepthLayer, ParallaxController, IllustrationViewer | T3 | ✅ DONE | src/components/three/* |
| P16 | Procedural illustration generator: 5 scene types + 5 primitives | T3 | ✅ DONE | src/engine/procedural/* |
| P17 | 3 ink presets (ink-heavy, ink-light, ink-architectural) | T3 | ✅ DONE | src/engine/ink-processor/presets.ts |
| P18 | StatsBar + StatValue + CountUp components | T4 | ⬜ TODO | src/components/stats/* |
| P19 | OpportunityCard (compact grid), HeroSplitCard (detail), CompactKanbanCard (kanban) | T4 | ⬜ TODO | src/components/cards/OpportunityCard.tsx, HeroSplitCard.tsx, CompactKanbanCard.tsx |
| P20 | Dashboard view: KPI stats, hero card, deadlines, scan status, team workload | T4 | ⬜ TODO | src/views/Dashboard.tsx |
| P21 | Showcase view: responsive card grid, filters, search, sort, staggered animations | T4 | ⬜ TODO | src/views/Showcase.tsx |
| P22 | OpportunityDetail view: hero-split + tabs (contacts/docs/actions/timeline) | T4 | ⬜ TODO | src/views/OpportunityDetail.tsx |
| P23 | Pipeline kanban: 7 columns, drag-drop, optimistic update, owner filter | T4 | ⬜ TODO | src/views/Pipeline.tsx |
| P24 | InkProcessor view: file upload, live preview, controls, pipeline visualization | T4 | ⬜ TODO | src/views/InkProcessor.tsx |
| P25 | PortalHealth view: status table with color-coded rows | T4 | ⬜ TODO | src/views/PortalHealth.tsx |
| P26 | CardExporter: PNG from Three.js + text overlay, SVG with embedded illustration | T5 | ⬜ TODO | src/components/cards/CardExporter.tsx, src/utils/export.ts |
| P27 | CardBuilder view: manual card creation from data | T5 | ⬜ TODO | src/views/CardBuilder.tsx |
| P28 | Photo upload flow: file picker → process → save → update Three.js scene | T5 | ⬜ TODO | (coordinates across T3 engine + T4 views) |
| P29 | Animations: page transitions, staggered reveals, entrance animations | T5 | ⬜ TODO | src/design/animations.css |
| P30 | Responsive: tablet 768px + mobile 375px, Three.js → CSS fallback on mobile | T5 | ⬜ TODO | responsive CSS across owned files |
| P31 | Error boundaries, loading skeletons (paper-grain aesthetic), empty states | T5 | ⬜ TODO | src/components/ui/ErrorBoundary.tsx, etc. |
| P32 | Unit tests: ink processor, scoring, formatting | T5 | ⬜ TODO | tests/unit/* |
| P33 | E2E tests: showcase, detail, kanban | T5 | ⬜ TODO | tests/e2e/* |

---

## FILE OWNERSHIP

Terminals MUST respect file ownership. To modify a file owned by another terminal, update COMMS.md first.

```
T1 owns:
  - package.json (PRIMARY — installs ALL deps for entire project)
  - vite.config.ts
  - tsconfig.json
  - index.html
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

T2 owns:
  - src/types/opportunity.ts
  - src/types/portal.ts
  - src/types/contact.ts
  - src/types/card-config.ts
  - src/types/pipeline.ts
  - src/store/useOpportunityStore.ts
  - src/store/useUIStore.ts
  - src/store/useProcessorStore.ts
  - src/api/client.ts
  - src/api/opportunities.ts
  - src/api/portals.ts
  - src/api/kpi.ts
  - src/api/websocket.ts
  - src/utils/format.ts
  - src/utils/scoring.ts
  - server/index.ts
  - server/routes/opportunities.ts
  - server/routes/portals.ts
  - server/routes/kpi.ts
  - server/routes/ink-process.ts
  - server/db/pool.ts
  - server/db/queries.ts
  - server/ws/pipeline.ts

T3 owns:
  - src/engine/ink-processor/InkSketchProcessor.ts
  - src/engine/ink-processor/grayscale.ts
  - src/engine/ink-processor/gaussian-blur.ts
  - src/engine/ink-processor/sobel-edges.ts
  - src/engine/ink-processor/adaptive-threshold.ts
  - src/engine/ink-processor/line-weight.ts
  - src/engine/ink-processor/hatching.ts
  - src/engine/ink-processor/paper-composite.ts
  - src/engine/ink-processor/processor.worker.ts
  - src/engine/ink-processor/presets.ts
  - src/engine/layer-splitter/LayerSplitter.ts
  - src/engine/layer-splitter/alpha-feather.ts
  - src/engine/layer-splitter/auto-segment.ts
  - src/engine/procedural/SceneGenerator.ts
  - src/engine/procedural/scenes/terminal-curved.ts
  - src/engine/procedural/scenes/federal-building.ts
  - src/engine/procedural/scenes/wide-terminal.ts
  - src/engine/procedural/scenes/modern-angular.ts
  - src/engine/procedural/scenes/curved-tower.ts
  - src/engine/procedural/primitives/palm-tree.ts
  - src/engine/procedural/primitives/crane.ts
  - src/engine/procedural/primitives/runway.ts
  - src/engine/procedural/primitives/jet-bridge.ts
  - src/engine/procedural/primitives/city-skyline.ts
  - src/components/three/ParallaxScene.tsx
  - src/components/three/DepthLayer.tsx
  - src/components/three/ParallaxController.tsx
  - src/components/three/IllustrationViewer.tsx

T4 owns:
  - src/components/stats/StatsBar.tsx
  - src/components/stats/StatValue.tsx
  - src/components/stats/CountUp.tsx
  - src/components/cards/OpportunityCard.tsx
  - src/components/cards/HeroSplitCard.tsx
  - src/components/cards/CompactKanbanCard.tsx
  - src/views/Dashboard.tsx
  - src/views/Showcase.tsx
  - src/views/OpportunityDetail.tsx
  - src/views/Pipeline.tsx
  - src/views/InkProcessor.tsx
  - src/views/PortalHealth.tsx

T5 owns:
  - src/components/cards/CardExporter.tsx
  - src/utils/export.ts
  - src/views/CardBuilder.tsx
  - src/design/animations.css
  - src/components/ui/ErrorBoundary.tsx
  - src/components/ui/LoadingSkeleton.tsx
  - src/components/ui/EmptyState.tsx
  - tests/unit/ink-processor.test.ts
  - tests/unit/layer-splitter.test.ts
  - tests/unit/scoring.test.ts
  - tests/e2e/showcase.spec.ts
  - tests/e2e/detail.spec.ts
  - tests/e2e/processor.spec.ts

SHARED (coordinate writes via COMMS.md):
  - COMMS.md (all terminals)
  - CLAUDE.md (orchestrator only)
```

---

## TERMINAL LOG

### T1 — Foundation + Design System
```
2026-04-27 STARTED: T1 foundation scaffold
2026-04-27 DONE: P1–P5 complete. Build: tsc --noEmit ✅, npm run build ✅

EXPORTS AVAILABLE FOR T2–T5:
  src/design/tokens.ts
    - colors (bg, ink, accent, status, stage, border)
    - typography (fonts, scale)
    - spacing, card, breakpoints

  src/components/layout/Shell.tsx
    - Shell({ children, kpiBar? }) — layout wrapper

  src/components/layout/KPIBar.tsx
    - KPIBar({ stats: { label, value }[] })

  src/components/ui/StatusBadge.tsx
    - StatusBadge({ status: StatusType })
    - StatusType = 'tracking' | 'pursuing' | 'submitted' | 'won' | 'lost'

  src/components/ui/TierBadge.tsx
    - TierBadge({ tier: TierLevel })
    - TierLevel = 'T1' | 'T2' | 'T3'

  src/components/ui/Tag.tsx
    - Tag({ children })

  src/components/ui/SectionLabel.tsx
    - SectionLabel({ children })

  src/components/ui/SearchInput.tsx
    - SearchInput({ value, onChange, placeholder? })

  src/components/ui/DeadlineCountdown.tsx
    - DeadlineCountdown({ deadline: Date | string })

  src/views/* — stub views for T4 to replace (Dashboard, Showcase, OpportunityDetail,
    Pipeline, PortalHealth, InkProcessor, CardBuilder)

CSS VARS: all --bg-*, --ink-*, --accent-*, --status-*, --stage-*, --border*,
  --font-headline/body/mono, --content-padding, --grid-gap, --section-spacing,
  --card-radius, --card-shadow

ROUTE PATHS:
  / → Dashboard
  /showcase → Showcase
  /opportunities/:id → OpportunityDetail
  /pipeline → Pipeline
  /portals → PortalHealth
  /processor → InkProcessor
  /card-builder → CardBuilder
```

### T2 — Data Layer + API Server
```
[Timestamp entries added by T2 as it works]
```

### T3 — Ink Engine + Three.js
```
2026-04-27 STARTED: T3 ink engine + Three.js
2026-04-27 DONE: P12–P17 complete. tsc --noEmit ✅  npm run build ✅

EXPORTS AVAILABLE FOR T4–T5:

  src/engine/ink-processor/InkSketchProcessor.ts
    - InkSketchProcessor class
      .process(image, config) → Promise<ProcessorResult>
      .processWithIntermediates(image, config) → Promise<ProcessorResult>
      .dispose()

  src/engine/ink-processor/types.ts
    - ProcessorConfig, ProcessorResult, LayerOutput, WorkerRequest, WorkerResponse
    - LineWeight = 'heavy' | 'medium' | 'light'

  src/engine/ink-processor/presets.ts
    - PRESETS: { 'ink-heavy', 'ink-light', 'ink-architectural' }
    - PresetName

  src/engine/layer-splitter/LayerSplitter.ts
    - LayerSplitter class
      .split(source: HTMLCanvasElement | ImageData) → LayerOutput[]
    - 3 layers: background (depth=10, factor=0.3), midground (depth=5, factor=0.8), foreground (depth=1, factor=1.5)

  src/engine/procedural/SceneGenerator.ts
    - SceneGenerator class (new SceneGenerator(width?, height?))
      .generate(geographyTag) → { canvas, dataURL, sceneType }
    - Tags: 'mia'|'miami' → terminal-curved, 'federal'|'sam'|'usace' → federal-building,
            'dfw'|'dallas' → wide-terminal, 'lga'|'new-york' → modern-angular,
            'mco'|'orlando' → curved-tower

  src/components/three/IllustrationViewer.tsx
    - IllustrationViewer (forwardRef) — primary consumer component
    - Props: { data: IllustrationData, width?, height?, style? }
    - IllustrationData: { id, illustration_url?, geography_tag? }
    - Ref: IllustrationViewerHandle → getCanvas() for T5 export
    - Mobile auto-detects and skips Three.js, renders static img

  src/components/three/ParallaxScene.tsx
    - ParallaxScene({ layers: LayerOutput[], intensity?, style? })
    - Orthographic R3F Canvas, frameloop="demand", dpr capped at 2

  src/components/three/DepthLayer.tsx
    - DepthLayer({ dataURL, depth, parallaxFactor, mouseRef, intensity? })

  src/components/three/ParallaxController.tsx
    - ParallaxController({ containerRef, onInvalidate, children })
    - ParallaxControllerHandle, MouseState
```

### T4 — Views + Cards
```
[Timestamp entries added by T4 as it works]
```

### T5 — Export + Polish + Tests
```
[Timestamp entries added by T5 as it works]
```

### ORCHESTRATOR
```
2026-04-27: Project decomposed into T1–T5. CLAUDE.md and COMMS.md created.
2026-04-27: Repo: https://github.com/infrateki/crm-testing-threejs-comms.git
2026-04-27: Local path: C:\Infratek\repos\crm-testing-threejs-comms
```

---

## BLOCKERS

```
(none yet)
```

---

## DECISION LOG

| Date | Decision | Made by | Impact |
|---|---|---|---|
| 2026-04-27 | No Tailwind — vanilla CSS with custom properties | Sergio/PRD | All terminals use vanilla CSS |
| 2026-04-27 | Three.js skipped on mobile, CSS fallback only | Sergio/PRD | T3 and T5 must implement detection |
| 2026-04-27 | Web Worker mandatory for ink processing | Sergio/PRD | T3 must never run Sobel on main thread |
| 2026-04-27 | Three.js r160+ via @react-three/fiber | Sergio/PRD | T3 uses R3F declarative API |
| 2026-04-27 | No component libraries | Sergio/PRD | T1 builds all UI primitives from scratch |
| 2026-04-27 | Deploy to Vercel, Git remote: infrateki/crm-testing-threejs-comms | Sergio | All terminals push to feature branches |

---

## NEXT SPRINT

- [ ] GHL bidirectional sync integration
- [ ] Server-side ink processing with Sharp
- [ ] "Export Pipeline Deck" multi-card PDF generation
- [ ] Lighthouse performance audit targeting >90
