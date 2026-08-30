import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { ZoomIn, ZoomOut, RotateCcw, Activity } from "lucide-react";

const NODE_HEX_COLORS = {
  KPI: 0x8b5cf6,       // Purple
  Entity: 0xec4899,    // Pink
  Event: 0xf59e0b,     // Amber
  Evidence: 0x10b981,  // Emerald
  Hypothesis: 0x6366f1,// Indigo
  Decision: 0xef4444,  // Red
};

const EDGE_HEX_COLORS = {
  PRECEDES: 0xf59e0b,
  CORROBORATES: 0x10b981,
  CAUSED_BY: 0x8b5cf6,
  EXPLAINS: 0x6366f1,
  RESOLVES: 0xef4444,
  AFFECTS: 0x38bdf8,
};

export default function EvidenceGraph3D({ nodes = [], edges = [], onSelectNode }) {
  const mountRef = useRef(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const controlsRef = useRef({ zoom: 24, rotationX: 0.2, rotationY: 0.4 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Three.js Scene & Camera Setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, controlsRef.current.zoom);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    // Ambient and Directional Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x818cf8, 1.8);
    dirLight1.position.set(15, 25, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa78bfa, 1.0);
    dirLight2.position.set(-15, -20, -15);
    scene.add(dirLight2);

    // 2. Node Position Calculation (3D Spherical Force Layout)
    const nodeMeshes = new Map();
    const clickableObjects = [];
    const nodePositions = new Map();

    const totalNodes = Math.max(nodes.length, 1);
    nodes.forEach((node, idx) => {
      // Compute spherical Fibonacci distribution for optimal spacing in 3D
      const phi = Math.acos(-1 + (2 * idx) / totalNodes);
      const theta = Math.sqrt(totalNodes * Math.PI) * phi;
      const radius = 9.5 + (idx % 3) * 2.2;

      // Special cluster positioning: KPIs in center, Events left, Evidence right, Decisions top
      let x = radius * Math.cos(theta) * Math.sin(phi);
      let y = radius * Math.sin(theta) * Math.sin(phi);
      let z = radius * Math.cos(phi) * 0.8;

      if (node.node_type === "KPI") {
        x *= 0.4; y *= 0.4; z *= 0.4;
      } else if (node.node_type === "Event") {
        x = -7.5 + (idx % 2) * 2;
      } else if (node.node_type === "Evidence") {
        x = 7.5 - (idx % 2) * 2;
      } else if (node.node_type === "Decision") {
        y = -6.5;
      }

      nodePositions.set(node.id, new THREE.Vector3(x, y, z));

      const hexColor = NODE_HEX_COLORS[node.node_type] || 0x8b5cf6;
      const sphereRadius = node.node_type === "KPI" ? 1.4 : node.node_type === "Hypothesis" ? 1.2 : 0.95;

      // Node Sphere
      const geo = new THREE.SphereGeometry(sphereRadius, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: hexColor,
        roughness: 0.2,
        metalness: 0.35,
        emissive: hexColor,
        emissiveIntensity: 0.4,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.userData = { node };

      // Halo Orbital Ring
      const ringGeo = new THREE.RingGeometry(sphereRadius * 1.3, sphereRadius * 1.5, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hexColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.45,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      mesh.add(ring);

      // Text Sprite Label
      const canvas = document.createElement("canvas");
      canvas.width = 380;
      canvas.height = 70;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "rgba(10, 10, 15, 0.85)";
      ctx.roundRect(10, 10, 360, 50, 12);
      ctx.fill();
      ctx.strokeStyle = `#${hexColor.toString(16).padStart(6, "0")}`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 20px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const displayTxt = (node.label || node.id).slice(0, 26);
      ctx.fillText(displayTxt, 190, 35);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set(0, sphereRadius + 1.2, 0);
      sprite.scale.set(4.5, 0.9, 1);
      mesh.add(sprite);

      graphGroup.add(mesh);
      nodeMeshes.set(node.id, mesh);
      clickableObjects.push(mesh);
    });

    // 3. Curved 3D Causal Edges Setup
    const edgeCurves = [];
    edges.forEach((edge) => {
      const srcId = edge.source || edge.from_id;
      const dstId = edge.target || edge.to_id;
      const srcPos = nodePositions.get(srcId);
      const dstPos = nodePositions.get(dstId);
      if (!srcPos || !dstPos) return;

      const hexColor = EDGE_HEX_COLORS[edge.relationship || edge.edge_type] || 0x8b5cf6;

      // Create smooth Quadratic Bezier curve
      const mid = new THREE.Vector3()
        .addVectors(srcPos, dstPos)
        .multiplyScalar(0.5)
        .add(new THREE.Vector3(0, 1.5, 0.8));

      const curve = new THREE.QuadraticBezierCurve3(srcPos, mid, dstPos);
      const points = curve.getPoints(36);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: hexColor,
        transparent: true,
        opacity: 0.6,
        linewidth: 2,
      });

      const line = new THREE.Line(lineGeo, lineMat);
      graphGroup.add(line);

      // Pulse Particle on Curve
      const particleGeo = new THREE.SphereGeometry(0.18, 16, 16);
      const particleMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const particle = new THREE.Mesh(particleGeo, particleMat);
      graphGroup.add(particle);

      edgeCurves.push({ curve, particle, progress: Math.random() });
    });

    // 4. Mouse Orbit Controls & Click Interaction
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseDown = (e) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      graphGroup.rotation.y += deltaX * 0.006;
      graphGroup.rotation.x += deltaY * 0.006;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects, false);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const nodeData = clickedMesh.userData.node;
        setSelectedNodeId(nodeData.id);
        onSelectNode?.(nodeData);

        // Highlight animation
        clickableObjects.forEach((m) => {
          m.material.emissiveIntensity = m === clickedMesh ? 0.9 : 0.3;
        });
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    domElement.addEventListener("click", onClick);

    // 5. Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Gentle auto-rotation when idle
      if (!isDragging) {
        graphGroup.rotation.y += 0.002;
      }

      // Animate edge particles along bezier curves
      edgeCurves.forEach((item) => {
        item.progress += 0.008;
        if (item.progress > 1) item.progress = 0;
        const pt = item.curve.getPoint(item.progress);
        item.particle.position.copy(pt);
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      domElement.removeEventListener("click", onClick);
      renderer.dispose();
    };
  }, [nodes, edges]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: "14px", overflow: "hidden" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%", cursor: "grab" }} />

      {/* Floating 3D Controls */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          display: "flex",
          gap: "8px",
          background: "rgba(10, 10, 15, 0.8)",
          backdropFilter: "blur(12px)",
          padding: "6px 10px",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <span style={{ fontSize: "0.72rem", color: "#A1A1AA", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
          <Activity size={12} color="#8B5CF6" /> Drag to Orbit · Click to Inspect
        </span>
      </div>
    </div>
  );
}
