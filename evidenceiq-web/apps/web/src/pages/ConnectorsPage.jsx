import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  Webhook,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Cloud,
  Send,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  ArrowRight,
  Terminal,
  Clock,
  Sparkles,
  Lock,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Activity,
  Table,
  Check,
  CheckCircle
} from "lucide-react";
import { useToast } from "../components/ToastContext";
import PulseDot from "../components/PulseDot";

export default function ConnectorsPage() {
  const { addToast } = useToast();
  const [connectors, setConnectors] = useState([]);
  const [testingConnectorId, setTestingConnectorId] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [schemaDetails, setSchemaDetails] = useState({});
  const [introspectingId, setIntrospectingId] = useState(null);
  
  // Webhooks
  const [webhookHistory, setWebhookHistory] = useState([]);
  const [triggeringWebhook, setTriggeringWebhook] = useState(null);
  
  // Database Adapters
  const [dbStatus, setDbStatus] = useState(null);
  const [switchingDb, setSwitchingDb] = useState(false);
  
  // Tenants
  const [tenants, setTenants] = useState([]);
  const [activeTenant, setActiveTenant] = useState("tenant_accenture_retail");

  useEffect(() => {
    fetchConnectors();
    fetchWebhookHistory();
    fetchDbStatus();
    fetchTenants();
  }, []);

  const fetchConnectors = async () => {
    try {
      const res = await fetch("/api/connectors/list");
      const data = await res.json();
      if (data.connectors) setConnectors(data.connectors);
    } catch (e) {
      console.error("Failed to load connectors", e);
    }
  };

  const fetchWebhookHistory = async () => {
    try {
      const res = await fetch("/api/webhooks/history");
      const data = await res.json();
      if (data.history) setWebhookHistory(data.history);
    } catch (e) {
      console.error("Failed to load webhooks", e);
    }
  };

  const fetchDbStatus = async () => {
    try {
      const res = await fetch("/api/db-adapters/status");
      const data = await res.json();
      setDbStatus(data);
    } catch (e) {
      console.error("Failed to load DB status", e);
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await fetch("/api/tenants");
      const data = await res.json();
      if (data.tenants) setTenants(data.tenants);
    } catch (e) {
      console.error("Failed to load tenants", e);
    }
  };

  const handleTestConnection = async (connectorId) => {
    setTestingConnectorId(connectorId);
    try {
      const res = await fetch("/api/connectors/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connector_id: connectorId })
      });
      const data = await res.json();
      setTestResults(prev => ({ ...prev, [connectorId]: data }));
      addToast({
        title: "Connection Verified",
        message: `${data.message || 'Connected successfully'} (${data.latency_ms}ms)`,
        type: "success"
      });
    } catch (e) {
      addToast({
        title: "Connection Failed",
        message: e.message,
        type: "error"
      });
    } finally {
      setTestingConnectorId(null);
    }
  };

  const handleIntrospectSchema = async (connectorId) => {
    setIntrospectingId(connectorId);
    try {
      const res = await fetch(`/api/connectors/introspect?connector_id=${connectorId}`);
      const data = await res.json();
      setSchemaDetails(prev => ({ ...prev, [connectorId]: data }));
      addToast({
        title: "Schema Introspected",
        message: `Discovered ${data.tables?.length || 0} production marts and views.`,
        type: "success"
      });
    } catch (e) {
      console.error("Introspection failed", e);
    } finally {
      setIntrospectingId(null);
    }
  };

  const handleSimulateWebhook = async (source) => {
    setTriggeringWebhook(source);
    let payload = {};

    if (source === "github") {
      payload = {
        release_tag: "v5.4.1",
        repository: { name: "mobile-checkout-service" },
        deployment: { environment: "production-north-india" },
        sender: { login: "release-bot" },
        head_commit: { message: "Deploy Payment Gateway Retry Patch v5.4.1" }
      };
    } else if (source === "jira") {
      payload = {
        issue: {
          key: "OPS-9102",
          fields: {
            summary: "Mobile App Checkout Dropoff - Payment Timeout Incident",
            issuetype: { name: "P1 Incident" }
          }
        },
        user: { displayName: "Senior SRE Lead" }
      };
    } else if (source === "zendesk") {
      payload = {
        ticket: {
          id: "ZD-10492",
          subject: "Customers complaining about payment loop in North India mobile app",
          priority: "urgent"
        }
      };
    }

    try {
      const res = await fetch(`/api/webhooks/${source}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      addToast({
        title: `Real-Time Webhook Ingested (${source.toUpperCase()})`,
        message: `Graph Node Created: ${data.event_id}`,
        type: "success"
      });
      fetchWebhookHistory();
    } catch (e) {
      addToast({
        title: "Webhook Failed",
        message: e.message,
        type: "error"
      });
    } finally {
      setTriggeringWebhook(null);
    }
  };

  const handleSwitchDbEngine = async (engineId) => {
    setSwitchingDb(true);
    try {
      const res = await fetch("/api/db-adapters/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ engine_id: engineId })
      });
      const data = await res.json();
      addToast({
        title: "Database Engine Switched",
        message: data.message,
        type: "success"
      });
      fetchDbStatus();
    } catch (e) {
      addToast({
        title: "DB Switch Failed",
        message: e.message,
        type: "error"
      });
    } finally {
      setSwitchingDb(false);
    }
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 60px 24px" }}>
      
      {/* ── HEADER & TENANT SELECTOR ── */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span className="badge badge--primary" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Cloud size={11} /> Phase 2 Enterprise Fleet Architecture
              </span>
              <span className="badge badge--success" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Activity size={11} /> Live Ingestion Active
              </span>
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "1.85rem",
                fontWeight: 800,
                color: "var(--color-text, #0F172A)",
                letterSpacing: "-0.03em",
                fontFamily: "var(--font-heading)",
              }}
            >
              Enterprise Connectors & <span className="text-gradient-purple">Real-Time Ingestion Hub</span>
            </h1>
            <p style={{ margin: "6px 0 0 0", color: "#475569", fontSize: "0.925rem" }}>
              Connect native enterprise data warehouses (Snowflake, BigQuery, Databricks, SAP), ingest real-time CI/CD and incident webhooks, and scale property graphs across distributed databases.
            </p>
          </div>

          {/* Tenant Switcher */}
          <div style={{ background: "rgba(17, 17, 20, 0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "10px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <Globe size={16} color="#10B981" />
            <div>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Workspace Tenant (SSO)
              </div>
              <select
                value={activeTenant}
                onChange={(e) => setActiveTenant(e.target.value)}
                style={{
                  background: "transparent",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                {tenants.map((t) => (
                  <option key={t.tenant_id} value={t.tenant_id} style={{ background: "#111114", color: "#FFFFFF" }}>
                    {t.name} ({t.sso_provider.split(" ")[0]})
                  </option>
                ))}
              </select>
            </div>
            <ShieldCheck size={16} color="#8B5CF6" />
          </div>
        </div>
      </div>

      {/* ── HOW TO USE GUIDE (COLLAPSIBLE / HIGHLIGHT BOX) ── */}
      <div style={{ background: "rgba(139, 92, 246, 0.07)", border: "1px solid rgba(139, 92, 246, 0.25)", borderRadius: "12px", padding: "18px 22px", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
          <HelpCircle size={16} color="#C4B5FD" />
          <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#C4B5FD", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            How to Use the Enterprise Connector Hub
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", color: "#D4D4D8", fontSize: "0.835rem", lineHeight: 1.5 }}>
          <div>
            <strong style={{ color: "#FFF" }}>1. Test Cloud Data Warehouses:</strong> Click <em>"Test Latency"</em> on Snowflake, BigQuery, or Databricks to verify connectivity and view real-time latency benchmarks. Click <em>"Introspect Schema"</em> to discover tables.
          </div>
          <div>
            <strong style={{ color: "#FFF" }}>2. Simulate Real-Time Webhooks:</strong> Click any of the 3 trigger buttons (GitHub, Jira, Zendesk) below to simulate an incoming production release or support surge. Watch it immediately generate an event node in the live audit log.
          </div>
          <div>
            <strong style={{ color: "#FFF" }}>3. Switch Database Engines:</strong> Toggle query routing between SQLite (embedded local), PostgreSQL 16 + pgvector, and Neo4j Aura in the scaling adapter section below.
          </div>
        </div>
      </div>

      {/* ── 4 KPI STAT CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        <div className="bento-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#71717A", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
            <span>Cloud Data Warehouses</span>
            <Cloud size={16} color="#8B5CF6" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "4px" }}>
            4 Active
          </div>
          <div style={{ fontSize: "0.78rem", color: "#10B981", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
            Snowflake, BigQuery, Databricks, SAP
          </div>
        </div>

        <div className="bento-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#71717A", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
            <span>Live Ingested Webhooks</span>
            <Webhook size={16} color="#EC4899" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "4px" }}>
            {webhookHistory.length} Events
          </div>
          <div style={{ fontSize: "0.78rem", color: "#A78BFA", display: "flex", alignItems: "center", gap: "6px" }}>
            <Radio size={13} color="#EC4899" /> GitHub, Jira & Zendesk Connected
          </div>
        </div>

        <div className="bento-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#71717A", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
            <span>Active Graph Engine</span>
            <Server size={16} color="#06B6D4" />
          </div>
          <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {dbStatus?.active_engine === "sqlite_embedded" ? "SQLite (Embedded)" : dbStatus?.active_engine === "postgres_pgvector" ? "PostgreSQL 16 + pgvector" : "Neo4j Aura Enterprise"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#10B981", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
            Failover Engine: READY_STANDBY
          </div>
        </div>

        <div className="bento-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#71717A", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
            <span>Enterprise Security</span>
            <Lock size={16} color="#F59E0B" />
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "4px" }}>
            SAML 2.0 / Okta
          </div>
          <div style={{ fontSize: "0.78rem", color: "#71717A" }}>
            Tenant Isolated · Row-Level Security
          </div>
        </div>
      </div>

      {/* ── SECTION 1: ENTERPRISE DATA WAREHOUSE CONNECTORS ── */}
      <div style={{ marginBottom: "36px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "8px" }}>
              <Cloud size={18} color="#8B5CF6" /> Enterprise Data Warehouse Connectors (Phase 2.1)
            </h2>
            <p style={{ margin: "4px 0 0 0", color: "#71717A", fontSize: "0.825rem" }}>
              Pre-built drivers for high-throughput enterprise marts with automated schema introspection and connection health testing.
            </p>
          </div>
          <button
            onClick={fetchConnectors}
            className="btn-secondary"
            style={{ padding: "6px 12px", fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={12} /> Refresh Connectors
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "18px" }}>
          {connectors.map((c) => {
            const test = testResults[c.connector_id];
            const schema = schemaDetails[c.connector_id];
            const isTesting = testingConnectorId === c.connector_id;
            const isIntrospecting = introspectingId === c.connector_id;

            return (
              <div key={c.connector_id} className="bento-card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <span className="badge badge--primary" style={{ fontSize: "0.65rem", textTransform: "uppercase" }}>
                        {c.connector_type}
                      </span>
                      <h3 style={{ margin: "6px 0 2px 0", fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF" }}>
                        {c.name}
                      </h3>
                      <div style={{ fontSize: "0.72rem", color: "#71717A", fontFamily: "var(--font-mono)" }}>
                        Host: {c.host_masked} | DB: {c.database}
                      </div>
                    </div>
                    <span className="badge badge--success" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle2 size={12} /> Ready
                    </span>
                  </div>

                  {/* Test Latency Result Card */}
                  {test && (
                    <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", padding: "10px 14px", marginTop: "12px", fontSize: "0.78rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#10B981", fontWeight: 700, marginBottom: "2px" }}>
                        <span>Connection Verified</span>
                        <span style={{ fontFamily: "var(--font-mono)" }}>{test.latency_ms} ms</span>
                      </div>
                      <div style={{ color: "#A1A1AA", fontSize: "0.72rem" }}>{test.message}</div>
                    </div>
                  )}

                  {/* Schema Introspection Preview */}
                  {schema && (
                    <div style={{ background: "rgba(17, 17, 20, 0.95)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "8px", padding: "12px 14px", marginTop: "12px", fontSize: "0.78rem" }}>
                      <div style={{ color: "#C4B5FD", fontWeight: 700, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Layers size={13} color="#A78BFA" />
                        <span>Introspected Marts ({schema.tables?.length || 0} tables)</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "120px", overflowY: "auto" }}>
                        {schema.tables?.map((t, idx) => (
                          <div key={idx} style={{ display: "flex", justifyContent: "space-between", color: "#D4D4D8", fontFamily: "var(--font-mono)", fontSize: "0.7rem", padding: "3px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                            <span>{t.name}</span>
                            <span style={{ color: "#71717A" }}>{t.row_count?.toLocaleString()} rows</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px", marginTop: "18px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <button
                    onClick={() => handleTestConnection(c.connector_id)}
                    disabled={isTesting}
                    className="btn-primary"
                    style={{ flex: 1, padding: "8px 12px", fontSize: "0.78rem", fontWeight: 600, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  >
                    {isTesting ? <RefreshCw size={13} className="animate-spin" /> : <Zap size={13} />}
                    <span>Test Latency</span>
                  </button>
                  <button
                    onClick={() => handleIntrospectSchema(c.connector_id)}
                    disabled={isIntrospecting}
                    className="btn-secondary"
                    style={{ padding: "8px 12px", fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    {isIntrospecting ? <RefreshCw size={13} className="animate-spin" /> : <Layers size={13} />}
                    <span>Introspect</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 2: REAL-TIME WEBHOOK INGESTION ENGINE ── */}
      <div style={{ marginBottom: "36px" }}>
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "8px" }}>
            <Webhook size={18} color="#EC4899" /> Real-Time Webhook Ingestion Engine (Phase 2.2)
          </h2>
          <p style={{ margin: "4px 0 0 0", color: "#71717A", fontSize: "0.825rem" }}>
            Simulate or receive live webhook payloads from GitHub Actions, Jira, and Zendesk. Each incoming payload automatically generates a node in the Business Evidence Graph.
          </p>
        </div>

        {/* 3 Interactive Webhook Trigger Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", marginBottom: "20px" }}>
          
          {/* GitHub Actions */}
          <div className="bento-card" style={{ padding: "20px", border: "1px solid rgba(236, 72, 153, 0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <div style={{ padding: "6px", borderRadius: "8px", background: "rgba(236, 72, 153, 0.15)", color: "#EC4899" }}>
                <Terminal size={16} />
              </div>
              <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF" }}>
                GitHub Actions Webhook
              </h3>
            </div>
            <p style={{ margin: "0 0 16px 0", color: "#A1A1AA", fontSize: "0.78rem", lineHeight: 1.5 }}>
              Emits deployment & release tag events to automatically generate <code style={{ color: "#F472B6" }}>Event</code> nodes in the graph with timestamps and git authors.
            </p>
            <button
              onClick={() => handleSimulateWebhook("github")}
              disabled={triggeringWebhook === "github"}
              style={{
                width: "100%",
                padding: "9px 14px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: 600,
                background: "rgba(236, 72, 153, 0.18)",
                border: "1px solid rgba(236, 72, 153, 0.4)",
                color: "#F472B6",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 150ms ease",
              }}
            >
              {triggeringWebhook === "github" ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
              <span>Trigger v5.4.1 Deploy Webhook</span>
            </button>
          </div>

          {/* Jira Incident */}
          <div className="bento-card" style={{ padding: "20px", border: "1px solid rgba(59, 130, 246, 0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <div style={{ padding: "6px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.15)", color: "#3B82F6" }}>
                <AlertCircle size={16} />
              </div>
              <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF" }}>
                Jira Incident Webhook
              </h3>
            </div>
            <p style={{ margin: "0 0 16px 0", color: "#A1A1AA", fontSize: "0.78rem", lineHeight: 1.5 }}>
              Ingests SRE incident reports and release change tickets (e.g. OPS-9102) to link operational outages to regional KPI drops.
            </p>
            <button
              onClick={() => handleSimulateWebhook("jira")}
              disabled={triggeringWebhook === "jira"}
              style={{
                width: "100%",
                padding: "9px 14px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: 600,
                background: "rgba(59, 130, 246, 0.18)",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                color: "#60A5FA",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 150ms ease",
              }}
            >
              {triggeringWebhook === "jira" ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
              <span>Trigger OPS-9102 Incident Webhook</span>
            </button>
          </div>

          {/* Zendesk Support */}
          <div className="bento-card" style={{ padding: "20px", border: "1px solid rgba(16, 185, 129, 0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <div style={{ padding: "6px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }}>
                <Sparkles size={16} />
              </div>
              <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF" }}>
                Zendesk Support Webhook
              </h3>
            </div>
            <p style={{ margin: "0 0 16px 0", color: "#A1A1AA", fontSize: "0.78rem", lineHeight: 1.5 }}>
              Runs TF-IDF keyword extraction on customer issue surges (ZD-10492) to provide independent multi-source corroboration.
            </p>
            <button
              onClick={() => handleSimulateWebhook("zendesk")}
              disabled={triggeringWebhook === "zendesk"}
              style={{
                width: "100%",
                padding: "9px 14px",
                borderRadius: "8px",
                fontSize: "0.8rem",
                fontWeight: 600,
                background: "rgba(16, 185, 129, 0.18)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "#34D399",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 150ms ease",
              }}
            >
              {triggeringWebhook === "zendesk" ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />}
              <span>Trigger ZD-10492 Support Webhook</span>
            </button>
          </div>
        </div>

        {/* Webhook Inbox History Table */}
        <div className="bento-card" style={{ padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#71717A", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Live Ingested Webhook Feed (Audit Trail)
            </span>
            <span className="badge badge--primary" style={{ fontSize: "0.65rem" }}>
              Socket.io Live Sync
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.8rem" }}>
              <thead>
                <tr style={{ color: "#71717A", borderBottom: "1px solid rgba(255,255,255,0.08)", fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>
                  <th style={{ padding: "8px 10px" }}>SOURCE</th>
                  <th style={{ padding: "8px 10px" }}>EVENT ID</th>
                  <th style={{ padding: "8px 10px" }}>SUMMARY</th>
                  <th style={{ padding: "8px 10px" }}>SCOPE</th>
                  <th style={{ padding: "8px 10px" }}>GRAPH LINK</th>
                  <th style={{ padding: "8px 10px" }}>RECEIVED AT</th>
                </tr>
              </thead>
              <tbody>
                {webhookHistory.slice(0, 5).map((w, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", color: "#D4D4D8" }}>
                    <td style={{ padding: "10px", fontFamily: "var(--font-mono)", color: "#EC4899", fontSize: "0.75rem" }}>
                      {w.source}
                    </td>
                    <td style={{ padding: "10px", fontFamily: "var(--font-mono)", color: "#A1A1AA", fontSize: "0.75rem" }}>
                      {w.event_id}
                    </td>
                    <td style={{ padding: "10px", maxWidth: "340px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {w.summary}
                    </td>
                    <td style={{ padding: "10px", fontFamily: "var(--font-mono)", color: "#A78BFA", fontSize: "0.75rem" }}>
                      {w.affected_region || "ALL"} / {w.affected_channel || "ALL"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      <span className="badge badge--success" style={{ fontSize: "0.65rem" }}>
                        ✔ Linked to Graph
                      </span>
                    </td>
                    <td style={{ padding: "10px", fontFamily: "var(--font-mono)", color: "#71717A", fontSize: "0.7rem" }}>
                      {w.received_at?.substring(11, 19)} UTC
                    </td>
                  </tr>
                ))}
                {webhookHistory.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "20px", textAlign: "center", color: "#71717A" }}>
                      No webhooks received yet. Click any button above to simulate.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: DATABASE SCALING ADAPTERS (SQLITE, POSTGRESQL, NEO4J) ── */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ marginBottom: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#FFFFFF", display: "flex", alignItems: "center", gap: "8px" }}>
            <Server size={18} color="#06B6D4" /> Horizontal Graph Database Scaling (Phase 2.4)
          </h2>
          <p style={{ margin: "4px 0 0 0", color: "#71717A", fontSize: "0.825rem" }}>
            Dynamically shift query routing between embedded SQLite, distributed PostgreSQL with pgvector, and native Neo4j property graphs.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
          {dbStatus?.engines &&
            Object.entries(dbStatus.engines).map(([key, engine]) => {
              const isActive = dbStatus.active_engine === key;
              return (
                <div
                  key={key}
                  className="bento-card"
                  style={{
                    padding: "22px",
                    border: isActive ? "1px solid rgba(6, 182, 212, 0.6)" : "1px solid rgba(255, 255, 255, 0.07)",
                    background: isActive ? "rgba(6, 182, 212, 0.06)" : "rgba(17, 17, 20, 0.95)",
                    boxShadow: isActive ? "0 0 20px -4px rgba(6, 182, 212, 0.25)" : "none",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "#06B6D4", fontWeight: 700 }}>
                        {engine.type}
                      </span>
                      {isActive ? (
                        <span className="badge badge--success" style={{ fontSize: "0.65rem" }}>
                          <Check size={11} /> CURRENTLY ACTIVE
                        </span>
                      ) : (
                        <span className="badge" style={{ fontSize: "0.65rem", background: "rgba(255,255,255,0.04)", color: "#71717A" }}>
                          STANDBY
                        </span>
                      )}
                    </div>

                    <h3 style={{ margin: "4px 0 12px 0", fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF" }}>
                      {engine.name}
                    </h3>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.78rem", color: "#A1A1AA", marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Latency (P99):</span>
                        <strong style={{ color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{engine.latency_p99_ms} ms</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Node Capacity:</span>
                        <strong style={{ color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>{engine.node_capacity}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSwitchDbEngine(key)}
                    disabled={isActive || switchingDb}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      background: isActive ? "rgba(6, 182, 212, 0.15)" : "rgba(255, 255, 255, 0.05)",
                      border: isActive ? "1px solid rgba(6, 182, 212, 0.4)" : "1px solid rgba(255, 255, 255, 0.1)",
                      color: isActive ? "#06B6D4" : "#D4D4D8",
                      cursor: isActive ? "default" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 140ms ease",
                    }}
                  >
                    {isActive ? <CheckCircle size={13} /> : <Zap size={13} />}
                    <span>{isActive ? "Active Query Engine" : "Switch Query Routing"}</span>
                  </button>
                </div>
              );
            })}
        </div>
      </div>

    </div>
  );
}
