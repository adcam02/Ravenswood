import * as THREE from 'three';
import { Builder, soft, type Vec3 } from './build';
import type { Item } from './types';

/**
 * Things animals carry. Each item is one small mesh, built so that its grip sits at the origin and it
 * stands upright, a little in front of the paw. The rig keeps the hand anchor level, so mugs don't spill.
 */

const SPH = new THREE.SphereGeometry(1, 10, 8);
const CYL = new THREE.CylinderGeometry(1, 1, 1, 10);
const CYL6 = new THREE.CylinderGeometry(1, 1, 1, 6);
const CONE = new THREE.ConeGeometry(1, 1, 8);
const BOX = new THREE.BoxGeometry(1, 1, 1);
const TORUS = new THREE.TorusGeometry(1, 0.28, 5, 10);
const BASKET = new THREE.CylinderGeometry(1, 0.8, 1, 10);

const DRINK: Record<string, { cup: string; band: string; top: string; foam?: string }> = {
  ale: { cup: '#a8743f', band: '#5d5a5a', top: '#d98c2b', foam: '#fbf3df' },
  cider: { cup: '#cfe6e4', band: '#b6d3d0', top: '#f0c040' },
  milk: { cup: '#8fc1e8', band: '#6fa6d1', top: '#fbfaf5' },
  cocoa: { cup: '#e0605a', band: '#c24b47', top: '#6b3d26' },
};

function mug(b: Builder, kind: string) {
  const d = DRINK[kind] ?? DRINK.ale;
  const o: Vec3 = [0, 0.02, 0.07];
  b.add(CYL, d.cup, { pos: [o[0], o[1] + 0.07, o[2]], scale: [0.065, 0.14, 0.065] });
  b.add(CYL, d.band, { pos: [o[0], o[1] + 0.025, o[2]], scale: [0.068, 0.018, 0.068] });
  b.add(CYL, d.band, { pos: [o[0], o[1] + 0.115, o[2]], scale: [0.068, 0.018, 0.068] });
  b.add(CYL, d.top, { pos: [o[0], o[1] + 0.141, o[2]], scale: [0.058, 0.004, 0.058] });
  // The handle faces the paw.
  b.add(TORUS, d.cup, { pos: [o[0], o[1] + 0.075, o[2] - 0.07], rot: [0, Math.PI / 2, 0], scale: 0.035 });
  if (d.foam) {
    b.add(SPH, d.foam, { pos: [o[0], o[1] + 0.15, o[2]], scale: [0.068, 0.035, 0.068] });
    b.add(SPH, d.foam, { pos: [o[0] + 0.045, o[1] + 0.13, o[2] + 0.03], scale: [0.025, 0.04, 0.025] });
  }
  if (kind === 'cocoa') {
    b.add(BOX, '#fffaf2', { pos: [o[0] + 0.015, o[1] + 0.15, o[2]], rot: [0.3, 0.5, 0.2], scale: 0.028 });
    b.add(BOX, '#fffaf2', { pos: [o[0] - 0.02, o[1] + 0.148, o[2] + 0.015], rot: [0.1, 0.9, 0.4], scale: 0.025 });
  }
}

function bake(b: Builder, kind: string) {
  const o: Vec3 = [0, 0.03, 0.08];
  if (kind === 'loaf') {
    b.add(SPH, '#c98a45', { pos: o, scale: [0.07, 0.06, 0.13] });
    for (const z of [-0.06, 0, 0.06]) b.add(BOX, '#f0cf8e', { pos: [o[0], o[1] + 0.055, o[2] + z], rot: [0, 0.6, 0], scale: [0.07, 0.012, 0.016] });
  } else if (kind === 'pie') {
    b.add(CYL, '#d9d4cc', { pos: [o[0], o[1], o[2]], scale: [0.13, 0.02, 0.13] });
    b.add(CYL, '#d9a050', { pos: [o[0], o[1] + 0.025, o[2]], scale: [0.115, 0.04, 0.115] });
    for (const x of [-0.05, 0, 0.05]) {
      b.add(BOX, '#f0c878', { pos: [o[0] + x, o[1] + 0.05, o[2]], scale: [0.016, 0.01, 0.2] });
      b.add(BOX, '#f0c878', { pos: [o[0], o[1] + 0.052, o[2] + x], scale: [0.2, 0.01, 0.016] });
    }
    b.add(SPH, '#8a2a3a', { pos: [o[0] + 0.025, o[1] + 0.048, o[2] + 0.025], scale: 0.018 });
  } else {
    b.add(SPH, '#d18b46', { pos: o, scale: [0.08, 0.06, 0.08] });
    b.add(SPH, '#e9a85a', { pos: [o[0], o[1] + 0.025, o[2]], scale: [0.065, 0.04, 0.065] });
    b.add(BOX, '#fffaf2', { pos: [o[0], o[1] + 0.062, o[2]], scale: [0.09, 0.01, 0.018] });
    b.add(BOX, '#fffaf2', { pos: [o[0], o[1] + 0.062, o[2]], scale: [0.018, 0.01, 0.09] });
  }
}

function fish(b: Builder) {
  const o: Vec3 = [0, 0.08, 0.08];
  b.add(SPH, '#7fa8c8', { pos: o, scale: [0.045, 0.07, 0.15] });
  b.add(SPH, '#dfe8ee', { pos: [o[0], o[1] - 0.02, o[2] + 0.01], scale: [0.038, 0.045, 0.12] });
  b.add(CONE, '#5f86a8', { pos: [o[0], o[1], o[2] - 0.17], rot: [-Math.PI / 2, 0, 0], scale: [0.07, 0.07, 0.015] });
  b.add(CONE, '#5f86a8', { pos: [o[0], o[1] + 0.07, o[2] - 0.01], scale: [0.04, 0.05, 0.01] });
  for (const s of [-1, 1]) {
    b.add(SPH, '#1d1a1c', { pos: [o[0] + s * 0.034, o[1] + 0.02, o[2] + 0.1], scale: [0.006, 0.01, 0.01] });
  }
}

function flower(b: Builder, color: string) {
  const o: Vec3 = [0, 0, 0.06];
  b.add(CYL6, '#4f9a4a', { pos: [o[0], o[1] + 0.13, o[2]], scale: [0.008, 0.26, 0.008] });
  b.add(SPH, '#5fae55', { pos: [o[0] + 0.03, o[1] + 0.12, o[2]], rot: [0, 0, -0.6], scale: [0.012, 0.035, 0.02] });
  const top: Vec3 = [o[0], o[1] + 0.27, o[2]];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.add(SPH, color, { pos: [top[0] + Math.cos(a) * 0.035, top[1] + Math.sin(a) * 0.035, top[2]], scale: [0.03, 0.03, 0.014] });
  }
  b.add(SPH, '#f6d04d', { pos: [top[0], top[1], top[2] + 0.01], scale: 0.022 });
}

function rod(b: Builder) {
  // The rod leans forward and up from the paw, with the line hanging from its tip.
  const len = 1.4;
  const tilt = 0.9;
  const dir = new THREE.Vector3(0, Math.cos(tilt), Math.sin(tilt));
  const mid = dir.clone().multiplyScalar(len / 2);
  b.add(CYL6, '#8a5a36', { pos: [mid.x, mid.y, mid.z], rot: [tilt, 0, 0], scale: [0.012, len, 0.012] });
  b.add(CYL6, '#4d3528', { pos: [0, 0.02, 0.02], rot: [tilt, 0, 0], scale: [0.02, 0.18, 0.02] });
  b.add(TORUS, '#9aa0a8', { pos: [0.025, 0.12, 0.08], rot: [0, Math.PI / 2, 0], scale: 0.025 });
  const tip = dir.clone().multiplyScalar(len);
  b.add(CYL6, '#f4efe6', { pos: [tip.x, tip.y - 0.35, tip.z], scale: [0.003, 0.7, 0.003] });
  b.add(SPH, '#e0605a', { pos: [tip.x, tip.y - 0.71, tip.z], scale: [0.03, 0.025, 0.03] });
  b.add(SPH, '#fbfaf5', { pos: [tip.x, tip.y - 0.685, tip.z], scale: [0.026, 0.018, 0.026] });
}

function can(b: Builder) {
  const o: Vec3 = [0, 0.02, 0.1];
  b.add(CYL, '#6fa88a', { pos: [o[0], o[1] + 0.07, o[2]], scale: [0.075, 0.14, 0.075] });
  b.add(CYL, '#5a8f73', { pos: [o[0], o[1] + 0.142, o[2]], scale: [0.078, 0.012, 0.078] });
  b.add(CYL6, '#6fa88a', { pos: [o[0], o[1] + 0.1, o[2] + 0.12], rot: [0.9, 0, 0], scale: [0.016, 0.16, 0.016] });
  b.add(CONE, '#5a8f73', { pos: [o[0], o[1] + 0.155, o[2] + 0.18], rot: [-2.25, 0, 0], scale: [0.03, 0.04, 0.03] });
  b.add(TORUS, '#5a8f73', { pos: [o[0], o[1] + 0.16, o[2] - 0.02], rot: [0, Math.PI / 2, 0], scale: [0.06, 0.06, 0.06] });
}

function washing(b: Builder, color: string) {
  const o: Vec3 = [0, 0.02, 0.12];
  b.add(BASKET, '#c9a46a', { pos: [o[0], o[1] + 0.06, o[2]], scale: [0.14, 0.12, 0.11] });
  b.add(CYL, '#a8834f', { pos: [o[0], o[1] + 0.12, o[2]], scale: [0.145, 0.015, 0.115] });
  b.add(SPH, color, { pos: [o[0] - 0.05, o[1] + 0.14, o[2]], scale: [0.07, 0.04, 0.06] });
  b.add(SPH, '#f4efe6', { pos: [o[0] + 0.05, o[1] + 0.145, o[2] + 0.02], scale: [0.06, 0.035, 0.055] });
  b.add(SPH, '#8fc1e8', { pos: [o[0] + 0.01, o[1] + 0.155, o[2] - 0.04], scale: [0.05, 0.03, 0.04] });
}

export function buildItem(item: Item): THREE.Object3D {
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
  }
  const mesh = b.mesh(soft(), { cast: true, receive: false });
  mesh.name = `item:${item.k}`;
  return mesh;
}

export function disposeObject(obj: THREE.Object3D) {
  obj.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
    else mat?.dispose();
  });
}
