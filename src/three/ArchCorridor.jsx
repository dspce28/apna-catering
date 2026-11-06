import { useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { archWallShape, archRingShape, cuspedArchPoints } from './archShape.js';

const ARCH_W = 4.2;
const ARCH_H = 6.6;
const GAP = 7;
const COUNT = 4;
const OPTS = { spring: 0.56, lobes: 4, depth: 0.2 };

/* Jali (lattice) texture painted on a canvas: eight-point stars in fine gold line. */
function useJaliTexture(base) {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const g = c.getContext('2d');
    g.fillStyle = base;
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(214,170,92,0.22)';
    g.lineWidth = 2;
    const star = (cx, cy, r) => {
      g.beginPath();
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const rr = i % 2 ? r * 0.55 : r;
        g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      g.closePath();
      g.stroke();
    };
    star(128, 128, 60);
    [[0, 0], [256, 0], [0, 256], [256, 256]].forEach(([x, y]) => star(x, y, 60));
    g.strokeStyle = 'rgba(214,170,92,0.12)';
    g.beginPath(); g.arc(128, 128, 22, 0, Math.PI * 2); g.stroke();
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(0.42, 0.42);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [base]);
}

/* A drooping swag of marigold blossoms strung across the arch. */
function Garland({ y, span, sag = 0.9, count = 34, phase = 0 }) {
  const ref = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.13, 1), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ roughness: 0.9, flatShading: true, vertexColors: false }), []);
  useLayoutEffect(() => {
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) ref.current.setColorAt(i, c.set(i % 5 === 2 ? '#f6d04d' : i % 2 ? '#ef8a1c' : '#f39b25'));
    ref.current.instanceColor.needsUpdate = true;
    mat.needsUpdate = true;
  }, [count, mat]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const sway = Math.sin(t * 0.9 + phase) * 0.06;
    for (let i = 0; i < count; i++) {
      const u = i / (count - 1);
      const x = (u - 0.5) * span;
      const yy = y - sag * (1 - Math.pow(2 * u - 1, 2)) + sway * Math.sin(u * Math.PI);
      dummy.position.set(x, yy, 0.55 + sway * Math.sin(u * Math.PI) * 2);
      dummy.rotation.set(i, i * 0.7, 0);
      dummy.scale.setScalar(0.9 + ((i * 37) % 10) / 40);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[geo, mat, count]} />
  );
}

/* Hanging strands of marigolds on each side of the opening */
function Strand({ x, top, len = 3.2, phase = 0 }) {
  const ref = useRef();
  const n = Math.round(len / 0.24);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.11, 1), []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f08a1d', roughness: 0.9, flatShading: true }), []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < n; i++) {
      const k = i / n;
      dummy.position.set(x + Math.sin(t * 1.1 + phase) * 0.05 * k * k, top - i * 0.24, 0.55);
      dummy.rotation.set(i, i, 0);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return <instancedMesh ref={ref} args={[geo, mat, n]} />;
}

function Arch({ z, index, jali, gold }) {
  const wallGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(archWallShape(ARCH_W, ARCH_H, OPTS), { depth: 0.9, bevelEnabled: false, curveSegments: 6 });
    return g;
  }, []);
  const trimGeo = useMemo(() => new THREE.ExtrudeGeometry(archRingShape(ARCH_W, ARCH_H, 0.16, OPTS), { depth: 0.12, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 }), []);
  const trim2Geo = useMemo(() => new THREE.ExtrudeGeometry(archRingShape(ARCH_W + 0.9, ARCH_H + 0.55, 0.05, OPTS), { depth: 0.06, bevelEnabled: false }), []);
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ map: jali, roughness: 0.85, metalness: 0.05 }), [jali]);
  return (
    <group position={[0, 0, z]}>
      <mesh geometry={wallGeo} material={wallMat} position={[0, 0, -0.9]} />
      <mesh geometry={trimGeo} material={gold} position={[0, 0, 0]} />
      <mesh geometry={trim2Geo} material={gold} position={[0, 0, 0]} />
      {/* finial above the apex */}
      <group position={[0, ARCH_H / 2 + 0.95, 0.08]}>
        <mesh material={gold}><sphereGeometry args={[0.16, 24, 16]} /></mesh>
        <mesh material={gold} position={[0, 0.26, 0]}><coneGeometry args={[0.07, 0.32, 16]} /></mesh>
        <mesh material={gold} position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.2, 0.025, 8, 32]} /></mesh>
      </group>
      {/* rosettes in the spandrels */}
      {[-1, 1].map((sx) => (
        <mesh key={sx} material={gold} position={[sx * (ARCH_W / 2 + 0.95), ARCH_H / 2 - 0.6, 0.05]}>
          <torusGeometry args={[0.32, 0.03, 8, 48]} />
        </mesh>
      ))}
      {index < 2 && (
        <>
          <Garland y={ARCH_H / 2 + 0.25} span={ARCH_W + 0.9} sag={1.0} phase={index} />
          <Strand x={-ARCH_W / 2 - 0.2} top={ARCH_H * 0.06 + 0.9} phase={index} />
          <Strand x={ARCH_W / 2 + 0.2} top={ARCH_H * 0.06 + 0.9} phase={index + 1} />
        </>
      )}
      {/* diyas at the foot of each arch: emissive flames, no extra lights */}
      {[-1, 1].map((sx) => (
        <group key={sx} position={[sx * (ARCH_W / 2 - 0.35), -ARCH_H / 2 + 0.12, 0.7]}>
          <mesh material={gold}><cylinderGeometry args={[0.16, 0.09, 0.12, 20]} /></mesh>
          <mesh position={[0, 0.16, 0]} scale={[1, 1.8, 1]}><sphereGeometry args={[0.06, 12, 10]} /><meshBasicMaterial color="#ffd27a" toneMapped={false} /></mesh>
        </group>
      ))}
    </group>
  );
}

/* Soft drifting petals: a few dozen, never a swarm. */
function Petals({ count = 36, speed }) {
  const ref = useRef();
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.12);
    s.bezierCurveTo(0.11, -0.05, 0.1, 0.1, 0, 0.14);
    s.bezierCurveTo(-0.1, 0.1, -0.11, -0.05, 0, -0.12);
    return new THREE.ShapeGeometry(s, 8);
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.6 }), []);
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => ({
    x: (Math.random() - 0.5) * 9,
    y: Math.random() * 10 - 5,
    z: 6 - Math.random() * (GAP * COUNT + 6),
    s: 0.25 + Math.random() * 0.35,
    r: Math.random() * 6,
    w: 0.6 + Math.random(),
    c: i % 3 === 0 ? '#c2263c' : i % 3 === 1 ? '#f39b25' : '#f6c64d',
  })), [count]);
  useLayoutEffect(() => {
    const c = new THREE.Color();
    seeds.forEach((p, i) => ref.current.setColorAt(i, c.set(p.c)));
    ref.current.instanceColor.needsUpdate = true;
    mat.needsUpdate = true;
  }, [seeds, mat]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const wind = 1 + Math.min(4, Math.abs(speed.current) * 0.02);
    seeds.forEach((p, i) => {
      p.y -= dt * p.s * wind;
      if (p.y < -5) p.y = 5;
      dummy.position.set(p.x + Math.sin(t * p.w + p.r) * 0.4, p.y, p.z);
      dummy.rotation.set(t * p.w + p.r, t * 0.6 * p.w, Math.sin(t + p.r));
      dummy.scale.setScalar(1.4);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={ref} args={[geo, mat, count]} frustumCulled={false} />
  );
}

/* The view waiting at the end of the corridor. */
function Destination({ z, src }) {
  const tex = useTexture(src);
  tex.colorSpace = THREE.SRGBColorSpace;
  const aspect = tex.image ? tex.image.width / tex.image.height : 1.6;
  const h = 9;
  return (
    <mesh position={[0, 0, z]}>
      <planeGeometry args={[h * aspect, h]} />
      <meshBasicMaterial map={tex} toneMapped={false} fog={false} />
    </mesh>
  );
}

/* One warm light that travels with the camera, a few metres ahead. */
function CorridorLight() {
  const ref = useRef();
  useFrame(({ camera }) => { if (ref.current) ref.current.position.set(0, -1.2, camera.position.z - 5); });
  return <pointLight ref={ref} intensity={18} distance={14} decay={1.6} color="#ffb04a" />;
}

function CameraRig({ progress, startZ, endZ }) {
  const { camera, pointer } = useThree();
  useFrame((_, dt) => {
    const p = progress.current;
    const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; // easeInOutCubic
    const z = THREE.MathUtils.lerp(startZ, endZ, e);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, z, 6, dt);
    const look = 1 - Math.min(1, p * 3);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.5 * look, 2.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.2 + pointer.y * 0.3 * look, 2.5, dt);
    camera.lookAt(camera.position.x * 0.3, camera.position.y * 0.3, camera.position.z - 10);
  });
  return null;
}

export default function ArchCorridor({ progress, speed, active = true, small = false, destination = '/img/hero-wide.webp' }) {
  const jali = useJaliTexture('#4a1220');
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d4a24c', metalness: 1, roughness: 0.28, envMapIntensity: 1.2 }), []);
  const lastZ = -GAP * (COUNT - 1);
  const startZ = small ? 16 : 13;
  return (
    <Canvas
      className="arch-canvas"
      dpr={[1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0.2, startZ], fov: small ? 52 : 42, near: 0.1, far: 80 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#14060a']} />
      <fog attach="fog" args={['#2a0b12', 12, 40]} />
      <ambientLight intensity={0.35} color="#ffd9b0" />
      <directionalLight position={[3, 6, 10]} intensity={1.1} color="#ffe2b8" />
      <CorridorLight />
      {Array.from({ length: COUNT }, (_, i) => (
        <Arch key={i} index={i} z={-i * GAP} jali={jali} gold={gold} />
      ))}
      <Destination z={lastZ - 10} src={destination} />
      <Petals speed={speed} count={small ? 22 : 36} />
      <CameraRig progress={progress} startZ={startZ} endZ={lastZ - 1.2} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.5} color="#fff0d6" position={[0, 6, 6]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.5} color="#ffb04a" position={[-6, 0, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffd38a" position={[6, 0, 2]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
      </Environment>
    </Canvas>
  );
}

export { cuspedArchPoints };
