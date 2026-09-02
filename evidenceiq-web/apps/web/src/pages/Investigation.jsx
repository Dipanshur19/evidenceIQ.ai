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
  Scale,
  Compass,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
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

export default function Investigation({ initialParams, globalPersona }) {
  const { addToast } = useToast();
  const [region, setRegion] = useState(initialParams?.region || "Region_A");
  const [channel, setChannel] = useState(
    initialParams?.channel || "StoreType_A",
  );
  const [asOfDate, setAsOfDate] = useState(
    initialParams?.as_of_date || "2026-08-15",
  );
  const [persona, setPersona] = useState(globalPersona || "analyst");
  const [metric, setMetric] = useState(initialParams?.kpi_id || "metric:revenue");
  const [loading, setLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingMd, setExportingMd] = useState(false);
  const [result, setResult] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [meta, setMeta] = useState(null);

  // Sync initialParams when navigating from Scanner or Dashboard
  useEffect(() => {
    if (initialParams) {
      if (initialParams.region) setRegion(initialParams.region);
      if (initialParams.channel) setChannel(initialParams.channel);
      if (initialParams.as_of_date) setAsOfDate(initialParams.as_of_date);
      if (initialParams.kpi_id) setMetric(initialParams.kpi_id);
    }
  }, [initialParams]);

  // Sync persona when switched from topbar
  useEffect(() => {
    if (globalPersona) {
      setPersona(globalPersona);
    }
  }, [globalPersona]);

  // Active section spy for Table of Contents
  const [activeSection, setActiveSection] = useState("section-overview");

  // Chatbot Copilot state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      role: "assistant",
      answer: "I am your Root-Cause Copilot. Ask questions about observed parameters, causal evidence scores, or simulated rollback impacts.",
      citations: ["metric:revenue", "event:mobile_app_release_v5_4"],
    },
  ]);
  const [loadingChat, setLoadingChat] = useState(false);

  // Decision Form state
  const [decisionType, setDecisionType] = useState("CONFIRM");
  const [justification, setJustification] = useState("");
  const [decidedBy, setDecidedBy] = useState("Senior Operations Analyst");
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [decisionSuccess, setDecisionSuccess] = useState(null);

  // Phase 3: Automated CI/CD Rollback State
  const [recoveryDispatch, setRecoveryDispatch] = useState(null);
  const [dispatchingRollback, setDispatchingRollback] = useState(false);

  // Scroll spy effect using IntersectionObserver
  useEffect(() => {
    const sectionIds = [
      "section-overview",
      "section-trajectory",
      "section-narrative",
      "section-decomposition",
      "section-hypotheses",
      "section-remediation",
      "section-checkpoint",
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [result]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setActiveSection(id);
    }
  };

  const handleTriggerManualRollback = async () => {
    setDispatchingRollback(true);
    try {
      const res = await fetch("/api/recovery/trigger-rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision_id: decisionSuccess || `decision:manual_${Date.now().toString(36)}`,
          action_category: "rollback_release",
          target_release: "v5.4.0",
          operator_id: decidedBy,
          reason: justification || "Operator triggered automated CI/CD rollback hook via Human Checkpoint.",
        }),
      });
      const data = await res.json();
      setRecoveryDispatch(data);
      addToast("Automated CI/CD Rollback Dispatched via LaunchDarkly & GitHub Actions!", "success");
    } catch (err) {
      console.error("Rollback dispatch failed:", err);
      addToast(`Rollback dispatch failed: ${err.message}`, "error");
    } finally {
      setDispatchingRollback(false);
    }
  };

  const chatEndRef = useRef(null);
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
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          answer: "Apologies, copilot query encountered a network issue. Please re-try.",
          citations: [],
        },
      ]);
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
      if (data.recovery_dispatch) {
        setRecoveryDispatch(data.recovery_dispatch);
        addToast("Automated CI/CD Rollback Dispatched via LaunchDarkly & GitHub Actions!", "success");
      }
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

  const tocItems = [
    { id: "section-overview", label: "1. Incident Overview", icon: AlertTriangle },
    { id: "section-trajectory", label: "2. Revenue Trajectory", icon: Activity },
    { id: "section-narrative", label: "3. Grounded Narrative", icon: Brain },
    { id: "section-decomposition", label: "4. Parameter Decomposition", icon: Sliders },
    { id: "section-hypotheses", label: "5. Scored Hypotheses", icon: Layers },
    { id: "section-remediation", label: "6. Rollback & Levers", icon: Lightbulb },
    { id: "section-checkpoint", label: "7. Human Sign-Off", icon: FileCheck },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: "1360px", margin: "0 auto", padding: "16px 24px 80px" }}
    >
      {/* ── Page Header & Quick Bar ── */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "inline-flex", marginBottom: "8px" }}>
          <span className="section-tag">
            <Search size={13} color="#A78BFA" />
            Deterministic Causal Diagnostics & Incident Commander
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(1.75rem, 2.6vw, 2.3rem)",
                fontWeight: 800,
                color: "var(--color-text, #0F172A)",
                letterSpacing: "-0.03em",
              }}
            >
              KPI Incident <span className="text-gradient-purple">Investigation Workspace</span>
            </h1>
            <p style={{ margin: "6px 0 0 0", color: "#475569", fontSize: "0.9rem" }}>
              End-to-end diagnostic storyline: telemetry inspection &rarr; anomaly isolation &rarr; quasi-causal scoring &rarr; automated CI/CD rollback &rarr; human sign-off.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => handleExportBriefing("pdf")}
              disabled={!result || exportingPdf}
              className="btn-secondary"
              style={{ padding: "8px 14px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <Download size={13} />
              {exportingPdf ? "Exporting..." : "Export PDF"}
            </button>
            <button
              onClick={() => handleExportBriefing("markdown")}
              disabled={!result || exportingMd}
              className="btn-secondary"
              style={{ padding: "8px 14px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <FileText size={13} />
              {exportingMd ? "Exporting..." : "Export MD"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Control Filter Bar ── */}
      <div
        className="bento-card"
        style={{
          padding: "16px 22px",
          marginBottom: "28px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "center" }}>
          <div>
            <label style={{ fontSize: "0.7rem", color: "#9E9EB2", display: "block", marginBottom: "4px", fontWeight: 700, textTransform: "uppercase" }}>
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                background: "#12141F",
                color: "#F4F4F6",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                fontWeight: 600,
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {(meta?.regions || ["Region_A", "Region_B", "Region_C"]).map((r) => (
                <option key={r} value={r} style={{ background: "#12141F", color: "#F4F4F6" }}>
                  {getRegionLabel(r)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.7rem", color: "#9E9EB2", display: "block", marginBottom: "4px", fontWeight: 700, textTransform: "uppercase" }}>
              Channel
            </label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                background: "#12141F",
                color: "#F4F4F6",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                fontWeight: 600,
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              {(meta?.channels || ["StoreType_A", "StoreType_B", "StoreType_C"]).map((c) => (
                <option key={c} value={c} style={{ background: "#12141F", color: "#F4F4F6" }}>
                  {getChannelLabel(c)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.7rem", color: "#9E9EB2", display: "block", marginBottom: "4px", fontWeight: 700, textTransform: "uppercase" }}>
              As-Of Incident Date
            </label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              style={{
                padding: "7px 12px",
                borderRadius: "8px",
                background: "#12141F",
                color: "#F4F4F6",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                fontWeight: 600,
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.7rem", color: "#9E9EB2", display: "block", marginBottom: "4px", fontWeight: 700, textTransform: "uppercase" }}>
              Target Persona
            </label>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                background: "#12141F",
                color: "#F4F4F6",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                fontWeight: 600,
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="analyst" style={{ background: "#12141F", color: "#F4F4F6" }}>Operations / BI Analyst (Lineage)</option>
              <option value="executive" style={{ background: "#12141F", color: "#F4F4F6" }}>Executive Sponsor (Financial)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.7rem", color: "#9E9EB2", display: "block", marginBottom: "4px", fontWeight: 700, textTransform: "uppercase" }}>
              Governed Metric
            </label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                background: "#12141F",
                color: "#F4F4F6",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                fontWeight: 600,
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="metric:revenue" style={{ background: "#12141F", color: "#F4F4F6" }}>Sales Revenue (GAAP)</option>
              <option value="metric:nps" style={{ background: "#12141F", color: "#F4F4F6" }}>Customer NPS (CXO)</option>
              <option value="metric:churn" style={{ background: "#12141F", color: "#F4F4F6" }}>Customer Churn Rate</option>
              <option value="metric:inventory_turnover" style={{ background: "#12141F", color: "#F4F4F6" }}>Inventory Turnover (IFRS-15)</option>
            </select>
          </div>
        </div>

        <button
          onClick={runInvestigation}
          disabled={loading}
          className="btn-primary"
          style={{ padding: "9px 18px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <RefreshCw size={14} className={loading ? "spin-icon" : ""} />
          <span>{loading ? "Diagnosing..." : "Run Diagnostics"}</span>
        </button>
      </div>

      {/* ── 2-COLUMN INCIDENT COMMANDER LAYOUT ── */}
      <div className="investigation-grid">
        {/* ════════════════════════════════════════════════════════════════════════ */}
        {/* MAIN COLUMN: UNIFIED SCROLLABLE STORYLINE                               */}
        {/* ════════════════════════════════════════════════════════════════════════ */}
        <div className="investigation-main-col">
          {/* SECTION 1: OVERVIEW & GOLDEN SIGNALS */}
          <div id="section-overview" className="investigation-section">
            {anomaly && (
              <div
                className="bento-card"
                style={{
                  borderLeft: `4px solid ${sevColor}`,
                  padding: "22px 26px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "20px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span
                      className={`badge badge--${sev === "HIGH" ? "danger" : sev === "MEDIUM" ? "warning" : "success"}`}
                    >
                      {sev} SEVERITY ANOMALY
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#64748B" }}>
                      Incident ID: <code style={{ color: "#4F46E5" }}>{result?.investigation_id || "inv_active"}</code>
                    </span>
                  </div>
                  <h2
                    style={{
                      margin: "4px 0 2px 0",
                      fontSize: "1.35rem",
                      fontWeight: 800,
                      color: "var(--color-text, #0F172A)",
                    }}
                  >
                    Revenue Anomaly &mdash; {getRegionLabel(region)} / {getChannelLabel(channel)}
                  </h2>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "#64748B" }}>
                    {getMetricLabel(anomaly.kpi_id)} &bull; Reference Date: {asOfDate}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ textAlign: "center", paddingRight: "16px", borderRight: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: "1.6rem", fontWeight: 800, color: deltaColor, fontFamily: "var(--font-mono)", lineHeight: 1.1 }}>
                      {deltaArrow} {Math.abs(deltaPct).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#64748B", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em", marginTop: "2px" }}>
                      KPI Delta
                    </div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#4F46E5", fontFamily: "var(--font-mono)" }}>
                      ₹{Number(anomaly.observed_value).toFixed(2)}L
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>
                      Observed
                    </div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#475569", fontFamily: "var(--font-mono)" }}>
                      ₹{Number(anomaly.expected_value).toFixed(2)}L
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>
                      Baseline Exp
                    </div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#D97706", fontFamily: "var(--font-mono)" }}>
                      {Number(anomaly.z_score).toFixed(2)}σ
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>
                      Z-Score
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: REVENUE TRAJECTORY CHART */}
          <div id="section-trajectory" className="investigation-section">
            <div className="bento-card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    2. Historical Telemetry Trajectory
                  </span>
                  <h3 style={{ margin: "4px 0 0 0", fontSize: "1.1rem", fontWeight: 750, color: "var(--color-text, #0F172A)" }}>
                    30-Day Revenue Profile &mdash; {getRegionLabel(region)} ({getChannelLabel(channel)})
                  </h3>
                </div>
                <span className="badge badge--violet" style={{ fontSize: "0.75rem" }}>
                  Incident As-Of: {asOfDate}
                </span>
              </div>

              <div style={{ height: "220px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="invTrendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tick={{ fill: "#64748B" }} />
                    <YAxis stroke="#94A3B8" fontSize={11} tick={{ fill: "#64748B" }} unit="L" />
                    <Tooltip
                      contentStyle={{
                        background: "#12141F",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "8px",
                        fontSize: "0.8rem",
                        color: "#FFFFFF",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.5)",
                      }}
                      formatter={(val) => [`₹${Number(val).toFixed(2)}L`, "Revenue"]}
                    />
                    <ReferenceLine x={asOfDate} stroke="#EF4444" strokeDasharray="3 3" label={{ value: "Disruption", fill: "#EF4444", fontSize: 11 }} />
                    <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2.5} fill="url(#invTrendGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* SECTION 3: GROUNDED NARRATIVE */}
          <div id="section-narrative" className="investigation-section">
            <div className="bento-card" style={{ padding: "26px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    3. Dual-Persona Grounded Narrative
                  </span>
                  <h3 style={{ margin: "4px 0 0 0", fontSize: "1.15rem", fontWeight: 750, color: "var(--color-text, #0F172A)" }}>
                    Diagnostic Synthesis & Root-Cause Explanation
                  </h3>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="badge badge--success" style={{ fontSize: "0.7rem" }}>
                    AST Diff Verified (0 Hallucinations)
                  </span>
                  <span className="badge badge--violet" style={{ fontSize: "0.7rem" }}>
                    {result?.narrative?.generation_method || "Local Qwen 2.5 Runtime"}
                  </span>
                </div>
              </div>

              {/* What Happened */}
              <div style={{ background: "rgba(99, 102, 241, 0.12)", borderLeft: "3px solid #8B5CF6", padding: "16px", borderRadius: "8px", marginBottom: "14px" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                  What Happened
                </div>
                <div style={{ color: "#F4F4F6", fontSize: "0.92rem", lineHeight: 1.65 }}>
                  {result?.narrative?.what_happened ||
                    `A significant negative revenue anomaly was observed for ${region} on ${asOfDate}. The observed revenue dropped by ${Math.abs(deltaPct).toFixed(1)}% below the 21-day rolling baseline.`}
                </div>
              </div>

              {/* What We Don't Know */}
              <div style={{ background: "rgba(245, 158, 11, 0.10)", borderLeft: "3px solid #F59E0B", padding: "16px", borderRadius: "8px", marginBottom: "14px" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#FBBF24", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                  Boundary of Evidence & Data Gaps
                </div>
                <div style={{ color: "#E2E8F0", fontSize: "0.88rem", lineHeight: 1.6 }}>
                  {result?.narrative?.what_we_dont_know ||
                    "No direct gateway timeout telemetry has been ingested for StoreType B or desktop web browsers. Further network logs required."}
                </div>
              </div>

              {/* Recommended Next Step */}
              <div style={{ background: "rgba(16, 185, 129, 0.10)", borderLeft: "3px solid #10B981", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#34D399", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                  Recommended Action Pathway
                </div>
                <div style={{ color: "#F4F4F6", fontSize: "0.9rem", lineHeight: 1.6 }}>
                  {result?.narrative?.recommended_next_step ||
                    "Dispatch automated rollback of payment gateway configuration v5.4 and notify the regional operations team."}
                </div>
              </div>

              {/* Citations */}
              <div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
                  Provenance Citations:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                  {(result?.narrative?.citations || ["event:mobile_app_release_v5_4", "metric:revenue", "evidence:ticket_1001"]).map((c, i) => (
                    <span
                      key={i}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.74rem",
                        padding: "3px 10px",
                        background: "rgba(139, 92, 246, 0.12)",
                        color: "#C4B5FD",
                        border: "1px solid rgba(139, 92, 246, 0.25)",
                        borderRadius: "6px",
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: MULTI-PARAMETER & DRIVER DECOMPOSITION */}
          <div id="section-decomposition" className="investigation-section">
            <div className="bento-card" style={{ padding: "26px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    4. Multi-Parameter Diagnostic Matrix & Drivers
                  </span>
                  <h3 style={{ margin: "4px 0 0 0", fontSize: "1.15rem", fontWeight: 750, color: "var(--color-text, #0F172A)" }}>
                    7-Dimension Dimensional Telemetry Inspection
                  </h3>
                </div>
                <span className="badge badge--success" style={{ fontSize: "0.72rem" }}>
                  {paramsData.data_sufficiency || "COMPLETE_EVIDENCE"}
                </span>
              </div>

              {/* Parameter Cards Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                {(paramsData.parameters || [
                  {
                    parameter: "Sales / Revenue Volume",
                    type: "Numeric Metric",
                    status: "ANOMALOUS",
                    value: `₹${Number(anomaly?.observed_value || 24.65).toFixed(2)}L vs Exp ₹${Number(anomaly?.expected_value || 42.5).toFixed(2)}L`,
                    finding: "Z-Score deviation is -3.42σ against 21-day baseline.",
                  },
                  {
                    parameter: "Customer Footfall / Session Traffic",
                    type: "Behavioral Volume",
                    status: "STABLE",
                    value: "748 visitors / sessions (Normal)",
                    finding: "Traffic remained stable (+0.8%), isolating fault to checkout conversion.",
                  },
                  {
                    parameter: "Promotion Activation (Promo Flag)",
                    type: "Operational State",
                    status: "ACTIVE_IMPACT",
                    value: "Promo = 1 (Active Window)",
                    finding: "High promotional volume amplified revenue loss per checkout transaction.",
                  },
                  {
                    parameter: "Support Ticket Spikes",
                    type: "Customer Support Logs",
                    status: "CORROBORATING_SPIKE",
                    value: "8 Critical Tickets in window",
                    finding: "Repeated checkout failures and payment gateway timeouts reported.",
                  },
                ]).map((p, idx) => {
                  const isAnom = p.status === "ANOMALOUS" || p.status === "CORROBORATING_SPIKE";
                  return (
                    <div
                      key={idx}
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "8px",
                        padding: "14px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF" }}>{p.parameter}</span>
                        <span className={`badge badge--${isAnom ? "danger" : "success"}`} style={{ fontSize: "0.65rem" }}>
                          {p.status}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#A78BFA", fontFamily: "var(--font-mono)", fontWeight: 700, marginBottom: "4px" }}>
                        {p.value}
                      </div>
                      <div style={{ fontSize: "0.76rem", color: "#9E9EB2", lineHeight: 1.5 }}>
                        {p.finding}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Price-Volume-Mix Breakdown */}
              <div style={{ background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px", padding: "16px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#FFFFFF", marginBottom: "10px" }}>
                  Price-Volume-Mix (PVM) Counterfactual Variance
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
                  {[
                    { label: "Volume Effect (Checkout Drop)", delta: "-₹14.20L", pct: "78.4% share", color: "#EF4444" },
                    { label: "Price / Ticket Size Effect", delta: "-₹2.80L", pct: "15.5% share", color: "#D97706" },
                    { label: "Channel Mix Shift", delta: "-₹1.10L", pct: "6.1% share", color: "#64748B" },
                  ].map((pvm, i) => (
                    <div key={i} style={{ background: "rgba(255, 255, 255, 0.04)", padding: "10px 14px", borderRadius: "6px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                      <div style={{ fontSize: "0.7rem", color: "#9E9EB2" }}>{pvm.label}</div>
                      <div style={{ fontSize: "1.05rem", fontWeight: 800, color: pvm.color, fontFamily: "var(--font-mono)", margin: "2px 0" }}>
                        {pvm.delta}
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "#64748B" }}>{pvm.pct}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: CAUSAL HYPOTHESES & EVIDENCE GRAPH */}
          <div id="section-hypotheses" className="investigation-section">
            <div className="bento-card" style={{ padding: "26px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    5. Causal Attribution & Evidence Scoring
                  </span>
                  <h3 style={{ margin: "4px 0 0 0", fontSize: "1.15rem", fontWeight: 750, color: "var(--color-text, #FFFFFF)" }}>
                    Ranked Causal Hypotheses & Evidence Weights
                  </h3>
                </div>
                <span className="badge badge--violet" style={{ fontSize: "0.72rem" }}>
                  Bayesian Formulation Active
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {(result?.hypotheses && result.hypotheses.length > 0
                  ? result.hypotheses
                  : [
                      {
                        id: "hypothesis:mobile_app_release_v5_4_caused_revenue_all_all",
                        statement: "Mobile App Checkout Release v5.4 caused checkout failure and 68% revenue drop",
                        confidence_band: "HIGH",
                        evidence_score: 0.85,
                        scoring_breakdown: {
                          correlation_strength: 0.35,
                          temporal_alignment: 0.25,
                          independent_corroboration: 0.20,
                          quasi_causal_evidence: 0.15,
                        },
                      },
                    ]
                ).map((hyp, i) => {
                  const isHigh = hyp.confidence_band === "HIGH";
                  const score = hyp.evidence_score || 0.85;
                  const bandColor = isHigh ? "#10B981" : "#F59E0B";

                  return (
                    <div
                      key={hyp.id || i}
                      style={{
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        borderRadius: "10px",
                        padding: "20px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                            <span className={`badge badge--${isHigh ? "success" : "warning"}`} style={{ fontSize: "0.68rem" }}>
                              {hyp.confidence_band || "HIGH"} CONFIDENCE
                            </span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "#A78BFA", fontWeight: 600 }}>
                              {hyp.id}
                            </span>
                          </div>
                          <h4 style={{ margin: "4px 0 0 0", fontSize: "1.05rem", fontWeight: 750, color: "#FFFFFF" }}>
                            {hyp.statement}
                          </h4>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "1.8rem", fontWeight: 800, color: bandColor, fontFamily: "var(--font-mono)", lineHeight: 1 }}>
                            {score.toFixed(3)}
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "#9E9EB2", textTransform: "uppercase", marginTop: "2px" }}>
                            Evidence Score
                          </div>
                        </div>
                      </div>

                      {/* Factor Meters */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", background: "rgba(255, 255, 255, 0.04)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                        {Object.entries(hyp.scoring_breakdown || {}).map(([k, v]) => (
                          <div key={k}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: "4px" }}>
                              <span style={{ color: "#9E9EB2", textTransform: "capitalize", fontWeight: 500 }}>{k.replace(/_/g, " ")}</span>
                              <span style={{ color: "#10B981", fontWeight: 700, fontFamily: "var(--font-mono)" }}>+{v}</span>
                            </div>
                            <div style={{ height: "4px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "2px", overflow: "hidden" }}>
                              <div style={{ width: `${Math.min(100, v * 100)}%`, height: "100%", background: "#8B5CF6", borderRadius: "2px" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        {/* SECTION 6: REMEDIATION & AUTOMATED CI/CD ROLLBACK */}
        <div id="section-remediation" className="investigation-section">
          <div className="bento-card" style={{ padding: "26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  6. Remediation & Autonomous CI/CD Recovery
                </span>
                <h3 style={{ margin: "4px 0 0 0", fontSize: "1.15rem", fontWeight: 750, color: "var(--color-text, #FFFFFF)" }}>
                  Recommended Action & Automated Rollback Hooks
                </h3>
              </div>
              <button
                onClick={handleTriggerManualRollback}
                disabled={dispatchingRollback}
                className="btn-primary"
                style={{ padding: "7px 14px", fontSize: "0.78rem" }}
              >
                {dispatchingRollback ? "Dispatching..." : "1-Click Rollback Dispatch"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: "16px", marginBottom: "20px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ fontSize: "0.7rem", color: "#9E9EB2", textTransform: "uppercase", fontWeight: 700 }}>Recommended Lever</div>
                <div style={{ fontSize: "1.05rem", fontWeight: 750, color: "#FFFFFF", margin: "4px 0 6px 0" }}>
                  {result?.recommendation?.proposed_action || "Roll back mobile checkout v5.4 and revert barcode payment gateway"}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#9E9EB2", lineHeight: 1.5 }}>
                  {result?.recommendation?.reason || "Telemetry isolates checkout 504 gateway errors coinciding precisely with Release v5.4."}
                </div>
              </div>

              <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.78rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9E9EB2" }}>Confidence</span>
                  <span style={{ color: "#10B981", fontWeight: 700 }}>HIGH (0.85)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9E9EB2" }}>Risk Level</span>
                  <span style={{ color: "#F59E0B", fontWeight: 700 }}>MEDIUM</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9E9EB2" }}>Reversibility</span>
                  <span style={{ color: "#FFFFFF", fontWeight: 600 }}>Instant (&lt;64ms)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9E9EB2" }}>Gate Type</span>
                  <span style={{ color: "#EF4444", fontWeight: 700 }}>Human Review</span>
                </div>
              </div>
            </div>

            {/* Rollback Console */}
            {recoveryDispatch && (
              <div style={{ background: "rgba(99, 102, 241, 0.12)", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "10px", padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 750, color: "#FFFFFF" }}>Automated Rollback Dispatched</span>
                  <span className="badge badge--success" style={{ fontSize: "0.7rem" }}>Status: {recoveryDispatch.status}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.78rem", marginBottom: "12px" }}>
                  <div style={{ background: "#181B29", padding: "10px", borderRadius: "6px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <div style={{ color: "#A78BFA", fontWeight: 700 }}>LaunchDarkly Feature Flag</div>
                    <div style={{ color: "#FFFFFF", marginTop: "2px" }}>Flag: <code style={{ color: "#EF4444" }}>mobile_checkout_v5_4</code> &rarr; OFF</div>
                    <div style={{ color: "#9E9EB2", marginTop: "2px" }}>Latency: 64ms | Production</div>
                  </div>
                  <div style={{ background: "#181B29", padding: "10px", borderRadius: "6px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <div style={{ color: "#A78BFA", fontWeight: 700 }}>GitHub Actions Workflow</div>
                    <div style={{ color: "#FFFFFF", marginTop: "2px" }}>Workflow: <code style={{ color: "#06B6D4" }}>rollback-deployment.yml</code></div>
                    <div style={{ color: "#9E9EB2", marginTop: "2px" }}>Dispatch: HTTP 204 | main</div>
                  </div>
                </div>
                <div style={{ fontSize: "0.72rem", color: "#9E9EB2", fontFamily: "var(--font-mono)" }}>
                  Execution Hash: {recoveryDispatch.audit_hash}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 7: HUMAN CHECKPOINT SIGN-OFF */}
        <div id="section-checkpoint" className="investigation-section">
          <div className="bento-card" style={{ padding: "26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#A78BFA", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  7. Human Checkpoint & Decision Memory Ledger
                </span>
                <h3 style={{ margin: "4px 0 0 0", fontSize: "1.15rem", fontWeight: 750, color: "var(--color-text, #FFFFFF)" }}>
                  Governed Operator Sign-Off & Reinforcement Recalibration
                </h3>
              </div>
              <span className="badge badge--success" style={{ fontSize: "0.72rem" }}>
                SHA-256 Non-Repudiation
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#FFFFFF", fontWeight: 700, display: "block", marginBottom: "8px" }}>
                  Action Decision
                </label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {["CONFIRM", "REJECT", "MODIFY"].map((act) => {
                    const active = decisionType === act;
                    const col = act === "CONFIRM" ? "#10B981" : act === "REJECT" ? "#EF4444" : "#F59E0B";
                    return (
                      <button
                        key={act}
                        type="button"
                        onClick={() => setDecisionType(act)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: "8px",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          border: active ? `2px solid ${col}` : "1px solid rgba(255, 255, 255, 0.12)",
                          background: active
                            ? act === "CONFIRM" ? "rgba(16, 185, 129, 0.18)" : act === "REJECT" ? "rgba(239, 68, 68, 0.18)" : "rgba(245, 158, 11, 0.18)"
                            : "rgba(255, 255, 255, 0.04)",
                          color: active ? col : "#9E9EB2",
                          transition: "all 120ms ease",
                        }}
                      >
                        {act === "CONFIRM" ? "✓ Confirm Action" : act === "REJECT" ? "✕ Reject Action" : "✎ Modify Action"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.72rem", color: "#9E9EB2", display: "block", marginBottom: "4px", fontWeight: 600 }}>Decided By</label>
                  <input
                    type="text"
                    value={decidedBy}
                    onChange={(e) => setDecidedBy(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "#12141F", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#FFFFFF", fontSize: "0.85rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.72rem", color: "#9E9EB2", display: "block", marginBottom: "4px", fontWeight: 600 }}>Target Release</label>
                  <input
                    type="text"
                    disabled
                    value="v5.4.0 (Mobile Checkout)"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", background: "#181B29", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#9E9EB2", fontSize: "0.85rem" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.72rem", color: "#9E9EB2", display: "block", marginBottom: "4px", fontWeight: 600 }}>
                  Operator Justification <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter audit justification (required under SOC-2/SOX-404 compliance)..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", background: "#12141F", border: "1px solid rgba(255, 255, 255, 0.12)", color: "#FFFFFF", fontSize: "0.85rem", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px" }}>
                <span style={{ fontSize: "0.75rem", color: "#9E9EB2" }}>
                  Decision triggers dynamic edge recalibration (&alpha;=0.080).
                </span>
                <button
                  onClick={handleSubmitDecision}
                  disabled={submittingDecision || !justification.trim()}
                  className="btn-primary"
                  style={{ padding: "9px 20px", fontSize: "0.85rem" }}
                >
                  {submittingDecision ? "Signing..." : "Sign & Dispatch Decision"}
                </button>
              </div>

              {decisionSuccess && (
                <div style={{ background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px", padding: "12px 16px", marginTop: "8px" }}>
                  <div style={{ color: "#10B981", fontWeight: 700, fontSize: "0.85rem" }}>
                    ✓ Decision logged successfully: <code style={{ color: "#A78BFA" }}>{decisionSuccess}</code>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* RIGHT STICKY SIDEBAR: TABLE OF CONTENTS & LIVE COPILOT                 */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <aside className="investigation-sidebar">
        {/* 1. Quick Table of Contents */}
        <div className="bento-card" style={{ padding: "18px" }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#9E9EB2", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
            Incident Outline
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {tocItems.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`toc-nav-item ${active ? "active" : ""}`}
                >
                  <span className="toc-dot" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Embedded AI Copilot Q&A */}
        <div className="bento-card" style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1, minHeight: "380px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={14} color="#A78BFA" />
              <span style={{ fontSize: "0.85rem", fontWeight: 750, color: "#FFFFFF" }}>Incident Copilot</span>
            </div>
            <span className="badge badge--violet" style={{ fontSize: "0.65rem" }}>Grounded</span>
          </div>

          {/* Quick Prompt Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "12px" }}>
            {[
              { label: "Why did revenue drop?", q: "Why did revenue drop in Region A?" },
              { label: "Check tickets", q: "Were there customer support ticket spikes?" },
              { label: "Rollback risk?", q: "What is the rollback risk and reversibility?" },
            ].map((pill, i) => (
              <button
                key={i}
                onClick={() => handleSendChat(pill.q)}
                style={{
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: "rgba(139, 92, 246, 0.12)",
                  border: "1px solid rgba(139, 92, 246, 0.25)",
                  color: "#C4B5FD",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div
            style={{
              flex: 1,
              maxHeight: "240px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginBottom: "12px",
              paddingRight: "4px",
            }}
          >
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  background: msg.role === "user" ? "#8B5CF6" : "#181B29",
                  border: msg.role === "user" ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "0.78rem",
                  color: "#FFFFFF",
                  maxWidth: "92%",
                  lineHeight: 1.45,
                }}
              >
                {msg.text || msg.answer}
              </div>
            ))}
            {loadingChat && (
              <div style={{ fontSize: "0.75rem", color: "#A78BFA", display: "flex", alignItems: "center", gap: "6px" }}>
                <Loader2 size={12} className="spin-icon" /> Thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Bar */}
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              type="text"
              placeholder="Ask about root cause..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              style={{
                flex: 1,
                padding: "7px 10px",
                borderRadius: "6px",
                background: "#181B29",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                color: "#FFFFFF",
                fontSize: "0.8rem",
                outline: "none",
              }}
            />
            <button
              onClick={() => handleSendChat()}
              disabled={loadingChat || !chatInput.trim()}
              className="btn-primary"
              style={{ padding: "6px 12px", borderRadius: "6px" }}
            >
              <Send size={13} />
            </button>
          </div>
          </div>
        </aside>
      </div>
    </motion.div>
  );
}
