# EvidenceIQ.ai — System Assumptions & Governance Log

Per the Accenture Innovation Challenge Round 2 Problem Statement instruction ("state your assumptions clearly and design a solution that would generalize for broader adoption"), this document logs all design assumptions made across the prototype.

---

## 1. Domain & Data Scope Assumptions
1. **KPI Granularity:** Assumes daily grain per region (`North_India`, `South_India`, `East_India`, `West_India`, `Central_India`) and channel (`Mobile_App`, `Web`, `Store`).
2. **Baseline Window:** Assumes a 21-day rolling baseline window is sufficient to compute statistical expected mean and standard deviation ($\sigma$).
3. **Sparse History Threshold:** Assumes any KPI slice with fewer than 14 days of baseline data is classified as `SPARSE_HISTORY` and requires engine abstention.

## 2. Statistical Anomaly Detection Assumptions
1. **Z-Score Thresholds:** $z \ge 3.0$ indicates `HIGH` severity; $1.96 \le z < 3.0$ indicates `MEDIUM` severity; $z < 1.96$ indicates `NORMAL`.
2. **Ground Truth Anomaly:** The running demonstration assumes mobile release `v5.4` on Aug 12, 2026 caused a ~35% revenue reduction in `North_India / Mobile_App`, corroborated by 3 support tickets.

## 3. LLM Narration & Guardrail Assumptions
1. **Local LLM Availability:** Assumes local Ollama server running `qwen2.5:1.5b` on `http://localhost:11434`.
2. **Deterministic Fallback:** If Ollama is offline or generates mismatched numbers, the system automatically falls back to the rule-based narrative generator (`_fallback_template_narrative`).

## 4. Governance & Human-in-the-Loop Assumptions
1. **Action Risk Gating:** Actions like `rollback_release` and `price_adjustment` are classified as `medium` risk with `reversible_within_minutes` status, requiring mandatory human review before execution.
2. **Fail-Closed Audit Trail:** Assumes all audit log writes must succeed before returning an investigation result.

## 5. Multi-Parameter Data Inspection & AI Copilot Confirmation
1. **Multi-Parameter Inspection:** The engine evaluates 7 data parameters (Revenue Volume, Customer Footfall, Promo Flags, Operating Hours, Ticket Spikes, Release Events, Control Slice DiD).
2. **Data-Grounded Hypotheses:** Hypotheses are formed strictly from verified edges and parameters. Weak evidence or sparse history (<14 days) triggers an explicit `status: "need_more_data"` response.
3. **AI Copilot Confirmation:** The AI Chatbot synthesizes what it understood from data and asks targeted confirmation questions strictly based on its data understanding.

