import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Layers,
  ShieldCheck,
  Cpu,
  Database,
  Sparkles,
  CheckCircle2,
  Lock,
  Activity,
  Server,
  Zap,
  Network,
  ArrowRight,
  ChevronRight,
  Code2,
} from "lucide-react";

export default function Architecture() {
  const [selectedLayer, setSelectedLayer] = useState(2); // Layer 3 (Intelligence Core) default

  const layers = [
    {
      id: 0,
      number: "01",
      name: "Heterogeneous Ingestion",
      tag: "Data Pipeline",
      latency: "< 15ms",
      color: "#8B5CF6",
      desc: "Reconciles ERP store sales CSVs, system change logs, and unstructured customer support tickets on timestamp and region keys.",
      components: [
        { name: "ERP Sales Daily Stream", tech: "Pandas / SQLite", role: "Daily sales revenue grain across geographic territories" },
        { name: "Change Log Ingestion", tech: "Regex Parser", role: "Extracts deployments, hotfixes, and configuration changes" },
        { name: "Support Ticket Logs", tech: "Keyword / Severity Extractor", role: "Captures checkout failures, error 502/504 spikes in ±3d window" },
      ],
    },
    {
      id: 1,
      number: "02",
      name: "Governed Semantic Layer",
      tag: "Contracts & RBAC",
      latency: "< 5ms",
      color: "#EC4899",
      desc: "Standardizes metric formulas under formal data contracts (GAAP, IFRS) with role-based access control and automated SLAs.",
      components: [
        { name: "Semantic Contract Engine", tech: "YAML Specification", role: "Defines mathematical formulas, grains, and owners" },
        { name: "RBAC Field Gate", tech: "Role Access Validator", role: "Enforces granular visibility between Executive and Analyst personas" },
        { name: "Cross-BU Marketplace", tech: "Federated Registry", role: "Allows subsidiary business units to discover and subscribe to metric standards" },
      ],
    },
    {
      id: 2,
      number: "03",
      name: "Deterministic Intelligence Core",
      tag: "0ms LLM Math",
      latency: "< 45ms",
      color: "#06B6D4",
      desc: "Computes statistical baselines, Price-Volume-Mix waterfalls, and directed evidence graph causality strictly in pure Python.",
      components: [
        { name: "Gaussian Anomaly Detector", tech: "21-Day Rolling Baseline", role: "Evaluates z-score threshold (z ≥ 1.96σ) + revenue floor" },
        { name: "PVM Driver Decomposition", tech: "Price-Volume-Mix Math", role: "Separates volume effects from pricing shifts without LLM approximations" },
        { name: "Directed Evidence Graph", tech: "6-Factor Causal Formula", role: "Scores PRECEDES and CORROBORATES edges between events and anomalies" },
        { name: "RL Edge Recalibrator", tech: "Bounded Reward-Penalty RL", role: "Updates graph weights from human resolution telemetry (α = 0.080)" },
      ],
    },
    {
      id: 3,
      number: "04",
      name: "Autonomous Action & Audit",
      tag: "Governance & Recovery",
      latency: "< 64ms",
      color: "#10B981",
      desc: "Risk-gated human checkpoint dispatches automated CI/CD rollback hooks with immutable cryptographic SHA-256 ledger proofs.",
      components: [
        { name: "Human Checkpoint Gate", tech: "Confirm / Reject / Modify", role: "Mandatory human-in-the-loop authorization before action dispatch" },
        { name: "LaunchDarkly & GitHub Hooks", tech: "REST / Webhooks", role: "Toggles canary feature flags OFF in prod (<64ms) and runs rollback actions" },
        { name: "Cryptographic Audit Ledger", tech: "SHA-256 Non-Repudiation", role: "Generates tamper-evident compliance dossiers for SOC-2, SOX 404, GDPR" },
      ],
    },
  ];

  const active = layers[selectedLayer];

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
            <Layers size={13} color="#8B5CF6" />
            System Blueprint & Architectural Topology
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
          Interactive System <span className="text-gradient-purple">Architecture</span>
        </h1>
        <p style={{ margin: 0, color: "#9E9EB2", fontSize: "0.925rem" }}>
          Deterministic intelligence core, governed semantic layer, and cryptographic audit topology.
        </p>
      </div>

      {/* ── Cardinal Axiom Banner ── */}
      <div
        className="bento-card"
        style={{
          borderLeft: "4px solid #8B5CF6",
          padding: "20px 24px",
          marginBottom: "32px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "rgba(139, 92, 246, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#A78BFA",
            flexShrink: 0,
          }}
        >
          <Lock size={18} />
        </div>
        <div>
          <div style={{ fontSize: "0.72rem", color: "#8B5CF6", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em" }}>
            Cardinal Architecture Principle
          </div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF", marginTop: "2px" }}>
            "The Large Language Model is NEVER the source of quantitative truth."
          </div>
          <div style={{ fontSize: "0.8rem", color: "#9E9EB2", marginTop: "2px" }}>
            All baselines, z-scores, PVM decompositions, and graph causal weights are computed deterministically in pure code. LLMs are restricted strictly to narrative articulation governed by AST numeric diff checkers.
          </div>
        </div>
      </div>

      {/* ── 4-Layer Interactive Architecture Selector ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {layers.map((l) => {
          const isSelected = selectedLayer === l.id;
          return (
            <div
              key={l.id}
              onClick={() => setSelectedLayer(l.id)}
              className="bento-card"
              style={{
                padding: "20px",
                cursor: "pointer",
                border: isSelected ? `1px solid ${l.color}` : "1px solid rgba(255, 255, 255, 0.08)",
                background: isSelected ? `${l.color}15` : "rgba(255, 255, 255, 0.02)",
                transition: "all 140ms ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: l.color }}>
                  LAYER {l.number}
                </span>
                <span style={{ fontSize: "0.7rem", color: "#6B6D82" }}>{l.latency}</span>
              </div>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "1.05rem", fontWeight: 750, color: "#FFFFFF" }}>
                {l.name}
              </h3>
              <div style={{ fontSize: "0.72rem", color: "#9E9EB2" }}>{l.tag}</div>
            </div>
          );
        })}
      </div>

      {/* ── Active Layer Deep Dive ── */}
      <div className="bento-card" style={{ padding: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <span className="badge badge--violet" style={{ fontSize: "0.72rem" }}>
                Layer {active.number} &bull; {active.tag}
              </span>
              <span className="badge badge--success" style={{ fontSize: "0.72rem" }}>
                Latency: {active.latency}
              </span>
            </div>
            <h2 style={{ margin: "0 0 6px 0", fontSize: "1.4rem", fontWeight: 800, color: "#FFFFFF" }}>
              {active.name}
            </h2>
            <p style={{ margin: 0, fontSize: "0.88rem", color: "#9E9EB2", maxWidth: "780px", lineHeight: 1.6 }}>
              {active.desc}
            </p>
          </div>
        </div>

        {/* Components Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {active.components.map((c, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: "8px",
                padding: "18px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#FFFFFF" }}>{c.name}</span>
                <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: active.color, background: `${active.color}15`, padding: "2px 8px", borderRadius: "4px" }}>
                  {c.tech}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#9E9EB2", lineHeight: 1.5 }}>
                {c.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
