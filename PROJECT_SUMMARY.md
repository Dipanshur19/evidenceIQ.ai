# EvidenceIQ.ai — Project Summary & Execution Report
### Accenture Innovation Challenge 2026 | Round 2 — Problem Track 3: BusinessIntelligence.ai

---

## 1. 📌 Executive Context & Challenge Objective

This project implements **EvidenceIQ.ai**, a graph-first evidence engine designed for **Accenture Innovation Challenge Round 2 — Track 3 (BusinessIntelligence.ai)**.

The core goal of Track 3 is to build a **KPI Intelligence-to-Action Engine** that detects significant KPI anomalies, isolates explanatory drivers across heterogeneous data sources, scores hypotheses using a Business Evidence Graph, generates persona-specific explanations via LLMs, and enforces a mandatory human checkpoint before taking business actions.

---

## 2. 🎯 What You Had To Do (Challenge Requirements)

According to the official Accenture Round 2 Problem Statement document, the prototype had to deliver:

1. **Deterministic Quantitative Foundation:** Detect and prioritize material KPI movements using statistical baselines (never relying on LLMs for math).
2. **Multi-Source Data Reconciliation:** Connect metrics across fragmented systems (daily revenue CSV, change log events, support ticket logs).
3. **Graph-First Root Cause Ranking:** Build a relational-adjacency Business Evidence Graph (PRECEDES and CORROBORATES edges) to rank hypotheses.
4. **Persona-Specific Grounded Narration:** Generate LLM explanations with strict numeric guardrails, tailored for **Executive** vs. **Analyst** roles.
5. **Abstention Under Uncertainty:** Express explicit confidence levels and handle low-confidence or sparse-history scenarios without hallucinating.
6. **Risk-Gated Action Recommendations:** Recommend actions tied to business risk levels, enforcing a mandatory human checkpoint (**Confirm / Reject / Modify**).
7. **Runtime Telemetry & Auditability:** Track latency, model calls, token estimates, cost, data lineage, and fail-closed audit logs.

---

## 3. ⚡ What Has Been Done (Implementation Highlights)

### A. Environment & Local LLM Integration
- Initialized and deployed the [`Dipanshur19/evidenceIQ.ai`](https://github.com/Dipanshur19/evidenceIQ.ai) repository.
- Created isolated virtual environment (`.venv`) and installed all Python dependencies.
- Configured local **Ollama** integration (`qwen2.5:1.5b`) to enable **100% free, offline execution** without cloud API keys or rate limits.

### B. Track 3 Feature Extensions
- **4 Connected KPIs (`app/config.py`):** Extended metric registry to include `Regional Revenue`, `Order Volume`, `Checkout Conversion Rate`, and `Support Ticket Rate`.
- **Semantic Contracts (`app/config.py`):** Defined explicit semantic contract metadata covering metric formulas, refresh cadences, lineage paths, and role-based access rules.
- **Multi-Persona Narration (`app/llm_narration.py`):** Implemented dual narrative generation for **Executive** (high-level risk & business action) vs **Analyst** (deep-dive $z$-scores, event IDs, raw telemetry) roles.
- **Sparse History Handling (`app/anomaly_detection.py`):** Added baseline history checks to handle newly launched/sparse regions (e.g. `Central_India`) with clean abstention metadata.
- **Telemetry & Lineage Drawer:** Embedded an interactive telemetry panel showing execution latency (non-LLM vs LLM), model name, token usage, cost ($0.00), and end-to-end data lineage.

### C. 10 Custom Web & System Agent Skills (`.agents/skills/`)
Installed 10 custom skills in `.agents/skills/` based on industry best practices:
1. `html-css-js-proficiency`
2. `ui-ux-principles`
3. `responsive-web-design`
4. `cms-platform-mastery`
5. `seo-fundamentals`
6. `effective-communication`
7. `project-management-organization`
8. `web-problem-solving`
9. `time-management-discipline`
10. `adaptability-continuous-learning`

---

## 4. 🔍 Complete Verification Status (100% Operational)

### Automated Test Suite (`pytest`)
All **11 out of 11 tests passed** cleanly:
- `test_sha256_decision_hash_and_verification`: PASS
- `test_briefing_payload_assembly`: PASS
- `test_markdown_and_pdf_generation`: PASS
- `test_fail_closed_validation`: PASS
- `test_anomaly_detection_finds_disruption`: PASS
- `test_events_extracted_from_change_log`: PASS
- `test_hypothesis_engine_surfaces_top_cause`: PASS
- `test_full_orchestrator_pipeline`: PASS
- `test_insufficient_data_handled_gracefully`: PASS
- `test_persona_and_telemetry_support`: PASS
- `test_sparse_history_handling`: PASS

### System Component Verification (`tests/verify_full_system.py`)
- Database Schema Init: **PASS** (9 SQLite tables active)
- Data Ingestion: **PASS** (972 revenue rows, 3 change log events, 8 support tickets)
- Event Graph Extraction: **PASS** (3 Event nodes extracted)
- Anomaly Detection: **PASS** (Detected Mobile Checkout v5.4 disruption, $z = -2.005$)
- Sparse History Abstention: **PASS**
- Multi-Slice Scan: **PASS** (Scanned 12 slices, identified 5 anomalies)
- Evidence Scoring: **PASS** (Ranked v5.4 release as #1 cause with Score = 0.80)
- Ollama LLM Narration (Analyst & Executive): **PASS**
- Action Recommendation & Gating: **PASS**
- Human Checkpoint (Confirm/Reject/Modify): **PASS**
- Record Outcome Action: **PASS**
- Audit Trail: **PASS**
- End-to-End Orchestrator: **PASS** (Total Latency: 5.8s, Model: `qwen2.5:1.5b`)

---

## 🚀 How to Launch and Demo

```bash
# Terminal 1: Launch Node.js Express API Gateway (Port 3001)
cd evidenceiq-web/apps/api
node src/index.js

# Terminal 2: Launch React 18 + Vite Web Application (Port 3000)
cd evidenceiq-web/apps/web
npx vite --port 3000
```

* **React Enterprise Web UI:** [`http://localhost:3000`](http://localhost:3000)
* **Node API Gateway:** [`http://localhost:3001`](http://localhost:3001)
* **FastAPI Backend (Optional):** [`http://localhost:8000/docs`](http://localhost:8000/docs)
