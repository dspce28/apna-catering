import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/*
 * Full-viewport WebGL slideshow of real photographs.
 * Slides change with a liquid, noise-edged wipe; the cursor bends the
 * image slightly like looking through glass. No fake 3D objects.
 */
const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const frag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uA;
  uniform sampler2D uB;
  uniform vec2 uARes;
  uniform vec2 uBRes;
  uniform vec2 uAFocus;
  uniform vec2 uBFocus;
  uniform vec2 uRes;
  uniform float uMix;
  uniform float uTime;
  uniform float uZoom;
  uniform vec2 uMouse;
  uniform float uHover;

  vec2 cover(vec2 uv, vec2 img, vec2 focus) {
    float rs = uRes.x / uRes.y, ri = img.x / img.y;
    vec2 s = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs);
    return (uv - 0.5) * s + 0.5 + (focus - 0.5) * (1.0 - s);
  }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; } return v; }

  void main() {
    vec2 uv = vUv;
    // gentle lens around the cursor
    vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
    vec2 d = (uv - uMouse) * aspect;
    float lens = exp(-dot(d, d) * 10.0) * uHover;
    uv -= d / aspect * lens * 0.045;
    uv = (uv - 0.5) / uZoom + 0.5;

    float n = fbm(vUv * 3.2 + uTime * 0.04);
    float edge = uMix * 1.5 - 0.25;
    float m = smoothstep(edge - 0.18, edge + 0.18, n * 0.7 + (1.0 - vUv.y) * 0.3);
    float t = 1.0 - m;

    vec2 dir = vec2(0.0, 1.0) * (n - 0.5);
    vec4 a = texture2D(uA, cover(uv + dir * t * 0.08, uARes, uAFocus));
    vec4 b = texture2D(uB, cover(uv - dir * (1.0 - t) * 0.08, uBRes, uBFocus));
    vec3 col = mix(a.rgb, b.rgb, t);

    // a whisper of champagne in the highlights
    col += vec3(0.04, 0.025, 0.0) * smoothstep(0.6, 1.0, dot(col, vec3(0.333)));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function Slides({ urls, focus = [], index, onReady, zoom }) {
  const { size, gl } = useThree();
  const mat = useRef();
  const state = useRef({ from: 0, to: 0, mix: 1, hover: 0, mouse: new THREE.Vector2(0.5, 0.5) });

  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    let loaded = 0;
    return urls.map((u) => {
      const t = loader.load(u, () => { loaded += 1; if (loaded === 1) onReady?.(); });
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.anisotropy = gl.capabilities.getMaxAnisotropy();
      return t;
    });
  }, [urls, gl, onReady]);

  const uniforms = useMemo(() => ({
    uA: { value: textures[0] }, uB: { value: textures[0] },
    uARes: { value: new THREE.Vector2(1, 1) }, uBRes: { value: new THREE.Vector2(1, 1) },
    uAFocus: { value: new THREE.Vector2(0.5, 0.5) }, uBFocus: { value: new THREE.Vector2(0.5, 0.5) },
    uRes: { value: new THREE.Vector2(1, 1) }, uMix: { value: 1 }, uTime: { value: 0 },
    uZoom: { value: 1 }, uMouse: { value: new THREE.Vector2(0.5, 0.5) }, uHover: { value: 0 },
  }), [textures]);

  useEffect(() => {
    const s = state.current;
    if (index === s.to) return;
    s.from = s.to; s.to = index; s.mix = 0;
  }, [index]);

  useEffect(() => {
    const move = (e) => {
      state.current.mouse.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight);
      state.current.hover = 1;
    };
    const leave = () => { state.current.hover = 0; };
    addEventListener('pointermove', move);
    document.addEventListener('pointerleave', leave);
    return () => { removeEventListener('pointermove', move); document.removeEventListener('pointerleave', leave); };
  }, []);

  useFrame((_, dt) => {
    const s = state.current, u = uniforms;
    s.mix = Math.min(1, s.mix + dt / 1.6);
    const res = (t) => (t.image ? [t.image.width, t.image.height] : [1, 1]);
    u.uA.value = textures[s.from]; u.uB.value = textures[s.to];
    u.uARes.value.set(...res(textures[s.from])); u.uBRes.value.set(...res(textures[s.to]));
    const f = (i) => focus[i] || [0.5, 0.5];
    u.uAFocus.value.set(...f(s.from)); u.uBFocus.value.set(...f(s.to));
    u.uMix.value = 1 - Math.pow(1 - s.mix, 3);
    u.uRes.value.set(size.width, size.height);
    u.uTime.value += dt;
    u.uZoom.value = THREE.MathUtils.damp(u.uZoom.value, zoom.current, 6, dt);
    u.uMouse.value.lerp(s.mouse, 1 - Math.exp(-dt * 5));
    u.uHover.value = THREE.MathUtils.damp(u.uHover.value, s.hover, 3, dt);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={vert} fragmentShader={frag} depthTest={false} />
    </mesh>
  );
}

export default function HeroSlides({ urls, focus, index, onReady, zoom, active = true }) {
  return (
    <Canvas
      className="slides-canvas"
      dpr={[1, 2]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 1] }}
    >
      <Slides urls={urls} focus={focus} index={index} onReady={onReady} zoom={zoom} />
    </Canvas>
  );
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}
