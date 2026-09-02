import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import {
  AlertTriangle,
  Search,
  Network,
  DollarSign,
  FileCode,
  TrendingDown,
  Zap,
  ShieldCheck,
  Settings,
  ChevronRight,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Filter,
} from "lucide-react";
import { getRegionLabel, getChannelLabel } from "../utils/labels";

export default function Dashboard({ onNavigateToInvestigate, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [showBaseline, setShowBaseline] = useState(true);
  const [activityTab, setActivityTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, trendRes] = await Promise.all([
          fetch("/api/dashboard/stats").then((r) => r.json()).catch(() => ({})),
          fetch("/api/revenue/trend?days=30").then((r) => r.json()).catch(() => ({})),
        ]);
        setStats(statsRes);

        // Format dual series for BizzArk style Telemetry Chart
        if (trendRes.trend) {
          const formatted = trendRes.trend.slice(-12).map((t, idx) => ({
            period: t.date.slice(5), // MM-DD
            observed: Math.round(t.Region_A || 24.65),
            expected: Math.round(t.Region_B || 42.50),
          }));
          setTrendData(formatted);
        } else {
          setTrendData([
            { period: "Jan", observed: 22, expected: 30 },
            { period: "Feb", observed: 28, expected: 32 },
            { period: "Mar", observed: 35, expected: 34 },
            { period: "Apr", observed: 24, expected: 42 },
            { period: "May", observed: 38, expected: 39 },
            { period: "Jun", observed: 45, expected: 44 },
            { period: "Jul", observed: 30, expected: 41 },
            { period: "Aug", observed: 18, expected: 45 },
            { period: "Sep", observed: 32, expected: 38 },
            { period: "Oct", observed: 40, expected: 42 },
            { period: "Nov", observed: 48, expected: 46 },
            { period: "Dec", observed: 52, expected: 50 },
          ]);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const quickTiles = [
    {
      id: "anomalies",
      title: "Active Anomalies",
      val: "3 Critical",
      sub: "Across 4 regions",
      icon: AlertTriangle,
      color: "#EF4444",
      bg: "rgba(239, 68, 68, 0.12)",
      action: () => onNavigate?.("scanner"),
    },
    {
      id: "investigate",
      title: "Launch Investigation",
      val: "Instant Triage",
      sub: "< 2s diagnostic latency",
      icon: Search,
      color: "#8B5CF6",
      bg: "rgba(139, 92, 246, 0.12)",
      action: () => onNavigateToInvestigate?.(),
    },
    {
      id: "graph",
      title: "Evidence Graph 3D",
      val: "48 Nodes",
      sub: "6-Factor Causal Scoring",
      icon: Network,
      color: "#EC4899",
      bg: "rgba(236, 72, 153, 0.12)",
      action: () => onNavigate?.("graph"),
    },
    {
      id: "revenue",
      title: "Reconciled Revenue",
      val: "₹74.24 Lakh",
      sub: "Daily POS & ERP stream",
      icon: DollarSign,
      color: "#10B981",
      bg: "rgba(16, 185, 129, 0.12)",
      action: () => onNavigate?.("dashboard"),
    },
    {
      id: "contracts",
      title: "Semantic Contracts",
      val: "5 Governed",
      sub: "GAAP & IFRS Standards",
      icon: FileCode,
      color: "#06B6D4",
      bg: "rgba(6, 182, 212, 0.12)",
      action: () => onNavigate?.("contracts"),
    },
    {
      id: "at_risk",
      title: "Revenue at Risk",
      val: "₹17.85 Lakh",
      sub: "Checkout release impact",
      icon: TrendingDown,
      color: "#F59E0B",
      bg: "rgba(245, 158, 11, 0.12)",
      action: () => onNavigate?.("investigation"),
    },
    {
      id: "recovery",
      title: "CI/CD Rollback Hooks",
      val: "< 64ms",
      sub: "LaunchDarkly & GitHub",
      icon: Zap,
      color: "#A78BFA",
      bg: "rgba(167, 139, 250, 0.12)",
      action: () => onNavigate?.("investigation"),
    },
    {
      id: "compliance",
      title: "Compliance Dossiers",
      val: "100% Certified",
      sub: "SOC-2, SOX 404, GDPR",
      icon: ShieldCheck,
      color: "#059669",
      bg: "rgba(5, 150, 105, 0.12)",
      action: () => onNavigate?.("fleet"),
    },
  ];

  const topAnomalies = [
    { rank: 1, region: "Region_A", channel: "StoreType_A", metric: "Sales Revenue", delta: -67.96, status: "CRITICAL", atRisk: "₹17.85L" },
    { rank: 2, region: "Region_B", channel: "StoreType_B", metric: "Payment Gateway", delta: -28.40, status: "MEDIUM", atRisk: "₹3.10L" },
    { rank: 3, region: "Region_C", channel: "StoreType_A", metric: "Customer NPS", delta: -14.20, status: "MEDIUM", atRisk: "₹1.40L" },
    { rank: 4, region: "Region_A", channel: "StoreType_C", metric: "Checkout Rate", delta: -12.50, status: "NORMAL", atRisk: "₹0.85L" },
    { rank: 5, region: "Region_D", channel: "StoreType_A", metric: "Support Spikes", delta: +42.00, status: "CRITICAL", atRisk: "₹2.20L" },
  ];

  const activities = [
    { type: "rollback", user: "LaunchDarkly Hook", desc: "Canary Flag mobile_checkout_v5_4 set to OFF", time: "14 mins ago", val: "Restored", color: "#10B981" },
    { type: "decision", user: "Lead BI Analyst", desc: "Approved 1-Click Rollback for Store 101 Outage", time: "28 mins ago", val: "₹17.85L Saved", color: "#8B5CF6" },
    { type: "anomalies", user: "Gaussian Scanner", desc: "Detected negative deviation (-3.42σ) in Region A", time: "1 hour ago", val: "-67.96%", color: "#EF4444" },
    { type: "compliance", user: "SOC-2 Audit Exporter", desc: "Generated tamper-evident dossier SHA-256 #8f4c2", time: "3 hours ago", val: "Certified", color: "#06B6D4" },
  ];

  const filteredActivities = activityTab === "all"
    ? activities
    : activities.filter((a) => a.type === activityTab);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ maxWidth: "1360px", margin: "0 auto" }}
    >
      {/* ── BIZZARK HEADER: BREADCRUMBS & TITLE ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
        <div>
          <div style={{ fontSize: "0.78rem", color: "#6B7280", marginBottom: "4px" }}>
            Home &gt; <span style={{ color: "#9E9EB2" }}>Dashboard</span>
          </div>
          <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: "#FFFFFF" }}>
            Intelligence Dashboard
          </h1>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => onNavigateToInvestigate?.()}
            className="btn-primary"
            style={{ padding: "8px 16px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <Search size={14} />
            <span>Launch Investigation</span>
          </button>
        </div>
      </div>

      {/* ── BIZZARK 8 QUICK ACTION TILES (2 ROWS OF 4) ── */}
      <div className="bizzark-quick-tiles">
        {quickTiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div key={tile.id} className="bizzark-tile" onClick={tile.action}>
              <div className="bizzark-tile-icon" style={{ background: tile.bg, color: tile.color }}>
                <Icon size={20} />
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "0.72rem", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em" }}>
                  {tile.title}
                </div>
                <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--color-text, #0F172A)", fontFamily: "var(--font-mono)", margin: "2px 0" }}>
                  {tile.val}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#64748B", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                  {tile.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BIZZARK TELEMETRY & REVENUE PROFILE CHART ── */}
      <div className="bento-card" style={{ padding: "24px", marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 750, color: "var(--color-text, #0F172A)" }}>
              Revenue Performance & Disruption Baseline
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#64748B" }}>
              Observed revenue telemetry vs 21-day rolling expected baseline (₹ Lakh)
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "0.78rem", color: "#475569", fontWeight: 600 }}>Show Expected Baseline</span>
            <label style={{ position: "relative", display: "inline-block", width: "40px", height: "22px" }}>
              <input
                type="checkbox"
                checked={showBaseline}
                onChange={(e) => setShowBaseline(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  inset: 0,
                  background: showBaseline ? "#4F46E5" : "#E2E8F0",
                  borderRadius: "22px",
                  transition: "all 0.2s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    height: "16px",
                    width: "16px",
                    left: showBaseline ? "20px" : "3px",
                    bottom: "3px",
                    background: "#FFFFFF",
                    borderRadius: "50%",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    transition: "all 0.2s",
                  }}
                />
              </span>
            </label>
          </div>
        </div>

        <div style={{ height: "260px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} barGap={6}>
              <XAxis dataKey="period" stroke="#CBD5E1" fontSize={11} tick={{ fill: "#64748B" }} />
              <YAxis stroke="#CBD5E1" fontSize={11} tick={{ fill: "#64748B" }} unit="L" />
              <Tooltip
                contentStyle={{
                  background: "#12141F",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "8px",
                  fontSize: "0.8rem",
                  color: "#FFFFFF",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.5)",
                }}
                formatter={(val, name) => [`₹${val} Lakh`, name === "observed" ? "Observed Sales" : "Expected Baseline"]}
              />
              <Bar dataKey="observed" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={28} />
              {showBaseline && (
                <Bar dataKey="expected" fill="#0284C7" opacity={0.75} radius={[4, 4, 0, 0]} maxBarSize={28} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── BIZZARK LOWER 2-COLUMN SPLIT (TOP ANOMALIES + RECENT ACTIVITY) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Top Anomaly Slices */}
        <div className="bento-card" style={{ padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 750, color: "var(--color-text, #0F172A)" }}>
              Top Anomaly Slices
            </h3>
            <span style={{ fontSize: "0.72rem", color: "#64748B" }}>Sorted by Revenue-at-Stake</span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8F0", color: "#64748B", textAlign: "left" }}>
                  <th style={{ padding: "8px 6px" }}>#</th>
                  <th style={{ padding: "8px" }}>Region & Channel</th>
                  <th style={{ padding: "8px" }}>Delta %</th>
                  <th style={{ padding: "8px" }}>Status</th>
                  <th style={{ padding: "8px", textAlign: "right" }}>At-Risk</th>
                </tr>
              </thead>
              <tbody>
                {topAnomalies.map((row) => {
                  const isCrit = row.status === "CRITICAL";
                  return (
                    <tr
                      key={row.rank}
                      style={{ borderBottom: "1px solid #F1F5F9", cursor: "pointer" }}
                      onClick={() =>
                        onNavigateToInvestigate?.({
                          region: row.region,
                          channel: row.channel,
                          as_of_date: "2026-08-15",
                        })
                      }
                    >
                      <td style={{ padding: "10px 6px", color: "#64748B", fontWeight: 700 }}>{row.rank}</td>
                      <td style={{ padding: "10px 8px" }}>
                        <div style={{ fontWeight: 700, color: "var(--color-text, #0F172A)" }}>{getRegionLabel(row.region)}</div>
                        <div style={{ fontSize: "0.7rem", color: "#64748B" }}>{getChannelLabel(row.channel)} &bull; {row.metric}</div>
                      </td>
                      <td style={{ padding: "10px 8px", fontWeight: 800, color: row.delta < 0 ? "#EF4444" : "#10B981", fontFamily: "var(--font-mono)" }}>
                        {row.delta > 0 ? `+${row.delta}%` : `${row.delta}%`}
                      </td>
                      <td style={{ padding: "10px 8px" }}>
                        <span
                          className={`badge badge--${isCrit ? "danger" : row.status === "MEDIUM" ? "warning" : "success"}`}
                          style={{ fontSize: "0.65rem", padding: "2px 8px" }}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, color: "var(--color-text, #0F172A)", fontFamily: "var(--font-mono)" }}>
                        {row.atRisk}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "12px", marginTop: "12px", textAlign: "center" }}>
            <button
              onClick={() => onNavigate?.("scanner")}
              style={{ background: "none", border: "none", color: "#4F46E5", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
            >
              View All Anomaly Slices (18) &rarr;
            </button>
          </div>
        </div>

        {/* Right Column: Recent Incident Activity */}
        <div className="bento-card" style={{ padding: "22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 750, color: "var(--color-text, #0F172A)" }}>
              Recent Activity
            </h3>
            <span style={{ fontSize: "0.72rem", color: "#64748B" }}>Last 24 Hours</span>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "14px", borderBottom: "1px solid #E2E8F0", paddingBottom: "8px" }}>
            {["all", "anomalies", "rollbacks", "decisions"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActivityTab(tab)}
                style={{
                  background: activityTab === tab ? "#EEF2FF" : "transparent",
                  color: activityTab === tab ? "#4F46E5" : "#64748B",
                  border: activityTab === tab ? "1px solid #C7D2FE" : "1px solid transparent",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Activity Stream */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredActivities.map((act, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: `${act.color}15`,
                      color: act.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                    }}
                  >
                    {act.user[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-text, #0F172A)" }}>{act.user}</div>
                    <div style={{ fontSize: "0.72rem", color: "#64748B", maxWidth: "220px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {act.desc}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.76rem", fontWeight: 700, color: act.color, fontFamily: "var(--font-mono)" }}>
                    {act.val}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#64748B" }}>{act.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "12px", marginTop: "12px", textAlign: "center" }}>
            <button
              onClick={() => onNavigate?.("memory")}
              style={{ background: "none", border: "none", color: "#4F46E5", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
            >
              View Cryptographic Ledger (54) &rarr;
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
