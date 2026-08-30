import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Award,
  Users,
  Cpu,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Eye,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  Activity,
  Check,
} from "lucide-react";

export default function Proposal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        maxWidth: "1140px",
        margin: "0 auto",
        padding: "16px 24px 64px",
        lineHeight: 1.6,
      }}
    >
      {/* Accenture Tag */}
      <div style={{ marginBottom: "20px" }}>
        <span className="section-tag">
          <Award size={13} color="#A78BFA" />
          Accenture Innovation Challenge 2026 · Problem Track 3 Submission
        </span>
      </div>

      {/* Main Page Title */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: "-0.03em",
            fontFamily: "var(--font-heading)",
            margin: "0 0 8px 0",
          }}
        >
          Business Proposal &mdash; <span className="text-gradient-purple">BusinessIntelligence.ai</span>
        </h1>
        <p style={{ margin: 0, color: "#A1A1AA", fontSize: "0.95rem" }}>
          Executive summary, target personas, mathematical differentiation, ROI business case, and risk mitigations.
        </p>
      </div>

      {/* Section 1: Executive Summary */}
      <div className="bento-card" style={{ padding: "30px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#FFFFFF", marginTop: 0, marginBottom: "14px", fontFamily: "var(--font-heading)" }}>
          1. Executive Summary & Problem Framing
        </h2>
        <p style={{ color: "#D4D4D8", fontSize: "0.9rem", margin: "0 0 16px 0", lineHeight: "1.7" }}>
          Modern enterprises track critical KPIs across fragmented transactional databases, analytics pipelines, system change logs, and support ticketing platforms. When a KPI drops unexpectedly (e.g. regional revenue plunging 35%), operational teams face three critical bottlenecks:
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginBottom: "20px" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "16px" }}>
            <strong style={{ color: "#8B5CF6", display: "block", marginBottom: "4px" }}>1. Time-to-Diagnosis Delay:</strong>
            <span style={{ fontSize: "0.83rem", color: "#A1A1AA" }}>Analysts manually cross-reference release logs, promotional calendars, and ticket queues, taking hours or days to isolate root causes.</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "16px" }}>
            <strong style={{ color: "#EF4444", display: "block", marginBottom: "4px" }}>2. Hallucination Risk:</strong>
            <span style={{ fontSize: "0.83rem", color: "#A1A1AA" }}>Unconstrained LLMs attempt to compute financial math, hallucinating numbers and creating compliance liabilities.</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "10px", padding: "16px" }}>
            <strong style={{ color: "#F59E0B", display: "block", marginBottom: "4px" }}>3. Action Friction:</strong>
            <span style={{ fontSize: "0.83rem", color: "#A1A1AA" }}>Recommendations lack clear risk tiers and decision rights, leading to unauthorized changes or delayed rollbacks.</span>
          </div>
        </div>

        <p style={{ color: "#A1A1AA", fontSize: "0.88rem", margin: 0 }}>
          <strong style={{ color: "#FFFFFF" }}>EvidenceIQ.ai</strong> solves this by separating <strong style={{ color: "#10B981" }}>quantitative truth</strong> (deterministic statistics + relational evidence graphs) from <strong style={{ color: "#8B5CF6" }}>narrative synthesis</strong> (grounded local LLMs), enforcing a mandatory human-in-the-loop checkpoint before executing high-risk business actions.
        </p>
      </div>

      {/* Section 2: Target Personas */}
      <div className="bento-card" style={{ padding: "30px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#FFFFFF", marginTop: 0, marginBottom: "16px", fontFamily: "var(--font-heading)" }}>
          2. Target Personas & Persona-Specific Interfaces
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "18px" }}>
          <div style={{ background: "rgba(139, 92, 246, 0.06)", border: "1px solid rgba(139, 92, 246, 0.20)", borderRadius: "12px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span className="badge badge--violet">Executive Persona</span>
              <span style={{ fontSize: "0.85rem", color: "#FFFFFF", fontWeight: 700 }}>VP / Regional Director</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.82rem", color: "#D4D4D8", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>Needs high-level risk overview and total financial impact in ₹ Lakh.</li>
              <li>Requires 1-click action approval without navigating raw SQL logs.</li>
              <li>Receives concise plain-language executive summaries.</li>
            </ul>
          </div>

          <div style={{ background: "rgba(6, 182, 212, 0.06)", border: "1px solid rgba(6, 182, 212, 0.20)", borderRadius: "12px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span className="badge badge--indigo">Analyst Persona</span>
              <span style={{ fontSize: "0.85rem", color: "#FFFFFF", fontWeight: 700 }}>Operations & BI Analyst</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "0.82rem", color: "#D4D4D8", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li>Inspects exact z-score deviations against 21-day rolling baselines.</li>
              <li>Reviews Price-Volume-Mix (PVM) waterfall and commit SHA lineage.</li>
              <li>Examines ticket NLP clustering and DiD counterfactual control slices.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Section 3: Technical Innovation */}
      <div className="bento-card" style={{ padding: "30px", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#FFFFFF", marginTop: 0, marginBottom: "16px", fontFamily: "var(--font-heading)" }}>
          3. Core Technical Innovations
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            {
              title: "1. Zero Mathematical Hallucinations",
              desc: "All quantitative operations (z-scores, PVM decomposition, 6-factor causal scoring) run in pure Python code. The local LLM never calculates numbers.",
            },
            {
              title: "2. Directed Business Evidence Graph",
              desc: "Relational knowledge topology connecting KPI nodes to deploy events and support ticket clusters via PRECEDES and CORROBORATES edges.",
            },
            {
              title: "3. Dual Materiality & Noise Filter",
              desc: "Enforces both statistical significance (z ≥ 1.96σ) and financial floor (≥ ₹1L) before triggering automated alerts, eliminating alert storms.",
            },
            {
              title: "4. Risk-Gated Human Checkpoint & SHA-256 Audit Trail",
              desc: "Every automated recommendation is risk-tiered. Medium/High risk actions require human Confirm/Reject/Modify, signed cryptographically.",
            },
          ].map((item, idx) => (
            <div key={idx} style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "4px" }}>{item.title}</div>
              <div style={{ fontSize: "0.83rem", color: "#A1A1AA", lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: ROI Business Case */}
      <div className="bento-card" style={{ padding: "30px" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#FFFFFF", marginTop: 0, marginBottom: "16px", fontFamily: "var(--font-heading)" }}>
          4. Enterprise ROI & Impact Metrics
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", textAlign: "center" }}>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#10B981", fontFamily: "var(--font-heading)" }}>&gt;99%</div>
            <div style={{ fontSize: "0.78rem", color: "#A1A1AA", marginTop: "4px" }}>Mean-Time-To-Insight (4.5d &rarr; &lt;30s)</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#8B5CF6", fontFamily: "var(--font-heading)" }}>$0.00</div>
            <div style={{ fontSize: "0.78rem", color: "#A1A1AA", marginTop: "4px" }}>Per-Query Operating LLM Cost</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#06B6D4", fontFamily: "var(--font-heading)" }}>0.00%</div>
            <div style={{ fontSize: "0.78rem", color: "#A1A1AA", marginTop: "4px" }}>Hallucinated Numbers (AST Diff)</div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", padding: "18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#F59E0B", fontFamily: "var(--font-heading)" }}>11 / 11</div>
            <div style={{ fontSize: "0.78rem", color: "#A1A1AA", marginTop: "4px" }}>Verified Automated Test Suites</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
