import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  ShieldCheck,
  FileCheck,
  Sparkles,
  RefreshCw,
  Plus,
  Radio,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  ChevronRight,
  Sliders,
  Copy,
  Download,
  Building2,
  Tag,
  Palette,
  Check,
  Search,
  Server,
  Activity,
  ArrowRight,
  Database,
} from "lucide-react";
import { useToast } from "../components/ToastContext";

export default function FleetScalePage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("fleet"); // 'fleet' | 'marketplace' | 'compliance' | 'whitelabel'

  // Fleet State
  const [fleetOverview, setFleetOverview] = useState(null);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [loadingFleet, setLoadingFleet] = useState(true);
  const [pingingBu, setPingingBu] = useState(null);
  const [pingResult, setPingResult] = useState(null);
  const [showRegisterBuModal, setShowRegisterBuModal] = useState(false);
  const [newBuForm, setNewBuForm] = useState({
    bu_id: "",
    name: "",
    region: "Europe",
    tier: "Tier 1 (Enterprise)",
  });

  // Marketplace State
  const [marketplaceContracts, setMarketplaceContracts] = useState([]);
  const [selectedSla, setSelectedSla] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [newContractForm, setNewContractForm] = useState({
    metric_id: "metric:customer_ltv",
    title: "Customer Lifetime Value (LTV) Standard",
    publisher_bu: "bu:north_america_retail",
    version: "1.0.0",
    sla_tier: "Mission Critical (99.9%)",
    formula: "Average_Order_Value * Purchase_Frequency * Gross_Margin",
  });

  // Compliance State
  const [auditPacks, setAuditPacks] = useState([]);
  const [generatingPack, setGeneratingPack] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState(null);

  // White-Label State
  const [whitelabelConfig, setWhitelabelConfig] = useState(null);
  const [presets, setPresets] = useState([]);
  const [customBrandForm, setCustomBrandForm] = useState({
    brand_name: "",
    preset_name: "",
    primary_color: "#A100FF",
    secondary_color: "#8B5CF6",
    logo_symbol: ">",
    engagement_code: "",
    custom_domain: "",
  });

  // Load Data on Mount
  useEffect(() => {
    fetchFleetData();
    fetchMarketplaceData();
    fetchComplianceData();
    fetchWhitelabelData();
  }, []);

  const fetchFleetData = async () => {
    setLoadingFleet(true);
    try {
      const res = await fetch("/api/fleet/overview");
      const data = await res.json();
      setFleetOverview(data);
      setBusinessUnits(data.business_units || []);
    } catch (err) {
      console.error("Failed to load fleet overview:", err);
    } finally {
      setLoadingFleet(false);
    }
  };

  const fetchMarketplaceData = async () => {
    try {
      const res = await fetch("/api/marketplace/contracts");
      const data = await res.json();
      setMarketplaceContracts(data.contracts || []);
    } catch (err) {
      console.error("Failed to load marketplace contracts:", err);
    }
  };

  const fetchComplianceData = async () => {
    try {
      const res = await fetch("/api/compliance/audit-packs");
      const data = await res.json();
      setAuditPacks(data.audit_packs || []);
      if (data.audit_packs && data.audit_packs.length > 0 && !selectedDossier) {
        setSelectedDossier(data.audit_packs[0]);
      }
    } catch (err) {
      console.error("Failed to load compliance packs:", err);
    }
  };

  const fetchWhitelabelData = async () => {
    try {
      const [cfgRes, presetsRes] = await Promise.all([
        fetch("/api/whitelabel/config").then((r) => r.json()),
        fetch("/api/whitelabel/presets").then((r) => r.json()),
      ]);
      setWhitelabelConfig(cfgRes);
      setCustomBrandForm(cfgRes);
      setPresets(presetsRes.presets || []);
    } catch (err) {
      console.error("Failed to load white-label data:", err);
    }
  };

  // 1. Fleet Actions
  const handlePingHeartbeat = async (bu_id) => {
    setPingingBu(bu_id);
    try {
      const res = await fetch("/api/fleet/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bu_id }),
      });
      const data = await res.json();
      setPingResult(data);
      addToast(`Heartbeat verified for ${bu_id} (${data.latency_ms}ms, ${data.tls_version})`, "success");
    } catch (err) {
      addToast(`Heartbeat failed: ${err.message}`, "error");
    } finally {
      setPingingBu(null);
    }
  };

  const handleRegisterBu = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/fleet/register-unit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBuForm),
      });
      const data = await res.json();
      addToast(`Registered ${data.name} under Centralized Fleet Governance!`, "success");
      setShowRegisterBuModal(false);
      fetchFleetData();
    } catch (err) {
      addToast(`Registration failed: ${err.message}`, "error");
    }
  };

  // 2. Marketplace Actions
  const handleSubscribeContract = async (contract_id) => {
    try {
      const res = await fetch("/api/marketplace/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_id,
          subscriber_bu: "bu:north_america_retail",
        }),
      });
      const data = await res.json();
      addToast(`Subscribed! New Subscriber Count: ${data.new_subscriber_count}`, "success");
      fetchMarketplaceData();
    } catch (err) {
      addToast(`Subscription failed: ${err.message}`, "error");
    }
  };

  const handlePublishContract = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/marketplace/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metric_id: newContractForm.metric_id,
          title: newContractForm.title,
          publisher_bu: newContractForm.publisher_bu,
          version: newContractForm.version,
          sla_tier: newContractForm.sla_tier,
          contract_schema: {
            formula: newContractForm.formula,
            allowed_dimensions: ["region", "channel"],
            sla_latency_minutes: 30,
            variance_tolerance_pct: 1.0,
            owner: newContractForm.publisher_bu,
          },
        }),
      });
      const data = await res.json();
      addToast(`Published ${data.title} to Cross-Enterprise Marketplace!`, "success");
      setShowPublishModal(false);
      fetchMarketplaceData();
    } catch (err) {
      addToast(`Publish failed: ${err.message}`, "error");
    }
  };

  // 3. Compliance Actions
  const handleGenerateAuditPack = async (standard) => {
    setGeneratingPack(true);
    try {
      const res = await fetch("/api/compliance/generate-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          standard,
          auditor_identity: "Accenture Enterprise AI & Security Audit practice",
        }),
      });
      const data = await res.json();
      addToast(`Generated & Certified ${standard} Compliance Dossier!`, "success");
      fetchComplianceData();
      setSelectedDossier(data);
    } catch (err) {
      addToast(`Audit generation failed: ${err.message}`, "error");
    } finally {
      setGeneratingPack(false);
    }
  };

  // 4. White-Label Actions
  const handleApplyPreset = async (preset) => {
    setCustomBrandForm(preset);
    try {
      const res = await fetch("/api/whitelabel/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preset),
      });
      const data = await res.json();
      setWhitelabelConfig(data);
      addToast(`Applied Preset: ${preset.preset_name}`, "success");
    } catch (err) {
      addToast(`Failed to update branding: ${err.message}`, "error");
    }
  };

  const handleSaveCustomBrand = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/whitelabel/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customBrandForm),
      });
      const data = await res.json();
      setWhitelabelConfig(data);
      addToast("White-Label Enterprise Configuration Updated!", "success");
    } catch (err) {
      addToast(`Save failed: ${err.message}`, "error");
    }
  };

  // Filtered Marketplace Contracts
  const filteredContracts = marketplaceContracts.filter((c) => {
    const matchSla =
      selectedSla === "ALL" ||
      c.sla_tier.toLowerCase().includes(selectedSla.toLowerCase());
    const matchQ =
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.metric_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.publisher_bu.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSla && matchQ;
  });

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
            <Globe size={13} color="#8B5CF6" />
            Phase 4 Enterprise Fleet Operating System
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(1.8rem, 2.8vw, 2.4rem)",
                fontWeight: 800,
                color: "var(--color-text, #0F172A)",
                letterSpacing: "-0.03em",
                fontFamily: "var(--font-heading)",
              }}
            >
              Enterprise Fleet Scale & <span className="text-gradient-purple">Compliance Hub</span>
            </h1>
            <p style={{ margin: "6px 0 0 0", color: "#475569", fontSize: "0.925rem", maxWidth: "880px" }}>
              Federated multi-business-unit governance, cross-enterprise semantic contract marketplace, automated SOC-2/SOX/GDPR regulatory compliance dossiers, and Accenture consulting white-label platform licensing.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <span className="badge badge--violet" style={{ fontSize: "0.78rem", padding: "6px 14px" }}>
              mTLS Strict Isolation: ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation Strip */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "28px",
          borderBottom: "1px solid #E2E8F0",
          paddingBottom: "12px",
          overflowX: "auto",
        }}
      >
        {[
          { id: "fleet", label: "1. Federated BU Fleet", icon: Building2, count: businessUnits.length },
          { id: "marketplace", label: "2. Contract Marketplace", icon: Layers, count: marketplaceContracts.length },
          { id: "compliance", label: "3. Regulatory Compliance", icon: ShieldCheck, count: auditPacks.length },
          { id: "whitelabel", label: "4. White-Label Licensing", icon: Palette, count: presets.length },
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 18px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                border: active ? "1px solid rgba(139, 92, 246, 0.6)" : "1px solid transparent",
                background: active ? "rgba(139, 92, 246, 0.18)" : "transparent",
                color: active ? "#FFFFFF" : "#A1A1AA",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                transition: "all 140ms ease",
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={16} color={active ? "#A78BFA" : "#71717A"} />
              <span>{tab.label}</span>
              <span
                style={{
                  background: active ? "rgba(139, 92, 246, 0.4)" : "rgba(255, 255, 255, 0.06)",
                  padding: "2px 7px",
                  borderRadius: "9999px",
                  fontSize: "0.7rem",
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FEDERATED BUSINESS UNIT FLEET                                      */}
      {/* ========================================================================= */}
      {activeTab === "fleet" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Executive Rollup Bento Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div className="bento-card" style={{ padding: "20px" }}>
              <div style={{ fontSize: "0.72rem", color: "#71717A", textTransform: "uppercase", fontWeight: 700 }}>Active Subsidiaries</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#FFFFFF", marginTop: "6px" }}>
                {fleetOverview?.total_business_units || 5}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#10B981", marginTop: "4px" }}>100% Central Hub Connected</div>
            </div>

            <div className="bento-card" style={{ padding: "20px" }}>
              <div style={{ fontSize: "0.72rem", color: "#71717A", textTransform: "uppercase", fontWeight: 700 }}>Fleet Health Index</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#8B5CF6", marginTop: "6px" }}>
                {fleetOverview?.average_fleet_health || 88.6}%
              </div>
              <div style={{ fontSize: "0.75rem", color: "#A1A1AA", marginTop: "4px" }}>Weighted Gaussian Composite</div>
            </div>

            <div className="bento-card" style={{ padding: "20px" }}>
              <div style={{ fontSize: "0.72rem", color: "#71717A", textTransform: "uppercase", fontWeight: 700 }}>Governed Metrics</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#06B6D4", marginTop: "6px" }}>
                {fleetOverview?.total_governed_kpis || 138}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#A1A1AA", marginTop: "4px" }}>Across 5 Global Divisions</div>
            </div>

            <div className="bento-card" style={{ padding: "20px" }}>
              <div style={{ fontSize: "0.72rem", color: "#71717A", textTransform: "uppercase", fontWeight: 700 }}>Fleet Revenue at Stake</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#EF4444", marginTop: "6px" }}>
                ${((fleetOverview?.total_revenue_at_risk_usd || 1688000) / 1000).toFixed(0)}k
              </div>
              <div style={{ fontSize: "0.75rem", color: "#F87171", marginTop: "4px" }}>Isolated in EMEA & India Hubs</div>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#FFFFFF" }}>
              Operating Subsidiary Fleet Nodes ({businessUnits.length})
            </div>
            <button
              onClick={() => setShowRegisterBuModal(true)}
              className="btn-primary"
              style={{ padding: "8px 16px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={14} /> Register Subsidiary Node
            </button>
          </div>

          {/* Business Units Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "18px" }}>
            {businessUnits.map((bu) => {
              const isHealthy = bu.status === "HEALTHY";
              const isCrit = bu.status === "CRITICAL";
              const statusColor = isHealthy ? "#10B981" : isCrit ? "#EF4444" : "#F59E0B";

              return (
                <div key={bu.bu_id} className="bento-card" style={{ padding: "22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <div>
                        <div style={{ fontSize: "0.72rem", color: "#8B5CF6", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                          {bu.bu_id}
                        </div>
                        <h3 style={{ margin: "2px 0 0 0", fontSize: "1.1rem", fontWeight: 800, color: "#FFFFFF" }}>
                          {bu.name}
                        </h3>
                        <div style={{ fontSize: "0.75rem", color: "#71717A", marginTop: "2px" }}>
                          Region: <strong style={{ color: "#D4D4D8" }}>{bu.region}</strong> | {bu.tier}
                        </div>
                      </div>
                      <span
                        style={{
                          background: `${statusColor}18`,
                          border: `1px solid ${statusColor}40`,
                          color: statusColor,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          padding: "3px 9px",
                          borderRadius: "9999px",
                        }}
                      >
                        {bu.status}
                      </span>
                    </div>

                    {/* Health Score Bar */}
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "6px" }}>
                        <span style={{ color: "#A1A1AA" }}>Operational Health</span>
                        <span style={{ fontWeight: 800, color: statusColor, fontFamily: "var(--font-mono)" }}>
                          {bu.health_score}%
                        </span>
                      </div>
                      <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${bu.health_score}%`, height: "100%", background: statusColor, borderRadius: "3px" }} />
                      </div>
                    </div>

                    {/* Operational Stats Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "8px", marginBottom: "16px" }}>
                      <div>
                        <div style={{ fontSize: "0.68rem", color: "#71717A" }}>KPIs</div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF" }}>{bu.kpis_count}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.68rem", color: "#71717A" }}>Anomalies</div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: bu.open_anomalies > 0 ? "#EF4444" : "#10B981" }}>
                          {bu.open_anomalies}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "0.68rem", color: "#71717A" }}>Risk at Stake</div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: bu.revenue_at_risk > 0 ? "#EF4444" : "#A1A1AA" }}>
                          ${(bu.revenue_at_risk / 1000).toFixed(0)}k
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: "0.72rem", color: "#71717A", fontFamily: "var(--font-mono)", marginBottom: "16px", wordBreak: "break-all" }}>
                      API: {bu.api_endpoint}
                    </div>
                  </div>

                  {/* Node Bottom Controls */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "14px" }}>
                    <div style={{ fontSize: "0.68rem", color: "#71717A" }}>
                      mTLS Isolated Boundary
                    </div>
                    <button
                      onClick={() => handlePingHeartbeat(bu.bu_id)}
                      disabled={pingingBu === bu.bu_id}
                      className="btn-secondary"
                      style={{ padding: "6px 12px", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                      <Radio size={12} color="#8B5CF6" />
                      {pingingBu === bu.bu_id ? "Pinging Node..." : "Verify Node"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Register BU Modal */}
          {showRegisterBuModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "20px",
              }}
            >
              <div className="bento-card" style={{ maxWidth: "480px", width: "100%", padding: "28px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", fontWeight: 800, color: "#FFFFFF" }}>
                  Register Subsidiary BU Node
                </h3>
                <form onSubmit={handleRegisterBu} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA", display: "block", marginBottom: "4px" }}>Business Unit ID</label>
                    <input
                      type="text"
                      placeholder="e.g. bu:nordic_logistics"
                      value={newBuForm.bu_id}
                      onChange={(e) => setNewBuForm({ ...newBuForm, bu_id: e.target.value })}
                      required
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA", display: "block", marginBottom: "4px" }}>Division Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Nordic Freight & Logistics"
                      value={newBuForm.name}
                      onChange={(e) => setNewBuForm({ ...newBuForm, name: e.target.value })}
                      required
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA", display: "block", marginBottom: "4px" }}>Region</label>
                    <input
                      type="text"
                      placeholder="e.g. Northern Europe"
                      value={newBuForm.region}
                      onChange={(e) => setNewBuForm({ ...newBuForm, region: e.target.value })}
                      required
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                    <button type="button" onClick={() => setShowRegisterBuModal(false)} className="btn-secondary" style={{ padding: "8px 14px" }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" style={{ padding: "8px 18px" }}>
                      Register Node
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONTRACT MARKETPLACE                                               */}
      {/* ========================================================================= */}
      {activeTab === "marketplace" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Controls & Search Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: "12px", top: "11px", color: "#71717A" }} />
                <input
                  type="text"
                  placeholder="Search metric standards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: "8px 14px 8px 34px",
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.04)",
                    color: "#FFFFFF",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    fontSize: "0.85rem",
                    outline: "none",
                    minWidth: "260px",
                  }}
                />
              </div>

              {/* SLA Tier Filter Pills */}
              <div style={{ display: "flex", gap: "6px" }}>
                {["ALL", "Mission Critical", "Standard", "Analytics"].map((tier) => {
                  const active = selectedSla === tier;
                  return (
                    <button
                      key={tier}
                      onClick={() => setSelectedSla(tier)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        border: active ? "1px solid rgba(139, 92, 246, 0.6)" : "1px solid rgba(255, 255, 255, 0.08)",
                        background: active ? "rgba(139, 92, 246, 0.2)" : "rgba(255, 255, 255, 0.02)",
                        color: active ? "#C4B5FD" : "#A1A1AA",
                      }}
                    >
                      {tier}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setShowPublishModal(true)}
              className="btn-primary"
              style={{ padding: "8px 16px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Plus size={14} /> Publish New Contract Standard
            </button>
          </div>

          {/* Contracts Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "18px" }}>
            {filteredContracts.map((c) => {
              const isMission = c.sla_tier.includes("Mission Critical");
              return (
                <div key={c.contract_id} className="bento-card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <span className={`badge badge--${isMission ? "violet" : "success"}`} style={{ fontSize: "0.68rem" }}>
                        {c.sla_tier}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "#A78BFA", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        v{c.version}
                      </span>
                    </div>

                    <h3 style={{ margin: "0 0 6px 0", fontSize: "1.15rem", fontWeight: 800, color: "#FFFFFF" }}>
                      {c.title}
                    </h3>
                    <div style={{ fontSize: "0.75rem", color: "#71717A", fontFamily: "var(--font-mono)", marginBottom: "14px" }}>
                      Bound Metric: <strong style={{ color: "#E2E8F0" }}>{c.metric_id}</strong>
                    </div>

                    {/* Formula & Rule Box */}
                    <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.05)", borderRadius: "8px", padding: "12px", marginBottom: "14px" }}>
                      <div style={{ fontSize: "0.68rem", color: "#71717A", textTransform: "uppercase", fontWeight: 700, marginBottom: "4px" }}>
                        Contractual Formula
                      </div>
                      <code style={{ fontSize: "0.78rem", color: "#34D399", display: "block" }}>
                        {c.contract_schema?.formula || "SUM(gross) - SUM(returns)"}
                      </code>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "#A1A1AA", marginBottom: "16px" }}>
                      <span>Publisher: <strong style={{ color: "#D4D4D8" }}>{c.publisher_bu}</strong></span>
                      <span>SLA Latency: <strong style={{ color: "#D4D4D8" }}>{c.contract_schema?.sla_latency_minutes || 15}m</strong></span>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "14px" }}>
                    <span style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 700 }}>
                      ✓ {c.subscriber_count} Enterprise Subscribers
                    </span>
                    <button
                      onClick={() => handleSubscribeContract(c.contract_id)}
                      className="btn-secondary"
                      style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                    >
                      Subscribe BU Node
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Publish Contract Modal */}
          {showPublishModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(6px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "20px",
              }}
            >
              <div className="bento-card" style={{ maxWidth: "520px", width: "100%", padding: "28px" }}>
                <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", fontWeight: 800, color: "#FFFFFF" }}>
                  Publish Standard Metric Contract
                </h3>
                <form onSubmit={handlePublishContract} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA", display: "block", marginBottom: "4px" }}>Metric ID</label>
                    <input
                      type="text"
                      value={newContractForm.metric_id}
                      onChange={(e) => setNewContractForm({ ...newContractForm, metric_id: e.target.value })}
                      required
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA", display: "block", marginBottom: "4px" }}>Contract Title</label>
                    <input
                      type="text"
                      value={newContractForm.title}
                      onChange={(e) => setNewContractForm({ ...newContractForm, title: e.target.value })}
                      required
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "#A1A1AA", display: "block", marginBottom: "4px" }}>Contractual Mathematical Formula</label>
                    <input
                      type="text"
                      value={newContractForm.formula}
                      onChange={(e) => setNewContractForm({ ...newContractForm, formula: e.target.value })}
                      required
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", color: "#A1A1AA", display: "block", marginBottom: "4px" }}>Publisher BU</label>
                      <input
                        type="text"
                        value={newContractForm.publisher_bu}
                        onChange={(e) => setNewContractForm({ ...newContractForm, publisher_bu: e.target.value })}
                        required
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.75rem", color: "#A1A1AA", display: "block", marginBottom: "4px" }}>SLA Tier</label>
                      <select
                        value={newContractForm.sla_tier}
                        onChange={(e) => setNewContractForm({ ...newContractForm, sla_tier: e.target.value })}
                        style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "#18181B", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                      >
                        <option value="Mission Critical (99.9%)">Mission Critical (99.9%)</option>
                        <option value="Standard (99.0%)">Standard (99.0%)</option>
                        <option value="Analytics Only">Analytics Only</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                    <button type="button" onClick={() => setShowPublishModal(false)} className="btn-secondary" style={{ padding: "8px 14px" }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" style={{ padding: "8px 18px" }}>
                      Publish Contract
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: REGULATORY COMPLIANCE DOSSIERS                                     */}
      {/* ========================================================================= */}
      {activeTab === "compliance" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Top 3 Regulatory Standards Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px" }}>
            {[
              {
                id: "SOC-2",
                name: "AICPA SOC-2 Type II",
                tag: "Security & Processing Integrity",
                desc: "Certifies 0ms LLM arithmetic integrity, AST guardrails, and human checkpoint change control.",
                controls: 5,
              },
              {
                id: "SOX-404",
                name: "Sarbanes-Oxley Section 404",
                tag: "Financial Internal Controls (ICFR)",
                desc: "Guarantees immutable SHA-256 decision hashes, ERP ledger reconciliation, and fail-closed abstention.",
                controls: 4,
              },
              {
                id: "GDPR-ART22",
                name: "EU GDPR Article 22",
                tag: "Automated Decision-Making Rights",
                desc: "Enforces right to human explanation, operator contestability, and zero cloud data egress.",
                controls: 4,
              },
            ].map((std) => (
              <div key={std.id} className="bento-card" style={{ padding: "22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span className="badge badge--violet" style={{ fontSize: "0.68rem" }}>{std.tag}</span>
                    <span className="badge badge--success" style={{ fontSize: "0.68rem" }}>100% Passed</span>
                  </div>
                  <h3 style={{ margin: "4px 0 6px 0", fontSize: "1.15rem", fontWeight: 800, color: "#FFFFFF" }}>
                    {std.name}
                  </h3>
                  <p style={{ margin: "0 0 16px 0", fontSize: "0.78rem", color: "#A1A1AA", lineHeight: 1.5 }}>
                    {std.desc}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "14px" }}>
                  <span style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 700 }}>
                    {std.controls}/{std.controls} Controls Verified
                  </span>
                  <button
                    onClick={() => handleGenerateAuditPack(std.id)}
                    disabled={generatingPack}
                    className="btn-primary"
                    style={{ padding: "6px 14px", fontSize: "0.75rem" }}
                  >
                    {generatingPack ? "Certifying..." : "1-Click Certify Pack"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Dossier Inspector */}
          {selectedDossier && (
            <div className="bento-card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "0.72rem", color: "#8B5CF6", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    {selectedDossier.dossier_id}
                  </div>
                  <h3 style={{ margin: "4px 0 0 0", fontSize: "1.3rem", fontWeight: 800, color: "#FFFFFF" }}>
                    {selectedDossier.payload?.title || selectedDossier.standard}
                  </h3>
                  <div style={{ fontSize: "0.78rem", color: "#71717A", marginTop: "2px" }}>
                    Framework: <strong style={{ color: "#D4D4D8" }}>{selectedDossier.payload?.regulatory_framework}</strong> | Certified By: {selectedDossier.auditor_identity}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className="badge badge--success" style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
                    Score: {selectedDossier.compliance_score}% COMPLIANT
                  </span>
                </div>
              </div>

              {/* SHA-256 Proof Box */}
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>
                  Cryptographic Audit Hash (SHA-256): <code style={{ color: "#FCD34D", fontSize: "0.72rem" }}>{selectedDossier.audit_hash}</code>
                </div>
                <span style={{ fontSize: "0.72rem", color: "#6EE7B7", fontWeight: 700 }}>
                  ✓ Non-Repudiation Guaranteed
                </span>
              </div>

              {/* Controls Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", color: "#71717A", textAlign: "left" }}>
                      <th style={{ padding: "10px 12px" }}>Control ID</th>
                      <th style={{ padding: "10px 12px" }}>Control Name</th>
                      <th style={{ padding: "10px 12px" }}>Category</th>
                      <th style={{ padding: "10px 12px" }}>Status</th>
                      <th style={{ padding: "10px 12px" }}>Telemetry Verification Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedDossier.payload?.controls || []).map((c, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <td style={{ padding: "12px", fontFamily: "var(--font-mono)", color: "#A78BFA", fontWeight: 700 }}>
                          {c.control_id}
                        </td>
                        <td style={{ padding: "12px", color: "#FFFFFF", fontWeight: 600 }}>{c.name}</td>
                        <td style={{ padding: "12px", color: "#A1A1AA" }}>{c.category}</td>
                        <td style={{ padding: "12px" }}>
                          <span className="badge badge--success" style={{ fontSize: "0.68rem" }}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px", color: "#71717A", fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>
                          {c.telemetry_source}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: WHITE-LABEL PLATFORM LICENSING                                     */}
      {/* ========================================================================= */}
      {activeTab === "whitelabel" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Left: Presets & Custom Form */}
          <div className="bento-card" style={{ padding: "26px" }}>
            <h3 style={{ margin: "0 0 14px 0", fontSize: "1.15rem", fontWeight: 800, color: "#FFFFFF" }}>
              Accenture Client Engagement Presets
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              {presets.map((p) => {
                const isSelected = customBrandForm.tenant_id === p.tenant_id;
                return (
                  <div
                    key={p.tenant_id}
                    onClick={() => handleApplyPreset(p)}
                    style={{
                      background: isSelected ? "rgba(139, 92, 246, 0.15)" : "rgba(255, 255, 255, 0.02)",
                      border: isSelected ? "1px solid rgba(139, 92, 246, 0.5)" : "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#FFFFFF" }}>{p.preset_name}</div>
                      <div style={{ fontSize: "0.72rem", color: "#A1A1AA" }}>{p.brand_name} &bull; {p.engagement_code}</div>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: p.primary_color }} />
                      <span style={{ width: "16px", height: "16px", borderRadius: "50%", background: p.secondary_color }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF" }}>
              Custom Client Branding Parameters
            </h4>

            <form onSubmit={handleSaveCustomBrand} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.72rem", color: "#A1A1AA", display: "block", marginBottom: "4px" }}>Brand Portal Title</label>
                <input
                  type="text"
                  value={customBrandForm.brand_name}
                  onChange={(e) => setCustomBrandForm({ ...customBrandForm, brand_name: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.72rem", color: "#A1A1AA", display: "block", marginBottom: "4px" }}>Primary Hex Color</label>
                  <input
                    type="text"
                    value={customBrandForm.primary_color}
                    onChange={(e) => setCustomBrandForm({ ...customBrandForm, primary_color: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.72rem", color: "#A1A1AA", display: "block", marginBottom: "4px" }}>Secondary Hex Color</label>
                  <input
                    type="text"
                    value={customBrandForm.secondary_color}
                    onChange={(e) => setCustomBrandForm({ ...customBrandForm, secondary_color: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.72rem", color: "#A1A1AA", display: "block", marginBottom: "4px" }}>Accenture Engagement Tracking Code</label>
                <input
                  type="text"
                  value={customBrandForm.engagement_code}
                  onChange={(e) => setCustomBrandForm({ ...customBrandForm, engagement_code: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.72rem", color: "#A1A1AA", display: "block", marginBottom: "4px" }}>Custom Hostname / Domain</label>
                <input
                  type="text"
                  value={customBrandForm.custom_domain}
                  onChange={(e) => setCustomBrandForm({ ...customBrandForm, custom_domain: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: "8px", padding: "10px" }}>
                Save White-Label Configuration
              </button>
            </form>
          </div>

          {/* Right: Live Brand Preview Card */}
          <div className="bento-card" style={{ padding: "26px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "0.72rem", color: "#71717A", textTransform: "uppercase", fontWeight: 700, marginBottom: "14px" }}>
                Live Tenant Portal Preview
              </div>

              {/* Simulated Client Nav Header */}
              <div
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: `1px solid ${customBrandForm.primary_color}60`,
                  borderRadius: "10px",
                  padding: "16px 20px",
                  marginBottom: "20px",
                  boxShadow: `0 0 20px -4px ${customBrandForm.primary_color}30`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "6px",
                        background: customBrandForm.primary_color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 900,
                        fontSize: "1.1rem",
                      }}
                    >
                      {customBrandForm.logo_symbol}
                    </div>
                    <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#FFFFFF" }}>
                      {customBrandForm.brand_name}
                    </span>
                  </div>
                  <span
                    style={{
                      background: `${customBrandForm.secondary_color}20`,
                      color: customBrandForm.secondary_color,
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    Enterprise License
                  </span>
                </div>
              </div>

              {/* Simulated Tenant Parameters */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: "#71717A" }}>Active Tenant ID:</span>
                  <span style={{ color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{customBrandForm.tenant_id}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: "#71717A" }}>Engagement Tracking:</span>
                  <span style={{ color: "#A78BFA", fontFamily: "var(--font-mono)" }}>{customBrandForm.engagement_code}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: "#71717A" }}>Custom Domain:</span>
                  <span style={{ color: "#34D399", fontFamily: "var(--font-mono)" }}>https://{customBrandForm.custom_domain}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: "#71717A" }}>Primary Brand Accent:</span>
                  <span style={{ color: customBrandForm.primary_color, fontWeight: 700 }}>{customBrandForm.primary_color}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "24px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: "0.72rem", color: "#71717A" }}>
              ⚡ Licensed by Accenture Applied Intelligence practice for enterprise clients.
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
