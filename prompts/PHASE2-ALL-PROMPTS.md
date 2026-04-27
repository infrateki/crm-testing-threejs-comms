# BIMSEARCH Phase 2 — Step by Step

---

## STEP 0: PREP (do this now, misc terminal PowerShell)

```bash
cd C:\Infratek\repos\crm-testing-threejs-comms
git checkout main
git pull origin main
git add CLAUDE.md COMMS.md prompts/
git commit -m "refactor: Phase 2 coordination files" 
git push origin main
```

Wait for the SVG illustrations prompt to finish if it's still running. Once done, pull its changes:
```bash
git pull origin main
```

---

## STEP 1: CRUD + COLLABORATION

**Terminal:** T1 (or any fresh Claude Code session)
**Model:** Opus 4.7 (`/model` → select Opus)
**Time:** ~30 min

Open Claude Code, then paste this ENTIRE block:

```
Read COMMS.md and CLAUDE.md. You are building the interactive collaboration layer. ultrathink

This app must be a LIVE working tool. Build full CRUD, contact management, notes, and kanban enhancements. All data persists via Zustand + localStorage. API calls attempted but fall back gracefully if server unavailable. Auto accept everything. Do not stop until you are done.

1. ZUSTAND PERSISTENCE: Update src/store/useOpportunityStore.ts — add persist middleware (localStorage key 'bimsearch-opportunities'), deep merge with _fixtures.ts defaults. Add actions: createOpportunity, updateOpportunity, deleteOpportunity, bulkDeleteOpportunities, bulkUpdateStatus, createContact, updateContact, deleteContact, linkContactToOpportunity, unlinkContactFromOpportunity, addNote(oppId, author, text), deleteNote, resetToDefaults(). Use crypto.randomUUID() for IDs.

2. CREATE OPPORTUNITY: In Showcase.tsx add "New Opportunity" button → slide-over panel (480px right) with full form (title, agency, scope, value, deadline, status, tier, score, owner, geography, BIM req, PDBM angle, tags as chips, dynamic stats pairs). On submit → createOpportunity, close panel. In Pipeline.tsx add "+" at bottom of each column → inline mini-form (title + agency only), creates with that column's status.

3. EDIT OPPORTUNITY: In OpportunityDetail.tsx add Edit button (pencil, top-right) → toggles all fields to edit mode (inputs/dropdowns/textareas). Save button commits to store, Cancel reverts. Unsaved changes warning on navigate. In Pipeline.tsx add "..." menu on each kanban card → Change Status/Owner/Tier submenus, Edit (navigate), Delete (confirm).

4. DELETE: In OpportunityDetail.tsx add Delete button (trash, red) → confirmation modal → delete from store → navigate to /showcase. In Showcase.tsx add selection checkboxes on hover → bulk Delete Selected + bulk Move to Status.

5. CONTACTS: Create src/views/Contacts.tsx (route /contacts) — directory table (name, title, org, email, phone, role, linked opps count), search/filter, add/edit/delete inline. Add to App.tsx routes and Header.tsx nav. In OpportunityDetail.tsx Contacts tab: Link Existing (searchable dropdown), Add New (inline form), Unlink, Edit each contact.

6. NOTES: In OpportunityDetail.tsx add Notes tab — "Add a note..." input, chronological entries (initials avatar, author, relative timestamp, text), delete with confirm. Default author "Sergio". Persisted in store.

7. KANBAN: Pipeline.tsx — column value totals ($XXM in JetBrains Mono below header), independent column scroll, empty column dashed border + "+" centered.

8. SETTINGS: Gear icon in Footer → panel with "Reset to Demo Data" (confirm first), "Export Data" (JSON download), "Import Data" (JSON upload).

When done: npx tsc --noEmit && npm run build must pass. git add -A && git commit -m "feat: full CRUD, contacts, notes, persistence" && git push origin main
```

**After it finishes, in misc terminal:**
```bash
git checkout main && git pull origin main
```

---

## STEP 2: 3D ELEMENTS + IMAGE PIPELINE

**Terminal:** T3 (or any fresh Claude Code session)  
**Model:** Opus 4.7
**Time:** ~25 min

Paste this ENTIRE block:

```
Read COMMS.md and CLAUDE.md. Add 3D showcase elements and fix the image pipeline. ultrathink. Auto accept everything. Do not stop until done.

1. DASHBOARD 3D BG: In Dashboard.tsx add R3F Canvas behind KPI stats (position absolute, z-index -1, 100% width, 300px height). GridHelper(40,40,'#E5E7EB') + 3-4 wireframe BoxGeometry buildings MeshBasicMaterial wireframe #D1D5DB. OrthographicCamera 30° angle, auto-rotate 0.001 rad/frame. Opacity 0.12. frameloop="demand". Skip on mobile (useIsMobile).

2. 3D PREVIEW TAB: In OpportunityDetail.tsx add "3D Preview" tab. R3F Canvas 100% × 500px. Procedural building by geography_tag: MIA=curved TubeGeometry roof, LGA=angular boxes, DFW=elongated flat, MCO=CylinderGeometry tower, Federal=box+cylinder columns+prism pediment. MeshStandardMaterial wireframe=true color=#2C3E50. AmbientLight(0.4) + DirectionalLight(0.8). OrbitControls from drei. GridHelper ground. Bg #FAF8F3. Skip mobile.

3. SPINNER: Create src/components/ui/ThreeSpinner.tsx — 60x60 R3F Canvas, rotating wireframe IcosahedronGeometry color #9CA3AF, 0.02 Y + 0.01 X rad/frame. Use as Suspense fallback in App.tsx.

4. INK PROCESSOR 3D PREVIEW: In InkProcessor.tsx after processing → auto LayerSplitter → render ParallaxScene with 3 depth sliders. Mouse-over for live parallax.

5. IMAGE ASSIGNMENT FIX: In InkProcessor.tsx "Assign to Opportunity" → dropdown of all opportunities from store → save processed dataURL + layer URLs to opportunity → toast notification → Showcase re-renders.

6. PARALLAX HOVER: In OpportunityCard.tsx verify parallax activates on mouseenter intensity 0.02, smooth return on mouseleave.

When done: npx tsc --noEmit && npm run build must pass. git add -A && git commit -m "feat: 3D showcase, image pipeline, parallax" && git push origin main
```

**After it finishes, in misc terminal:**
```bash
git checkout main && git pull origin main
```

---

## STEP 3: PRODUCTION + VERCEL CONFIG

**Terminal:** T2 (or any fresh Claude Code session)  
**Model:** Sonnet (faster, this is straightforward)
**Time:** ~15 min

Paste this ENTIRE block:

```
Read COMMS.md and CLAUDE.md. Production hardening and deploy config. Auto accept everything. Do not stop until done.

1. SERVER DEPS: Run: npm install fastify @fastify/cors @fastify/websocket @fastify/multipart pg && npm install -D @types/pg tsx. Add package.json scripts: "server": "tsx server/index.ts", "server:dev": "tsx watch server/index.ts".

2. FIX SERVER TYPES: Run npx tsc --noEmit, fix ALL type errors in server/ directory. The code was written before deps were installed.

3. ENV: Create .env.example with PGHOST=localhost PGPORT=5432 PGDATABASE=bimsearch PGUSER=postgres PGPASSWORD= VITE_API_URL=http://localhost:3001. Make sure .env is in .gitignore.

4. API FALLBACK: Update all TanStack hooks in src/api/ — retry:1 retryDelay:3000, on failure return undefined and let Zustand demo data be fallback. App must work 100% without server.

5. VERCEL: Create vercel.json: {"buildCommand":"npm run build","outputDirectory":"dist","framework":"vite","rewrites":[{"source":"/(.*)","destination":"/index.html"}]}

6. META: In index.html set title "BIMSEARCH Command Center — PDBM Consulting", add meta description, OG tags. Create public/favicon.svg — letter B in monospace style #1a1a1a on white, link in index.html.

7. BUILD CHECK: Run npx tsc --noEmit && npm run build && npm run lint && npm run test. Fix anything broken.

When done: git add -A && git commit -m "feat: server deps, vercel config, production ready" && git push origin main
```

**After it finishes, in misc terminal:**
```bash
git checkout main && git pull origin main
```

---

## STEP 4: DEPLOY

**Terminal:** misc (regular PowerShell, NOT Claude Code)
**Time:** 5 min

```bash
cd C:\Infratek\repos\crm-testing-threejs-comms
npm run build
npx vercel --prod
```

Follow the Vercel prompts. Or go to https://vercel.com/new and import infrateki/crm-testing-threejs-comms.

After deploy, open the URL and verify everything works.

```bash
git add -A && git commit -m "deploy: vercel production" && git push origin main
```

**Done. Share the Vercel URL with Jorge.**
