import * as THREE from 'three';
import { Builder, placeMatrix, type Place, type Vec3 } from '../build';
import type { GraveId, StoolId } from '../stoolShop';
import { G } from './kit';
import { signBoard, TextSign } from './sign';

/**
 * The stools round the dais and the gravestones in the churchyard: the plain ones and every design sold at the
 * shop (see stoolShop.ts). Each is one geometry painted by vertex, made the first time it's wanted and shared by
 * every stool or grave that uses it, so twenty stools out at once are twenty small draw calls.
 *
 * A stool stands on the dais with its seat's top at SEAT (where the engine sits everyone, STOOL_Y), facing +z (the
 * way whoever sits on it looks, in to the middle). Anything behind them (a chair's back) keeps behind z = -0.28.
 * A gravestone stands on the ground facing +z, with a plate (`label`) where its name goes.
 */

/** The top of every stool's seat, above the dais. */
export const SEAT = 0.42;

const up = new THREE.Vector3(0, 1, 0);

/** A round rod from one point to another (a leg, a rope, a spoke). */
function rod(b: Builder, color: string, from: Vec3, to: Vec3, r: number, sides = 6) {
  const a = new THREE.Vector3(...from);
  const d = new THREE.Vector3(...to).sub(a);
  const len = d.length();
  const m = new THREE.Matrix4().compose(a.addScaledVector(d, 0.5), new THREE.Quaternion().setFromUnitVectors(up, d.normalize()), new THREE.Vector3(r, len, r));
  b.add(G.cyl(sides), color, m);
}

/** A piece of a torus: `arc` radians of a ring of radius 1, tube `tube`, lying in the xy plane from the +x axis. */
const arcs = new Map<string, THREE.BufferGeometry>();
function arc(tube: number, angle: number, sides = 6, segs = 10): THREE.BufferGeometry {
  const k = `${tube}:${angle}:${sides}:${segs}`;
  let g = arcs.get(k);
  if (!g) arcs.set(k, (g = new THREE.TorusGeometry(1, tube, sides, segs, angle)));
  return g;
}

/** A barrel's bulging side: radius 1 at the middle, `ends` at top and bottom, height 1 centred on 0. */
const bulges = new Map<number, THREE.BufferGeometry>();
function bulge(ends: number): THREE.BufferGeometry {
  let g = bulges.get(ends);
  if (!g) {
    const pts = [0, 0.25, 0.5, 0.75, 1].map((t) => new THREE.Vector2(ends + (1 - ends) * Math.sin(t * Math.PI), t - 0.5));
    pts.unshift(new THREE.Vector2(0, -0.5));
    pts.push(new THREE.Vector2(0, 0.5));
    bulges.set(ends, (g = new THREE.LatheGeometry(pts, 14)));
  }
  return g;
}

/** Half a disc (a clam's open shell), the flat side down, thickness along y before it's turned. */
const halfDisc = new THREE.CylinderGeometry(1, 1, 1, 12, 1, false, -Math.PI / 2, Math.PI);

/** A six-sided prism and point, for crystals (the kit rounds anything over five sides up to fourteen). */
const hex = new THREE.CylinderGeometry(1, 1, 1, 6);
const hexTip = new THREE.ConeGeometry(1, 1, 6);

/** Spots scattered over the top of a dome of radii rx, ry, rz sitting at y (the toadstool's, the egg's). */
function domeSpots(b: Builder, color: string, c: Vec3, r: Vec3, n: number, size: number, seed = 1, minUp = 0.15) {
  for (let i = 0; i < n; i++) {
    const a = i * 2.39996 + seed;
    const h = minUp + (1 - minUp) * (((i * 0.618 + seed * 0.31) % 1) * 0.85);
    const ring = Math.sqrt(1 - h * h);
    const n3 = new THREE.Vector3((Math.cos(a) * ring) / r[0], h / r[1], (Math.sin(a) * ring) / r[2]).normalize();
    const p = new THREE.Vector3(c[0] + Math.cos(a) * ring * r[0], c[1] + h * r[1], c[2] + Math.sin(a) * ring * r[2]);
    const q = new THREE.Quaternion().setFromUnitVectors(up, n3);
    b.add(G.sphere(6, 4), color, new THREE.Matrix4().compose(p, q, new THREE.Vector3(size, size * 0.3, size)));
  }
}

// ---------------------------------------------------------------- the stools

const STOOL_PAINT: Record<'log' | StoolId, (b: Builder) => void> = {
  log(b) {
    // A round log stool: bark round the side, a pale cut top with a ring or two.
    b.add(G.cyl(24), '#7a5236', { pos: [0, 0.2, 0], scale: [0.4, 0.4, 0.4] });
    b.add(G.cyl(24), '#c49a6c', { pos: [0, 0.41, 0], scale: [0.4, 0.03, 0.4] });
    b.add(G.torus(0.18, 8, 24), '#a3794f', { pos: [0, 0.425, 0], rot: [Math.PI / 2, 0, 0], scale: [0.24, 0.24, 0.24] });
  },
  milking(b) {
    // Three splayed legs under a round seat.
    b.add(G.cyl(), '#9a6a3e', { pos: [0, 0.39, 0], scale: [0.3, 0.06, 0.3] });
    b.add(G.torus(0.2, 5, 16), '#7e5430', { pos: [0, 0.395, 0], rot: [Math.PI / 2, 0, 0], scale: 0.3 });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.5;
      rod(b, '#6e4a2a', [Math.sin(a) * 0.15, 0.37, Math.cos(a) * 0.15], [Math.sin(a) * 0.3, 0, Math.cos(a) * 0.3], 0.035);
    }
  },
  hay(b) {
    // A bale: straw, two bands of twine, a few stray stalks.
    b.add(G.rbox(0.1), '#e2c25a', { pos: [0, 0.21, 0], scale: [0.78, 0.42, 0.54] });
    b.add(G.box(), '#d2ae44', { pos: [0, 0.1, 0], scale: [0.79, 0.04, 0.55] });
    for (const x of [-0.2, 0.2]) b.add(G.box(), '#8a5a2a', { pos: [x, 0.21, 0], scale: [0.03, 0.43, 0.555] });
    for (const [x, z, r] of [
      [-0.3, 0.27, 0.6],
      [0.34, -0.24, -0.5],
      [0.1, 0.28, -0.3],
    ]) {
      b.add(G.box(), '#ecd27a', { pos: [x, 0.2, z], rot: [0.3, r, 0.5], scale: [0.015, 0.16, 0.015] });
    }
  },
  bucket(b) {
    // An old tin bucket upside down: ribs round it and a lip at the bottom.
    b.add(G.taper(0.8), '#a9b3ba', { pos: [0, 0.21, 0], scale: [0.32, 0.42, 0.32] });
    b.add(G.cyl(), '#c2cad0', { pos: [0, 0.415, 0], scale: [0.255, 0.012, 0.255] });
    b.add(G.torus(0.12, 5, 18), '#8e989f', { pos: [0, 0.02, 0], rot: [Math.PI / 2, 0, 0], scale: 0.32 });
    for (const y of [0.15, 0.3]) b.add(G.torus(0.06, 4, 18), '#949ea5', { pos: [0, y, 0], rot: [Math.PI / 2, 0, 0], scale: 0.32 - y * 0.15 });
    for (const x of [-1, 1]) b.add(G.sphere(6, 4), '#7c858b', { pos: [x * 0.3, 0.08, 0], scale: 0.035 });
  },
  crate(b) {
    // A fruit crate upside down: slats with gaps, corner posts, a label with an orange on it.
    const pale = '#d1a468';
    const dark = '#a87a42';
    for (const z of [-0.17, 0, 0.17]) b.add(G.box(), pale, { pos: [0, 0.405, z], scale: [0.64, 0.03, 0.14] });
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) b.add(G.box(), dark, { pos: [sx * 0.29, 0.2, sz * 0.21], scale: [0.06, 0.4, 0.06] });
    for (const y of [0.08, 0.27]) {
      for (const sz of [-1, 1]) b.add(G.box(), pale, { pos: [0, y, sz * 0.225], scale: [0.62, 0.12, 0.02] });
      for (const sx of [-1, 1]) b.add(G.box(), pale, { pos: [sx * 0.31, y, 0], scale: [0.02, 0.12, 0.44] });
    }
    b.add(G.box(), '#3d7a3a', { pos: [0, 0.27, 0.238], scale: [0.2, 0.1, 0.01] });
    b.add(G.sphere(8, 6), '#f08a24', { pos: [0, 0.27, 0.245], scale: [0.035, 0.035, 0.012] });
  },
  stump(b) {
    // A tree stump: bark, a cut top with rings, roots, moss over one side and a tiny toadstool.
    b.add(G.taper(0.86), '#6b4a2e', { pos: [0, 0.2, 0], scale: [0.38, 0.4, 0.38] });
    b.add(G.cyl(), '#cfa874', { pos: [0, 0.405, 0], scale: [0.325, 0.03, 0.325] });
    for (const r of [0.11, 0.22]) b.add(G.torus(0.08, 4, 16), '#b08a58', { pos: [0, 0.421, 0], rot: [Math.PI / 2, 0, 0], scale: r });
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3 + 0.4;
      b.add(G.cone(5), '#5e3f26', { pos: [Math.sin(a) * 0.38, 0.06, Math.cos(a) * 0.38], rot: [Math.cos(a) * 1.2, 0, -Math.sin(a) * 1.2], scale: [0.08, 0.22, 0.08] });
    }
    for (const [a, y, s] of [
      [2.4, 0.33, 0.16],
      [3.0, 0.22, 0.14],
      [1.9, 0.1, 0.12],
      [2.7, 0.405, 0.13],
    ]) {
      b.add(G.sphere(8, 5), '#6aa84a', { pos: [Math.sin(a) * 0.32, y, Math.cos(a) * 0.32], scale: [s, s * 0.45, s] });
    }
    b.add(G.cyl(6), '#f3ead8', { pos: [0.36, 0.06, -0.24], scale: [0.015, 0.1, 0.015] });
    b.add(G.dome(10), '#d8433a', { pos: [0.36, 0.11, -0.24], scale: [0.05, 0.035, 0.05] });
  },
  ring(b) {
    // A blow-up duck ring: a fat yellow ring with the duck's head and beak at one side.
    b.add(G.torus(0.62, 8, 18), '#ffd23a', { pos: [0, 0.22, 0], rot: [Math.PI / 2, 0, 0], scale: [0.3, 0.3, 0.33] });
    b.add(G.sphere(10, 8), '#ffd23a', { pos: [0.42, 0.42, 0.04], scale: 0.13 });
    b.add(G.sphere(8, 5), '#f08a24', { pos: [0.54, 0.4, 0.06], scale: [0.07, 0.03, 0.06] });
    for (const z of [-0.06, 0.12]) b.add(G.sphere(6, 4), '#1d1d24', { pos: [0.48, 0.47, z], scale: 0.02 });
  },
  barrel(b) {
    // A short barrel: bulging staves, iron hoops and a lid.
    b.add(bulge(0.84), '#9a6638', { pos: [0, 0.21, 0], scale: [0.32, 0.42, 0.32] });
    b.add(G.cyl(), '#b88350', { pos: [0, 0.41, 0], scale: [0.275, 0.02, 0.275] });
    for (const [y, r] of [
      [0.05, 0.29],
      [0.37, 0.29],
      [0.21, 0.322],
    ]) {
      b.add(G.cyl(), '#3e3a38', { pos: [0, y, 0], scale: [r, 0.035, r] });
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.add(G.box(), '#7e5230', { pos: [Math.sin(a) * 0.318, 0.13, Math.cos(a) * 0.318], rot: [0, a, 0], scale: [0.008, 0.1, 0.01] });
    }
  },
  tyres(b) {
    // Two old tyres, one on the other, with a red cushion on top.
    for (const y of [0.1, 0.29]) {
      b.add(G.torus(0.42, 6, 18), '#2a2a2e', { pos: [0, y, 0], rot: [Math.PI / 2, 0, 0], scale: [0.27, 0.27, 0.24] });
      b.add(G.cyl(), '#3a3a40', { pos: [0, y, 0], scale: [0.17, 0.12, 0.17] });
    }
    b.add(G.sphere(12, 6), '#d8443a', { pos: [0, 0.39, 0], scale: [0.27, 0.04, 0.27] });
  },
  pouffe(b) {
    // A round knitted pouffe in mustard, with cabled ribs.
    b.add(G.cyl(), '#d9a43a', { pos: [0, 0.18, 0], scale: [0.36, 0.36, 0.36] });
    b.add(G.sphere(14, 6), '#e2b048', { pos: [0, 0.36, 0], scale: [0.36, 0.065, 0.36] });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      b.add(G.box(), '#c08c28', { pos: [Math.sin(a) * 0.36, 0.18, Math.cos(a) * 0.36], rot: [0, a, 0], scale: [0.05, 0.34, 0.025] });
    }
    b.add(G.sphere(8, 5), '#c08c28', { pos: [0, 0.42, 0], scale: [0.04, 0.012, 0.04] });
  },
  pumpkin(b) {
    // A fat pumpkin, flattened on top for sitting, its curly stem and a leaf round the back.
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.add(G.sphere(10, 6), i % 2 ? '#e8822a' : '#de7420', { pos: [Math.sin(a) * 0.17, 0.2, Math.cos(a) * 0.17], rot: [0, a, 0], scale: [0.17, 0.2, 0.22] });
    }
    b.add(G.cyl(), '#e8822a', { pos: [0, 0.3, 0], scale: [0.26, 0.24, 0.26] });
    b.add(G.cyl(6), '#5a7a2a', { pos: [0, 0.4, -0.3], rot: [-0.5, 0, 0], scale: [0.03, 0.14, 0.03] });
    b.add(G.sphere(8, 4), '#4e8a34', { pos: [0.12, 0.38, -0.32], rot: [0, 0.6, 0.3], scale: [0.11, 0.015, 0.07] });
  },
  books(b) {
    // A stack of five old books, each a little askew: covers, a spine, and the pages showing.
    const covers = ['#8a2a2a', '#2a4a7a', '#3a6a3a', '#7a5a2a', '#5a3a6a'];
    const sizes: [number, number][] = [
      [0.6, 0.44],
      [0.56, 0.42],
      [0.58, 0.4],
      [0.52, 0.4],
      [0.5, 0.36],
    ];
    covers.forEach((c, i) => {
      const [w, d] = sizes[i];
      const y = 0.042 + i * 0.084;
      const m = new THREE.Matrix4().compose(new THREE.Vector3((i % 2 ? 0.02 : -0.015), y, i % 3 ? 0.01 : -0.01), new THREE.Quaternion().setFromAxisAngle(up, (i - 2) * 0.12), new THREE.Vector3(1, 1, 1));
      const put = (color: string, pos: Vec3, scale: Vec3) => b.add(G.box(), color, new THREE.Matrix4().compose(new THREE.Vector3(...pos), new THREE.Quaternion(), new THREE.Vector3(...scale)), m);
      put('#f2ead2', [0.01, 0, 0], [w - 0.03, 0.06, d - 0.03]);
      put(c, [0, 0.036, 0], [w, 0.012, d]);
      put(c, [0, -0.036, 0], [w, 0.012, d]);
      put(c, [-w / 2 + 0.006, 0, 0], [0.012, 0.084, d]);
      put('#e2c25a', [-w / 2 - 0.001, 0, 0], [0.012, 0.012, d * 0.7]);
    });
  },
  beanbag(b) {
    // A slumped purple beanbag, higher at the back.
    b.add(G.sphere(14, 8), '#7a4ab8', { pos: [0, 0.2, 0.02], scale: [0.44, 0.23, 0.4] });
    b.add(G.sphere(12, 8), '#6e40a8', { pos: [0, 0.38, -0.26], rot: [0.4, 0, 0], scale: [0.36, 0.26, 0.17] });
    b.add(G.sphere(8, 5), '#8a5ac8', { pos: [0, 0.405, 0.02], scale: [0.2, 0.03, 0.16] });
  },
  toadstool(b) {
    // A red toadstool with white spots, on a pale stalk with a frill.
    b.add(G.taper(0.8), '#efe6d2', { pos: [0, 0.15, 0], scale: [0.15, 0.3, 0.15] });
    b.add(G.torus(0.35, 5, 14), '#e6dcc4', { pos: [0, 0.22, 0], rot: [Math.PI / 2, 0, 0], scale: [0.13, 0.13, 0.08] });
    b.add(G.dome(16), '#d8343a', { pos: [0, 0.28, 0], scale: [0.42, 0.14, 0.42] });
    b.add(G.cyl(), '#f2e8d4', { pos: [0, 0.28, 0], scale: [0.4, 0.01, 0.4] });
    domeSpots(b, '#fbf6ea', [0, 0.28, 0], [0.42, 0.14, 0.42], 9, 0.06, 2, 0.2);
  },
  tractor(b) {
    // A red pressed-steel tractor seat with holes in it, on a spring and a black post.
    b.add(G.cyl(), '#2a2a2e', { pos: [0, 0.015, 0], scale: [0.24, 0.03, 0.24] });
    b.add(G.cyl(8), '#2a2a2e', { pos: [0, 0.16, -0.04], scale: [0.04, 0.3, 0.04] });
    for (const y of [0.29, 0.32, 0.35]) b.add(G.torus(0.25, 4, 12), '#9aa0a6', { pos: [0, y, -0.02], rot: [Math.PI / 2, 0, 0], scale: 0.07 });
    b.add(G.cyl(), '#d8302a', { pos: [0, 0.395, 0], scale: [0.29, 0.04, 0.26] });
    const lip = arc(0.1, Math.PI * 1.1, 4, 12);
    b.add(lip, '#c0281f', { pos: [0, 0.42, 0], rot: [Math.PI / 2, 0, Math.PI * 0.95], scale: [0.28, 0.25, 0.4] });
    for (const [x, z] of [
      [0, 0.12],
      [-0.12, 0.05],
      [0.12, 0.05],
      [-0.06, -0.08],
      [0.06, -0.08],
      [0, 0],
    ]) {
      b.add(G.cyl(6), '#5a1410', { pos: [x, 0.416, z], scale: [0.025, 0.004, 0.025] });
    }
  },
  iceblock(b) {
    // A big block of ice: pale blue, frost on top, a crack or two and a little puddle round it.
    b.add(G.cyl(), '#9fd0e8', { pos: [0, 0.006, 0], scale: [0.44, 0.012, 0.38] });
    b.add(G.rbox(0.08), '#bfe6f5', { pos: [0, 0.21, 0], scale: [0.62, 0.42, 0.52] });
    b.add(G.box(), '#eaf8ff', { pos: [0, 0.418, 0], scale: [0.54, 0.008, 0.44] });
    b.add(G.box(), '#f4fcff', { pos: [-0.1, 0.24, 0.262], rot: [0, 0, 0.6], scale: [0.16, 0.012, 0.005] });
    b.add(G.box(), '#f4fcff', { pos: [-0.02, 0.19, 0.262], rot: [0, 0, -0.4], scale: [0.1, 0.012, 0.005] });
    b.add(G.box(), '#f4fcff', { pos: [0.312, 0.2, 0.05], rot: [0.5, 0, 0], scale: [0.005, 0.012, 0.18] });
  },
  barstool(b) {
    // A diner stool: a chrome base and pole, a foot ring, a red button-tufted cushion.
    const chrome = '#c8ccd2';
    b.add(G.taper(0.4), chrome, { pos: [0, 0.03, 0], scale: [0.26, 0.06, 0.26] });
    b.add(G.cyl(8), chrome, { pos: [0, 0.2, 0], scale: [0.035, 0.32, 0.035] });
    b.add(G.torus(0.08, 4, 18), '#b4b8c0', { pos: [0, 0.17, 0], rot: [Math.PI / 2, 0, 0], scale: 0.2 });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      rod(b, '#b4b8c0', [0, 0.2, 0], [Math.sin(a) * 0.2, 0.17, Math.cos(a) * 0.2], 0.012, 4);
    }
    b.add(G.cyl(), chrome, { pos: [0, 0.35, 0], scale: [0.3, 0.04, 0.3] });
    b.add(G.cyl(), '#c8242c', { pos: [0, 0.385, 0], scale: [0.29, 0.05, 0.29] });
    b.add(G.sphere(14, 5), '#d8303a', { pos: [0, 0.405, 0], scale: [0.285, 0.022, 0.285] });
    b.add(G.sphere(6, 4), '#8a1018', { pos: [0, 0.426, 0], scale: [0.025, 0.006, 0.025] });
  },
  drum(b) {
    // A bass drum on end: red shell, white heads, brass hoops and tension rods.
    b.add(G.cyl(), '#c8302e', { pos: [0, 0.21, 0], scale: [0.33, 0.38, 0.33] });
    b.add(G.cyl(), '#f4efe4', { pos: [0, 0.405, 0], scale: [0.31, 0.02, 0.31] });
    for (const y of [0.02, 0.4]) b.add(G.torus(0.09, 4, 18), '#e0b040', { pos: [0, y, 0], rot: [Math.PI / 2, 0, 0], scale: 0.335 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.add(G.cyl(4), '#d8d8d0', { pos: [Math.sin(a) * 0.345, 0.21, Math.cos(a) * 0.345], scale: [0.012, 0.36, 0.012] });
    }
    b.add(G.cyl(), '#f4efe4', { pos: [0, 0.21, 0.32], rot: [Math.PI / 2, 0, 0], scale: [0.09, 0.03, 0.09] });
  },
  anvil(b) {
    // A blacksmith's anvil on a wooden block, its horn out to one side.
    const iron = '#4a4e56';
    b.add(G.cyl(), '#8a6a44', { pos: [0, 0.12, 0], scale: [0.22, 0.24, 0.22] });
    b.add(G.cyl(), '#b08a5a', { pos: [0, 0.241, 0], scale: [0.2, 0.004, 0.2] });
    b.add(G.box(), iron, { pos: [0, 0.27, 0], scale: [0.3, 0.06, 0.24] });
    b.add(G.box(), iron, { pos: [0, 0.33, 0], scale: [0.18, 0.08, 0.16] });
    b.add(G.box(), '#5a5e68', { pos: [-0.02, 0.39, 0], scale: [0.48, 0.07, 0.24] });
    b.add(G.box(), '#7a808a', { pos: [-0.02, 0.4255, 0], scale: [0.46, 0.002, 0.22] });
    b.add(G.cone(8), '#5a5e68', { pos: [0.34, 0.39, 0], rot: [0, 0, -Math.PI / 2], scale: [0.07, 0.24, 0.07] });
  },
  donut(b) {
    // A giant doughnut on a plate: pink icing and sprinkles.
    b.add(G.cyl(), '#f4f0e8', { pos: [0, 0.025, 0], scale: [0.44, 0.05, 0.44] });
    b.add(G.torus(0.6, 8, 20), '#d89a52', { pos: [0, 0.24, 0], rot: [Math.PI / 2, 0, 0], scale: [0.27, 0.27, 0.29] });
    b.add(G.torus(0.62, 8, 20), '#f28ab8', { pos: [0, 0.28, 0], rot: [Math.PI / 2, 0, 0], scale: [0.27, 0.27, 0.23] });
    const sprinkles = ['#ffffff', '#4ab8f0', '#ffd23a', '#6ad06a', '#e8442a'];
    for (let i = 0; i < 16; i++) {
      const a = i * 2.39996;
      const r = 0.2 + ((i * 0.37) % 1) * 0.14;
      b.add(G.box(), sprinkles[i % sprinkles.length], { pos: [Math.sin(a) * r, 0.405, Math.cos(a) * r], rot: [0, a * 1.7, 0], scale: [0.045, 0.014, 0.014] });
    }
  },
  loo(b) {
    // A loo, seat down: a white bowl, a wooden seat, the lid and cistern behind, and a spare roll.
    b.add(G.taper(1.4), '#f4f4f0', { pos: [0, 0.18, 0.02], scale: [0.18, 0.36, 0.22] });
    b.add(G.sphere(12, 6), '#f4f4f0', { pos: [0, 0.33, 0.04], scale: [0.24, 0.07, 0.29] });
    b.add(G.torus(0.3, 6, 20), '#b07a48', { pos: [0, 0.4, 0.04], rot: [Math.PI / 2, 0, 0], scale: [0.22, 0.27, 0.15] });
    b.add(G.cyl(), '#e6e8e4', { pos: [0, 0.395, 0.04], scale: [0.16, 0.01, 0.2] });
    b.add(G.rbox(0.2), '#b07a48', { pos: [0, 0.62, -0.29], rot: [-0.12, 0, 0], scale: [0.4, 0.42, 0.03] });
    b.add(G.rbox(0.12), '#f4f4f0', { pos: [0, 0.6, -0.38], scale: [0.46, 0.4, 0.16] });
    b.add(G.box(), '#c8ccd2', { pos: [0.16, 0.8, -0.38], scale: [0.06, 0.02, 0.04] });
    b.add(G.cyl(), '#fbfbf6', { pos: [0.38, 0.08, 0.1], scale: [0.07, 0.16, 0.07] });
  },
  teacup(b) {
    // A giant teacup of tea on its saucer, with a gold rim, a band of roses and a handle.
    b.add(G.cyl(), '#f6f2ec', { pos: [0, 0.03, 0], scale: [0.46, 0.04, 0.46] });
    b.add(G.torus(0.1, 4, 20), '#e2b84a', { pos: [0, 0.05, 0], rot: [Math.PI / 2, 0, 0], scale: 0.455 });
    b.add(G.taper(1.5), '#f8f6f2', { pos: [0, 0.24, 0], scale: [0.25, 0.38, 0.25] });
    b.add(G.taper(1.08), '#f2a0b0', { pos: [0, 0.3, 0], scale: [0.31, 0.08, 0.31] });
    b.add(G.torus(0.06, 4, 20), '#e2b84a', { pos: [0, 0.43, 0], rot: [Math.PI / 2, 0, 0], scale: 0.375 });
    b.add(G.cyl(), '#9a5a2a', { pos: [0, 0.405, 0], scale: [0.35, 0.03, 0.35] });
    b.add(G.torus(0.2, 5, 14), '#f8f6f2', { pos: [0.4, 0.27, 0], scale: [0.1, 0.1, 0.1] });
  },
  cake(b) {
    // A three-tier birthday cake: pink, cream and chocolate, drips of icing, cherries round the top.
    const tiers: [number, number, number, string][] = [
      [0.41, 0.0, 0.18, '#f2a8c0'],
      [0.34, 0.18, 0.13, '#f6ecd8'],
      [0.27, 0.31, 0.11, '#7a4a2a'],
    ];
    for (const [r, y, h, c] of tiers) {
      b.add(G.cyl(), c, { pos: [0, y + h / 2, 0], scale: [r, h, r] });
      b.add(G.torus(0.07, 4, 18), '#fffaf2', { pos: [0, y + h, 0], rot: [Math.PI / 2, 0, 0], scale: r });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + y * 9;
        b.add(G.sphere(6, 4), '#fffaf2', { pos: [Math.sin(a) * r, y + h - 0.025, Math.cos(a) * r], scale: [0.025, 0.035, 0.018] });
      }
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      b.add(G.sphere(6, 5), '#d8202a', { pos: [Math.sin(a) * 0.3, 0.335, Math.cos(a) * 0.3], scale: 0.03 });
    }
  },
  swing(b) {
    // A garden swing: a wooden frame, two ropes and a plank seat.
    const wood = '#8a5a34';
    for (const x of [-0.46, 0.46]) {
      for (const z of [-0.3, 0.3]) rod(b, wood, [x, 0, z], [x * 0.98, 1.5, 0], 0.04, 5);
    }
    b.add(G.cyl(8), wood, { pos: [0, 1.5, 0], rot: [0, 0, Math.PI / 2], scale: [0.05, 1.0, 0.05] });
    for (const x of [-0.27, 0.27]) b.add(G.cyl(4), '#d8c8a0', { pos: [x, 0.96, 0], scale: [0.012, 1.08, 0.012] });
    b.add(G.rbox(0.2), '#b07a48', { pos: [0, 0.4, 0], scale: [0.66, 0.045, 0.28] });
  },
  rocking(b) {
    // A rocking chair: rockers, a seat, a spindle back and arms.
    const wood = '#7a4e2c';
    const seat = '#94603a';
    for (const x of [-0.25, 0.25]) {
      b.add(arc(0.03, 0.9, 4, 8), wood, { pos: [x, 1.0, -0.03], rot: [0, Math.PI / 2, Math.PI * 1.5 - 0.45], scale: 0.98 });
      for (const z of [-0.18, 0.18]) rod(b, wood, [x, 0.05, z], [x, 0.38, z], 0.025, 5);
      rod(b, wood, [x * 1.08, 0.4, -0.22], [x * 1.08, 1.0, -0.3], 0.028, 5);
      rod(b, wood, [x * 1.1, 0.62, 0.18], [x * 1.1, 0.62, -0.26], 0.025, 5);
      rod(b, wood, [x * 1.1, 0.4, 0.17], [x * 1.1, 0.62, 0.18], 0.02, 5);
    }
    b.add(G.rbox(0.15), seat, { pos: [0, 0.4, 0], scale: [0.56, 0.04, 0.46] });
    b.add(G.box(), seat, { pos: [0, 0.98, -0.3], rot: [-0.13, 0, 0], scale: [0.6, 0.08, 0.04] });
    for (const x of [-0.14, 0, 0.14]) rod(b, wood, [x, 0.42, -0.24], [x, 0.95, -0.3], 0.015, 4);
  },
  clam(b) {
    // A giant clam shell: the lower half to sit in, the upper half open behind like a fan, and a pearl at the side.
    b.add(G.cyl(), '#e8d4a8', { pos: [0, 0.05, 0], scale: [0.2, 0.1, 0.2] });
    b.add(G.dome(14), '#f2b8c0', { pos: [0, 0.4, 0], rot: [Math.PI, 0, 0], scale: [0.42, 0.3, 0.36] });
    b.add(G.cyl(), '#fbe3e6', { pos: [0, 0.405, 0], scale: [0.38, 0.012, 0.32] });
    // (The fan leans back from its hinge at the back of the seat.)
    const hinge = new THREE.Matrix4().compose(new THREE.Vector3(0, 0.4, -0.3), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.25), new THREE.Vector3(1, 1, 1));
    b.add(halfDisc, '#f2b8c0', { rot: [-Math.PI / 2, 0, 0], scale: [0.44, 0.05, 0.5] }, hinge);
    for (let i = 0; i < 7; i++) {
      const a = -1.2 + (i / 6) * 2.4;
      b.add(G.box(), '#e49aa8', { pos: [Math.sin(a) * 0.22, Math.cos(a) * 0.24, 0.03], rot: [0, 0, -a], scale: [0.03, 0.42, 0.03] }, hinge);
    }
    b.add(G.sphere(12, 8), '#fbf6f0', { pos: [0.36, 0.44, 0.1], scale: 0.07 });
  },
  chest(b) {
    // A pirate's treasure chest, shut: a rounded lid, gold bands and lock, and a few coins spilled in front.
    const wood = '#7a4a26';
    const gold = '#e8b830';
    b.add(G.box(), wood, { pos: [0, 0.16, 0], scale: [0.66, 0.32, 0.46] });
    b.add(G.cyl(), '#8a5630', { pos: [0, 0.32, 0], rot: [0, 0, Math.PI / 2], scale: [0.23, 0.66, 0.1] });
    b.add(G.box(), '#6a3e1e', { pos: [0, 0.32, 0], scale: [0.665, 0.02, 0.465] });
    for (const x of [-0.24, 0.24]) {
      b.add(G.box(), gold, { pos: [x, 0.16, 0], scale: [0.05, 0.33, 0.47] });
      b.add(G.cyl(), gold, { pos: [x, 0.32, 0], rot: [0, 0, Math.PI / 2], scale: [0.235, 0.05, 0.105] });
    }
    b.add(G.box(), gold, { pos: [0, 0.29, 0.24], scale: [0.09, 0.11, 0.025] });
    b.add(G.box(), '#2a1a0a', { pos: [0, 0.28, 0.254], scale: [0.015, 0.035, 0.005] });
    for (const [x, z, t] of [
      [-0.1, 0.33, 0],
      [0.06, 0.36, 0.3],
      [0.18, 0.31, 0],
    ]) {
      b.add(G.cyl(8), gold, { pos: [x, 0.008, z], rot: [t, 0, 0], scale: [0.045, 0.012, 0.045] });
    }
  },
  gaming(b) {
    // A racing-style gaming chair: five feet on wheels, a gas lift, a black seat with red trim, a tall back with
    // wings, a headrest pillow and arms.
    const black = '#22222a';
    const red = '#d82a36';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      rod(b, black, [0, 0.1, 0], [Math.sin(a) * 0.3, 0.06, Math.cos(a) * 0.3], 0.025, 4);
      b.add(G.sphere(6, 4), '#3a3a44', { pos: [Math.sin(a) * 0.3, 0.035, Math.cos(a) * 0.3], scale: 0.035 });
    }
    b.add(G.cyl(8), '#9aa0a8', { pos: [0, 0.22, 0], scale: [0.035, 0.24, 0.035] });
    b.add(G.rbox(0.25), black, { pos: [0, 0.37, 0], scale: [0.54, 0.09, 0.5] });
    for (const x of [-1, 1]) b.add(G.box(), red, { pos: [x * 0.24, 0.4, 0.01], scale: [0.08, 0.07, 0.46] });
    b.add(G.box(), black, { pos: [0, 0.86, -0.32], rot: [-0.12, 0, 0], scale: [0.52, 0.9, 0.1] });
    for (const x of [-1, 1]) {
      b.add(G.box(), red, { pos: [x * 0.24, 0.86, -0.3], rot: [-0.12, x * 0.4, 0], scale: [0.08, 0.86, 0.1] });
      rod(b, black, [x * 0.29, 0.38, 0.0], [x * 0.29, 0.6, 0.0], 0.025, 4);
      b.add(G.box(), '#3a3a44', { pos: [x * 0.29, 0.62, 0.0], scale: [0.07, 0.04, 0.3] });
    }
    b.add(G.box(), red, { pos: [0, 0.6, -0.31], rot: [-0.12, 0, 0], scale: [0.3, 0.06, 0.06] });
    b.add(G.rbox(0.3), red, { pos: [0, 1.17, -0.32], rot: [-0.12, 0, 0], scale: [0.26, 0.1, 0.1] });
  },
  cloud(b) {
    // A fluffy cloud: puffs round the bottom (bluish underneath), a soft seat, a puffy back.
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      b.add(G.sphere(9, 6), i % 2 ? '#e2ecf6' : '#d6e4f2', { pos: [Math.sin(a) * 0.28, 0.2, Math.cos(a) * 0.26], scale: [0.19, 0.16, 0.19] });
    }
    b.add(G.sphere(14, 8), '#fbfdff', { pos: [0, 0.3, 0], scale: [0.38, 0.12, 0.34] });
    for (const [x, y, z, s] of [
      [0, 0.56, -0.32, 0.2],
      [-0.2, 0.48, -0.3, 0.17],
      [0.2, 0.48, -0.3, 0.17],
      [-0.33, 0.36, -0.16, 0.13],
      [0.33, 0.36, -0.16, 0.13],
    ]) {
      b.add(G.sphere(9, 6), '#fbfdff', { pos: [x, y, z], scale: s });
    }
  },
  egg(b) {
    // A dragon's egg lying in a nest of twigs: dark green with gold-edged scales, and a little horn at the end.
    b.add(G.torus(0.3, 6, 16), '#7a5a34', { pos: [0, 0.07, 0], rot: [Math.PI / 2, 0, 0], scale: [0.36, 0.36, 0.25] });
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2;
      b.add(G.box(), i % 2 ? '#6a4a28' : '#8a6a3e', { pos: [Math.sin(a) * 0.36, 0.1, Math.cos(a) * 0.36], rot: [0.3, a + 1.2, 0.2], scale: [0.26, 0.018, 0.018] });
    }
    const c: Vec3 = [0, 0.22, 0];
    const r: Vec3 = [0.26, 0.2, 0.34];
    b.add(G.sphere(14, 9), '#2e7a6a', { pos: c, scale: r });
    domeSpots(b, '#e2b84a', c, r, 12, 0.045, 1, 0.1);
    domeSpots(b, '#1e5a4e', c, r, 10, 0.05, 4.2, 0.05);
    b.add(G.cone(6), '#e2c86a', { pos: [0, 0.27, -0.35], rot: [-1.3, 0, 0], scale: [0.04, 0.1, 0.04] });
  },
  throne(b) {
    // A gold throne: red velvet seat, a tall back with a pointed top and a little crown, arms with gold balls.
    const gold = '#e3b23c';
    const deep = '#c8962a';
    const red = '#a8202a';
    b.add(G.box(), deep, { pos: [0, 0.03, 0], scale: [0.7, 0.06, 0.58] });
    b.add(G.box(), gold, { pos: [0, 0.2, 0.01], scale: [0.62, 0.3, 0.5] });
    b.add(G.rbox(0.3), red, { pos: [0, 0.385, 0.03], scale: [0.56, 0.08, 0.46] });
    b.add(G.box(), gold, { pos: [0, 0.82, -0.3], scale: [0.62, 0.9, 0.08] });
    b.add(G.rbox(0.2), red, { pos: [0, 0.82, -0.255], scale: [0.48, 0.76, 0.03] });
    b.add(G.prism(), gold, { pos: [0, 1.27, -0.3], scale: [0.62, 0.2, 0.08] });
    for (const x of [-1, 1]) {
      b.add(G.box(), gold, { pos: [x * 0.33, 0.55, -0.02], scale: [0.07, 0.3, 0.48] });
      b.add(G.sphere(8, 6), deep, { pos: [x * 0.33, 0.73, 0.22], scale: 0.055 });
      b.add(G.sphere(8, 6), deep, { pos: [x * 0.33, 1.3, -0.3], scale: 0.06 });
    }
    // The crown on top: a band, five points and a red jewel.
    b.add(G.cyl(), gold, { pos: [0, 1.48, -0.3], scale: [0.1, 0.06, 0.1] });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.add(G.cone(4), gold, { pos: [Math.sin(a) * 0.085, 1.54, -0.3 + Math.cos(a) * 0.085], scale: [0.025, 0.07, 0.025] });
    }
    b.add(G.sphere(6, 4), '#d8202a', { pos: [0, 1.48, -0.195], scale: 0.025 });
  },
};

const stoolGeos = new Map<string, THREE.BufferGeometry>();

/** The shared geometry for a stool (null: the plain log one). */
export function stoolGeometry(id: StoolId | null | undefined): THREE.BufferGeometry {
  const key = id && STOOL_PAINT[id] ? id : 'log';
  let g = stoolGeos.get(key);
  if (!g) {
    const b = new Builder();
    STOOL_PAINT[key as StoolId](b);
    stoolGeos.set(key, (g = b.geometry()));
  }
  return g;
}

// ---------------------------------------------------------------- the gravestones

/** Where a gravestone's name goes: the plate's middle, its size, and the stone's colour behind the words. */
export interface GravePlate {
  y: number;
  z: number;
  w: number;
  h: number;
  bg: string;
  fg: string;
  /** Turned back this far (a plate on a slope). */
  tilt?: number;
  /** Leaning to the side this far, about the ground under the middle (a stone that leans). */
  roll?: number;
}

interface GraveDesign {
  paint(b: Builder, glow: Builder): void;
  plate: GravePlate;
}

const stone = '#a8a196';

const GRAVE_PAINT: Record<'plain' | GraveId, GraveDesign> = {
  plain: {
    paint(b) {
      b.add(G.box(), stone, { pos: [0, 0.4, 0], scale: [0.6, 0.8, 0.14] });
      b.add(G.cyl(20), stone, { pos: [0, 0.8, 0], rot: [Math.PI / 2, 0, 0], scale: [0.3, 0.14, 0.3] });
    },
    plate: { y: 0.5, z: 0.075, w: 0.5, h: 0.25, bg: stone, fg: '#3a3630' },
  },
  cartoon: {
    // A little cartoon stone, leaning, with a crack and a daisy.
    paint(b) {
      const lean = new THREE.Matrix4().makeRotationZ(0.1);
      b.add(G.rbox(0.25), '#b8b8c8', { pos: [0, 0.22, 0], scale: [0.44, 0.44, 0.16] }, lean);
      b.add(G.cyl(16), '#b8b8c8', { pos: [0, 0.44, 0], rot: [Math.PI / 2, 0, 0], scale: [0.22, 0.16, 0.22] }, lean);
      b.add(G.box(), '#6a6a7a', { pos: [0.1, 0.52, 0.082], rot: [0, 0, 0.7], scale: [0.09, 0.015, 0.004] }, lean);
      b.add(G.box(), '#6a6a7a', { pos: [0.14, 0.47, 0.082], rot: [0, 0, -0.5], scale: [0.07, 0.015, 0.004] }, lean);
      b.add(G.cyl(4), '#4e8a34', { pos: [-0.3, 0.1, 0.1], scale: [0.01, 0.2, 0.01] });
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        b.add(G.sphere(6, 4), '#fbfbf2', { pos: [-0.3 + Math.sin(a) * 0.035, 0.21 + Math.cos(a) * 0.035, 0.1], scale: [0.025, 0.025, 0.01] });
      }
      b.add(G.sphere(6, 4), '#f2c42a', { pos: [-0.3, 0.21, 0.105], scale: 0.02 });
    },
    plate: { y: 0.3, z: 0.084, w: 0.36, h: 0.18, bg: '#b8b8c8', fg: '#2a2a3a', roll: 0.1 },
  },
  skull: {
    // A block with a skull and crossbones on top.
    paint(b) {
      const bone = '#ece6d6';
      b.add(G.box(), '#8a8680', { pos: [0, 0.22, 0], scale: [0.54, 0.44, 0.22] });
      b.add(G.box(), '#7a766e', { pos: [0, 0.46, 0], scale: [0.58, 0.04, 0.26] });
      for (const s of [-1, 1]) {
        rod(b, bone, [-0.22, 0.5 + (s > 0 ? 0 : 0.2), -0.02], [0.22, 0.5 + (s > 0 ? 0.2 : 0), -0.02], 0.025, 5);
        for (const x of [-0.22, 0.22]) b.add(G.sphere(6, 4), bone, { pos: [x, 0.5 + ((x > 0) === s > 0 ? 0.2 : 0), -0.02], scale: 0.035 });
      }
      b.add(G.sphere(12, 8), bone, { pos: [0, 0.64, 0.02], scale: [0.13, 0.12, 0.12] });
      b.add(G.box(), bone, { pos: [0, 0.53, 0.05], scale: [0.12, 0.06, 0.1] });
      for (const x of [-0.05, 0.05]) b.add(G.sphere(6, 4), '#2a2622', { pos: [x, 0.64, 0.12], scale: [0.035, 0.04, 0.03] });
      b.add(G.cone(3), '#2a2622', { pos: [0, 0.585, 0.128], rot: [Math.PI / 2, 0, Math.PI], scale: [0.018, 0.01, 0.02] });
    },
    plate: { y: 0.22, z: 0.112, w: 0.46, h: 0.22, bg: '#8a8680', fg: '#1e1c1a' },
  },
  catstone: {
    // A stone in the shape of a sitting cat: body, round head, two ears, a tail curled round.
    paint(b) {
      const c = '#9a96a6';
      b.add(G.rbox(0.35), c, { pos: [0, 0.26, 0], scale: [0.44, 0.52, 0.16] });
      b.add(G.sphere(14, 8), c, { pos: [0, 0.62, 0], scale: [0.2, 0.17, 0.08] });
      for (const x of [-1, 1]) b.add(G.cone(3), c, { pos: [x * 0.12, 0.79, 0], rot: [0, 0, -x * 0.25], scale: [0.07, 0.12, 0.05] });
      b.add(arc(0.18, Math.PI * 1.2, 5, 10), c, { pos: [0.24, 0.14, 0], rot: [0, 0, -0.4], scale: [0.14, 0.14, 0.14] });
      for (const x of [-0.07, 0.07]) b.add(G.sphere(6, 4), '#5a5666', { pos: [x, 0.64, 0.07], scale: [0.025, 0.035, 0.012] });
      b.add(G.cone(3), '#c48a96', { pos: [0, 0.6, 0.078], rot: [Math.PI / 2, 0, Math.PI], scale: [0.018, 0.01, 0.015] });
    },
    plate: { y: 0.27, z: 0.085, w: 0.36, h: 0.2, bg: '#9a96a6', fg: '#2a2832' },
  },
  obelisk: {
    // A tall pointed obelisk on a stepped base.
    paint(b) {
      const c = '#c9c3b6';
      b.add(G.box(), '#b0aa9c', { pos: [0, 0.06, 0], scale: [0.56, 0.12, 0.56] });
      b.add(G.box(), c, { pos: [0, 0.17, 0], scale: [0.44, 0.1, 0.44] });
      b.add(G.taper(0.7, 4), c, { pos: [0, 0.72, 0], rot: [0, Math.PI / 4, 0], scale: [0.24, 1.0, 0.24] });
      b.add(G.cone(4), '#d8d2c4', { pos: [0, 1.29, 0], rot: [0, Math.PI / 4, 0], scale: [0.12, 0.14, 0.12] });
    },
    plate: { y: 0.42, z: 0.163, w: 0.26, h: 0.16, bg: '#c9c3b6', fg: '#3a3630', tilt: 0.04 },
  },
  celtic: {
    // A Celtic cross: the cross with its ring, on a base, a little moss.
    paint(b) {
      const c = '#8e9a8a';
      b.add(G.box(), '#7e8a7a', { pos: [0, 0.1, 0], scale: [0.46, 0.2, 0.26] });
      b.add(G.box(), c, { pos: [0, 0.68, 0], scale: [0.16, 1.0, 0.12] });
      b.add(G.box(), c, { pos: [0, 0.92, 0], scale: [0.62, 0.15, 0.12] });
      b.add(G.torus(0.14, 5, 20), c, { pos: [0, 0.92, 0], scale: [0.21, 0.21, 0.4] });
      b.add(G.sphere(6, 4), '#6a8a4a', { pos: [-0.15, 0.2, 0.08], scale: [0.09, 0.03, 0.06] });
      for (const [x, y] of [
        [0, 0.92],
        [0, 0.6],
      ]) {
        b.add(G.sphere(6, 4), '#a8b4a4', { pos: [x, y, 0.06], scale: [0.035, 0.035, 0.015] });
      }
    },
    plate: { y: 0.1, z: 0.132, w: 0.4, h: 0.16, bg: '#7e8a7a', fg: '#1e261c' },
  },
  tablet: {
    // A grand marble tombstone: arched, a darker border, on a plinth, with room for a line under the name.
    paint(b) {
      const c = '#ddd8cc';
      b.add(G.box(), '#c4beb0', { pos: [0, 0.07, 0], scale: [0.96, 0.14, 0.34] });
      b.add(G.box(), '#bdb6a8', { pos: [0, 0.6, -0.005], scale: [0.82, 0.92, 0.16] });
      b.add(G.cyl(20), '#bdb6a8', { pos: [0, 1.06, -0.005], rot: [Math.PI / 2, 0, 0], scale: [0.41, 0.16, 0.41] });
      b.add(G.box(), c, { pos: [0, 0.6, 0], scale: [0.72, 0.84, 0.17] });
      b.add(G.cyl(20), c, { pos: [0, 1.04, 0], rot: [Math.PI / 2, 0, 0], scale: [0.35, 0.17, 0.35] });
      b.add(G.cone(4), '#bdb6a8', { pos: [0, 1.18, 0.088], rot: [Math.PI / 2, Math.PI / 4, 0], scale: [0.05, 0.005, 0.05] });
    },
    plate: { y: 0.66, z: 0.087, w: 0.64, h: 0.5, bg: '#ddd8cc', fg: '#2e2a24' },
  },
  pyramid: {
    // A little sandstone pyramid with a dark doorway, and a plaque standing in front.
    paint(b) {
      const sand = '#d9b26a';
      b.add(G.box(), '#c49a52', { pos: [0, 0.03, -0.1], scale: [0.82, 0.06, 0.82] });
      b.add(G.cone(4), sand, { pos: [0, 0.46, -0.1], rot: [0, Math.PI / 4, 0], scale: [0.56, 0.8, 0.56] });
      for (let i = 1; i < 4; i++) b.add(G.taper(0.98, 4), '#c8a05a', { pos: [0, 0.06 + i * 0.2, -0.1], rot: [0, Math.PI / 4, 0], scale: [0.56 * (1 - (i * 0.2) / 0.8) + 0.005, 0.01, 0.56 * (1 - (i * 0.2) / 0.8) + 0.005] });
      b.add(G.box(), '#3a2a1a', { pos: [0, 0.16, 0.18], rot: [0.45, 0, 0], scale: [0.12, 0.18, 0.04] });
      b.add(G.box(), '#c49a52', { pos: [0, 0.13, 0.42], rot: [-0.2, 0, 0], scale: [0.42, 0.24, 0.05] });
    },
    plate: { y: 0.13, z: 0.452, w: 0.38, h: 0.2, bg: '#c49a52', fg: '#3a2410', tilt: 0.2 },
  },
  angel: {
    // A weeping angel on a plinth: robed, head bowed into her hands, wings folded behind.
    paint(b) {
      const c = '#cfcfd2';
      b.add(G.box(), '#b8b8bc', { pos: [0, 0.18, 0], scale: [0.56, 0.36, 0.42] });
      b.add(G.box(), '#a8a8ae', { pos: [0, 0.37, 0], scale: [0.6, 0.04, 0.46] });
      b.add(G.taper(0.42), c, { pos: [0, 0.66, 0], scale: [0.2, 0.56, 0.18] });
      b.add(G.sphere(10, 8), c, { pos: [0, 0.98, 0.04], scale: [0.085, 0.095, 0.09] });
      for (const x of [-1, 1]) {
        b.add(G.sphere(8, 6), c, { pos: [x * 0.04, 0.96, 0.12], scale: [0.035, 0.05, 0.03] });
        rod(b, c, [x * 0.13, 0.9, 0.0], [x * 0.05, 0.93, 0.11], 0.03, 5);
        b.add(G.sphere(10, 8), '#dcdce0', { pos: [x * 0.12, 0.84, -0.13], rot: [0.35, x * 0.3, -x * 0.2], scale: [0.045, 0.26, 0.13] });
      }
    },
    plate: { y: 0.19, z: 0.212, w: 0.48, h: 0.24, bg: '#b8b8bc', fg: '#2a2a30' },
  },
  crystal: {
    // A cluster of glowing crystals rising out of a dark rock, with a plaque in front.
    paint(b, glow) {
      b.add(G.dodeca(), '#4a4652', { pos: [0, 0.14, -0.06], scale: [0.36, 0.2, 0.3] });
      const spikes: [number, number, number, number, number, string][] = [
        [0, -0.06, 0.1, 0.7, 0, '#9be7ff'],
        [-0.17, -0.02, 0.07, 0.42, 0.35, '#c7a6ff'],
        [0.16, -0.08, 0.07, 0.5, -0.3, '#a6c8ff'],
        [0.06, 0.08, 0.05, 0.3, -0.5, '#c7a6ff'],
        [-0.08, -0.18, 0.06, 0.36, 0.4, '#9be7ff'],
      ];
      for (const [x, z, r, h, lean, c] of spikes) {
        const m = new THREE.Matrix4().compose(new THREE.Vector3(x, 0.2, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(lean * 0.4, 0, -lean)), new THREE.Vector3(1, 1, 1));
        glow.add(hex, c, { pos: [0, h / 2, 0], scale: [r, h, r] }, m);
        glow.add(hexTip, '#eafaff', { pos: [0, h + r * 0.8, 0], scale: [r, r * 1.6, r] }, m);
      }
      b.add(G.box(), '#5a5662', { pos: [0, 0.1, 0.3], rot: [-0.2, 0, 0], scale: [0.4, 0.2, 0.05] });
    },
    plate: { y: 0.1, z: 0.332, w: 0.36, h: 0.17, bg: '#5a5662', fg: '#d8f4ff', tilt: 0.2 },
  },
  mausoleum: {
    // A little marble mausoleum: steps, a body with a dark door, four columns and a pediment.
    paint(b) {
      const c = '#e2ddd2';
      const d = '#c8c2b4';
      b.add(G.box(), d, { pos: [0, 0.06, 0], scale: [1.0, 0.12, 0.84] });
      b.add(G.box(), c, { pos: [0, 0.16, 0], scale: [0.9, 0.08, 0.74] });
      b.add(G.box(), c, { pos: [0, 0.55, -0.1], scale: [0.76, 0.72, 0.5] });
      b.add(G.box(), '#2a2622', { pos: [0, 0.46, 0.155], scale: [0.26, 0.5, 0.02] });
      for (const x of [-0.33, -0.18, 0.18, 0.33]) {
        b.add(G.cyl(10), c, { pos: [x, 0.55, 0.28], scale: [0.045, 0.72, 0.045] });
        b.add(G.box(), d, { pos: [x, 0.215, 0.28], scale: [0.1, 0.03, 0.1] });
      }
      b.add(G.box(), d, { pos: [0, 0.98, 0.04], scale: [0.86, 0.16, 0.62] });
      b.add(G.prism(), c, { pos: [0, 1.06, 0.04], rot: [0, Math.PI / 2, 0], scale: [0.64, 0.24, 0.88] });
    },
    plate: { y: 0.98, z: 0.355, w: 0.74, h: 0.13, bg: '#c8c2b4', fg: '#3a3630' },
  },
};

const graveGeos = new Map<string, { main: THREE.BufferGeometry; glow: THREE.BufferGeometry | null }>();

/** The shared geometry for a gravestone (null: the plain one), with any glowing part separately. */
export function graveGeometry(id: GraveId | null | undefined): { main: THREE.BufferGeometry; glow: THREE.BufferGeometry | null; plate: GravePlate } {
  const key = id && GRAVE_PAINT[id] ? id : 'plain';
  let g = graveGeos.get(key);
  if (!g) {
    const b = new Builder();
    const glow = new Builder();
    GRAVE_PAINT[key as GraveId].paint(b, glow);
    g = { main: b.geometry(), glow: glow.empty ? null : glow.geometry(0) };
    g.main.computeBoundingBox();
    graveGeos.set(key, g);
  }
  return { ...g, plate: GRAVE_PAINT[key as GraveId].plate };
}

/**
 * A dead player's stool once their ghost vote is spent: a low stone block to sit on, with their gravestone (small)
 * standing up behind it like a chair's back.
 */
const spentGeos = new Map<string, THREE.BufferGeometry>();
export function spentStoolGeometry(grave: GraveId | null | undefined): THREE.BufferGeometry {
  const key = grave ?? 'plain';
  let g = spentGeos.get(key);
  if (!g) {
    const b = new Builder();
    b.add(G.rbox(0.12), '#8f8a82', { pos: [0, 0.2, 0], scale: [0.6, 0.4, 0.46] });
    b.add(G.box(), '#a29c92', { pos: [0, 0.405, 0], scale: [0.54, 0.03, 0.4] });
    b.add(G.sphere(8, 5), '#6a8a4a', { pos: [0.2, 0.05, 0.2], scale: [0.12, 0.05, 0.08] });
    const box = graveGeometry(grave).main.boundingBox!;
    // (About chair-back height, so it shows above the seat.)
    const s = Math.min(0.9, 0.85 / Math.max(0.1, box.max.y), 0.62 / Math.max(0.1, box.max.x - box.min.x));
    // (Painted again, small, rather than copied: the finished stone has normals the block's parts don't.)
    const within = new Within(b, new THREE.Matrix4().compose(new THREE.Vector3(0, 0, -0.24 - box.max.z * s), new THREE.Quaternion(), new THREE.Vector3(s, s, s)));
    GRAVE_PAINT[grave ?? 'plain'].paint(within, within);
    spentGeos.set(key, (g = b.geometry()));
  }
  return g;
}

/** Paints into another builder, everything moved by a matrix first. */
class Within extends Builder {
  constructor(
    private outer: Builder,
    private m: THREE.Matrix4,
  ) {
    super();
  }
  add(geo: THREE.BufferGeometry, color: THREE.ColorRepresentation, p: Place | THREE.Matrix4 = {}, parent?: THREE.Matrix4): this {
    const m = p instanceof THREE.Matrix4 ? p.clone() : placeMatrix(p);
    if (parent) m.premultiply(parent);
    this.outer.add(geo, color, m.premultiply(this.m));
    return this;
  }
}

/** A little ghost to float by a dead player's stool while they still have their ghost vote: a sheet with two eyes. */
export function ghostGeometry(): THREE.BufferGeometry {
  const b = new Builder();
  b.add(G.sphere(12, 8), '#f4f8ff', { pos: [0, 0.1, 0], scale: [0.1, 0.1, 0.09] });
  b.add(G.taper(0.8), '#f4f8ff', { pos: [0, 0.03, 0], scale: [0.1, 0.14, 0.09] });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    b.add(G.cone(5), '#e6eefc', { pos: [Math.sin(a) * 0.08, -0.06, Math.cos(a) * 0.07], rot: [Math.PI, 0, 0], scale: [0.035, 0.05, 0.035] });
  }
  for (const x of [-0.035, 0.035]) b.add(G.sphere(6, 4), '#2a3050', { pos: [x, 0.12, 0.085], scale: [0.018, 0.026, 0.01] });
  return b.geometry();
}

// ---------------------------------------------------------------- ready to stand in the world

/** The materials every stool and gravestone shares (never freed). */
export const stoolMaterial = new THREE.MeshLambertMaterial({ vertexColors: true });
/** A crystal's glowing parts: unlit, so they shine at night. */
export const glowMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });

/** A stool on its own, for a picture of it. */
export function stoolObject(id: StoolId | null): THREE.Mesh {
  const m = new THREE.Mesh(stoolGeometry(id), stoolMaterial);
  m.userData.shared = true;
  return m;
}

/** A gravestone with the name (and the line under it, if any) on its plate. Its sign is freed by onDispose. */
export function graveObject(id: GraveId | null, name: string, epitaph = ''): THREE.Group {
  const group = new THREE.Group();
  const { main, glow, plate } = graveGeometry(id);
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material) => {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    // Every stone shares these, so taking one away mustn't free them.
    m.userData.shared = true;
    group.add(m);
  };
  add(main, stoolMaterial);
  if (glow) add(glow, glowMaterial);
  // The plate's canvas keeps the plate's shape, so the words have room whatever its size.
  const px = 512 / Math.max(plate.w, plate.h);
  const label = new TextSign({ w: Math.round(plate.w * px), h: Math.round(plate.h * px), bg: plate.bg, fg: plate.fg, size: Math.min(plate.h * px * 0.42, 110) }, epitaph ? [name, epitaph] : name);
  const { mesh } = signBoard(label, plate.w, plate.h);
  group.userData.onDispose = () => label.dispose();
  // (signBoard puts its faces 0.051 either side of the middle.)
  mesh.position.set(0, plate.y, plate.z - 0.05);
  mesh.rotation.x = -(plate.tilt ?? 0);
  const lean = new THREE.Group();
  lean.rotation.z = plate.roll ?? 0;
  lean.add(mesh);
  group.add(lean);
  return group;
}
