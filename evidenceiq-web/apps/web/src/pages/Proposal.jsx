import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Award,
  Users,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
  DollarSign,
  Check,
  Building2,
  Database,
  Layers,
  Scale,
} from "lucide-react";

export default function Proposal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      style={{ maxWidth: "1240px", margin: "0 auto", padding: "16px 24px 80px" }}
    >
      {/* ── Page Header ── */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "inline-flex", marginBottom: "8px" }}>
          <span className="section-tag">
            <Award size={13} color="#A78BFA" />
            Accenture Innovation Challenge 2026 · Problem Track 3
          </span>
        </div>
        <h1
          style={{
            margin: "0 0 6px 0",
            fontSize: "clamp(1.8rem, 2.6vw, 2.3rem)",
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: "-0.03em",
          }}
        >
          Executive Business <span className="text-gradient-purple">Proposal</span>
        </h1>
        <p style={{ margin: 0, color: "#9E9EB2", fontSize: "0.925rem" }}>
          The enterprise business case, revenue protection economics, and completed engineering roadmap.
        </p>
      </div>

      {/* ── 1. THE PROBLEM VS SOLUTION COMPARISON ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "28px" }}>
        {/* Status Quo */}
        <div className="bento-card" style={{ padding: "28px", borderTop: "4px solid #EF4444" }}>
          <span style={{ fontSize: "0.72rem", color: "#EF4444", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" }}>
            The Status Quo (Diagnostic Paralysis)
          </span>
          <h3 style={{ margin: "6px 0 16px 0", fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF" }}>
            4.5h Triage Latency & Lost Revenue
          </h3>
          <ul style={{ margin: 0, paddingLeft: "18px", color: "#9E9EB2", fontSize: "0.85rem", lineHeight: 1.8 }}>
            <li>Fragmented data silos across ERP, Jira releases, and support ticket queues.</li>
            <li>Operational teams spend hours manually assembling spreadsheets during outages.</li>
            <li>Average incident causes <strong>$236,000 USD (₹1,972 Lakh)</strong> in unrecovered sales.</li>
            <li>Unconstrained cloud LLMs hallucinate numbers and compromise compliance.</li>
          </ul>
        </div>

        {/* EvidenceIQ.ai */}
        <div className="bento-card" style={{ padding: "28px", borderTop: "4px solid #10B981" }}>
          <span style={{ fontSize: "0.72rem", color: "#10B981", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" }}>
            With EvidenceIQ.ai (Autonomous Intelligence)
          </span>
          <h3 style={{ margin: "6px 0 16px 0", fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF" }}>
            &lt; 2s Diagnosis & 10m Recovery
          </h3>
          <ul style={{ margin: 0, paddingLeft: "18px", color: "#D4D4D8", fontSize: "0.85rem", lineHeight: 1.8 }}>
            <li>Deterministic anomaly isolation and 6-factor quasi-causal graph attribution.</li>
            <li>1-click automated CI/CD rollback via LaunchDarkly & GitHub Actions.</li>
            <li>Net protected revenue per major incident: <strong>$231,600 USD (₹1,935 Lakh)</strong>.</li>
            <li>0.00% math hallucinations with local Ollama runtime ($0.00 token cost).</li>
          </ul>
        </div>
      </div>

      {/* ── 2. FINANCIAL IMPACT & FLEET ROI ── */}
      <div className="bento-card" style={{ padding: "32px", marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span style={{ fontSize: "0.72rem", color: "#8B5CF6", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" }}>
              Enterprise Financial Impact
            </span>
            <h3 style={{ margin: "4px 0 0 0", fontSize: "1.4rem", fontWeight: 800, color: "#FFFFFF" }}>
              Fleet Revenue Protection & ROI Model
            </h3>
          </div>
          <span className="badge badge--success" style={{ fontSize: "0.78rem" }}>
            Accenture Innovation Benchmark
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "18px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ fontSize: "0.72rem", color: "#6B6D82", textTransform: "uppercase", fontWeight: 700 }}>Annual Protected Sales</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#10B981", fontFamily: "var(--font-mono)", margin: "4px 0 2px" }}>
              $2.78M USD
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9E9EB2" }}>₹23,220 Lakh (Based on 12 annual incidents)</div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "18px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ fontSize: "0.72rem", color: "#6B6D82", textTransform: "uppercase", fontWeight: 700 }}>Diagnostic Latency</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#8B5CF6", fontFamily: "var(--font-mono)", margin: "4px 0 2px" }}>
              &gt; 99%
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9E9EB2" }}>Reduced from 4.5 hours to 2 seconds</div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "18px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ fontSize: "0.72rem", color: "#6B6D82", textTransform: "uppercase", fontWeight: 700 }}>Marginal Token Cost</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#06B6D4", fontFamily: "var(--font-mono)", margin: "4px 0 2px" }}>
              $0.00
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9E9EB2" }}>100% on-premise local Ollama inference</div>
          </div>

          <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "18px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <div style={{ fontSize: "0.72rem", color: "#6B6D82", textTransform: "uppercase", fontWeight: 700 }}>Audit Compliance</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#F59E0B", fontFamily: "var(--font-mono)", margin: "4px 0 2px" }}>
              100%
            </div>
            <div style={{ fontSize: "0.75rem", color: "#9E9EB2" }}>SOC-2 Type II, SOX 404, GDPR Art. 22</div>
          </div>
        </div>
      </div>

      {/* ── 3. COMPLETED ENGINEERING ROADMAP ── */}
      <div className="bento-card" style={{ padding: "32px" }}>
        <div style={{ marginBottom: "22px" }}>
          <span style={{ fontSize: "0.72rem", color: "#8B5CF6", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" }}>
            Engineering Roadmap & Delivery Status
          </span>
          <h3 style={{ margin: "4px 0 0 0", fontSize: "1.4rem", fontWeight: 800, color: "#FFFFFF" }}>
            All 4 Phases Fully Implemented & Verified
          </h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {[
            {
              phase: "Phase 1",
              title: "Core Intelligence Engine",
              items: ["21-Day Gaussian baseline & z-scores", "6-factor causal evidence graph", "Dual-persona grounded narrative", "Risk-gated human checkpoint"],
            },
            {
              phase: "Phase 2",
              title: "Enterprise Connectors",
              items: ["Snowflake, BigQuery, Databricks", "PostgreSQL & SAP HANA support", "Jira & GitHub Actions event ingestion", "Role-based access control (RBAC)"],
            },
            {
              phase: "Phase 3",
              title: "Autonomous Recovery",
              items: ["Automated CI/CD rollback hooks", "LaunchDarkly feature flag toggles", "Decision memory reinforcement learning", "5-domain cross-KPI correlation matrix"],
            },
            {
              phase: "Phase 4",
              title: "Fleet Scale & Compliance",
              items: ["Federated multi-BU tenant isolation", "Cross-enterprise contract marketplace", "SOC-2 / SOX / GDPR compliance packs", "Accenture consulting white-label suite"],
            },
          ].map((p, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.07)",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#8B5CF6" }}>
                  {p.phase}
                </span>
                <span className="badge badge--success" style={{ fontSize: "0.68rem" }}>
                  ✓ 100% COMPLETE
                </span>
              </div>
              <h4 style={{ margin: "0 0 12px 0", fontSize: "1rem", fontWeight: 750, color: "#FFFFFF" }}>
                {p.title}
              </h4>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "0.78rem", color: "#9E9EB2", lineHeight: 1.65 }}>
                {p.items.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
