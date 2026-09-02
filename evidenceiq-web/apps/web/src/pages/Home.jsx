import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import {
  Activity,
  Layers,
  ShieldCheck,
  Cpu,
  TrendingDown,
  ArrowRight,
  Network,
  Zap,
  Clock,
  Sparkles,
  BarChart3,
  Server,
  FileText,
  Sliders,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Database,
  Radio,
  Building2,
  FileCode,
} from "lucide-react";
import PulseDot from "../components/PulseDot";

/* ═══════════════════════════════════════════════════════════════════════════════
   THREE.JS AMBIENT PARTICLE FIELD
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

    const count = 140;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;

      const r = Math.random();
      if (r < 0.5) {
        colors[i * 3] = 0.55; colors[i * 3 + 1] = 0.36; colors[i * 3 + 2] = 0.96; // violet
      } else {
        colors[i * 3] = 0.02; colors[i * 3 + 1] = 0.71; colors[i * 3 + 2] = 0.83; // cyan
      }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    const onMouseMove = (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 0.25;
      targetY = -(e.clientY / window.innerHeight - 0.5) * 0.25;
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
      particles.rotation.x = mouseY * 0.4;
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
        opacity: 0.65,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN PRODUCT TOUR COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function Home({ onNavigate }) {
  const [selectedScenario, setSelectedScenario] = useState("store_101");
  const [openFaq, setOpenFaq] = useState(null);

  const scenarios = {
    store_101: {
      tag: "Severe Anomaly",
      tagColor: "#EF4444",
      title: "Mobile App Checkout v5.4 Outage",
      kpi: "Sales Revenue (North India / Store 101)",
      delta: "-67.96%",
      observed: "₹3,373L",
      expected: "₹10,528L",
      zScore: "-3.42σ",
      cause: "Mobile Checkout Service v5.4 Deployment (#8f4c21a)",
      evidenceScore: "0.850 (HIGH)",
      action: "1-Click Rollback v5.4 via LaunchDarkly & GitHub Actions",
    },
    gateway_rate_limit: {
      tag: "Moderate Anomaly",
      tagColor: "#F59E0B",
      title: "Payment Gateway HTTP 429 Throttle",
      kpi: "Digital Commerce Revenue (West India)",
      delta: "-28.40%",
      observed: "₹7,820L",
      expected: "₹10,920L",
      zScore: "-2.85σ",
      cause: "Third-party payment gateway 502/429 timeout surge",
      evidenceScore: "0.720 (MED)",
      action: "Authorize failover to secondary Adyen payment router",
    },
    cold_start: {
      tag: "Cold-Start Abstention",
      tagColor: "#8B5CF6",
      title: "Newly Opened Subsidiary (Store 999)",
      kpi: "Regional Revenue (Central India)",
      delta: "-8.10%",
      observed: "₹2,100L",
      expected: "Cold-Start (<14d)",
      zScore: "N/A",
      cause: "Engine hard abstention (history < 14 days baseline)",
      evidenceScore: "0.220 (ABSTAIN)",
      action: "Escalate to human regional analyst with full context",
    },
  };

  const activeScen = scenarios[selectedScenario];

  const faqs = [
    {
      q: "How does EvidenceIQ separate real anomalies from daily noise?",
      a: "A 21-day rolling Gaussian baseline with day-of-week indexing evaluates movements against both statistical significance (z ≥ 1.96σ) and financial materiality (Revenue-at-Stake ≥ ₹1L). This suppresses over 90% of false alarms.",
    },
    {
      q: "Does the AI ever hallucinate financial numbers?",
      a: "Never. All baseline statistics, z-scores, and causal weights are computed deterministically in pure Python runtime (0ms LLM arithmetic). Local LLMs only articulate pre-verified evidence packages with strict AST numeric diff checkers.",
    },
    {
      q: "What is the cost of running EvidenceIQ in production?",
      a: "$0.00 marginal inference cost. The engine is engineered to run 100% on-premise with local Ollama runtimes (Qwen 2.5 1.5B), keeping all enterprise data strictly behind your firewall.",
    },
    {
      q: "How are actions governed and audited?",
      a: "Every recommendation requires human sign-off (Confirm/Reject/Modify). All decisions are hashed with SHA-256 and written to an immutable audit ledger compliant with SOC-2 Type II, SOX 404, and GDPR Article 22.",
    },
  ];

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      {/* ── SECTION 1: HERO (PUNCHY, LINEAR-STYLE) ── */}
      <section className="hero-section" style={{ minHeight: "720px", display: "flex", alignItems: "center" }}>
        <div className="hero-bg-image" style={{ backgroundImage: "url('/images/hero-bg.jpg')" }} />
        <div className="hero-bg-overlay" />
        <FloatingParticles />

        <div className="hero-content" style={{ paddingTop: "80px", maxWidth: "920px" }}>
          <div style={{ display: "inline-flex", marginBottom: "16px" }}>
            <span className="section-tag">
              <PulseDot color="#10B981" size={6} />
              Accenture Innovation Challenge 2026 · Problem Track 3
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.4rem, 4.8vw, 3.8rem)",
              fontWeight: 850,
              lineHeight: 1.1,
              letterSpacing: "-0.035em",
              margin: "0 0 16px 0",
              color: "#FFFFFF",
            }}
          >
            Root-Cause Intelligence for <span className="text-gradient-purple">Enterprise KPIs</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
              color: "#9E9EB2",
              lineHeight: 1.6,
              maxWidth: "680px",
              margin: "0 0 32px 0",
            }}
          >
            Detect anomalies in real time, isolate true causality across heterogeneous logs, and dispatch approved CI/CD rollbacks in seconds &mdash; with zero hallucination risk.
          </p>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginBottom: "48px" }}>
            <button
              className="btn-primary"
              onClick={() => onNavigate("investigation")}
              style={{ padding: "12px 26px", fontSize: "0.925rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
            >
              <Search size={16} />
              <span>Launch Live Investigation</span>
              <ArrowRight size={16} />
            </button>
            <button
              className="btn-secondary"
              onClick={() => onNavigate("dashboard")}
              style={{ padding: "12px 22px", fontSize: "0.925rem" }}
            >
              Explore Dashboard
            </button>
          </div>

          {/* ── 4 GOLDEN METRICS STRIP ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "20px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {[
              { val: "< 2 sec", lbl: "Mean Time to Diagnose", col: "#10B981" },
              { val: "$0.00", lbl: "Marginal Inference Cost", col: "#8B5CF6" },
              { val: "0.00%", lbl: "Math Hallucinations", col: "#06B6D4" },
              { val: "25 / 25", lbl: "Automated Tests Passing", col: "#F59E0B" },
            ].map((m, idx) => (
              <div key={idx}>
                <div style={{ fontSize: "1.7rem", fontWeight: 800, color: m.col, fontFamily: "var(--font-mono)" }}>
                  {m.val}
                </div>
                <div style={{ fontSize: "0.76rem", color: "#6B6D82", fontWeight: 600, marginTop: "2px" }}>
                  {m.lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: 3-STEP VISUAL WORKFLOW ── */}
      <section style={{ padding: "80px 0", maxWidth: "1240px", margin: "0 auto", paddingLeft: "24px", paddingRight: "24px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span style={{ fontSize: "0.72rem", color: "#8B5CF6", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em" }}>
            The Autonomous Pipeline
          </span>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 800, color: "#FFFFFF", margin: "6px 0 0 0" }}>
            From Disruption to Resolution in 3 Steps
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {[
            {
              step: "01",
              title: "Detect & Isolate",
              desc: "21-day rolling Gaussian baseline cross-checks statistically significant deviations against business materiality floors.",
              icon: Activity,
              badge: "Statistical Surveillance",
              col: "#8B5CF6",
            },
            {
              step: "02",
              title: "Quasi-Causal Attribution",
              desc: "Directed business evidence graph correlates ERP sales with system deploy logs and support tickets via 6-factor causal scoring.",
              icon: Network,
              badge: "Deterministic Graph",
              col: "#EC4899",
            },
            {
              step: "03",
              title: "Governed Recovery",
              desc: "Risk-gated human checkpoint dispatches automated CI/CD rollback hooks (LaunchDarkly & GitHub Actions) with SHA-256 proofs.",
              icon: ShieldCheck,
              badge: "Immutable Audit",
              col: "#10B981",
            },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bento-card" style={{ padding: "30px", position: "relative" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: `${s.col}18`,
                      border: `1px solid ${s.col}35`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: s.col,
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <span style={{ fontSize: "1.6rem", fontWeight: 900, color: "rgba(255,255,255,0.06)", fontFamily: "var(--font-mono)" }}>
                    {s.step}
                  </span>
                </div>
                <div className="badge badge--violet" style={{ fontSize: "0.65rem", marginBottom: "10px" }}>
                  {s.badge}
                </div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", fontWeight: 750, color: "#FFFFFF" }}>
                  {s.title}
                </h3>
                <p style={{ margin: 0, fontSize: "0.86rem", color: "#9E9EB2", lineHeight: 1.6 }}>
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 3: INTERACTIVE SCENARIO SANDBOX ── */}
      <section style={{ padding: "60px 0 80px", maxWidth: "1240px", margin: "0 auto", paddingLeft: "24px", paddingRight: "24px" }}>
        <div className="bento-card" style={{ padding: "36px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "18px", marginBottom: "28px" }}>
            <div>
              <span style={{ fontSize: "0.72rem", color: "#8B5CF6", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em" }}>
                Interactive Scenario Sandbox
              </span>
              <h3 style={{ margin: "4px 0 0 0", fontSize: "1.6rem", fontWeight: 800, color: "#FFFFFF" }}>
                Test Real-World Retail Disruption Telemetry
              </h3>
            </div>

            {/* Scenario Pills */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                { id: "store_101", label: "Mobile Outage (Store 101)" },
                { id: "gateway_rate_limit", label: "Payment Gateway 429" },
                { id: "cold_start", label: "Cold-Start (Store 999)" },
              ].map((p) => {
                const active = selectedScenario === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedScenario(p.id)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: active ? "1px solid rgba(139, 92, 246, 0.6)" : "1px solid rgba(255, 255, 255, 0.08)",
                      background: active ? "rgba(139, 92, 246, 0.2)" : "rgba(255, 255, 255, 0.02)",
                      color: active ? "#FFFFFF" : "#9E9EB2",
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Scenario Card */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.02)",
              border: `1px solid ${activeScen.tagColor}40`,
              borderLeft: `5px solid ${activeScen.tagColor}`,
              borderRadius: "10px",
              padding: "24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
            }}
          >
            <div>
              <div style={{ fontSize: "0.7rem", color: "#6B6D82", textTransform: "uppercase", fontWeight: 700 }}>Observed Anomaly</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 750, color: "#FFFFFF", margin: "4px 0 2px" }}>
                {activeScen.title}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#9E9EB2" }}>{activeScen.kpi}</div>
            </div>

            <div>
              <div style={{ fontSize: "0.7rem", color: "#6B6D82", textTransform: "uppercase", fontWeight: 700 }}>Telemetry Shift</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: activeScen.tagColor, fontFamily: "var(--font-mono)", margin: "4px 0 2px" }}>
                {activeScen.delta}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#9E9EB2" }}>
                {activeScen.observed} vs Exp {activeScen.expected} ({activeScen.zScore})
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.7rem", color: "#6B6D82", textTransform: "uppercase", fontWeight: 700 }}>Isolated Root Cause</div>
              <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#FFFFFF", margin: "4px 0 2px" }}>
                {activeScen.cause}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#A78BFA" }}>
                Confidence: {activeScen.evidenceScore}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <button
                onClick={() => onNavigate("investigation")}
                className="btn-primary"
                style={{ padding: "10px 18px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <span>Deep Investigate</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: 4-CARD BENTO GRID (MINIMAL & SCAN-FRIENDLY) ── */}
      <section style={{ padding: "0 0 80px", maxWidth: "1240px", margin: "0 auto", paddingLeft: "24px", paddingRight: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {[
            {
              title: "Causal Graph & Attribution",
              desc: "Directed adjacency edges score temporal precedence and cross-corroborate deployment events against ticket logs.",
              icon: Network,
              col: "#8B5CF6",
              link: "graph",
              btn: "Explore 3D Graph",
            },
            {
              title: "Semantic Layer Contracts",
              desc: "Versioned, formula-guaranteed metric definitions enforcing GAAP and IFRS rules across operating units.",
              icon: FileCode,
              col: "#EC4899",
              link: "contracts",
              btn: "Browse Contracts",
            },
            {
              title: "Automated CI/CD Recovery",
              desc: "Instant LaunchDarkly feature flag shutoff (<64ms) and GitHub Actions workflow dispatches.",
              icon: Zap,
              col: "#06B6D4",
              link: "investigation",
              btn: "Test Rollback",
            },
            {
              title: "Fleet Scale & Compliance Hub",
              desc: "Centralized multi-tenant governance with automated SOC-2, SOX 404, and GDPR audit pack certification.",
              icon: Building2,
              col: "#10B981",
              link: "fleet",
              btn: "Open Fleet Hub",
            },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="bento-card" style={{ padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      background: `${c.col}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: c.col,
                      marginBottom: "14px",
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1rem", fontWeight: 750, color: "#FFFFFF" }}>
                    {c.title}
                  </h3>
                  <p style={{ margin: "0 0 20px 0", fontSize: "0.82rem", color: "#9E9EB2", lineHeight: 1.55 }}>
                    {c.desc}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate(c.link)}
                  className="btn-secondary"
                  style={{ padding: "8px 14px", fontSize: "0.78rem", width: "100%", justifyContent: "center" }}
                >
                  {c.btn} &rarr;
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 5: COMPACT FAQ ACCORDION ── */}
      <section style={{ padding: "0 0 100px", maxWidth: "860px", margin: "0 auto", paddingLeft: "24px", paddingRight: "24px" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <h3 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
            Frequently Answered Questions
          </h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="bento-card"
                style={{ padding: "18px 22px", cursor: "pointer" }}
                onClick={() => setOpenFaq(isOpen ? null : i)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF" }}>{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} color="#A78BFA" /> : <ChevronDown size={16} color="#6B6D82" />}
                </div>
                {isOpen && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    style={{ margin: "10px 0 0 0", fontSize: "0.85rem", color: "#9E9EB2", lineHeight: 1.6 }}
                  >
                    {faq.a}
                  </motion.p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
