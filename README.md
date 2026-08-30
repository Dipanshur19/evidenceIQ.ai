# 🔬 EvidenceIQ.ai — Graph-First KPI Intelligence-to-Action Engine
### Accenture Innovation Challenge 2026 · Round 2 · Problem Track 3 (`BusinessIntelligence.ai`)

> **Executive Summary:** When key business metrics fluctuate unexpectedly, operational teams struggle with diagnostic latency, black-box AI hallucinations, and ungoverned automated decisions. **EvidenceIQ.ai** solves this by separating **deterministic quantitative truth** (statistical $z$-scores + relational evidence graphs) from **natural language synthesis** (grounded, local multi-model LLMs), enforced by a mandatory **human-in-the-loop checkpoint gate**.

---

## 🌟 Key Capabilities & Architectural Pillars

1. **Deterministic Anomaly Core:** Baseline window calculation ($21$ days), rolling standard deviation ($\sigma$), and statistical $z$-scores computed in pure code (never delegated to LLMs).
2. **Heterogeneous Data Reconciliation:** Reconciles the **Rossmann Store Sales** dataset ($648$ daily sales observations across $8$ store clusters, promotional markers, and holiday flags) with unstructured support ticket logs.
3. **3D Business Evidence Graph:** Relational adjacency graph connecting KPI observations, change log event nodes, and support ticket clusters via `PRECEDES` and `CORROBORATES` edges with inspectable score breakdowns.
4. **Dual Persona Narration:** Same ground-truth evidence narrated with dual viewpoints:
   - **Executive Sponsor:** High-level revenue impact, strategic risk classification, and actionable summary.
   - **Operations Analyst:** Detailed $z$-scores, change log IDs, support ticket clusters, and full data lineage.
5. **5-Model Load Balancer & Failover Pipeline:** 100% free and local priority chain:
   - 🥇 `Ollama (qwen2.5:1.5b)` — *Local Primary*
   - 🥈 `Ollama (llama3.2)` — *Local Standby*
   - 🥉 `Hugging Face (Llama-3.1-8B-Instruct)` — *Open Source Cloud Backup*
   - 🏅 `Hugging Face (Qwen2.5-7B-Instruct)` — *Open Source Cloud Backup*
   - 🛡️ `Deterministic Grounded Engine` — *100% Fail-safe Fallback*
6. **Risk-Gated Human Checkpoint:** High/Medium risk recommendations are gated behind **Confirm / Reject / Modify** decisions recorded to persistent Decision Memory.
7. **Runtime Telemetry & Auditability:** Real-time visibility into non-LLM latency, LLM latency, active model, token counts, and $\$0.00$ local operating cost.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js:** `v18+` (Tested on Node `v24.14.1`)
- **Python:** `3.10+` (Tested on Python `3.12.10`)
- **Ollama:** Running locally with `qwen2.5:1.5b` (`ollama run qwen2.5:1.5b`)

### 2. Setup Python Environment & Dependencies
```bash
# In the project root directory:
python -m venv .venv
.\.venv\Scripts\activate       # On Windows (or 'source .venv/bin/activate' on Mac/Linux)
pip install -r requirements.txt
```

### 3. Setup React & Node.js Monorepo
```bash
cd evidenceiq-web/apps/api
npm install

cd ../web
npm install
```

### 4. Launch the Enterprise Web Application
```bash
# Terminal 1: Launch Node.js API Gateway (Port 3001)
cd evidenceiq-web/apps/api
node src/index.js

# Terminal 2: Launch React 18 + Vite Web Frontend (Port 3000)
cd evidenceiq-web/apps/web
npx vite --port 3000
```
Open **[`http://localhost:3000`](http://localhost:3000)** in your browser!

---

## 🧪 Automated Testing Suite

To run the complete automated test suite validating all 11 core engine components:
```bash
pytest -v
```
**Results:** `11 passed (100% pass rate across Briefing Exporter & Causal Pipeline)`

To run the full 14-step end-to-end pipeline verification:
```bash
python tests/verify_full_system.py
```
**Results:** `[SUCCESS] ALL 14 SYSTEM COMPONENTS & WORKFLOWS VERIFIED 100% OPERATIONAL`

---

## 🗺️ System Architecture

```
┌────────────────────────────────┐       ┌────────────────────────────────┐
│   Rossmann Store Sales CSV     │  ───> │  Deterministic Anomaly Engine  │
│   & Support Ticket Log Data    │       │     (z-score, rolling σ)       │
└────────────────────────────────┘       └────────────────────────────────┘
                                                         │
                                                         ▼
┌────────────────────────────────┐       ┌────────────────────────────────┐
│ 3D Business Evidence Graph     │  <─── │ Temporal & Counterfactual      │
│ (PRECEDES / CORROBORATES Edges)│       │ Contribution Decomposition     │
└────────────────────────────────┘       └────────────────────────────────┘
                │
                ▼
┌────────────────────────────────┐       ┌────────────────────────────────┐
│  Persona Context Retrieval     │  ───> │ 5-Model Load Balancer Engine   │
│  (Executive vs Analyst Views)  │       │ (Ollama Local qwen2.5:1.5b)    │
└────────────────────────────────┘       └────────────────────────────────┘
                                                         │
                                                         ▼
┌────────────────────────────────┐       ┌────────────────────────────────┐
│ Runtime Telemetry & Lineage    │  <─── │ Human Checkpoint Gate          │
│ (Socket.io ms latency, $0 cost)│       │ (Confirm / Reject / Modify)    │
└────────────────────────────────┘       └────────────────────────────────┘
```

---

## 📑 Round 2 Submission Deliverables

- **Business Proposal:** Located at [`docs/business-proposal.md`](file:///d:/PLACEMENT2026/Projects/evidenceAI/docs/business-proposal.md) and rendered live at [`http://localhost:3000/proposal`](http://localhost:3000/proposal).
- **Assumptions & Disclosures:** Located at [`docs/assumptions.md`](file:///d:/PLACEMENT2026/Projects/evidenceAI/docs/assumptions.md).
- **Master Technical Specification:** Located at [`EVIDENCEIQ_ACCENTURE_TRACK3_MASTER_SPEC.md`](file:///d:/PLACEMENT2026/Projects/evidenceAI/EVIDENCEIQ_ACCENTURE_TRACK3_MASTER_SPEC.md).
