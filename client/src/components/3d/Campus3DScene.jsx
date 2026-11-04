import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Building2,
  GraduationCap,
  Home,
  Wrench,
  ShieldCheck,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CAMPUS_ZONES = [
  {
    id: 'admin',
    name: 'Administrative Command Center',
    category: 'Governance & SLA',
    description: 'Executive campus overview, policy notices, approval queues, and institutional telemetry.',
    route: '/admin/dashboard',
    position: { x: 0, y: 1.8, z: 0 },
    color: 0x10b981, // Emerald-500
    icon: Building2,
    metrics: '99.4% SLA Compliance'
  },
  {
    id: 'academic',
    name: 'Academic Complex',
    category: 'Lectures & Biometrics',
    description: 'Smart lecture theatres, automated biometric attendance, live timetable shifts, and hall tracking.',
    route: '/student/attendance',
    position: { x: -4.5, y: 1.2, z: -2.5 },
    color: 0x059669, // Emerald-600
    icon: GraduationCap,
    metrics: '88% Avg Class Attendance'
  },
  {
    id: 'hostel',
    name: 'Residential Blocks (Hostel)',
    category: 'Housing & Curfew',
    description: 'Room allocation grids, digital gate pass issuance, grievance lodgement, and curfew management.',
    route: '/student/hostel',
    position: { x: 4.5, y: 1.4, z: -2.5 },
    color: 0x047857, // Emerald-700
    icon: Home,
    metrics: 'Room 304 Allotted'
  },
  {
    id: 'facilities',
    name: 'Facilities & Maintenance Hub',
    category: 'Technicians & Work Queue',
    description: 'AI trade classification, SLA automated dispatch, plumber/electrician ticketing, and asset upkeep.',
    route: '/student/complaints',
    position: { x: -4.5, y: 1.0, z: 3.0 },
    color: 0x0d9488, // Teal-600
    icon: Wrench,
    metrics: '6 Active Tickets Assigned'
  },
  {
    id: 'mess',
    name: 'Dining & Mess Pavilion',
    category: 'Nutrition & Feedback',
    description: 'Live daily menus, dietary feedback sentiment analysis, food quality audits, and meal schedules.',
    route: '/student/mess',
    position: { x: 4.5, y: 0.9, z: 3.0 },
    color: 0x0f766e, // Teal-700
    icon: UtensilsCrossed,
    metrics: 'Special Sunday Feast Live'
  },
  {
    id: 'security',
    name: 'Security Gate & Turnstiles',
    category: 'Access Control & QR',
    description: 'Cryptographic QR pass verification, visitor check-in logs, emergency alarms, and vehicle monitoring.',
    route: '/student/gate-passes',
    position: { x: 0, y: 0.7, z: 5.5 },
    color: 0x14b8a6, // Teal-500
    icon: ShieldCheck,
    metrics: 'Turnstile QR Verified'
  }
];

export default function Campus3DScene({ className = '', onSelectZone = null }) {
  const containerRef = useRef(null);
  const [activeZone, setActiveZone] = useState(CAMPUS_ZONES[0]);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !containerRef.current) return;

    let scene, camera, renderer, animationFrameId;
    let buildingsGroup = new THREE.Group();
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2(-999, -999);
    let targetRotationY = 0;
    let targetRotationX = 0.3;
    let currentRotationY = 0;
    let currentRotationX = 0.3;
    let interactiveMeshes = [];

    try {
      const container = containerRef.current;
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 500;

      // Check WebGL context support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGlSupported(false);
        return;
      }

      // 1. Scene & Isometric Camera
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 11, 16);
      camera.lookAt(0, 0, 0);

      // 2. High-performance Antialiased WebGL Renderer
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);

      // 3. Ambient & Direct Accent Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
      scene.add(ambientLight);

      const mainLight = new THREE.DirectionalLight(0xd1fae5, 1.4); // Mint green tint
      mainLight.position.set(10, 18, 12);
      scene.add(mainLight);

      const rimLight = new THREE.DirectionalLight(0x10b981, 0.8);
      rimLight.position.set(-12, 8, -10);
      scene.add(rimLight);

      scene.add(buildingsGroup);

      // 4. Ground Matrix Platform (Grid Plate)
      const platformGeo = new THREE.CylinderGeometry(8.5, 9.0, 0.4, 32);
      const platformMat = new THREE.MeshStandardMaterial({
        color: 0x061e16,
        roughness: 0.6,
        metalness: 0.3
      });
      const platform = new THREE.Mesh(platformGeo, platformMat);
      platform.position.y = -0.2;
      buildingsGroup.add(platform);

      // Glowing cyber grid ring
      const ringGeo = new THREE.RingGeometry(8.5, 8.7, 48);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      buildingsGroup.add(ring);

      // 5. Build Stylized 3D Service Buildings & Data Nodes
      CAMPUS_ZONES.forEach((zone) => {
        const bGroup = new THREE.Group();
        bGroup.position.set(zone.position.x, 0, zone.position.z);

        // Building geometric body
        let geo;
        if (zone.id === 'admin') {
          geo = new THREE.BoxGeometry(2.4, 3.6, 2.4);
        } else if (zone.id === 'mess') {
          geo = new THREE.CylinderGeometry(1.6, 1.8, 1.8, 16);
        } else if (zone.id === 'security') {
          geo = new THREE.BoxGeometry(2.2, 1.4, 1.4);
        } else {
          geo = new THREE.BoxGeometry(2.0, 2.4, 2.0);
        }

        const mat = new THREE.MeshStandardMaterial({
          color: zone.color,
          roughness: 0.35,
          metalness: 0.45
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.y = geo.parameters.height ? geo.parameters.height / 2 : 1.0;
        mesh.userData = { zone };
        bGroup.add(mesh);
        interactiveMeshes.push(mesh);

        // Pinnacle Beacon / Hotspot Sphere
        const beaconGeo = new THREE.SphereGeometry(0.24, 16, 16);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0x6ee7b7 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.y = (geo.parameters.height || 2) + 0.35;
        bGroup.add(beacon);

        // Network Conduit Line connecting building to Central Admin Node
        if (zone.id !== 'admin') {
          const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0.05, 0),
            new THREE.Vector3(CAMPUS_ZONES[0].position.x - zone.position.x, 0.05, CAMPUS_ZONES[0].position.z - zone.position.z)
          ]);
          const lineMat = new THREE.LineBasicMaterial({
            color: 0x34d399,
            transparent: true,
            opacity: 0.4
          });
          const conduit = new THREE.Line(lineGeo, lineMat);
          bGroup.add(conduit);
        }

        buildingsGroup.add(bGroup);
      });

      // 6. Floating Ambient Particle Cloud
      const particleCount = 60;
      const pPositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        pPositions[i] = (Math.random() - 0.5) * 16;
        pPositions[i + 1] = Math.random() * 6 + 0.5;
        pPositions[i + 2] = (Math.random() - 0.5) * 16;
      }
      const particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: 0x34d399,
        size: 0.15,
        transparent: true,
        opacity: 0.7
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // 7. Mouse Parallax & Raycasting
      const onMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;

        mouse.x = (clientX / width) * 2 - 1;
        mouse.y = -(clientY / height) * 2 + 1;

        targetRotationY = (clientX / width - 0.5) * 0.7;
        targetRotationX = 0.3 + (clientY / height - 0.5) * 0.25;
      };

      const onClick = () => {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveMeshes);
        if (intersects.length > 0) {
          const clickedZone = intersects[0].object.userData.zone;
          if (clickedZone) {
            setActiveZone(clickedZone);
            if (onSelectZone) onSelectZone(clickedZone);
          }
        }
      };

      container.addEventListener('mousemove', onMouseMove);
      container.addEventListener('click', onClick);

      // 8. Animation Loop
      let clock = new THREE.Clock();
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Static non-animated orientation
        currentRotationY = targetRotationY;
        currentRotationX = targetRotationX;

        buildingsGroup.rotation.y = currentRotationY;
        buildingsGroup.rotation.x = currentRotationX;

        // Raycasting for hover highlights
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveMeshes);

        if (intersects.length > 0) {
          const hZone = intersects[0].object.userData.zone;
          setHoveredZone(hZone);
          container.style.cursor = 'pointer';
        } else {
          setHoveredZone(null);
          container.style.cursor = 'default';
        }

        renderer.render(scene, camera);
      };
      animate();

      // Resize handler
      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('click', onClick);

        if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
          renderer.dispose();
        }
        platformGeo.dispose();
        platformMat.dispose();
        ringGeo.dispose();
        ringMat.dispose();
        particleGeo.dispose();
        particleMat.dispose();
      };
    } catch (err) {
      console.warn('Campus3DScene initialization fell back to illustration mode', err);
      setWebGlSupported(false);
    }
  }, []);

  const ActiveIcon = activeZone.icon;

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-emerald-50/40 to-slate-100 shadow-soft text-slate-900 ${className}`}>
      {/* 3D Canvas Container */}
      {webGlSupported ? (
        <div ref={containerRef} className="h-[420px] sm:h-[480px] w-full relative z-10" />
      ) : (
        /* Accessible Fallback Illustration when WebGL is unavailable */
        <div className="h-[420px] sm:h-[480px] w-full flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-3">
            <Sparkles className="h-10 w-10 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold">CAMPUS OS Digital Twin</h3>
            <p className="text-xs text-slate-300">
              Interactive 3D overview of campus operations across administrative, academic, residential, and facility zones.
            </p>
          </div>
        </div>
      )}

      {/* Top Overlay Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-emerald-300 text-[11px] font-bold text-emerald-800 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Interactive 3D Operations Twin</span>
        </div>
        {hoveredZone && (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
            <span>Hovering: {hoveredZone.name}</span>
          </div>
        )}
      </div>

      {/* Floating Active Node Telemetry Card */}
      <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-20 bg-white/95 backdrop-blur-xl border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
              <ActiveIcon className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                {activeZone.category}
              </span>
              <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                {activeZone.name}
              </h4>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
            {activeZone.metrics}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {activeZone.description}
        </p>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">Click node to inspect</span>
          <button
            onClick={() => navigate(activeZone.route)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            <span>Open Portal</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Accessible Service Zone Selector Pills (Right Side) */}
      <div className="absolute top-4 right-4 z-20 hidden md:flex flex-col gap-1.5">
        {CAMPUS_ZONES.map((zone) => {
          const isSelected = activeZone.id === zone.id;
          return (
            <button
              key={zone.id}
              onClick={() => setActiveZone(zone)}
              className={`px-3 py-1.5 rounded-xl text-left text-xs font-bold backdrop-blur-md flex items-center gap-2 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-emerald-glow scale-102 border border-emerald-500'
                  : 'bg-white/85 text-slate-700 hover:bg-white hover:text-slate-900 border border-slate-200/80 shadow-xs'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
              <span className="truncate max-w-[170px]">{zone.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
