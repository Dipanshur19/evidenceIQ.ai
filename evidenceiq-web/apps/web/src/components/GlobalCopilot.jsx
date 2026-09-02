import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  User,
  ExternalLink,
  ChevronRight,
  Maximize2,
  Minimize2,
  RefreshCw,
} from "lucide-react";

const PAGE_CONTEXT_PROMPTS = {
  dashboard: [
    { label: "Why did revenue drop?", q: "What caused the -67.96% revenue anomaly in Region A on Aug 15?" },
    { label: "Active fleet health?", q: "Summarize current fleet health and active business unit risks." },
    { label: "Cross-domain cascades?", q: "Explain how support tickets lead to revenue drops and NPS collapse." },
  ],
  investigation: [
    { label: "Explain evidence score", q: "Why did the mobile app checkout release receive an evidence score of 0.850?" },
    { label: "Rollback impact?", q: "What happens if we dispatch the LaunchDarkly rollback to v5.3.9?" },
    { label: "Check ticket evidence", q: "What support tickets corroborates the checkout failure?" },
  ],
  scanner: [
    { label: "Critical slices?", q: "Which Region and Channel slices exceed the 3.0σ critical threshold?" },
    { label: "Explain baseline", q: "How is the 21-day rolling Gaussian baseline calculated?" },
  ],
  contracts: [
    { label: "GAAP vs IFRS rules?", q: "Explain the revenue recognition difference between GAAP and IFRS-15 contracts." },
    { label: "SLA requirements?", q: "What are the SLA tiers and freshness cadences for core metrics?" },
  ],
  connectors: [
    { label: "Check Snowflake health", q: "What is the status of the Snowflake warehouse connector and schema sync?" },
    { label: "Simulate webhook", q: "How does the GitHub Actions webhook trigger causal graph updates?" },
  ],
  fleet: [
    { label: "SOC-2 compliance status?", q: "Summarize the SOC-2 Type II and SOX 404 audit control verification." },
    { label: "Tenant isolation?", q: "How does mTLS tenant isolation prevent cross-subsidiary data leakage?" },
  ],
  graph: [
    { label: "Top causal path?", q: "What is the primary directed causal path between deploy events and revenue loss?" },
    { label: "Explain 6-factor score", q: "How are PRECEDES and CORROBORATES edge weights computed?" },
  ],
  memory: [
    { label: "Learned edge weights?", q: "How has reinforcement learning updated edge weights based on operator decisions?" },
  ],
  architecture: [
    { label: "Deterministic math?", q: "Explain why the LLM is never the source of quantitative financial truth." },
  ],
  proposal: [
    { label: "ROI calculation?", q: "How is the $2.78M annual protected revenue calculated?" },
  ],
};

export default function GlobalCopilot({ currentPage, persona, isOpen, onToggle }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I am your Root-Cause Copilot. Ask any question about real-time metrics, anomalies, or causal evidence on this page.",
      citations: ["metric:revenue", "event:mobile_app_release_v5_4"],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const currentPrompts = PAGE_CONTEXT_PROMPTS[currentPage] || PAGE_CONTEXT_PROMPTS.dashboard;

  const handleSend = async (overrideText) => {
    const textToSend = overrideText || input.trim();
    if (!textToSend) return;

    setMessages((prev) => [...prev, { role: "user", text: textToSend }]);
    if (!overrideText) setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          page_context: currentPage,
          persona: persona || "analyst",
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer || "No response received.",
          citations: data.citations || [],
        },
      ]);
    } catch (err) {
      console.error("Copilot query failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Apologies, the query timed out or backend was temporarily unreachable. Please re-try.",
          citations: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── FLOATING COPILOT TRIGGER PILL (BOTTOM RIGHT) ── */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="floating-copilot-btn"
          style={{
            position: "fixed",
            bottom: "28px",
            right: "88px", // Placed next to settings gear
            background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
            color: "#FFFFFF",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "30px",
            padding: "10px 18px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 8px 24px rgba(79, 70, 229, 0.35)",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.85rem",
            zIndex: 140,
            transition: "all 160ms ease",
          }}
        >
          <Sparkles size={16} />
          <span>Ask Copilot</span>
        </button>
      )}

      {/* ── COPILOT SLIDE-OUT DRAWER ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              position: "fixed",
              top: 0,
              bottom: 0,
              right: 0,
              width: expanded ? "560px" : "380px",
              maxWidth: "100vw",
              background: "#12141F",
              borderLeft: "1px solid rgba(255, 255, 255, 0.09)",
              boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.65)",
              zIndex: 300,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#0E1017",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                  }}
                >
                  <Sparkles size={16} />
                </div>
                <div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#FFFFFF" }}>
                    EvidenceIQ Copilot
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#9E9EB2", textTransform: "capitalize" }}>
                    Context: {currentPage} &bull; {persona}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  onClick={() => setExpanded(!expanded)}
                  style={{ background: "none", border: "none", color: "#9E9EB2", cursor: "pointer", padding: "4px" }}
                  title={expanded ? "Collapse" : "Expand"}
                >
                  {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  onClick={onToggle}
                  style={{ background: "none", border: "none", color: "#9E9EB2", cursor: "pointer", padding: "4px" }}
                  title="Close Copilot"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Quick Prompt Suggestions */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", background: "#12141F" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", marginBottom: "6px" }}>
                Suggested for this page
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {currentPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(p.q)}
                    style={{
                      padding: "5px 10px",
                      borderRadius: "6px",
                      background: "rgba(139, 92, 246, 0.12)",
                      border: "1px solid rgba(139, 92, 246, 0.25)",
                      color: "#C4B5FD",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 120ms ease",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Stream */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                background: "#090A0E",
              }}
            >
              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={idx}
                    style={{
                      alignSelf: isUser ? "flex-end" : "flex-start",
                      maxWidth: "88%",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: "12px",
                        background: isUser ? "#8B5CF6" : "#181B29",
                        color: isUser ? "#FFFFFF" : "#F4F4F6",
                        fontSize: "0.835rem",
                        lineHeight: 1.5,
                        boxShadow: isUser ? "0 2px 8px rgba(139, 92, 246, 0.3)" : "0 1px 3px rgba(0,0,0,0.3)",
                        border: isUser ? "none" : "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      {m.text}
                    </div>

                    {/* Citations */}
                    {!isUser && m.citations && m.citations.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
                        {m.citations.map((c, cIdx) => (
                          <span
                            key={cIdx}
                            style={{
                              fontSize: "0.68rem",
                              fontFamily: "var(--font-mono)",
                              background: "rgba(139, 92, 246, 0.15)",
                              color: "#C4B5FD",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              border: "1px solid rgba(139, 92, 246, 0.3)",
                            }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "8px", color: "#A78BFA", fontSize: "0.8rem", padding: "8px" }}>
                  <Loader2 size={14} className="spin-icon" />
                  <span>Analyzing ingested evidence...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div
              style={{
                padding: "12px 16px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                background: "#0E1017",
                display: "flex",
                gap: "8px",
              }}
            >
              <input
                type="text"
                placeholder="Ask about metrics, anomalies, causes..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  outline: "none",
                  fontSize: "0.85rem",
                  color: "#FFFFFF",
                  background: "#181B29",
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                style={{
                  background: "#8B5CF6",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0 14px",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: loading || !input.trim() ? 0.6 : 1,
                }}
              >
                <Send size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
