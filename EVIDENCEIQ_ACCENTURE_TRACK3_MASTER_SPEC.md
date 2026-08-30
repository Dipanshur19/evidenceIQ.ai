# EvidenceIQ.ai — Master Build Specification
## Accenture Innovation Challenge 2026 · Round 2 · Track 3 (BusinessIntelligence.ai)
### Full Professional Website + Prototype + Submission Package Specification

---

## 0. Mission Statement

> Build **EvidenceIQ.ai** — a professional, production-quality web application and marketing site that fully satisfies Accenture Innovation Challenge 2026, Round 2, Problem Track 3 (BusinessIntelligence.ai).
> **Architecture:** React 18 (Vite), TailwindCSS, Framer Motion, Three.js (`@react-three/fiber` + `@react-three/drei`), Recharts, Node.js + Express, Socket.io, `sql.js` (WebAssembly SQLite), and local **Ollama (`qwen2.5:1.5b`)** LLM.
> **Custom Skills Active:** `.agents/skills/` (`html-css-js-proficiency`, `ui-ux-principles`, `responsive-web-design`, `cms-platform-mastery`, `seo-fundamentals`, `effective-communication`, `project-management-organization`, `web-problem-solving`, `time-management-discipline`, `adaptability-continuous-learning`).

---

## 1. Requirement & Deliverable Checklist

### Core Engine Requirements
1. **Deterministic Quantitative Core:** Anomaly detection ($z$-scores / rolling baselines) runs strictly in JS/Node math, never via LLM.
2. **Multi-Source Reconciliation:** Join daily revenue metrics, system change logs, and support ticket logs across different grains/cadences.
3. **Graph-First Root Cause Ranking:** Score hypotheses using a directed Business Evidence Graph (`PRECEDES` / `CORROBORATES` edges).
4. **Persona-Specific Narration:** Same evidence, dual LLM prompts: **Executive** (business risk & action) vs **Analyst** ($z$-scores, event IDs, raw telemetry).
5. **Abstention Under Uncertainty:** Explicit confidence tiers (High/Medium/Low/Abstain) with hard abstention when history < N days or evidence < threshold.
6. **Risk-Gated Action Checkpoint:** Recommend actions structured as: `driver → controllable lever → action → expected impact → owner → confidence → monitoring plan`, gated behind a human **Confirm / Reject / Modify** checkpoint.
7. **Feedback & Learning Loop:** Capture analyst overrides and corrections into Decision Memory.
8. **Runtime Telemetry & Governance:** Live latency breakdown (non-LLM vs LLM), model name, token usage, cost ($0.00 for local LLM), data lineage, and fail-closed audit logging.

### Minimum Prototype Checkboxes
- [x] 3–5 connected KPIs across 2–3 data sources with different grains/refresh cadences
- [x] Lightweight KPI / semantic contract (definitions, calculations, drivers, thresholds, lineage, access rules)
- [x] At least 2 personas receiving different narratives/actions (Executive vs Analyst)
- [x] Multi-factor KPI movement with known/simulated underlying drivers
- [x] Low-confidence scenario where the engine abstains or asks for clarification
- [x] Sparse-history / newly launched KPI scenario (`Central_India`)
- [x] Role-based security / entitlement scenario
- [x] Evidence showing source freshness, method used, contribution %, confidence, lineage
- [x] Clear LLM vs non-LLM processing breakdown visible in UI
- [x] Runtime telemetry: latency, model calls, token usage, estimated cost

### Submission Deliverables
- [x] **Business Proposal Page (`/proposal` & `docs/business-proposal.md`)** — problem framing, solution design, target users, business case & impact, phased roadmap, key risks + mitigations
- [x] **Working Prototype (`/investigate` & `/app`)** — production-quality React + Node.js + Three.js app
- [x] **Public GitHub Repository Structure**
- [x] **Demo Video Script Outline**
- [x] **Assumptions & README Documentation (`docs/assumptions.md`)**

---

## 2. Design System & Page Map

### Pages Included:
1. **`/` (Marketing Landing Page):** Hero section, value proposition, problem/solution breakdown, live demo call-to-action.
2. **`/architecture` (Pipeline & Architecture Page):** Interactive pipeline diagram (Ingestion → Detection → Graph → Narration → Checkpoint → Telemetry).
3. **`/proposal` (Accenture Round 2 Business Proposal):** Complete business proposal with business case, ROI metrics, phased roadmap, and risk mitigations.
4. **`/investigate` (Core Application Engine):** Interactive KPI trend chart (Recharts), 3D Business Evidence Graph (Three.js), persona narrative switcher, Confirm/Reject/Modify checkpoint modal, and Socket.io live telemetry drawer.

---

## 3. Tech Stack Reference

- **Frontend:** React 18 + Vite, TailwindCSS, Framer Motion, `@react-three/fiber`, `@react-three/drei`, Recharts, Socket.io-client.
- **Backend:** Node.js + Express, `sql.js` (WebAssembly SQLite), Socket.io, `simple-statistics`, `dotenv`.
- **Local LLM:** Ollama HTTP API (`http://localhost:11434/api/chat` using `qwen2.5:1.5b`).

---

## 4. Repository Structure

```
evidenceiq-web/
├── apps/
│   ├── web/                        # React + Vite Frontend
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── Landing.jsx     # Marketing Homepage
│   │   │   │   ├── Architecture.jsx# Interactive Pipeline Diagram
│   │   │   │   ├── Proposal.jsx    # Accenture Business Proposal
│   │   │   │   └── Investigate.jsx # Core KPI Engine & 3D Evidence Graph
│   │   │   ├── components/
│   │   │   │   ├── graph/          # Three.js 3D Evidence Graph Component
│   │   │   │   ├── charts/         # Recharts Trend & Anomaly Bands
│   │   │   │   ├── narration/      # Persona Narrative Cards
│   │   │   │   ├── checkpoint/     # Confirm/Reject/Modify Modal
│   │   │   │   └── telemetry/      # Live Telemetry & Lineage Drawer
│   │   │   ├── App.jsx
│   │   │   └── main.jsx
│   │   └── package.json
│   └── api/                        # Node.js + Express Backend
│       ├── src/
│       │   ├── anomaly/detector.js
│       │   ├── narration/llmAdapter.js
│       │   └── index.js
│       └── package.json
├── docs/
│   ├── business-proposal.md        # Source of truth Business Proposal
│   └── assumptions.md              # Stated Assumptions Log
└── package.json
```
