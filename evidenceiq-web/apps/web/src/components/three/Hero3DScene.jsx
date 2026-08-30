import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Hero3DScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 28;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Group to hold all 3D objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Central Geodesic Network Sphere
    const geoIcosahedron = new THREE.IcosahedronGeometry(7, 2);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const wireframeSphere = new THREE.Mesh(geoIcosahedron, wireframeMat);
    mainGroup.add(wireframeSphere);

    // Inner glowing core
    const coreGeo = new THREE.IcosahedronGeometry(4.2, 3);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    mainGroup.add(coreMesh);

    // 2. Floating Nodes (Key Evidence Anchors)
    const nodeColors = [0x6366f1, 0x10b981, 0xf59e0b, 0xa855f7, 0xef4444, 0x38bdf8];
    const nodeCount = 36;
    const nodeMeshes = [];
    const nodePositions = [];

    const sphereRadius = 7.2;
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;

      const x = sphereRadius * Math.cos(theta) * Math.sin(phi);
      const y = sphereRadius * Math.sin(theta) * Math.sin(phi);
      const z = sphereRadius * Math.cos(phi);

      nodePositions.push(new THREE.Vector3(x, y, z));

      const size = 0.22 + Math.random() * 0.28;
      const nodeGeo = new THREE.SphereGeometry(size, 16, 16);
      const color = nodeColors[i % nodeColors.length];
      const nodeMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.85,
      });

      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.set(x, y, z);
      mainGroup.add(mesh);
      nodeMeshes.push({ mesh, origin: new THREE.Vector3(x, y, z), offset: Math.random() * Math.PI * 2 });
    }

    // 3. Ambient Starfield / Floating Data Particles
    const particleCount = 240;
    const particleGeo = new THREE.BufferGeometry();
    const particleCoords = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 10 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particleCoords[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particleCoords[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particleCoords[i * 3 + 2] = radius * Math.cos(phi);

      const isIndigo = Math.random() > 0.4;
      particleColors[i * 3] = isIndigo ? 0.4 : 0.06;
      particleColors[i * 3 + 1] = isIndigo ? 0.45 : 0.72;
      particleColors[i * 3 + 2] = isIndigo ? 0.95 : 0.51;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particleCoords, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Glowing Orbital Rings
    const createRing = (radius, color, rotationEuler) => {
      const ringGeo = new THREE.RingGeometry(radius, radius + 0.08, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.set(rotationEuler.x, rotationEuler.y, rotationEuler.z);
      mainGroup.add(ring);
      return ring;
    };

    const ring1 = createRing(9.2, 0x818cf8, { x: Math.PI / 3, y: 0.2, z: 0 });
    const ring2 = createRing(11.5, 0x10b981, { x: -Math.PI / 4, y: Math.PI / 6, z: 0.3 });

    // Mouse Tracking for Smooth Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.4;
      targetY = y * 0.4;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse interpolation
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Rotate central structures
      mainGroup.rotation.y = elapsedTime * 0.12 + mouseX;
      mainGroup.rotation.x = Math.sin(elapsedTime * 0.08) * 0.15 + mouseY;

      coreMesh.rotation.y = -elapsedTime * 0.2;
      coreMesh.rotation.z = elapsedTime * 0.1;

      ring1.rotation.z = elapsedTime * 0.15;
      ring2.rotation.z = -elapsedTime * 0.1;

      particles.rotation.y = elapsedTime * 0.03;

      // Pulse nodes subtly
      nodeMeshes.forEach(({ mesh, origin, offset }, idx) => {
        const pulse = Math.sin(elapsedTime * 2 + offset) * 0.15;
        mesh.position.set(
          origin.x * (1 + pulse * 0.04),
          origin.y * (1 + pulse * 0.04),
          origin.z * (1 + pulse * 0.04)
        );
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity: 0.88,
      }}
    />
  );
}
