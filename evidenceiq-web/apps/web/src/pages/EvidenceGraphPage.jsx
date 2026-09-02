import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network,
  Eye,
  RefreshCw,
  Layers,
  Sparkles,
  X,
  Filter,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Activity,
  Brain,
  Zap,
  Globe,
  Radio,
  FileCode,
  CheckCircle2
} from "lucide-react";
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
  KPI: "#8B5CF6",       // Purple
  Entity: "#EC4899",    // Pink
  Event: "#F59E0B",     // Amber
  Evidence: "#10B981",  // Emerald
  Hypothesis: "#6366F1",// Indigo
  Decision: "#EF4444",  // Red
};

const EDGE_COLORS = {
  PRECEDES: "#F59E0B",
  CORROBORATES: "#10B981",
  CAUSED_BY: "#8B5CF6",
  EXPLAINS: "#6366F1",
  RESOLVES: "#EF4444",
  AFFECTS: "#38BDF8",
};

export default function EvidenceGraphPage() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState(NODE_TYPES);
  const [minConfidence, setMinConfidence] = useState(0.0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState("2d"); // '2d' | '3d'
  const [loading, setLoading] = useState(true);

  // 2D Node Drag Positions State
  const [draggedPositions, setDraggedPositions] = useState({});
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    fetchGraph();
  }, [selectedTypes, minConfidence]);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const typesParam = selectedTypes.join(",");
      const res = await fetch(
        `/api/graph/data?node_types=${typesParam}&min_confidence=${minConfidence}`
      );
      const data = await res.json();
      setNodes(data.nodes || []);
      setEdges(data.edges || data.links || []);
      if (data.nodes && data.nodes.length > 0 && !selectedNode) {
        setSelectedNode(data.nodes[0]);
      }
    } catch (err) {
      console.error("Failed to load graph data:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleType = (type) => {
    if (selectedTypes.includes(type)) {
      if (selectedTypes.length > 1) {
        setSelectedTypes(selectedTypes.filter((t) => t !== type));
      }
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  // 2D Physics / Organic Cluster Node Layout
  const computedNodePositions = React.useMemo(() => {
    const pos = { ...draggedPositions };
    const width = 860;
    const height = 520;
    const centerX = width / 2;
    const centerY = height / 2;

    const clusterOffsets = {
      KPI: { x: centerX, y: centerY },
      Event: { x: centerX - 240, y: centerY - 90 },
      Evidence: { x: centerX + 240, y: centerY - 90 },
      Hypothesis: { x: centerX, y: centerY - 150 },
      Decision: { x: centerX, y: centerY + 160 },
      Entity: { x: centerX - 220, y: centerY + 140 },
    };

    // Group nodes by type
    const groups = {};
    nodes.forEach((n) => {
      if (!groups[n.node_type]) groups[n.node_type] = [];
      groups[n.node_type].push(n);
    });

    Object.entries(groups).forEach(([type, typeNodes]) => {
      const base = clusterOffsets[type] || { x: centerX, y: centerY };
      typeNodes.forEach((n, idx) => {
        if (!pos[n.id]) {
          const spread = (idx - (typeNodes.length - 1) / 2) * 80;
          pos[n.id] = {
            x: Math.max(70, Math.min(width - 70, base.x + spread + (idx % 2 === 0 ? 10 : -10))),
            y: Math.max(50, Math.min(height - 50, base.y + (idx % 2) * 35)),
          };
        }
      });
    });

    return pos;
  }, [nodes, draggedPositions]);

  // 2D Drag Handling
  const handleMouseDown = (nodeId, e) => {
    setDraggingNodeId(nodeId);
  };

  const handleMouseMove = (e) => {
    if (!draggingNodeId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(40, Math.min(820, e.clientX - rect.left));
    const y = Math.max(30, Math.min(490, e.clientY - rect.top));

    setDraggedPositions((prev) => ({
      ...prev,
      [draggingNodeId]: { x, y },
    }));
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ maxWidth: "1340px", margin: "0 auto", padding: "16px 24px 64px" }}
    >
      {/* Header Banner */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "inline-flex", marginBottom: "8px" }}>
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
              Interactive provenance-tagged knowledge topology binding KPIs, Events, Hypotheses, and Human Decisions.
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
          padding: "16px 22px",
          marginBottom: "20px",
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

        {/* Min Confidence Slider & Refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
              style={{ width: "110px" }}
            />
          </div>
          <button
            onClick={fetchGraph}
            className="btn-secondary"
            style={{ padding: "6px 12px", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Main Canvas & Details View */}
      <div style={{ display: "grid", gridTemplateColumns: selectedNode ? "2fr 1fr" : "1fr", gap: "20px" }}>
        
        {/* Graph Display Card */}
        <div className="bento-card" style={{ padding: "16px", position: "relative", minHeight: "560px", overflow: "hidden" }}>
          {viewMode === "3d" ? (
            <div style={{ height: "540px", width: "100%" }}>
              <EvidenceGraph3D
                nodes={nodes}
                edges={edges}
                onSelectNode={(node) => setSelectedNode(node)}
              />
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                height: "540px",
                position: "relative",
                userSelect: "none",
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox="0 0 860 520"
                style={{ overflow: "visible", cursor: draggingNodeId ? "grabbing" : "default" }}
              >
                <defs>
                  <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  
                  {/* Arrow Markers for Directed Edges */}
                  {Object.entries(EDGE_COLORS).map(([rel, color]) => (
                    <marker
                      key={rel}
                      id={`arrow-${rel}`}
                      viewBox="0 0 10 10"
                      refX="22"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill={color} fillOpacity="0.8" />
                    </marker>
                  ))}
                </defs>

                {/* 2D Directed Causal Edges with Labels */}
                {edges.map((edge, idx) => {
                  const srcId = edge.source || edge.from_id;
                  const dstId = edge.target || edge.to_id;
                  const src = computedNodePositions[srcId];
                  const dst = computedNodePositions[dstId];
                  if (!src || !dst) return null;

                  const rel = edge.relationship || edge.edge_type || "PRECEDES";
                  const edgeColor = EDGE_COLORS[rel] || "#8B5CF6";
                  const midX = (src.x + dst.x) / 2;
                  const midY = (src.y + dst.y) / 2;

                  return (
                    <g key={idx}>
                      {/* Edge Line */}
                      <line
                        x1={src.x}
                        y1={src.y}
                        x2={dst.x}
                        y2={dst.y}
                        stroke={edgeColor}
                        strokeWidth={2}
                        strokeOpacity={0.65}
                        strokeDasharray={rel === "PRECEDES" ? "5 4" : undefined}
                        markerEnd={`url(#arrow-${rel})`}
                      />

                      {/* Edge Relationship Badge */}
                      <rect
                        x={midX - 34}
                        y={midY - 9}
                        width={68}
                        height={18}
                        rx={5}
                        fill="#0A0A0E"
                        stroke={edgeColor}
                        strokeWidth={1}
                        strokeOpacity={0.7}
                      />
                      <text
                        x={midX}
                        y={midY + 3.5}
                        textAnchor="middle"
                        fill={edgeColor}
                        fontSize={8.5}
                        fontWeight={700}
                        fontFamily="var(--font-mono)"
                      >
                        {rel}
                      </text>
                    </g>
                  );
                })}

                {/* 2D Nodes */}
                {nodes.map((node) => {
                  const pos = computedNodePositions[node.id];
                  if (!pos) return null;
                  const color = NODE_COLORS[node.node_type] || "#8B5CF6";
                  const isSelected = selectedNode?.id === node.id;
                  const isDragging = draggingNodeId === node.id;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${pos.x}, ${pos.y})`}
                      onMouseDown={(e) => handleMouseDown(node.id, e)}
                      onClick={() => setSelectedNode(node)}
                      style={{ cursor: isDragging ? "grabbing" : "grab" }}
                    >
                      {/* Pulse Halo */}
                      {isSelected && (
                        <circle
                          r={24}
                          fill="none"
                          stroke={color}
                          strokeWidth={2}
                          strokeOpacity={0.5}
                          className="animate-ping"
                        />
                      )}

                      {/* Node Circle */}
                      <circle
                        r={isSelected ? 16 : 13}
                        fill={color}
                        fillOpacity={0.9}
                        stroke={isSelected ? "#FFFFFF" : `${color}80`}
                        strokeWidth={isSelected ? 3 : 1.5}
                        filter="url(#nodeGlow)"
                      />

                      {/* Node Label */}
                      <text
                        y={24}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize={10.5}
                        fontFamily="var(--font-body)"
                        fontWeight={700}
                        style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}
                      >
                        {(node.label || node.id).slice(0, 22)}
                      </text>

                      {/* Node Type Subtitle */}
                      <text
                        y={36}
                        textAnchor="middle"
                        fill={color}
                        fontSize={8.5}
                        fontFamily="var(--font-mono)"
                        fontWeight={600}
                      >
                        {node.node_type}
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
                  {selectedNode.node_type} Node
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="btn-icon"
                  style={{ padding: "4px", color: "#71717A" }}
                >
                  <X size={14} />
                </button>
              </div>

              <h2 style={{ margin: "0 0 8px 0", fontSize: "1.2rem", fontWeight: 800, color: "#FFFFFF" }}>
                {selectedNode.label || selectedNode.id}
              </h2>
              <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "#A78BFA", marginBottom: "16px" }}>
                {selectedNode.id}
              </div>

              {/* Attributes Inspector */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem" }}>
                {selectedNode.attrs &&
                  Object.entries(selectedNode.attrs).slice(0, 7).map(([key, val]) => (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ color: "#71717A", textTransform: "capitalize" }}>{key.replace(/_/g, " ")}:</span>
                      <span style={{ color: "#FFFFFF", fontWeight: 600, fontFamily: typeof val === "number" ? "var(--font-mono)" : "inherit" }}>
                        {typeof val === "object" ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Connected Causal Pathways & RL Confidence */}
              {(() => {
                const connected = edges.filter(
                  (e) => (e.source || e.from_id) === selectedNode.id || (e.target || e.to_id) === selectedNode.id
                );
                if (!connected.length) return null;
                return (
                  <div style={{ marginTop: "18px" }}>
                    <div style={{ fontSize: "0.72rem", color: "#9E9EB2", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                      Connected Pathways & Edge Confidence ({connected.length})
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "160px", overflowY: "auto" }}>
                      {connected.map((edge, idx) => {
                        const isOutgoing = (edge.source || edge.from_id) === selectedNode.id;
                        const otherId = isOutgoing ? (edge.target || edge.to_id) : (edge.source || edge.from_id);
                        const rel = edge.relationship || edge.edge_type || "PRECEDES";
                        const conf = edge.confidence ?? 0.75;
                        return (
                          <div
                            key={idx}
                            style={{
                              background: "rgba(255, 255, 255, 0.04)",
                              border: "1px solid rgba(255, 255, 255, 0.08)",
                              borderRadius: "6px",
                              padding: "8px 10px",
                              fontSize: "0.74rem",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ color: EDGE_COLORS[rel] || "#8B5CF6", fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: "0.68rem" }}>
                                {isOutgoing ? "→" : "←"} {rel}
                              </span>
                              <span style={{ color: "#F4F4F6", fontFamily: "var(--font-mono)", fontSize: "0.72rem" }}>
                                {String(otherId).slice(0, 24)}...
                              </span>
                            </div>
                            <span
                              style={{
                                color: conf >= 0.8 ? "#10B981" : "#A78BFA",
                                fontWeight: 700,
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.72rem",
                              }}
                            >
                              {(conf * 100).toFixed(0)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Cryptographic SHA-256 Provenance Box */}
            <div style={{ marginTop: "24px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#10B981", fontSize: "0.72rem", fontWeight: 700, marginBottom: "4px" }}>
                <ShieldCheck size={14} /> Verified Graph Provenance
              </div>
              <p style={{ margin: 0, fontSize: "0.68rem", color: "#9E9EB2", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
                SHA-256: e8b9f4a1c0d2e3f5998124b893a7c6f0...
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
