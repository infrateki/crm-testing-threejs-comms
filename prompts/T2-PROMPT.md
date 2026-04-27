Read COMMS.md and CLAUDE.md. You are T2 — Data Layer + API Server owner.

First: `git checkout -b t2/data-layer` (branch from main after T1 merges, or from t1/foundation)

ultrathink

Tasks P6 + P7 + P8 + P9 + P10 + P11:

Build the complete data layer: TypeScript types matching the Postgres schema, Zustand stores for client state, TanStack Query hooks for all API endpoints, the Fastify REST/WebSocket server, and utility functions. This is the data backbone that T3, T4, and T5 all depend on.

### Requirements

1. **TypeScript interfaces** (src/types/*) — Match the PRD Section 5.1 EXACTLY:
   - `opportunity.ts`: Opportunity, OpportunityStatus (9 values: radar/qualified/jorge_review/contact/proposal/submitted/won/lost/dismissed), Tier (1|2|3), Score (high/medium/low), StatItem
   - `contact.ts`: Contact interface with role_tag, ghl_contact_id
   - `portal.ts`: Portal interface with scan_method, scan_frequency, last_scan_status
   - `card-config.ts`: CardLayout, CardTheme, IllustrationStyle, AnimationStyle, CardConfig
   - `pipeline.ts`: PipelineStage enum/const, stage metadata (id, label, color from CLAUDE.md kanban colors)

2. **Zustand stores** (src/store/*):
   - `useOpportunityStore.ts`: opportunities Map, selectedId, filters (status[], tier[], owner[], portal[]), searchQuery, sortBy, sortOrder
   - `useUIStore.ts`: activeView, selectedOpportunityId, isModalOpen, sidebarCollapsed
   - `useProcessorStore.ts`: currentImage (File|null), processingState ('idle'|'processing'|'done'|'error'), result (ImageData|null), config (threshold, sigma, hatching, preset)

3. **API client** (src/api/client.ts):
   - Fetch wrapper with base URL from env var `VITE_API_URL` (default: http://localhost:3001)
   - JSON headers, error handling, typed responses
   - `apiFetch<T>(path, options)` generic function

4. **TanStack Query hooks** (src/api/*):
   - `opportunities.ts`: useOpportunities(filters), useOpportunity(id), useUpdateOpportunity(), useUploadPhoto()
   - `portals.ts`: usePortals()
   - `kpi.ts`: useKPI(), useDeadlines(days)
   - All with proper query keys, stale times (30s for KPI, 60s for opportunities), background refetch on window focus
   - useUpdateOpportunity must implement optimistic updates for kanban drag-drop

5. **WebSocket client** (src/api/websocket.ts):
   - Connect to `ws://localhost:3001/ws/pipeline`
   - Auto-reconnect with exponential backoff
   - Message types: scan_complete, opportunity_updated, deadline_alert
   - On opportunity_updated → invalidate TanStack Query cache
   - Export a `useWebSocket()` hook

6. **Fastify server** (server/index.ts):
   - Port 3001, CORS for localhost:5173, WebSocket via @fastify/websocket

7. **REST endpoints** (server/routes/*):
   - GET /api/kpi, GET /api/opportunities (paginated+filterable), GET /api/opportunities/:id (with joins), PATCH /api/opportunities/:id, GET /api/deadlines, GET /api/portals, GET /api/alerts, POST /api/opportunities/:id/photos, PATCH /api/opportunities/:id/photos/:photo_id

8. **Database** (server/db/*):
   - `pool.ts`: pg Pool with env vars. `queries.ts`: ALL parameterized SQL

9. **WebSocket server** (server/ws/pipeline.ts):
   - Broadcast events, track clients in Set

10. **Utilities** (src/utils/*):
    - `format.ts`: formatCurrency ($137.8M style), formatDate, formatDaysUntil, formatNumber
    - `scoring.ts`: getScoreColor, getTierLabel, getStatusLabel, getStatusColor

### Files you own (ONLY modify these)
src/types/*, src/store/*, src/api/*, src/utils/format.ts, src/utils/scoring.ts, server/*

### Files you must NOT touch
src/design/*, src/components/layout/*, src/components/ui/*, src/engine/*, src/components/three/*, src/views/*, src/components/cards/*, src/components/stats/*, tests/*

### When done
1. `npx tsc --noEmit` — must pass
2. Update COMMS.md: mark P6–P11 ✅ DONE
3. Note exported types/hooks in COMMS.md
4. `git add -A && git commit -m "feat(T2): types, stores, API hooks, Fastify server, utilities" && git push -u origin t2/data-layer`
