import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Network, Eye, RefreshCw, Layers, Sparkles, X, Filter, Sliders, ArrowRight, ShieldCheck, Activity, Brain } from "lucide-react";
import { getStatusLabel } from "../utils/labels";
import EvidenceGraph3D from "../components/graph/EvidenceGraph3D";

const NODE_TYPES = [
  "KPI",
  "Entity",
  "Event",
  "Evidence",
  "Hypothesis",
  "Decision",
];

const NODE_COLORS = {
  KPI: "#8B5CF6",
  Entity: "#EC4899",
  Event: "#F59E0B",
  Evidence: "#10B981",
  Hypothesis: "#6366F1",
  Decision: "#EF4444",
};

const EDGE_COLORS = {
  SUPPORTS: "#10B981",
  CONTRADICTS: "#EF4444",
  CAUSED_BY: "#8B5CF6",
  PRECEDES: "#F59E0B",
  VALIDATED_BY: "#6366F1",
  REJECTED_BY: "#EF4444",
  SIMILAR_TO: "#A78BFA",
  AFFECTS: "#10B981",
  DERIVED_FROM: "#EC4899",
};

export default function EvidenceGraphPage() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState(NODE_TYPES);
  const [minConfidence, setMinConfidence] = useState(0.0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState("2d"); // '2d' | '3d'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGraph() {
      try {
        const typesParam = selectedTypes.join(",");
        const res = await fetch(
          `/api/graph/data?node_types=${typesParam}&min_confidence=${minConfidence}`,
        );
        const data = await res.json();
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
      } catch (err) {
        console.error("Failed to load graph data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGraph();
  }, [selectedTypes, minConfidence]);

  const toggleType = (type) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((t) => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  // Node position calculation for 2D Canvas
  const nodePositions = React.useMemo(() => {
    const pos = {};
    const width = 860;
    const height = 520;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 200;

    nodes.forEach((node, idx) => {
      const angle = (idx / Math.max(1, nodes.length)) * 2 * Math.PI;
      const typeOffset = (NODE_TYPES.indexOf(node.node_type) - 2.5) * 18;
      pos[node.id] = {
        x: centerX + (radius + typeOffset) * Math.cos(angle),
        y: centerY + (radius + typeOffset) * Math.sin(angle),
      };
    });
    return pos;
  }, [nodes]);

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
            <Network size={13} color="#A78BFA" />
            Relational Causal Knowledge Topology
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
              Business Evidence <span className="text-gradient-purple">Graph</span>
            </h1>
            <p style={{ margin: "6px 0 0 0", color: "#A1A1AA", fontSize: "0.925rem" }}>
              Persistent, provenance-tagged knowledge topology binding KPIs, Events, Hypotheses, and Human Decisions.
            </p>
          </div>

          {/* 2D / 3D Mode Switcher */}
          <div
            style={{
              display: "inline-flex",
              background: "rgba(255, 255, 255, 0.04)",
              padding: "4px",
              borderRadius: "10px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <button
              onClick={() => setViewMode("2d")}
              style={{
                padding: "8px 18px",
                borderRadius: "7px",
                border: "none",
                background: viewMode === "2d" ? "linear-gradient(135deg, #8B5CF6, #7C3AED)" : "transparent",
                color: viewMode === "2d" ? "#FFFFFF" : "#71717A",
                fontWeight: 650,
                fontSize: "0.8125rem",
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              2D Network
            </button>
            <button
              onClick={() => setViewMode("3d")}
              style={{
                padding: "8px 18px",
                borderRadius: "7px",
                border: "none",
                background: viewMode === "3d" ? "linear-gradient(135deg, #8B5CF6, #7C3AED)" : "transparent",
                color: viewMode === "3d" ? "#FFFFFF" : "#71717A",
                fontWeight: 650,
                fontSize: "0.8125rem",
                cursor: "pointer",
                transition: "all 150ms ease",
              }}
            >
              3D WebGL Orbit
            </button>
          </div>
        </div>
      </div>

      {/* Filter Strip */}
      <div
        className="bento-card"
        style={{
          padding: "18px 24px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {/* Node Type Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", color: "#71717A", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginRight: "4px" }}>
            Filter Nodes:
          </span>
          {NODE_TYPES.map((type) => {
            const active = selectedTypes.includes(type);
            const color = NODE_COLORS[type];
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 12px",
                  borderRadius: "9999px",
                  background: active ? `${color}20` : "rgba(255, 255, 255, 0.03)",
                  border: active ? `1px solid ${color}60` : "1px solid rgba(255, 255, 255, 0.06)",
                  color: active ? "#FFFFFF" : "#71717A",
                  fontSize: "0.78rem",
                  fontWeight: active ? 650 : 500,
                  cursor: "pointer",
                  transition: "all 140ms ease",
                }}
              >
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: color }} />
                <span>{type}</span>
              </button>
            );
          })}
        </div>

        {/* Min Confidence Slider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "0.75rem", color: "#71717A", fontWeight: 600 }}>
            Min Confidence: <strong style={{ color: "#A78BFA" }}>{minConfidence.toFixed(2)}</strong>
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={minConfidence}
            onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
            className="kpi-slider"
            style={{ width: "120px" }}
          />
        </div>
      </div>

      {/* Main Canvas & Details View */}
      <div style={{ display: "grid", gridTemplateColumns: selectedNode ? "2fr 1fr" : "1fr", gap: "20px" }}>
        
        {/* Graph Display Card */}
        <div className="bento-card" style={{ padding: "20px", position: "relative", minHeight: "560px", overflow: "hidden" }}>
          {viewMode === "3d" ? (
            <div style={{ height: "520px", width: "100%" }}>
              <EvidenceGraph3D
                nodes={nodes}
                edges={edges}
                onSelectNode={(node) => setSelectedNode(node)}
              />
            </div>
          ) : (
            <div style={{ width: "100%", height: "520px", position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <svg width="100%" height="100%" viewBox="0 0 860 520" style={{ overflow: "visible" }}>
                <defs>
                  <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Edges */}
                {edges.map((edge, idx) => {
                  const src = nodePositions[edge.source];
                  const dst = nodePositions[edge.target];
                  if (!src || !dst) return null;
                  const edgeColor = EDGE_COLORS[edge.relationship] || "#8B5CF6";
                  return (
                    <g key={idx}>
                      <line
                        x1={src.x}
                        y1={src.y}
                        x2={dst.x}
                        y2={dst.y}
                        stroke={edgeColor}
                        strokeWidth={1.5}
                        strokeOpacity={0.4}
                        strokeDasharray={edge.relationship === "PRECEDES" ? "4 4" : undefined}
                      />
                    </g>
                  );
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                  const pos = nodePositions[node.id];
                  if (!pos) return null;
                  const color = NODE_COLORS[node.node_type] || "#8B5CF6";
                  const isSelected = selectedNode?.id === node.id;
                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      style={{ cursor: "pointer" }}
                    >
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isSelected ? 16 : 11}
                        fill={color}
                        fillOpacity={0.85}
                        stroke={isSelected ? "#FFFFFF" : `${color}60`}
                        strokeWidth={isSelected ? 3 : 1.5}
                        filter="url(#nodeGlow)"
                      />
                      <text
                        x={pos.x}
                        y={pos.y + 20}
                        textAnchor="middle"
                        fill="#D4D4D8"
                        fontSize={10}
                        fontFamily="var(--font-body)"
                        fontWeight={600}
                      >
                        {node.label?.slice(0, 18) || node.id}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Selected Node Details Card */}
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bento-card"
            style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "9999px",
                    background: `${NODE_COLORS[selectedNode.node_type] || "#8B5CF6"}20`,
                    color: NODE_COLORS[selectedNode.node_type] || "#8B5CF6",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {selectedNode.node_type}
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  style={{ background: "transparent", border: "none", color: "#71717A", cursor: "pointer" }}
                >
                  <X size={16} />
                </button>
              </div>

              <h3 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", fontWeight: 700, color: "#FFFFFF" }}>
                {selectedNode.label || selectedNode.id}
              </h3>
              <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "#A1A1AA", lineHeight: 1.6 }}>
                {selectedNode.description || selectedNode.properties?.description || "Knowledge graph entity node with connected provenance lineage."}
              </p>

              {/* Node Properties */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                  <span style={{ color: "#71717A" }}>Node ID:</span>
                  <span style={{ color: "#D4D4D8", fontFamily: "var(--font-mono)" }}>{selectedNode.id}</span>
                </div>
                {selectedNode.confidence && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                    <span style={{ color: "#71717A" }}>Causal Confidence:</span>
                    <span style={{ color: "#10B981", fontWeight: 700 }}>{(selectedNode.confidence * 100).toFixed(0)}%</span>
                  </div>
                )}
                {selectedNode.timestamp && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                    <span style={{ color: "#71717A" }}>Recorded Time:</span>
                    <span style={{ color: "#D4D4D8" }}>{selectedNode.timestamp}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "0.75rem", color: "#71717A", marginBottom: "8px" }}>
                Provenance SHA-256 Audit Trail
              </div>
              <div style={{ fontSize: "0.7rem", color: "#A78BFA", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
                {selectedNode.sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}
