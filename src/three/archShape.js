import * as THREE from 'three';

/*
 * Outline of a Mughal multifoil (cusped) arch opening, centred on x = 0,
 * base at y = 0. Returns an array of Vector2 points, counter-clockwise.
 *   w: opening width, h: height to the apex,
 *   spring: height where the curve starts (fraction of h),
 *   lobes: scallops per side, depth: how deep each scallop bites.
 */
export function cuspedArchPoints(w, h, { spring = 0.56, lobes = 4, depth = 0.22, seg = 10 } = {}) {
  const a = w / 2;
  const s = h * spring;
  const bez = (t, p0, p1, p2, p3) => {
    const u = 1 - t;
    return new THREE.Vector2(
      u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y
    );
  };
  const P0 = new THREE.Vector2(-a, s);
  const P1 = new THREE.Vector2(-a, s + (h - s) * 0.62);
  const P2 = new THREE.Vector2(-a * 0.32, h - (h - s) * 0.18);
  const P3 = new THREE.Vector2(0, h);

  // anchor points along the left curve
  const anchors = [];
  for (let i = 0; i <= lobes; i++) anchors.push(bez(i / lobes, P0, P1, P2, P3));

  const centre = new THREE.Vector2(0, s * 0.85);
  const left = [];
  for (let i = 0; i < lobes; i++) {
    const A = anchors[i], B = anchors[i + 1];
    const mid = A.clone().add(B).multiplyScalar(0.5);
    const out = mid.clone().sub(centre).normalize();
    const chord = A.distanceTo(B);
    const ctrl = mid.clone().add(out.multiplyScalar(chord * depth * 2));
    for (let k = i === 0 ? 0 : 1; k <= seg; k++) {
      const t = k / seg, u = 1 - t;
      left.push(new THREE.Vector2(
        u * u * A.x + 2 * u * t * ctrl.x + t * t * B.x,
        u * u * A.y + 2 * u * t * ctrl.y + t * t * B.y
      ));
    }
  }
  const right = left.slice(0, -1).reverse().map((p) => new THREE.Vector2(-p.x, p.y));
  return [new THREE.Vector2(-a, 0), ...left, ...right, new THREE.Vector2(a, 0)];
}

/* Wall with an arch-shaped hole. */
export function archWallShape(w, h, opts, wallW = 60, wallH = 40, base = -h / 2) {
  const pts = cuspedArchPoints(w, h, opts).map((p) => new THREE.Vector2(p.x, p.y + base));
  const shape = new THREE.Shape();
  shape.moveTo(-wallW / 2, -wallH / 2);
  shape.lineTo(wallW / 2, -wallH / 2);
  shape.lineTo(wallW / 2, wallH / 2);
  shape.lineTo(-wallW / 2, wallH / 2);
  shape.closePath();
  shape.holes.push(new THREE.Path(pts));
  return shape;
}

/* Ring between two arch outlines: used for the gold trim. */
export function archRingShape(w, h, thick, opts, base = -h / 2) {
  const outer = cuspedArchPoints(w + thick * 2, h + thick, opts).map((p) => new THREE.Vector2(p.x, p.y + base));
  const inner = cuspedArchPoints(w, h, opts).map((p) => new THREE.Vector2(p.x, p.y + base));
  const shape = new THREE.Shape(outer);
  shape.holes.push(new THREE.Path(inner));
  return shape;
}
