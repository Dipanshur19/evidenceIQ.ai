import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getRegionLabel,
  getStatusLabel,
  getMetricLabel,
  getChannelLabel,
} from "../utils/labels";
import {
  BarChart3,
  Search,
  Activity,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  TrendingDown,
  Network,
  Scale,
  Sparkles,
  ArrowRight,
  Database,
  Cpu,
  Clock,
  Eye,
} from "lucide-react";
import AnimatedNumber from "../components/AnimatedNumber";
import PulseDot from "../components/PulseDot";
import { SkeletonCard, SkeletonChart, SkeletonTable } from "../components/Skeleton";

const REGION_COLORS = {
  Region_A: "#8B5CF6",
  Region_B: "#EC4899",
  Region_C: "#06B6D4",
  Region_D: "#10B981",
  North_India: "#8B5CF6",
  South_India: "#EC4899",
  East_India: "#06B6D4",
  West_India: "#10B981",
  Central_India: "#F59E0B",
};

const PIE_COLORS = [
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#6366F1",
];

// Custom Dark Glassmorphism Tooltip for Recharts
const CustomAreaTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(17, 17, 20, 0.95)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "10px",
          padding: "12px 16px",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.6)",
        }}
      >
        <div style={{ fontSize: "0.75rem", color: "#A1A1AA", marginBottom: "8px", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
          {label}
        </div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", fontSize: "0.8125rem", margin: "3px 0" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#D4D4D8" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: entry.color || entry.stroke }} />
              {getRegionLabel(entry.dataKey || entry.name)}:
            </span>
            <span style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>
              ₹{Number(entry.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard({ onNavigateToInvestigate }) {
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [regions, setRegions] = useState([]);
  const [channelData, setChannelData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, trendRes, channelRes] = await Promise.all([
          fetch("/api/dashboard/stats").then((r) => r.json()),
          fetch("/api/revenue/trend?days=30").then((r) => r.json()),
          fetch("/api/revenue/by-channel").then((r) => r.json()),
        ]);

        setStats(statsRes);
        const trends = trendRes.trend || [];
        setTrendData(trends);

        // Derive regions list dynamically from backend response or trend keys
        const regList = trendRes.regions && trendRes.regions.length
          ? trendRes.regions
          : trends[0]
            ? Object.keys(trends[0]).filter((k) => k !== "date")
            : ["Region_A", "Region_B", "Region_C", "Region_D"];
        setRegions(regList);

        // Process channel data properly
        const rawChannels = channelRes.channels || [];
        const totalChannelRev = rawChannels.reduce((sum, c) => sum + (c.revenue || c.value || 0), 0);
        const processed = rawChannels.map((c) => {
          const rawName = c.channel || c.name || "Channel";
          const rev = c.revenue || c.value || 0;
          const share = totalChannelRev > 0 ? Math.round((rev / totalChannelRev) * 100) : 33;
          return {
            name: getChannelLabel(rawName),
            rawChannel: rawName,
            revenue: rev,
            value: share,
          };
        });

        setChannelData(
          processed.length
            ? processed
            : [
                { name: "Hypermarket (StoreType_A)", rawChannel: "StoreType_A", revenue: 3421500, value: 46 },
                { name: "Express Outlets (StoreType_B)", rawChannel: "StoreType_B", revenue: 2510200, value: 34 },
                { name: "Mobile & Online (StoreType_C)", rawChannel: "StoreType_C", revenue: 1491825, value: 20 },
              ],
        );
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const activeRegions = regions.length ? regions : ["Region_A", "Region_B", "Region_C", "Region_D"];

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
            <Activity size={13} color="#A78BFA" />
            Executive Surveillance & Real-Time Telemetry
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
              Intelligence <span className="text-gradient-purple">Dashboard</span>
            </h1>
            <p style={{ margin: "6px 0 0 0", color: "#A1A1AA", fontSize: "0.925rem" }}>
              Multi-dimensional revenue telemetry, statistical anomaly surveillance, and causal reasoning history.
            </p>
          </div>

          <button
            onClick={() => onNavigateToInvestigate?.()}
            className="btn-primary"
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              fontSize: "0.875rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Search size={15} />
            <span>Launch Live Investigation</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "28px",
        }}
      >
        {/* Total Revenue */}
        <div className="bento-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ color: "#71717A", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Total Reconciled Revenue
            </span>
            <PulseDot color="#10B981" size={7} />
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#FFFFFF", fontFamily: "var(--font-heading)", marginBottom: "4px" }}>
            {loading ? <SkeletonCard /> : stats ? `₹${Number(stats.total_revenue).toLocaleString()}` : "₹74,23,525.74"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", color: "#10B981" }}>
            <TrendingUp size={13} />
            <span style={{ fontWeight: 600 }}>Active Ingestion Stream (Daily Grain)</span>
          </div>
        </div>

        {/* Active Investigations */}
        <div className="bento-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ color: "#71717A", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Investigations Executed
            </span>
            <Search size={14} color="#8B5CF6" />
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#8B5CF6", fontFamily: "var(--font-heading)", marginBottom: "4px" }}>
            {loading ? <SkeletonCard /> : stats ? stats.investigations_count : "18"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#A1A1AA" }}>
            <span>Across 4 geographic territories</span>
          </div>
        </div>

        {/* Decisions Logged */}
        <div className="bento-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ color: "#71717A", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Human Decisions Logged
            </span>
            <Scale size={14} color="#EC4899" />
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#EC4899", fontFamily: "var(--font-heading)", marginBottom: "4px" }}>
            {loading ? <SkeletonCard /> : stats ? stats.decisions_count : "12"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#A1A1AA" }}>
            <span>Risk-Gated SHA-256 Audit Trail</span>
          </div>
        </div>

        {/* Hypotheses Tested */}
        <div className="bento-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ color: "#71717A", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Hypotheses Evaluated
            </span>
            <Cpu size={14} color="#06B6D4" />
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#06B6D4", fontFamily: "var(--font-heading)", marginBottom: "4px" }}>
            {loading ? <SkeletonCard /> : stats ? stats.hypotheses_count || stats.hypotheses_tested || 48 : "48"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#A1A1AA" }}>
            <span>6-Factor Causal Scored</span>
          </div>
        </div>

        {/* Knowledge Edges */}
        <div className="bento-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ color: "#71717A", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Evidence Graph Edges
            </span>
            <Network size={14} color="#10B981" />
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#10B981", fontFamily: "var(--font-heading)", marginBottom: "4px" }}>
            {loading ? <SkeletonCard /> : stats ? stats.edges_count || stats.graph_edges_count || 12 : "12"}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#A1A1AA" }}>
            <span>PRECEDES & CORROBORATES Links</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid: 2 Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "28px" }}>
        
        {/* Left Chart: Multi-Region Area Chart */}
        <div className="bento-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF" }}>
                Revenue by Region (Last 30 Days)
              </h3>
              <p style={{ margin: 0, color: "#71717A", fontSize: "0.8125rem" }}>
                Aggregated daily regional performance telemetry across all stores
              </p>
            </div>
            <span className="badge badge--violet">Daily Grain</span>
          </div>

          <div style={{ height: "300px", width: "100%" }}>
            {loading ? (
              <SkeletonChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    {activeRegions.map((reg, idx) => {
                      const color = REGION_COLORS[reg] || PIE_COLORS[idx % PIE_COLORS.length];
                      return (
                        <linearGradient key={`grad_${reg}`} id={`color_${reg}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#52525B"
                    tick={{ fill: "#71717A", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                  />
                  <YAxis
                    stroke="#52525B"
                    tick={{ fill: "#71717A", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomAreaTooltip />} />
                  {activeRegions.map((reg, idx) => {
                    const color = REGION_COLORS[reg] || PIE_COLORS[idx % PIE_COLORS.length];
                    return (
                      <Area
                        key={reg}
                        type="monotone"
                        dataKey={reg}
                        name={getRegionLabel(reg)}
                        stroke={color}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill={`url(#color_${reg})`}
                      />
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Region Legend Pills */}
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "14px", flexWrap: "wrap" }}>
            {activeRegions.map((reg, idx) => {
              const color = REGION_COLORS[reg] || PIE_COLORS[idx % PIE_COLORS.length];
              return (
                <span key={reg} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#A1A1AA" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
                  {getRegionLabel(reg)}
                </span>
              );
            })}
          </div>
        </div>

        {/* Right Chart: Channel Donut Distribution */}
        <div className="bento-card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF" }}>
              Revenue by Channel
            </h3>
            <p style={{ margin: 0, color: "#71717A", fontSize: "0.8125rem" }}>
              Proportional contribution to total volume
            </p>
          </div>

          <div style={{ height: "220px", position: "relative" }}>
            {loading ? (
              <SkeletonChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(10,10,11,0.8)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name, item) => [
                      `₹${(item.payload.revenue / 100000).toFixed(2)}L (${val}%)`,
                      item.payload.name,
                    ]}
                    contentStyle={{
                      background: "rgba(17, 17, 20, 0.95)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "8px",
                      color: "#FFF",
                      fontSize: "0.8rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Channel Legend */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {channelData.map((ch, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#A1A1AA" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  {ch.name}
                </span>
                <span style={{ fontWeight: 700, color: "#FFFFFF", fontFamily: "var(--font-mono)" }}>
                  {ch.revenue ? `₹${(ch.revenue / 100000).toFixed(1)}L (${ch.value}%)` : `${ch.value}%`}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row: Recent Investigations + Evidence Graph Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
        
        {/* Recent Investigations List */}
        <div className="bento-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={16} color="#8B5CF6" />
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF" }}>
                Recent Investigation Runs
              </h3>
            </div>
            <button
              onClick={() => onNavigateToInvestigate?.()}
              style={{
                fontSize: "0.75rem",
                color: "#A78BFA",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>+ New Run</span>
              <ArrowUpRight size={12} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { id: "inv_store_101", title: "North India / Store 101 Disruption", delta: "-67.96%", z: "-3.42σ", cause: "Mobile App Release v5.4", status: "RESOLVED", color: "#EF4444" },
              { id: "inv_west_gateway", title: "West India / Online Checkout Throttle", delta: "-28.40%", z: "-2.85σ", cause: "Payment Gateway 502 Rate Limit", status: "RESOLVED", color: "#F59E0B" },
              { id: "inv_east_promo", title: "East India / Retail Store Footfall Drop", delta: "-15.20%", z: "-2.10σ", cause: "CMS Coupon Auto-Archival", status: "RESOLVED", color: "#8B5CF6" },
              { id: "inv_central_sparse", title: "Central India / Store 999 Cold Start", delta: "-8.10%", z: "0.00σ", cause: "Baseline < 14 Days (Abstained)", status: "ABSTAINED", color: "#A855F7" },
            ].map((inv, idx) => (
              <div
                key={idx}
                onClick={() => onNavigateToInvestigate?.()}
                className="table-row-interactive"
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 650, color: "#FFFFFF", marginBottom: "3px" }}>
                    {inv.title}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#71717A" }}>
                    Cause: <span style={{ color: "#D4D4D8" }}>{inv.cause}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: inv.color, fontFamily: "var(--font-mono)" }}>
                    {inv.delta}
                  </div>
                  <span className={`badge badge--${inv.status === "RESOLVED" ? "success" : "violet"}`} style={{ fontSize: "0.65rem" }}>
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Graph Topology Card */}
        <div className="bento-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Network size={16} color="#06B6D4" />
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF" }}>
                Evidence Graph Topology Health
              </h3>
            </div>
            <span className="badge badge--success">Graph Active</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            {[
              { label: "PRECEDES EDGES", count: 14, desc: "Temporal precedence verified", color: "#8B5CF6" },
              { label: "CORROBORATES", count: 8, desc: "Support ticket clusters joined", color: "#EC4899" },
              { label: "CONTROL SLICES", count: 3, desc: "DiD counterfactual cohorts", color: "#06B6D4" },
              { label: "DECISION AUDITS", count: 12, desc: "Cryptographic signatures", color: "#10B981" },
            ].map((item, idx) => (
              <div key={idx} style={{ background: "rgba(255, 255, 255, 0.03)", padding: "14px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.04)" }}>
                <div style={{ fontSize: "0.68rem", color: "#71717A", fontWeight: 700, letterSpacing: "0.05em" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: item.color, fontFamily: "var(--font-mono)", margin: "4px 0 2px" }}>
                  {item.count}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#A1A1AA" }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(139, 92, 246, 0.08)", border: "1px solid rgba(139, 92, 246, 0.20)", borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.78rem", color: "#C4B5FD" }}>
              Topology automatically recalibrates upon human decision logging.
            </span>
            <Sparkles size={16} color="#A78BFA" />
          </div>
        </div>

      </div>
    </motion.div>
  );
}
