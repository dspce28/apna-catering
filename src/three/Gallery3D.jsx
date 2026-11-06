import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/* A plane bent around a cylinder so the ring reads as one continuous curved wall. */
function bentPlane(w, h, radius) {
  const g = new THREE.PlaneGeometry(w, h, 32, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const a = x / radius;
    p.setX(i, Math.sin(a) * radius);
    p.setZ(i, Math.cos(a) * radius - radius);
  }
  g.computeVertexNormals();
  return g;
}

const vert = /* glsl */ `
  varying vec2 vUv;
  uniform float uBend;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.y += sin(uv.x * 3.14159) * uBend;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const frag = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform float uHover;
  uniform float uImgAspect;
  uniform float uPlaneAspect;
  void main() {
    vec2 uv = vUv;
    // object-fit: cover
    float r = uPlaneAspect / uImgAspect;
    if (r < 1.0) { uv.x = uv.x * r + (1.0 - r) * 0.5; }
    else { uv.y = uv.y / r + (1.0 - 1.0 / r) * 0.5; }
    uv = (uv - 0.5) * (1.0 - uHover * 0.08) + 0.5;
    vec4 c = texture2D(uTex, uv);
    float g = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    vec3 warm = vec3(g) * vec3(1.05, 0.95, 0.82);
    vec3 col = mix(warm * 0.72, c.rgb, 0.35 + uHover * 0.65);
    // edge vignette
    float v = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);
    gl_FragColor = vec4(col * (0.75 + 0.25 * v), 1.0);
    #include <colorspace_fragment>
  }
`;

function Panel({ url, index, total, radius, geo, onOpen }) {
  const tex = useTexture(url);
  const mat = useRef();
  const [hover, setHover] = useState(false);
  const uniforms = useMemo(() => ({
    uTex: { value: tex },
    uHover: { value: 0 },
    uBend: { value: 0 },
    uImgAspect: { value: tex.image ? tex.image.width / tex.image.height : 1 },
    uPlaneAspect: { value: 1.6 / 2.1 },
  }), [tex]);
  tex.colorSpace = THREE.SRGBColorSpace;
  const angle = (index / total) * Math.PI * 2;
  useFrame((_, dt) => {
    if (!mat.current) return;
    const u = mat.current.uniforms;
    u.uHover.value = THREE.MathUtils.damp(u.uHover.value, hover ? 1 : 0, 6, dt);
  });
  return (
    <mesh
      geometry={geo}
      position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
      rotation={[0, angle, 0]}
      onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.classList.add('cursor-view'); }}
      onPointerOut={() => { setHover(false); document.body.classList.remove('cursor-view'); }}
      onClick={(e) => { if (e.delta < 6) onOpen(url); }}
    >
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vert} fragmentShader={frag} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Ring({ images, onOpen, velocity, drag }) {
  const group = useRef();
  const radius = 4.2;
  const geo = useMemo(() => bentPlane(1.6 * 1.35, 2.1 * 1.35, radius), []);

  useFrame((state, dt) => {
    const d = drag.current;
    d.v *= 0.94;
    const extra = velocity.current * 0.0009;
    group.current.rotation.y += dt * 0.12 + d.v + extra;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, state.pointer.y * 0.06, 2, dt);
    // bend shader on scroll speed
    group.current.children.forEach(m => {
      if (m.material?.uniforms) m.material.uniforms.uBend.value = THREE.MathUtils.clamp(velocity.current * 0.004, -0.25, 0.25);
    });
  });

  return (
    <group ref={group}>
      {images.map((url, i) => (
        <Panel key={url + i} url={url} index={i} total={images.length} radius={radius} geo={geo} onOpen={onOpen} />
      ))}
    </group>
  );
}

export default function Gallery3D({ images, onOpen, velocity, active }) {
  const drag = useRef({ down: false, x: 0, v: 0 });
  const down = (e) => { drag.current.down = true; drag.current.x = e.clientX; };
  const move = (e) => {
    const d = drag.current;
    if (!d.down) return;
    d.v = (e.clientX - d.x) * 0.0012;
    d.x = e.clientX;
  };
  const up = () => { drag.current.down = false; };
  return (
    <div className="gallery-drag" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onPointerCancel={up}>
    <Canvas
      className="gallery-canvas"
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 9.6], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Ring images={images} onOpen={onOpen} velocity={velocity} drag={drag} />
    </Canvas>
    </div>
  );
}
