# 📊 EvidenceIQ.ai — Round 1 Pitch Deck Content & Speaker Script
## Accenture Innovation Challenge · Track 3: BusinessIntelligence.ai
### 10-Slide Competition-Winning Deck Template

---

### Slide 1: Cover & Mission Statement
- **Header:** EvidenceIQ.ai — The Graph-First KPI Intelligence-to-Action Engine
- **Subheader:** Bridging the 4.5-Day Diagnostic Gap: Explaining in Natural Language *What* Changed, *Why*, and *What to Do Next*.
- **Key Callout:** Accenture Innovation Challenge · Problem Track 3: BusinessIntelligence.ai
- **Visual:** Split screen showing a traditional red dashboard alert (-8% Revenue) morphing into a structured, clear action plan with a 3D Evidence Graph.
- **Speaker Notes:** "Good morning judges. Dashboards are great at telling you when revenue drops 8%—and terrible at telling you why or what to do next. Today, that translation takes an analyst 3 to 5 days of manual SQL queries, Slack threads, and guesswork. We built EvidenceIQ.ai to automate this entire diagnostic cycle in under 30 seconds."

---

### Slide 2: The Core Problem — The 3 Gaps in Modern BI
- **Header:** Why Enterprise Dashboards Leave Leaders Stranded
- **3 Pillars:**
  1. **The Diagnostic Latency Gap:** Finding root causes takes 3–5 business days. In that window, revenue leakage compounds unchecked.
  2. **The Multi-Source Semantic Chasm:** The metric drop is in Snowflake/ERP; the root cause is in GitHub commit logs, Jira tickets, or customer support queues. Dashboards cannot connect them.
  3. **The AI Hallucination & Action Trap:** Generic LLMs make up mathematical numbers, hallucinate correlations, and cannot be trusted with mission-critical operational decisions.
- **Speaker Notes:** "The problem isn't a lack of data. It's the fragmentation between structured transactional data and unstructured operational event logs, paired with the danger of letting black-box LLMs guess at financial math."

---

### Slide 3: Our Core Architectural Thesis
- **Header:** "The LLM Is Never the Source of Quantitative Truth"
- **The EvidenceIQ Separation of Concerns:**
  - **Deterministic Math Engine:** Calculates rolling $z$-scores, seasonality indices, and Price-Volume-Mix waterfalls with zero hallucination.
  - **Directed Business Evidence Graph:** Scores causal plausibility across `PRECEDES` and `CORROBORATES` relationships.
  - **Grounded Persona LLM:** Synthesizes clear, role-specific natural language narratives bounded by strict numeric diff guardrails.
  - **Human Checkpoint Gate:** High-risk actions require explicit **Confirm / Reject / Modify** approval.
- **Speaker Notes:** "Our foundational design rule is simple: Math calculates, graphs connect, LLMs narrate, and humans decide. This eliminates hallucinated figures entirely."

---

### Slide 4: Separating Meaningful Change from Normal Noise
- **Header:** Question 1: How We Eliminate False Alarms & Detect Genuine Anomalies
- **4-Stage Mathematical Filter:**
  1. **Rolling Gaussian Baselines ($\mu_{21}, \sigma_{21}$):** 21-day rolling windows with day-of-week seasonality indexing to suppress routine weekly fluctuations.
  2. **Dual Materiality Gate:** An alert requires *both* statistical significance ($|z| \ge 1.96\sigma$) AND financial materiality ($\text{Revenue-at-Stake} \ge \$50,000$).
  3. **Price-Volume-Mix (PVM) Waterfall:** Mathematically isolates whether a drop came from unit prices, customer traffic volume, or product mix shifts.
  4. **Sparse-History Guardrail:** Automatically abstains and flags `SPARSE_HISTORY` when baseline history is $<14$ days, preventing spurious alerts in cold-start regions.
- **Speaker Notes:** "We don't trigger alerts on arbitrary percentage dips. We combine statistical $z$-scores with real revenue-at-stake financial thresholds, ensuring leaders only get notified when an anomaly is both statistically real and economically consequential."

---

### Slide 5: Moving from Correlation to Actionable Root Cause
- **Header:** Question 2: From Observational Noise to Causal Proof
- **The Causal Validation Triad:**
  - **1. Temporal Precedence:** Candidate events must strictly precede the anomaly ($t_{\text{deploy}} < t_{\text{drop}}$ within 72h). Post-anomaly events are discarded.
  - **2. Cross-Modal Corroboration:** Correlates quantitative drops with unstructured Zendesk ticket spikes and error log clusters.
  - **3. Counterfactual Control (DiD):** Difference-in-Differences analysis against peer regions proves the drop is local to the affected system rather than a macro-trend.
- **Standardized Action Schema:**
  $$\text{Driver} \rightarrow \text{Controllable Lever} \rightarrow \text{Action} \rightarrow \text{Expected Impact} \rightarrow \text{Owner} \rightarrow \text{Monitoring Plan}$$
- **Speaker Notes:** "Correlation is not causation. EvidenceIQ.ai uses temporal lag boundaries, ticket corroboration, and Difference-in-Differences against control regions to isolate the genuine cause and map it directly to an operational lever."

---

### Slide 6: What Happens When Data Is Genuinely Ambiguous?
- **Header:** Question 3: Epistemic Uncertainty & The Courage to Abstain
- **Our 4 Ambiguity Protocols:**
  - **1. Graduated Confidence Matrix:** High ($\ge 0.75$), Medium ($0.50 - 0.74$), Low ($< 0.50$), and Explicit Hard Abstention (`STATUS: NEED_MORE_DATA`).
  - **2. Bayesian Rival Hypotheses:** Presents competing explanations with explicit likelihood breakdowns (e.g., 45% Logistics Delay vs 35% Competitor Flash Sale).
  - **3. Active Copilot Clarification Inquiries:** The conversational agent asks human domain experts targeted questions to resolve missing exogenous factors.
  - **4. Low-Regret Diagnostic Canaries:** Recommends non-disruptive investigative probes (canary logging, synthetic checkout tests) rather than premature operational rollbacks.
- **Speaker Notes:** "When signals conflict or evidence is weak, we never allow the AI to guess. The engine transparently abstains, presents competing scenarios, and asks domain experts targeted clarification questions."

---

### Slide 7: Dual Persona-Specific Storytelling
- **Header:** One Source of Truth, Two Distinct Narratives
- **Visual Comparison:**
  - **Left (Executive View):** Plain business language, ₹42.5L revenue impact, High Risk badge, recommended rollback decision with 1-click approval.
  - **Right (Analyst View):** $z = -2.68\sigma$, PVM volume effect $-78.4\%$, Git commit SHA, 14 Zendesk ticket cluster tags, and end-to-end data lineage.
- **Speaker Notes:** "An executive needs to know the financial risk and the decision. An analyst needs the $z$-scores, commit IDs, and data lineage. EvidenceIQ.ai synthesizes the right narrative for each role from the exact same pre-verified evidence package."

---

### Slide 8: Governance, Security & Human-in-the-Loop Gate
- **Header:** Enterprise Safety: Risk-Gated Execution & Audit Trail
- **Key Safety Mechanisms:**
  - **Confirm / Reject / Modify Checkpoint:** Medium and High-risk actions cannot execute automatically; human sign-off is mandatory.
  - **Tamper-Evident SHA-256 Ledger:** Every hypothesis, prompt payload, and analyst decision is cryptographically signed.
  - **Closed-Loop Decision Memory:** Human confirmations and measured 7-day KPI outcomes dynamically re-weight graph edges, training the engine over time.
  - **Row- & Column-Level Security:** Enforces strict role-based data entitlements (sensitive developer commits and margins redacted for unauthorized roles).
- **Speaker Notes:** "We never put automated execution on autopilot. All operational interventions pass through a human checkpoint, creating an immutable audit trail for governance."

---

### Slide 9: Business Value & ROI Metrics
- **Header:** Measurable Operational and Financial Return
- **Table / Highlights:**
  - **99% Reduction in MTTI:** Diagnostic cycle reduced from 4.5 days to under 30 seconds.
  - **$95,000+ Recovered Margin per Incident:** Fast diagnosis cuts active revenue leakage by hours.
  - **+40% Analyst Strategic Capacity:** Eliminates repetitive ad-hoc root cause queries.
  - **$0.00 Local LLM Cost:** Powered by quantized local Ollama models (`qwen2.5:1.5b`), ensuring 100% data privacy and zero cloud token fees.
- **Speaker Notes:** "By shrinking diagnostic time from days to seconds and eliminating cloud LLM token costs, EvidenceIQ.ai delivers immediate, verifiable ROI from day one."

---

### Slide 10: Prototype Verification & Round 2 Readiness
- **Header:** Beyond Concept: Fully Tested & Operational Working Prototype
- **What We Have Already Built:**
  - **Working Codebase:** React 18 + Three.js 3D Evidence Graph web application + Python Streamlit diagnostic suite.
  - **100% Automated Test Coverage:** Validated Gaussian anomaly detection, event extraction, multi-model LLM failover, and governance checkpoints.
  - **Round 2 Readiness:** Ready to connect multi-tenant cloud data warehouses (Snowflake, Databricks) and live enterprise webhook integrations (Jira, GitHub Actions).
- **Call to Action:** EvidenceIQ.ai — Ready for Round 2 Execution.
- **Speaker Notes:** "Unlike other submissions that present slides and mockups, EvidenceIQ.ai is already a fully implemented, mathematically verified working engine. We are eager and completely prepared to scale this prototype in Round 2. Thank you."
