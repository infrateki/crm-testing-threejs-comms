# BIMSEARCH Command Center — Execution Briefing

## Execution Order

```
Phase 1: T1 (Foundation)         — RUN FIRST, ALONE (~15 min)
         ↓ wait for T1 to finish
Phase 2: T2 + T3 + T4            — RUN IN PARALLEL (~30 min)
         ↓ wait for ALL to finish
Phase 3: T5                      — RUN AFTER T2+T3+T4 (~20 min)
         ↓ wait for T5 to finish
Phase 4: Integration Test        — RUN LAST
```

## How to Start Each Terminal

In VS Code, you have terminals: T1, T3, T4, T5, misc

### Step 1: T1 in its own terminal
```
cd C:\Infratek\repos\crm-testing-threejs-comms
claude
```
Then paste the ENTIRE contents of `prompts/T1-PROMPT.md` into Claude Code.
Wait until it finishes and pushes to t1/foundation.

### Step 2: Merge T1 to main
In the "misc" terminal (regular PowerShell, not Claude):
```bash
git checkout main
git merge t1/foundation
git push origin main
```

### Step 3: T2, T3, T4 in parallel
Open 3 Claude Code sessions (one per terminal tab).
Each one: paste the contents of their respective prompt file.
They'll each create their own branch and push.

### Step 4: Merge all to main
```bash
git checkout main
git merge t2/data-layer
git merge t3/ink-threejs
git merge t4/views-cards
git push origin main
```
Resolve any conflicts (there shouldn't be any if file ownership is respected).

### Step 5: T5
Paste T5 prompt. It branches from main (which now has T1–T4 merged).

### Step 6: Final merge + Integration Test
```bash
git checkout main
git merge t5/export-polish
git push origin main
```
Then paste this integration test prompt into a fresh Claude Code session:

---

## Integration Test Prompt (paste after all merges)

```
Read COMMS.md and CLAUDE.md. You are the integration verifier.

1. Run `npm run build` — fix any errors
2. Run `npx tsc --noEmit` — fix any type errors
3. Run `npm run lint` — fix any lint errors
4. Run `npm run test` — fix any test failures
5. Start dev server (`npm run dev`) and verify:
   a. Dashboard loads with KPIBar and layout
   b. Showcase renders card grid with staggered animation
   c. Click card → OpportunityDetail renders hero-split with Three.js parallax
   d. Pipeline kanban shows 7 columns, cards dragable between them
   e. InkProcessor accepts file upload and renders ink-sketch result
   f. PortalHealth table renders with color-coded rows
   g. CardBuilder form produces live card preview
6. Verify Three.js: mouse move on illustration → smooth layered parallax
7. Verify mobile: resize to 375px → no Three.js, CSS fallback, no errors
8. Verify export: "Export as PNG" on detail view → high-res image
9. Check all imports resolve (no missing modules)
10. Update COMMS.md: mark integration ✅ DONE or list issues
11. git add -A && git commit -m "fix: integration pass" && git push origin main
```

## Image Seeding Strategy

For demo data, T3 should download/create seed images:

| Opportunity | Search Query | Style |
|---|---|---|
| MIA South Terminal | "Miami airport terminal expansion" | ink-architectural |
| PANYNJ LGA | "LaGuardia airport new terminal B" | ink-architectural |
| DFW Terminal | "DFW airport terminal interior" | ink-light |
| MCO South Terminal | "Orlando airport south terminal" | ink-heavy |
| SAM.gov Federal | "army corps engineers facility" | ink-heavy |

Store in: `public/images/opportunities/`
Process through InkSketchProcessor → save as `{name}-ink.png`
Split into 3 layers → save as `{name}-bg.png`, `{name}-mg.png`, `{name}-fg.png`

If web search/download isn't available in Claude Code, use procedural SceneGenerator as the primary illustration source (it's designed for exactly this fallback).

## Vercel Deployment

After integration passes:
```bash
npm install -g vercel
vercel --prod
```
Or connect the GitHub repo to Vercel dashboard for auto-deploy on push to main.

Note: The Fastify server (server/) deploys separately — either as a Vercel serverless function or on Railway/Render. For initial demo, the frontend can use mock data from Zustand stores.
