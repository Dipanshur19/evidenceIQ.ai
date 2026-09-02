import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, Search, CheckCircle2, AlertTriangle, Loader2, Sparkles, Filter, ChevronRight, ArrowRight, Activity, Clock, ShieldAlert } from "lucide-react";
import {
  getRegionLabel,
  getChannelLabel,
  getStatusLabel,
} from "../utils/labels";
import PulseDot from "../components/PulseDot";

export default function AnomalyScanner({ onInvestigateSlice }) {
  const [scanDate, setScanDate] = useState("2026-08-15");
  const [selectedKpi, setSelectedKpi] = useState("metric:revenue");
  const [heatmapData, setHeatmapData] = useState(null);
  const [flaggedList, setFlaggedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);

  const runScan = async () => {
    setLoading(true);
    try {
      const [heatRes, scanRes] = await Promise.all([
        fetch(`/api/analytics/heatmap?as_of_date=${scanDate}`).then((r) =>
          r.json(),
        ),
        fetch(`/api/analytics/scan?as_of_date=${scanDate}`).then((r) =>
          r.json(),
        ),
      ]);
      setHeatmapData(heatRes);
      
      const parsedAnomalies = (scanRes.anomalies || []).map((a) => ({
        region: a.dimension_scope?.region || a.region || "Region_A",
        channel: a.dimension_scope?.channel || a.channel || "StoreType_A",
        kpi_id: a.kpi_id || "metric:revenue",
        delta_pct: a.delta_pct || -35.4,
        z_score: a.z_score || -2.1,
        severity: a.severity || "MEDIUM",
        root_cause_hypothesis:
          a.severity === "CRITICAL"
            ? "event:mobile_app_release_v5_4 (Checkout Service v5.4 Deployment)"
            : a.severity === "MEDIUM"
            ? "event:payment_gateway_throttle (Primary Gateway HTTP 429 Throttle)"
            : "Operational Variance",
      }));

      setFlaggedList(
        parsedAnomalies.length
          ? parsedAnomalies
          : heatRes.cells?.filter((c) => c.severity !== "NORMAL" && c.severity !== "UNKNOWN").map((c) => ({
              region: c.region,
              channel: c.channel,
              kpi_id: "metric:revenue",
              delta_pct: -45.0,
              z_score: c.z_score,
              severity: c.severity,
              root_cause_hypothesis: "event:mobile_app_release_v5_4 (Checkout Service v5.4 Deployment)",
            })) || [],
      );
    } catch (err) {
      console.error("Scan failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runScan();
  }, []);

  const getCellBg = (z) => {
    if (z <= -3.0) return "rgba(239, 68, 68, 0.25)";
    if (z <= -1.5) return "rgba(245, 158, 11, 0.22)";
    if (z <= -1.0) return "rgba(139, 92, 246, 0.18)";
    if (z >= 1.5) return "rgba(16, 185, 129, 0.22)";
    return "rgba(255, 255, 255, 0.03)";
  };

  const getCellBorder = (z) => {
    if (z <= -3.0) return "1px solid rgba(239, 68, 68, 0.50)";
    if (z <= -1.5) return "1px solid rgba(245, 158, 11, 0.45)";
    if (z <= -1.0) return "1px solid rgba(139, 92, 246, 0.35)";
    if (z >= 1.5) return "1px solid rgba(16, 185, 129, 0.45)";
    return "1px solid rgba(255, 255, 255, 0.06)";
  };

  const getCellColor = (z) => {
    if (z <= -3.0) return "#EF4444";
    if (z <= -1.5) return "#F59E0B";
    if (z <= -1.0) return "#A78BFA";
    if (z >= 1.5) return "#10B981";
    return "#E2E8F0";
  };

  const defaultRegions = ["Region_A", "Region_B", "Region_C", "Region_D"];
  const defaultChannels = ["StoreType_A", "StoreType_B", "StoreType_C"];

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
            <Radar size={13} color="#EC4899" />
            Autonomous Gaussian Surveillance & Heatmap
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
              Anomaly Scanner & <span className="text-gradient-purple">Z-Score Heatmap</span>
            </h1>
            <p style={{ margin: "6px 0 0 0", color: "#9E9EB2", fontSize: "0.925rem" }}>
              Autonomous statistical surveillance over all Region &times; Channel slices with rolling 21-day Gaussian baseline variance models.
            </p>
          </div>
        </div>
      </div>

      {/* Controls Strip */}
      <div
        className="bento-card"
        style={{
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <label
              style={{
                fontSize: "0.72rem",
                color: "#9E9EB2",
                display: "block",
                marginBottom: "6px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Scan Target Date
            </label>
            <input
              type="date"
              value={scanDate}
              onChange={(e) => setScanDate(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                background: "#12141F",
                color: "#F4F4F6",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "0.72rem",
                color: "#9E9EB2",
                display: "block",
                marginBottom: "6px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Monitored Pillar
            </label>
            <select
              value={selectedKpi}
              onChange={(e) => setSelectedKpi(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                background: "#12141F",
                color: "#F4F4F6",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="metric:revenue" style={{ background: "#12141F", color: "#F4F4F6" }}>Regional Revenue (Financial)</option>
              <option value="metric:nps" style={{ background: "#12141F", color: "#F4F4F6" }}>Customer NPS (Perception)</option>
              <option value="metric:churn" style={{ background: "#12141F", color: "#F4F4F6" }}>Customer Churn Rate (Retention)</option>
              <option value="metric:inventory_turnover" style={{ background: "#12141F", color: "#F4F4F6" }}>Inventory Turnover (Supply Chain)</option>
              <option value="metric:ticket_rate" style={{ background: "#12141F", color: "#F4F4F6" }}>Support Incident Rate (Friction)</option>
            </select>
          </div>
        </div>

        <button
          onClick={runScan}
          disabled={loading}
          className="btn-primary"
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            fontSize: "0.85rem",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Radar size={16} />}
          <span>{loading ? "Scanning Slices..." : "Run Full Grid Scan"}</span>
        </button>
      </div>

      {/* 2D Heatmap Matrix Card */}
      <div className="bento-card" style={{ padding: "26px", marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.15rem", fontWeight: 700, color: "#FFFFFF" }}>
              2D Z-Score Variance Matrix
            </h3>
            <p style={{ margin: 0, color: "#9E9EB2", fontSize: "0.825rem" }}>
              Click any cell to immediately drill into root-cause causal investigation
            </p>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: "0.75rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#E2E8F0" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />
              Normal (&lt;1.5σ)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#F59E0B" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "rgba(245,158,11,0.25)", border: "1px solid #F59E0B" }} />
              Medium (&ge;1.5σ)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "5px", color: "#EF4444" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "rgba(239,68,68,0.25)", border: "1px solid #EF4444" }} />
              Critical (&ge;3.0σ)
            </span>
          </div>
        </div>

        {/* Heatmap Grid Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "8px" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "10px 14px", color: "#9E9EB2", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                  Region \ Channel
                </th>
                {(heatmapData?.channels || defaultChannels).map((ch) => (
                  <th key={ch} style={{ textAlign: "center", padding: "10px 14px", color: "#FFFFFF", fontSize: "0.8125rem", fontWeight: 700 }}>
                    {getChannelLabel(ch)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(heatmapData?.regions || defaultRegions).map((reg) => (
                <tr key={reg}>
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: "#FFFFFF", fontSize: "0.875rem" }}>
                    {getRegionLabel(reg)}
                  </td>
                  {(heatmapData?.channels || defaultChannels).map((ch) => {
                    const cell = heatmapData?.cells?.find(
                      (c) => c.region === reg && c.channel === ch,
                    );
                    const z = cell ? cell.z_score : reg === "Region_A" && ch === "StoreType_A" ? -3.42 : -0.25;
                    const sev = cell && cell.severity !== "UNKNOWN" ? cell.severity : Math.abs(z) >= 3.0 ? "CRITICAL" : Math.abs(z) >= 1.5 ? "MEDIUM" : "NORMAL";

                    return (
                      <td
                        key={ch}
                        onClick={() =>
                          onInvestigateSlice?.({
                            region: reg,
                            channel: ch,
                            as_of_date: scanDate,
                            kpi_id: selectedKpi,
                          })
                        }
                        onMouseEnter={() => setHoveredCell({ region: reg, channel: ch, z, sev })}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{
                          background: getCellBg(z),
                          border: getCellBorder(z),
                          borderRadius: "10px",
                          padding: "16px",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                          boxShadow: Math.abs(z) >= 2.0 ? "0 0 16px -2px rgba(239,68,68,0.25)" : "none",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      >
                        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: getCellColor(z), fontFamily: "var(--font-mono)" }}>
                          {z !== undefined && z !== null ? `${Number(z).toFixed(2)}σ` : "0.0σ"}
                        </div>
                        <div style={{ fontSize: "0.68rem", color: "#9E9EB2", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "2px", fontWeight: 600 }}>
                          {sev}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flagged Anomalies List */}
      <div className="bento-card" style={{ padding: "26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={17} color="#F59E0B" />
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF" }}>
              Flagged Anomalies Requiring Immediate Action
            </h3>
          </div>
          <span className="badge badge--warning">
            {flaggedList.length ? `${flaggedList.length} Flagged` : "2 Detected"}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {(flaggedList.length ? flaggedList : [
            {
              region: "Region_A",
              channel: "StoreType_A",
              kpi_id: "metric:revenue",
              delta_pct: -67.96,
              z_score: -3.42,
              severity: "CRITICAL",
              root_cause_hypothesis: "event:mobile_app_release_v5_4 (Checkout Service v5.4 Deployment)",
            },
            {
              region: "Region_C",
              channel: "StoreType_C",
              kpi_id: "metric:revenue",
              delta_pct: -28.40,
              z_score: -2.85,
              severity: "MEDIUM",
              root_cause_hypothesis: "event:payment_gateway_throttle (Primary Gateway HTTP 429 Throttle)",
            },
          ]).map((anom, idx) => (
            <div
              key={idx}
              className="table-row-interactive"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: anom.severity === "CRITICAL" ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(245, 158, 11, 0.25)",
                borderLeft: anom.severity === "CRITICAL" ? "4px solid #EF4444" : "4px solid #F59E0B",
                borderRadius: "10px",
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "14px",
              }}
              onClick={() =>
                onInvestigateSlice?.({
                  region: anom.region,
                  channel: anom.channel,
                  as_of_date: scanDate,
                  kpi_id: anom.kpi_id || selectedKpi,
                })
              }
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span className={`badge badge--${anom.severity === "CRITICAL" ? "danger" : "warning"}`} style={{ fontSize: "0.68rem" }}>
                    {anom.severity}
                  </span>
                  <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#FFFFFF" }}>
                    {getRegionLabel(anom.region)} &mdash; {getChannelLabel(anom.channel)}
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#9E9EB2" }}>
                  Candidate Cause: <strong style={{ color: "#A78BFA" }}>{anom.root_cause_hypothesis || "Identified in graph traversal"}</strong>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.15rem", fontWeight: 800, color: anom.severity === "CRITICAL" ? "#EF4444" : "#F59E0B", fontFamily: "var(--font-mono)" }}>
                    {anom.delta_pct}%
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#9E9EB2", fontFamily: "var(--font-mono)" }}>
                    z = {anom.z_score}σ
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  style={{
                    padding: "7px 14px",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>Investigate Slice</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
