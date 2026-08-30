import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import {
  Home as HomeIcon,
  BarChart3,
  Search,
  Radar,
  Network,
  Scale,
  FileCode,
  Layers,
  FileText,
  Activity,
  ArrowRight,
  ChevronDown,
  Database,
} from "lucide-react";

import { ToastProvider } from "./components/ToastContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Investigation from "./pages/Investigation";
import AnomalyScanner from "./pages/AnomalyScanner";
import EvidenceGraphPage from "./pages/EvidenceGraphPage";
import DecisionMemoryPage from "./pages/DecisionMemoryPage";
import Contracts from "./pages/Contracts";
import Architecture from "./pages/Architecture";
import Proposal from "./pages/Proposal";
import ConnectorsPage from "./pages/ConnectorsPage";

const socket = io("http://localhost:3001");

const PAGE_TITLES = {
  home:         "EvidenceIQ.ai — KPI Intelligence Engine",
  dashboard:    "Dashboard — EvidenceIQ.ai",
  investigation:"Investigation Engine — EvidenceIQ.ai",
  scanner:      "Anomaly Scanner — EvidenceIQ.ai",
  graph:        "Evidence Graph — EvidenceIQ.ai",
  connectors:   "Enterprise Connectors — EvidenceIQ.ai",
  contracts:    "Semantic Contracts — EvidenceIQ.ai",
  memory:       "Decision Memory — EvidenceIQ.ai",
  architecture: "Architecture — EvidenceIQ.ai",
  proposal:     "Business Proposal — EvidenceIQ.ai",
};

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } },
};

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [investigateParams, setInvestigateParams] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  useEffect(() => {
    document.title = PAGE_TITLES[currentPage] || "EvidenceIQ.ai";
  }, [currentPage]);

  useEffect(() => {
    socket.on("telemetry:update", (data) => setTelemetry(data));
    return () => socket.off("telemetry:update");
  }, []);

  // Track scroll for navbar styling
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInvestigateSlice = (params) => {
    setInvestigateParams(params);
    setCurrentPage("investigation");
  };

  const primaryNav = [
    { id: "home",          label: "Home",           icon: HomeIcon  },
    { id: "dashboard",     label: "Dashboard",      icon: BarChart3 },
    { id: "investigation", label: "Investigation",  icon: Search    },
    { id: "scanner",       label: "Scanner",        icon: Radar     },
    { id: "graph",         label: "Evidence Graph",  icon: Network   },
    { id: "connectors",    label: "Connectors Hub", icon: Database  },
  ];

  const moreNav = [
    { id: "contracts",    label: "Semantic Contracts", icon: FileCode },
    { id: "memory",       label: "Decision Memory",    icon: Scale    },
    { id: "architecture", label: "Architecture",       icon: Layers   },
    { id: "proposal",     label: "Business Proposal",  icon: FileText },
  ];

  return (
    <ToastProvider>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--color-bg)",
          color: "var(--color-text)",
          fontFamily: "var(--font-body)",
          position: "relative",
        }}
        className="dot-grid-bg"
      >
        {/* Ambient Background Glow */}
        <div className="aurora-mesh" />
        <div className="aurora-mesh-secondary" />

        {/* ── CLASHIFY-STYLE FLOATING GLASS NAVBAR ── */}
        <header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 200,
            transition: "all 300ms ease",
            background: scrolled ? "rgba(10, 10, 11, 0.88)" : "transparent",
            backdropFilter: scrolled ? "blur(20px) saturate(1.6)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.6)" : "none",
            borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
          }}
        >
          <nav
            style={{
              maxWidth: "1300px",
              margin: "0 auto",
              padding: "14px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
            }}
          >
            {/* Brand Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                flexShrink: 0,
              }}
              onClick={() => setCurrentPage("home")}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 0 18px rgba(139, 92, 246, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Activity size={18} color="#FFFFFF" />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.15rem",
                  fontWeight: 800,
                  color: "#FFFFFF",
                  letterSpacing: "-0.02em",
                }}
              >
                EvidenceIQ<span style={{ color: "#A78BFA" }}>.ai</span>
              </span>
            </div>

            {/* Center Navigation Links */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
              }}
            >
              {primaryNav.map((item) => {
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "investigation") setInvestigateParams(null);
                      setCurrentPage(item.id);
                    }}
                    className="nav-item"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      fontSize: "0.875rem",
                      fontWeight: active ? 600 : 450,
                      borderRadius: "8px",
                      border: "none",
                      background: active ? "rgba(139, 92, 246, 0.12)" : "transparent",
                      color: active ? "#FFFFFF" : "#A1A1AA",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      transition: "all 150ms ease",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.color = "#FFFFFF";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.color = "#A1A1AA";
                    }}
                  >
                    <span className="nav-label">{item.label}</span>
                  </button>
                );
              })}

              {/* More Dropdown */}
              <div style={{ position: "relative" }}>
                {(() => {
                  const isMoreActive = moreNav.some((m) => m.id === currentPage);
                  const activeMoreItem = moreNav.find((m) => m.id === currentPage);
                  return (
                    <button
                      onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 14px",
                        fontSize: "0.875rem",
                        fontWeight: isMoreActive ? 600 : 450,
                        borderRadius: "8px",
                        border: "none",
                        background: isMoreActive || moreMenuOpen ? "rgba(139, 92, 246, 0.14)" : "transparent",
                        color: isMoreActive || moreMenuOpen ? "#FFFFFF" : "#A1A1AA",
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                        transition: "all 150ms ease",
                      }}
                      onMouseEnter={(e) => { if (!isMoreActive && !moreMenuOpen) e.currentTarget.style.color = "#FFFFFF"; }}
                      onMouseLeave={(e) => { if (!isMoreActive && !moreMenuOpen) e.currentTarget.style.color = "#A1A1AA"; }}
                    >
                      <span>{isMoreActive ? activeMoreItem.label : "More"}</span>
                      <ChevronDown size={14} style={{ transform: moreMenuOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 200ms ease" }} />
                    </button>
                  );
                })()}

                {moreMenuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      background: "rgba(17, 17, 20, 0.96)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "12px",
                      padding: "6px",
                      minWidth: "200px",
                      boxShadow: "0 16px 48px -8px rgba(0,0,0,0.6)",
                      zIndex: 300,
                    }}
                  >
                    {moreNav.map((item) => {
                      const Icon = item.icon;
                      const active = currentPage === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setCurrentPage(item.id);
                            setMoreMenuOpen(false);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 14px",
                            fontSize: "0.875rem",
                            fontWeight: active ? 600 : 450,
                            borderRadius: "8px",
                            border: "none",
                            background: active ? "rgba(139, 92, 246, 0.12)" : "transparent",
                            color: active ? "#FFFFFF" : "#A1A1AA",
                            cursor: "pointer",
                            fontFamily: "var(--font-body)",
                            width: "100%",
                            textAlign: "left",
                            transition: "all 120ms ease",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#FFFFFF"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = active ? "rgba(139, 92, 246, 0.12)" : "transparent"; e.currentTarget.style.color = active ? "#FFFFFF" : "#A1A1AA"; }}
                        >
                          <Icon size={16} color={active ? "#A78BFA" : "#71717A"} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Status Pill + CTA */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
              {/* Live Status */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "9999px",
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  fontSize: "0.75rem",
                  color: "#6EE7B7",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }} />
                <span>Online · $0.00</span>
              </div>

              {/* Primary CTA */}
              <button
                onClick={() => {
                  setInvestigateParams({ region: "Region_A", channel: "StoreType_A", as_of_date: "2026-08-15" });
                  setCurrentPage("investigation");
                }}
                className="btn-primary"
                style={{
                  padding: "8px 18px",
                  borderRadius: "9999px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>Run Analysis</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </nav>
        </header>

        {/* Click-away handler for dropdown */}
        {moreMenuOpen && (
          <div
            style={{ position: "fixed", inset: 0, zIndex: 150 }}
            onClick={() => setMoreMenuOpen(false)}
          />
        )}

        {/* ── PAGE CONTENT ── */}
        <main
          style={{
            position: "relative",
            zIndex: 1,
            paddingTop: currentPage === "home" ? "0" : "84px",
            minHeight: "calc(100vh - 180px)",
          }}
        >
          <AnimatePresence mode="wait">
            {currentPage === "home" && (
              <motion.div key="home" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <Home onNavigate={(page) => setCurrentPage(page)} />
              </motion.div>
            )}
            {currentPage === "dashboard" && (
              <motion.div key="dashboard" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <Dashboard onNavigateToInvestigate={() => setCurrentPage("investigation")} />
              </motion.div>
            )}
            {currentPage === "investigation" && (
              <motion.div key="investigation" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <Investigation initialParams={investigateParams} />
              </motion.div>
            )}
            {currentPage === "scanner" && (
              <motion.div key="scanner" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <AnomalyScanner onInvestigateSlice={handleInvestigateSlice} />
              </motion.div>
            )}
            {currentPage === "graph" && (
              <motion.div key="graph" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <EvidenceGraphPage />
              </motion.div>
            )}
            {currentPage === "connectors" && (
              <motion.div key="connectors" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <ConnectorsPage />
              </motion.div>
            )}
            {currentPage === "contracts" && (
              <motion.div key="contracts" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <Contracts />
              </motion.div>
            )}
            {currentPage === "memory" && (
              <motion.div key="memory" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <DecisionMemoryPage onNavigateToInvestigate={() => setCurrentPage("investigation")} />
              </motion.div>
            )}
            {currentPage === "architecture" && (
              <motion.div key="architecture" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <Architecture />
              </motion.div>
            )}
            {currentPage === "proposal" && (
              <motion.div key="proposal" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <Proposal />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ── CLASHIFY FOOTER ── */}
        <footer className="footer">
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "32px", marginBottom: "40px" }}>
              {/* Brand */}
              <div style={{ maxWidth: "300px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Activity size={14} color="#FFF" />
                  </div>
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1rem", color: "#FFF" }}>
                    EvidenceIQ<span style={{ color: "#A78BFA" }}>.ai</span>
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: "0.8125rem", color: "#71717A", lineHeight: 1.6 }}>
                  Built for Accenture Innovation Challenge 2026 · Problem Track 3. 
                  Intelligence-to-Action Engine for KPI Anomaly Diagnosis.
                </p>
              </div>

              {/* Links */}
              <div style={{ display: "flex", gap: "48px", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Platform</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage("dashboard"); }}>Dashboard</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage("investigation"); }}>Investigation Engine</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage("scanner"); }}>Anomaly Scanner</a>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Intelligence</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage("graph"); }}>Evidence Graph</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage("memory"); }}>Decision Memory</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage("contracts"); }}>Semantic Contracts</a>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Resources</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage("architecture"); }}>Architecture</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage("proposal"); }}>Business Proposal</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider + Copyright */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <span style={{ fontSize: "0.78rem", color: "#52525B" }}>
                © 2026 EvidenceIQ.ai — Accenture Innovation Challenge Track 3
              </span>
              <span style={{ fontSize: "0.78rem", color: "#52525B" }}>
                Built with React 18 · FastAPI · Local Ollama · Three.js
              </span>
            </div>
          </div>
        </footer>
      </div>
    </ToastProvider>
  );
}
