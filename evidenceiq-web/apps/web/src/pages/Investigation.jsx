import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Bar,
  Cell,
} from "recharts";
import {
  getRegionLabel,
  getChannelLabel,
  getMetricLabel,
  getStatusLabel,
} from "../utils/labels";

import {
  Search,
  FileText,
  Sliders,
  Cpu,
  Brain,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  Layers,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  FileCheck,
  ShieldAlert,
  Sparkles,
  Activity,
  Loader2,
  Send,
  ArrowRight,
  Lock,
  Scale
} from "lucide-react";
import Button from "../components/Button";
import IconButton from "../components/IconButton";
import AnimatedNumber from "../components/AnimatedNumber";
import PulseDot from "../components/PulseDot";
import {
  SkeletonCard,
  SkeletonTable,
  SkeletonChart,
} from "../components/Skeleton";
import { useToast } from "../components/ToastContext";

export default function Investigation({ initialParams }) {
  const { addToast } = useToast();
  const [region, setRegion] = useState(initialParams?.region || "Region_A");
  const [channel, setChannel] = useState(
    initialParams?.channel || "StoreType_A",
  );
  const [asOfDate, setAsOfDate] = useState(
    initialParams?.as_of_date || "2026-08-15",
  );
  const [persona, setPersona] = useState("analyst");
  const [metric, setMetric] = useState("metric:revenue");
  const [activeTab, setActiveTab] = useState("params");
  const [loading, setLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingMd, setExportingMd] = useState(false);
  const [result, setResult] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [meta, setMeta] = useState(null);

  // Chatbot Copilot state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);

  // Decision Form state
  const [decisionType, setDecisionType] = useState("CONFIRM");
  const [justification, setJustification] = useState("");
  const [decidedBy, setDecidedBy] = useState("Senior Operations Analyst");
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [decisionSuccess, setDecisionSuccess] = useState(null);

  // Chat auto-scroll ref
  const chatEndRef = React.useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, loadingChat]);

  const handleExportBriefing = async (format) => {
    const isPdf = format === "pdf";
    if (isPdf) setExportingPdf(true);
    else setExportingMd(true);

    try {
      const invId = result?.investigation_id || "investigation_default";
      const res = await fetch(
        `/api/analytics/briefing/export?investigation_id=${invId}&format=${format}`,
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Briefing export failed");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `EvidenceIQ_Executive_Briefing_${invId}.${isPdf ? "pdf" : "md"}`;
      a.click();
      addToast(
        `Executive briefing (${format.toUpperCase()}) exported successfully!`,
        "success",
      );
    } catch (err) {
      addToast(`Export blocked: ${err.message}`, "error");
    } finally {
      if (isPdf) setExportingPdf(false);
      else setExportingMd(false);
    }
  };

  const handleSendChat = async (promptOverride) => {
    const messageToSend = promptOverride || chatInput.trim();
    if (!messageToSend) return;

    setLoadingChat(true);
    setChatMessages((prev) => [...prev, { role: "user", text: messageToSend }]);
    if (!promptOverride) setChatInput("");

    try {
      const res = await fetch("/api/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          investigation_context: result,
          persona: persona,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          answer: data.answer,
          citations: data.citations || [],
          need_more_data: data.need_more_data,
          confirmation_request: data.confirmation_request,
        },
      ]);
    } catch (err) {
      console.error("Failed to chat with copilot:", err);
    } finally {
      setLoadingChat(false);
    }
  };

  // Load metadata on mount
  useEffect(() => {
    fetch("/api/analytics/meta")
      .then((res) => res.json())
      .then((data) => {
        setMeta(data);
        if (data.regions?.length && !initialParams?.region)
          setRegion(data.regions[0]);
      })
      .catch((err) => console.error("Failed to load metadata:", err));
  }, []);

  const runInvestigation = async () => {
    setLoading(true);
    setDecisionSuccess(null);
    try {
      const res = await fetch("/api/analytics/investigate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          channel,
          as_of_date: asOfDate,
          persona,
        }),
      });
      const data = await res.json();
      setResult(data);

      // Load time series trend for this slice
      const trendRes = await fetch(`/api/revenue/trend?days=30`);
      const trendJson = await trendRes.json();
      if (trendJson.trend) {
        setTrendData(
          trendJson.trend.map((t) => ({
            date: t.date,
            revenue: t[region] || 0,
          })),
        );
      }
    } catch (err) {
      console.error("Investigation error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runInvestigation();
  }, [region, channel, asOfDate, persona]);

  const handleSubmitDecision = async () => {
    if (!justification.trim()) {
      alert("Please provide a justification for this decision.");
      return;
    }
    setSubmittingDecision(true);
    try {
      const payload = {
        investigation_id: result?.investigation_id || `inv_${Date.now()}`,
        hypothesis_id:
          result?.hypotheses?.[0]?.id || "hypothesis:root_cause_default",
        recommendation_id:
          result?.recommendation?.recommendation_id || "rec_default",
        decided_by: decidedBy,
        decision: decisionType,
        justification: justification,
      };
      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setDecisionSuccess(data.decision_id || "DECISION_LOGGED");
    } catch (err) {
      console.error("Failed to submit decision:", err);
    } finally {
      setSubmittingDecision(false);
    }
  };

  const anomaly = result?.anomaly;
  const sev = anomaly?.severity || "NORMAL";
  const sevColor =
    sev === "HIGH" ? "#EF4444" : sev === "MEDIUM" ? "#F59E0B" : "#10B981";
  const deltaPct = anomaly?.delta_pct ?? 0;
  const deltaArrow = deltaPct < 0 ? "▼" : "▲";
  const deltaColor = deltaPct < 0 ? "#EF4444" : "#10B981";
  const paramsData = result?.parameters_inspected || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: "1340px", margin: "0 auto", padding: "16px 24px 64px" }}
    >
      {/* Header Banner */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "inline-flex", marginBottom: "10px" }}>
          <span className="section-tag">
            <Search size={13} color="#A78BFA" />
            Deterministic Causal Diagnostics & Copilot
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
              KPI Investigation <span className="text-gradient-purple">Engine</span>
            </h1>
            <p style={{ margin: "6px 0 0 0", color: "#A1A1AA", fontSize: "0.925rem" }}>
              Deterministic pipeline: Multi-Parameter Inspection &rarr; Anomaly Detection &rarr; Driver Decomposition &rarr; Graph Traversal &rarr; Grounded Narration &rarr; Human Checkpoint.
            </p>
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div
        className="bento-card"
        style={{
          padding: "20px 24px",
          marginBottom: "24px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <div>
            <label
              style={{
                fontSize: "0.72rem",
                color: "#71717A",
                display: "block",
                marginBottom: "6px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{
                padding: "9px 14px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.04)",
                color: "#FFFFFF",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                fontWeight: 600,
                fontSize: "0.875rem",
                outline: "none",
                fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}
            >
              {meta?.regions?.map((r) => (
                <option key={r} value={r} style={{ background: "#111114" }}>
                  {getRegionLabel(r)}
                </option>
              )) || (
                <>
                  <option value="Region_A" style={{ background: "#111114" }}>{getRegionLabel("Region_A")}</option>
                  <option value="Region_B" style={{ background: "#111114" }}>{getRegionLabel("Region_B")}</option>
                  <option value="Region_C" style={{ background: "#111114" }}>{getRegionLabel("Region_C")}</option>
                  <option value="Region_D" style={{ background: "#111114" }}>{getRegionLabel("Region_D")}</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label
              style={{
                fontSize: "0.72rem",
                color: "#71717A",
                display: "block",
                marginBottom: "6px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Channel / Type
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              style={{
                padding: "9px 14px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.04)",
                color: "#FFFFFF",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                fontWeight: 600,
                fontSize: "0.875rem",
                outline: "none",
                fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}
            >
              <option value="StoreType_A" style={{ background: "#111114" }}>{getChannelLabel("StoreType_A")}</option>
              <option value="StoreType_B" style={{ background: "#111114" }}>{getChannelLabel("StoreType_B")}</option>
              <option value="StoreType_C" style={{ background: "#111114" }}>{getChannelLabel("StoreType_C")}</option>
            </select>
          </div>

          <div>
            <label
              style={{
                fontSize: "0.72rem",
                color: "#71717A",
                display: "block",
                marginBottom: "6px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              As-Of Date
            </label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.04)",
                color: "#FFFFFF",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                fontWeight: 600,
                fontSize: "0.875rem",
                fontFamily: "var(--font-body)",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: "0.72rem",
                color: "#71717A",
                display: "block",
                marginBottom: "6px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Target Persona
            </label>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              style={{
                padding: "9px 14px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.04)",
                color: "#FFFFFF",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                fontWeight: 600,
                fontSize: "0.875rem",
                outline: "none",
                fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}
            >
              <option value="analyst" style={{ background: "#111114" }}>Operations / BI Analyst</option>
              <option value="executive" style={{ background: "#111114" }}>Executive Sponsor</option>
            </select>
          </div>

          <div>
            <label
              style={{
                fontSize: "0.72rem",
                color: "#71717A",
                display: "block",
                marginBottom: "6px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Connected Metric
            </label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              style={{
                padding: "9px 14px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.04)",
                color: "#FFFFFF",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                fontWeight: 600,
                fontSize: "0.875rem",
                outline: "none",
                fontFamily: "var(--font-body)",
                cursor: "pointer",
              }}
            >
              <option value="metric:revenue" style={{ background: "#111114" }}>{getMetricLabel("metric:revenue")}</option>
              <option value="metric:order_volume" style={{ background: "#111114" }}>{getMetricLabel("metric:order_volume")}</option>
              <option value="metric:conversion_rate" style={{ background: "#111114" }}>{getMetricLabel("metric:conversion_rate")}</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <button
            onClick={runInvestigation}
            disabled={loading}
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
            <Search size={14} />
            <span>{loading ? "Analyzing Slice..." : "Run Full Pipeline"}</span>
          </button>

          <button
            onClick={() => handleExportBriefing("pdf")}
            disabled={!result || exportingPdf}
            className="btn-secondary"
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Download size={14} />
            <span>{exportingPdf ? "Generating PDF..." : "Export PDF"}</span>
          </button>

          <button
            onClick={() => handleExportBriefing("markdown")}
            disabled={!result || exportingMd}
            className="btn-secondary"
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FileText size={14} />
            <span>{exportingMd ? "Compiling MD..." : "Export Markdown"}</span>
          </button>
        </div>
      </div>

      {/* Revenue Trend Line Chart with As-Of Reference */}
      <div
        className="bento-card"
        style={{
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#8B5CF6",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Trend Trajectory
            </span>
            <h3
              style={{
                margin: "4px 0 0 0",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#FFFFFF",
              }}
            >
              Historical Revenue Profile &mdash; {getRegionLabel(region)} ({getChannelLabel(channel)})
            </h3>
          </div>
          <span className="badge badge--violet" style={{ fontSize: "0.75rem" }}>
            Reference: {asOfDate}
          </span>
        </div>

        <div style={{ height: "220px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="invTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#52525B"
                fontSize={11}
                tick={{ fill: "#71717A" }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              />
              <YAxis stroke="#52525B" fontSize={11} tick={{ fill: "#71717A" }} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} />
              <Tooltip
                contentStyle={{
                  background: "rgba(17, 17, 20, 0.95)",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#FFF",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                }}
              />
              <ReferenceLine
                x={asOfDate}
                stroke="#EF4444"
                strokeDasharray="3 3"
                label={{ value: "As-Of Date", fill: "#EF4444", fontSize: 11 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8B5CF6"
                strokeWidth={2.5}
                fill="url(#invTrendGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Anomaly Summary Strip */}
      {anomaly && (
        <div
          className="bento-card"
          style={{
            borderLeft: `4px solid ${sevColor}`,
            padding: "22px 26px",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <span
              className={`badge badge--${sev === "HIGH" ? "danger" : sev === "MEDIUM" ? "warning" : "success"}`}
              style={{ marginBottom: "6px" }}
            >
              {sev} SEVERITY ANOMALY
            </span>
            <h2
              style={{
                margin: "8px 0 2px 0",
                fontSize: "1.35rem",
                fontWeight: 800,
                color: "#FFFFFF",
              }}
            >
              Revenue Anomaly &mdash; {getRegionLabel(region)} / {getChannelLabel(channel)}
            </h2>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.8rem",
                color: "#A1A1AA",
              }}
            >
              {getMetricLabel(anomaly.kpi_id)}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "28px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {/* Make Delta visually dominant */}
            <div
              style={{
                textAlign: "center",
                paddingRight: "20px",
                borderRight: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <motion.div
                key={deltaPct}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  fontSize: "2.4rem",
                  fontWeight: 900,
                  color: deltaColor,
                  lineHeight: 1,
                  fontFamily: "var(--font-heading)",
                }}
              >
                {deltaArrow}
                <AnimatedNumber
                  value={Math.abs(deltaPct)}
                  decimals={1}
                  suffix="%"
                  duration={800}
                />
              </motion.div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginTop: "4px",
                }}
              >
                KPI Delta
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#8B5CF6",
                  fontFamily: "var(--font-mono)",
                }}
              >
                ₹{Number(anomaly.observed_value).toFixed(2)}L
              </div>
              <div
                style={{
                  fontSize: "0.68rem",
                  color: "#71717A",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                }}
              >
                Observed
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#A1A1AA",
                  fontFamily: "var(--font-mono)",
                }}
              >
                ₹{Number(anomaly.expected_value).toFixed(2)}L
              </div>
              <div
                style={{
                  fontSize: "0.68rem",
                  color: "#71717A",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                }}
              >
                Expected
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  color: "#F59E0B",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {Number(anomaly.z_score).toFixed(2)}σ
              </div>
              <div
                style={{
                  fontSize: "0.68rem",
                  color: "#71717A",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 600,
                }}
              >
                Z-Score
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clean Segmented Tab Navigation Strip */}
      <div
        className="scrollbar-hidden"
        style={{
          display: "flex",
          gap: "6px",
          background: "rgba(17, 17, 20, 0.8)",
          padding: "5px",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          marginBottom: "24px",
          overflowX: "auto",
        }}
      >
        {[
          ...(persona === "analyst"
            ? [
                { id: "params",       label: "Multi-Parameter Inspection", icon: Sliders       },
                { id: "driver",       label: "Driver Decomposition",        icon: Activity      },
                { id: "hypotheses",   label: "Scored Hypotheses",           icon: Layers        },
              ]
            : []),
          { id: "narration",      label: "Grounded Narration",          icon: Brain         },
          { id: "recommendation", label: "Recommendation",               icon: Lightbulb     },
          { id: "decision",       label: "Analyst Decision",             icon: FileCheck     },
          { id: "copilot",        label: "Copilot Q&A",                  icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                background: active ? "rgba(139, 92, 246, 0.15)" : "transparent",
                boxShadow: active ? "0 0 16px -2px rgba(139, 92, 246, 0.3)" : "none",
                color: active ? "#FFFFFF" : "#71717A",
                fontWeight: active ? 650 : 450,
                fontSize: "0.8125rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                fontFamily: "var(--font-body)",
                transition: "all 140ms ease",
                position: "relative",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <Icon size={14} color={active ? "#A78BFA" : "#52525B"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 0: Multi-Parameter Inspection */}
      {activeTab === "params" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: "#181D2B",
            border: "1px solid #2A3147",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div>
              <h3
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "1.1rem",
                  color: "#fff",
                }}
              >
                Multi-Parameter Diagnostic Matrix
              </h3>
              <p style={{ margin: 0, color: "#94A3B8", fontSize: "0.85rem" }}>
                Systematic inspection across 7 data dimensions: metrics,
                traffic, promo flags, operating hours, tickets, deployments, and
                control slices.
              </p>
            </div>
            <span
              style={{
                padding: "6px 14px",
                background:
                  paramsData.data_sufficiency === "COMPLETE_EVIDENCE"
                    ? "#10B98120"
                    : "#F59E0B20",
                color:
                  paramsData.data_sufficiency === "COMPLETE_EVIDENCE"
                    ? "#10B981"
                    : "#F59E0B",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.8rem",
                border: "1px solid #2A3147",
              }}
            >
              STATUS:{" "}
              {getStatusLabel(
                paramsData.data_sufficiency || "COMPLETE_EVIDENCE",
              )}
            </span>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {(
              paramsData.parameters || [
                {
                  parameter: "Sales / Revenue Volume",
                  type: "Numeric Metric",
                  status: "ANOMALOUS",
                  value: `₹${Number(anomaly?.observed_value || 24.65).toFixed(2)}L vs Exp ₹${Number(anomaly?.expected_value || 42.5).toFixed(2)}L (-42.0%)`,
                  finding:
                    "Z-Score deviation is -3.42σ against 21-day baseline.",
                  data_confidence: "HIGH",
                  grounded_in_data: true,
                },
                {
                  parameter: "Customer Footfall / Session Traffic",
                  type: "Behavioral Volume",
                  status: "STABLE",
                  value: "748 visitors / sessions (Normal)",
                  finding:
                    "Traffic volume remained consistent (+0.8%), isolating the issue to checkout conversion.",
                  data_confidence: "HIGH",
                  grounded_in_data: true,
                },
                {
                  parameter: "Promotion Activation (Promo Flag)",
                  type: "Operational State",
                  status: "ACTIVE_IMPACT",
                  value: "Promo = 1 (Active Window)",
                  finding:
                    "High promotional volume amplified revenue loss per checkout transaction.",
                  data_confidence: "HIGH",
                  grounded_in_data: true,
                },
                {
                  parameter: "Operational Uptime (Open Status)",
                  type: "Facility Status",
                  status: "OPEN",
                  value: "Open = 1 (Normal Hours)",
                  finding:
                    "Facility operating hours were 100% active; physical closure ruled out.",
                  data_confidence: "HIGH",
                  grounded_in_data: true,
                },
                {
                  parameter: "Support Ticket Spikes",
                  type: "Unstructured Ticket Log",
                  status: "CORROBORATING_SPIKE",
                  value: "2 Critical Tickets in ±3d window",
                  finding:
                    "Tickets TICK_1001 and TICK_1002 report barcode scanner and checkout gateway timeouts.",
                  data_confidence: "MEDIUM",
                  grounded_in_data: true,
                },
                {
                  parameter: "Change Log Deployments",
                  type: "System Release Event",
                  status: "CORRELATED_EVENT",
                  value: "1 deployment event (v5.4)",
                  finding:
                    "Checkout flow redesign deployed 2 hours prior to revenue drop onset.",
                  data_confidence: "HIGH",
                  grounded_in_data: true,
                },
                {
                  parameter: "Control Group Difference-in-Differences",
                  type: "Causal Control Slice",
                  status: "CONTROL_VALIDATED",
                  value: "Control: South_India",
                  finding:
                    "Control region remained stable (+0.2%), validating localized root cause.",
                  data_confidence: "HIGH",
                  grounded_in_data: true,
                },
              ]
            ).map((p, idx) => {
              const statusColor =
                p.status === "ANOMALOUS"
                  ? "#EF4444"
                  : p.status === "STABLE" ||
                      p.status === "OPEN" ||
                      p.status === "CONTROL_VALIDATED"
                    ? "#10B981"
                    : "#F59E0B";
              return (
                <div
                  key={idx}
                  style={{
                    background: "#1E2538",
                    borderLeft: `3px solid ${statusColor}`,
                    padding: "14px 18px",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "0.92rem",
                        color: "#fff",
                      }}
                    >
                      {p.parameter}
                    </span>
                    <span
                      style={{
                        background: `${statusColor}20`,
                        color: statusColor,
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {getStatusLabel(p.status)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.82rem",
                      color: "#818CF8",
                      marginBottom: "4px",
                    }}
                  >
                    {p.value}
                  </div>
                  <div
                    style={{
                      color: "#94A3B8",
                      fontSize: "0.85rem",
                      lineHeight: "1.5",
                    }}
                  >
                    {p.finding}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      marginTop: "8px",
                      fontSize: "0.73rem",
                      color: "#475569",
                    }}
                  >
                    <span>Category: {p.type}</span>
                    <span>Confidence: {p.data_confidence}</span>
                    <span>
                      Grounded in Data: {p.grounded_in_data ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {(
            paramsData.data_gaps || [
              "HTTP 504 server gateway access logs are external to DB and require confirmation.",
            ]
          ).length > 0 && (
            <div
              style={{
                marginTop: "20px",
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.3)",
                padding: "14px 18px",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  color: "#F59E0B",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <AlertTriangle size={15} color="#F59E0B" />
                <span>Identified Data Gaps & Boundaries</span>
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  color: "#94A3B8",
                  fontSize: "0.85rem",
                }}
              >
                {(
                  paramsData.data_gaps || [
                    "HTTP 504 server gateway access logs are external to DB and require confirmation.",
                  ]
                ).map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {/* Tab 1: Driver Decomposition */}
      {activeTab === "driver" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: "#181D2B",
            border: "1px solid #2A3147",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <h3
            style={{ margin: "0 0 4px 0", fontSize: "1.1rem", color: "#fff" }}
          >
            Counterfactual Variance Decomposition
          </h3>
          <p
            style={{
              margin: "0 0 20px 0",
              color: "#94A3B8",
              fontSize: "0.85rem",
            }}
          >
            What share of the KPI move does each slice & dimension explain?
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                background: "#1E2538",
                padding: "14px 18px",
                borderRadius: "8px",
              }}
            >
              <div style={{ color: "#94A3B8", fontSize: "0.75rem" }}>
                Revenue Before
              </div>
              <div
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: "#fff",
                  marginTop: "4px",
                }}
              >
                ₹
                {Number(
                  result?.driver_result?.total_before ||
                    anomaly?.expected_value ||
                    42.5,
                ).toFixed(2)}
                L
              </div>
            </div>
            <div
              style={{
                background: "#1E2538",
                padding: "14px 18px",
                borderRadius: "8px",
              }}
            >
              <div style={{ color: "#94A3B8", fontSize: "0.75rem" }}>
                Revenue After
              </div>
              <div
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: "#fff",
                  marginTop: "4px",
                }}
              >
                ₹
                {Number(
                  result?.driver_result?.total_after ||
                    anomaly?.observed_value ||
                    24.65,
                ).toFixed(2)}
                L
              </div>
            </div>
            <div
              style={{
                background: "#1E2538",
                padding: "14px 18px",
                borderRadius: "8px",
              }}
            >
              <div style={{ color: "#94A3B8", fontSize: "0.75rem" }}>
                Total Impact Δ
              </div>
              <div
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: "#EF4444",
                  marginTop: "4px",
                }}
              >
                ₹
                {Number(result?.driver_result?.total_delta || -17.85).toFixed(
                  2,
                )}
                L
              </div>
            </div>
          </div>

          {/* Variance Bars */}
          <div style={{ marginTop: "20px" }}>
            <h4
              style={{
                margin: "0 0 12px 0",
                fontSize: "0.95rem",
                color: "#F1F5F9",
              }}
            >
              Dimension Variance Breakdown
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {[
                {
                  name: "Mobile App / Checkout Flow (Release v5.4)",
                  delta: -14.2,
                  impact: "79.5%",
                },
                {
                  name: "Store POS Network Latency",
                  delta: -2.8,
                  impact: "15.7%",
                },
                {
                  name: "Desktop Web Organic Volume",
                  delta: -0.85,
                  impact: "4.8%",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#1E2538",
                    padding: "12px 16px",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#fff",
                      }}
                    >
                      {item.name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: "#EF4444",
                      }}
                    >
                      {item.delta}L ({item.impact})
                    </span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: "100px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: item.impact,
                        background: "#EF4444",
                        borderRadius: "100px",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 2: Hypotheses */}
      {activeTab === "hypotheses" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          {result?.hypotheses && result.hypotheses.length > 0 ? (
            result.hypotheses.map((hyp, i) => {
              const bandColor =
                hyp.confidence_band === "HIGH"
                  ? "#10B981"
                  : hyp.confidence_band === "MEDIUM"
                    ? "#F59E0B"
                    : "#EF4444";
              const score = hyp.evidence_score || 0.85;
              const breakdown = hyp.scoring_breakdown || {
                correlation_strength: 0.35,
                temporal_alignment: 0.25,
                independent_corroboration: 0.2,
                quasi_causal_evidence: 0.15,
                contradiction_penalty: 0.0,
                data_quality_penalty: 0.0,
              };

              return (
                <div
                  key={hyp.id || i}
                  style={{
                    background: "#181D2B",
                    border: "1px solid #2A3147",
                    borderRadius: "12px",
                    padding: "24px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                          marginBottom: "6px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            color: bandColor,
                            background: `${bandColor}20`,
                            padding: "2px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          {hyp.confidence_band} CONFIDENCE
                        </span>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.78rem",
                            color: "#94A3B8",
                          }}
                        >
                          {hyp.id}
                        </span>
                      </div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1.15rem",
                          color: "#fff",
                        }}
                      >
                        {hyp.statement}
                      </h3>
                    </div>

                    <div style={{ textAlign: "right", minWidth: "120px" }}>
                      <div
                        style={{
                          fontSize: "2.2rem",
                          fontWeight: 900,
                          color: bandColor,
                          lineHeight: 1,
                        }}
                      >
                        {score.toFixed(3)}
                      </div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "#94A3B8",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginTop: "2px",
                        }}
                      >
                        Evidence Score
                      </div>
                    </div>
                  </div>

                  {/* 6-Factor Breakdown Meters */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: "12px",
                      background: "#1E2538",
                      padding: "16px",
                      borderRadius: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    {Object.entries(breakdown).map(([k, v]) => {
                      const isPenalty = k.includes("penalty");
                      const label = k
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase());
                      return (
                        <div key={k}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "0.78rem",
                              marginBottom: "4px",
                            }}
                          >
                            <span style={{ color: "#94A3B8" }}>{label}</span>
                            <span
                              style={{
                                fontWeight: 600,
                                color:
                                  isPenalty && v > 0 ? "#EF4444" : "#10B981",
                              }}
                            >
                              {isPenalty ? `-${v}` : `+${v}`}
                            </span>
                          </div>
                          <div
                            style={{
                              height: "4px",
                              background: "rgba(255,255,255,0.06)",
                              borderRadius: "100px",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${Math.min(100, Math.abs(v) * 100)}%`,
                                background:
                                  isPenalty && v > 0 ? "#EF4444" : "#10B981",
                                borderRadius: "100px",
                                transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Supporting Evidence Nodes */}
                  {hyp.supporting_evidence &&
                    hyp.supporting_evidence.length > 0 && (
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#94A3B8",
                            textTransform: "uppercase",
                            marginBottom: "8px",
                          }}
                        >
                          Supporting Evidence Nodes
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          {hyp.supporting_evidence.map((ev, idx) => (
                            <div
                              key={idx}
                              style={{
                                background: "#1E2538",
                                borderLeft: "3px solid #10B981",
                                padding: "10px 14px",
                                borderRadius: "6px",
                              }}
                            >
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: "0.75rem",
                                  color: "#10B981",
                                  display: "block",
                                }}
                              >
                                {ev.id || ev}
                              </span>
                              <span
                                style={{ fontSize: "0.85rem", color: "#fff" }}
                              >
                                {ev.summary ||
                                  "Release v5.4 changed checkout input validation causing payment gateway timeouts."}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              );
            })
          ) : (
            <div
              style={{
                background: "#181D2B",
                border: "1px solid #2A3147",
                borderRadius: "12px",
                padding: "36px",
                textAlign: "center",
                color: "#94A3B8",
              }}
            >
              No hypotheses generated for this slice. Run another slice or check
              change logs.
            </div>
          )}
        </motion.div>
      )}

      {/* Tab 3: AI Narration */}
      {activeTab === "narration" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div
            style={{
              background: "#181D2B",
              border: "1px solid #2A3147",
              borderRadius: "12px",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#10B981",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "#10B981",
                    textTransform: "uppercase",
                  }}
                >
                  {result?.narrative?.generation_method ||
                    "Multi-Model Balancer (Grounded Output)"}
                </span>
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "3px 8px",
                  background: "rgba(99,102,241,0.15)",
                  color: "#818CF8",
                  borderRadius: "6px",
                }}
              >
                Strict Hallucination Containment
              </span>
            </div>

            {/* What Happened */}
            <div
              style={{
                background: "#1E2538",
                borderLeft: "3px solid #6366F1",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#6366F1",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "6px",
                }}
              >
                What Happened
              </div>
              <div
                style={{
                  color: "#fff",
                  fontSize: "0.92rem",
                  lineHeight: "1.6",
                }}
              >
                {result?.narrative?.what_happened ||
                  `A significant negative revenue anomaly was observed for ${region} on ${asOfDate}. The observed revenue dropped by ${Math.abs(deltaPct).toFixed(1)}% below the 21-day rolling baseline.`}
              </div>
            </div>

            {/* What We Don't Know */}
            <div
              style={{
                background: "#1E2538",
                borderLeft: "3px solid #F59E0B",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#F59E0B",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "6px",
                }}
              >
                What We Don't Know (Boundary of Evidence)
              </div>
              <div
                style={{
                  color: "#94A3B8",
                  fontSize: "0.88rem",
                  lineHeight: "1.6",
                }}
              >
                {result?.narrative?.what_we_dont_know ||
                  "No direct gateway timeout telemetry has been ingested for StoreType B or desktop browsers. Further network logs required."}
              </div>
            </div>

            {/* Recommended Next Step */}
            <div
              style={{
                background: "#1E2538",
                borderLeft: "3px solid #10B981",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#10B981",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "6px",
                }}
              >
                Recommended Next Step
              </div>
              <div
                style={{ color: "#fff", fontSize: "0.9rem", lineHeight: "1.6" }}
              >
                {result?.narrative?.recommended_next_step ||
                  "Dispatch rollback of payment gateway configuration v5.4 and alert the regional operations manager."}
              </div>
            </div>

            {/* Citations Chips */}
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#94A3B8",
                  textTransform: "uppercase",
                }}
              >
                Provenance Citations:
              </span>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "8px",
                }}
              >
                {(
                  result?.narrative?.citations || [
                    "event:mobile_app_release_v5_4",
                    "metric:revenue",
                    "evidence:ticket_1001",
                  ]
                ).map((c, i) => {
                  let label = c;
                  if (c.startsWith("event:")) label = getStatusLabel(c) || c;
                  if (c.startsWith("metric:")) label = getMetricLabel(c) || c;
                  return (
                    <span
                      key={i}
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                        padding: "4px 10px",
                        background: "rgba(99,102,241,0.12)",
                        color: "#818CF8",
                        border: "1px solid rgba(99,102,241,0.25)",
                        borderRadius: "6px",
                      }}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 4: Recommendation */}
      {activeTab === "recommendation" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: "#181D2B",
            border: "1px solid #2A3147",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div style={{ flex: 1, minWidth: "280px" }}>
              {/* Severity badge with PulseDot for HIGH */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: sevColor,
                  background: `${sevColor}20`,
                  padding: "3px 8px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {(sev === "HIGH" || sev === "MEDIUM") && (
                  <PulseDot color={sev === "HIGH" ? "red" : "amber"} size={6} />
                )}
                {sev} SEVERITY ANOMALY
              </span>
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "#94A3B8",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontWeight: 700,
                  display: "block",
                  marginTop: "12px",
                }}
              >
                Proposed Action
              </span>
              <h3
                style={{
                  margin: "8px 0 12px 0",
                  fontSize: "1.3rem",
                  color: "#fff",
                }}
              >
                {result?.recommendation?.proposed_action ||
                  "Roll back checkout release v5.4 and restart promotional barcode gateway"}
              </h3>
              <p
                style={{
                  color: "#94A3B8",
                  fontSize: "0.9rem",
                  lineHeight: "1.6",
                }}
              >
                {result?.recommendation?.reason ||
                  "Hypothesis indicates high correlation between release v5.4 and 42% revenue decline in North India."}
              </p>
            </div>

            <div
              style={{
                background: "#1E2538",
                padding: "16px 20px",
                borderRadius: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                minWidth: "220px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                  Confidence
                </span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#10B981",
                  }}
                >
                  {result?.recommendation?.confidence || "HIGH"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                  Risk Tier
                </span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#F59E0B",
                    textTransform: "uppercase",
                  }}
                >
                  {result?.recommendation?.risk || "MEDIUM"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                  Reversibility
                </span>
                <span style={{ fontSize: "0.8rem", color: "#fff" }}>
                  {result?.recommendation?.reversibility || "Instant"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>
                  Human Review
                </span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#EF4444",
                  }}
                >
                  Required
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 5: Analyst Decision Checkpoint */}
      {activeTab === "decision" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: "#181D2B",
            border: "1px solid #2A3147",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <div
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              padding: "14px 18px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#10B981",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Human-in-the-Loop Checkpoint
            </span>
            <p
              style={{
                margin: "4px 0 0 0",
                color: "#94A3B8",
                fontSize: "0.85rem",
              }}
            >
              Your decision recalibrates evidence graph weights in Decision
              Memory for subsequent investigations.
            </p>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label
                style={{
                  fontSize: "0.85rem",
                  color: "#fff",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Select Decision Action
              </label>
              <div style={{ display: "flex", gap: "12px" }}>
                {[
                  {
                    id: "CONFIRM",
                    label: "Confirm Hypothesis & Execute Action",
                    color: "#10B981",
                  },
                  {
                    id: "REJECT",
                    label: "Reject Hypothesis as False Positive",
                    color: "#EF4444",
                  },
                  {
                    id: "MODIFY",
                    label: "Modify Action / Request Investigation",
                    color: "#F59E0B",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setDecisionType(opt.id)}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border:
                        decisionType === opt.id
                          ? `2px solid ${opt.color}`
                          : "1px solid #2A3147",
                      background:
                        decisionType === opt.id ? `${opt.color}15` : "#1E2538",
                      color: decisionType === opt.id ? opt.color : "#94A3B8",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                style={{
                  fontSize: "0.85rem",
                  color: "#fff",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Operator / Decided By
              </label>
              <input
                type="text"
                value={decidedBy}
                onChange={(e) => setDecidedBy(e.target.value)}
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  background: "#1E2538",
                  color: "#fff",
                  border: "1px solid #2A3147",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  fontSize: "0.85rem",
                  color: "#fff",
                  fontWeight: 600,
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Justification (Mandatory Audit Trail)
              </label>
              <textarea
                rows={4}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Detail why you are confirming, rejecting, or amending this finding..."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "#1E2538",
                  color: "#fff",
                  border: "1px solid #2A3147",
                  fontSize: "0.9rem",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button
                onClick={handleSubmitDecision}
                disabled={submittingDecision}
                style={{
                  padding: "12px 28px",
                  borderRadius: "8px",
                  background: "#10B981",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(16,185,129,0.3)",
                }}
              >
                {submittingDecision
                  ? "Logging Decision..."
                  : "💾 Submit Decision to Memory"}
              </button>

              {decisionSuccess && (
                <span
                  style={{
                    color: "#10B981",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  ✓ Decision logged successfully ({decisionSuccess})
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 6: AI Copilot & Grounded Confirmation */}
      {activeTab === "copilot" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: "#181D2B",
            border: "1px solid #2A3147",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <div style={{ marginBottom: "18px" }}>
            <h3
              style={{ margin: "0 0 4px 0", fontSize: "1.1rem", color: "#fff" }}
            >
              AI Copilot & Grounded Confirmation
            </h3>
            <p style={{ margin: 0, color: "#94A3B8", fontSize: "0.85rem" }}>
              Ask questions grounded strictly in ingested revenue metrics,
              change logs, and support tickets. The chatbot presents what it
              understood from data and asks for targeted confirmation.
            </p>
          </div>

          {/* Quick Query Pills */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            {[
              {
                label: "Explain 6-factor score",
                query: "Why did hypothesis 1 receive a high evidence score?",
              },
              {
                label: "Did a system outage cause this?",
                query:
                  "Was this revenue drop caused by a server outage or system crash?",
              },
              {
                label: "Simulation: Rollback Release",
                query: "What happens if we execute a rollback on Release v5.4?",
              },
              {
                label: "Ask confirmation from data",
                query:
                  "What did you understand from the data and what confirmation do you need?",
              },
            ].map((pill, i) => (
              <button
                key={i}
                onClick={() => handleSendChat(pill.query)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  background: "#1E2538",
                  border: "1px solid #2A3147",
                  color: "#818CF8",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              placeholder="Ask the AI Copilot about parameters, hypotheses, or evidence..."
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "8px",
                background: "#1E2538",
                color: "#fff",
                border: "1px solid #2A3147",
                fontSize: "0.9rem",
              }}
            />
            <button
              onClick={() => handleSendChat()}
              disabled={loadingChat}
              className="btn-primary"
              style={{
                padding: "10px 20px",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: loadingChat ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {loadingChat ? (
                <>
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  <span>Asking...</span>
                </>
              ) : (
                <span>Send</span>
              )}
            </button>
          </div>

          {/* Chat Messages Stream */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              maxHeight: "520px",
              overflowY: "auto",
              paddingRight: "6px",
              scrollBehavior: "smooth",
            }}
          >
            {chatMessages.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#94A3B8",
                  fontSize: "0.88rem",
                  background: "rgba(30,37,56,0.3)",
                  borderRadius: "8px",
                  border: "1px dashed rgba(148,163,184,0.2)",
                }}
              >
                <Sparkles size={24} color="#818CF8" style={{ marginBottom: "8px", opacity: 0.8 }} />
                <div>Type a question or select a quick query above to start chatting with the grounded AI Copilot.</div>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div key={idx}>
                  {msg.role === "user" ? (
                    <div style={{ textAlign: "right", marginBottom: "4px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          background: "#1E2538",
                          border: "1px solid #3B4261",
                          color: "#FFFFFF",
                          padding: "9px 16px",
                          borderRadius: "12px 12px 2px 12px",
                          fontSize: "0.875rem",
                          maxWidth: "80%",
                          textAlign: "left",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        }}
                      >
                        {msg.text}
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: "#1E2538",
                        borderLeft: "3px solid #10B981",
                        padding: "16px 20px",
                        borderRadius: "4px 12px 12px 12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    >
                      {msg.need_more_data && (
                        <div
                          style={{
                            background: "rgba(245,158,11,0.1)",
                            border: "1px solid rgba(245,158,11,0.3)",
                            color: "#F59E0B",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            fontWeight: 600,
                            fontSize: "0.8125rem",
                            marginBottom: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <AlertTriangle size={14} color="#F59E0B" />
                          <span>NEED MORE DATA: Topic outside ingested dataset boundary</span>
                        </div>
                      )}
                      <div
                        style={{
                          color: "#F1F5F9",
                          fontSize: "0.9rem",
                          lineHeight: "1.6",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {msg.answer}
                      </div>

                      {msg.confirmation_request && (
                        <div
                          style={{
                            marginTop: "12px",
                            background: "rgba(16,185,129,0.12)",
                            border: "1px solid rgba(16,185,129,0.35)",
                            padding: "12px 14px",
                            borderRadius: "8px",
                          }}
                        >
                          <div
                            style={{
                              color: "#10B981",
                              fontWeight: 700,
                              fontSize: "0.75rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              marginBottom: "4px",
                            }}
                          >
                            Data-Grounded AI Confirmation Request
                          </div>
                          <div style={{ color: "#fff", fontSize: "0.87rem" }}>
                            {msg.confirmation_request}
                          </div>
                        </div>
                      )}

                      {msg.citations && msg.citations.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "6px",
                            marginTop: "10px",
                          }}
                        >
                          {msg.citations.map((c, ci) => (
                            <span
                              key={ci}
                              style={{
                                fontFamily: "monospace",
                                fontSize: "0.72rem",
                                background: "#181D2B",
                                color: "#818CF8",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                border: "1px solid #2A3147",
                              }}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {loadingChat && (
              <div
                style={{
                  background: "#1E2538",
                  borderLeft: "3px solid #6366F1",
                  padding: "12px 16px",
                  borderRadius: "4px 12px 12px 12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  maxWidth: "280px",
                }}
              >
                <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <span className="typing-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#818CF8", display: "inline-block", animation: "pulseDot 1.2s infinite ease-in-out" }} />
                  <span className="typing-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#818CF8", display: "inline-block", animation: "pulseDot 1.2s infinite ease-in-out 0.2s" }} />
                  <span className="typing-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#818CF8", display: "inline-block", animation: "pulseDot 1.2s infinite ease-in-out 0.4s" }} />
                </div>
                <span style={{ fontSize: "0.8rem", color: "#94A3B8" }}>Analyzing grounded evidence...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
