# 🔬 EvidenceIQ.ai

### A Graph-First KPI Intelligence-to-Action Engine
**Accenture Innovation Challenge 2026 · Round 2 · Problem Track 3 (BusinessIntelligence.ai)**

> When enterprise KPIs fluctuate unexpectedly, operational teams face hours of diagnostic triage across fragmented data silos. **EvidenceIQ.ai** solves this by strictly separating **deterministic quantitative computation** (statistical baselines, Price-Volume-Mix decomposition, causal graph scoring) from **guardrailed natural language synthesis** (locally-hosted LLM with numeric verification), enforced by a mandatory **human-in-the-loop action checkpoint** with cryptographic audit trails.

---

## 🎯 What Makes This Different

| Traditional BI / Naive LLM Approach | EvidenceIQ.ai Approach |
| :--- | :--- |
| LLMs perform arithmetic → hallucinated percentages and fabricated root causes | All math runs in deterministic code (0ms LLM). LLM only synthesizes verified narratives |
| Single dashboard for all stakeholders → information overload or oversimplification | **Dual-persona** system: Executive gets financial risk summary; Analyst gets z-scores and commit SHAs |
| Autonomous AI agents trigger actions without review → catastrophic operational risk | **Mandatory human checkpoint** (Confirm/Reject/Modify) with SHA-256 tamper-evident audit trail |
| Cloud LLM APIs → $0.15–$2.50/query, data privacy exposure | **100% local** Ollama (`qwen2.5:1.5b`) → $0.00/query, zero data leakage |

---

## ⚡ Core Capabilities

1. **Deterministic Anomaly Detection** — Rolling 21-day Gaussian baseline with dual-gated filtering (statistical significance: $|z| \ge 1.96\sigma$ AND financial materiality: Revenue-at-Stake ≥ ₹5,00,000)
2. **Price-Volume-Mix (PVM) Waterfall** — Mathematically decomposes multi-factor KPI movements into Volume Effect (-48.20%), Conversion Effect (-19.76%), and Mix residual
3. **Relational Business Evidence Graph** — Directed graph connecting metric anomalies to system events via `PRECEDES` (temporal causality) and `CORROBORATES` (ticket validation) edges with 6-factor causal scoring ($0.000$–$1.000$)
4. **Dual-Persona Narration with Numeric Guardrails** — Executive (plain English, financial risk, 1-click action) vs. Analyst (z-scores, commit SHAs, SQL lineage) views, verified by AST numeric diff validator
5. **Safe Abstention Under Uncertainty** — 4-tier confidence system (HIGH/MEDIUM/LOW/ABSTAIN). Hard abstention when evidence < 0.450 or baseline history < 14 days
6. **Risk-Gated Human Checkpoint** — 7-tuple action schema (`Driver → Lever → Action → Impact → Owner → Confidence → Monitor`) gated behind Confirm/Reject/Modify modal
7. **Closed-Loop Decision Memory** — Tracks 7-day post-action KPI recovery to dynamically reinforce causal graph edge weights
8. **Tamper-Evident Audit Trail** — SHA-256 cryptographic decision signatures in fail-closed append-only ledger

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        EvidenceIQ.ai Processing Pipeline                            │
│                                                                                     │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │
│  │ 1. Ingest    │──▶│ 2. Detect    │──▶│ 3. Decompose │──▶│ 4. Graph     │         │
│  │ Multi-Source  │   │ Anomaly      │   │ PVM Waterfall│   │ Evidence     │         │
│  │ ERP+Logs+Tix │   │ z ≥ 1.96σ    │   │ Vol+Conv+Mix │   │ Score 0–1.0  │         │
│  └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘         │
│                                                                      │              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐              ▼              │
│  │ 8. Audit     │◀──│ 7. Memory    │◀──│ 6. Checkpoint│   ┌──────────────┐         │
│  │ SHA-256 Hash │   │ 7-Day Learn  │   │ Confirm/Rej  │◀──│ 5. Narrate   │         │
│  │ Fail-Closed  │   │ Edge Update  │   │ /Modify Gate │   │ Exec+Analyst │         │
│  └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘         │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**Data Sources Reconciled:**
- 📊 `data/revenue_daily.csv` — Daily ERP store sales (batch grain)
- ⚙️ `data/change_log.csv` — System deployment and configuration events (event stream)
- 🎫 `data/support_tickets.csv` — Customer support ticket logs (real-time stream)

**Tech Stack:**
- **Backend:** Python 3.12 (FastAPI, Pandas, NumPy) + Node.js 24 (Express, Socket.io, simple-statistics)
- **Frontend:** React 18, Vite, Three.js (`@react-three/fiber`), Recharts, Framer Motion
- **Database:** SQLite (9 relational tables) / PostgreSQL-ready
- **LLM:** Local Ollama (`qwen2.5:1.5b`) — $0.00 cost, zero data leakage
- **Testing:** pytest (11/11 tests passing)

---

## 🚀 Quickstart — Run the Prototype

### Prerequisites
- **Node.js** v18+ (tested on v24.14.1)
- **Python** 3.10+ (tested on 3.12.10)
- **Ollama** running locally with `qwen2.5:1.5b` (`ollama run qwen2.5:1.5b`)

### 1. Set Up Python Environment
```bash
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Install Node.js Dependencies
```bash
cd evidenceiq-web/apps/api && npm install
cd ../web && npm install
```

### 3. Launch the Application

**Terminal 1 — Node.js API Gateway (Port 3001):**
```bash
cd evidenceiq-web/apps/api
node src/index.js
```

**Terminal 2 — React 18 + Three.js Web UI (Port 3000):**
```bash
cd evidenceiq-web/apps/web
npx vite --port 3000
```

**Open in browser:** [http://localhost:3000](http://localhost:3000)

---

## 🧪 Automated Test Suite

Run the full deterministic pipeline test suite:
```bash
pytest -v
```

**Result: 11/11 tests passed (100% pass rate)**

| Test | What It Verifies |
| :--- | :--- |
| `test_anomaly_detection_finds_disruption` | Detects Store 101 revenue crash (z = -2.005) |
| `test_events_extracted_from_change_log` | Extracts deployment events from system logs |
| `test_hypothesis_engine_surfaces_top_cause` | Ranks Mobile v5.4 as #1 root cause (Score = 0.850) |
| `test_full_orchestrator_pipeline` | End-to-end pipeline from detection to action |
| `test_insufficient_data_handled_gracefully` | Abstention on insufficient/conflicting evidence |
| `test_sparse_history_handling` | Suppresses alerts for newly launched regions (<14 days) |
| `test_persona_and_telemetry_support` | Validates Executive vs Analyst dual-persona outputs |
| `test_sha256_decision_hash_and_verification` | Verifies tamper-evident cryptographic audit trail |
| `test_briefing_payload_assembly` | Validates multi-source evidence packaging |
| `test_markdown_and_pdf_generation` | Tests exportable executive briefing generation |
| `test_fail_closed_validation` | Enforces fail-closed behavior on corrupted inputs |

Full 14-step end-to-end system verification:
```bash
python tests/verify_full_system.py
```

---

## 🗺️ Repository Structure

```
evidenceIQ.ai/
├── app/                              # Python Intelligence Engine
│   ├── anomaly_detection.py          # 21-day rolling Gaussian z-score detector
│   ├── driver_analysis.py           # Price-Volume-Mix (PVM) waterfall decomposition
│   ├── hypothesis_engine.py         # 6-factor causal graph scoring
│   ├── llm_narration.py             # Dual-persona LLM synthesis + numeric guardrails
│   ├── orchestrator.py              # End-to-end pipeline orchestrator + telemetry
│   ├── briefing_exporter.py         # SHA-256 audit trail + briefing export
│   ├── config.py                    # Metric registry + semantic contracts
│   ├── human_checkpoint.py          # Confirm/Reject/Modify action gate
│   ├── decision_memory.py           # 7-day outcome tracking + edge weight learning
│   └── ...                          # (db, schemas, graph_builder, event_extraction)
│
├── evidenceiq-web/                   # Enterprise Web Application
│   ├── apps/
│   │   ├── api/                     # Node.js Express API Gateway (Port 3001)
│   │   │   └── src/
│   │   │       ├── index.js         # Server, Socket.io, REST endpoints
│   │   │       ├── anomaly/detector.js
│   │   │       └── narration/llmAdapter.js
│   │   └── web/                     # React 18 + Vite Frontend (Port 3000)
│   │       └── src/
│   │           ├── pages/
│   │           │   ├── Home.jsx          # Marketing landing page
│   │           │   ├── Investigation.jsx # Core KPI engine + 3D evidence graph
│   │           │   ├── Architecture.jsx  # Interactive pipeline diagram
│   │           │   ├── Proposal.jsx      # Business proposal (web view)
│   │           │   ├── Contracts.jsx     # Semantic contract browser
│   │           │   ├── Dashboard.jsx     # KPI monitoring dashboard
│   │           │   ├── AnomalyScanner.jsx
│   │           │   ├── EvidenceGraphPage.jsx
│   │           │   └── DecisionMemoryPage.jsx
│   │           └── components/
│   │               ├── graph/EvidenceGraph3D.jsx  # Three.js 3D evidence graph
│   │               └── three/Hero3DScene.jsx      # WebGL hero animation
│   └── package.json
│
├── data/                             # Sample Illustrative Data
│   ├── revenue_daily.csv            # Daily ERP store sales (972 rows)
│   ├── change_log.csv               # System deployment events (3 events)
│   ├── support_tickets.csv          # Customer support tickets (8 tickets)
│   └── rossmann_store_sales.csv     # Extended Rossmann-modeled dataset
│
├── tests/                            # Automated Test Suite
│   ├── test_pipeline.py             # 11 core pipeline tests
│   ├── test_briefing_exporter.py    # Briefing export tests
│   └── verify_full_system.py        # 14-step end-to-end verification
│
├── docs/                             # Documentation Package
│   ├── business-proposal.md         # Detailed business proposal
│   ├── master-track3-design-doc.md  # Technical design document
│   ├── assumptions.md               # Stated assumptions & constraints
│   ├── FEATURES_AND_REAL_WORLD_COMPLEXITIES.md
│   ├── MASTER_ARCHITECTURE_AND_SYSTEM_BLUEPRINT.md
│   ├── ROUND_2_SUBMISSION_CHECKLIST.md
│   └── ROUND_2_DEMO_VIDEO_SCRIPT.md
│
├── main.py                           # Python Streamlit entry point
├── requirements.txt                  # Python dependencies
└── README.md                         # This file
```

---

## 📋 Round 2 Submission Deliverables

| Deliverable | Location | Status |
| :--- | :--- | :---: |
| **Detailed Business Proposal** | [`docs/business-proposal.md`](docs/business-proposal.md) and live at `/proposal` in web UI | ✅ Complete |
| **Working Prototype** | React 18 + Three.js Web App (`localhost:3000`) + Python Streamlit | ✅ Operational |
| **Public GitHub Repository** | [github.com/Dipanshur19/evidenceIQ.ai](https://github.com/Dipanshur19/evidenceIQ.ai) | ✅ Published |
| **README Documentation** | This file | ✅ Complete |
| **Technical Design Document** | [`docs/master-track3-design-doc.md`](docs/master-track3-design-doc.md) | ✅ Complete |
| **Assumptions Log** | [`docs/assumptions.md`](docs/assumptions.md) | ✅ Complete |

---

## 📊 Prototype Demonstration Scenario

The prototype ships with a pre-loaded illustrative scenario demonstrating all 10 minimum prototype expectations:

**Scenario: Store 101 Revenue Disruption (August 12–15, 2026)**

1. **Anomaly Detected:** Regional Revenue for `North_India / Mobile_App` drops -67.96% ($z = -2.005$, ₹7,155L revenue at stake)
2. **PVM Decomposition:** Volume Effect (-48.20%) + Conversion Effect (-19.76%) + Mix residual
3. **Evidence Graph Constructed:** `Mobile App v5.4 Deploy` (Aug 12, 14:30 UTC) connected via `PRECEDES` edge ($\Delta t = 2.1$ hours). `8 support tickets` (POS barcode failure) connected via `CORROBORATES` edge
4. **Root Cause Ranked:** Mobile App Release v5.4 → Evidence Score = **0.850 (HIGH)**, Marketing Promo → 0.120 (dismissed)
5. **Executive Briefing Generated:** "Revenue dropped 67.96%. Cause: Mobile v5.4 checkout bug. Action: Roll back to v5.3.2"
6. **Analyst Briefing Generated:** "$z = -2.005$, commit `a3f9c2d`, 8 POS failure tickets, DiD control stores unaffected"
7. **Human Checkpoint Presented:** `[Confirm Rollback]` / `[Modify Parameters]` / `[Reject]`
8. **Abstention Demonstrated:** Querying `Central_India / Store_999` (3 days history) → `is_sparse_history = True`, engine abstains
9. **Audit Sealed:** Decision cryptographically signed with SHA-256 hash
10. **Telemetry Displayed:** Non-LLM: 45ms, LLM: 1.72s, Tokens: 485, Cost: $0.00

---

## 📄 License

This project was developed for the Accenture Innovation Challenge 2026, Round 2.
