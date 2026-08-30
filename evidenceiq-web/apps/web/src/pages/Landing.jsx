import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Network, ArrowRight, ShieldCheck, Cpu, Zap, Activity, Eye, Terminal } from "lucide-react";
import Hero3DScene from "../components/three/Hero3DScene";
import PulseDot from "../components/PulseDot";
import AnimatedNumber from "../components/AnimatedNumber";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 25 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

export default function Landing({ onNavigate }) {
  return (
    <div style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* ─── 3D Three.js Interactive Hero Background ─────────────────── */}
      <Hero3DScene />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "80px 24px 120px 24px",
        }}
      >
        {/* ─── Hero Section ──────────────────────────────────────────────── */}
        <section style={{ textAlign: "center", marginBottom: "88px", position: "relative" }}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            {/* Dribbble Pill Badge */}
            <motion.div variants={itemVariants} style={{ display: "inline-flex", marginBottom: "24px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 16px",
                  borderRadius: "100px",
                  background: "rgba(30, 37, 56, 0.75)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  boxShadow: "0 0 20px rgba(99, 102, 241, 0.15)",
                }}
              >
                <PulseDot color="#10B981" size={7} />
                <span
                  style={{
                    color: "#E2E8F0",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                  }}
                >
                  Accenture Innovation Challenge 2026 · Problem Track 3
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)",
                fontWeight: 800,
                marginTop: 0,
                marginBottom: "22px",
                lineHeight: 1.08,
                letterSpacing: "-0.04em",
                color: "#FFFFFF",
                maxWidth: "960px",
              }}
            >
              Graph-First{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #A5B4FC 0%, #818CF8 30%, #6366F1 70%, #A855F7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "0 0 40px rgba(99,102,241,0.3)",
                }}
              >
                Evidence Engine
              </span>{" "}
              for Business Intelligence
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "1.15rem",
                color: "#94A3B8",
                maxWidth: "720px",
                margin: "0 auto 36px auto",
                lineHeight: 1.65,
                fontWeight: 400,
              }}
            >
              Surveil KPI variance slices with deterministic 21-day Gaussian math, reconstruct root-cause causal topologies in 3D, and generate grounded executive narratives.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              style={{ display: "flex", gap: "16px", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}
            >
              <motion.button
                onClick={() => onNavigate("investigation")}
                className="btn-primary"
                style={{
                  padding: "14px 28px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  borderRadius: "8px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 0 24px rgba(99, 102, 241, 0.4)",
                }}
                whileHover={{ scale: 1.03, boxShadow: "0 0 32px rgba(99, 102, 241, 0.6)" }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Launch Causal Investigation</span>
                <ArrowRight size={16} />
              </motion.button>
              <motion.button
                onClick={() => onNavigate("evidence-graph")}
                style={{
                  padding: "14px 28px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  borderRadius: "8px",
                  background: "rgba(24, 29, 43, 0.8)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
                whileHover={{ scale: 1.03, borderColor: "#818CF8", background: "rgba(30, 37, 56, 0.95)" }}
                whileTap={{ scale: 0.98 }}
              >
                <Network size={16} color="#818CF8" />
                <span>Explore 3D Graph</span>
              </motion.button>
            </motion.div>

            {/* Dribbble-Style Telemetry Stat Pills */}
            <motion.div
              variants={itemVariants}
              style={{
                marginTop: "44px",
                display: "flex",
                gap: "28px",
                justifyContent: "center",
                flexWrap: "wrap",
                background: "rgba(18, 21, 31, 0.65)",
                backdropFilter: "blur(12px)",
                padding: "14px 28px",
                borderRadius: "100px",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              }}
            >
              {[
                { label: "Knowledge Nodes", value: 2847, format: (v) => `${Math.round(v).toLocaleString()}` },
                { label: "Hypotheses Scored", value: 143 },
                { label: "Decisions Logged", value: 38 },
                { label: "MTTI Reduction", value: 85, format: (v) => `${Math.round(v)}%` },
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: "center", minWidth: "90px" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "#FFFFFF",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    <AnimatedNumber value={stat.value} format={stat.format} />
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94A3B8", marginTop: "2px", fontWeight: 500 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ─── Dribbble Bento Grid Feature Cards ─────────────────────────── */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            position: "relative",
          }}
        >
          {/* Card 1 */}
          <motion.div
            variants={cardVariants}
            className="card-glass card-hover"
            style={{
              padding: "32px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #6366F1, transparent)" }} />
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <Cpu size={22} color="#818CF8" />
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "#818CF8",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
              }}
            >
              01 / Quantitative Engine
            </div>
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                margin: "0 0 10px 0",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
              }}
            >
              Deterministic Core
            </h3>
            <p
              style={{
                color: "#94A3B8",
                fontSize: "0.9rem",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Z-score baselines and variance decomposition run in pure code mathematics. Zero reliance on LLMs for quantitative calculation.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            variants={cardVariants}
            className="card-glass card-hover"
            style={{
              padding: "32px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #10B981, transparent)" }} />
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <Network size={22} color="#10B981" />
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "#10B981",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
              }}
            >
              02 / Relational Graph
            </div>
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                margin: "0 0 10px 0",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
              }}
            >
              3D Evidence Graph
            </h3>
            <p
              style={{
                color: "#94A3B8",
                fontSize: "0.9rem",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Constructs a directed graph with PRECEDES and CORROBORATES edge types, scoring candidate hypotheses by relational adjacency.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            variants={cardVariants}
            className="card-glass card-hover"
            style={{
              padding: "32px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #A855F7, transparent)" }} />
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "rgba(168,85,247,0.15)",
                border: "1px solid rgba(168,85,247,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <ShieldCheck size={22} color="#C084FC" />
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "#C084FC",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
              }}
            >
              03 / Risk Governance
            </div>
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                margin: "0 0 10px 0",
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
              }}
            >
              Human Checkpoint Gate
            </h3>
            <p
              style={{
                color: "#94A3B8",
                fontSize: "0.9rem",
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              Every medium and high-risk operational action is blocked until an analyst explicitly confirms, rejects, or modifies the recommendation.
            </p>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
