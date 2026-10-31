import * as THREE from 'three';
import { Builder, matte } from '../build';
import { G } from '../town/kit';

/**
 * The Slayer's kit (see slay.ts): chunky painted shapes like the execution props, each held at its origin (the grip)
 * and pointing along +z, with the moving parts as groups of their own.
 */

const WOOD = '#6a4630';
const DARK_WOOD = '#4a3020';
const IRON = '#34333c';
const STEEL = '#d4dbe4';
const GOLD = '#e2b440';
const ROPE = '#c9a46a';

const mesh = (b: Builder, material: THREE.Material = matte()) => b.mesh(material, { cast: true, receive: false });

export interface Crossbow {
  group: THREE.Group;
  /** The bolt, loaded (it's taken out of the bow to fly). */
  bolt: THREE.Group;
  /** Where the bolt sits, in the bow's frame. */
  nock: THREE.Vector3;
}

export function crossbow(): Crossbow {
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.rbox(0.2), WOOD, { pos: [0, 0, 0.12], scale: [0.07, 0.08, 0.5] });
  b.add(G.rbox(0.2), DARK_WOOD, { pos: [0, -0.07, -0.04], rot: [0.5, 0, 0], scale: [0.05, 0.14, 0.06] });
  // The bow across the front, swept back, and its string.
  for (const sx of [-1, 1]) {
    b.add(G.cyl(8), DARK_WOOD, { pos: [sx * 0.14, 0.02, 0.33], rot: [0, 0, sx * (Math.PI / 2 - 0.35)], scale: [0.022, 0.3, 0.022] });
    b.add(G.cyl(5), '#f0e6d0', { pos: [sx * 0.135, 0.02, 0.2], rot: [Math.PI / 2, 0, sx * -1.15], scale: [0.006, 0.31, 0.006] });
  }
  b.add(G.sphere(8, 6), GOLD, { pos: [0, 0.02, 0.37], scale: 0.035 });
  group.add(mesh(b));
  const bolt = new THREE.Group();
  const k = new Builder();
  k.add(G.cyl(6), '#8a6a44', { pos: [0, 0, 0.21], rot: [Math.PI / 2, 0, 0], scale: [0.012, 0.42, 0.012] });
  k.add(G.cone(6), IRON, { pos: [0, 0, 0.45], rot: [Math.PI / 2, 0, 0], scale: [0.03, 0.07, 0.03] });
  for (const r of [0, Math.PI / 2]) k.add(G.box(), '#d8402f', { pos: [0, 0, 0.04], rot: [0, 0, r], scale: [0.07, 0.006, 0.08] });
  bolt.add(mesh(k));
  const nock = new THREE.Vector3(0, 0.055, 0.0);
  bolt.position.copy(nock);
  group.add(bolt);
  return { group, bolt, nock };
}

/** A water balloon, tied at the bottom (its own size: scale it). */
export function balloon(color: string): THREE.Group {
  const b = new Builder();
  b.add(G.sphere(14, 10), color, { pos: [0, 0.13, 0], scale: [0.13, 0.15, 0.13] });
  b.add(G.cone(8), color, { pos: [0, -0.01, 0], scale: [0.03, 0.05, 0.03] });
  const material = new THREE.MeshLambertMaterial({ vertexColors: true, emissive: '#223040', transparent: true, opacity: 0.88 });
  return new THREE.Group().add(mesh(b, material));
}

/** A frying pan, held by the handle, the pan standing on its edge so the flat of it swings into things. */
export function fryingPan(): THREE.Group {
  const b = new Builder();
  b.add(G.rbox(0.3), DARK_WOOD, { pos: [0, 0, 0.12], scale: [0.045, 0.04, 0.3] });
  b.add(G.cyl(18), IRON, { pos: [0, 0, 0.47], rot: [0, 0, Math.PI / 2], scale: [0.21, 0.05, 0.21] });
  b.add(G.cyl(18), '#55545e', { pos: [0.004, 0, 0.47], rot: [0, 0, Math.PI / 2], scale: [0.18, 0.05, 0.18] });
  return new THREE.Group().add(mesh(b));
}

export interface Sword {
  group: THREE.Group;
  /** The blade in three pieces, each hung from the one before, to bend it like rubber. */
  segs: THREE.Group[];
}

export function sword(): Sword {
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.cyl(8), '#7a2a2a', { pos: [0, 0, -0.04], rot: [Math.PI / 2, 0, 0], scale: [0.025, 0.14, 0.025] });
  b.add(G.sphere(8, 6), GOLD, { pos: [0, 0, -0.12], scale: 0.035 });
  b.add(G.rbox(0.3), GOLD, { pos: [0, 0, 0.04], scale: [0.24, 0.04, 0.045] });
  group.add(mesh(b));
  const segs: THREE.Group[] = [];
  let parent: THREE.Object3D = group;
  for (let i = 0; i < 3; i++) {
    const seg = new THREE.Group();
    seg.position.set(0, 0, i === 0 ? 0.06 : 0.2);
    const s = new Builder();
    s.add(G.box(), STEEL, { pos: [0, 0, 0.1], scale: [0.06 - i * 0.008, 0.014, 0.2] });
    if (i === 2) s.add(G.cone(4), STEEL, { pos: [0, 0, 0.23], rot: [Math.PI / 2, Math.PI / 4, 0], scale: [0.035, 0.07, 0.01] });
    seg.add(mesh(s));
    parent.add(seg);
    segs.push(seg);
    parent = seg;
  }
  return { group, segs };
}

/** A giant wooden mallet: the handle along +z from the grip, the head across the end. `len` is the handle's length. */
export function mallet(len: number): THREE.Group {
  const b = new Builder();
  b.add(G.cyl(10), WOOD, { pos: [0, 0, len / 2], rot: [Math.PI / 2, 0, 0], scale: [0.04, len, 0.04] });
  const r = len * 0.26;
  b.add(G.cyl(18), '#c08a52', { pos: [0, 0, len], rot: [0, 0, Math.PI / 2], scale: [r, r * 2.4, r] });
  for (const sx of [-1, 1]) b.add(G.cyl(18), '#8a5a2e', { pos: [sx * r * 0.9, 0, len], rot: [0, 0, Math.PI / 2], scale: [r * 1.04, r * 0.18, r * 1.04] });
  return new THREE.Group().add(mesh(b));
}

/** A lasso's loop (lying flat, radius 1: scale it) and the rope from the paw to it. */
export function lasso(): { loop: THREE.Group; rope: THREE.Mesh } {
  const b = new Builder();
  b.add(G.torus(0.05, 6, 28), ROPE, { rot: [Math.PI / 2, 0, 0] });
  b.add(G.sphere(8, 6), '#a8854e', { pos: [1, 0, 0], scale: 0.09 });
  const loop = new THREE.Group().add(mesh(b));
  const geo = new THREE.CylinderGeometry(0.016, 0.016, 1, 6).translate(0, 0.5, 0);
  const rope = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: ROPE }));
  return { loop, rope };
}

export interface Wand {
  group: THREE.Group;
  /** The tip, in the wand's frame. */
  tip: THREE.Vector3;
  /** A little bunch of flowers that pops out of the tip (when it doesn't work). */
  posy: THREE.Group;
}

export function wand(): Wand {
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.cyl(8), '#1e1c22', { pos: [0, 0, 0.16], rot: [Math.PI / 2, 0, 0], scale: [0.014, 0.34, 0.014] });
  b.add(G.cyl(8), '#f6f2fa', { pos: [0, 0, 0.32], rot: [Math.PI / 2, 0, 0], scale: [0.016, 0.06, 0.016] });
  b.add(G.ico(0), GOLD, { pos: [0, 0, 0.37], scale: 0.035 });
  group.add(mesh(b));
  const tip = new THREE.Vector3(0, 0, 0.38);
  const posy = new THREE.Group();
  const f = new Builder();
  const petals = ['#ff7ab8', '#ffd84a', '#8ad0ff', '#ff9a4a', '#c69aff'];
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const x = Math.cos(a) * 0.07;
    const y = Math.sin(a) * 0.07;
    f.add(G.cyl(5), '#4f9a3a', { pos: [x * 0.5, y * 0.5, 0.06], rot: [Math.PI / 2, 0, 0], scale: [0.006, 0.12, 0.006] });
    f.add(G.sphere(8, 6), petals[i], { pos: [x, y, 0.13], scale: 0.035 });
    f.add(G.sphere(6, 4), '#fff6c8', { pos: [x, y, 0.16], scale: 0.014 });
  }
  posy.add(mesh(f));
  posy.position.copy(tip);
  posy.scale.setScalar(0.001);
  group.add(posy);
  return { group, tip, posy };
}

export interface Staff {
  group: THREE.Group;
  /** The orb on top, which glows (its material is its own). */
  orb: THREE.Mesh;
  top: THREE.Vector3;
}

/** A wizard's staff, held upright: knobbly wood up to a glowing orb. */
export function staff(): Staff {
  const group = new THREE.Group();
  const b = new Builder();
  b.add(G.taper(0.7, 8), WOOD, { pos: [0, 0.15, 0], scale: [0.03, 1.1, 0.03] });
  for (let i = 0; i < 4; i++) b.add(G.blob(i), DARK_WOOD, { pos: [Math.sin(i * 2) * 0.03, 0.72 + i * 0.03, Math.cos(i * 2) * 0.03], scale: 0.035 });
  group.add(mesh(b));
  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 2), new THREE.MeshBasicMaterial({ color: '#9ad8ff' }));
  const top = new THREE.Vector3(0, 0.82, 0);
  orb.position.copy(top);
  group.add(orb);
  return { group, orb, top };
}

/** The holy hand grenade: a golden orb with a band of jewels and a cross on top. */
export function holyGrenade(): THREE.Group {
  const b = new Builder();
  b.add(G.sphere(16, 12), GOLD, { pos: [0, 0.12, 0], scale: 0.12 });
  b.add(G.cyl(20), '#c8962a', { pos: [0, 0.12, 0], scale: [0.123, 0.03, 0.123] });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.add(G.sphere(6, 4), i % 2 ? '#d8402f' : '#3a7ad8', { pos: [Math.cos(a) * 0.125, 0.12, Math.sin(a) * 0.125], scale: 0.016 });
  }
  b.add(G.box(), GOLD, { pos: [0, 0.3, 0], scale: [0.025, 0.13, 0.025] });
  b.add(G.box(), GOLD, { pos: [0, 0.32, 0], scale: [0.09, 0.025, 0.025] });
  return new THREE.Group().add(mesh(b));
}
