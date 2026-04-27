# COMMS.md — BIMSEARCH Command Center Roadmap

**Status:** Phase 2 — Feature Build
**Last updated:** April 27, 2026

---

## CURRENT STATE

Phase 1 scaffold complete: all views, components, types, stores, engine, and tests built. Build passes, 48 tests green. Running on demo data (_fixtures.ts). No server deps installed yet.

**Known issues:**
- Procedural illustrations look basic (geometric shapes, not Titan-quality ink sketches)
- No CRUD — opportunities are read-only demo data
- No contact management
- Image assignment from InkProcessor doesn't work
- No data persistence (page refresh resets to demo data)
- Fastify server deps not in package.json (frontend works standalone)

---

## PHASE 2 ROADMAP

### P2.1 — Titan-Quality Illustrations (HIGH PRIORITY)
Replace basic procedural scenes with detailed SVG architectural illustrations:
- 5 SVG scenes: MIA terminal, LGA/NYC, DFW, MCO, Federal building
- 300-500 path elements each, cross-hatching, atmospheric perspective
- 3 depth layers per scene for Three.js parallax
- Varying stroke widths (0.3-2px), hand-drawn imperfection
- Quality bar: looks like Titan website NYC illustration

### P2.2 — Full CRUD
- Create opportunity: modal form from Showcase + "+" in kanban columns
- Edit opportunity: inline edit mode on OpportunityDetail
- Delete opportunity: confirmation modal, bulk delete from Showcase
- Zustand persist middleware → localStorage for all data
- "Reset to Demo Data" button for dev/testing

### P2.3 — Contact Management
- /contacts route: global contacts directory table
- Link/unlink contacts to opportunities
- Add/edit/delete contacts on OpportunityDetail
- Search/filter contacts by name, org, role

### P2.4 — Activity Notes
- Notes section on OpportunityDetail
- Chronological entries with author + timestamp
- "Add a note..." input
- Persisted in Zustand/localStorage

### P2.5 — Pipeline Kanban Enhancements
- "..." context menu on cards: change status/owner/tier, edit, delete
- Column totals: pipeline value sum per column
- Quick-add: "+" at bottom of column, minimal inline form

### P2.6 — 3D Showcase Elements
- Dashboard: subtle wireframe background behind KPI stats
- OpportunityDetail: "3D Preview" tab with interactive building model
- InkProcessor: live Three.js parallax preview after processing
- ThreeSpinner: wireframe cube loading indicator
- All skip on mobile

### P2.7 — Image Pipeline
- Download/generate quality images for each demo opportunity
- InkProcessor "Assign to Opportunity" button working
- Photo upload → ink process → layer split → save to opportunity
- Zustand persistence for illustration URLs

### P2.8 — Server Integration
- Install Fastify deps: fastify @fastify/cors @fastify/websocket @fastify/multipart pg
- Connect to Postgres (BIMSEARCH existing DB)
- Wire API hooks to real endpoints
- WebSocket for real-time scan updates
- GHL sync (bidirectional)

### P2.9 — Production Polish
- Responsive audit: 375px / 768px / 1024px breakpoints
- Lighthouse: Performance >90, Accessibility >85
- Bundle analysis: target <300KB gzipped (excluding Three.js)
- Export pipeline deck: multi-card PDF generation
- Deploy to Vercel

---

## FILE STRUCTURE

```
src/
├── api/            # TanStack Query hooks + fetch client
├── components/
│   ├── cards/      # OpportunityCard, HeroSplitCard, CompactKanbanCard, CardExporter
│   ├── layout/     # Header, KPIBar, Footer, Shell
│   ├── stats/      # StatsBar, StatValue, CountUp
│   ├── three/      # ParallaxScene, DepthLayer, IllustrationViewer
│   └── ui/         # Badges, tags, search, countdown, error boundary, skeleton
├── design/         # tokens.ts, global.css, fonts.css, animations.css
├── engine/
│   ├── ink-processor/  # InkSketchProcessor, Web Worker, presets
│   ├── layer-splitter/ # LayerSplitter, alpha-feather
│   └── procedural/     # SceneGenerator, scenes/, primitives/
├── hooks/          # useIsMobile, usePhotoUpload
├── store/          # Zustand: opportunities, UI, processor
├── types/          # Opportunity, Portal, Contact, CardConfig, Pipeline
├── utils/          # format, scoring, export
└── views/          # Dashboard, Showcase, Detail, Pipeline, Portals, Processor, CardBuilder
server/             # Fastify routes, DB pool, queries, WebSocket (deps not installed)
tests/              # unit/ + e2e/
```
