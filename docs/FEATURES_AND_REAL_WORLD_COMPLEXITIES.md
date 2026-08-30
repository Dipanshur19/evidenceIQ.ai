# 🏢 EvidenceIQ.ai — Features & Real-World Complexities Specification
## Accenture Innovation Challenge 2026 · Round 2 · Problem Track 3 (BusinessIntelligence.ai)
### Comprehensive Matrix of Built Features and Enterprise-Grade Real-World Complexities Handled

---

## 📑 Executive Summary

Enterprise business operations rarely operate on clean, synchronized, textbook data. Real-world business intelligence environments are plagued by **heterogeneous refresh rates**, **data silos**, **arithmetic hallucinations in LLMs**, **cold-start metrics**, **confounding variables**, and **strict compliance & governance requirements**.

**EvidenceIQ.ai** was architected from day one to handle these enterprise realities directly, strictly separating deterministic quantitative computing from narrative synthesis and enforcing fail-closed human checkpoints.

---

## SECTION 1: Master Feature Inventory

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          EVIDENCEIQ.AI FEATURE MATRIX                            │
├────────────────────────────┬─────────────────────────────┬───────────────────────┤
│ 1. INGESTION & CONTRACTS   │ 2. DETERMINISTIC ANALYTICS  │ 3. CAUSAL GRAPH       │
│ • Multi-Source Connector   │ • Rolling 21d z-scores      │ • PRECEDES edges      │
│ • Semantic Contracts       │ • Revenue-at-Stake filter   │ • CORROBORATES edges  │
│ • Role-based entitlements  │ • Price-Volume-Mix (PVM)    │ • Counterfactual DiD  │
│ • 9 SQLite relational schem│ • Sparse History handling   │ • 6-factor score      │
├────────────────────────────┼─────────────────────────────┼───────────────────────┤
│ 4. GUARDRAILED NARRATION   │ 5. GOVERNANCE & ACTION      │ 6. USER INTERFACES    │
│ • Dual Persona (Exec/Anal) │ • 7-Tuple Action Schema     │ • React 18 + Three.js │
│ • AST/Regex numeric diff   │ • Confirm/Reject/Modify UI  │ • 3D Evidence Graph   │
│ • Local Ollama (qwen2.5)   │ • SHA-256 Decision Hash     │ • Streamlit Workspace │
│ • Explicit Abstention      │ • 7-day Decision Memory     │ • Real-time Telemetry │
└────────────────────────────┴─────────────────────────────┴───────────────────────┘
```

### 1.1 Ingestion & Semantic Contract Engine
* **Multi-Source Heterogeneous Connectors:** Ingests daily batch sales from ERP (`revenue_daily.csv`), timestamped deployment/configuration events (`change_log.csv`), and real-time customer support logs (`support_tickets.csv`).
* **Semantic Contract Governance:** Every metric possesses an explicit contract detailing its mathematical formula, lineage path, refresh cadence, and role-based access rules ([app/config.py](file:///c:/Users/dipan/Downloads/evidenceIQ.ai-main/evidenceIQ.ai-main/app/config.py)).
* **Multi-Metric Interconnection:** Continuously tracks 4 connected operational metrics: `Regional Revenue`, `Order Volume`, `Checkout Conversion Rate`, and `Support Ticket Rate`.

### 1.2 Deterministic Quantitative & Driver Engine
* **Gaussian Rolling Baseline Modeling:** Evaluates 21-day rolling window means ($\mu$) and standard deviations ($\sigma$), flagging disruptions when $|z| \ge 1.96\sigma$.
* **Revenue-at-Stake Filtering:** Filters out mathematically significant but financially trivial fluctuations ($< ₹5,00,000$).
* **Price-Volume-Mix (PVM) Waterfall Decomposition:** Decomposes top-line revenue collapse into **Volume Effect**, **Conversion Effect**, and **Mix Residual** ([app/driver_analysis.py](file:///c:/Users/dipan/Downloads/evidenceIQ.ai-main/evidenceIQ.ai-main/app/driver_analysis.py)).
* **Difference-in-Differences (DiD) Counterfactual Controls:** Compares the impacted region against unaffected control stores (Store 102, Store 103) to eliminate macro-market trends.

### 1.3 Business Evidence Graph & Causal Ranking
* **Directed Relational Graph Construction:** Dynamically builds graph nodes (Metrics and Events) and directed edges (`PRECEDES` and `CORROBORATES`).
* **6-Factor Causal Scoring Algorithm:** Computes a normalized confidence score ($0.000$ to $1.000$) combining temporal precedence, anomaly severity, ticket corroboration volume, and counterfactual validation ([app/hypothesis_engine.py](file:///c:/Users/dipan/Downloads/evidenceIQ.ai-main/evidenceIQ.ai-main/app/hypothesis_engine.py)).
* **Hypothesis Ranking:** Automatically prioritizes the most probable root cause (e.g. Mobile App Release v5.4 with Score = $0.850$).

### 1.4 Dual-Persona Narration & Hallucination Guardrails
* **Executive Narration 👔:** High-level executive summary, revenue risk (₹5.2M), risk badge `CRITICAL`, and 1-click recommended action with developer details redacted.
* **Analyst Narration 🔬:** Full technical drill-down, exact $z$-scores, commit SHAs (`a3f9c2d`), error spike rates ($12.4\%$), and raw SQL lineage.
* **AST/Regex Numeric Diff Guardrail:** Enforces strict numeric verification between pre-computed JSON and LLM output, preventing arithmetic hallucinations.
* **Local Offline LLM Adapter:** Powered by local Ollama (`qwen2.5:1.5b`), ensuring 100% private, free ($0.00 cost), sub-2-second inference.

### 1.5 Governance, Human Checkpoint & Decision Memory
* **Structured 7-Tuple Action Schema:** Formulates actionable recommendations (`driver → controllable lever → action → expected impact → owner → confidence → monitoring plan`).
* **Mandatory Human Checkpoint:** Enforces human oversight (**Confirm, Reject, or Modify**) before executing business actions.
* **Tamper-Evident SHA-256 Decision Hashes:** Cryptographically signs every confirmed decision (`hash(timestamp + anomaly_id + action + authorizer + payload)`).
* **Closed-Loop Decision Memory:** Tracks 7-day post-action KPI recovery, dynamically updating Bayesian prior edge weights in the graph for future incidents.

### 1.6 Enterprise User Experience & Telemetry
* **React 18 + Three.js 3D Interactive Web UI:** Immersive 3D node-link graph visualization with Recharts anomaly bands, contract drawers, and proposal documentation.
* **Streamlit Rapid Triage Interface:** Standalone Python triage dashboard.
* **Live Telemetry Drawer:** Real-time visibility into non-LLM latency (45ms), LLM latency (1.7s), model name, token usage, and cost ($0.00).

---

## SECTION 2: Real-World Complexities Handled

Here is the breakdown of the **12 enterprise real-world complexities** that EvidenceIQ.ai explicitly anticipates and resolves:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                      REAL-WORLD ENTERPRISE COMPLEXITIES CONSIDERED                       │
├────────────────────────────────┬────────────────────────────────┬────────────────────────┤
│ 1. Heterogeneous Data Cadences │ 2. LLM Math Hallucination Trap │ 3. Cold-Start & Sparse │
│ 4. Confounding Variable Bias   │ 5. Alert Fatigue & Noise       │ 6. Data Privacy & Leak │
│ 7. Role-Based Entitlements     │ 8. Safe Abstention Protocol    │ 9. Cryptographic Audit │
│ 10. Late-Arriving Data Streams │ 11. Closed-Loop Feedback Drift │ 12. Local Compute Cost │
└────────────────────────────────┴────────────────────────────────┴────────────────────────┘
```

---

### Complexity 1: Heterogeneous Refresh Cadences & Time-Grain Mismatches
* **The Real-World Problem:** ERP revenue data is batched once daily at midnight; deployment change logs are continuous event streams; customer support tickets arrive asynchronously throughout the day.
* **How EvidenceIQ.ai Solves It:** Uses a multi-tiered relational schema where events are indexed with millisecond timestamps, while metric baselines use calendar-date partitions. Temporal precedence algorithms calculate offset windows ($\Delta t = t_{\text{anomaly}} - t_{\text{event}}$) dynamically regardless of ingestion frequency.

---

### Complexity 2: LLM Mathematical Hallucination & Arithmetic Instability
* **The Real-World Problem:** LLMs are autoregressive token predictors, not calculators. When asked to calculate percentage changes, standard deviations, or financial impacts, LLMs routinely fabricate numbers.
* **How EvidenceIQ.ai Solves It:** Strict **Deterministic Separation**. All math ($z$-scores, rolling baselines, PVM waterfall decompositions, causal edge weights) is calculated in deterministic Python/Node.js algorithms. The LLM only receives a pre-computed JSON dictionary of verified facts, validated by an AST numeric diff validator.

---

### Complexity 3: The Cold-Start / Sparse-History Problem
* **The Real-World Problem:** When a company launches a new product, opens a new store (e.g. `Store_999`), or expands into a new geographic region (e.g. `Central_India`), historical baseline data does not exist ($< 14$ days). Standard $z$-score detection generates high volumes of false alerts.
* **How EvidenceIQ.ai Solves It:** Dedicated **Sparse-History Logic** in [app/anomaly_detection.py](file:///c:/Users/dipan/Downloads/evidenceIQ.ai-main/evidenceIQ.ai-main/app/anomaly_detection.py). If historical records $< 14$ days, the engine flags `is_sparse_history = True`, sets confidence to `LOW`, suppresses standard Gaussian alerts, and explicitly notifies analysts to allow the baseline to stabilize.

---

### Complexity 4: Confounding Multi-Factor Variables & False Attribution
* **The Real-World Problem:** When a KPI drops, multiple events often occur simultaneously (e.g. a mobile app deployment, a concurrent marketing discount campaign, and scheduled database maintenance). Naive systems attribute the drop to the wrong event.
* **How EvidenceIQ.ai Solves It:** Multi-factor **Difference-in-Differences (DiD)** counterfactual analysis and Price-Volume-Mix decomposition. The engine evaluates control stores unaffected by the mobile update and cross-correlates support ticket sentiment, isolating that Mobile App v5.4 had a 0.850 causal score while marketing promos had a negligible 0.120 score.

---

### Complexity 5: Alert Fatigue & Materiality Thresholds
* **The Real-World Problem:** Traditional monitoring tools fire hundreds of alerts daily for minor statistical blips that have zero financial impact, causing operators to ignore critical alerts.
* **How EvidenceIQ.ai Solves It:** Dual-gated filtering:
  1. Statistical significance gate: $|z| \ge 1.96\sigma$.
  2. Financial materiality gate: $\text{Revenue-at-Stake} \ge ₹5,00,000$.
  Trivial variations are logged quietly without alerting operators.

---

### Complexity 6: Enterprise Data Privacy & Zero Cloud Leakage
* **The Real-World Problem:** Regulated industries (Banking, Healthcare, Retail) cannot stream proprietary sales numbers, internal system logs, and customer PII to third-party cloud LLM APIs (OpenAI, Anthropic).
* **How EvidenceIQ.ai Solves It:** Integrated with local **Ollama (`qwen2.5:1.5b`)**. 100% of data processing, graph construction, and natural language narration executes entirely on-premise without external network calls, zero API subscription costs ($0.00), and zero data exposure.

---

### Complexity 7: Role-Based Security & Sensitive Technical Data Masking
* **The Real-World Problem:** Executives need high-level business risk insights and should not be exposed to internal git commit hashes or database connection strings. Conversely, developers need exact technical telemetry.
* **How EvidenceIQ.ai Solves It:** Role-based Semantic Contract entitlements ([app/config.py](file:///c:/Users/dipan/Downloads/evidenceIQ.ai-main/evidenceIQ.ai-main/app/config.py)). When generating Executive reports, technical commit authors, internal server IPs, and raw SQL queries are automatically redacted, while Analyst views receive full debug traces.

---

### Complexity 8: Explicit Abstention Under Uncertainty
* **The Real-World Problem:** Most AI agents will generate a confident-sounding explanation even when the underlying data is contradictory, noisy, or completely missing.
* **How EvidenceIQ.ai Solves It:** 4-tier confidence rating system (`HIGH`, `MEDIUM`, `LOW`, `ABSTAIN`). When queried on normal baseline dates (e.g. `2026-06-02`) or when the top evidence score is $<0.450$, the engine returns status `"insufficient_data"` and explicitly states it does not have enough evidence to identify a root cause.

---

### Complexity 9: Regulatory Compliance & Tamper-Evident Audit Trails
* **The Real-World Problem:** In enterprise audits, organizations must prove who authorized an operational change, what evidence was presented at that exact second, and that logs have not been manipulated retroactively.
* **How EvidenceIQ.ai Solves It:** Every human decision generates a cryptographic **SHA-256 decision hash**:
  $$\text{Hash} = \text{SHA256}(\text{Timestamp} + \text{AnomalyID} + \text{Action} + \text{Authorizer} + \text{EvidencePayload})$$
  Logged into a fail-closed, append-only SQLite audit table with verification functions in [app/briefing_exporter.py](file:///c:/Users/dipan/Downloads/evidenceIQ.ai-main/evidenceIQ.ai-main/app/briefing_exporter.py).

---

### Complexity 10: Late-Arriving & Out-of-Order Data Ingestion
* **The Real-World Problem:** Customer support tickets filed at 2:00 PM might not sync into the central warehouse until 5:00 PM.
* **How EvidenceIQ.ai Solves It:** Graph edge recalculation. Ingestion timestamp is decoupled from event occurrence timestamp ($t_{\text{event}}$). When backfilled tickets arrive, the hypothesis engine dynamically re-weights the `CORROBORATES` edges without requiring a full database rebuild.

---

### Complexity 11: Feedback Drift & Closed-Loop Learning
* **The Real-World Problem:** Static root-cause engines do not learn from human decisions or post-incident realities, repeating false diagnoses.
* **How EvidenceIQ.ai Solves It:** **Decision Memory Engine**. Tracks human feedback (Confirmations vs Overrides) and measures 7-day post-action KPI recovery. If rolling back a deployment restored revenue, the Bayesian prior weight for that event type is boosted; if the action failed, its weight is penalised.

---

### Complexity 12: Compute Constraints & Operational Latency
* **The Real-World Problem:** Enterprise operators need answers during active outages in seconds, not minutes of cloud queue delays.
* **How EvidenceIQ.ai Solves It:** Highly optimized hybrid architecture:
  * Non-LLM quantitative math & graph traversal: **~45 milliseconds**.
  * Local Ollama narrative generation: **~1.7 seconds**.
  * Total end-to-end incident turnaround: **< 2.0 seconds**.

---

## SECTION 3: Summary Verification Matrix

| Complexity Area | How It Is Addressed | Verification Test in Repository |
| :--- | :--- | :--- |
| **Math Hallucinations** | Deterministic separation & AST guardrail | `test_fail_closed_validation` |
| **Sparse History** | Suppression of false alerts on <14d data | `test_sparse_history_handling` |
| **False Attribution** | Counterfactual DiD & PVM waterfall | `test_hypothesis_engine_surfaces_top_cause` |
| **Uncertainty & Abstention** | Hard abstention on score < 0.450 | `test_insufficient_data_handled_gracefully` |
| **Role Entitlements** | Redaction of commit SHAs for Execs | `test_persona_and_telemetry_support` |
| **Auditability** | SHA-256 cryptographic verification | `test_sha256_decision_hash_and_verification` |
| **Multi-Source Data** | Unified relational schema & contracts | `test_events_extracted_from_change_log` |
| **End-to-End Latency** | Sub-2s pipeline with local Ollama | `test_full_orchestrator_pipeline` |
