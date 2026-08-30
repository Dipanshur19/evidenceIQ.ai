# 🏛️ EvidenceIQ.ai — Master Architecture & System Blueprint
## Accenture Innovation Challenge 2026 · Round 2 · Problem Track 3 (BusinessIntelligence.ai)
### Comprehensive Architecture, Data Models, Mathematical Formulations, and Component Topologies

---

## 1. 🛡️ The Cardinal Architecture Axiom

> **"The Large Language Model is NEVER the source of quantitative truth."**  
> Every baseline, Gaussian $z$-score, Price-Volume-Mix decomposition, and graph causality score is calculated deterministically in pure code or SQL. The LLM is restricted exclusively to context assembly, intent routing, and natural language narrative synthesis governed by pre-display AST numeric diff checkers.

---

## 2. 🏗️ High-Level System Architecture

```mermaid
flowchart TB
    subgraph Layer1 ["1. Heterogeneous Ingestion Layer"]
        A1[ERP Store Sales CSV / DB\nDaily Revenue Grain]
        A2[System Change Logs\nDeployments, Hotfixes, Configs]
        A3[Support Ticket Streams\nReal-Time Customer Logs]
    end

    subgraph Layer2 ["2. Python & Node.js Intelligence Core"]
        B1[Semantic Conformance Layer\nSchema Normalization & Contract Validation]
        B2[Deterministic Anomaly Detector\n21-Day Rolling Baseline & z-Score (σ)]
        B3[Price-Volume-Mix (PVM) Engine\nVolume vs Rate Waterfall Decomposition]
        B4[3D Business Evidence Graph\nAdjacency Matrix & 6-Factor Causal Scoring]
        B5[Context Slicer & Role Filter\nExecutive vs Analyst Context Packaging]
    end

    subgraph Layer3 ["3. Multi-Model Load Balancer & Safety Guardrails"]
        C1[Ollama Local qwen2.5:1.5b\n$0.00 Token Cost, Zero Data Exfiltration]
        C2[Numeric Diff AST Guardrail\nRegex Validation vs Pre-computed JSON]
        C3[Deterministic Template Fallback\n100% Fail-Safe Parameterized Synthesis]
    end

    subgraph Layer4 ["4. Enterprise Governance & Closed-Loop Learning"]
        D1[Risk-Gated Action Checkpoint\nConfirm / Reject / Modify Modal Gate]
        D2[Cryptographic Decision Memory\nSHA-256 Signed Audit Trail]
        D3[Closed-Loop Weight Recalibration\n7-Day Post-Action Outcome Reinforcement]
    end

    subgraph Layer5 ["5. Presentation & Experience Layer"]
        E1[React 18 + Vite Web UI\nThree.js 3D WebGL Canvas]
        E2[Interactive Anomaly & PVM Charts\nRecharts Waterfall Visualizer]
        E3[Dual-Persona Investigation Console]
        E4[Live Telemetry & Socket Drawer\nLatency, Cost ($0.00) & Lineage]
    end

    Layer1 --> Layer2
    Layer2 --> Layer3
    Layer3 --> Layer4
    Layer4 --> Layer5
```

---

## 3. 📐 Mathematical & Algorithmic Formulations

### A. Dual-Gated Statistical Anomaly Detection
Calculates the statistical deviation against a 21-day rolling window baseline:
$$\mu_{21} = \frac{1}{21}\sum_{i=1}^{21} x_{t-i}, \quad \sigma_{21} = \sqrt{\frac{1}{21}\sum_{i=1}^{21} (x_{t-i} - \mu_{21})^2}$$
$$z_t = \frac{x_t - \mu_{21}}{\sigma_{21}}$$
* **Condition for Anomaly Trigger:** $|z_t| \ge 1.96\sigma \quad \text{AND} \quad \text{Revenue-at-Stake} \ge ₹5,00,000$.

---

### B. Price-Volume-Mix (PVM) Waterfall Decomposition
Mathematically decomposes total revenue change into independent business levers:
$$\Delta \text{Revenue} = \text{Revenue}_{\text{actual}} - \text{Revenue}_{\text{baseline}}$$
$$\text{Volume Effect} = (V_{\text{actual}} - V_{\text{baseline}}) \times P_{\text{baseline}}$$
$$\text{Conversion / Rate Effect} = (\text{CR}_{\text{actual}} - \text{CR}_{\text{baseline}}) \times V_{\text{actual}} \times P_{\text{baseline}}$$
$$\text{Mix Effect} = \Delta \text{Revenue} - (\text{Volume Effect} + \text{Conversion Effect})$$

---

### C. 6-Factor Graph Causal Scoring Formula
Scores every candidate hypothesis $h \in H$ in the Business Evidence Graph from $0.000$ to $1.000$:
$$\text{Score}(h) = w_1 \cdot S_{\text{temporal}}(h) + w_2 \cdot S_{\text{severity}}(h) + w_3 \cdot S_{\text{corroboration}}(h) + w_4 \cdot S_{\text{counterfactual}}(h) + w_5 \cdot S_{\text{prior}}(h) - \text{Penalties}$$
* **$S_{\text{temporal}}$:** Gaussian decay function on time delta: $\exp\left(-\frac{\Delta t^2}{2\tau^2}\right)$ where $\tau = 6\text{ hours}$.
* **$S_{\text{corroboration}}$:** Normalised ticket sentiment and issue frequency count linked to release.
* **$S_{\text{counterfactual}}$:** Difference-in-Differences metric comparing target store against control stores.

---

### D. Cryptographic Decision Hash
Guarantees tamper-evident auditability for every human sign-off:
$$\text{DecisionHash} = \text{SHA256}(\text{ISO8601\_Timestamp} \,\|\, \text{AnomalyID} \,\|\, \text{ActionPayload} \,\|\, \text{AuthorizerID} \,\|\, \text{EvidenceRootHash})$$

---

## 4. 🗄️ Relational Database Schema (9 SQLite Tables)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        RELATIONAL DATABASE SCHEMA (9 TABLES)                     │
├────────────────────────────┬─────────────────────────────┬───────────────────────┤
│ • metrics_daily            │ • change_log_events         │ • support_tickets     │
│ • anomalies                │ • graph_nodes               │ • graph_edges         │
│ • hypotheses               │ • decisions_audit           │ • decision_memory     │
└────────────────────────────┴─────────────────────────────┴───────────────────────┘
```

1. **`metrics_daily`:** Stores daily reconciled metric time series (`date`, `store_id`, `metric_name`, `value`, `baseline_mean`, `baseline_std`).
2. **`change_log_events`:** Ingests deployment logs, feature flags, and promos (`event_id`, `timestamp`, `event_type`, `description`, `author`, `commit_sha`).
3. **`support_tickets`:** Ingests customer support logs (`ticket_id`, `timestamp`, `category`, `sentiment`, `store_id`, `issue_text`).
4. **`anomalies`:** Stores detected breaches (`anomaly_id`, `date`, `store_id`, `metric_name`, `z_score`, `impact_amount`, `status`).
5. **`graph_nodes`:** Graph node registry (`node_id`, `node_type`, `label`, `properties_json`).
6. **`graph_edges`:** Relational edges (`edge_id`, `source_node`, `target_node`, `edge_type` [PRECEDES/CORROBORATES], `weight`).
7. **`hypotheses`:** Ranked root cause candidates (`hypothesis_id`, `anomaly_id`, `event_id`, `causal_score`, `confidence_tier`).
8. **`decisions_audit`:** Immutable audit trail (`decision_id`, `anomaly_id`, `decision_type` [CONFIRM/REJECT/MODIFY], `authorizer`, `sha256_hash`, `timestamp`).
9. **`decision_memory`:** Closed-loop learning store (`memory_id`, `event_type`, `action_taken`, `7d_recovery_delta`, `reinforced_weight`).

---

## 5. 🔄 End-to-End 8-Stage Processing Pipeline

| Stage | Name | Input | Output | Analytical Method |
| :---: | :--- | :--- | :--- | :--- |
| **01** | **Data Conformance** | Raw CSVs / Streams | Normalized SQLite tables | Schema Joins & Time Normalization |
| **02** | **Anomaly Detection** | Time Series Data | Flagged Anomaly Records | Rolling 21d Gaussian $z$-Score |
| **03** | **Driver Decomposition** | Multi-metric data | PVM Waterfall breakdown | Mathematical Calculus (PVM) |
| **04** | **Evidence Graph Scoring** | Events + Tickets | Directed Causal Graph | Relational Adjacency & 6-Factor Formula |
| **05** | **Context Slicing** | Graph & Metrics | Role-Partitioned JSON | Subgraph Extraction & Data Masking |
| **06** | **Grounded Narration** | Filtered JSON | Plain English Text | Local Ollama (`qwen2.5:1.5b`) + AST Check |
| **07** | **Human Checkpoint** | 7-Tuple Action | Confirmed Action Record | Risk Gating Modal (Confirm/Modify/Reject) |
| **08** | **Telemetry & Memory** | Pipeline Run Stats | SHA-256 Hash + Audit Log | Cryptographic Hash & Weight Recalibration |

---

## 6. 🌐 Frontend & User Experience Topology

The presentation layer is built in **React 18 + Vite** with modern clean-tech dark glassmorphism:
* **Interactive 3D WebGL Evidence Graph (`EvidenceGraph3D.jsx`):**
  * Powered by `@react-three/fiber` and `@react-three/drei`.
  * Renders metric and event nodes in 3D coordinate space with dynamic Bézier splines, animated particle energy pulses, and raycasting click inspectors.
* **Dual-Persona Console (`Investigation.jsx`):**
  * Instant toggle between **Executive** (high-level risk, rollback button) and **Analyst** ($z$-scores, commit SHAs, SQL traces).
* **Live Telemetry Drawer:**
  * Real-time WebSocket connection streaming non-LLM latency (45ms), LLM latency (1.7s), tokens, and cost ($0.00).
* **Contracts Page (`Contracts.jsx`):**
  * Interactive schema viewer for metric definitions, calculations, owners, and SLA rules.
