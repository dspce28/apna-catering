import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, Float } from '@react-three/drei';
import * as THREE from 'three';

/* A lathe-turned brass handi: the hero object. */
function Handi({ scroll }) {
  const group = useRef();
  const profile = useMemo(() => {
    const p = [
      [0.0, -1.05], [0.55, -1.05], [0.62, -1.0], [0.6, -0.95], [0.78, -0.82], [1.12, -0.5],
      [1.28, -0.12], [1.3, 0.12], [1.2, 0.38], [1.0, 0.56], [0.88, 0.66], [0.86, 0.74],
      [0.92, 0.82], [1.02, 0.88], [1.06, 0.92], [1.02, 0.95], [0.9, 0.9], [0.8, 0.8],
    ];
    return p.map(([x, y]) => new THREE.Vector2(x, y));
  }, []);
  const brass = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#c8913a', metalness: 1, roughness: 0.22, side: THREE.DoubleSide, envMapIntensity: 1.4 }),
    []
  );
  const bands = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e7c27a', metalness: 1, roughness: 0.12 }), []);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const s = scroll.current;
    g.rotation.y += dt * 0.25;
    const tx = state.pointer.y * 0.18 + 0.32 + s * 0.6;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, tx, 3, dt);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, -state.pointer.x * 0.12, 3, dt);
    g.position.y = THREE.MathUtils.damp(g.position.y, -0.15 - s * 1.4, 4, dt);
    const sc = 1 + s * 0.35;
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, sc, 4, dt));
  });

  return (
    <group ref={group} rotation={[0.32, 0, 0]}>
      <mesh material={brass} castShadow>
        <latheGeometry args={[profile, 96]} />
      </mesh>
      {/* engraved rings */}
      {[-0.5, 0.12, 0.6].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} material={bands}>
          <torusGeometry args={[i === 1 ? 1.305 : i === 0 ? 1.13 : 0.97, 0.018, 12, 120]} />
        </mesh>
      ))}
      {/* curry surface */}
      <mesh position={[0, 0.74, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.86, 64]} />
        <meshStandardMaterial color="#8c2a0a" roughness={0.55} metalness={0} emissive="#3a0d02" envMapIntensity={0.35} />
      </mesh>
      {/* cream swirl */}
      <mesh position={[0, 0.755, 0]} rotation={[-Math.PI / 2, 0, 0.6]}>
        <torusGeometry args={[0.38, 0.035, 10, 80, Math.PI * 1.5]} />
        <meshStandardMaterial color="#f3e7d0" roughness={0.5} />
      </mesh>
      {/* mint leaves */}
      {[[0.18, 0.1, 0.3], [-0.12, 0.2, 2.1], [0.05, -0.22, 4]].map(([x, z, r], i) => (
        <mesh key={i} position={[x, 0.79, z]} rotation={[-Math.PI / 2 + 0.25, 0, r]} scale={[1, 0.55, 1]}>
          <circleGeometry args={[0.13, 20]} />
          <meshStandardMaterial color="#3f7a2c" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/* Star anise shape */
function useStarGeometry() {
  return useMemo(() => {
    const s = new THREE.Shape();
    const n = 8;
    for (let i = 0; i <= n * 2; i++) {
      const a = (i / (n * 2)) * Math.PI * 2;
      const r = i % 2 === 0 ? 0.17 : 0.055;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      i === 0 ? s.moveTo(x, y) : s.lineTo(x, y);
    }
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.025, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2 });
    g.center();
    return g;
  }, []);
}

/* Tapered, slightly curved chilli built from a lathe profile */
function useChilliGeometry() {
  return useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const r = 0.075 * Math.pow(Math.sin(Math.min(1, t * 1.15) * Math.PI * 0.5 + 0.0001), 0.6) * (1 - Math.pow(t, 2.2));
      pts.push(new THREE.Vector2(Math.max(r, 0.002), t * 0.62));
    }
    const g = new THREE.LatheGeometry(pts, 18);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); p.setX(i, p.getX(i) + y * y * 0.35); }
    g.computeVertexNormals();
    g.center();
    return g;
  }, []);
}

/* Instanced orbiting spices: chillies, cardamom, star anise, peppercorns */
function Spices({ scroll, count = 70 }) {
  const star = useStarGeometry();
  const chilli = useChilliGeometry();
  const kinds = useMemo(() => [
    { geo: chilli, mat: new THREE.MeshPhysicalMaterial({ color: '#b51a0b', roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.15, emissive: '#2a0500' }), n: Math.round(count * 0.3) },
    { geo: new THREE.SphereGeometry(0.1, 16, 12).scale(1, 1.6, 1), mat: new THREE.MeshStandardMaterial({ color: '#7c9a3c', roughness: 0.55 }), n: Math.round(count * 0.25) },
    { geo: star, mat: new THREE.MeshStandardMaterial({ color: '#6b3a1c', roughness: 0.6 }), n: Math.round(count * 0.2) },
    { geo: new THREE.IcosahedronGeometry(0.045, 1), mat: new THREE.MeshStandardMaterial({ color: '#1d1410', roughness: 0.5 }), n: Math.round(count * 0.25) },
  ], [count, star, chilli]);

  const seeds = useMemo(() => kinds.map(k => Array.from({ length: k.n }, () => ({
    r: 2 + Math.random() * 2.6,
    a: Math.random() * Math.PI * 2,
    y: (Math.random() - 0.5) * 3.2,
    sp: (0.08 + Math.random() * 0.18) * (Math.random() < 0.5 ? 1 : -1) * 0.6,
    rot: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
    rs: 0.2 + Math.random() * 0.8,
    s: 0.6 + Math.random() * 0.6,
    bob: Math.random() * 6,
  }))), [kinds]);

  const refs = useRef([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const spread = 1 + scroll.current * 1.6;
    kinds.forEach((k, ki) => {
      const mesh = refs.current[ki];
      if (!mesh) return;
      seeds[ki].forEach((p, i) => {
        const a = p.a + t * p.sp;
        dummy.position.set(Math.cos(a) * p.r * spread, p.y + Math.sin(t * 0.6 + p.bob) * 0.18, Math.sin(a) * p.r * spread * 0.6 - 0.6);
        dummy.rotation.set(p.rot.x + t * p.rs, p.rot.y + t * p.rs * 0.7, p.rot.z);
        dummy.scale.setScalar(p.s);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  return kinds.map((k, i) => (
    <instancedMesh key={i} ref={el => (refs.current[i] = el)} args={[k.geo, k.mat, k.n]} frustumCulled={false} />
  ));
}

/* Rising gold embers / saffron dust */
function Embers({ count = 900 }) {
  const ref = useRef();
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
      speeds[i] = 0.08 + Math.random() * 0.35;
    }
    return { positions, speeds };
  }, [count]);
  const sprite = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,228,170,1)');
    grd.addColorStop(0.3, 'rgba(230,180,90,.6)');
    grd.addColorStop(1, 'rgba(230,180,90,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }, []);
  useFrame((state, dt) => {
    const p = ref.current.geometry.attributes.position;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      let y = p.array[i * 3 + 1] + speeds[i] * dt;
      if (y > 4.5) y = -4.5;
      p.array[i * 3 + 1] = y;
      p.array[i * 3] += Math.sin(t * 0.5 + i) * 0.0015;
    }
    p.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial map={sprite} size={0.07} sizeAttenuation transparent depthWrite={false} blending={THREE.AdditiveBlending} color="#ffd9a0" />
    </points>
  );
}

function Rig() {
  const { camera } = useThree();
  useFrame((state, dt) => {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, state.pointer.x * 0.6, 2, dt);
    // keep current distance; only parallax x/y
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.2 + state.pointer.y * 0.35, 2, dt);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene({ scroll, active = true, small = false }) {
  return (
    <Canvas
      className="hero-canvas"
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0.2, small ? 11 : 7], fov: small ? 40 : 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.25} />
      <spotLight position={[4, 6, 5]} angle={0.5} penumbra={1} intensity={60} color="#ffd59a" />
      <pointLight position={[-4, -1, 3]} intensity={12} color="#d9822b" />
      <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.6}>
        <group scale={small ? 0.78 : 1} position={[0, small ? 0.25 : 0, 0]}>
          <Handi scroll={scroll} />
        </group>
      </Float>
      <Spices scroll={scroll} count={small ? 40 : 70} />
      <Embers count={small ? 400 : 900} />
      <Rig />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} color="#fff1d6" position={[0, 5, -6]} scale={[12, 4, 1]} />
        <Lightformer form="rect" intensity={2} color="#ffb347" position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#ffe0a8" position={[6, -1, 2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={2} color="#ffffff" position={[0, 2, 6]} scale={3} />
      </Environment>
    </Canvas>
  );
}
