import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { HOTSPOTS, SAMPLE_EARTHQUAKES, SAMPLE_VOLCANOES, TECTONIC_PLATES_POLYLINES } from '../data/tectonicsData';
import { BoundaryType, HotspotLocation } from '../types/tectonics';
import { RotateCw, ZoomIn, ZoomOut, Compass, Info, ArrowRight, Eye, ShieldAlert, Flame } from 'lucide-react';

interface GlobeViewProps {
  onSelectBoundary: (type: BoundaryType) => void;
  onNavigateToCrossSection: (type: BoundaryType) => void;
}

export const GlobeView: React.FC<GlobeViewProps> = ({ onSelectBoundary, onNavigateToCrossSection }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotLocation | null>(null);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [showQuakes, setShowQuakes] = useState<boolean>(true);
  const [showVolcanoes, setShowVolcanoes] = useState<boolean>(true);
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);

  // Three.js object refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const markerObjectsRef = useRef<{ mesh: THREE.Mesh; hotspot: HotspotLocation }[]>([]);
  const quakesGroupRef = useRef<THREE.Group | null>(null);
  const volcanoesGroupRef = useRef<THREE.Group | null>(null);
  const boundariesGroupRef = useRef<THREE.Group | null>(null);

  // Drag interaction states
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0.002 });
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  // Convert lat/lng to 3D Cartesian on sphere of radius R
  const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  // Generate procedural earth texture for landmasses and oceans
  const createEarthTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Deep ocean base
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    oceanGrad.addColorStop(0, '#0a192f');
    oceanGrad.addColorStop(0.5, '#0d2540');
    oceanGrad.addColorStop(1, '#0a192f');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines (lat/lng)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += canvas.width / 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += canvas.height / 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Equator highlight
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    // Stylized continent outlines
    ctx.fillStyle = '#1e3a5f';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;

    // Approximate major landmass projections for clean crisp educational 3D visual
    const continents = [
      // Eurasia & Africa
      [[15, 30], [20, 45], [35, 70], [60, 75], [70, 40], [60, 20], [45, 10], [35, -10], [10, -15], [0, 10], [5, 25]],
      // Asia
      [[60, 70], [80, 75], [120, 70], [140, 60], [130, 30], [105, 10], [75, 15], [60, 40]],
      // Africa
      [[35, -5], [30, 35], [10, 50], [-15, 40], [-35, 20], [-34, 18], [-10, 10], [5, 0], [15, -15]],
      // North America
      [[70, -140], [70, -60], [45, -60], [30, -80], [20, -100], [30, -120], [60, -140]],
      // South America
      [[10, -75], [0, -50], [-10, -35], [-35, -55], [-55, -70], [-20, -75], [0, -80]],
      // Australia
      [[-15, 130], [-12, 145], [-35, 150], [-38, 140], [-32, 115], [-20, 115]],
      // Antarctica
      [[-70, -180], [-68, 180], [-80, 180], [-80, -180]]
    ];

    continents.forEach(polygon => {
      ctx.beginPath();
      polygon.forEach(([lat, lng], idx) => {
        const x = ((lng + 180) / 360) * canvas.width;
        const y = ((90 - lat) / 180) * canvas.height;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 600;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 260);
    cameraRef.current = camera;

    // 2. Renderer with safe WebGL fallback
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      mountRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch {
      return;
    }

    // 3. Globe Container Group
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // Earth Sphere
    const RADIUS = 90;
    const earthGeo = new THREE.SphereGeometry(RADIUS, 64, 64);
    const earthTexture = createEarthTexture();
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.7,
      metalness: 0.1,
      emissive: new THREE.Color(0x061122),
      emissiveIntensity: 0.3
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // Atmospheric Glow rim
    const atmosphereGeo = new THREE.SphereGeometry(RADIUS * 1.025, 64, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphereMesh);

    // Outer subtle glow shell
    const outerGlowGeo = new THREE.SphereGeometry(RADIUS * 1.06, 32, 32);
    const outerGlowMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide
    });
    globeGroup.add(new THREE.Mesh(outerGlowGeo, outerGlowMat));

    // 4. Plate Boundaries Lines Group
    const boundariesGroup = new THREE.Group();
    boundariesGroupRef.current = boundariesGroup;
    globeGroup.add(boundariesGroup);

    TECTONIC_PLATES_POLYLINES.forEach(poly => {
      const points: THREE.Vector3[] = [];
      poly.path.forEach(([lat, lng]) => {
        points.push(latLngToVector3(lat, lng, RADIUS * 1.008));
      });
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(poly.color),
        linewidth: 2,
        transparent: true,
        opacity: 0.85
      });
      const line = new THREE.Line(geometry, material);
      boundariesGroup.add(line);
    });

    // 5. Earthquakes Group (Benioff Depth colored)
    const quakesGroup = new THREE.Group();
    quakesGroupRef.current = quakesGroup;
    globeGroup.add(quakesGroup);

    SAMPLE_EARTHQUAKES.forEach(eq => {
      const pos = latLngToVector3(eq.lat, eq.lng, RADIUS * 1.012);
      // Shallow (<70km) = emerald/green, Intermediate (70-300km) = amber/orange, Deep (>300km) = violet
      const color = eq.depthKm < 70 ? 0x22c55e : eq.depthKm < 300 ? 0xf97316 : 0xa855f7;
      const size = Math.max(1.2, eq.magnitude * 0.28);
      const qGeo = new THREE.SphereGeometry(size, 8, 8);
      const qMat = new THREE.MeshBasicMaterial({ color });
      const qMesh = new THREE.Mesh(qGeo, qMat);
      qMesh.position.copy(pos);
      quakesGroup.add(qMesh);
    });

    // 6. Volcanoes Group
    const volcanoesGroup = new THREE.Group();
    volcanoesGroupRef.current = volcanoesGroup;
    globeGroup.add(volcanoesGroup);

    SAMPLE_VOLCANOES.forEach(vol => {
      const pos = latLngToVector3(vol.lat, vol.lng, RADIUS * 1.015);
      const vGeo = new THREE.ConeGeometry(1.6, 3.2, 5);
      const vMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const vMesh = new THREE.Mesh(vGeo, vMat);
      vMesh.position.copy(pos);
      // Orient cone pointing radially outwards
      vMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());
      volcanoesGroup.add(vMesh);
    });

    // 7. Interactive Hotspot Markers
    const markerObjs: { mesh: THREE.Mesh; hotspot: HotspotLocation }[] = [];
    HOTSPOTS.forEach(hs => {
      const pos = latLngToVector3(hs.lat, hs.lng, RADIUS * 1.02);
      const markerColor = hs.boundaryType === 'divergent' ? 0xf97316 :
        hs.boundaryType === 'convergent_subduction' ? 0x38bdf8 :
        hs.boundaryType === 'convergent_collision' ? 0xeab308 : 0x10b981;

      // Inner glowing core
      const mGeo = new THREE.SphereGeometry(2.4, 16, 16);
      const mMat = new THREE.MeshBasicMaterial({ color: markerColor });
      const mMesh = new THREE.Mesh(mGeo, mMat);
      mMesh.position.copy(pos);

      // Outer ring
      const ringGeo = new THREE.RingGeometry(3.0, 4.2, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: markerColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize());
      ringMesh.position.copy(pos);

      const markerParent = new THREE.Group();
      markerParent.add(mMesh);
      markerParent.add(ringMesh);
      globeGroup.add(markerParent);

      markerObjs.push({ mesh: mMesh, hotspot: hs });
    });
    markerObjectsRef.current = markerObjs;

    // 8. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff5ea, 1.6);
    dirLight1.position.set(200, 150, 150);
    scene.add(dirLight1);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-200, -100, -100);
    scene.add(rimLight);

    // Initial tilt of Earth axis (~23.5 degrees)
    globeGroup.rotation.z = 0.25;
    globeGroup.rotation.y = 2.2;

    // 9. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotateRef.current && !isDraggingRef.current && globeGroupRef.current) {
        globeGroupRef.current.rotation.y += 0.003;
      } else if (!autoRotateRef.current && !isDraggingRef.current && globeGroupRef.current) {
        // Inertia damping
        globeGroupRef.current.rotation.y += rotationVelocityRef.current.y;
        globeGroupRef.current.rotation.x += rotationVelocityRef.current.x;
        rotationVelocityRef.current.x *= 0.92;
        rotationVelocityRef.current.y *= 0.92;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 10. Window Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update visibility toggles
  useEffect(() => {
    if (quakesGroupRef.current) quakesGroupRef.current.visible = showQuakes;
    if (volcanoesGroupRef.current) volcanoesGroupRef.current.visible = showVolcanoes;
    if (boundariesGroupRef.current) boundariesGroupRef.current.visible = showBoundaries;
  }, [showQuakes, showVolcanoes, showBoundaries]);

  // Pointer interactions for rotation and raycasting
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !globeGroupRef.current) return;
    const deltaX = e.clientX - prevMousePosRef.current.x;
    const deltaY = e.clientY - prevMousePosRef.current.y;

    globeGroupRef.current.rotation.y += deltaX * 0.005;
    globeGroupRef.current.rotation.x += deltaY * 0.005;

    rotationVelocityRef.current = {
      x: deltaY * 0.002,
      y: deltaX * 0.002
    };

    prevMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    // Check click for hotspot intersection
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    const meshes = markerObjectsRef.current.map(m => m.mesh);
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const found = markerObjectsRef.current.find(m => m.mesh === hitMesh);
      if (found) {
        setSelectedHotspot(found.hotspot);
        onSelectBoundary(found.hotspot.boundaryType);
        setAutoRotate(false);
      }
    }
  };

  const zoomCamera = (amount: number) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.min(380, Math.max(160, cameraRef.current.position.z + amount));
  };

  const resetView = () => {
    if (!cameraRef.current || !globeGroupRef.current) return;
    cameraRef.current.position.set(0, 0, 260);
    globeGroupRef.current.rotation.set(0, 2.2, 0.25);
    rotationVelocityRef.current = { x: 0, y: 0.002 };
    setSelectedHotspot(null);
  };

  const focusOnHotspot = useCallback((hs: HotspotLocation) => {
    setSelectedHotspot(hs);
    onSelectBoundary(hs.boundaryType);
    setAutoRotate(false);
    if (!globeGroupRef.current) return;

    // Rotate globe to face this lat/lng
    const targetY = -((hs.lng + 90) * (Math.PI / 180));
    const targetX = (hs.lat * (Math.PI / 180)) * 0.7;

    globeGroupRef.current.rotation.y = targetY;
    globeGroupRef.current.rotation.x = targetX;
  }, [onSelectBoundary]);

  return (
    <div className="relative w-full h-[620px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none">
      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* Top Floating Controls & Info */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-lg pointer-events-auto shadow-lg flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
          <span className="text-xs font-semibold text-slate-200">3D 지구본 판 경계 탐색</span>
          <span className="text-xs text-slate-400 hidden sm:inline">· 드래그하여 회전, 핀 클릭으로 탐색</span>
        </div>

        {/* View toggles & Camera controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-800 p-1.5 rounded-lg pointer-events-auto shadow-lg">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="자동 회전 토글"
            className={`px-2.5 py-1 text-xs font-medium rounded flex items-center gap-1 transition-colors ${
              autoRotate ? 'bg-sky-500 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">자동 회전</span>
          </button>
          <button
            onClick={() => zoomCamera(-25)}
            title="확대"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => zoomCamera(25)}
            title="축소"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetView}
            title="시점 초기화"
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Layer Toggles Floating Deck */}
      <div className="absolute top-16 left-4 flex flex-col gap-1.5 pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-lg shadow-lg text-xs space-y-2 max-w-[210px]">
          <div className="font-semibold text-slate-300 pb-1 border-b border-slate-800 flex items-center justify-between">
            <span>관측 레이어</span>
            <Eye className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showBoundaries}
              onChange={e => setShowBoundaries(e.target.checked)}
              className="accent-sky-500 rounded"
            />
            <span>주요 판 경계선</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showQuakes}
              onChange={e => setShowQuakes(e.target.checked)}
              className="accent-sky-500 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span>지진 진원(심도별)</span>
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showVolcanoes}
              onChange={e => setShowVolcanoes(e.target.checked)}
              className="accent-sky-500 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span>주요 활화산</span>
            </span>
          </label>
        </div>

        {/* Hotspot Quick Selectors */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-lg shadow-lg text-xs space-y-1.5 max-w-[210px] hidden sm:block">
          <div className="font-semibold text-slate-300 pb-1 border-b border-slate-800 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>대표 관측 지점</span>
          </div>
          <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
            {HOTSPOTS.map(hs => (
              <button
                key={hs.id}
                onClick={() => focusOnHotspot(hs)}
                className={`w-full text-left px-2 py-1 rounded text-[11px] truncate transition-colors ${
                  selectedHotspot?.id === hs.id
                    ? 'bg-sky-600 text-white font-medium'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {hs.name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Hotspot Bottom Sheet / Card */}
      {selectedHotspot && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-slate-900/95 backdrop-blur-lg border border-sky-500/40 p-4 rounded-xl shadow-2xl z-20 pointer-events-auto transition-all animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <span className="text-[11px] font-medium text-sky-400 uppercase tracking-wider">
                {selectedHotspot.boundaryType === 'divergent' && '발산형 경계 (해령/열곡)'}
                {selectedHotspot.boundaryType === 'convergent_subduction' && '수렴형 경계 (섭입대)'}
                {selectedHotspot.boundaryType === 'convergent_collision' && '수렴형 경계 (충돌대)'}
                {selectedHotspot.boundaryType === 'transform' && '보존형 경계 (변환단층)'}
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">{selectedHotspot.name}</h3>
            </div>
            <button
              onClick={() => setSelectedHotspot(null)}
              className="text-slate-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>

          <div className="text-xs text-slate-300 space-y-1.5 my-2.5">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="font-semibold text-slate-300">판 이동:</span>
              <span>{selectedHotspot.plates}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="font-semibold text-slate-300">지질 특징:</span>
              <span>{selectedHotspot.features}</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed border-t border-slate-800 pt-1.5">
              {selectedHotspot.description}
            </p>
          </div>

          <button
            onClick={() => {
              onSelectBoundary(selectedHotspot.boundaryType);
              onNavigateToCrossSection(selectedHotspot.boundaryType);
            }}
            className="w-full mt-2 py-2 px-3 bg-sky-500 hover:bg-sky-400 active:bg-sky-600 text-slate-950 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <span>이 경계의 내부 단면 시뮬레이션 열기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bottom Legend */}
      <div className="absolute bottom-4 left-4 hidden lg:flex items-center gap-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-lg text-[11px] pointer-events-auto text-slate-300 shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
          <span>수렴(섭입)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span>발산(해령)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span>수렴(충돌)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>보존(변환단층)</span>
        </div>
        <div className="h-3 w-px bg-slate-700 mx-1" />
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          <span>진원 깊이:</span>
          <span className="text-emerald-400 font-medium">천발</span>
          <span className="text-orange-400 font-medium">중발</span>
          <span className="text-purple-400 font-medium">심발</span>
        </div>
        <div className="h-3 w-px bg-slate-700 mx-1" />
        <div className="flex items-center gap-1 text-red-400">
          <Flame className="w-3 h-3" />
          <span>화산</span>
        </div>
      </div>
    </div>
  );
};
