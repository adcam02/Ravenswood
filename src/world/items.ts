import * as THREE from 'three';
import { Builder, soft, type Vec3 } from './build';
import type { Item } from './types';

/**
 * Things animals carry. Each item is one small mesh, built so that its grip sits at the origin and it
 * stands upright, a little in front of the paw. The rig keeps the hand anchor level, so mugs don't spill.
 */

// Folded-card props to match the animals: few sides, flat facets. Little round bits get even fewer.
const SPH = new THREE.SphereGeometry(1, 10, 7);
const SPH_S = new THREE.SphereGeometry(1, 6, 4);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 10);
const CYL6 = new THREE.CylinderGeometry(1, 1, 1, 6);
const CONE = new THREE.ConeGeometry(1, 1, 8);
const BOX = new THREE.BoxGeometry(1, 1, 1);
const TORUS = new THREE.TorusGeometry(1, 0.28, 5, 12);
const THIN_TORUS = new THREE.TorusGeometry(1, 0.1, 3, 12);
const BASKET = new THREE.CylinderGeometry(1, 0.8, 1, 10);
const ICO = new THREE.IcosahedronGeometry(1, 0);

/** A round bit, with fewer sides when it's small. */
function ball(b: Builder, color: THREE.ColorRepresentation, p: { pos?: Vec3; rot?: Vec3; scale?: number | Vec3 }) {
  const sc = p.scale ?? 1;
  const big = typeof sc === 'number' ? sc : Math.max(...sc);
  b.add(big < 0.035 ? SPH_S : SPH, color, p);
}

const DRINK: Record<string, { cup: string; band: string; top: string; foam?: string }> = {
  ale: { cup: '#a8743f', band: '#5d5a5a', top: '#d98c2b', foam: '#fbf3df' },
  cider: { cup: '#cfe6e4', band: '#b6d3d0', top: '#f0c040' },
  milk: { cup: '#8fc1e8', band: '#6fa6d1', top: '#fbfaf5' },
  cocoa: { cup: '#e0605a', band: '#c24b47', top: '#6b3d26' },
};

function mug(b: Builder, kind: string) {
  const d = DRINK[kind] ?? DRINK.ale;
  const o: Vec3 = [0, 0.02, 0.07];
  // A rounder tankard: a slightly flared body, bands, a lip, and the handle toward the paw.
  b.add(BASKET, d.cup, { pos: [o[0], o[1] + 0.07, o[2]], scale: [0.068, 0.14, 0.068] });
  b.add(CYL, d.band, { pos: [o[0], o[1] + 0.02, o[2]], scale: [0.06, 0.018, 0.06] });
  b.add(CYL, d.band, { pos: [o[0], o[1] + 0.12, o[2]], scale: [0.07, 0.016, 0.07] });
  b.add(THIN_TORUS, d.band, { pos: [o[0], o[1] + 0.141, o[2]], rot: [Math.PI / 2, 0, 0], scale: 0.068 });
  b.add(CYL, d.top, { pos: [o[0], o[1] + 0.138, o[2]], scale: [0.062, 0.004, 0.062] });
  b.add(TORUS, d.cup, { pos: [o[0], o[1] + 0.075, o[2] - 0.07], rot: [0, Math.PI / 2, 0], scale: 0.035 });
  if (d.foam) {
    ball(b, d.foam, { pos: [o[0], o[1] + 0.15, o[2]], scale: [0.068, 0.035, 0.068] });
    ball(b, d.foam, { pos: [o[0] + 0.045, o[1] + 0.13, o[2] + 0.03], scale: [0.025, 0.04, 0.025] });
    for (const [dx, dz, s] of [
      [-0.03, 0.03, 0.018],
      [0.02, -0.035, 0.014],
      [-0.01, -0.01, 0.012],
    ]) ball(b, '#ffffff', { pos: [o[0] + dx, o[1] + 0.175, o[2] + dz], scale: s });
    ball(b, d.foam, { pos: [o[0] - 0.05, o[1] + 0.105, o[2] - 0.02], scale: [0.018, 0.045, 0.018] });
  }
  if (kind === 'cocoa') {
    b.add(BOX, '#fffaf2', { pos: [o[0] + 0.015, o[1] + 0.15, o[2]], rot: [0.3, 0.5, 0.2], scale: 0.028 });
    b.add(BOX, '#fffaf2', { pos: [o[0] - 0.02, o[1] + 0.148, o[2] + 0.015], rot: [0.1, 0.9, 0.4], scale: 0.025 });
  }
}

function bake(b: Builder, kind: string) {
  const o: Vec3 = [0, 0.03, 0.08];
  if (kind === 'loaf') {
    ball(b, '#c98a45', { pos: o, scale: [0.07, 0.06, 0.13] });
    for (const z of [-0.06, 0, 0.06]) b.add(BOX, '#f0cf8e', { pos: [o[0], o[1] + 0.055, o[2] + z], rot: [0, 0.6, 0], scale: [0.07, 0.012, 0.016] });
  } else if (kind === 'pie') {
    b.add(CYL, '#d9d4cc', { pos: [o[0], o[1], o[2]], scale: [0.13, 0.02, 0.13] });
    b.add(CYL, '#d9a050', { pos: [o[0], o[1] + 0.025, o[2]], scale: [0.115, 0.04, 0.115] });
    for (const x of [-0.05, 0, 0.05]) {
      b.add(BOX, '#f0c878', { pos: [o[0] + x, o[1] + 0.05, o[2]], scale: [0.016, 0.01, 0.2] });
      b.add(BOX, '#f0c878', { pos: [o[0], o[1] + 0.052, o[2] + x], scale: [0.2, 0.01, 0.016] });
    }
    ball(b, '#8a2a3a', { pos: [o[0] + 0.025, o[1] + 0.048, o[2] + 0.025], scale: 0.018 });
  } else {
    ball(b, '#d18b46', { pos: o, scale: [0.08, 0.06, 0.08] });
    ball(b, '#e9a85a', { pos: [o[0], o[1] + 0.025, o[2]], scale: [0.065, 0.04, 0.065] });
    b.add(BOX, '#fffaf2', { pos: [o[0], o[1] + 0.062, o[2]], scale: [0.09, 0.01, 0.018] });
    b.add(BOX, '#fffaf2', { pos: [o[0], o[1] + 0.062, o[2]], scale: [0.018, 0.01, 0.09] });
  }
}

function fish(b: Builder) {
  const o: Vec3 = [0, 0.08, 0.08];
  ball(b, '#7fa8c8', { pos: o, scale: [0.045, 0.07, 0.15] });
  ball(b, '#dfe8ee', { pos: [o[0], o[1] - 0.02, o[2] + 0.01], scale: [0.038, 0.045, 0.12] });
  // A forked tail, a dorsal fin, pectoral fins, gill lines, scales down the flank, and eyes with a glint.
  for (const s of [-1, 1]) b.add(CONE, '#5f86a8', { pos: [o[0], o[1] + s * 0.03, o[2] - 0.18], rot: [-Math.PI / 2 + s * 0.5, 0, 0], scale: [0.045, 0.07, 0.012] });
  b.add(CONE, '#5f86a8', { pos: [o[0], o[1] + 0.07, o[2] - 0.01], scale: [0.04, 0.05, 0.01] });
  b.add(CONE, '#5f86a8', { pos: [o[0], o[1] + 0.055, o[2] - 0.07], rot: [-0.5, 0, 0], scale: [0.025, 0.035, 0.008] });
  for (const s of [-1, 1]) {
    b.add(CONE, '#6f98b8', { pos: [o[0] + s * 0.045, o[1] - 0.01, o[2] + 0.03], rot: [0.6, 0, s * 1.3], scale: [0.02, 0.05, 0.008] });
    b.add(THIN_TORUS, '#6a90ae', { pos: [o[0] + s * 0.04, o[1], o[2] + 0.07], rot: [0, Math.PI / 2, 0], scale: [0.035, 0.035, 0.02] });
    ball(b, '#f6f1e6', { pos: [o[0] + s * 0.036, o[1] + 0.02, o[2] + 0.1], scale: [0.009, 0.013, 0.013] });
    ball(b, '#1d1a1c', { pos: [o[0] + s * 0.042, o[1] + 0.02, o[2] + 0.102], scale: [0.005, 0.008, 0.008] });
    for (let k = 0; k < 3; k++) b.add(THIN_TORUS, '#6f98b8', { pos: [o[0] + s * 0.044, o[1] + 0.01 + (k % 2) * 0.02, o[2] - 0.02 - k * 0.018], rot: [0, Math.PI / 2, 0], scale: [0.012, 0.012, 0.01] });
  }
  ball(b, '#d86a5a', { pos: [o[0], o[1] - 0.01, o[2] + 0.148], scale: [0.02, 0.012, 0.008] });
}

function flower(b: Builder, color: string) {
  const o: Vec3 = [0, 0, 0.06];
  b.add(CYL6, '#4f9a4a', { pos: [o[0], o[1] + 0.13, o[2]], scale: [0.008, 0.26, 0.008] });
  // Two leaves with a midrib, petals in two rows, and a dotted centre.
  for (const [s, y, a] of [
    [1, 0.12, -0.6],
    [-1, 0.07, 0.5],
  ]) {
    ball(b, '#5fae55', { pos: [o[0] + s * 0.03, o[1] + y, o[2]], rot: [0, 0, a], scale: [0.014, 0.04, 0.022] });
    b.add(BOX, '#4f9a4a', { pos: [o[0] + s * 0.03, o[1] + y, o[2] + 0.02], rot: [0, 0, a], scale: [0.003, 0.06, 0.002] });
  }
  const top: Vec3 = [o[0], o[1] + 0.27, o[2]];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ball(b, color, { pos: [top[0] + Math.cos(a) * 0.04, top[1] + Math.sin(a) * 0.04, top[2]], rot: [0, 0, a], scale: [0.03, 0.018, 0.012] });
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    ball(b, color, { pos: [top[0] + Math.cos(a) * 0.022, top[1] + Math.sin(a) * 0.022, top[2] + 0.008], rot: [0, 0, a], scale: [0.02, 0.014, 0.01] });
  }
  ball(b, '#f6d04d', { pos: [top[0], top[1], top[2] + 0.012], scale: 0.018 });
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ball(b, '#c9a020', { pos: [top[0] + Math.cos(a) * 0.01, top[1] + Math.sin(a) * 0.01, top[2] + 0.028], scale: 0.004 });
  }
}

function rod(b: Builder) {
  // The rod leans forward, up and out to the side from the paw (clear of the head), with the line hanging
  // from its tip.
  const len = 1.4;
  const tilt = 0.9;
  const out = 0.32;
  const dir = new THREE.Vector3(-Math.sin(out) * Math.cos(tilt), Math.cos(tilt), Math.sin(tilt)).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const rot = new THREE.Euler().setFromQuaternion(q);
  const mid = dir.clone().multiplyScalar(len / 2);
  b.add(CYL6, '#8a5a36', { pos: [mid.x, mid.y, mid.z], rot: [rot.x, rot.y, rot.z], scale: [0.012, len, 0.012] });
  const grip = dir.clone().multiplyScalar(0.02);
  b.add(CYL6, '#4d3528', { pos: [grip.x, grip.y + 0.01, grip.z + 0.01], rot: [rot.x, rot.y, rot.z], scale: [0.02, 0.18, 0.02] });
  b.add(TORUS, '#9aa0a8', { pos: [0.025, 0.12, 0.08], rot: [0, Math.PI / 2, 0], scale: 0.025 });
  const tip = dir.clone().multiplyScalar(len);
  b.add(CYL6, '#f4efe6', { pos: [tip.x, tip.y - 0.35, tip.z], scale: [0.003, 0.7, 0.003] });
  ball(b, '#e0605a', { pos: [tip.x, tip.y - 0.71, tip.z], scale: [0.03, 0.025, 0.03] });
  ball(b, '#fbfaf5', { pos: [tip.x, tip.y - 0.685, tip.z], scale: [0.026, 0.018, 0.026] });
}

function can(b: Builder) {
  const o: Vec3 = [0, 0.02, 0.1];
  // A tin can with a rolled rim, a spout ending in a rose with holes, and a carrying handle.
  b.add(CYL, '#6fa88a', { pos: [o[0], o[1] + 0.07, o[2]], scale: [0.075, 0.14, 0.075] });
  b.add(THIN_TORUS, '#5a8f73', { pos: [o[0], o[1] + 0.142, o[2]], rot: [Math.PI / 2, 0, 0], scale: 0.078 });
  b.add(THIN_TORUS, '#5a8f73', { pos: [o[0], o[1] + 0.005, o[2]], rot: [Math.PI / 2, 0, 0], scale: 0.078 });
  b.add(CYL, '#5a8f73', { pos: [o[0], o[1] + 0.142, o[2]], scale: [0.07, 0.008, 0.07] });
  b.add(CYL, '#4a4a52', { pos: [o[0], o[1] + 0.146, o[2] - 0.02], scale: [0.035, 0.006, 0.035] });
  b.add(CYL6, '#6fa88a', { pos: [o[0], o[1] + 0.1, o[2] + 0.12], rot: [0.9, 0, 0], scale: [0.016, 0.16, 0.016] });
  b.add(CONE, '#5a8f73', { pos: [o[0], o[1] + 0.155, o[2] + 0.18], rot: [-2.25, 0, 0], scale: [0.03, 0.04, 0.03] });
  b.add(CYL, '#4a7a62', { pos: [o[0], o[1] + 0.17, o[2] + 0.192], rot: [-2.25, 0, 0], scale: [0.03, 0.006, 0.03] });
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2;
    const rr = k === 0 ? 0 : 0.018;
    ball(b, '#2a2a30', { pos: [o[0] + Math.cos(a) * rr, o[1] + 0.172 + Math.sin(a) * rr * 0.62, o[2] + 0.196 + Math.sin(a) * rr * 0.78], scale: 0.004 });
  }
  b.add(TORUS, '#5a8f73', { pos: [o[0], o[1] + 0.16, o[2] - 0.02], rot: [0, Math.PI / 2, 0], scale: [0.06, 0.06, 0.06] });
  b.add(CYL6, '#8a5a36', { pos: [o[0], o[1] + 0.22, o[2] - 0.02], rot: [0, 0, Math.PI / 2], scale: [0.012, 0.05, 0.012] });
}

function washing(b: Builder, color: string) {
  const o: Vec3 = [0, 0.02, 0.12];
  // A woven basket: the body, upright staves round it, a couple of woven bands and a rolled rim.
  b.add(BASKET, '#c9a46a', { pos: [o[0], o[1] + 0.06, o[2]], scale: [0.14, 0.12, 0.11] });
  for (let k = 0; k < 14; k++) {
    const a = (k / 14) * Math.PI * 2;
    b.add(BOX, k % 2 ? '#b8924f' : '#d6b47a', { pos: [o[0] + Math.cos(a) * 0.14, o[1] + 0.06, o[2] + Math.sin(a) * 0.11], rot: [0, -a, 0], scale: [0.012, 0.11, 0.025] });
  }
  for (const y of [0.035, 0.085]) b.add(THIN_TORUS, '#a8834f', { pos: [o[0], o[1] + y, o[2]], rot: [Math.PI / 2, 0, 0], scale: [0.143, 0.112, 0.08] });
  b.add(TORUS, '#a8834f', { pos: [o[0], o[1] + 0.12, o[2]], rot: [Math.PI / 2, 0, 0], scale: [0.14, 0.11, 0.05] });
  ball(b, color, { pos: [o[0] - 0.05, o[1] + 0.14, o[2]], scale: [0.07, 0.04, 0.06] });
  ball(b, '#f4efe6', { pos: [o[0] + 0.05, o[1] + 0.145, o[2] + 0.02], scale: [0.06, 0.035, 0.055] });
  ball(b, '#8fc1e8', { pos: [o[0] + 0.01, o[1] + 0.155, o[2] - 0.04], scale: [0.05, 0.03, 0.04] });
}

/**
 * The Storyteller's grimoire: a leather book that lies in the paw and opens like a real one. The mesh's
 * `userData.setOpen(t)` swings the front half over, 0 closed to 1 open.
 */
function grimoire(open: boolean): THREE.Object3D {
  const g = new THREE.Group();
  const hw = 0.19;
  const d = 0.28;
  const th = 0.035;
  const leather = '#3b2a36';
  const trim = '#c9a24f';
  const pages = '#efe3c6';
  const ink = '#2a1d12';
  const half = (sign: number) => {
    const b = new Builder();
    const cx = (sign * hw) / 2;
    b.add(BOX, leather, { pos: [cx, -0.006, d / 2], scale: [hw + 0.012, 0.012, d + 0.016] });
    b.add(BOX, pages, { pos: [cx, th / 2, d / 2], scale: [hw - 0.006, th, d - 0.01] });
    // The circle of seats, inked onto the open page.
    b.add(TORUS, ink, { pos: [cx, th + 0.002, d / 2], rot: [Math.PI / 2, 0, 0], scale: [0.055, 0.055, 0.004] });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + (sign > 0 ? 0.4 : 1.1);
      b.add(CYL6, ink, { pos: [cx + Math.cos(a) * 0.055, th + 0.003, d / 2 + Math.sin(a) * 0.055], scale: [0.009, 0.003, 0.009] });
    }
    for (const z of [0.05, 0.08, 0.2, 0.23]) b.add(BOX, ink, { pos: [cx, th + 0.002, z], scale: [hw * 0.6, 0.002, 0.004] });
    return b.mesh(soft(), { cast: true, receive: false });
  };
  const right = half(1);
  const left = new THREE.Group();
  left.add(half(-1));
  left.position.y = th;
  // The cover's outside, seen when the book is shut, with a clasp and a raven.
  const cover = new Builder();
  cover.add(BOX, trim, { pos: [-hw / 2, -0.015, d / 2], scale: [hw * 0.72, 0.004, d * 0.78] });
  cover.add(BOX, leather, { pos: [-hw / 2, -0.018, d / 2], scale: [hw * 0.62, 0.004, d * 0.68] });
  cover.add(SPH, trim, { pos: [-hw / 2, -0.02, d / 2], scale: [0.03, 0.004, 0.022] });
  cover.add(BOX, trim, { pos: [-hw + 0.01, 0.0, d / 2], scale: [0.03, th + 0.02, 0.05] });
  left.add(cover.mesh(soft(), { cast: true, receive: false }));
  // Spine.
  const spine = new Builder();
  spine.add(BOX, leather, { pos: [0, th / 2, d / 2], scale: [0.03, th + 0.02, d + 0.016] });
  g.add(right, left, spine.mesh(soft(), { cast: true, receive: false }));
  // Held a little forward of the paw, pages up, and big enough to read from over the shoulder.
  g.position.set(0, 0.02, 0.04);
  g.scale.setScalar(1.35);
  const setOpen = (t: number) => {
    const k = Math.max(0, Math.min(1, t));
    left.rotation.z = Math.PI * (1 - k);
  };
  setOpen(open ? 1 : 0);
  g.userData.setOpen = setOpen;
  g.name = 'item:grimoire';
  return g;
}

function bucket(b: Builder) {
  // Hung from its handle: the top of the handle is the grip.
  const o: Vec3 = [0, -0.25, 0.02];
  b.add(BASKET, '#8a6a4a', { pos: [o[0], o[1] + 0.07, o[2]], scale: [0.09, 0.14, 0.09] });
  b.add(CYL, '#5a4030', { pos: [o[0], o[1] + 0.13, o[2]], scale: [0.095, 0.015, 0.095] });
  b.add(CYL, '#5a4030', { pos: [o[0], o[1] + 0.03, o[2]], scale: [0.08, 0.015, 0.08] });
  b.add(CYL, '#6fb0e0', { pos: [o[0], o[1] + 0.125, o[2]], scale: [0.078, 0.006, 0.078] });
  b.add(TORUS, '#9aa0a8', { pos: [o[0], o[1] + 0.16, o[2]], rot: [0, 0, 0], scale: [0.08, 0.08, 0.03] });
}

function goblet(b: Builder) {
  const o: Vec3 = [0, 0.02, 0.08];
  b.add(CYL, '#c9a24f', { pos: [o[0], o[1] + 0.01, o[2]], scale: [0.05, 0.02, 0.05] });
  b.add(THIN_TORUS, '#e0bf6a', { pos: [o[0], o[1] + 0.02, o[2]], rot: [Math.PI / 2, 0, 0], scale: 0.045 });
  b.add(CYL6, '#c9a24f', { pos: [o[0], o[1] + 0.06, o[2]], scale: [0.012, 0.08, 0.012] });
  ball(b, '#c9a24f', { pos: [o[0], o[1] + 0.06, o[2]], scale: 0.02 });
  b.add(BASKET, '#c9a24f', { pos: [o[0], o[1] + 0.14, o[2]], scale: [0.055, 0.09, 0.055] });
  b.add(THIN_TORUS, '#e0bf6a', { pos: [o[0], o[1] + 0.185, o[2]], rot: [Math.PI / 2, 0, 0], scale: 0.055 });
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2;
    b.add(ICO, '#a8463f', { pos: [o[0] + Math.cos(a) * 0.052, o[1] + 0.13, o[2] + Math.sin(a) * 0.052], scale: 0.008 });
  }
  b.add(CYL, '#7a1f2e', { pos: [o[0], o[1] + 0.175, o[2]], scale: [0.048, 0.006, 0.048] });
}

function firewood(b: Builder) {
  const o: Vec3 = [0, 0.03, 0.1];
  for (const [dx, dy] of [
    [-0.03, 0],
    [0.03, 0],
    [0, 0.05],
  ]) {
    b.add(CYL6, '#9a6a43', { pos: [o[0] + dx, o[1] + dy, o[2]], rot: [Math.PI / 2, 0, 0], scale: [0.028, 0.22, 0.028] });
  }
  b.add(TORUS, '#d8c8a0', { pos: [o[0], o[1] + 0.02, o[2]], rot: [Math.PI / 2, 0, 0], scale: [0.06, 0.06, 0.02] });
}

export function buildItem(item: Item): THREE.Object3D {
  if (item.k === 'grimoire') return grimoire(item.c === 'open');
  const b = new Builder();
  switch (item.k) {
    case 'ale':
    case 'cider':
    case 'milk':
    case 'cocoa':
      mug(b, item.k);
      break;
    case 'loaf':
    case 'pie':
    case 'bun':
      bake(b, item.k);
      break;
    case 'fish':
      fish(b);
      break;
    case 'flower':
      flower(b, item.c ?? '#f39ab5');
      break;
    case 'rod':
      rod(b);
      break;
    case 'can':
      can(b);
      break;
    case 'washing':
      washing(b, item.c ?? '#e0605a');
      break;
    case 'water':
      bucket(b);
      break;
    case 'wine':
      goblet(b);
      break;
    case 'firewood':
      firewood(b);
      break;
  }
  const mesh = b.mesh(soft(), { cast: true, receive: false });
  mesh.name = `item:${item.k}`;
  return mesh;
}

/**
 * Frees what an object made for itself. Meshes marked `userData.shared` use geometry and materials that others
 * use too, so they're left alone; `userData.onDispose` frees anything else it made (a sign's canvas, say).
 */
export function disposeObject(obj: THREE.Object3D) {
  obj.traverse((o) => {
    (o.userData.onDispose as (() => void) | undefined)?.();
    if (o.userData.shared) return;
    const m = o as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
    else mat?.dispose();
  });
}
