"use client";

import { cn } from "@/lib/utils";
import { useRef, useEffect, useCallback } from "react";

interface GlobeProps {
  className?: string;
  size?: number;
  autoRotateSpeed?: number;
}

// Top coding languages mapped to their "origin" cities/tech hubs
const LANG_MARKERS = [
  { lat: 37.78,  lng: -122.42, label: "Python",     color: "#3776AB", glow: "#3776AB" },
  { lat: 35.68,  lng:  139.69, label: "JavaScript", color: "#F7DF1E", glow: "#F7DF1E" },
  { lat: 51.51,  lng:   -0.13, label: "TypeScript", color: "#3178C6", glow: "#3178C6" },
  { lat: 22.31,  lng:  114.17, label: "Go",          color: "#00ACD7", glow: "#00ACD7" },
  { lat: 48.85,  lng:    2.35, label: "Rust",        color: "#DEA584", glow: "#DEA584" },
  { lat: 1.35,   lng:  103.82, label: "Kotlin",      color: "#7F52FF", glow: "#7F52FF" },
  { lat: -33.87, lng:  151.21, label: "Swift",       color: "#F05138", glow: "#F05138" },
  { lat: 55.76,  lng:   37.62, label: "C++",         color: "#00599C", glow: "#00599C" },
  { lat: 28.61,  lng:   77.21, label: "Java",        color: "#ED8B00", glow: "#ED8B00" },
  { lat: -23.55, lng:  -46.63, label: "C#",          color: "#9B4F96", glow: "#9B4F96" },
  { lat: 19.43,  lng:  -99.13, label: "PHP",         color: "#8892BF", glow: "#8892BF" },
  { lat: 41.89,  lng:   12.48, label: "Ruby",        color: "#CC342D", glow: "#CC342D" },
];

const CONNECTIONS: { from: [number, number]; to: [number, number]; color: string }[] = [
  { from: [37.78, -122.42], to: [51.51, -0.13],   color: "#3776AB" },
  { from: [51.51, -0.13],   to: [35.68, 139.69],  color: "#3178C6" },
  { from: [35.68, 139.69],  to: [1.35, 103.82],   color: "#F7DF1E" },
  { from: [37.78, -122.42], to: [-23.55, -46.63], color: "#F05138" },
  { from: [28.61, 77.21],   to: [55.76, 37.62],   color: "#ED8B00" },
  { from: [51.51, -0.13],   to: [48.85, 2.35],    color: "#DEA584" },
  { from: [1.35, 103.82],   to: [-33.87, 151.21], color: "#7F52FF" },
  { from: [22.31, 114.17],  to: [35.68, 139.69],  color: "#00ACD7" },
  { from: [41.89, 12.48],   to: [48.85, 2.35],    color: "#CC342D" },
  { from: [19.43, -99.13],  to: [37.78, -122.42], color: "#8892BF" },
];

function latLngToXYZ(lat: number, lng: number, radius: number): [number, number, number] {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

function rotateY(x: number, y: number, z: number, a: number): [number, number, number] {
  return [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)];
}

function rotateX(x: number, y: number, z: number, a: number): [number, number, number] {
  return [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)];
}

function project(x: number, y: number, z: number, cx: number, cy: number, fov: number): [number, number, number] {
  const scale = fov / (fov + z);
  return [x * scale + cx, y * scale + cy, z];
}

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

export function InteractiveGlobe({ className, size = 500, autoRotateSpeed = 0.003 }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotYRef = useRef(0.4);
  const rotXRef = useRef(0.25);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, startRotY: 0, startRotX: 0 });
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const dotsRef = useRef<[number, number, number][]>([]);

  useEffect(() => {
    const dots: [number, number, number][] = [];
    const n = 1800;
    const gr = (1 + Math.sqrt(5)) / 2;
    for (let i = 0; i < n; i++) {
      const theta = (2 * Math.PI * i) / gr;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
      dots.push([Math.cos(theta) * Math.sin(phi), Math.cos(phi), Math.sin(theta) * Math.sin(phi)]);
    }
    dotsRef.current = dots;
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.40;
    const fov = 700;

    if (!dragRef.current.active) rotYRef.current += autoRotateSpeed;
    timeRef.current += 0.012;
    const time = timeRef.current;

    ctx.clearRect(0, 0, w, h);

    // Outer multi-color glow
    const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.8);
    glowGrad.addColorStop(0, "rgba(232,255,90,0.04)");
    glowGrad.addColorStop(0.4, "rgba(90,255,234,0.03)");
    glowGrad.addColorStop(0.7, "rgba(127,82,255,0.025)");
    glowGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, w, h);

    // Globe circle border
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Latitude grid lines
    for (let lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      let first = true;
      for (let lng = -180; lng <= 180; lng += 5) {
        let [x, y, z] = latLngToXYZ(lat, lng, radius);
        [x, y, z] = rotateX(x, y, z, rotXRef.current);
        [x, y, z] = rotateY(x, y, z, rotYRef.current);
        if (z > 0) { first = true; continue; }
        const [sx, sy] = project(x, y, z, cx, cy, fov);
        first ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
        first = false;
      }
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Longitude grid lines
    for (let lng = -180; lng < 180; lng += 30) {
      ctx.beginPath();
      let first = true;
      for (let lat = -90; lat <= 90; lat += 5) {
        let [x, y, z] = latLngToXYZ(lat, lng, radius);
        [x, y, z] = rotateX(x, y, z, rotXRef.current);
        [x, y, z] = rotateY(x, y, z, rotYRef.current);
        if (z > 0) { first = true; continue; }
        const [sx, sy] = project(x, y, z, cx, cy, fov);
        first ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
        first = false;
      }
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    const ry = rotYRef.current;
    const rx = rotXRef.current;

    // Globe dots
    for (const dot of dotsRef.current) {
      let [x, y, z] = [dot[0] * radius, dot[1] * radius, dot[2] * radius];
      [x, y, z] = rotateX(x, y, z, rx);
      [x, y, z] = rotateY(x, y, z, ry);
      if (z > 0) continue;
      const [sx, sy] = project(x, y, z, cx, cy, fov);
      const depth = Math.max(0.08, 1 - (z + radius) / (2 * radius));
      ctx.beginPath();
      ctx.arc(sx, sy, 0.9 + depth * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,220,255,${(depth * 0.35).toFixed(2)})`;
      ctx.fill();
    }

    // Connections with colored arcs
    for (const conn of CONNECTIONS) {
      let [x1, y1, z1] = latLngToXYZ(conn.from[0], conn.from[1], radius);
      let [x2, y2, z2] = latLngToXYZ(conn.to[0], conn.to[1], radius);
      [x1, y1, z1] = rotateX(x1, y1, z1, rx);
      [x1, y1, z1] = rotateY(x1, y1, z1, ry);
      [x2, y2, z2] = rotateX(x2, y2, z2, rx);
      [x2, y2, z2] = rotateY(x2, y2, z2, ry);
      if (z1 > radius * 0.2 && z2 > radius * 0.2) continue;

      const [sx1, sy1] = project(x1, y1, z1, cx, cy, fov);
      const [sx2, sy2] = project(x2, y2, z2, cx, cy, fov);

      const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2, midZ = (z1 + z2) / 2;
      const midLen = Math.sqrt(midX * midX + midY * midY + midZ * midZ);
      const ah = radius * 1.3;
      const [scx, scy] = project((midX / midLen) * ah, (midY / midLen) * ah, (midZ / midLen) * ah, cx, cy, fov);

      const [r, g, b] = hexToRgb(conn.color);

      // Arc glow
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.quadraticCurveTo(scx, scy, sx2, sy2);
      ctx.strokeStyle = `rgba(${r},${g},${b},0.15)`;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Arc line
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.quadraticCurveTo(scx, scy, sx2, sy2);
      ctx.strokeStyle = `rgba(${r},${g},${b},0.5)`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Traveling dot
      const t = (Math.sin(time * 1.1 + conn.from[0] * 0.08) + 1) / 2;
      const tx = (1-t)*(1-t)*sx1 + 2*(1-t)*t*scx + t*t*sx2;
      const ty = (1-t)*(1-t)*sy1 + 2*(1-t)*t*scy + t*t*sy2;
      ctx.beginPath();
      ctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},0.95)`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = conn.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Language markers
    for (const marker of LANG_MARKERS) {
      let [x, y, z] = latLngToXYZ(marker.lat, marker.lng, radius);
      [x, y, z] = rotateX(x, y, z, rx);
      [x, y, z] = rotateY(x, y, z, ry);
      if (z > radius * 0.15) continue;

      const [sx, sy] = project(x, y, z, cx, cy, fov);
      const [r, g, b] = hexToRgb(marker.color);
      const pulse = Math.sin(time * 2.2 + marker.lat * 0.3) * 0.5 + 0.5;

      // Outer pulse ring
      ctx.beginPath();
      ctx.arc(sx, sy, 6 + pulse * 6, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${(0.1 + pulse * 0.15).toFixed(2)})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Mid ring
      ctx.beginPath();
      ctx.arc(sx, sy, 4 + pulse * 2, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r},${g},${b},${(0.25 + pulse * 0.2).toFixed(2)})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Core dot with glow
      ctx.beginPath();
      ctx.arc(sx, sy, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},1)`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = marker.color;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner highlight
      ctx.beginPath();
      ctx.arc(sx - 0.7, sy - 0.7, 1, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fill();

      // Label with colored pill background
      const label = marker.label;
      ctx.font = "bold 9px 'Space Mono', monospace";
      const tw = ctx.measureText(label).width;
      const lx = sx + 10;
      const ly = sy + 3;

      // Pill bg
      ctx.beginPath();
      ctx.roundRect(lx - 3, ly - 9, tw + 8, 13, 3);
      ctx.fillStyle = `rgba(${r},${g},${b},0.15)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${r},${g},${b},0.4)`;
      ctx.lineWidth = 0.75;
      ctx.stroke();

      // Label text
      ctx.fillStyle = `rgba(${r},${g},${b},0.95)`;
      ctx.fillText(label, lx + 1, ly);
    }

    animRef.current = requestAnimationFrame(draw);
  }, [autoRotateSpeed]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = { active: true, startX: e.clientX, startY: e.clientY, startRotY: rotYRef.current, startRotX: rotXRef.current };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    rotYRef.current = dragRef.current.startRotY + dx * 0.005;
    rotXRef.current = Math.max(-1, Math.min(1, dragRef.current.startRotX + dy * 0.005));
  }, []);

  const onPointerUp = useCallback(() => { dragRef.current.active = false; }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("cursor-grab active:cursor-grabbing", className)}
      style={{ width: size, height: size }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
}
