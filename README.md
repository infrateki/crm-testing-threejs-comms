# BIMSEARCH Command Center

**Repo:** https://github.com/infrateki/crm-testing-threejs-comms.git  
**Owner:** PDBM Consulting / INFRATEK LLC  
**Method:** Boris Multi-Terminal Claude Code Orchestration (T1–T5)

## Quick Start

### 1. Initialize Git
```bash
cd C:\Infratek\repos\crm-testing-threejs-comms
git init
git remote add origin https://github.com/infrateki/crm-testing-threejs-comms.git
```

### 2. Run Terminals in Order

```
Phase 1: T1 (Foundation) — RUN FIRST, ALONE (~15 min)
Phase 2: T2 + T3 + T4   — RUN IN PARALLEL after T1
Phase 3: T5              — RUN AFTER T2+T3+T4 finish
Phase 4: Integration Test — RUN LAST
```

### 3. Terminal Prompts
Copy-paste the prompt from `prompts/T[N]-PROMPT.md` into each Claude Code terminal.

| Terminal | Branch | Prompt File | Role |
|---|---|---|---|
| T1 | `t1/foundation` | `prompts/T1-PROMPT.md` | Scaffold, design system, layout, UI |
| T2 | `t2/data-layer` | `prompts/T2-PROMPT.md` | Types, stores, API, Fastify server |
| T3 | `t3/ink-threejs` | `prompts/T3-PROMPT.md` | Ink processor, Three.js, procedural |
| T4 | `t4/views-cards` | `prompts/T4-PROMPT.md` | 6 views, 3 card types, kanban |
| T5 | `t5/export-polish` | `prompts/T5-PROMPT.md` | Export, animations, tests |

### 4. Coordination Files
- `CLAUDE.md` — Project constitution (all terminals read this)
- `COMMS.md` — Shared task board (all terminals update this)

### 5. After All Terminals Finish
Paste the integration test prompt from `prompts/EXECUTION-BRIEFING.md`.

## Stack
React 18 + Vite 5 + TypeScript 5.4 + Three.js r160+ + @react-three/fiber + Zustand + TanStack Query + Framer Motion + Fastify + Postgres 16 + Vanilla CSS (no Tailwind)
