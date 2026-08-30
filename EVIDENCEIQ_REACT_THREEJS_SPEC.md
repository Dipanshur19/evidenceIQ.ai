# EvidenceIQ.ai — React + Node.js + Three.js + Framer Motion
## Full Development Prompt & Architecture Specification

Use this document as a single build prompt for an AI coding agent or as a specification for a human development team. It converts the original Streamlit/FastAPI/Python EvidenceIQ.ai prototype into a modern **React + Node.js** web application, with **Three.js** for the 3D Business Evidence Graph and **Framer Motion** for UI motion and transitions.

---

## 1. Project Brief

> Build "EvidenceIQ.ai" — a KPI Intelligence-to-Action web application.
> **Frontend:** React (Vite), Three.js (via `@react-three/fiber` + `@react-three/drei`), Framer Motion, Recharts/D3 for 2D charts, TailwindCSS.
> **Backend:** Node.js + Express (or Fastify), SQLite (via `better-sqlite3` or Postgres via `pg`), Socket.io for live telemetry streaming.
> **LLM Layer:** Ollama (local, free) via HTTP API, with an adapter so it can be swapped for the Anthropic API.
> **Core Mechanics:** Detect statistically significant KPI anomalies, isolate root-cause drivers across multiple data sources, rank hypotheses on a graph (rendered in 3D), generate persona-specific (Executive vs Analyst) LLM narration with numeric guardrails, express confidence/abstain when data is sparse, gate any recommended action behind a human Confirm/Reject/Modify checkpoint, and log full telemetry (latency, tokens, cost, lineage) for audit.

---

## 2. Functional Requirements

1. **Deterministic quantitative core:** Anomaly detection ($z$-scores / rolling baselines) must run in JS/Node math, never via the LLM.
2. **Multi-source reconciliation:** Join daily revenue CSV, a change-log/events feed, and support-ticket logs on time + region/segment keys.
3. **Graph-first root cause ranking:** Build a directed graph with `PRECEDES` and `CORROBORATES` edge types; score hypotheses by graph proximity/weight, not just correlation.
4. **Persona-specific narration:** Same evidence, two LLM prompts: Executive (risk + recommended action, plain language) and Analyst ($z$-scores, event IDs, raw evidence).
5. **Abstention under uncertainty:** Explicit confidence tiers (High/Medium/Low/Abstain) with a hard rule: if history < N days or evidence score < threshold, the system must say "insufficient evidence" instead of guessing.
6. **Risk-gated actions:** Every recommended action carries a risk tier (Low/Med/High); Medium/High actions cannot execute without a human clicking Confirm, Reject, or Modify.
7. **Telemetry & audit:** Log latency (deterministic vs LLM), model name, token/cost estimate, data lineage, and a fail-closed audit trail (if telemetry logging fails, the action is blocked, not silently allowed).

---

## 3. Recommended Tech Stack & Docs

### Frontend
| Purpose | Library | Docs |
|---|---|---|
| App framework | React 18 + Vite | https://react.dev/ · https://vitejs.dev/ |
| 3D evidence graph | Three.js via React Three Fiber | https://threejs.org/ · https://docs.pmnd.rs/react-three-fiber |
| 3D helpers (orbit controls, text, etc.) | drei | https://github.com/pmndrs/drei |
| Force-directed graph layout (feeds R3F) | d3-force-3d or ngraph.forcelayout | https://github.com/vasturiano/d3-force-3d · https://github.com/anvaka/ngraph.forcelayout |
| Prebuilt 3D graph component (fastest path) | react-force-graph (3d mode) | https://github.com/vasturiano/react-force-graph |
| Motion/transitions | Framer Motion | https://www.framer.com/motion/ |
| 2D charts (KPI trend lines, z-score bands) | Recharts or Visx | https://recharts.org/ · https://airbnb.io/visx/ |
| Styling | Tailwind CSS | https://tailwindcss.com/ |
| State/data fetching | TanStack Query | https://tanstack.com/query/latest |
| Realtime telemetry stream | Socket.io-client | https://socket.io/docs/v4/client-api/ |

### Backend
| Purpose | Library | Docs |
|---|---|---|
| Server | Node.js + Express | https://nodejs.org/ · https://expressjs.com/ |
| Realtime push | Socket.io | https://socket.io/ |
| DB (matches original SQLite design) | better-sqlite3 | https://github.com/WiseLibs/better-sqlite3 |
| DB (if scaling to Postgres) | pg / Prisma | https://node-postgres.com/ · https://www.prisma.io/ |
| CSV/data ingestion | PapaParse (Node-safe) or csv-parse | https://www.papaparse.com/ · https://csv.js.org/parse/ |
| Stats (z-scores, rolling baselines) | simple-statistics | https://simplestatistics.org/ |
| Local LLM | Ollama HTTP API (`qwen2.5:1.5b` or similar) | https://github.com/ollama/ollama/blob/main/docs/api.md |
| Optional cloud LLM swap-in | Anthropic API (`/v1/messages`) | https://docs.claude.com/en/api/messages |
| Job scheduling (nightly anomaly scan) | node-cron | https://github.com/node-cron/node-cron |

---

## 4. Datasets

Pick one **primary transactional dataset** for revenue/order volume, and pair it with a synthetic **events log** and **support ticket log**.

### Primary revenue/order datasets (real, public):
- UCI "Online Retail" (UK e-commerce, ~540k transactions, Dec 2010–Dec 2011): https://archive.ics.uci.edu/dataset/352/online+retail
- UCI "Online Retail II" (extended version, 2009–2011): https://archive.ics.uci.edu/dataset/502/online+retail+ii
- Kaggle mirror of the same dataset: https://www.kaggle.com/datasets/vijayuv/onlineretail

### Anomaly-detection benchmark datasets:
- Numenta Anomaly Benchmark (NAB): https://github.com/numenta/NAB
- Kaggle "Time Series Anomaly Detection" collections: https://www.kaggle.com/datasets?search=time+series+anomaly+detection

### E-commerce/KPI style datasets:
- Kaggle "Superstore Sales Dataset": https://www.kaggle.com/datasets/vivek468/superstore-dataset-final
- Kaggle "E-Commerce Data": https://www.kaggle.com/datasets/carrie1/ecommerce-data

### Support-ticket style datasets:
- Kaggle "Customer Support Ticket Dataset": https://www.kaggle.com/datasets/suraj520/customer-support-ticket-dataset

---

## 5. Repository Structure

```
evidenceiq-web/
├── apps/
│   ├── web/                     # React + Vite frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── graph/       # Three.js / R3F Business Evidence Graph
│   │   │   │   ├── charts/      # Recharts KPI trend + anomaly bands
│   │   │   │   ├── narration/   # Executive vs Analyst narrative panels
│   │   │   │   ├── checkpoint/  # Confirm/Reject/Modify action gate UI
│   │   │   │   └── telemetry/   # Live latency/cost/lineage drawer
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   └── lib/
│   │   └── vite.config.ts
│   └── api/                     # Node.js + Express backend
│       ├── src/
│       │   ├── ingestion/       # CSV loaders, reconciliation joins
│       │   ├── anomaly/         # z-score + baseline detection (deterministic)
│       │   ├── graph/           # Evidence graph build + scoring
│       │   ├── narration/       # LLM prompt templates + Ollama/Anthropic adapter
│       │   ├── actions/         # risk gating, checkpoint state machine
│       │   ├── telemetry/       # latency/cost/lineage logging (fail-closed)
│       │   └── routes/
│       └── db/
│           ├── schema.sql
│           └── seed/            # downloaded datasets + generated events/tickets
├── package.json                 # npm/yarn/pnpm workspaces
└── README.md
```

---

## 6. Core API Contract (Node/Express)

```http
GET  /api/kpis                     -> list of tracked KPIs + current status
GET  /api/kpis/:id/series          -> time series + rolling baseline + z-score band
GET  /api/anomalies                -> ranked list of detected anomalies
GET  /api/anomalies/:id/graph      -> evidence graph nodes/edges for 3D render
GET  /api/anomalies/:id/narration  -> { executive: {...}, analyst: {...}, confidence }
POST /api/actions/:id/checkpoint   -> { decision: "confirm" | "reject" | "modify", note }
GET  /api/telemetry/stream         -> Socket.io channel: latency, tokens, cost, lineage
```

---

## 7. Three.js / React Three Fiber — Evidence Graph Spec

- **Nodes:** `{KPI, Event, SupportTicketCluster, Hypothesis}`; color-code by node type, size by evidence weight.
- **Edges:** `PRECEDES` (directional, arrow) and `CORROBORATES` (bidirectional, dashed).
- Use `d3-force-3d` (or `react-force-graph`'s `ForceGraph3D`) to auto-layout, then wrap in R3F for camera controls (`OrbitControls` from drei).
- **On node click:** open a Framer Motion side panel with the node's raw evidence (event id, ticket count, $z$-score).
- Highlight the top-ranked hypothesis path with an animated pulse (emissive material intensity or `useFrame` sine pulse).
- **Performance:** cap to ~150 nodes on screen at once; cluster support tickets into a single node with a count badge rather than one node per ticket.

---

## 8. Framer Motion Usage Map

- **Page/route transitions:** `AnimatePresence` + `motion.div` fade/slide.
- **KPI anomaly cards:** stagger-in with `motion.ul` + `variants` when the anomaly list loads.
- **Confidence badge (High/Medium/Low/Abstain):** color + subtle scale animation on change.
- **Checkpoint modal (Confirm/Reject/Modify):** spring-in modal, disabled-state animation while awaiting backend response.
- **Telemetry drawer:** slide-in panel synced to Socket.io events (numbers count up with `useMotionValue` + `animate`).

---

## 9. LLM Narration Adapter (Ollama & Anthropic)

```js
// apps/api/src/narration/llmAdapter.js
async function generateNarration({ persona, evidence, model = "qwen2.5:1.5b" }) {
  const prompt = buildPrompt(persona, evidence); // strict numeric guardrails baked into template
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false })
  });
  const data = await res.json();
  return { text: data.response, model, tokens: estimateTokens(prompt, data.response) };
}
```

---

## 10. Build Milestones

1. **Data layer:** Ingest Online Retail dataset, generate synthetic events + tickets, load into SQLite, write reconciliation joins.
2. **Deterministic anomaly engine:** Rolling mean/std, $z$-score flags, sparse-history abstention rule.
3. **Evidence graph builder:** Construct nodes/edges, scoring function (weight by recency + corroboration count).
4. **API layer:** Express routes above, Socket.io telemetry channel.
5. **React shell:** Routing, Tailwind theme, layout.
6. **3D graph view:** R3F + drei + force layout, node click → detail panel.
7. **Charts + narration panels:** Recharts trend/$z$-score bands, Executive/Analyst narrative cards.
8. **Checkpoint gate:** Confirm/Reject/Modify UI wired to `/api/actions/:id/checkpoint`, blocked for Medium/High risk until decided.
9. **Telemetry drawer:** Live latency/token/cost/lineage via Socket.io + Framer Motion counters.
10. **Polish pass:** Framer Motion transitions everywhere, empty/loading/abstain states, README + demo script.

---

## 11. Single Install Command

```bash
# frontend (apps/web)
npm i react react-dom vite @vitejs/plugin-react tailwindcss postcss autoprefixer \
  three @react-three/fiber @react-three/drei react-force-graph-3d d3-force-3d \
  framer-motion recharts @tanstack/react-query socket.io-client

# backend (apps/api)
npm i express better-sqlite3 socket.io simple-statistics csv-parse node-cron cors dotenv
```

---

## 12. Starter Agent Prompt

> "Scaffold an npm workspaces monorepo `evidenceiq-web` with `apps/web` (Vite React + Tailwind + Framer Motion + React Three Fiber) and `apps/api` (Node/Express + better-sqlite3 + Socket.io). Set up the DB schema for kpis, kpi_readings, events, support_tickets, hypotheses, evidence_edges, narrations, actions, and telemetry_logs. Add a data-loading script that downloads/ingests the UCI Online Retail dataset into `kpi_readings`, and generates a synthetic `events` and `support_tickets` table correlated with two injected anomalies. Then implement the deterministic z-score anomaly detector described in section 8 of this spec."
