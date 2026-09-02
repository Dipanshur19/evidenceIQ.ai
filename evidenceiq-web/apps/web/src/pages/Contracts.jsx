import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCode,
  Shield,
  Clock,
  Database,
  GitBranch,
  Layers,
  CheckCircle2,
  Lock,
  Eye,
  Sliders,
  Plus,
  X,
  Sparkles,
  Brain,
  Table,
  Check,
  AlertCircle,
  Activity,
  ArrowRight
} from "lucide-react";

const INITIAL_CONTRACTS = [
  {
    id: "metric:revenue",
    displayName: "Regional Revenue",
    formula: "SUM(revenue_lakh_inr)",
    unit: "Lakh INR (₹)",
    grain: "Daily, per region × channel",
    sourceOfRecord: "ERP Sales Ledger (revenue_daily.csv)",
    refreshCadence: "Daily at 00:00 UTC",
    minimumBaselineDays: 14,
    description: "Tracks total reconciled sales revenue per geographic region and sales channel. Ingested from point-of-sale transactional ledgers. Decreases in this metric typically indicate payment gateway timeouts, checkout UI friction, or regional stockout events.",
    requiredDataTypes: [
      { column: "date", type: "DATE (YYYY-MM-DD)", role: "Timestamp partition key" },
      { column: "region", type: "VARCHAR(64)", role: "Geographic dimension" },
      { column: "channel", type: "VARCHAR(64)", role: "Sales channel partition" },
      { column: "revenue_lakh_inr", type: "FLOAT", role: "Primary additive metric" }
    ],
    lineage: [
      "pos_transactions_db (Postgres)",
      "dbt_revenue_daily_aggregations",
      "data_warehouse.revenue_daily",
    ],
    materialityThresholds: {
      zScoreMin: "1.50σ",
      revenueAtStakeMin: "₹5,00,000 INR",
      minimumHistoryDays: "14 days (hard abstention below)",
    },
    connectedDrivers: [
      { id: "metric:order_volume", name: "Order Volume", weight: "0.65" },
      { id: "metric:conversion_rate", name: "Conversion Rate", weight: "0.35" },
    ],
    accessRestrictions: {
      executive: ["Executive financial summary", "Total revenue impact (₹ Lakh)", "Recommended mitigation"],
      analyst: ["Full statistical z-score", "Raw telemetry logs", "Event SHAs & commit IDs", "Confidence weights"],
    },
    governanceStatus: "ACTIVE_GOVERNED",
  },
  {
    id: "metric:order_volume",
    displayName: "Order Volume",
    formula: "SUM(order_count)",
    unit: "Orders count",
    grain: "Daily, per store × channel",
    sourceOfRecord: "Order Management System (orders_db)",
    refreshCadence: "Hourly batch (T+15m)",
    minimumBaselineDays: 14,
    description: "Total completed customer orders placed across e-commerce and retail outlets. Sourced from Kafka order-event streams and aggregated hourly. Strongly correlated with promotional campaigns and checkout conversion rates.",
    requiredDataTypes: [
      { column: "order_timestamp", type: "TIMESTAMP WITH TIMEZONE", role: "Event timestamp" },
      { column: "store_id", type: "INTEGER", role: "Store identifier" },
      { column: "channel", type: "VARCHAR(32)", role: "Order channel" },
      { column: "order_count", type: "INTEGER", role: "Count of successful checkouts" }
    ],
    lineage: [
      "kafka_order_events_stream",
      "flink_hourly_aggregations",
      "orders_db.daily_summary",
    ],
    materialityThresholds: {
      zScoreMin: "2.00σ",
      revenueAtStakeMin: "500 orders deviation",
      minimumHistoryDays: "14 days",
    },
    connectedDrivers: [
      { id: "metric:conversion_rate", name: "Checkout Conversion Rate", weight: "0.80" },
      { id: "event:promotional_campaign", name: "Promotional Banner", weight: "0.20" },
    ],
    accessRestrictions: {
      executive: ["Aggregated order total", "Channel-level variance"],
      analyst: ["Store-level breakdown", "Hourly bucket variance", "Abandoned cart sessions"],
    },
    governanceStatus: "ACTIVE_GOVERNED",
  },
  {
    id: "metric:conversion_rate",
    displayName: "Checkout Conversion Rate",
    formula: "AVG(checkout_completed_count / checkout_initiated_count) * 100",
    unit: "Percentage (%)",
    grain: "Hourly event stream",
    sourceOfRecord: "Product Analytics Engine (analytics_events)",
    refreshCadence: "Near real-time (5-minute micro-batch)",
    minimumBaselineDays: 14,
    description: "Ratio of completed purchase transactions to initiated checkout sessions. Sourced from client-side product clickstreams. Sudden drops isolate software regression bugs in release deployments or payment gateway 504 timeouts.",
    requiredDataTypes: [
      { column: "session_id", type: "UUID", role: "Unique customer session key" },
      { column: "step_name", type: "VARCHAR(64)", role: "Funnel step (cart, billing, success)" },
      { column: "app_version", type: "VARCHAR(32)", role: "Client release version (e.g. v5.4)" },
      { column: "is_successful", type: "BOOLEAN", role: "Completion indicator" }
    ],
    lineage: [
      "clickstream_events_gateway",
      "session_funnel_processor",
      "analytics.conversion_metrics",
    ],
    materialityThresholds: {
      zScoreMin: "2.00σ",
      revenueAtStakeMin: "1.20% conversion drop",
      minimumHistoryDays: "14 days",
    },
    connectedDrivers: [
      { id: "event:mobile_app_release_v5_4", name: "App Release Deployments", weight: "0.85" },
      { id: "event:payment_gateway_timeout", name: "Payment Gateway Health", weight: "0.15" },
    ],
    accessRestrictions: {
      executive: ["Funnel health overview", "High-level friction alerts"],
      analyst: ["Step-by-step funnel dropoff", "Device & OS telemetry", "HTTP 504 server error stacktraces"],
    },
    governanceStatus: "ACTIVE_GOVERNED",
  },
  {
    id: "metric:ticket_rate",
    displayName: "Support Ticket Incident Rate",
    formula: "COUNT(tickets) / (SUM(orders) / 1000)",
    unit: "Tickets per 1,000 Orders",
    grain: "Continuous ticket log stream",
    sourceOfRecord: "Support Ticketing Desk (support_tickets.csv)",
    refreshCadence: "Real-time webhook ingestion",
    minimumBaselineDays: 14,
    description: "Normalized volume of customer complaints and technical bug reports per thousand orders. Ingested via real-time webhooks with NLP sentiment scoring. Corroborates customer impact for system degradation events.",
    requiredDataTypes: [
      { column: "ticket_id", type: "VARCHAR(32)", role: "Ticket tracking identifier" },
      { column: "category", type: "VARCHAR(64)", role: "NLP ticket classification" },
      { column: "sentiment_score", type: "FLOAT (-1.0 to +1.0)", role: "Frustration severity index" },
      { column: "associated_store", type: "INTEGER", role: "Store context" }
    ],
    lineage: [
      "zendesk_webhook_receiver",
      "nlp_sentiment_enrichment_worker",
      "support_tickets_daily",
    ],
    materialityThresholds: {
      zScoreMin: "2.50σ",
      revenueAtStakeMin: "10 tickets surge / store",
      minimumHistoryDays: "14 days",
    },
    connectedDrivers: [
      { id: "event:mobile_app_release_v5_4", name: "Mobile App Bugs", weight: "0.70" },
      { id: "event:payment_gateway_timeout", name: "Checkout Failures", weight: "0.30" },
    ],
    accessRestrictions: {
      executive: ["CSAT & ticket volume trends"],
      analyst: ["Individual ticket transcripts", "NLP token cluster breakdown", "Customer sentiment raw score"],
    },
    governanceStatus: "ACTIVE_GOVERNED",
  },
  {
    id: "metric:nps",
    displayName: "Customer Net Promoter Score (NPS)",
    domain: "Customer Experience",
    formula: "(Promoters - Detractors) / Total_Respondents * 100",
    unit: "pts (-100 to +100)",
    grain: "Daily, per region",
    sourceOfRecord: "Qualtrics Experience Cloud (cross_domain_kpis.csv)",
    refreshCadence: "Daily at 00:00 UTC (T+2h)",
    minimumBaselineDays: 14,
    description: "Quantifies customer brand sentiment, perceived checkout friction, and subscriber loyalty. Sourced from in-app post-purchase micro-surveys. Drops in NPS typically lag support ticket surges by 24 hours and lead customer churn by 48 hours.",
    requiredDataTypes: [
      { column: "survey_id", type: "UUID", role: "Unique survey response key" },
      { column: "region", type: "VARCHAR(64)", role: "Geographic territory partition" },
      { column: "promoter_count", type: "INTEGER", role: "Rating 9-10 customer count" },
      { column: "detractor_count", type: "INTEGER", role: "Rating 0-6 customer count" },
      { column: "nps_score", type: "FLOAT (-100 to +100)", role: "Standardized NPS index" }
    ],
    lineage: [
      "qualtrics_feedback_stream",
      "cx_sentiment_worker",
      "data_warehouse.cross_domain_kpis",
    ],
    materialityThresholds: {
      zScoreMin: "1.50σ",
      revenueAtStakeMin: "5.0 pts drop",
      minimumHistoryDays: "14 days",
    },
    connectedDrivers: [
      { id: "metric:ticket_rate", name: "Support Ticket Surge", weight: "0.94" },
      { id: "metric:revenue", name: "Regional Revenue", weight: "0.88" },
      { id: "metric:churn", name: "Customer Churn", weight: "-0.92" },
    ],
    accessRestrictions: {
      executive: ["Regional NPS trend", "Executive customer satisfaction gauge"],
      analyst: ["Detractor verbatim transcripts", "Channel CSAT breakdown", "Cross-domain lag telemetry"],
    },
    governanceStatus: "ACTIVE_GOVERNED",
  },
  {
    id: "metric:churn",
    displayName: "Customer Churn Rate",
    domain: "Growth & Retention",
    formula: "Lost_Customers / Total_Active_Customers * 100",
    unit: "Percentage (%)",
    grain: "Daily, per region",
    sourceOfRecord: "Subscription & CRM Lifecycle Engine (cross_domain_kpis.csv)",
    refreshCadence: "Daily at 00:00 UTC (T+4h)",
    minimumBaselineDays: 14,
    description: "Measures daily customer attrition, account cancellations, and subscriber churn. Strongly driven by accumulated app friction and prolonged support ticket backlogs, lagging NPS troughs by 48 hours.",
    requiredDataTypes: [
      { column: "date", type: "DATE (YYYY-MM-DD)", role: "Partition timestamp" },
      { column: "region", type: "VARCHAR(64)", role: "Geographic division" },
      { column: "lost_customers", type: "INTEGER", role: "Canceled subscriptions / inactive users" },
      { column: "total_active", type: "INTEGER", role: "Total active customer base" },
      { column: "churn_rate_pct", type: "FLOAT", role: "Calculated daily attrition percentage" }
    ],
    lineage: [
      "stripe_subscription_events",
      "crm_lifecycle_aggregator",
      "growth_retention.daily_attrition",
    ],
    materialityThresholds: {
      zScoreMin: "2.00σ",
      revenueAtStakeMin: "0.50% churn spike",
      minimumHistoryDays: "14 days",
    },
    connectedDrivers: [
      { id: "metric:nps", name: "Customer NPS Collapse", weight: "0.92" },
      { id: "metric:revenue", name: "Revenue Leakage", weight: "0.85" },
      { id: "metric:ticket_rate", name: "Customer Escalations", weight: "0.89" },
    ],
    accessRestrictions: {
      executive: ["Monthly recurring revenue (MRR) retention rate", "High-level attrition trend"],
      analyst: ["Cohort retention decay curves", "Cancellation survey taxonomy", "Subscriber lifetime value (LTV) deltas"],
    },
    governanceStatus: "ACTIVE_GOVERNED",
  },
  {
    id: "metric:inventory_turnover",
    displayName: "Inventory Turnover Ratio",
    domain: "Supply Chain & Ops",
    formula: "COGS / Average_Inventory_Value",
    unit: "Turns / month",
    grain: "Daily, per region × warehouse",
    sourceOfRecord: "SAP S/4HANA ERP & WMS (cross_domain_kpis.csv)",
    refreshCadence: "Daily at 00:00 UTC (T+6h)",
    minimumBaselineDays: 14,
    description: "Measures the velocity at which inventory is sold and replaced over a 30-day rolling window. When checkout issues reduce order volume, inventory turnover stalls within 48 hours, creating warehouse holding cost spikes.",
    requiredDataTypes: [
      { column: "date", type: "DATE (YYYY-MM-DD)", role: "Accounting calendar date" },
      { column: "warehouse_id", type: "VARCHAR(32)", role: "Distribution center identifier" },
      { column: "cogs_lakh_inr", type: "FLOAT", role: "Cost of goods sold" },
      { column: "inventory_valuation", type: "FLOAT", role: "Average warehouse asset value" },
      { column: "turns_ratio", type: "FLOAT", role: "Annualized turnover frequency" }
    ],
    lineage: [
      "sap_s4hana_cogs_ledger",
      "manhattan_wms_stock_snapshots",
      "supply_chain.inventory_velocity",
    ],
    materialityThresholds: {
      zScoreMin: "1.50σ",
      revenueAtStakeMin: "0.30 turns drop",
      minimumHistoryDays: "14 days",
    },
    connectedDrivers: [
      { id: "metric:revenue", name: "POS & Online Sales", weight: "0.88" },
      { id: "metric:order_volume", name: "Warehouse Dispatch Volume", weight: "0.81" },
    ],
    accessRestrictions: {
      executive: ["Working capital trapped in inventory", "Regional turnover averages"],
      analyst: ["SKU-level days of inventory on hand (DOH)", "Supplier lead times", "Safety stock thresholds"],
    },
    governanceStatus: "ACTIVE_GOVERNED",
  }
];

export default function Contracts() {
  const [contracts, setContracts] = useState(INITIAL_CONTRACTS);
  const [selectedContractId, setSelectedContractId] = useState(INITIAL_CONTRACTS[0].id);
  const [selectedDomain, setSelectedDomain] = useState("ALL");
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const filteredContracts = contracts.filter((c) => {
    if (selectedDomain === "ALL") return true;
    if (selectedDomain === "FINANCIAL") return c.id.includes("revenue") || c.id.includes("order") || c.id.includes("conversion");
    if (selectedDomain === "CX") return c.id.includes("nps") || c.id.includes("ticket");
    if (selectedDomain === "GROWTH") return c.id.includes("churn");
    if (selectedDomain === "OPS") return c.id.includes("inventory");
    return true;
  });

  const selectedContract = contracts.find((c) => c.id === selectedContractId) || contracts[0];

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
            <FileCode size={13} color="#A78BFA" />
            Governed Semantic Catalog & Business Context
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(1.8rem, 2.8vw, 2.4rem)",
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "-0.03em",
                fontFamily: "var(--font-heading)",
              }}
            >
              KPI Semantic Contracts & <span className="text-gradient-purple">Model Context</span>
            </h1>
            <p style={{ margin: "6px 0 0 0", color: "#9E9EB2", fontSize: "0.925rem" }}>
              Define governed metric definitions, required schemas, calculation formulas, and context rules so the AI model never hallucinates math.
            </p>
          </div>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="btn-primary"
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Plus size={15} />
            <span>Register New Contract</span>
          </button>
        </div>
      </div>

      {/* Domain Pillar Filter Pills */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {[
          { id: "ALL", label: "All Governed Pillars", count: contracts.length },
          { id: "FINANCIAL", label: "Financial & Revenue", count: 3 },
          { id: "CX", label: "Customer Experience & NPS", count: 2 },
          { id: "GROWTH", label: "Growth & Retention", count: 1 },
          { id: "OPS", label: "Supply Chain & Ops", count: 1 },
        ].map((pill) => {
          const active = selectedDomain === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setSelectedDomain(pill.id)}
              style={{
                padding: "6px 14px",
                borderRadius: "9999px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                border: active ? "1px solid rgba(139, 92, 246, 0.45)" : "1px solid rgba(255, 255, 255, 0.1)",
                background: active ? "rgba(139, 92, 246, 0.15)" : "rgba(255, 255, 255, 0.04)",
                color: active ? "#C4B5FD" : "#9E9EB2",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 140ms ease",
              }}
            >
              <span>{pill.label}</span>
              <span style={{ opacity: 0.7, fontSize: "0.72rem" }}>({pill.count})</span>
            </button>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "24px" }}>
        
        {/* Left: Contracts Sidebar */}
        <div className="bento-card" style={{ padding: "18px", height: "fit-content" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9E9EB2", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px", padding: "0 4px" }}>
            Governed Metrics ({filteredContracts.length})
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filteredContracts.map((c) => {
              const active = c.id === selectedContractId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedContractId(c.id)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: active ? "rgba(139, 92, 246, 0.14)" : "rgba(255, 255, 255, 0.03)",
                    border: active ? "1px solid rgba(139, 92, 246, 0.4)" : "1px solid rgba(255, 255, 255, 0.08)",
                    cursor: "pointer",
                    transition: "all 140ms ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: active ? "#FFFFFF" : "#F4F4F6" }}>
                      {c.displayName}
                    </span>
                    <span className="badge badge--success" style={{ fontSize: "0.62rem" }}>
                      Governed
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "0.72rem", color: active ? "#C4B5FD" : "#9E9EB2", fontFamily: "var(--font-mono)" }}>
                      {c.id}
                    </div>
                    {c.domain && (
                      <span style={{ fontSize: "0.65rem", color: "#A78BFA", fontWeight: 600 }}>
                        {c.domain}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Contract Details */}
        <div className="bento-card" style={{ padding: "30px" }}>
          
          {/* Top Title & Cadence */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#A78BFA", fontFamily: "var(--font-mono)", fontWeight: 700, marginBottom: "4px" }}>
                {selectedContract.id}
              </div>
              <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#FFFFFF" }}>
                {selectedContract.displayName}
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: "#9E9EB2" }}>
              <Clock size={13} color="#A78BFA" />
              <span>Refresh: <strong style={{ color: "#FFFFFF" }}>{selectedContract.refreshCadence}</strong></span>
            </div>
          </div>

          {/* AI Learning & Business Context Box */}
          <div style={{ background: "rgba(139, 92, 246, 0.12)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "10px", padding: "16px 20px", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <Brain size={14} color="#A78BFA" />
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#C4B5FD", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Internal Model Learning & Business Context
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#F4F4F6", lineHeight: 1.6 }}>
              {selectedContract.description}
            </p>
          </div>

          {/* Formula Block */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9E9EB2", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
              Formula & Aggregation Rule
            </div>
            <div style={{ background: "#0B0D14", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "14px 18px", fontFamily: "var(--font-mono)", color: "#34D399", fontSize: "0.9rem", fontWeight: 600 }}>
              {selectedContract.formula}
            </div>
            <div style={{ display: "flex", gap: "24px", marginTop: "10px", fontSize: "0.78rem", color: "#9E9EB2" }}>
              <span>Measurement Unit: <strong style={{ color: "#FFFFFF" }}>{selectedContract.unit}</strong></span>
              <span>Temporal Grain: <strong style={{ color: "#FFFFFF" }}>{selectedContract.grain}</strong></span>
            </div>
          </div>

          {/* Schema Table */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9E9EB2", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
              Required Data Source Schema & Types
            </div>
            <div style={{ overflowX: "auto", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "10px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ background: "rgba(255, 255, 255, 0.04)", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <th style={{ padding: "10px 14px", textAlign: "left", color: "#9E9EB2", fontWeight: 700 }}>Field Column Name</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", color: "#9E9EB2", fontWeight: 700 }}>Expected Data Type</th>
                    <th style={{ padding: "10px 14px", textAlign: "left", color: "#9E9EB2", fontWeight: 700 }}>Role in Analytical Engine</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedContract.requiredDataTypes.map((dt, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.06)" }}>
                      <td style={{ padding: "10px 14px", color: "#FFFFFF", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{dt.column}</td>
                      <td style={{ padding: "10px 14px", color: "#FBBF24", fontFamily: "var(--font-mono)" }}>{dt.type}</td>
                      <td style={{ padding: "10px 14px", color: "#9E9EB2" }}>{dt.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Materiality Thresholds & Role Restrictions 2-Col Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            
            {/* Thresholds */}
            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "18px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9E9EB2", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                Materiality & Anomaly Thresholds
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9E9EB2" }}>Minimum Z-Score:</span>
                  <span style={{ color: "#EF4444", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{selectedContract.materialityThresholds.zScoreMin}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9E9EB2" }}>Material Business Floor:</span>
                  <span style={{ color: "#F59E0B", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{selectedContract.materialityThresholds.revenueAtStakeMin}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9E9EB2" }}>Baseline Abstention:</span>
                  <span style={{ color: "#A78BFA", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{selectedContract.materialityThresholds.minimumHistoryDays}</span>
                </div>
              </div>
            </div>

            {/* Access Restrictions */}
            <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "18px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9E9EB2", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                Role-Based Context Visibility
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.78rem" }}>
                <div>
                  <span style={{ color: "#A78BFA", fontWeight: 700 }}>Executive Persona: </span>
                  <span style={{ color: "#E2E8F0" }}>{selectedContract.accessRestrictions.executive.join(" · ")}</span>
                </div>
                <div>
                  <span style={{ color: "#06B6D4", fontWeight: 700 }}>Analyst Persona: </span>
                  <span style={{ color: "#E2E8F0" }}>{selectedContract.accessRestrictions.analyst.join(" · ")}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: "20px" }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bento-card"
            style={{ width: "100%", maxWidth: "560px", padding: "28px" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF" }}>
                Register New Metric Semantic Contract
              </h3>
              <button onClick={() => setShowRegisterModal(false)} style={{ background: "transparent", border: "none", color: "#71717A", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: "0 0 20px 0", fontSize: "0.85rem", color: "#A1A1AA" }}>
              Registering a semantic contract enables the deterministic engine and Ollama copilot to validate and narrate this metric without hallucinations.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "24px" }}>
              <div>
                <label style={{ fontSize: "0.72rem", color: "#71717A", display: "block", marginBottom: "4px", fontWeight: 700, textTransform: "uppercase" }}>Metric Identifier (URN)</label>
                <input placeholder="e.g. metric:gross_margin" style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#FFF", fontSize: "0.85rem", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.72rem", color: "#71717A", display: "block", marginBottom: "4px", fontWeight: 700, textTransform: "uppercase" }}>Formula SQL / Math Expression</label>
                <input placeholder="e.g. (SUM(revenue) - SUM(cogs)) / SUM(revenue)" style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#FFF", fontSize: "0.85rem", outline: "none" }} />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setShowRegisterModal(false)} className="btn-secondary" style={{ padding: "8px 16px", borderRadius: "8px" }}>Cancel</button>
              <button onClick={() => setShowRegisterModal(false)} className="btn-primary" style={{ padding: "8px 20px", borderRadius: "8px" }}>Save Contract</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
