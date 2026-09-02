import React, { useState, useEffect, useRef } from "react";
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
  Globe,
  Bell,
  Settings,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  User,
  Sliders,
  Check,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Building2,
  Clock,
  ExternalLink,
} from "lucide-react";

import { ToastProvider, useToast } from "./components/ToastContext";
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
import FleetScalePage from "./pages/FleetScalePage";
import GlobalCopilot from "./components/GlobalCopilot";

const socket = io("http://localhost:3001");

const PAGE_METADATA = {
  home: { category: "Overview", title: "Product Tour" },
  dashboard: { category: "Surveillance", title: "Intelligence Dashboard" },
  scanner: { category: "Surveillance", title: "Gaussian Anomaly Scanner" },
  investigation: { category: "Surveillance", title: "Incident Investigation Center" },
  graph: { category: "Causal Intelligence", title: "3D Evidence Graph" },
  memory: { category: "Causal Intelligence", title: "Decision Memory & RL" },
  connectors: { category: "Causal Intelligence", title: "Enterprise Connectors Hub" },
  fleet: { category: "Enterprise Governance", title: "Fleet Scale & Compliance" },
  contracts: { category: "Enterprise Governance", title: "Semantic Contracts Marketplace" },
  architecture: { category: "Specifications", title: "System Architecture" },
  proposal: { category: "Specifications", title: "Executive Business Proposal" },
};

const BUSINESS_UNITS = [
  { id: "bu:north_america_retail", name: "North America Retail", std: "GAAP", rev: "$1.42B", stores: "480 Stores" },
  { id: "bu:emea_ecommerce", name: "EMEA E-Commerce", std: "IFRS", rev: "€890M", stores: "Digital Pure-Play" },
  { id: "bu:apac_supply_chain", name: "APAC Supply Chain", std: "IFRS-15", rev: "¥12.4B", stores: "32 Distribution Hubs" },
  { id: "bu:latam_fintech", name: "LATAM FinTech", std: "BACEN", rev: "R$340M", stores: "Digital POS & Gateway" },
  { id: "bu:india_quickcommerce", name: "India QuickCommerce", std: "Ind AS", rev: "₹2,400 Cr", stores: "140 Dark Stores" },
];

function AppContent() {
  const { addToast } = useToast();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [investigateParams, setInvestigateParams] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [persona, setPersona] = useState("analyst");
  const [businessUnit, setBusinessUnit] = useState("bu:north_america_retail");

  // Dropdowns and Modals state
  const [buDropdownOpen, setBuDropdownOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(4);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const buDropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (buDropdownRef.current && !buDropdownRef.current.contains(e.target)) {
        setBuDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
        setNotificationsOpen(false);
        setBuDropdownOpen(false);
        setSettingsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    document.title = `${PAGE_METADATA[currentPage]?.title || "Dashboard"} — EvidenceIQ.ai`;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentPage]);

  useEffect(() => {
    socket.on("telemetry:update", (data) => setTelemetry(data));
    return () => socket.off("telemetry:update");
  }, []);

  const handleInvestigateSlice = (params) => {
    setInvestigateParams(params);
    setCurrentPage("investigation");
  };

  const handleSelectBusinessUnit = (bu) => {
    setBusinessUnit(bu.id);
    setBuDropdownOpen(false);
    addToast(`Switched active fleet tenant to ${bu.name} (${bu.std} sandbox)`, "success");
  };

  const handleTogglePersona = (newPersona) => {
    setPersona(newPersona);
    addToast(
      newPersona === "executive"
        ? "Switched viewpoint to Executive Sponsor (High-level financial materiality)"
        : "Switched viewpoint to Operations / BI Analyst (Raw telemetry & commit lineage)",
      "info"
    );
  };

  const navGroups = [
    {
      group: "Surveillance & Triage",
      items: [
        { id: "dashboard", label: "Dashboard", icon: BarChart3, badge: "Live" },
        { id: "scanner", label: "Anomaly Scanner", icon: Radar, badge: "3 New" },
        { id: "investigation", label: "Investigation Center", icon: Search },
      ],
    },
    {
      group: "Causal Intelligence",
      items: [
        { id: "graph", label: "Evidence Graph 3D", icon: Network },
        { id: "memory", label: "Decision Memory & RL", icon: Scale },
        { id: "connectors", label: "Connectors Hub", icon: Database, badge: "6 Active" },
      ],
    },
    {
      group: "Enterprise Fleet & Governance",
      items: [
        { id: "fleet", label: "Fleet Scale & Units", icon: Globe, badge: "SOC-2" },
        { id: "contracts", label: "Semantic Contracts", icon: FileCode },
      ],
    },
    {
      group: "Documentation & Specs",
      items: [
        { id: "home", label: "Product Tour", icon: HomeIcon },
        { id: "architecture", label: "System Architecture", icon: Layers },
        { id: "proposal", label: "Business Proposal", icon: FileText },
      ],
    },
  ];

  // Search items in Command Palette
  const searchCommands = [
    { title: "Dashboard", subtitle: "Executive KPIs, Revenue Baseline & Fleet Activity", page: "dashboard", icon: BarChart3, cat: "Navigation" },
    { title: "Investigation Center", subtitle: "Root-cause diagnostics, Golden Signals & Copilot", page: "investigation", icon: Search, cat: "Navigation" },
    { title: "Anomaly Scanner", subtitle: "2D Gaussian Z-Score Variance Matrix across stores", page: "scanner", icon: Radar, cat: "Navigation" },
    { title: "Incident: Store 101 Mobile Outage", subtitle: "Region A, North India · -67.96% Revenue Drop (Checkout v5.4)", page: "investigation", params: { region: "Region_A", channel: "StoreType_A", as_of_date: "2026-08-15" }, icon: AlertTriangle, cat: "Anomalies" },
    { title: "Incident: Payment Gateway 429 Throttle", subtitle: "Region B, West India · -28.40% Revenue Drop (HTTP 429)", page: "investigation", params: { region: "Region_B", channel: "StoreType_B", as_of_date: "2026-08-15" }, icon: AlertTriangle, cat: "Anomalies" },
    { title: "Evidence Graph 3D", subtitle: "Force-directed causal graph with PRECEDES & CORROBORATES edges", page: "graph", icon: Network, cat: "Intelligence" },
    { title: "Decision Memory & RL", subtitle: "Cryptographic SHA-256 ledger and Bayesian prior weights", page: "memory", icon: Scale, cat: "Intelligence" },
    { title: "Connectors Hub", subtitle: "Snowflake, BigQuery, Databricks, PostgreSQL, Kafka, Jira", page: "connectors", icon: Database, cat: "Integrations" },
    { title: "Fleet Scale & Multi-Tenant Hub", subtitle: "Federated tenant isolation & SOC-2 / SOX 404 audit packs", page: "fleet", icon: Globe, cat: "Enterprise" },
    { title: "Semantic Contracts Marketplace", subtitle: "GAAP & IFRS standardized metric definitions", page: "contracts", icon: FileCode, cat: "Governance" },
    { title: "System Architecture", subtitle: "Interactive 4-layer system blueprint & data flow", page: "architecture", icon: Layers, cat: "Docs" },
    { title: "Business Proposal", subtitle: "Executive pitch deck, $2.78M ROI model & Accenture submission", page: "proposal", icon: FileText, cat: "Docs" },
  ];

  const filteredCommands = commandQuery.trim() === ""
    ? searchCommands
    : searchCommands.filter(
        (c) =>
          c.title.toLowerCase().includes(commandQuery.toLowerCase()) ||
          c.subtitle.toLowerCase().includes(commandQuery.toLowerCase()) ||
          c.cat.toLowerCase().includes(commandQuery.toLowerCase())
      );

  const notifications = [
    {
      id: "notif_1",
      title: "Critical Anomaly Detected",
      desc: "Region A / StoreType A revenue dropped -67.96% (z = -3.42σ). Immediate triage recommended.",
      time: "12m ago",
      icon: AlertTriangle,
      color: "#EF4444",
      action: () => {
        handleInvestigateSlice({ region: "Region_A", channel: "StoreType_A", as_of_date: "2026-08-15" });
        setNotificationsOpen(false);
      },
      actionText: "Investigate Slice",
    },
    {
      id: "notif_2",
      title: "Automated CI/CD Rollback Triggered",
      desc: "LaunchDarkly flag mobile_checkout_v5_4 switched OFF in 64ms. GitHub Actions dispatching patch.",
      time: "25m ago",
      icon: Zap,
      color: "#8B5CF6",
      action: () => {
        setCurrentPage("investigation");
        setNotificationsOpen(false);
      },
      actionText: "View Console",
    },
    {
      id: "notif_3",
      title: "SOC-2 Audit Dossier Certified",
      desc: "SHA-256 cryptographic audit packet generated and signed for Accenture Diamond tenant.",
      time: "1h ago",
      icon: ShieldCheck,
      color: "#10B981",
      action: () => {
        setCurrentPage("fleet");
        setNotificationsOpen(false);
      },
      actionText: "Open Fleet Hub",
    },
    {
      id: "notif_4",
      title: "Cold-Start Baseline Warning",
      desc: "Store 999 has < 14 days historical observations. Automated recommendations abstained.",
      time: "3h ago",
      icon: Clock,
      color: "#F59E0B",
      action: () => {
        setCurrentPage("dashboard");
        setNotificationsOpen(false);
      },
      actionText: "Review Status",
    },
  ];

  const currentBuObj = BUSINESS_UNITS.find((b) => b.id === businessUnit) || BUSINESS_UNITS[0];

  return (
    <div className="app-shell">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* BIZZARK FIXED CATEGORIZED SIDEBAR                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <aside className={`bizzark-sidebar ${mobileSidebarOpen ? "mobile-open" : ""}`}>
        {/* Brand Header */}
        <div className="bizzark-brand">
          <div
            style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
            onClick={() => setCurrentPage("dashboard")}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 14px rgba(139, 92, 246, 0.45)",
              }}
            >
              <Activity size={16} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
              EvidenceIQ<span style={{ color: "#A78BFA" }}>.ai</span>
            </span>
          </div>

          <button
            onClick={() => setMobileSidebarOpen(false)}
            style={{ display: "none", background: "none", border: "none", color: "#6B7280", cursor: "pointer" }}
            className="mobile-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Interactive Business Unit Selector Pill */}
        <div style={{ padding: "14px 20px 8px", position: "relative" }} ref={buDropdownRef}>
          <div
            onClick={() => setBuDropdownOpen(!buDropdownOpen)}
            style={{
              background: buDropdownOpen ? "rgba(139, 92, 246, 0.15)" : "rgba(255, 255, 255, 0.03)",
              border: buDropdownOpen ? "1px solid #8B5CF6" : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "all 140ms ease",
            }}
          >
            <div>
              <div style={{ fontSize: "0.65rem", color: "#6B7280", textTransform: "uppercase", fontWeight: 700 }}>
                Active Business Unit
              </div>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF", marginTop: "1px" }}>
                {currentBuObj.name}
              </div>
            </div>
            <ChevronDown size={14} color="#A1A1AA" style={{ transform: buDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 140ms" }} />
          </div>

          {/* Interactive BU Dropdown Menu */}
          <AnimatePresence>
            {buDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "20px",
                  right: "20px",
                  background: "#161B2E",
                  border: "1px solid rgba(255, 255, 255, 0.14)",
                  borderRadius: "10px",
                  padding: "6px",
                  zIndex: 300,
                  boxShadow: "0 14px 30px rgba(0,0,0,0.65)",
                }}
              >
                <div style={{ fontSize: "0.65rem", color: "#6B7280", fontWeight: 700, textTransform: "uppercase", padding: "6px 8px 4px" }}>
                  Switch Federated Tenant
                </div>
                {BUSINESS_UNITS.map((bu) => {
                  const isSelected = businessUnit === bu.id;
                  return (
                    <div
                      key={bu.id}
                      onClick={() => handleSelectBusinessUnit(bu)}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        background: isSelected ? "rgba(139, 92, 246, 0.2)" : "transparent",
                        border: isSelected ? "1px solid rgba(139, 92, 246, 0.4)" : "1px solid transparent",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "3px",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: isSelected ? "#FFFFFF" : "#E2E8F0" }}>
                          {bu.name}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "#6B7280" }}>
                          {bu.std} &bull; {bu.rev} &bull; {bu.stores}
                        </div>
                      </div>
                      {isSelected && <Check size={14} color="#8B5CF6" />}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Categorized Navigation Groups */}
        <div style={{ flex: 1, paddingBottom: "20px" }}>
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <div className="bizzark-nav-category">{group.group}</div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`bizzark-nav-link ${isActive ? "active" : ""}`}
                  >
                    <div className="icon-box">
                      <Icon size={15} />
                    </div>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                          background: isActive ? "rgba(255, 255, 255, 0.2)" : "rgba(139, 92, 246, 0.15)",
                          color: isActive ? "#FFFFFF" : "#C4B5FD",
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Health Progress Bar & Operator Info */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            background: "rgba(0, 0, 0, 0.2)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "6px" }}>
            <span style={{ color: "#6B7280", fontWeight: 600 }}>Fleet Health</span>
            <span style={{ color: "#10B981", fontWeight: 700, fontFamily: "var(--font-mono)" }}>98.4%</span>
          </div>
          <div style={{ height: "4px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "2px", overflow: "hidden", marginBottom: "12px" }}>
            <div style={{ width: "98.4%", height: "100%", background: "#10B981", borderRadius: "2px" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "rgba(139, 92, 246, 0.2)",
                color: "#C4B5FD",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              AD
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                Accenture Diamond
              </div>
              <div style={{ fontSize: "0.68rem", color: "#6B7280" }}>Lead Operations Analyst</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MAIN WRAPPER (TOPBAR + CONTENT CANVAS)                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bizzark-main-wrap">
        {/* Topbar */}
        <header className="bizzark-topbar">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              style={{
                display: "none",
                background: "transparent",
                border: "none",
                color: "#FFFFFF",
                cursor: "pointer",
              }}
              className="mobile-hamburger-btn"
            >
              <Menu size={20} />
            </button>

            <div className="bizzark-breadcrumb">
              <span>EvidenceIQ</span>
              <span>/</span>
              <span>{PAGE_METADATA[currentPage]?.category || "Surveillance"}</span>
              <span>/</span>
              <span className="current">{PAGE_METADATA[currentPage]?.title || "Dashboard"}</span>
            </div>
          </div>

          {/* Right: Search, Persona Toggle, Notification Bell & User */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            {/* Global Search Input (Click opens Command Palette) */}
            <div
              onClick={() => setCommandPaletteOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "6px 12px",
                width: "250px",
                cursor: "pointer",
              }}
            >
              <Search size={14} color="#6B7280" />
              <span style={{ color: "#6B7280", fontSize: "0.78rem", userSelect: "none" }}>
                Search metrics, events... <kbd style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: "4px", fontSize: "0.68rem" }}>Ctrl+K</kbd>
              </span>
            </div>

            {/* Persona Switcher */}
            <div
              style={{
                display: "flex",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "8px",
                padding: "2px",
              }}
            >
              <button
                onClick={() => handleTogglePersona("analyst")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: persona === "analyst" ? "#8B5CF6" : "transparent",
                  color: persona === "analyst" ? "#FFFFFF" : "#9E9EB2",
                  transition: "all 120ms ease",
                }}
              >
                Analyst
              </button>
              <button
                onClick={() => handleTogglePersona("executive")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: persona === "executive" ? "#8B5CF6" : "transparent",
                  color: persona === "executive" ? "#FFFFFF" : "#9E9EB2",
                  transition: "all 120ms ease",
                }}
              >
                Executive
              </button>
            </div>

            {/* Notifications Bell */}
            <div style={{ position: "relative" }} ref={notificationsRef}>
              {/* Topbar Copilot Button */}
              <button
                onClick={() => setCopilotOpen(!copilotOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: copilotOpen ? "#8B5CF6" : "rgba(139, 92, 246, 0.15)",
                  color: copilotOpen ? "#FFFFFF" : "#C4B5FD",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: "8px",
                  padding: "7px 12px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 140ms ease",
                }}
              >
                <Sparkles size={14} />
                <span>AI Copilot</span>
              </button>

              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: notificationsOpen ? "rgba(139, 92, 246, 0.2)" : "rgba(255, 255, 255, 0.04)",
                  border: notificationsOpen ? "1px solid #8B5CF6" : "1px solid rgba(255, 255, 255, 0.08)",
                  color: notificationsOpen ? "#FFFFFF" : "#A1A1AA",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 140ms ease",
                }}
              >
                <Bell size={16} />
                {unreadAlertsCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#EF4444",
                      boxShadow: "0 0 6px #EF4444",
                    }}
                  />
                )}
              </button>

              {/* Notifications Popover Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    style={{
                      position: "absolute",
                      top: "44px",
                      right: 0,
                      width: "360px",
                      background: "#161B2E",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                      borderRadius: "12px",
                      boxShadow: "0 16px 40px rgba(0,0,0,0.65)",
                      zIndex: 350,
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255, 255, 255, 0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 750, color: "#FFFFFF" }}>System & Incident Alerts</span>
                        {unreadAlertsCount > 0 && (
                          <span className="badge badge--danger" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>
                            {unreadAlertsCount} unread
                          </span>
                        )}
                      </div>
                      {unreadAlertsCount > 0 && (
                        <button
                          onClick={() => {
                            setUnreadAlertsCount(0);
                            addToast("All alerts marked as read", "info");
                          }}
                          style={{ background: "none", border: "none", color: "#8B5CF6", fontSize: "0.72rem", cursor: "pointer", fontWeight: 600 }}
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: "340px", overflowY: "auto", padding: "6px" }}>
                      {notifications.map((n) => {
                        const Icon = n.icon;
                        return (
                          <div
                            key={n.id}
                            style={{
                              padding: "10px",
                              borderRadius: "8px",
                              background: "rgba(255, 255, 255, 0.02)",
                              border: "1px solid rgba(255, 255, 255, 0.04)",
                              marginBottom: "6px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "6px",
                                  background: `${n.color}20`,
                                  color: n.color,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  marginTop: "2px",
                                }}
                              >
                                <Icon size={14} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#FFFFFF" }}>{n.title}</span>
                                  <span style={{ fontSize: "0.68rem", color: "#6B7280" }}>{n.time}</span>
                                </div>
                                <p style={{ margin: "3px 0 8px", fontSize: "0.75rem", color: "#9E9EB2", lineHeight: 1.45 }}>
                                  {n.desc}
                                </p>
                                <button
                                  onClick={n.action}
                                  className="btn-primary"
                                  style={{ padding: "4px 10px", fontSize: "0.72rem", borderRadius: "5px" }}
                                >
                                  {n.actionText} &rarr;
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main Content View with Smooth Page Transitions */}
        <main style={{ flex: 1, padding: "24px 28px 100px", minWidth: 0 }}>
          <AnimatePresence mode="wait">
            {currentPage === "home" && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Home onNavigate={(p) => setCurrentPage(p)} />
              </motion.div>
            )}
            {currentPage === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Dashboard
                  onNavigateToInvestigate={handleInvestigateSlice}
                  onNavigate={(p) => setCurrentPage(p)}
                  globalPersona={persona}
                />
              </motion.div>
            )}
            {currentPage === "investigation" && (
              <motion.div key="investigation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Investigation initialParams={investigateParams} globalPersona={persona} />
              </motion.div>
            )}
            {currentPage === "scanner" && (
              <motion.div key="scanner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AnomalyScanner onInvestigateSlice={handleInvestigateSlice} />
              </motion.div>
            )}
            {currentPage === "graph" && (
              <motion.div key="graph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <EvidenceGraphPage />
              </motion.div>
            )}
            {currentPage === "connectors" && (
              <motion.div key="connectors" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ConnectorsPage />
              </motion.div>
            )}
            {currentPage === "fleet" && (
              <motion.div key="fleet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FleetScalePage />
              </motion.div>
            )}
            {currentPage === "contracts" && (
              <motion.div key="contracts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Contracts globalPersona={persona} />
              </motion.div>
            )}
            {currentPage === "memory" && (
              <motion.div key="memory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <DecisionMemoryPage />
              </motion.div>
            )}
            {currentPage === "architecture" && (
              <motion.div key="architecture" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Architecture />
              </motion.div>
            )}
            {currentPage === "proposal" && (
              <motion.div key="proposal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Proposal />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* COMMAND PALETTE MODAL (CTRL+K)                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(6px)",
              zIndex: 500,
              display: "flex",
              justifyContent: "center",
              paddingTop: "120px",
            }}
            onClick={() => setCommandPaletteOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              style={{
                width: "580px",
                maxHeight: "460px",
                background: "#121727",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "14px",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Bar Input */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <Search size={18} color="#8B5CF6" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search pages, metrics, anomalies, or commands..."
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#FFFFFF",
                    fontSize: "0.95rem",
                  }}
                />
                <kbd style={{ background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.7rem", color: "#9E9EB2" }}>ESC</kbd>
              </div>

              {/* Suggestions List */}
              <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
                {filteredCommands.length === 0 ? (
                  <div style={{ padding: "32px", textAlign: "center", color: "#6B7280", fontSize: "0.85rem" }}>
                    No matching results found for "{commandQuery}"
                  </div>
                ) : (
                  filteredCommands.map((cmd, idx) => {
                    const Icon = cmd.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (cmd.params) {
                            handleInvestigateSlice(cmd.params);
                          } else {
                            setCurrentPage(cmd.page);
                          }
                          setCommandPaletteOpen(false);
                          setCommandQuery("");
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          transition: "all 120ms ease",
                          marginBottom: "2px",
                        }}
                        className="toc-nav-item"
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "6px",
                            background: "rgba(139, 92, 246, 0.15)",
                            color: "#8B5CF6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FFFFFF" }}>{cmd.title}</div>
                          <div style={{ fontSize: "0.72rem", color: "#9E9EB2", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                            {cmd.subtitle}
                          </div>
                        </div>
                        <span style={{ fontSize: "0.65rem", color: "#6B7280", background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: "4px" }}>
                          {cmd.cat}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* FLOATING SETTINGS GEAR BUTTON (MATCHING BIZZARK REFERENCE)           */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <button
        className="floating-gear-btn"
        onClick={() => setSettingsOpen(!settingsOpen)}
        title="System Preferences & Customization"
      >
        <Settings size={20} />
      </button>

      {/* Settings Drawer Modal */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            style={{
              position: "fixed",
              bottom: "84px",
              right: "28px",
              width: "320px",
              background: "#161B2E",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "14px",
              padding: "20px",
              boxShadow: "0 16px 40px rgba(0,0,0,0.6)",
              zIndex: 200,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sliders size={16} color="#8B5CF6" />
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF" }}>Dashboard Preferences</span>
              </div>
              <button
                onClick={() => setSettingsOpen(false)}
                style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer" }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>
              Active Subsidiary Unit
            </div>
            <select
              value={businessUnit}
              onChange={(e) => {
                const found = BUSINESS_UNITS.find((b) => b.id === e.target.value);
                if (found) handleSelectBusinessUnit(found);
              }}
              style={{
                width: "100%",
                padding: "8px 10px",
                borderRadius: "6px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "0.82rem",
                marginBottom: "16px",
              }}
            >
              {BUSINESS_UNITS.map((bu) => (
                <option key={bu.id} value={bu.id} style={{ background: "#12141F" }}>
                  {bu.name} ({bu.std})
                </option>
              ))}
            </select>

            <div style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>
              Perspective Mode
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <button
                onClick={() => handleTogglePersona("analyst")}
                className={persona === "analyst" ? "btn-primary" : "btn-secondary"}
                style={{ flex: 1, padding: "8px", fontSize: "0.78rem", justifyContent: "center" }}
              >
                Operations Analyst
              </button>
              <button
                onClick={() => handleTogglePersona("executive")}
                className={persona === "executive" ? "btn-primary" : "btn-secondary"}
                style={{ flex: 1, padding: "8px", fontSize: "0.78rem", justifyContent: "center" }}
              >
                Executive Sponsor
              </button>
            </div>

            <div style={{ fontSize: "0.75rem", color: "#6B7280", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>
              Theme Preset
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => {
                  setTheme("light");
                  addToast("Switched to Light Professional Enterprise theme", "success");
                }}
                className={theme === "light" ? "btn-primary" : "btn-secondary"}
                style={{ flex: 1, padding: "8px", fontSize: "0.78rem", justifyContent: "center" }}
              >
                Light Enterprise
              </button>
              <button
                onClick={() => {
                  setTheme("dark");
                  addToast("Switched to Obsidian Dark theme", "info");
                }}
                className={theme === "dark" ? "btn-primary" : "btn-secondary"}
                style={{ flex: 1, padding: "8px", fontSize: "0.78rem", justifyContent: "center" }}
              >
                Obsidian Dark
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── GLOBAL AI COPILOT (AVAILABLE ON EVERY SINGLE PAGE) ── */}
      <GlobalCopilot
        currentPage={currentPage}
        persona={persona}
        isOpen={copilotOpen}
        onToggle={() => setCopilotOpen(!copilotOpen)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
