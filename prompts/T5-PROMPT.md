Read COMMS.md and CLAUDE.md. You are T5 — Export + Polish + Tests owner.

First: `git checkout -b t5/export-polish` (branch from main after T1–T4 merge, or from latest main)

Tasks P26 + P27 + P28 + P29 + P30 + P31 + P32 + P33:

Final layer: card export, CardBuilder, photo upload flow, animations, responsive, error handling, tests.

### Requirements

1. **CardExporter** (src/components/cards/CardExporter.tsx):
   - Props: opportunity: Opportunity, rendererRef: RefObject<THREE.WebGLRenderer>
   - PNG: renderer.domElement.toDataURL at 2x pixel ratio + text overlay via Canvas 2D API (stats, headline, metadata with correct font metrics)
   - SVG: embed ink-sketch as base64 <image> + <text> elements (Playfair/DM Sans/JetBrains Mono) — resolution-independent
   - Clipboard: navigator.clipboard.write() with ClipboardItem
   - Buttons: [Export as PNG] [Export as SVG] [Copy to Clipboard] with progress spinner

2. **Export utility** (src/utils/export.ts):
   - exportAsPNG(renderer, scene, camera, width, height, opportunity) → data URL
   - exportAsSVG(illustrationDataURL, opportunity, config) → SVG string
   - downloadFile(dataURL, filename) → triggers browser download
   - Wait for document.fonts.ready before text rendering. Export at 2x for 300 DPI equivalent.

3. **CardBuilder** (src/views/CardBuilder.tsx) — Route: /card-builder
   - Manual card creation form: title, agency, scope, stats (dynamic add/remove), tags, status, tier
   - Illustration: upload photo OR choose procedural scene type
   - Live preview: HeroSplitCard renders as form changes. Export buttons at bottom.

4. **Photo upload hook** (coordinate across T3 engine + T4 views):
   - `usePhotoUpload` hook: accept file → POST /api/opportunities/:id/photos → InkSketchProcessor → split layers → update Three.js scene → PATCH processed_url
   - Progress: uploading → processing → splitting → done. Error handling with retry.

5. **Animations** (src/design/animations.css):
   - @keyframes fadeInUp, fadeIn, slideInRight, shimmer (skeleton loader), pulseSubtle (deadline urgency)
   - Framer Motion page transition variants. Stagger: .stagger-child with calc(var(--index) * 100ms)

6. **Responsive** — Breakpoints: 375px mobile, 768px tablet, 1024px desktop
   - Mobile (<768): NO Three.js (CSS transform fallback), single-column grid, kanban horizontal scroll with snap, hero-split stacks vertically, stats 2-col grid, hamburger nav
   - Tablet (768–1024): 2-col grid, kanban 3–4 visible columns, hero-split 40/60
   - Hook: `useIsMobile()` with matchMedia listener

7. **Error boundaries + loading** (src/components/ui/*):
   - `ErrorBoundary.tsx`: Paper-grain bg, geometric line-art, "Something went wrong" in DM Sans, retry button. NOT blank white.
   - `LoadingSkeleton.tsx`: Cream bg with shimmer. Variants: card, text-line, stats-bar, illustration.
   - `EmptyState.tsx`: Procedural line-art + contextual message. Props: title, description, action.

8. **Unit tests** (tests/unit/*):
   - `ink-processor.test.ts`: Grayscale accuracy, Sobel on synthetic image, threshold binary output
   - `scoring.test.ts`: getScoreColor/getTierLabel/getStatusColor return correct values
   - Use Vitest, mock Canvas API

9. **E2E tests** (tests/e2e/*):
   - `showcase.spec.ts`: /showcase renders grid → filter changes count → click navigates
   - `detail.spec.ts`: /opportunities/:id renders hero-split + stats + tabs
   - `processor.spec.ts`: /processor upload → process → before/after render
   - Use Playwright

### Files you own
- src/components/cards/CardExporter.tsx
- src/utils/export.ts
- src/views/CardBuilder.tsx
- src/design/animations.css
- src/components/ui/ErrorBoundary.tsx, LoadingSkeleton.tsx, EmptyState.tsx
- tests/unit/ink-processor.test.ts, layer-splitter.test.ts, scoring.test.ts
- tests/e2e/showcase.spec.ts, detail.spec.ts, processor.spec.ts

### Files you must NOT touch
All other src/ files (T1/T2/T3/T4 owned) — import only.

### When done
1. `npx tsc --noEmit` + `npm run test` + `npm run build` — all pass
2. PNG export produces high-quality image. Mobile fallback works.
3. Update COMMS.md: P26–P33 ✅ DONE
4. `git add -A && git commit -m "feat(T5): export, animations, responsive, tests" && git push -u origin t5/export-polish`
