Read COMMS.md and CLAUDE.md. You are T4 — Views + Cards owner.

First: `git checkout -b t4/views-cards` (branch from main after T1 merges, or from t1/foundation)

ultrathink

Tasks P18 + P19 + P20 + P21 + P22 + P23 + P24 + P25:

Build all 6 application views and all card/stats components. You consume T1's UI primitives, T2's data hooks, and T3's Three.js + ink engine. Every view must match Arcus/Titan editorial aesthetic — architectural, restrained, premium.

### Requirements

1. **Stats components** (src/components/stats/*):
   - `StatsBar.tsx`: Horizontal bar with 1px dividers. Props: stats: StatItem[], theme: 'light'|'cream'. JetBrains Mono 28–32px/700 values, DM Sans 11–12px/400/#9CA3AF labels. 20px vertical padding. var(--bg-cream) background for cream theme.
   - `StatValue.tsx`: Single stat (value + label stacked). JetBrains Mono value, DM Sans label.
   - `CountUp.tsx`: Animated counter, rAF from 0→target in 1.5s with easing. IntersectionObserver trigger. JetBrains Mono.

2. **Card components** (src/components/cards/*):

   `OpportunityCard.tsx` (compact grid):
   - Props: opportunity: Opportunity, onClick
   - Illustration top (IllustrationViewer from T3 at reduced size), content below
   - SectionLabel (agency), Playfair Display 24px/900 title, 2 inline stats, StatusBadge, Tags, TierBadge
   - Hover: parallax activates, scale(1.01) CSS transition
   - Card: white bg, 1px border, 3px radius, shadow 0 1px 3px rgba(0,0,0,0.06). Min-width 380px.

   `HeroSplitCard.tsx` (detail/presentation):
   - Props: opportunity: Opportunity, config?: CardConfig
   - 50/50 split: left=IllustrationViewer with parallax (full-bleed, no radius), right=content
   - Right: SectionLabel (agency), Playfair 36–48px/900 title, StatusBadge + set-aside + geography, DM Sans 15px scope, "PDBM ADVANTAGE" callout (left-bordered accent-sage), tags/NAICS/solicitation
   - Below: full-width StatsBar. [Upload Photo] button on illustration.

   `CompactKanbanCard.tsx` (kanban):
   - Props: opportunity, onClick, isDragging?
   - Title (DM Sans 14px/600), agency (12px/400 #6B7280), value (JetBrains Mono 13px), DeadlineCountdown, TierBadge
   - No illustration. Drag: elevated shadow, opacity 0.8. Card: white, 1px border, 3px radius, 12px padding.

3. **Dashboard** (src/views/Dashboard.tsx) — Route: /
   - KPIBar: useKPI() → Active, Pursuing, Submitted, Pipeline Value
   - Hot Opportunity: useOpportunities({hot:true, limit:1}) → HeroSplitCard with full Three.js parallax
   - This Week Deadlines: useDeadlines(7) → list with DeadlineCountdown, click→detail
   - Recent Scans: usePortals({recent_scans:true}) → portal + status icon + count
   - Team Workload: from KPI → horizontal bar per member
   - Layout per PRD Section 6.1 wireframe

4. **Showcase** (src/views/Showcase.tsx) — Route: /showcase
   - CSS Grid: repeat(auto-fill, minmax(380px, 1fr)), gap 24px
   - Filter bar: status multi-select, tier toggles, owner dropdown, portal dropdown, search (pg_trgm)
   - Sort: deadline (default), value, score, updated
   - OpportunityCard with staggered entrance (opacity 0→1, translateY 20→0, 100ms delay per index)
   - Click → /opportunities/:id with Framer Motion layout animation

5. **OpportunityDetail** (src/views/OpportunityDetail.tsx) — Route: /opportunities/:id
   - useOpportunity(id). Back button. Full HeroSplitCard with parallax.
   - StatsBar below card. Tabs: Contacts | Documents | Actions | Timeline
   - Bottom: Card Export placeholder (T5 owns CardExporter)

6. **Pipeline Kanban** (src/views/Pipeline.tsx) — Route: /pipeline
   - 7 columns: Radar (#94A3B8), Qualified (#8B5CF6), Jorge Review (#F59E0B), Contact (#3B82F6), Proposal (#6366F1), Won (#059669), Lost (#EF4444)
   - Column headers: name + color dot + count. Background 5% opacity of color.
   - CompactKanbanCard per column. HTML5 drag API (onDragStart/Over/Drop).
   - On drop: useUpdateOpportunity mutation with optimistic update.
   - Owner filter dropdown. Independent column scroll.

7. **InkProcessor** (src/views/InkProcessor.tsx) — Route: /processor
   - File upload (drag-drop + click). Controls: preset, threshold slider (0–100), sigma slider (0.5–3.0), hatching toggle, paper (cream/white).
   - Before/After split. Pipeline visualization: 7 intermediate thumbnails.
   - Progress during processing. Buttons: Download PNG, Download SVG, Assign to Opportunity.
   - Uses InkSketchProcessor.processWithIntermediates() from T3.

8. **PortalHealth** (src/views/PortalHealth.tsx) — Route: /portals
   - Table: Name, Type, Tier, Scan Method, Frequency, Last Scan, Status, Opps Found, Notes
   - Row colors: green (ok), yellow (partial/approaching), red (failed/overdue), gray (inactive)
   - Click row → expand scan log. Uses usePortals().

### Files you own (ONLY modify these)
- src/components/stats/StatsBar.tsx, StatValue.tsx, CountUp.tsx
- src/components/cards/OpportunityCard.tsx, HeroSplitCard.tsx, CompactKanbanCard.tsx
- src/views/Dashboard.tsx, Showcase.tsx, OpportunityDetail.tsx, Pipeline.tsx, InkProcessor.tsx, PortalHealth.tsx

### Files you must NOT touch
- src/design/*, src/components/layout/*, src/components/ui/* (T1 — import only)
- src/types/*, src/store/*, src/api/*, src/utils/*, server/* (T2 — import only)
- src/engine/*, src/components/three/* (T3 — import only)
- src/components/cards/CardExporter.tsx, src/views/CardBuilder.tsx (T5)
- tests/* (T5)

### Dependencies (check these exist before importing)
- T1: StatusBadge, TierBadge, Tag, SectionLabel, SearchInput, DeadlineCountdown, design tokens
- T2: all types, useOpportunities, useOpportunity, useKPI, useDeadlines, usePortals, useUpdateOpportunity, format/scoring utils
- T3: ParallaxScene, IllustrationViewer, InkSketchProcessor, LayerSplitter, SceneGenerator
- If T2/T3 not done yet: create minimal stubs/interfaces as placeholders

### Constraints
- NO Tailwind, NO component libraries. Card radius 3px max.
- Typography must match design system EXACTLY. Staggered animations 100ms/card.
- Kanban drag-drop: optimistic updates. Named exports only. `/compact` at 60%.

### When done
1. `npx tsc --noEmit` + `npm run build` — must pass
2. All 6 views render (with demo data if API not ready)
3. Kanban drag-drop updates state. Card typography matches spec.
4. Update COMMS.md: P18–P25 ✅ DONE
5. `git add -A && git commit -m "feat(T4): 6 views, 3 card types, stats, kanban" && git push -u origin t4/views-cards`
