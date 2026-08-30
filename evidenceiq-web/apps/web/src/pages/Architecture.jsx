import React from "react";
import { motion } from "framer-motion";
import { Layers, ShieldCheck, Cpu, Code2, Database, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Network, Lock, Activity, Server } from "lucide-react";

export default function Architecture() {
  const steps = [
    {
      title: "1. Data Ingestion & Reconciliation",
      desc: "Joins daily revenue metrics, system change log events, and unstructured support tickets on timestamp and region keys.",
      method: "SQL & Business Rules",
      category: "Deterministic",
      icon: Database,
      color: "#8B5CF6",
    },
    {
      title: "2. Deterministic Anomaly Detection",
      desc: "Computes 21-day rolling baselines, mean, standard deviation (σ), and z-score metrics without using LLMs.",
      method: "Rolling Statistics (z-score)",
      category: "Statistics",
      icon: Activity,
      color: "#EC4899",
    },
    {
      title: "3. Multi-Factor Driver Decomposition",
      desc: "Decomposes KPI movements into Volume vs Rate/Conversion components using Price-Volume-Mix (PVM) waterfall logic.",
      method: "PVM Decomposition Math",
      category: "Deterministic",
      icon: Layers,
      color: "#06B6D4",
    },
    {
      title: "4. Business Evidence Graph Construction",
      desc: "Builds a directed adjacency graph connecting KPI nodes to Event and Support Ticket clusters via PRECEDES and CORROBORATES edges.",
      method: "6-Factor Graph Adjacency Scoring",
      category: "Graph / Causal",
      icon: Network,
      color: "#10B981",
    },
    {
      title: "5. Persona Context Retrieval Engine",
      desc: "Assembles structured JSON context packages tailored for Executive vs Analyst persona viewpoints.",
      method: "Subgraph Traversal & Filtering",
      category: "Retrieval",
      icon: Cpu,
      color: "#F59E0B",
    },
    {
      title: "6. Grounded LLM Narration (Ollama Local)",
      desc: "Generates plain-English narrative bounded by strict regex AST numeric diff guardrails.",
      method: "Local Ollama (qwen2.5:1.5b)",
      category: "LLM (Grounded)",
      icon: Sparkles,
      color: "#8B5CF6",
    },
    {
      title: "7. Human Checkpoint & Risk Gating",
      desc: "Enforces a mandatory Confirm / Reject / Modify gate before executing medium-to-high risk recommendations.",
      method: "Risk Matrix & Decision Gate",
      category: "Governance",
      icon: ShieldCheck,
      color: "#10B981",
    },
    {
      title: "8. Live Telemetry & Fail-Closed Audit Trail",
      desc: "Streams latency (ms), model token count, $0.00 cost, and signs each decision with a cryptographic SHA-256 hash.",
      method: "SHA-256 Hash & SQLite Log",
      category: "Cryptographic Audit",
      icon: Lock,
      color: "#EC4899",
    },
  ];

  const methodAttribution = [
    {
      component: "Anomaly Detection",
      techMethod: "21-Day Rolling Baseline z-Score (z = (x - μ) / σ)",
      category: "Statistics",
      rationale: "Guarantees deterministic, reproducible thresholding without LLM hallucination risk.",
    },
    {
      component: "Materiality Evaluation",
      techMethod: "Revenue-at-Stake Dollar Floor Filter (≥ ₹1L)",
      category: "SQL / Business Rules",
      rationale: "Filters out statistically significant but financially trivial micro-anomalies.",
    },
    {
      component: "Driver Decomposition",
      techMethod: "Price-Volume-Mix (PVM) Waterfall Math",
      category: "Deterministic Logic",
      rationale: "Exact mathematical attribution of multi-factor metric shifts; required for finance teams.",
    },
    {
      component: "Event Graph Extraction",
      techMethod: "Regex & Relational Adjacency Indexing",
      category: "SQL / Business Rules",
      rationale: "Deterministic extraction of deployment events from system change logs into graph store.",
    },
    {
      component: "Hypothesis Ranking",
      techMethod: "6-Factor Weighted Evidence Formula (0.00 - 1.00)",
      category: "Deterministic Logic",
      rationale: "Combines correlation, temporal alignment, corroboration, and quality penalties mathematically.",
    },
    {
      component: "Context Retrieval",
      techMethod: "Subgraph Traversal & Dimension Slicing",
      category: "Retrieval",
      rationale: "Assembles structured evidence packages from connected nodes before invoking narrative generation.",
    },
    {
      component: "Narrative Generation",
      techMethod: "Local Ollama (qwen2.5:1.5b) Chat API",
      category: "LLM (Grounded)",
      rationale: "Synthesizes natural language narratives for Executive and Analyst personas using pre-computed JSON.",
    },
    {
      component: "Numeric Guardrail",
      techMethod: "Regex AST & Numeric Tolerance Diff Checker",
      category: "Deterministic Logic",
      rationale: "Validates every number in LLM output against source JSON; auto-falls back to template on mismatch.",
    },
    {
      component: "Action Recommendation",
      techMethod: "Risk Matrix & Decision Rights Lookup Table",
      category: "SQL / Business Rules",
      rationale: "Ensures actions match recipient's control rights and safety levels without ungrounded LLM advice.",
    },
    {
      component: "Decision Memory & Learning",
      techMethod: "SHA-256 Hashing & Dynamic Edge Weight Update",
      category: "Deterministic Logic",
      rationale: "Provides tamper-evident audit trail and updates graph edge weights based on past human confirmation/rejection.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ maxWidth: "1340px", margin: "0 auto", padding: "16px 24px 64px" }}
    >
      {/* Header Banner */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "inline-flex", marginBottom: "10px" }}>
          <span className="section-tag">
            <Layers size={13} color="#A78BFA" />
            Technical Architecture & Method Attribution
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(1.8rem, 2.8vw, 2.4rem)",
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "-0.03em",
                fontFamily: "var(--font-heading)",
              }}
            >
              System Architecture & <span className="text-gradient-purple">Intelligence Pipeline</span>
            </h1>
            <p style={{ margin: "6px 0 0 0", color: "#A1A1AA", fontSize: "0.925rem" }}>
              How EvidenceIQ.ai combines deterministic statistical engines, a directed business evidence graph, and local LLM narrative generation.
            </p>
          </div>
        </div>
      </div>

      {/* 8-Stage Pipeline Section */}
      <div className="bento-card" style={{ padding: "30px", marginBottom: "28px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF" }}>
            1. End-to-End 8-Stage Intelligence Pipeline
          </h2>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#A1A1AA" }}>
            Every request flows through strict quantitative validation before any text is generated.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "12px",
                  padding: "20px",
                  transition: "all 160ms ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: `${s.color}15`,
                      border: `1px solid ${s.color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={18} color={s.color} />
                  </div>
                  <span className="badge badge--violet" style={{ fontSize: "0.65rem" }}>
                    {s.category}
                  </span>
                </div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF" }}>
                  {s.title}
                </h3>
                <p style={{ margin: "0 0 12px 0", fontSize: "0.82rem", color: "#71717A", lineHeight: 1.6 }}>
                  {s.desc}
                </p>
                <div style={{ fontSize: "0.72rem", color: "#A78BFA", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                  Method: {s.method}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytical Method Attribution Table */}
      <div className="bento-card" style={{ padding: "30px", marginBottom: "28px" }}>
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF" }}>
            2. Complete Analytical Method Attribution Matrix
          </h2>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#A1A1AA" }}>
            Detailed breakdown of algorithms, mathematical formulations, and engineering rationale per component.
          </p>
        </div>

        <div style={{ overflowX: "auto", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "10px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.825rem" }}>
            <thead>
              <tr style={{ background: "rgba(255, 255, 255, 0.03)", borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "#71717A", fontWeight: 700 }}>Engine Component</th>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "#71717A", fontWeight: 700 }}>Underlying Method / Formula</th>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "#71717A", fontWeight: 700 }}>Method Type</th>
                <th style={{ padding: "12px 16px", textAlign: "left", color: "#71717A", fontWeight: 700 }}>Architectural Rationale</th>
              </tr>
            </thead>
            <tbody>
              {methodAttribution.map((m, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.03)" }}>
                  <td style={{ padding: "12px 16px", color: "#FFFFFF", fontWeight: 700 }}>{m.component}</td>
                  <td style={{ padding: "12px 16px", color: "#A78BFA", fontFamily: "var(--font-mono)" }}>{m.techMethod}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className="badge badge--violet" style={{ fontSize: "0.65rem" }}>{m.category}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#A1A1AA", lineHeight: 1.5 }}>{m.rationale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety & Fail-Closed Guardrails */}
      <div className="bento-card" style={{ padding: "30px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <ShieldCheck size={22} color="#10B981" />
          <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF" }}>
            3. Enterprise Guardrails & Fail-Closed Strategy
          </h2>
        </div>
        <p style={{ margin: "0 0 20px 0", fontSize: "0.875rem", color: "#A1A1AA" }}>
          How EvidenceIQ.ai ensures reliability, data privacy, and mathematical integrity.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
          {[
            {
              title: "100% Local Inference ($0.00 Cost)",
              desc: "All LLM calls run against local Ollama instance (qwen2.5:1.5b). Zero data leaves enterprise perimeter.",
              badge: "Air-Gapped Ready",
            },
            {
              title: "AST Numeric Diff Guardrail",
              desc: "Every numeric claim in the generated text is cross-referenced against raw SQL metrics before rendering.",
              badge: "Zero Hallucinations",
            },
            {
              title: "Hard Baseline Abstention",
              desc: "Refuses automated diagnosis if baseline history is < 14 days or data quality index is below 0.60.",
              badge: "Fail-Closed",
            },
          ].map((g, i) => (
            <div key={i} style={{ background: "rgba(255, 255, 255, 0.02)", padding: "18px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF" }}>{g.title}</span>
                <span className="badge badge--success" style={{ fontSize: "0.62rem" }}>{g.badge}</span>
              </div>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#71717A", lineHeight: 1.6 }}>{g.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
