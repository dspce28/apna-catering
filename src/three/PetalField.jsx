import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/*
 * A carpet of rose and marigold petals covering the screen.
 * The cursor (or a finger) is a breath of wind that scatters them;
 * scrolling sends a gust that clears the lot.
 * World units are CSS pixels (orthographic camera, zoom 1).
 */

const PALETTE = ['#b3122e', '#c81d3a', '#d9334f', '#8f0d24', '#e2475f', '#f29b1d', '#f5b13a', '#f7d9de', '#fbeef0'];

function usePetalTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 160;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(64, 150, 6, 64, 70, 110);
    grd.addColorStop(0, 'rgb(150,150,150)');
    grd.addColorStop(0.35, 'rgb(225,225,225)');
    grd.addColorStop(1, 'rgb(255,255,255)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 160);
    // veins
    g.strokeStyle = 'rgba(120,120,120,.18)';
    g.lineWidth = 1.2;
    for (let i = -3; i <= 3; i++) {
      g.beginPath();
      g.moveTo(64, 158);
      g.quadraticCurveTo(64 + i * 10, 90, 64 + i * 18, 10);
      g.stroke();
    }
    // soft edge highlight
    g.strokeStyle = 'rgba(255,255,255,.5)';
    g.lineWidth = 4;
    g.beginPath(); g.ellipse(64, 78, 54, 72, 0, 0, Math.PI * 2); g.stroke();
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
}

function usePetalGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.5);
    s.bezierCurveTo(0.42, -0.3, 0.55, 0.25, 0.18, 0.5);
    s.quadraticCurveTo(0, 0.42, -0.18, 0.5);
    s.bezierCurveTo(-0.55, 0.25, -0.42, -0.3, 0, -0.5);
    const g = new THREE.ShapeGeometry(s, 10);
    // cup the petal: bend edges towards the viewer
    const p = g.attributes.position;
    const uv = g.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      p.setZ(i, x * x * 0.55 + (y + 0.5) * 0.08);
      uv.setXY(i, x + 0.5, y + 0.5);
    }
    g.computeVertexNormals();
    return g;
  }, []);
}

function Petals({ count, gust, pointer, onCleared }) {
  const ref = useRef();
  const { size } = useThree();
  const tex = usePetalTexture();
  const geo = usePetalGeometry();
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.55, metalness: 0, transparent: false }), [tex]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const cleared = useRef(false);

  const petals = useMemo(() => {
    const w = size.width, h = size.height;
    const arr = [];
    for (let i = 0; i < count; i++) {
      const s = 26 + Math.random() * 26;
      arr.push({
        x: (Math.random() - 0.5) * (w + 60), y: (Math.random() - 0.5) * (h + 60), z: Math.random() * 40,
        vx: 0, vy: 0, vz: 0,
        rx: (Math.random() - 0.5) * 0.9, ry: (Math.random() - 0.5) * 0.9, rz: Math.random() * Math.PI * 2,
        sx: 0, sy: 0, sz: 0,
        s, free: false, gone: false, seed: Math.random() * 100,
      });
    }
    return arr;
  }, [count, size.width, size.height]);

  useLayoutEffect(() => {
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      c.set(PALETTE[(Math.random() * PALETTE.length) | 0]);
      c.offsetHSL(0, 0, (Math.random() - 0.5) * 0.06);
      ref.current.setColorAt(i, c);
    }
    ref.current.instanceColor.needsUpdate = true;
    mat.needsUpdate = true;
  }, [count, mat]);

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 30);
    const t = state.clock.elapsedTime;
    const w = size.width, h = size.height;
    const P = pointer.current;
    const px = P.x - w / 2, py = h / 2 - P.y;
    const speed = Math.min(60, Math.hypot(P.vx, P.vy));
    const radius = 70 + speed * 2.2;
    const G = gust.current;
    let left = 0;

    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      if (p.gone) continue;
      left++;

      // the cursor's breath
      if (P.active) {
        const dx = p.x - px, dy = p.y - py;
        const d = Math.hypot(dx, dy);
        if (d < radius) {
          const f = (1 - d / radius) * (6 + speed * 0.9);
          p.vx += (dx / (d + 1)) * f * 60 + P.vx * 4;
          p.vy += (dy / (d + 1)) * f * 60 - P.vy * 4;
          p.vz += f * 30;
          p.sx += (Math.random() - 0.5) * f; p.sy += (Math.random() - 0.5) * f; p.sz += (Math.random() - 0.5) * f * 2;
          p.free = true;
        }
      }
      // the scroll gust: sweeps from the bottom-left, stronger as you scroll
      if (G > 0.02) {
        const front = -w / 2 - 200 + G * (w + h) * 1.6;
        if (p.x + (p.y + h / 2) * 0.6 < front) {
          p.vx += (900 + p.seed * 6) * dt * 8 * G;
          p.vy += (500 + p.seed * 3) * dt * 8 * G;
          p.vz += 200 * dt;
          p.sz += (Math.random() - 0.3) * 0.6;
          p.sx += (Math.random() - 0.5) * 0.4;
          p.free = true;
        }
      }

      if (p.free) {
        p.vy -= 260 * dt; // gravity
        p.vx += Math.sin(t * 2 + p.seed) * 40 * dt; // flutter
        const drag = Math.pow(0.12, dt);
        p.vx *= drag; p.vy *= drag; p.vz *= drag;
        p.sx *= Math.pow(0.4, dt); p.sy *= Math.pow(0.4, dt); p.sz *= Math.pow(0.4, dt);
        p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
        p.rx += p.sx * dt * 6; p.ry += p.sy * dt * 6; p.rz += p.sz * dt * 6;
        if (Math.abs(p.x) > w / 2 + 120 || p.y < -h / 2 - 120 || p.y > h / 2 + 160) p.gone = true;
      }

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rx, p.ry, p.rz);
      dummy.scale.set(p.s, p.s * 1.15, p.s);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    // hide gone petals by collapsing them
    for (let i = 0; i < petals.length; i++) {
      if (!petals[i].gone || petals[i].hidden) continue;
      petals[i].hidden = true;
      dummy.scale.set(0, 0, 0); dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    P.vx *= 0.8; P.vy *= 0.8;

    const frac = 1 - left / petals.length;
    if (!cleared.current && frac > 0.35) { cleared.current = true; onCleared?.(); }
  });

  return <instancedMesh ref={ref} args={[geo, mat, count]} frustumCulled={false} />;
}

/* Once the page is ready, a soft spiral breeze opens a clearing in the middle,
   unless the visitor has already started brushing petals away themselves. */
function Breeze({ pointer, on }) {
  const { size } = useThree();
  const start = useRef(null);
  useFrame((state) => {
    const P = pointer.current;
    if (!on || P.touched) { if (P.auto) { P.auto = false; P.active = false; } return; }
    const t = state.clock.elapsedTime;
    if (start.current === null) start.current = t + 0.6;
    const k = (t - start.current) / 2.2;
    if (k < 0) return;
    if (k > 1) { if (P.auto) { P.auto = false; P.active = false; } return; }
    const a = k * Math.PI * 5;
    const r = 30 + k * Math.min(size.width, size.height) * 0.36;
    const x = size.width / 2 + Math.cos(a) * r * 1.25, y = size.height / 2 + Math.sin(a) * r * 0.7;
    if (P.auto) { P.vx = (x - P.x) * 0.35; P.vy = (y - P.y) * 0.35; }
    P.x = x; P.y = y; P.active = true; P.auto = true;
  });
  return null;
}

export default function PetalField({ gust, count = 1200, onCleared, active = true, breeze = false }) {
  const pointer = useRef({ x: -9999, y: -9999, vx: 0, vy: 0, active: false, touched: false, auto: false });
  useEffect(() => {
    const P = pointer.current;
    const move = (x, y) => {
      if (P.auto) { P.auto = false; P.active = false; }
      P.touched = true;
      if (P.active) { P.vx = x - P.x; P.vy = y - P.y; }
      P.x = x; P.y = y; P.active = true;
    };
    const pm = (e) => move(e.clientX, e.clientY);
    const tm = (e) => { const t = e.touches[0]; if (t) move(t.clientX, t.clientY); };
    const end = () => { P.active = false; };
    addEventListener('pointermove', pm, { passive: true });
    addEventListener('touchmove', tm, { passive: true });
    addEventListener('touchstart', tm, { passive: true });
    addEventListener('touchend', end);
    document.addEventListener('pointerleave', end);
    return () => {
      removeEventListener('pointermove', pm); removeEventListener('touchmove', tm); removeEventListener('touchstart', tm);
      removeEventListener('touchend', end); document.removeEventListener('pointerleave', end);
    };
  }, []);

  return (
    <Canvas
      className="petal-canvas"
      orthographic
      dpr={[1, 2]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 500], zoom: 1, near: 0.1, far: 2000 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[-300, 500, 600]} intensity={1.6} color="#fff4e6" />
      <directionalLight position={[400, -300, 300]} intensity={0.35} color="#ffd2c2" />
      <Petals count={count} gust={gust} pointer={pointer} onCleared={onCleared} />
      <Breeze pointer={pointer} on={breeze} />
    </Canvas>
  );
}
