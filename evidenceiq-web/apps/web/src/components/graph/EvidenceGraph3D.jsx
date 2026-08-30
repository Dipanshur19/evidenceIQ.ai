import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Eye, Layers, Sparkles, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import * as THREE from "three";

const NODE_COLORS = {
  KPI: 0x6366f1,
  Event: 0xf59e0b,
  Evidence: 0xef4444,
  Hypothesis: 0x10b981,
  Decision: 0xa855f7,
  Entity: 0x38bdf8,
};

export default function EvidenceGraph3D({ storeId = 101, onSelectNode }) {
  const mountRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    // Fetch Graph Topology or use rich default
    fetch(`/api/anomalies/${storeId}/graph`)
      .then((res) => res.json())
      .then((data) => {
        setGraphData(data);
        if (data.nodes && data.nodes.length > 0) {
          setSelectedNode(data.nodes[0]);
          onSelectNode?.(data.nodes[0]);
        }
      })
      .catch(() => {
        const defaultData = {
          nodes: [
            {
              id: `kpi:rossmann_sales_store_${storeId}`,
              label: `Store ${storeId} Sales KPI`,
              type: "KPI",
              val: 28,
              color: "#6366F1",
              desc: "Daily revenue dropped 67.9% on Aug 12",
              position: [0, 2, 0],
            },
            {
              id: "event:pos_terminal_update_v5_4",
              label: "POS Terminal Update v5.4",
              type: "Event",
              val: 20,
              color: "#F59E0B",
              desc: "Firmware roll-out to Store POS registers",
              position: [-6, 3, 2],
            },
            {
              id: "evidence:ticket_spike_1001",
              label: "Ticket Cluster: POS Timeout",
              type: "Evidence",
              val: 18,
              color: "#EF4444",
              desc: "3 support tickets: POS barcode scan failure",
              position: [-4, -3, -2],
            },
            {
              id: "hypothesis:v5_4_pos_crash",
              label: "Hypothesis: POS Software Bug",
              type: "Hypothesis",
              val: 24,
              color: "#10B981",
              desc: "Evidence Score: 0.85 (High Confidence)",
              position: [5, 1, -1],
            },
            {
              id: "decision:rollback_v5_4",
              label: "Decision: Rollback Firmware",
              type: "Decision",
              val: 22,
              color: "#A855F7",
              desc: "Checkpoint: Confirmed by Senior Analyst",
              position: [3, -4, 2],
            },
          ],
          links: [
            {
              source: "event:pos_terminal_update_v5_4",
              target: `kpi:rossmann_sales_store_${storeId}`,
              type: "PRECEDES",
              weight: 0.85,
            },
            {
              source: "evidence:ticket_spike_1001",
              target: "hypothesis:v5_4_pos_crash",
              type: "CORROBORATES",
              weight: 0.8,
            },
            {
              source: "hypothesis:v5_4_pos_crash",
              target: `kpi:rossmann_sales_store_${storeId}`,
              type: "EXPLAINS",
              weight: 0.85,
            },
            {
              source: "hypothesis:v5_4_pos_crash",
              target: "decision:rollback_v5_4",
              type: "RESOLVES",
              weight: 0.92,
            },
          ],
        };
        setGraphData(defaultData);
        setSelectedNode(defaultData.nodes[0]);
        onSelectNode?.(defaultData.nodes[0]);
      });
  }, [storeId]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !graphData) return;

    // 1. Three.js Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    // Ambient and Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x818cf8, 1.5);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    // 2. Nodes Setup
    const nodeMeshes = new Map();
    const clickableObjects = [];

    graphData.nodes.forEach((node) => {
      const hexColor = NODE_COLORS[node.type] || 0x6366f1;
      const radius = (node.val || 20) * 0.045;

      const nodeGeo = new THREE.SphereGeometry(radius, 32, 32);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: hexColor,
        roughness: 0.25,
        metalness: 0.2,
        emissive: hexColor,
        emissiveIntensity: 0.35,
      });

      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      const [x, y, z] = node.position || [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
      ];
      mesh.position.set(x, y, z);
      mesh.userData = { nodeData: node };

      // Halo ring around node
      const haloGeo = new THREE.RingGeometry(radius * 1.25, radius * 1.45, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: hexColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(x, y, z);
      mesh.add(halo);

      graphGroup.add(mesh);
      nodeMeshes.set(node.id, mesh);
      clickableObjects.push(mesh);
    });

    // 3. Edges Setup (Curves + Pulse Particles)
    const edgeCurves = [];

    graphData.links.forEach((link) => {
      const sourceMesh = nodeMeshes.get(link.source);
      const targetMesh = nodeMeshes.get(link.target);
      if (!sourceMesh || !targetMesh) return;

      const start = sourceMesh.position;
      const end = targetMesh.position;
      const mid = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5)
        .add(new THREE.Vector3(0, 1.2, 0.5));

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      edgeCurves.push(curve);

      const points = curve.getPoints(40);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.35,
        linewidth: 2,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      graphGroup.add(line);

      // Add energy pulse particle along curve
      const pulseGeo = new THREE.SphereGeometry(0.12, 12, 12);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.9,
      });
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      graphGroup.add(pulse);
      curve.pulseMesh = pulse;
    });

    // 4. Mouse Drag & Orbit Interaction
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0.003, y: 0.004 };

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      graphGroup.rotation.y += deltaX * 0.008;
      graphGroup.rotation.x += deltaY * 0.008;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // 5. Raycasting for Node Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects);

      if (intersects.length > 0) {
        const clickedNode = intersects[0].object.userData.nodeData;
        setSelectedNode(clickedNode);
        onSelectNode?.(clickedNode);
      }
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("click", onClick);

    // 6. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle auto-rotation when not dragging
      if (!isDragging) {
        graphGroup.rotation.y += 0.003;
        graphGroup.rotation.x = Math.sin(elapsedTime * 0.4) * 0.08;
      }

      // Move pulse particles along bezier curves
      edgeCurves.forEach((curve, idx) => {
        if (curve.pulseMesh) {
          const t = (elapsedTime * 0.4 + idx * 0.35) % 1;
          const pos = curve.getPoint(t);
          curve.pulseMesh.position.copy(pos);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("click", onClick);
      renderer.dispose();
    };
  }, [graphData]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: "480px" }}>
      {/* 3D WebGL Canvas Mount */}
      <div
        ref={mountRef}
        style={{
          width: "100%",
          height: "480px",
          cursor: "grab",
          borderRadius: "12px",
          background: "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.08) 0%, rgba(15,17,23,0) 70%)",
        }}
      />

      {/* Floating Instructions Pill */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          left: "14px",
          background: "rgba(24, 29, 43, 0.75)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.1)",
          padding: "6px 12px",
          borderRadius: "100px",
          fontSize: "0.75rem",
          color: "#94A3B8",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          pointerEvents: "none",
        }}
      >
        <Sparkles size={12} color="#818CF8" />
        <span>Drag to orbit in 3D · Click node to inspect</span>
      </div>

      {/* Floating Selected Node Quick Badge */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: "absolute",
            bottom: "16px",
            left: "16px",
            right: "16px",
            background: "rgba(24, 29, 43, 0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "10px",
            padding: "12px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: selectedNode.color || "#818CF8",
                  background: `${selectedNode.color || "#818CF8"}20`,
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {selectedNode.type}
              </span>
              <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>
                {selectedNode.label || selectedNode.id}
              </span>
            </div>
            <span style={{ fontSize: "0.78rem", color: "#94A3B8" }}>
              {selectedNode.desc || "Causal evidence node connected via relational edges"}
            </span>
          </div>

          <span
            style={{
              fontSize: "0.72rem",
              fontFamily: "monospace",
              color: "#818CF8",
              background: "rgba(99,102,241,0.15)",
              padding: "4px 8px",
              borderRadius: "6px",
            }}
          >
            ACTIVE 3D SELECTION
          </span>
        </motion.div>
      )}
    </div>
  );
}
