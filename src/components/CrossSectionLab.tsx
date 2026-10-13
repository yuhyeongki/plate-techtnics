import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BOUNDARIES_DATA } from '../data/tectonicsData';
import { BoundaryType, SimState } from '../types/tectonics';
import { soundFx } from '../utils/audio';

interface CrossSectionLabProps {
  simState: SimState;
  onUpdateSimState: (updater: (prev: SimState) => SimState) => void;
}

export const CrossSectionLab: React.FC<CrossSectionLabProps> = ({
  simState,
  onUpdateSimState
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const soundCooldownRef = useRef<number>(0);
  const animTimeRef = useRef<number>(simState.time);

  useEffect(() => {
    animTimeRef.current = simState.time;
  }, [simState.time]);

  // Particles for magma plumes and eruptions
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number }[]>([]);
  // Earthquake shockwaves
  const shockwavesRef = useRef<{ x: number; y: number; radius: number; maxRadius: number; color: string; opacity: number }[]>([]);

  const boundary = BOUNDARIES_DATA[simState.boundaryType] || BOUNDARIES_DATA.divergent;

  // Sound trigger helper
  const triggerQuakeSound = useCallback((intensity: 'shallow' | 'intermediate' | 'deep') => {
    if (simState.soundEnabled && performance.now() - soundCooldownRef.current > 600) {
      soundFx.playQuakeSound(intensity);
      soundCooldownRef.current = performance.now();
    }
  }, [simState.soundEnabled]);

  const triggerMagmaSound = useCallback(() => {
    if (simState.soundEnabled && performance.now() - soundCooldownRef.current > 800) {
      soundFx.playMagmaSound();
      soundCooldownRef.current = performance.now();
    }
  }, [simState.soundEnabled]);

  // Main canvas render and physics update loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      // Handle continuous playback using internal animation ref to prevent React re-render lockups
      if (simState.isPlaying) {
        const speedMultiplier = simState.speed * (simState.plateSpeedCmPerYear / 5);
        animTimeRef.current = (animTimeRef.current + dt * 12 * speedMultiplier) % 100;
      }

      const localTime = animTimeRef.current;

      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Render based on boundary type
      switch (simState.boundaryType) {
        case 'divergent':
          drawDivergentBoundary(ctx, width, height, localTime);
          break;
        case 'convergent_subduction':
          drawSubductionBoundary(ctx, width, height, localTime);
          break;
        case 'convergent_collision':
          drawCollisionBoundary(ctx, width, height, localTime);
          break;
        case 'transform':
          drawTransformBoundary(ctx, width, height, localTime);
          break;
      }

      // Draw Depth Scale if enabled
      if (simState.showDepthScale && simState.boundaryType !== 'transform') {
        drawDepthRuler(ctx, width, height);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    simState.boundaryType,
    simState.isPlaying,
    simState.time,
    simState.speed,
    simState.plateDensityLeft,
    simState.plateDensityRight,
    simState.plateSpeedCmPerYear,
    simState.showEarthquakes,
    simState.showMagma,
    simState.showConvection,
    simState.showLabels,
    simState.showDepthScale,
    simState.soundEnabled,
    onUpdateSimState,
    triggerQuakeSound,
    triggerMagmaSound
  ]);

  // Handle high-DPI canvas resizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ==========================================
  // 1. 발산형 경계 (Divergent Boundary: 해령 & 열곡)
  // ==========================================
  const drawDivergentBoundary = (
    ctx: CanvasRenderingContext2D,
    rawWidth: number,
    rawHeight: number,
    t: number
  ) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = rawWidth / dpr;
    const height = rawHeight / dpr;

    const seaLevel = height * 0.22;
    const ridgeCenterX = width * 0.5;
    const crustThickness = 32;

    // Background: Sky & Ocean
    const skyGrad = ctx.createLinearGradient(0, 0, 0, seaLevel);
    skyGrad.addColorStop(0, '#091122');
    skyGrad.addColorStop(1, '#0e2340');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, seaLevel);

    // Ocean Water
    const oceanGrad = ctx.createLinearGradient(0, seaLevel, 0, height);
    oceanGrad.addColorStop(0, 'rgba(14, 165, 233, 0.45)');
    oceanGrad.addColorStop(0.3, 'rgba(3, 105, 161, 0.65)');
    oceanGrad.addColorStop(1, 'rgba(2, 44, 90, 0.9)');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, seaLevel, width, height - seaLevel);

    // Gentle wave on ocean surface
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 10) {
      const y = seaLevel + Math.sin(x * 0.05 + t * 0.2) * 2;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Asthenosphere (연약권 - 맨틀 대류)
    const mantleGrad = ctx.createLinearGradient(0, seaLevel + 60, 0, height);
    mantleGrad.addColorStop(0, '#78350f'); // warm asthenosphere
    mantleGrad.addColorStop(0.5, '#451a03');
    mantleGrad.addColorStop(1, '#1c0a02');
    ctx.fillStyle = mantleGrad;
    ctx.fillRect(0, seaLevel + crustThickness, width, height - (seaLevel + crustThickness));

    // Mantle Upwelling Plume (중앙 맨틀 상승류)
    const plumeGrad = ctx.createRadialGradient(
      ridgeCenterX, height * 0.7, 10,
      ridgeCenterX, seaLevel + crustThickness, width * 0.25
    );
    plumeGrad.addColorStop(0, 'rgba(239, 68, 68, 0.75)');
    plumeGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.5)');
    plumeGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = plumeGrad;
    ctx.beginPath();
    ctx.ellipse(ridgeCenterX, height * 0.65, width * 0.25, height * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Oceanic Crust (해양 지각) Profile with Mid-Ocean Ridge (해저 산맥 + 중앙 열곡)
    const getCrustTopY = (x: number) => {
      const distFromCenter = Math.abs(x - ridgeCenterX);
      // Ridge slope rises up, with central rift dip at center
      let elevation = 0;
      if (distFromCenter < 240) {
        elevation = Math.cos((distFromCenter / 240) * (Math.PI / 2)) * 65;
        // Central rift dip
        if (distFromCenter < 28) {
          const riftDip = Math.cos((distFromCenter / 28) * (Math.PI / 2)) * 22;
          elevation -= riftDip;
        }
      }
      return seaLevel + 70 - elevation;
    };

    // Draw Oceanic Crust Plates (Left Plate moving Left, Right Plate moving Right)
    ctx.fillStyle = '#334155'; // Dark Basaltic Crust
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(0, getCrustTopY(0));
    for (let x = 0; x <= width; x += 4) {
      ctx.lineTo(x, getCrustTopY(x));
    }
    ctx.lineTo(width, height * 0.55);
    ctx.lineTo(0, height * 0.55);
    ctx.closePath();
    ctx.fill();

    // Magnetic Stripes / Age gradient along ocean floor
    const stripeCount = 14;
    const stripeWidth = width / stripeCount;
    for (let i = 0; i < stripeCount; i++) {
      const stripeX = i * stripeWidth;
      const distCenter = Math.abs(stripeX + stripeWidth / 2 - ridgeCenterX);
      const isNormalPolarity = Math.floor(distCenter / 35) % 2 === 0;
      ctx.fillStyle = isNormalPolarity ? 'rgba(56, 189, 248, 0.08)' : 'rgba(239, 68, 68, 0.06)';
      ctx.fillRect(stripeX, seaLevel + 30, stripeWidth, 25);
    }

    // Plate Motion Arrows (<--- and --->)
    const arrowOffset = (t * 0.8) % 30;
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;

    // Left plate moving left
    drawArrow(ctx, ridgeCenterX - 90 - arrowOffset, seaLevel + 45, ridgeCenterX - 140 - arrowOffset, seaLevel + 45, '판 이동 (←)');
    // Right plate moving right
    drawArrow(ctx, ridgeCenterX + 90 + arrowOffset, seaLevel + 45, ridgeCenterX + 140 + arrowOffset, seaLevel + 45, '판 이동 (→)');

    // Mantle Convection Streamlines if enabled
    if (simState.showConvection) {
      drawConvectionFlow(ctx, ridgeCenterX - 110, height * 0.72, -1, t);
      drawConvectionFlow(ctx, ridgeCenterX + 110, height * 0.72, 1, t);
    }

    // Magma chamber & Pillow Lava Eruptions if enabled
    if (simState.showMagma) {
      // Central Magma Chamber
      const magGrad = ctx.createRadialGradient(
        ridgeCenterX, seaLevel + 80, 5,
        ridgeCenterX, seaLevel + 80, 32
      );
      magGrad.addColorStop(0, '#fef08a');
      magGrad.addColorStop(0.4, '#f97316');
      magGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = magGrad;
      ctx.beginPath();
      ctx.arc(ridgeCenterX, seaLevel + 75, 28, 0, Math.PI * 2);
      ctx.fill();

      // Magma particles rising into rift
      if (Math.random() < 0.4) {
        particlesRef.current.push({
          x: ridgeCenterX + (Math.random() - 0.5) * 14,
          y: seaLevel + 65,
          vx: (Math.random() - 0.5) * 0.8,
          vy: -1.2 - Math.random() * 1.5,
          life: 1,
          maxLife: 40 + Math.random() * 30,
          color: Math.random() > 0.5 ? '#f97316' : '#ef4444',
          size: 2.5 + Math.random() * 2.5
        });
        if (Math.random() < 0.05) triggerMagmaSound();
      }

      // Hydrothermal Vent / Black smoker particle smoke
      if (Math.random() < 0.25) {
        particlesRef.current.push({
          x: ridgeCenterX + 18,
          y: getCrustTopY(ridgeCenterX + 18),
          vx: 0.3,
          vy: -1.0,
          life: 1,
          maxLife: 50,
          color: 'rgba(226, 232, 240, 0.4)',
          size: 3
        });
      }
    }

    // Shallow Earthquakes along Rift Faults if enabled
    if (simState.showEarthquakes) {
      // Periodic quakes around central rift
      const quakePositions = [
        { x: ridgeCenterX - 22, y: seaLevel + 50 },
        { x: ridgeCenterX + 22, y: seaLevel + 52 },
        { x: ridgeCenterX, y: seaLevel + 58 }
      ];

      quakePositions.forEach((pos, idx) => {
        const pulsePhase = (t * 0.15 + idx * 0.33) % 1;
        drawQuakePulse(ctx, pos.x, pos.y, pulsePhase, 'shallow');
        if (pulsePhase < 0.03 && Math.random() < 0.2) {
          triggerQuakeSound('shallow');
        }
      });
    }

    // Educational Labels
    if (simState.showLabels) {
      drawLabelWithLine(ctx, ridgeCenterX, getCrustTopY(ridgeCenterX) - 20, ridgeCenterX, getCrustTopY(ridgeCenterX), '중앙 열곡 (Rift Valley)');
      drawLabelWithLine(ctx, ridgeCenterX - 120, getCrustTopY(ridgeCenterX - 120) - 20, ridgeCenterX - 120, getCrustTopY(ridgeCenterX - 120), '해령 (Mid-Ocean Ridge)');
      drawLabelWithLine(ctx, width * 0.18, seaLevel + 35, width * 0.18, seaLevel + 45, '해양 지각 (현무암질)');
      drawLabelWithLine(ctx, ridgeCenterX, height * 0.82, ridgeCenterX, height * 0.72, '맨틀 대류 상승류');
      drawLabelWithLine(ctx, width * 0.82, height * 0.7, width * 0.82, height * 0.65, '연약권 (맨틀)');
    }

    // Update and draw live particles
    updateAndDrawParticles(ctx);
  };

  // ========================================================
  // 2. 수렴형 경계: 섭입대 (Convergent Subduction: 해구 & 호상열도)
  // ========================================================
  const drawSubductionBoundary = (
    ctx: CanvasRenderingContext2D,
    rawWidth: number,
    rawHeight: number,
    t: number
  ) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = rawWidth / dpr;
    const height = rawHeight / dpr;

    const seaLevel = height * 0.26;
    const trenchX = width * 0.44;

    // Density calculation: higher density difference -> steeper subduction angle
    const dLeft = simState.plateDensityLeft; // oceanic ~ 3.0
    const dRight = simState.plateDensityRight; // continental ~ 2.7
    const densityDiff = Math.max(0.05, dLeft - dRight);
    // Subduction angle in radians: 30 deg (~0.52 rad) to 65 deg (~1.13 rad)
    const subductionAngle = Math.min(1.1, Math.max(0.45, 0.45 + densityDiff * 0.8));

    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, seaLevel);
    skyGrad.addColorStop(0, '#091122');
    skyGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, seaLevel);

    // Ocean on left side
    const oceanGrad = ctx.createLinearGradient(0, seaLevel, 0, height);
    oceanGrad.addColorStop(0, 'rgba(14, 165, 233, 0.5)');
    oceanGrad.addColorStop(0.4, 'rgba(3, 105, 161, 0.75)');
    oceanGrad.addColorStop(1, 'rgba(2, 44, 90, 0.95)');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, seaLevel, trenchX + 40, height - seaLevel);

    // Mantle background (연약권)
    const mantleGrad = ctx.createLinearGradient(0, seaLevel + 80, 0, height);
    mantleGrad.addColorStop(0, '#78350f');
    mantleGrad.addColorStop(0.6, '#451a03');
    mantleGrad.addColorStop(1, '#1c0a02');
    ctx.fillStyle = mantleGrad;
    ctx.fillRect(0, seaLevel + 60, width, height - (seaLevel + 60));

    // 1. Right Plate: Continental Plate (대륙판: 화강암질, 두께 50px~90px, 안데스/호상열도 화산 포함)
    const volcanoX = trenchX + width * 0.28;
    const volcanoHeight = 65;

    ctx.fillStyle = '#7c6046'; // Granite/continental crust earthy tone
    ctx.strokeStyle = '#9a7b5d';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(trenchX + 15, seaLevel + 35); // Trench continental slope
    ctx.lineTo(trenchX + 60, seaLevel + 12);
    ctx.lineTo(volcanoX - 45, seaLevel - 5);
    ctx.lineTo(volcanoX, seaLevel - volcanoHeight); // Volcano summit
    // Caldera dip
    ctx.lineTo(volcanoX + 8, seaLevel - volcanoHeight + 6);
    ctx.lineTo(volcanoX + 16, seaLevel - volcanoHeight);
    ctx.lineTo(volcanoX + 60, seaLevel - 15);
    ctx.lineTo(width, seaLevel - 8);
    ctx.lineTo(width, height * 0.7);
    ctx.lineTo(trenchX + 80, height * 0.7);
    // Boundary line with subducting slab
    ctx.lineTo(trenchX + 15, seaLevel + 35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. Left Plate: Oceanic Plate (해양판: 섭입하는 슬래브)
    const oceanicCrustThickness = 28;
    const slabStartX = trenchX;
    const slabStartY = seaLevel + 40;

    ctx.save();
    ctx.fillStyle = '#1e293b'; // Dense dark oceanic basalt
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    // Flat seafloor heading to trench
    ctx.moveTo(0, seaLevel + 35);
    ctx.lineTo(trenchX - 25, seaLevel + 35);
    // Bends down into trench
    ctx.lineTo(trenchX, slabStartY);
    // Subducting slab angled dive into deep mantle
    const slabDepth = height - slabStartY;
    const slabEndDX = Math.cos(subductionAngle) * slabDepth * 1.35;
    const slabEndDY = Math.sin(subductionAngle) * slabDepth * 1.35;

    ctx.lineTo(slabStartX + slabEndDX, slabStartY + slabEndDY);
    ctx.lineTo(slabStartX + slabEndDX - Math.sin(subductionAngle) * oceanicCrustThickness, slabStartY + slabEndDY + Math.cos(subductionAngle) * oceanicCrustThickness);
    ctx.lineTo(trenchX - 15, slabStartY + oceanicCrustThickness);
    ctx.lineTo(0, seaLevel + 35 + oceanicCrustThickness);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Accretionary Prism (부가체 - 해구 부근 퇴적물 쐐기)
    ctx.fillStyle = '#a89078';
    ctx.beginPath();
    ctx.moveTo(trenchX - 10, slabStartY + 5);
    ctx.lineTo(trenchX + 35, seaLevel + 22);
    ctx.lineTo(trenchX + 10, slabStartY + 15);
    ctx.closePath();
    ctx.fill();

    // Oceanic Plate Motion Arrow (--->)
    const arrowOffset = (t * 0.8) % 30;
    drawArrow(ctx, width * 0.12 + arrowOffset, seaLevel + 50, width * 0.22 + arrowOffset, seaLevel + 50, '해양판 이동 (→)');

    // Mantle Downwelling Convection stream
    if (simState.showConvection) {
      drawSubductionMantleFlow(ctx, trenchX + slabEndDX * 0.6, height * 0.82, subductionAngle, t);
    }

    // Magma Generation in Mantle Wedge & Volcanism
    if (simState.showMagma) {
      // Partial melting zone above slab (100-150km depth)
      const meltX = trenchX + Math.cos(subductionAngle) * 160;
      const meltY = slabStartY + Math.sin(subductionAngle) * 160 - 25;

      const meltGrad = ctx.createRadialGradient(meltX, meltY, 5, meltX, meltY, 32);
      meltGrad.addColorStop(0, '#fef08a');
      meltGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.8)');
      meltGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = meltGrad;
      ctx.beginPath();
      ctx.arc(meltX, meltY, 30, 0, Math.PI * 2);
      ctx.fill();

      // Magma chamber under volcano
      const chamberX = volcanoX + 8;
      const chamberY = seaLevel + 22;
      const chamberGrad = ctx.createRadialGradient(chamberX, chamberY, 5, chamberX, chamberY, 26);
      chamberGrad.addColorStop(0, '#fbbf24');
      chamberGrad.addColorStop(0.6, '#ef4444');
      chamberGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = chamberGrad;
      ctx.beginPath();
      ctx.arc(chamberX, chamberY, 24, 0, Math.PI * 2);
      ctx.fill();

      // Magma conduit from melt zone to chamber
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.6)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(meltX, meltY);
      ctx.quadraticCurveTo(meltX + 20, (meltY + chamberY) / 2, chamberX, chamberY);
      ctx.stroke();

      // Conduit to volcano summit
      ctx.beginPath();
      ctx.moveTo(chamberX, chamberY);
      ctx.lineTo(volcanoX + 8, seaLevel - volcanoHeight);
      ctx.stroke();

      // Eruption Particles at Volcano summit
      if (Math.random() < 0.5) {
        particlesRef.current.push({
          x: volcanoX + 8 + (Math.random() - 0.5) * 6,
          y: seaLevel - volcanoHeight,
          vx: (Math.random() - 0.5) * 1.5 + 0.3,
          vy: -2.0 - Math.random() * 2.2,
          life: 1,
          maxLife: 50 + Math.random() * 25,
          color: Math.random() > 0.4 ? '#f97316' : '#ef4444',
          size: 3 + Math.random() * 2.5
        });
        if (Math.random() < 0.08) triggerMagmaSound();
      }
      // Volcanic smoke plume drifting
      if (Math.random() < 0.4) {
        particlesRef.current.push({
          x: volcanoX + 8,
          y: seaLevel - volcanoHeight - 12,
          vx: 0.8 + Math.random() * 0.8,
          vy: -0.6 - Math.random() * 0.6,
          life: 1,
          maxLife: 70,
          color: 'rgba(148, 163, 184, 0.45)',
          size: 5 + Math.random() * 5
        });
      }
    }

    // Benioff Zone (베니오프대): Earthquakes along dipping slab boundary
    if (simState.showEarthquakes) {
      // 3 distinct depth stages: Shallow (천발), Intermediate (중발), Deep (심발)
      const benioffPoints = [
        { progress: 0.15, type: 'shallow' as const, label: '천발 (30km)' },
        { progress: 0.35, type: 'shallow' as const, label: '천발 (60km)' },
        { progress: 0.55, type: 'intermediate' as const, label: '중발 (140km)' },
        { progress: 0.72, type: 'intermediate' as const, label: '중발 (240km)' },
        { progress: 0.90, type: 'deep' as const, label: '심발 (420km)' }
      ];

      benioffPoints.forEach((bp, idx) => {
        const qx = slabStartX + Math.cos(subductionAngle) * (bp.progress * slabDepth * 1.2);
        const qy = slabStartY + Math.sin(subductionAngle) * (bp.progress * slabDepth * 1.2);
        const pulsePhase = (t * 0.12 + idx * 0.22) % 1;
        drawQuakePulse(ctx, qx, qy, pulsePhase, bp.type);

        if (pulsePhase < 0.03 && Math.random() < 0.15) {
          triggerQuakeSound(bp.type);
        }
      });
    }

    // Labels
    if (simState.showLabels) {
      drawLabelWithLine(ctx, trenchX - 10, seaLevel + 65, trenchX, slabStartY + 8, '해구 (Trench)');
      drawLabelWithLine(ctx, volcanoX, seaLevel - volcanoHeight - 20, volcanoX + 8, seaLevel - volcanoHeight, '화산호 / 호상열도');
      drawLabelWithLine(ctx, width * 0.15, seaLevel + 18, width * 0.15, seaLevel + 35, `해양판 (밀도 ${dLeft} g/cm³)`);
      drawLabelWithLine(ctx, width * 0.82, seaLevel + 15, width * 0.82, seaLevel + 30, `대륙판 (밀도 ${dRight} g/cm³)`);
      drawLabelWithLine(ctx, trenchX + 110, slabStartY + 95, trenchX + 130, slabStartY + 110, '베니오프대 (Benioff Zone)');
      drawLabelWithLine(ctx, trenchX + 45, seaLevel + 45, trenchX + 25, seaLevel + 28, '부가체 (퇴적물)');
    }

    updateAndDrawParticles(ctx);
  };

  // ========================================================
  // 3. 수렴형 경계: 충돌대 (Convergent Collision: 대륙-대륙 습곡산맥)
  // ========================================================
  const drawCollisionBoundary = (
    ctx: CanvasRenderingContext2D,
    rawWidth: number,
    rawHeight: number,
    t: number
  ) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = rawWidth / dpr;
    const height = rawHeight / dpr;

    const surfaceY = height * 0.32;
    const collisionCenterX = width * 0.5;

    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, surfaceY);
    skyGrad.addColorStop(0, '#091122');
    skyGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, surfaceY);

    // Mantle (연약권)
    const mantleGrad = ctx.createLinearGradient(0, surfaceY + 60, 0, height);
    mantleGrad.addColorStop(0, '#78350f');
    mantleGrad.addColorStop(0.6, '#451a03');
    mantleGrad.addColorStop(1, '#1c0a02');
    ctx.fillStyle = mantleGrad;
    ctx.fillRect(0, surfaceY + 40, width, height - (surfaceY + 40));

    // Thickened Continental Crust (습곡 산맥 + 지각 뿌리)
    // Mountain height and root depth
    const mountainPeaks = [
      { x: collisionCenterX - 75, h: 45 },
      { x: collisionCenterX - 25, h: 72 },
      { x: collisionCenterX + 15, h: 65 },
      { x: collisionCenterX + 65, h: 40 }
    ];

    ctx.fillStyle = '#7c6046'; // Continental granite
    ctx.strokeStyle = '#9a7b5d';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(0, surfaceY);
    ctx.lineTo(collisionCenterX - 140, surfaceY);
    // Mountain profile
    ctx.lineTo(mountainPeaks[0].x, surfaceY - mountainPeaks[0].h);
    ctx.lineTo(mountainPeaks[1].x, surfaceY - mountainPeaks[1].h); // Highest peak (Everest)
    ctx.lineTo(mountainPeaks[2].x, surfaceY - mountainPeaks[2].h);
    ctx.lineTo(mountainPeaks[3].x, surfaceY - mountainPeaks[3].h);
    ctx.lineTo(collisionCenterX + 140, surfaceY - 10);
    ctx.lineTo(width, surfaceY);
    ctx.lineTo(width, height * 0.62);

    // Deep Crustal Root (모호면 하강 - Isostasy)
    ctx.quadraticCurveTo(
      collisionCenterX, height * 0.85,
      0, height * 0.62
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Snow caps on tall peaks
    ctx.fillStyle = '#f8fafc';
    mountainPeaks.forEach(pk => {
      ctx.beginPath();
      ctx.moveTo(pk.x, surfaceY - pk.h);
      ctx.lineTo(pk.x - 14, surfaceY - pk.h + 18);
      ctx.lineTo(pk.x + 14, surfaceY - pk.h + 18);
      ctx.closePath();
      ctx.fill();
    });

    // Fold Strata & Thrust Fault lines (습곡 및 역단층선)
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.45)';
    ctx.lineWidth = 2;
    for (let f = -80; f <= 80; f += 40) {
      ctx.beginPath();
      ctx.moveTo(collisionCenterX + f, surfaceY - 20);
      ctx.quadraticCurveTo(collisionCenterX + f * 0.5, surfaceY + 60, collisionCenterX + f * 1.3, surfaceY + 120);
      ctx.stroke();
    }

    // Both Plates moving toward each other (---> and <---)
    const arrowOffset = (t * 0.8) % 30;
    drawArrow(ctx, width * 0.15 + arrowOffset, surfaceY + 35, width * 0.25 + arrowOffset, surfaceY + 35, '대륙판 1 (→)');
    drawArrow(ctx, width * 0.85 - arrowOffset, surfaceY + 35, width * 0.75 - arrowOffset, surfaceY + 35, '대륙판 2 (←)');

    // Shallow and Intermediate Quakes (역단층 지진)
    if (simState.showEarthquakes) {
      const collisionQuakes = [
        { x: collisionCenterX - 35, y: surfaceY + 20, type: 'shallow' as const },
        { x: collisionCenterX + 25, y: surfaceY + 35, type: 'shallow' as const },
        { x: collisionCenterX - 15, y: surfaceY + 70, type: 'intermediate' as const },
        { x: collisionCenterX + 45, y: surfaceY + 85, type: 'intermediate' as const }
      ];

      collisionQuakes.forEach((cq, idx) => {
        const pulsePhase = (t * 0.14 + idx * 0.25) % 1;
        drawQuakePulse(ctx, cq.x, cq.y, pulsePhase, cq.type);
        if (pulsePhase < 0.03 && Math.random() < 0.15) {
          triggerQuakeSound(cq.type);
        }
      });
    }

    // Notice on No Volcanism
    if (simState.showMagma) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
      ctx.font = '11px Plus Jakarta Sans, sans-serif';
      ctx.fillText('※ 화산 활동 없음: 두꺼운 지각(최대 70km)으로 마그마 상승 차단', collisionCenterX - 145, surfaceY - 85);
    }

    // Labels
    if (simState.showLabels) {
      drawLabelWithLine(ctx, collisionCenterX, surfaceY - mountainPeaks[1].h - 20, collisionCenterX - 25, surfaceY - mountainPeaks[1].h, '거대 습곡 산맥 (히말라야)');
      drawLabelWithLine(ctx, width * 0.18, surfaceY - 15, width * 0.18, surfaceY + 10, '인도판 (대륙 지각)');
      drawLabelWithLine(ctx, width * 0.82, surfaceY - 15, width * 0.82, surfaceY + 10, '유라시아판 (대륙 지각)');
      drawLabelWithLine(ctx, collisionCenterX, height * 0.82, collisionCenterX, height * 0.75, '지각 뿌리 (모호면 깊어짐)');
      drawLabelWithLine(ctx, collisionCenterX - 95, surfaceY + 75, collisionCenterX - 45, surfaceY + 65, '역단층 (Thrust Fault)');
    }
  };

  // ========================================================
  // 4. 보존형 경계: 변환단층 (Transform Fault: 산안드레아스)
  // ========================================================
  const drawTransformBoundary = (
    ctx: CanvasRenderingContext2D,
    rawWidth: number,
    rawHeight: number,
    t: number
  ) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = rawWidth / dpr;
    const height = rawHeight / dpr;

    // 2.5D Isometric block cutaway perspective
    const centerY = height * 0.5;
    const faultX = width * 0.5;

    // Background
    ctx.fillStyle = '#091122';
    ctx.fillRect(0, 0, width, height);

    // Left block (moving North / Upward)
    const leftMotionOffset = -((t * 0.8) % 40);
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.fillRect(width * 0.08, height * 0.18, faultX - width * 0.08, height * 0.65);
    ctx.strokeRect(width * 0.08, height * 0.18, faultX - width * 0.08, height * 0.65);

    // Right block (moving South / Downward)
    const rightMotionOffset = (t * 0.8) % 40;
    ctx.fillStyle = '#334155';
    ctx.fillRect(faultX, height * 0.18, width * 0.84 - faultX, height * 0.65);
    ctx.strokeRect(faultX, height * 0.18, width * 0.84 - faultX, height * 0.65);

    // Active Fault Trace Line (변환단층 마찰면)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(faultX, height * 0.18);
    ctx.lineTo(faultX, height * 0.83);
    ctx.stroke();

    // Offset river / road feature to demonstrate shear displacement
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    // Left side river
    ctx.beginPath();
    ctx.moveTo(width * 0.12, centerY - 40 + leftMotionOffset);
    ctx.lineTo(faultX, centerY - 40 + leftMotionOffset);
    ctx.stroke();
    // Right side displaced river
    ctx.beginPath();
    ctx.moveTo(faultX, centerY + 30 + rightMotionOffset);
    ctx.lineTo(width * 0.8, centerY + 30 + rightMotionOffset);
    ctx.stroke();

    // Plate relative motion arrows
    ctx.fillStyle = '#10b981';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    drawArrow(ctx, faultX - 70, centerY + 60, faultX - 70, centerY - 40, '태평양판 상대 이동 (↑)');
    drawArrow(ctx, faultX + 70, centerY - 40, faultX + 70, centerY + 60, '북미판 상대 이동 (↓)');

    // Shallow Earthquakes along fault trace
    if (simState.showEarthquakes) {
      const faultQuakes = [
        { y: height * 0.32 },
        { y: height * 0.50 },
        { y: height * 0.68 }
      ];
      faultQuakes.forEach((fq, idx) => {
        const pulsePhase = (t * 0.16 + idx * 0.33) % 1;
        drawQuakePulse(ctx, faultX, fq.y, pulsePhase, 'shallow');
        if (pulsePhase < 0.03 && Math.random() < 0.15) {
          triggerQuakeSound('shallow');
        }
      });
    }

    // Labels
    if (simState.showLabels) {
      drawLabelWithLine(ctx, faultX, height * 0.14, faultX, height * 0.18, '변환단층면 (San Andreas Fault)');
      drawLabelWithLine(ctx, width * 0.22, height * 0.24, width * 0.22, height * 0.3, '태평양 판 (북서쪽 이동)');
      drawLabelWithLine(ctx, width * 0.72, height * 0.24, width * 0.72, height * 0.3, '북아메리카 판 (남동쪽 이동)');
      drawLabelWithLine(ctx, faultX + 45, centerY + 30 + rightMotionOffset - 15, faultX + 15, centerY + 30 + rightMotionOffset, '어긋난 단층 하천');
      drawLabelWithLine(ctx, faultX, height * 0.87, faultX, height * 0.83, '판의 생성도 소멸도 없음 (천발 지진만 발생)');
    }
  };

  // ==========================================
  // Helper Drawing Functions
  // ==========================================

  // Arrow drawing
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    label?: string
  ) => {
    const headLen = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();

    if (label) {
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, (fromX + toX) / 2, Math.min(fromY, toY) - 8);
    }
  };

  // Mantle convection arrows loop
  const drawConvectionFlow = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    direction: number, // 1 for clockwise, -1 for counter-clockwise
    t: number
  ) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = -t * 0.8 * direction;

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 55, 35, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };

  const drawSubductionMantleFlow = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    t: number
  ) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = -t * 0.8;

    ctx.beginPath();
    ctx.arc(x, y, 45, angle, angle + Math.PI);
    ctx.stroke();
    ctx.restore();
  };

  // Earthquake shockwave pulse
  const drawQuakePulse = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    phase: number,
    depthType: 'shallow' | 'intermediate' | 'deep'
  ) => {
    const color = depthType === 'shallow' ? '#22c55e' : depthType === 'intermediate' ? '#f97316' : '#a855f7';
    const radius = 4 + phase * 24;
    const alpha = Math.max(0, 1 - phase);

    // Radiating concentric circles
    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Solid hypocenter dot
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // Educational pointer label with callout line
  const drawLabelWithLine = (
    ctx: CanvasRenderingContext2D,
    labelX: number,
    labelY: number,
    targetX: number,
    targetY: number,
    text: string
  ) => {
    ctx.save();
    // Leader line
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(labelX, labelY + 4);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();

    // Target point dot
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(targetX, targetY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Pill label box
    ctx.font = '11px Plus Jakarta Sans, sans-serif';
    const textWidth = ctx.measureText(text).width;
    const boxW = textWidth + 14;
    const boxH = 20;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.9)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    if (typeof (ctx as unknown as { roundRect?: Function }).roundRect === 'function') {
      ctx.roundRect(labelX - boxW / 2, labelY - boxH / 2, boxW, boxH, 4);
    } else {
      ctx.rect(labelX - boxW / 2, labelY - boxH / 2, boxW, boxH);
    }
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#f1f5f9';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, labelX, labelY);
    ctx.restore();
  };

  // Depth ruler on the left edge (0km to 600km)
  const drawDepthRuler = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.save();
    const rulerX = 26;
    const startY = height * 0.22;
    const endY = height * 0.92;

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rulerX, startY);
    ctx.lineTo(rulerX, endY);
    ctx.stroke();

    const marks = [
      { depth: '0 km', y: startY },
      { depth: '70 km (천발)', y: startY + (endY - startY) * 0.25 },
      { depth: '300 km (중발)', y: startY + (endY - startY) * 0.55 },
      { depth: '600 km (심발)', y: endY }
    ];

    ctx.font = '10px font-mono, monospace';
    ctx.fillStyle = 'rgba(203, 213, 225, 0.75)';
    ctx.textAlign = 'left';

    marks.forEach(m => {
      ctx.beginPath();
      ctx.moveTo(rulerX - 4, m.y);
      ctx.lineTo(rulerX + 4, m.y);
      ctx.stroke();
      ctx.fillText(m.depth, rulerX + 8, m.y + 3);
    });
    ctx.restore();
  };

  // Particles manager
  const updateAndDrawParticles = (ctx: CanvasRenderingContext2D) => {
    const list = particlesRef.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;

      const progress = p.life / p.maxLife;
      const alpha = Math.max(0, 1 - progress);

      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (p.life >= p.maxLife) {
        list.splice(i, 1);
      }
    }
  };

  return (
    <div className="relative w-full h-[620px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col">
      {/* Top Header Badge */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3.5 py-1.5 rounded-lg shadow-lg pointer-events-auto flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-bold text-white">{boundary.title}</span>
          <span className="text-xs text-slate-400 hidden sm:inline">· {boundary.summary}</span>
        </div>

        {/* Real-world examples badge */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300 pointer-events-auto">
          <span className="text-slate-400">대표 지역:</span>
          <span className="text-sky-300 font-medium">{boundary.realWorldExamples[0]}</span>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />

      {/* Bottom Cross Section Legend */}
      <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-[11px] text-slate-300">
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg pointer-events-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>천발 지진 (0~70km)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>중발 지진 (70~300km)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span>심발 지진 (&gt;300km)</span>
          </div>
        </div>

        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-lg pointer-events-auto text-slate-400 flex items-center gap-2">
          <span>판 상대 속도:</span>
          <span className="text-sky-400 font-mono font-medium">{simState.plateSpeedCmPerYear} cm/년</span>
          <span>·</span>
          <span>재생: {simState.isPlaying ? '동작 중' : '일시정지'}</span>
        </div>
      </div>
    </div>
  );
};
