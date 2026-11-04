import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * CampusWebGLHero
 * Lightweight, GPU-efficient Three.js WebGL canvas for the login hero experience.
 * Features an interactive rotating geometric node lattice representing the interconnected
 * campus operating system. Respects prefers-reduced-motion and gracefully falls back to CSS.
 */
export default function CampusWebGLHero() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    let animationFrameId;
    let scene, camera, renderer, group, points, lines;

    try {
      const container = containerRef.current;
      const width = container.clientWidth || 400;
      const height = container.clientHeight || 600;

      // 1. Scene & Camera
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.z = 18;

      // 2. Renderer with low-power profile
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      container.appendChild(renderer.domElement);

      group = new THREE.Group();
      scene.add(group);

      // 3. Create interconnected node lattice (Campus Infrastructure Graph)
      const particleCount = 42;
      const positions = [];
      const particleGeometry = new THREE.BufferGeometry();
      const radius = 6.5;

      for (let i = 0; i < particleCount; i++) {
        // Golden spiral sphere distribution for aesthetic harmony
        const phi = Math.acos(-1 + (2 * i) / particleCount);
        const theta = Math.sqrt(particleCount * Math.PI) * phi;
        const x = radius * Math.cos(theta) * Math.sin(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);
        const z = radius * Math.cos(phi);
        positions.push(x, y, z);
      }

      particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

      // Luminous nodes material
      const particleMaterial = new THREE.PointsMaterial({
        color: 0x34d399, // Emerald-400
        size: 0.28,
        transparent: true,
        opacity: 0.9
      });
      points = new THREE.Points(particleGeometry, particleMaterial);
      group.add(points);

      // Inter-node connecting grid lines
      const linePositions = [];
      const threshold = 4.2;
      for (let i = 0; i < particleCount; i++) {
        const x1 = positions[i * 3];
        const y1 = positions[i * 3 + 1];
        const z1 = positions[i * 3 + 2];
        for (let j = i + 1; j < particleCount; j++) {
          const x2 = positions[j * 3];
          const y2 = positions[j * 3 + 1];
          const z2 = positions[j * 3 + 2];
          const dist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
          if (dist < threshold) {
            linePositions.push(x1, y1, z1, x2, y2, z2);
          }
        }
      }

      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x059669, // Emerald-600
        transparent: true,
        opacity: 0.35
      });
      lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      group.add(lines);

      // 4. Subtle mouse interaction
      let mouseX = 0;
      let mouseY = 0;
      const handleMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / width - 0.5) * 0.4;
        mouseY = ((e.clientY - rect.top) / height - 0.5) * 0.4;
      };
      window.addEventListener('mousemove', handleMouseMove);

      // 5. Static, non-animated WebGL lattice rendering
      group.rotation.y = 0.45;
      group.rotation.x = 0.2;
      renderer.render(scene, camera);

      // Handle window resize
      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        renderer.render(scene, camera);
      };
      window.addEventListener('resize', handleResize);

      // Cleanup on unmount
      return () => {
        window.removeEventListener('resize', handleResize);

        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
        if (particleGeometry) particleGeometry.dispose();
        if (particleMaterial) particleMaterial.dispose();
        if (lineGeometry) lineGeometry.dispose();
        if (lineMaterial) lineMaterial.dispose();
      };
    } catch (e) {
      console.warn('Three.js initialization skipped, fallback active', e);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-75"
      aria-hidden="true"
    />
  );
}
