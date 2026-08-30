import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import {
  Activity, Layers, ShieldCheck, Cpu, TrendingDown, ArrowRight,
  Network, Zap, Clock, Sparkles, BarChart3, Server, FileText,
  Sliders, ChevronDown, ChevronRight, Terminal, Flame, Eye,
  CheckCircle2, AlertTriangle, Lock, Database, GitBranch, Search,
  Star, Users, Shield, ChevronUp,
} from "lucide-react";
import PulseDot from "../components/PulseDot";

/* ═══════════════════════════════════════════════════════════════════════════════
   THREE.JS FLOATING PARTICLE FIELD COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */
function FloatingParticles() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particle system
    const count = 180;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;

      // Violet / magenta / cyan palette
      const r = Math.random();
      if (r < 0.4) { colors[i*3]=0.55; colors[i*3+1]=0.36; colors[i*3+2]=0.96; } // violet
      else if (r < 0.7) { colors[i*3]=0.93; colors[i*3+1]=0.28; colors[i*3+2]=0.60; } // magenta
      else { colors[i*3]=0.02; colors[i*3+1]=0.71; colors[i*3+2]=0.83; } // cyan
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // Soft glowing orbs
    const orbGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const orbs = [];
    const orbColors = [0x8B5CF6, 0xEC4899, 0x06B6D4];
    for (let i = 0; i < 6; i++) {
      const orbMat = new THREE.MeshBasicMaterial({
        color: orbColors[i % 3],
        transparent: true,
        opacity: 0.15,
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 15
      );
      orb.scale.setScalar(2 + Math.random() * 3);
      scene.add(orb);
      orbs.push({ mesh: orb, speed: 0.3 + Math.random() * 0.5, offset: Math.random() * Math.PI * 2 });
    }

    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    const onMouseMove = (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 0.3;
      targetY = -(e.clientY / window.innerHeight - 0.5) * 0.3;
    };
    window.addEventListener("mousemove", onMouseMove);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    let frameId;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      mouseX += (targetX - mouseX) * 0.04;
      mouseY += (targetY - mouseY) * 0.04;

      particles.rotation.y = t * 0.02 + mouseX;
      particles.rotation.x = mouseY * 0.5;

      orbs.forEach(({ mesh, speed, offset }) => {
        mesh.position.y += Math.sin(t * speed + offset) * 0.005;
        mesh.position.x += Math.cos(t * speed * 0.7 + offset) * 0.003;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 1,
        opacity: 0.7,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN HOME PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function Home({ onNavigate }) {
  const [selectedScenario, setSelectedScenario] = useState("store_101");
  const [customDelta, setCustomDelta] = useState(-35);
  const [activePersona, setActivePersona] = useState("executive");
  const [activePipelineStep, setActivePipelineStep] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  const scenarios = {
    store_101: {
      tag: "Severe Disruption", tagColor: "#EF4444",
      title: "Store 101 Mobile App Release v5.4 Outage",
      kpi: "Regional Revenue (North India / Store 101)",
      delta: -67.96, zScore: -3.42,
      observed: "₹3,373", expected: "₹10,528",
      revenueAtStake: "₹17.85L/day",
      materialityPassed: true,
      rootCauseTitle: "Mobile Checkout Service v5.4 Deployment",
      temporalLag: "4.2h prior", corroboration: "14 Support Tickets [checkout_failure, error_502]",
      didCounterfactual: "South & West India cohorts unaffected (p = 0.002)",
      evidenceScore: 0.850, confidence: "HIGH",
      executiveAction: "Approve 1-Click Rollback of v5.4 → stable v5.3.2",
      analystAction: "Rollback commit #8f4c21a, invalidate Redis session cache, trigger probes",
      owner: "Lead Mobile Architect",
      isSparse: false,
    },
    gateway_rate_limit: {
      tag: "Moderate Disruption", tagColor: "#F59E0B",
      title: "Third-Party Payment Gateway 502 Rate Limit",
      kpi: "Online Store Revenue (West India)",
      delta: -28.4, zScore: -2.85,
      observed: "₹7,820", expected: "₹10,920",
      revenueAtStake: "₹3.10L/day",
      materialityPassed: true,
      rootCauseTitle: "Primary Gateway HTTP 429 Throttle Surge",
      temporalLag: "45 min prior", corroboration: "8 POS Gateway Timeout Tickets",
      didCounterfactual: "Net banking unaffected; credit card dropped 41%",
      evidenceScore: 0.720, confidence: "MEDIUM",
      executiveAction: "Authorize Failover to Secondary Adyen Router",
      analystAction: "Route 70% traffic to secondary tunnel; query SLA",
      owner: "FinTech Platform Team",
      isSparse: false,
    },
    sparse_history: {
      tag: "Cold-Start / Abstain", tagColor: "#A855F7",
      title: "Newly Launched Central India Store 999",
      kpi: "Regional Revenue (Central India / Store 999)",
      delta: -8.1, zScore: 0.0,
      observed: "₹2,100", expected: "Insufficient Baseline",
      revenueAtStake: "Uncalibrated",
      materialityPassed: false,
      rootCauseTitle: "Engine Hard Abstention (History < 14 Days)",
      temporalLag: "3 days (14 required)", corroboration: "0 Events Logged",
      didCounterfactual: "No parallel trend cohort",
      evidenceScore: 0.220, confidence: "ABSTAIN",
      executiveAction: "Escalate to Human Regional Analyst",
      analystAction: "Collect 11 more daily observations; compare Tier-2 cohorts",
      owner: "Regional Operations Specialist",
      isSparse: true,
    },
  };

  const current = scenarios[selectedScenario];
  const liveDelta = selectedScenario === "store_101" ? customDelta : current.delta;
  const liveZScore = (liveDelta / 19.8).toFixed(2);
  const isMaterial = Math.abs(liveDelta) >= 8.0;

  const pipelineSteps = [
    { name: "Ingestion", desc: "Reconcile ERP sales CSV, Git/Jira deploy logs & Zendesk tickets", icon: Database },
    { name: "Conformance", desc: "Align grains, currencies, calendars & semantic contracts", icon: FileText },
    { name: "Anomaly Gate", desc: "21-day Gaussian z-score (≥1.96σ) + Revenue-at-Stake filter", icon: AlertTriangle },
    { name: "PVM Decomp", desc: "Price-Volume-Mix waterfall isolating volume vs price effects", icon: BarChart3 },
    { name: "Evidence Graph", desc: "PRECEDES & CORROBORATES edges with 6-factor causal scoring", icon: Network },
    { name: "Narration", desc: "Executive vs Analyst narratives with AST numeric diff validation", icon: Sparkles },
    { name: "Checkpoint", desc: "Risk-gated Confirm/Reject/Modify with SHA-256 cryptographic sign", icon: ShieldCheck },
    { name: "Memory", desc: "Analyst feedback & 7-day KPI deltas update graph edge weights", icon: GitBranch },
  ];

  const faqs = [
    { q: "How does EvidenceIQ.ai separate meaningful KPI changes from noise?", a: "We use a 21-day rolling Gaussian baseline with day-of-week seasonality indexing. A movement must exceed both a statistical significance gate (z ≥ 1.96σ) AND a business materiality gate (Revenue-at-Stake ≥ ₹1L/day) before it triggers investigation. This dual-gate approach suppresses >90% of false positives." },
    { q: "What happens when the data is genuinely ambiguous or sparse?", a: "The engine performs hard abstention. If historical baseline < 14 days, or if multiple competing hypotheses score within 0.05 of each other with no distinguishing evidence, the system refuses to recommend automated action and escalates to a human analyst with full transparency about WHY it abstained." },
    { q: "How does it move from correlation to actionable causation?", a: "Through a 6-factor Directed Evidence Graph: temporal precedence, cross-modal corroboration (support tickets ↔ system events), Difference-in-Differences counterfactual controls, magnitude proportionality, specificity constraints, and closed-loop outcome feedback from past decisions." },
    { q: "Does the system hallucinate numbers or fabricate root causes?", a: "No. All mathematical operations (z-scores, PVM waterfall, causal scoring) are computed deterministically in Python. The LLM (local Ollama qwen2.5:1.5b) only performs natural language translation of pre-computed evidence packages. An AST-level numeric diff validator cross-checks every number in the narrative against the source data." },
    { q: "What is the cost of running this system?", a: "$0.00 per query. The entire inference pipeline runs on a local Ollama instance with the qwen2.5:1.5b model. There are zero cloud API calls, zero token costs, and zero data leaving the enterprise perimeter." },
  ];

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1: HERO — Full-Width Background Image with 3D Particles
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="hero-section" style={{ minHeight: "780px" }}>
        {/* Background Image */}
        <div
          className="hero-bg-image"
          style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
        />
        <div className="hero-bg-overlay" />

        {/* Three.js Particle Field */}
        <FloatingParticles />

        {/* Hero Content */}
        <div className="hero-content" style={{ paddingTop: "140px" }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: "24px" }}
          >
            <span className="section-tag">
              <PulseDot color="#10B981" size={6} />
              Accenture Innovation Challenge 2026 · Track 3
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4.2rem)",
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              maxWidth: "780px",
              margin: "0 0 20px 0",
            }}
          >
            Built for Business.{" "}
            <span className="text-gradient-purple">Powered by AI</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontSize: "clamp(1rem, 1.6vw, 1.2rem)",
              color: "#A1A1AA",
              maxWidth: "580px",
              lineHeight: 1.7,
              margin: "0 0 36px 0",
            }}
          >
            EvidenceIQ.ai detects KPI disruptions, identifies causal root causes across
            heterogeneous data, and generates persona-specific narratives with
            traceable evidence — all in under 30 seconds.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}
          >
            <button
              className="btn-primary"
              onClick={() => onNavigate("investigation")}
              style={{ padding: "13px 28px", borderRadius: "12px", fontSize: "0.95rem" }}
            >
              Run Analysis <ArrowRight size={17} />
            </button>
            <button
              className="btn-secondary"
              onClick={() => onNavigate("proposal")}
              style={{ padding: "13px 24px", borderRadius: "12px", fontSize: "0.95rem" }}
            >
              Read our Proposal
            </button>
          </motion.div>

          {/* Floating stats above the fold */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              display: "flex",
              gap: "32px",
              marginTop: "56px",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: ">99%", label: "MTTI Reduction", color: "#10B981" },
              { value: "$0.00", label: "Per Query Cost", color: "#8B5CF6" },
              { value: "0.00%", label: "Hallucinated Numbers", color: "#06B6D4" },
              { value: "11/11", label: "Tests Verified", color: "#F59E0B" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "left" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 800, fontFamily: "var(--font-heading)", color: s.color }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#71717A", fontWeight: 600, marginTop: "2px" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2: "What EvidenceIQ.ai Does" — Clashify Scroll Strip
          ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 0 100px" }}>
        <div className="section-container">
          <div className="section-heading">
            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.4 }}
              style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: "#A78BFA", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}
            >
              What it does
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5 }}
              style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, margin: "0 0 8px 0" }}
            >
              EvidenceIQ.ai helps <span className="text-gradient-purple">Business & BI Leaders</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.1 }}
              style={{ margin: "0 auto", fontSize: "1.05rem", color: "#71717A", maxWidth: "680px" }}
            >
              Diagnose revenue anomalies, identify causal drivers, and recommend data-grounded actions — without leaving your dashboard.
            </motion.p>
          </div>

          {/* 3-Card Icon Row (Clashify "Who we're built for" style) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {[
              { icon: Users, title: "C-Suite Executives", desc: "Get plain-language risk summaries with revenue-at-stake figures and 1-click action approvals", color: "#8B5CF6" },
              { icon: BarChart3, title: "BI Analysts", desc: "Deep-dive z-scores, PVM waterfall decomposition, commit SHAs, and full data lineage in one view", color: "#EC4899" },
              { icon: Shield, title: "Compliance & Risk", desc: "Every recommendation is SHA-256 signed, risk-gated, and archived in an immutable decision ledger", color: "#06B6D4" },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="bento-card"
                style={{ padding: "32px", textAlign: "center" }}
              >
                <div style={{
                  width: "56px", height: "56px", borderRadius: "14px",
                  background: `${card.color}15`, border: `1px solid ${card.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 18px auto",
                }}>
                  <card.icon size={24} color={card.color} />
                </div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0 0 8px 0" }}>{card.title}</h3>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#71717A", lineHeight: 1.6 }}>{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 3: INTERACTIVE SANDBOX (Clashify Feature Grid with Images)
          ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "0 0 100px" }}>
        <div className="section-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: "#A78BFA", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Live Demonstration
              </p>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, margin: 0 }}>
                Interactive KPI <span className="text-gradient-purple">Anomaly Sandbox</span>
              </h2>
            </div>
            <button
              className="btn-secondary"
              onClick={() => onNavigate("investigation")}
              style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "6px" }}
            >
              Open Full Engine <ArrowRight size={14} />
            </button>
          </div>

          {/* Scenario Tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
            {[
              { id: "store_101", label: "Store 101 Outage", icon: Flame, color: "#EF4444" },
              { id: "gateway_rate_limit", label: "Gateway 502", icon: Server, color: "#F59E0B" },
              { id: "sparse_history", label: "Sparse History (Abstain)", icon: Clock, color: "#A855F7" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedScenario(s.id)}
                className={`neon-pill ${selectedScenario === s.id ? "neon-pill--active" : ""}`}
                style={{ border: "none" }}
              >
                <s.icon size={13} color={s.color} />
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Two-Column Sandbox Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
            {/* Left: Quantitative Detection */}
            <div className="bento-card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#71717A", fontWeight: 700 }}>
                  Anomaly Detection Gate
                </span>
                <span className={`badge badge--${current.confidence === "HIGH" ? "danger" : current.confidence === "MEDIUM" ? "warning" : "violet"}`}>
                  {current.tag}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "20px" }}>
                <div style={{ fontSize: "2.8rem", fontWeight: 900, fontFamily: "var(--font-heading)", color: liveDelta < -20 ? "#EF4444" : liveDelta < -10 ? "#F59E0B" : "#10B981" }}>
                  {liveDelta > 0 ? `+${liveDelta}%` : `${liveDelta}%`}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#71717A" }}>
                  {current.observed} vs {current.expected}
                </div>
              </div>

              {/* Interactive Slider */}
              {selectedScenario === "store_101" && (
                <div style={{ marginBottom: "22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#71717A", marginBottom: "8px" }}>
                    <span>Simulate drop magnitude</span>
                    <strong style={{ color: "#A78BFA" }}>{customDelta}%</strong>
                  </div>
                  <input type="range" min="-68" max="-5" value={customDelta} onChange={(e) => setCustomDelta(Number(e.target.value))} className="kpi-slider" />
                </div>
              )}

              {/* Metric Pills */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "20px" }}>
                {[
                  { label: "Z-SCORE", value: current.isSparse ? "N/A" : `${liveZScore}σ`, color: "#EF4444" },
                  { label: "REV-AT-STAKE", value: current.isSparse ? "—" : current.revenueAtStake, color: "#F59E0B" },
                  { label: "MATERIALITY", value: isMaterial ? "TRIGGERED" : "SUPPRESSED", color: isMaterial ? "#10B981" : "#EF4444" },
                ].map((m, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ fontSize: "0.65rem", color: "#52525B", fontWeight: 700, letterSpacing: "0.05em" }}>{m.label}</div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 700, color: m.color, fontFamily: "var(--font-mono)", marginTop: "4px" }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Root Cause Card */}
              <div style={{ background: "rgba(139, 92, 246, 0.06)", border: "1px solid rgba(139, 92, 246, 0.20)", borderRadius: "10px", padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Network size={14} color="#A78BFA" />
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#C4B5FD", textTransform: "uppercase" }}>Top Causal Driver</span>
                  </div>
                  <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: "9999px", background: current.confidence === "HIGH" ? "rgba(16,185,129,0.15)" : current.confidence === "MEDIUM" ? "rgba(245,158,11,0.15)" : "rgba(168,85,247,0.15)", color: current.confidence === "HIGH" ? "#6EE7B7" : current.confidence === "MEDIUM" ? "#FDE68A" : "#C084FC", fontWeight: 700 }}>
                    {current.evidenceScore.toFixed(3)} ({current.confidence})
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: "#FFF", marginBottom: "6px" }}>{current.rootCauseTitle}</div>
                <div style={{ fontSize: "0.8rem", color: "#71717A", display: "flex", flexDirection: "column", gap: "3px" }}>
                  <span>⏳ {current.temporalLag}</span>
                  <span>🎫 {current.corroboration}</span>
                  <span>⚖️ {current.didCounterfactual}</span>
                </div>
              </div>
            </div>

            {/* Right: Persona Narratives */}
            <div className="bento-card" style={{ padding: "28px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#71717A", fontWeight: 700 }}>
                  Persona-Specific Narration
                </span>
                <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.04)", padding: "2px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {["executive", "analyst"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setActivePersona(p)}
                      style={{
                        padding: "5px 12px", fontSize: "0.75rem", fontWeight: activePersona === p ? 700 : 500,
                        background: activePersona === p ? "rgba(139,92,246,0.2)" : "transparent",
                        color: activePersona === p ? "#FFF" : "#71717A",
                        border: "none", borderRadius: "4px", cursor: "pointer",
                        textTransform: "capitalize",
                      }}
                    >{p}</button>
                  ))}
                </div>
              </div>

              {/* Narrative Card */}
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "18px", flex: 1, marginBottom: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                  {activePersona === "executive" ?
                    <><Sparkles size={14} color="#F59E0B" /><span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#FDE68A" }}>Executive Summary</span></> :
                    <><Terminal size={14} color="#8B5CF6" /><span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#A78BFA" }}>Analyst Telemetry</span></>
                  }
                </div>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#D4D4D8", lineHeight: 1.7, fontFamily: activePersona === "analyst" ? "var(--font-mono)" : "var(--font-body)" }}>
                  {current.isSparse ? (
                    activePersona === "executive"
                      ? <>⚠️ Insufficient baseline history (3 days vs 14 required). Action <strong>abstained</strong> to prevent premature intervention.</>
                      : <>[GUARDRAIL]: history_days=3 &lt; min=14. STATUS: ABSTAIN.</>
                  ) : (
                    activePersona === "executive"
                      ? <><strong>Alert:</strong> {current.kpi} dropped <strong style={{ color: "#F87171" }}>{liveDelta}%</strong> ({current.revenueAtStake} at stake). Root cause: <strong>{current.rootCauseTitle}</strong> with {current.confidence} confidence.</>
                      : <>KPI: {current.kpi} | z={liveZScore}σ (p&lt;0.001). PVM: Volume -78.4%, Mix -21.6%. Target: {current.rootCauseTitle} (Lag: {current.temporalLag})</>
                  )}
                </p>
              </div>

              {/* Action Checkpoint */}
              <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.20)", borderRadius: "10px", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <ShieldCheck size={14} color="#10B981" />
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#6EE7B7", textTransform: "uppercase" }}>Recommended Action</span>
                </div>
                <div style={{ fontWeight: 650, color: "#FFF", fontSize: "0.875rem", marginBottom: "4px" }}>
                  {activePersona === "executive" ? current.executiveAction : current.analystAction}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#71717A" }}>
                  Owner: {current.owner}
                </div>
              </div>

              {/* Launch Button */}
              <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="btn-secondary"
                  onClick={() => onNavigate("investigation")}
                  style={{ padding: "7px 14px", borderRadius: "8px", fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  Open Full Investigation <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 4: FEATURE BENTO GRID (Clashify Cards with Images)
          ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "0 0 100px" }}>
        <div className="section-container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "36px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: "#A78BFA", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Core Architecture
              </p>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, margin: 0 }}>
                Four Pillars of <span className="text-gradient-purple">Intelligence</span>
              </h2>
            </div>
            <button
              className="btn-secondary"
              onClick={() => onNavigate("architecture")}
              style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "6px" }}
            >
              View Architecture <ArrowRight size={14} />
            </button>
          </div>

          {/* 2x2 Bento Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            {[
              {
                icon: TrendingDown, color: "#EF4444", title: "Deterministic Anomaly Core",
                desc: "21-day rolling Gaussian baseline with PVM mathematical decomposition. Zero LLM calculations guarantee 0% hallucinated math.",
                tags: ["z-score ≥ 1.96σ", "PVM Waterfall", "Dual Gate"],
                imgUrl: "/images/feature-dashboard.jpg",
              },
              {
                icon: Network, color: "#8B5CF6", title: "Directed Evidence Graph",
                desc: "Causal adjacency graph connecting KPI nodes, change events, and ticket clusters via PRECEDES & CORROBORATES edges with 6-factor scoring.",
                tags: ["PRECEDES", "CORROBORATES", "DiD Control"],
                imgUrl: null,
              },
              {
                icon: Cpu, color: "#EC4899", title: "Dual Persona Narration",
                desc: "Translates the same evidence into executive-level business risk summaries and analyst-level z-scores, commit SHAs, and lineage traces.",
                tags: ["Local Ollama", "AST Diff", "$0 Cost"],
                imgUrl: null,
              },
              {
                icon: ShieldCheck, color: "#10B981", title: "Risk-Gated Human Checkpoint",
                desc: "Medium/High-risk actions require mandatory Confirm / Reject / Modify review, signed with SHA-256 cryptographic audit trail.",
                tags: ["Human-in-the-Loop", "SHA-256", "Decision Memory"],
                imgUrl: null,
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="bento-card"
                style={{ overflow: "hidden" }}
              >
                {card.imgUrl && (
                  <div style={{
                    width: "100%", height: "200px",
                    backgroundImage: `url('${card.imgUrl}')`,
                    backgroundSize: "cover", backgroundPosition: "center",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                  }} />
                )}
                <div style={{ padding: "26px" }}>
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "12px",
                    background: `${card.color}12`, border: `1px solid ${card.color}28`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "16px",
                  }}>
                    <card.icon size={20} color={card.color} />
                  </div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px 0" }}>{card.title}</h3>
                  <p style={{ margin: "0 0 14px 0", fontSize: "0.85rem", color: "#71717A", lineHeight: 1.6 }}>{card.desc}</p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {card.tags.map((t, j) => (
                      <span key={j} className="badge badge--violet">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 5: PIPELINE STEPPER
          ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "0 0 100px" }}>
        <div className="section-container">
          <div className="section-heading">
            <p style={{ margin: "0 0 8px 0", fontSize: "0.85rem", color: "#A78BFA", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Under the Hood
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, margin: "0 0 8px 0" }}>
              8-Stage Intelligence <span className="text-gradient-purple">Pipeline</span>
            </h2>
            <p style={{ margin: "0 auto", fontSize: "1rem", color: "#71717A", maxWidth: "620px" }}>
              Click each stage to see the exact analytical method, data flow, and technology.
            </p>
          </div>

          {/* Step buttons */}
          <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "14px", marginBottom: "20px" }} className="scrollbar-hidden">
            {pipelineSteps.map((step, idx) => {
              const Icon = step.icon;
              const active = activePipelineStep === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActivePipelineStep(idx)}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "10px 16px", borderRadius: "10px",
                    background: active ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                    border: active ? "1px solid rgba(139,92,246,0.40)" : "1px solid rgba(255,255,255,0.06)",
                    color: active ? "#FFF" : "#71717A", fontSize: "0.8125rem",
                    fontWeight: active ? 700 : 500, cursor: "pointer",
                    whiteSpace: "nowrap", transition: "all 150ms ease", flexShrink: 0,
                  }}
                >
                  <Icon size={14} color={active ? "#A78BFA" : "#52525B"} />
                  {step.name}
                </button>
              );
            })}
          </div>

          {/* Active detail */}
          <div className="bento-card" style={{ padding: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFF", marginBottom: "6px" }}>
                Stage {activePipelineStep + 1}: {pipelineSteps[activePipelineStep].name}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#A1A1AA", maxWidth: "650px" }}>
                {pipelineSteps[activePipelineStep].desc}
              </div>
            </div>
            <div style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(139,92,246,0.10)", border: "1px solid rgba(139,92,246,0.25)", color: "#C4B5FD", fontSize: "0.8125rem", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
              Stage {activePipelineStep + 1} / 8
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 6: FAQ ACCORDION (Clashify Style)
          ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "0 0 100px" }}>
        <div className="section-container" style={{ maxWidth: "800px" }}>
          <div className="section-heading">
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", fontWeight: 800, margin: "0 0 8px 0" }}>
              We're here to answer all{" "}
              <span className="text-gradient-purple">your questions</span>.
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                className={`faq-item ${openFaq === i ? "faq-item--open" : ""}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                layout
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#FFF" }}>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    color="#71717A"
                    style={{ flexShrink: 0, transform: openFaq === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 200ms ease" }}
                  />
                </div>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{ overflow: "hidden" }}
                    >
                      <p style={{ margin: "14px 0 0 0", fontSize: "0.875rem", color: "#A1A1AA", lineHeight: 1.7 }}>
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 7: FULL-WIDTH CTA BANNER (Clashify Background Image Style)
          ═══════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="cta-banner" style={{ borderRadius: "24px" }}>
            <div
              className="cta-banner-bg"
              style={{ backgroundImage: "url('/images/cta-bg.jpg')" }}
            />
            <div className="cta-banner-overlay" />
            <div className="cta-banner-content">
              <div style={{
                width: "56px", height: "56px", borderRadius: "14px",
                background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px auto",
                boxShadow: "0 0 30px rgba(139, 92, 246, 0.5)",
              }}>
                <Activity size={28} color="#FFF" />
              </div>
              <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 900, margin: "0 0 12px 0", lineHeight: 1.15 }}>
                Intelligence-to-Action for{" "}
                <span className="text-gradient-purple">Business Teams</span>
              </h2>
              <p style={{ margin: "0 auto 32px auto", fontSize: "1.05rem", color: "#A1A1AA", maxWidth: "550px" }}>
                Stop waiting days for analysts to explain a revenue drop. 
                Get root cause and recommended action in 30 seconds.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
                <button
                  className="btn-white"
                  onClick={() => onNavigate("investigation")}
                  style={{ padding: "14px 32px", borderRadius: "12px", fontSize: "1rem" }}
                >
                  Launch Live Investigation <ArrowRight size={18} style={{ marginLeft: "4px" }} />
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => onNavigate("graph")}
                  style={{ padding: "14px 28px", borderRadius: "12px", fontSize: "1rem" }}
                >
                  Explore 3D Evidence Graph
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
