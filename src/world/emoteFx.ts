import * as THREE from 'three';
import { buyEmote, type EmoteAnim } from './emotes';

/**
 * The little extras that come with some of the shop's emotes (emotes.ts): props in the paws (a mic, a teacup, a tiny
 * trumpet, fingers for a peace sign) and things that float off (hearts, Z's, sweat, question marks, flames).
 *
 * Made when an emote starts and thrown away when it ends, so an animal not emoting carries nothing. Floating bits are
 * a dozen or so sprites from one shared sheet of pictures, placed each frame from the emote's time alone (nothing to
 * simulate), so everyone watching sees much the same thing. Nothing casts shadows.
 */

// ---------------------------------------------------------------- the pictures

/** The pictures on one sheet, eight to a row, white with a dark edge (each sprite is tinted its own colour). */
const G = { heart: 0, z: 1, q: 2, drop: 3, flame: 4, note: 5, sparkle: 6, puff: 7, anger: 8, dot: 9, plus: 10, times: 11, divide: 12, pi: 13, root: 14, swirl: 15, shh: 16, star: 17 } as const;
type Glyph = keyof typeof G;
const COLS = 8;
const ROWS = 3;
const S = 64;
const INK = '#3b2a20';

let sheet: THREE.Texture[] | null = null;
function glyphs(): THREE.Texture[] {
  if (sheet) return sheet;
  const c = document.createElement('canvas');
  c.width = S * COLS;
  c.height = S * ROWS;
  const g = c.getContext('2d')!;
  const cell = (i: number, draw: () => void) => {
    g.save();
    g.translate((i % COLS) * S + S / 2, Math.floor(i / COLS) * S + S / 2);
    g.fillStyle = '#fff';
    g.strokeStyle = INK;
    g.lineWidth = 4;
    g.lineJoin = 'round';
    draw();
    g.restore();
  };
  const both = () => {
    g.stroke();
    g.fill();
  };
  const text = (s: string, size: number) => {
    g.font = `900 ${size}px "Arial Black", Arial, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineWidth = 6;
    g.strokeText(s, 0, 2);
    g.fillText(s, 0, 2);
  };
  cell(G.heart, () => {
    g.beginPath();
    g.moveTo(0, 22);
    g.bezierCurveTo(-30, 2, -22, -26, 0, -10);
    g.bezierCurveTo(22, -26, 30, 2, 0, 22);
    both();
  });
  cell(G.z, () => text('Z', 46));
  cell(G.q, () => text('?', 50));
  cell(G.drop, () => {
    g.beginPath();
    g.moveTo(0, -24);
    g.bezierCurveTo(8, -8, 18, 4, 16, 12);
    g.arc(0, 10, 16, 0.1, Math.PI - 0.1);
    g.bezierCurveTo(-18, 4, -8, -8, 0, -24);
    both();
    g.fillStyle = 'rgba(255,255,255,0.9)';
    g.beginPath();
    g.ellipse(-6, 8, 3, 6, 0.4, 0, Math.PI * 2);
    g.fill();
  });
  cell(G.flame, () => {
    g.beginPath();
    g.moveTo(0, -28);
    g.bezierCurveTo(10, -14, 22, -2, 18, 12);
    g.bezierCurveTo(14, 26, -14, 26, -18, 12);
    g.bezierCurveTo(-20, 0, -8, -6, -6, -16);
    g.bezierCurveTo(-2, -10, 2, -18, 0, -28);
    both();
    // A bright heart, left untinted-ish.
    g.fillStyle = 'rgba(255,255,220,0.9)';
    g.beginPath();
    g.moveTo(0, -4);
    g.bezierCurveTo(8, 4, 10, 16, 0, 18);
    g.bezierCurveTo(-10, 16, -8, 4, 0, -4);
    g.fill();
  });
  cell(G.note, () => {
    g.beginPath();
    g.ellipse(-8, 14, 11, 8, -0.4, 0, Math.PI * 2);
    both();
    g.fillRect(0, -22, 5, 36);
    g.strokeRect(0, -22, 5, 36);
    g.beginPath();
    g.moveTo(3, -22);
    g.quadraticCurveTo(22, -16, 18, 0);
    g.lineWidth = 6;
    g.strokeStyle = '#fff';
    g.stroke();
  });
  cell(G.sparkle, () => {
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 ? 7 : 26;
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.closePath();
    both();
  });
  cell(G.puff, () => {
    g.beginPath();
    for (const [x, y, r] of [
      [-12, 4, 13],
      [6, -6, 15],
      [14, 8, 11],
      [0, 10, 12],
    ])
      g.moveTo(x + r, y), g.arc(x, y, r, 0, Math.PI * 2);
    g.lineWidth = 3;
    g.strokeStyle = 'rgba(59,42,32,0.35)';
    both();
  });
  cell(G.anger, () => {
    // The cross of bulging veins.
    g.lineWidth = 9;
    g.lineCap = 'round';
    for (const [sx, sy] of [
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ]) {
      g.beginPath();
      g.moveTo(sx * 6, sy * 20);
      g.quadraticCurveTo(sx * 6, sy * 6, sx * 20, sy * 6);
      g.strokeStyle = '#fff';
      g.stroke();
    }
  });
  cell(G.dot, () => {
    g.beginPath();
    g.arc(0, 0, 14, 0, Math.PI * 2);
    both();
  });
  cell(G.plus, () => text('+', 54));
  cell(G.times, () => text('×', 50));
  cell(G.divide, () => text('÷', 50));
  cell(G.pi, () => text('π', 46));
  cell(G.root, () => text('√', 46));
  cell(G.swirl, () => {
    g.lineWidth = 7;
    g.lineCap = 'round';
    g.beginPath();
    g.arc(0, 0, 18, -0.4, Math.PI * 1.55);
    g.strokeStyle = '#fff';
    g.stroke();
    g.beginPath();
    g.moveTo(16, -18);
    g.lineTo(18, -6);
    g.lineTo(6, -8);
    g.stroke();
  });
  cell(G.shh, () => text('shh', 28));
  cell(G.star, () => {
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 ? 10 : 24;
      g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.closePath();
    both();
  });
  const base = new THREE.CanvasTexture(c);
  base.colorSpace = THREE.SRGBColorSpace;
  // One texture per picture, all sharing the sheet (uploaded once).
  sheet = Object.values(G).map((i) => {
    const t = base.clone();
    t.repeat.set(1 / COLS, 1 / ROWS);
    t.offset.set((i % COLS) / COLS, 1 - (Math.floor(i / COLS) + 1) / ROWS);
    t.needsUpdate = true;
    return t;
  });
  return sheet;
}

// ---------------------------------------------------------------- props

/** Where a prop goes: the right paw, the left paw, or (heart hands) between the two. */
interface Props {
  r?: THREE.Object3D;
  l?: THREE.Object3D;
}

/**
 * The props' materials are made once and kept (never freed): a fresh one for every emote, freed as it ended, had the
 * graphics card build its shader all over again each time anyone emoted, a stutter of a tenth of a second or more.
 */
const mats = new Map<string, THREE.MeshStandardMaterial>();
const kept = new Set<THREE.Material>();
function mat(color: string, extra: THREE.MeshStandardMaterialParameters = {}) {
  const key = `${color}:${JSON.stringify(extra)}`;
  let m = mats.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.6, flatShading: true, ...extra });
    mats.set(key, m);
    kept.add(m);
  }
  return m;
}
/** The effects' sprites, kept the same way between emotes (and shared by everyone's), up to this many spare. */
const spareSprites: THREE.Sprite[] = [];
const SPARE_SPRITES = 96;
/** Fingers, in the animal's own coat (the material isn't the prop's to free). */
function finger(skin: THREE.Material, len: number, r = 0.016) {
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 3, 6), skin);
  m.userData.skin = true;
  // (Standing up from the grip.)
  m.geometry.translate(0, len / 2 + r, 0);
  // The coat is painted by vertex, so the finger needs paint of its own: a soft tan until it's first drawn, then
  // the colour of the paw it's on.
  const paint = new Float32Array(m.geometry.getAttribute('position').count * 3);
  m.geometry.setAttribute('color', new THREE.BufferAttribute(paint, 3));
  fill(m.geometry, FINGER_TAN);
  m.onBeforeRender = () => {
    m.onBeforeRender = () => {};
    const c = pawColour(m);
    if (c) fill(m.geometry, c);
  };
  return m;
}
const FINGER_TAN = new THREE.Color('#d9b48c');
function fill(geo: THREE.BufferGeometry, c: THREE.Color) {
  const a = geo.getAttribute('color') as THREE.BufferAttribute;
  for (let i = 0; i < a.count; i++) a.setXYZ(i, c.r, c.g, c.b);
  a.needsUpdate = true;
}

/** Paw colours already found, by the animal's body and the bone the paw is on. */
const pawColours = new WeakMap<THREE.BufferGeometry, Map<number, THREE.Color | null>>();
/**
 * The colour at the end of the arm this prop is held by: the far end of the arm bone it hangs from, read off the
 * animal's own painted body (null if there's no telling).
 */
function pawColour(o: THREE.Object3D): THREE.Color | null {
  let bone: THREE.Bone | null = null;
  let body: THREE.SkinnedMesh | null = null;
  for (let p = o.parent, n = 0; p && n < 14 && !body; p = p.parent, n++) {
    if (!bone && (p as THREE.Bone).isBone) bone = p as THREE.Bone;
    if (bone) body = (p.children.find((k) => (k as THREE.SkinnedMesh).isSkinnedMesh) as THREE.SkinnedMesh | undefined) ?? null;
  }
  if (!bone || !body?.skeleton) return null;
  const geo = body.geometry;
  const at = body.skeleton.bones.indexOf(bone);
  let known = pawColours.get(geo);
  if (!known) pawColours.set(geo, (known = new Map()));
  if (known.has(at)) return known.get(at)!;
  const pos = geo.getAttribute('position');
  const col = geo.getAttribute('color');
  const idx = geo.getAttribute('skinIndex');
  const wt = geo.getAttribute('skinWeight');
  let found: THREE.Color | null = null;
  if (at >= 0 && pos && col && idx && wt) {
    // The vertices mostly on this bone, measured out along it from its joint; the farthest few are the paw.
    const inv = body.skeleton.boneInverses[at];
    const v = new THREE.Vector3();
    const near: { d: number; i: number }[] = [];
    for (let i = 0; i < pos.count; i++) {
      for (let k = 0; k < 4; k++) {
        if (idx.getComponent(i, k) !== at || wt.getComponent(i, k) < 0.5) continue;
        near.push({ d: v.fromBufferAttribute(pos, i).applyMatrix4(inv).length(), i });
        break;
      }
    }
    near.sort((a, b) => b.d - a.d);
    const few = near.slice(0, Math.max(1, Math.ceil(near.length * 0.15)));
    if (few.length) {
      found = new THREE.Color(0, 0, 0);
      for (const { i } of few) found.add(new THREE.Color(col.getX(i), col.getY(i), col.getZ(i)));
      found.multiplyScalar(1 / few.length);
    }
  }
  known.set(at, found);
  return found;
}

function buildProps(anim: EmoteAnim, skin: THREE.Material, pawR: number): Props {
  const up = pawR * 0.7;
  const at = (o: THREE.Object3D, x: number, y: number, z: number, rx = 0, rz = 0) => {
    o.position.set(x, y, z);
    o.rotation.set(rx, 0, rz);
    return o;
  };
  const group = (...kids: THREE.Object3D[]) => {
    const g = new THREE.Group();
    g.add(...kids);
    return g;
  };
  switch (anim) {
    case 'thumbsup':
      return { r: group(at(finger(skin, 0.035, 0.018), 0, up, 0.01)) };
    case 'shush':
      return { r: group(at(finger(skin, 0.04), 0, up, 0.02)) };
    case 'peace':
      return { r: group(at(finger(skin, 0.05), 0.012, up, 0, 0, -0.32), at(finger(skin, 0.05), -0.012, up, 0, 0, 0.32)) };
    case 'loser':
      // The L, seen from in front: one finger up, the thumb out across the brow.
      return { r: group(at(finger(skin, 0.06), 0, up, 0.03), at(finger(skin, 0.045), 0.005, up * 0.6, 0.03, 0, -Math.PI / 2)) };
    case 'fingerguns': {
      const gun = () => group(at(finger(skin, 0.05), 0, 0, pawR * 0.6, Math.PI / 2), at(finger(skin, 0.02), 0, up, 0));
      return { r: gun(), l: gun() };
    }
    case 'micdrop': {
      const m = group(
        at(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.01, 0.12, 8), mat('#2b2b30')), 0, 0, 0),
        at(new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), mat('#8d9096', { metalness: 0.6, roughness: 0.35 })), 0, 0.075, 0),
      );
      m.name = 'mic';
      return { r: m };
    }
    case 'teasip':
    case 'thisisfine': {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.055, 12, 1, true), mat(anim === 'teasip' ? '#f4f1ea' : '#e9e2d0', { side: THREE.DoubleSide }));
      const tea = new THREE.Mesh(new THREE.CircleGeometry(0.037, 12), mat('#8a5a2b'));
      tea.rotation.x = -Math.PI / 2;
      tea.position.y = 0.018;
      const base = new THREE.Mesh(new THREE.CircleGeometry(0.03, 12), cup.material);
      base.rotation.x = Math.PI / 2;
      base.position.y = -0.027;
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.005, 5, 10), cup.material);
      handle.position.set(-0.045, 0, 0);
      handle.rotation.y = Math.PI / 2;
      // (Held by the handle, so the cup sits just in front of the paw.)
      return { r: at(group(cup, tea, base, handle), 0, 0.03, 0.05) };
    }
    case 'doot': {
      const brass = mat('#e2b33c', { metalness: 0.7, roughness: 0.3 });
      const tube = at(new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.16, 6), brass), 0, 0, 0.08, Math.PI / 2);
      const bell = at(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.01, 0.07, 12, 1, true), brass), 0, 0, 0.19, Math.PI / 2);
      (bell as THREE.Mesh).material = mat('#e2b33c', { metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide });
      const valves = at(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.035, 0.05), brass), 0, 0.022, 0.07);
      return { r: group(tube, bell, valves) };
    }
    case 'hearthands': {
      const shape = new THREE.Shape();
      shape.moveTo(0, -0.04);
      shape.bezierCurveTo(-0.055, -0.005, -0.04, 0.045, 0, 0.022);
      shape.bezierCurveTo(0.04, 0.045, 0.055, -0.005, 0, -0.04);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: true, bevelSize: 0.006, bevelThickness: 0.006, bevelSegments: 1 });
      geo.translate(0, 0.01, -0.01);
      const heart = new THREE.Mesh(geo, mat('#ff5a8a', { emissive: '#ff2f6b', emissiveIntensity: 0.35 }));
      heart.name = 'heart';
      return { r: heart };
    }
  }
  return {};
}

// ---------------------------------------------------------------- what floats off

/** Where things are this frame, in the space the effects are drawn in (the animal's, before it's turned). */
export interface EmoteSpots {
  /** The top of the head, and its middle. */
  top: number;
  head: THREE.Vector3;
  mouth: THREE.Vector3;
  eyeL: THREE.Vector3;
  eyeR: THREE.Vector3;
  /** The paws' grips. */
  hand: THREE.Vector3;
  handL: THREE.Vector3;
  /** About how wide the head is. */
  size: number;
}

type Add = (g: Glyph, color: string, x: number, y: number, z: number, size: number, opacity?: number) => void;
const ss = THREE.MathUtils.smoothstep;
const frac = (x: number) => x - Math.floor(x);
/** 0 to 1 and back over [a, b]: in quickly, out at the end. */
const life = (u: number, a: number, b: number) => (u < a || u > b ? 0 : Math.min(1, (u - a) / 0.12) * Math.min(1, (b - u) / 0.25));

/** Each emote's floating bits at time `u` (seconds in). */
function particles(anim: EmoteAnim, u: number, T: number, P: EmoteSpots, add: Add, self: EmoteFx) {
  const r = P.size;
  switch (anim) {
    case 'slowclap': {
      // A little burst where the paws meet, each clap.
      const k = frac(u / 1.0 - 0.5);
      if (k < 0.3) {
        const mx = (P.hand.x + P.handL.x) / 2;
        const my = (P.hand.y + P.handL.y) / 2;
        const mz = (P.hand.z + P.handL.z) / 2 + 0.04;
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * Math.PI * 2 + 0.6;
          add('sparkle', '#fff3a6', mx + Math.cos(a) * k * 0.4, my + Math.sin(a) * k * 0.4, mz, 0.06, 1 - k / 0.3);
        }
      }
      break;
    }
    case 'thumbsup':
    case 'peace': {
      const o = life(u, 0.35, T - 0.2);
      add('sparkle', '#fff3a6', P.hand.x - 0.05, P.hand.y + 0.12 + Math.sin(u * 6) * 0.01, P.hand.z + 0.03, 0.06 + Math.sin(u * 9) * 0.015, o);
      add('sparkle', '#ffffff', P.hand.x + 0.06, P.hand.y + 0.06, P.hand.z + 0.05, 0.04 + Math.sin(u * 11 + 1) * 0.012, o);
      break;
    }
    case 'blowkiss': {
      const k = (u - 0.75) / (T - 0.75);
      if (k > 0) add('heart', '#ff5a8a', P.mouth.x + Math.sin(k * 7) * 0.03, P.mouth.y + k * 0.25, P.mouth.z + 0.06 + k * 0.7, 0.07 + k * 0.08, 1 - ss(k, 0.7, 1));
      break;
    }
    case 'micdrop':
      self.dropMic(u, P);
      if (u > 1.72 && u < 2.3) {
        const k = (u - 1.72) / 0.58;
        const d = self.dropAt;
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + 0.4;
          add('star', '#ffd23f', d.x + Math.cos(a) * k * 0.22, 0.03 + Math.sin(k * Math.PI) * 0.12, d.z + Math.sin(a) * k * 0.22, 0.05, 1 - k);
        }
      }
      break;
    case 'think':
      // Thought dots, one by one, up and off to the side.
      for (let i = 0; i < 3; i++) {
        const on = frac(u / 1.2) * 4 > i + 0.5 ? 1 : 0;
        add('dot', '#ffffff', P.head.x - 0.12 - i * 0.06, P.top + 0.04 + i * 0.07, P.head.z, 0.04 + i * 0.02, on * life(u, 0.3, T - 0.1));
      }
      break;
    case 'shush': {
      const k = frac(u / 1.1);
      add('shh', '#bfe3ff', P.mouth.x - 0.1 - k * 0.15, P.mouth.y + 0.05 + k * 0.12, P.mouth.z + 0.05, 0.12, life(u, 0.4, T) * (1 - k));
      break;
    }
    case 'ragequit': {
      const beat = 1 + Math.abs(Math.sin(u * 10)) * 0.25;
      add('anger', '#e8302a', P.head.x - r * 0.55, P.top - 0.02, P.head.z + 0.05, 0.11 * beat, life(u, 0.15, T));
      for (const side of [-1, 1])
        for (let i = 0; i < 2; i++) {
          const k = frac(u * 1.6 + i * 0.5);
          add('puff', '#f2f2f2', P.head.x + side * (r * 0.6 + k * 0.12), P.head.y + k * 0.25, P.head.z - 0.02, 0.06 + k * 0.08, (1 - k) * life(u, 0.2, T));
        }
      break;
    }
    case 'yawn':
      for (let i = 0; i < 3; i++) {
        const k = frac((u - 1.1) / 1.2 + i / 3);
        if (u < 1.1 + (i / 3) * 1.2) continue;
        add('z', '#bcd0ff', P.head.x - 0.08 - k * 0.15 + Math.sin(k * 6) * 0.03, P.top + 0.02 + k * 0.32, P.head.z, 0.06 + k * 0.07, Math.min(1, k * 5) * (1 - ss(k, 0.7, 1)));
      }
      break;
    case 'sneeze': {
      const k = (u - 1.12) / 0.8;
      if (k > 0 && k < 1) {
        add('puff', '#ffffff', P.mouth.x, P.mouth.y, P.mouth.z + 0.06 + k * 0.25, 0.08 + k * 0.18, 0.9 * (1 - k));
        for (let i = 0; i < 6; i++) {
          const a = (i / 6 - 0.5) * 1.6;
          add('drop', '#9fe0ff', P.mouth.x + Math.sin(a) * k * 0.35, P.mouth.y + 0.04 - k * k * 0.35 + Math.cos(i * 3) * 0.04, P.mouth.z + 0.05 + Math.cos(a) * k * 0.45, 0.035, 1 - k);
        }
      }
      break;
    }
    case 'hearthands':
      for (let i = 0; i < 3; i++) {
        const k = frac(u / 1.3 + i / 3);
        if (u < 0.4 + (i / 3) * 1.3) continue;
        add('heart', i === 1 ? '#ff8fb1' : '#ff5a8a', P.hand.x * 0.3 + Math.sin(k * 5 + i) * 0.08, P.hand.y + 0.08 + k * 0.45, P.hand.z + 0.06, 0.05 + k * 0.05, 1 - ss(k, 0.6, 1));
      }
      break;
    case 'flex':
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + u * 1.5;
        const tw = Math.max(0, Math.sin(u * 7 + i * 2.1));
        add('sparkle', i % 2 ? '#fff3a6' : '#ffffff', P.head.x + Math.cos(a) * (r + 0.22), P.head.y - 0.05 + Math.sin(a * 2) * 0.12, P.head.z + Math.sin(a) * 0.15, 0.03 + tw * 0.05, tw * life(u, 0.25, T));
      }
      break;
    case 'eyeroll':
      add('swirl', '#ffffff', P.head.x, P.top + 0.1, P.head.z, 0.1, life(u, 0.2, 1.4));
      break;
    case 'fingerguns':
      for (const t0 of [0.45, 1.05, 1.6]) {
        const k = (u - t0) / 0.25;
        if (k < 0 || k > 1) continue;
        for (const h of [P.hand, P.handL]) add('sparkle', '#ffe27a', h.x, h.y + 0.02, h.z + 0.12 + k * 0.08, 0.05 + k * 0.03, 1 - k);
      }
      break;
    case 'thisisfine':
      // Little flames round about, flickering.
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2 + 0.3;
        const fl = 0.85 + Math.sin(u * 13 + i * 2.7) * 0.15;
        const rr = 0.55 + (i % 3) * 0.12;
        add('flame', i % 3 === 0 ? '#ffb02e' : '#ff6a1f', Math.cos(a) * rr, 0.06 * fl, Math.sin(a) * rr, 0.13 * fl, life(u, 0.05, T));
      }
      // And steam from the cup.
      add('puff', '#ffffff', P.hand.x, P.hand.y + 0.1 + frac(u) * 0.12, P.hand.z + 0.05, 0.04 + frac(u) * 0.04, 0.6 * (1 - frac(u)));
      break;
    case 'teasip':
      for (let i = 0; i < 2; i++) {
        const k = frac(u * 0.8 + i * 0.5);
        add('puff', '#ffffff', P.hand.x + Math.sin(k * 6 + i) * 0.02, P.hand.y + 0.08 + k * 0.16, P.hand.z + 0.05, 0.03 + k * 0.04, 0.55 * (1 - k));
      }
      break;
    case 'sweat': {
      // One bead running down the brow, and drops flicking off either side.
      const k = frac(u / 1.4);
      add('drop', '#7fd0ff', P.head.x - r * 0.45, P.head.y + r * 0.4 - k * r * 0.5, P.head.z + r * 0.75, 0.05, life(u, 0.1, T));
      for (const side of [-1, 1]) {
        const j = frac(u * 1.3 + (side > 0 ? 0.5 : 0));
        add('drop', '#9fe0ff', P.head.x + side * (r * 0.7 + j * 0.25), P.head.y + r * 0.3 + j * 0.15 - j * j * 0.35, P.head.z, 0.04, (1 - j) * life(u, 0.2, T));
      }
      break;
    }
    case 'confused': {
      const marks: [Glyph, string][] = [
        ['q', '#ffd23f'],
        ['plus', '#9be37a'],
        ['q', '#ffd23f'],
        ['times', '#ff8a8a'],
        ['pi', '#8fc8ff'],
        ['divide', '#d6a6ff'],
        ['root', '#ffb86b'],
      ];
      marks.forEach(([gl, col], i) => {
        const a = (i / marks.length) * Math.PI * 2 + u * 1.1;
        add(gl, col, P.head.x + Math.cos(a) * (r + 0.2), P.head.y + 0.05 + Math.sin(u * 3 + i) * 0.05 + (i % 2) * 0.08, P.head.z + Math.sin(a) * (r + 0.2), gl === 'q' ? 0.1 : 0.08, life(u, 0.1 + i * 0.08, T));
      });
      break;
    }
    case 'sigh': {
      const k = (u - 0.85) / 1.3;
      if (k > 0 && k < 1) add('puff', '#ffffff', P.mouth.x, P.mouth.y - k * 0.08, P.mouth.z + 0.08 + k * 0.3, 0.06 + k * 0.14, 0.8 * (1 - k));
      break;
    }
    case 'crylaugh':
      // Tears squirting out sideways in arcs.
      for (const [eye, side] of [
        [P.eyeL, 1],
        [P.eyeR, -1],
      ] as const)
        for (let i = 0; i < 3; i++) {
          const k = frac(u * 2.2 + i / 3);
          add('drop', '#7fd0ff', eye.x + side * k * 0.3, eye.y + k * 0.12 - k * k * 0.3, eye.z + 0.02, 0.035, (1 - k) * life(u, 0.25, T));
        }
      break;
    case 'doot':
      // A note out of the bell for each doot.
      for (const t0 of [0.3, 0.9, 1.45]) {
        const k = (u - t0) / 0.9;
        if (k < 0 || k > 1) continue;
        add('note', t0 === 0.9 ? '#ffd23f' : '#c48cff', P.hand.x + Math.sin(k * 8) * 0.04, P.hand.y + 0.05 + k * 0.3, P.hand.z + 0.24 + k * 0.25, 0.07 + k * 0.03, 1 - ss(k, 0.7, 1));
      }
      break;
  }
}

/**
 * Builds the effects' shaders in the background a little after the town loads (the props' two kinds of material and
 * the sprites), so not even the first emote anyone does stutters. They're kept from then on (see mat).
 */
export function warmEmoteFx(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) {
  const box = new THREE.BoxGeometry(0.01, 0.01, 0.01);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false, map: glyphs()[0] }));
  const g = new THREE.Group();
  g.add(new THREE.Mesh(box, mat('#ffffff')), new THREE.Mesh(box, mat('#ffffff', { side: THREE.DoubleSide })), sprite);
  const done = () => {
    // (Without the graphics card's background compiling, the work would still wait for the first draw: done now.)
    for (const p of renderer.info.programs ?? []) p.getUniforms();
    g.clear();
    box.dispose();
    spareSprites.push(sprite);
  };
  try {
    renderer.compileAsync(g, camera, scene).then(done, done);
  } catch {
    done();
  }
}

/** Whether an emote has anything for EmoteFx to do. */
const NONE: EmoteAnim[] = ['facepalm', 'shrug', 'salute', 'bow', 'dab', 'loser'];

export class EmoteFx {
  readonly group = new THREE.Group();
  readonly props: Props;
  private sprites: THREE.Sprite[] = [];
  private used = 0;
  private T: number;
  /** The mic, once it's been let go: where it fell from (the effects' space), and where it lands. */
  private dropped: THREE.Object3D | null = null;
  private dropFrom = new THREE.Vector3();
  readonly dropAt = new THREE.Vector3();

  constructor(
    readonly anim: EmoteAnim,
    skin: THREE.Material,
    pawR: number,
  ) {
    this.T = buyEmote(anim)?.time ?? 2.5;
    this.props = buildProps(anim, skin, pawR);
    this.group.name = 'emoteFx';
  }

  static wanted(anim: EmoteAnim) {
    return !NONE.includes(anim);
  }

  update(u: number, spots: EmoteSpots) {
    this.used = 0;
    const tex = glyphs();
    particles(this.anim, u, this.T, spots, (g, color, x, y, z, size, opacity = 1) => {
      if (opacity <= 0.01) return;
      let s = this.sprites[this.used];
      if (!s) {
        s = spareSprites.pop() ?? new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthWrite: false }));
        this.sprites.push(s);
        this.group.add(s);
      }
      this.used++;
      const m = s.material;
      if (m.map !== tex[G[g]]) {
        m.map = tex[G[g]];
        m.needsUpdate = true;
      }
      m.color.set(color);
      m.opacity = opacity;
      s.position.set(x, y, z);
      s.scale.setScalar(size * 2);
      s.visible = true;
    }, this);
    for (let i = this.used; i < this.sprites.length; i++) this.sprites[i].visible = false;
  }

  /** The mic drop: in the paw until it's let go, then down to the floor with a bounce, and it stays there. */
  dropMic(u: number, spots: EmoteSpots) {
    const LET_GO = 1.35;
    const mic = this.props.r;
    if (!mic) return;
    if (u < LET_GO) {
      mic.visible = true;
      if (this.dropped) this.dropped.visible = false;
      return;
    }
    mic.visible = false;
    if (!this.dropped) {
      this.dropped = mic.clone();
      this.group.add(this.dropped);
    }
    if (!this.dropped.visible) {
      this.dropped.visible = true;
      this.dropFrom.copy(spots.hand);
      this.dropAt.set(spots.hand.x, 0.02, spots.hand.z);
    }
    const k = u - LET_GO;
    const fall = 0.5 * 9.8 * k * k;
    const h = this.dropFrom.y - 0.02;
    let y = this.dropFrom.y - fall;
    let tip = Math.min(1, k * 4) * 0.6;
    if (y <= 0.02) {
      // (A small bounce, then it lies there.)
      const tf = Math.sqrt((2 * h) / 9.8);
      const kb = k - tf;
      y = 0.02 + Math.max(0, 0.06 * Math.sin(Math.min(1, kb / 0.22) * Math.PI));
      tip = 0.6 + Math.min(1, kb / 0.2) * (Math.PI / 2 - 0.6);
    }
    this.dropped.position.set(this.dropFrom.x, y + 0.015, this.dropFrom.z);
    this.dropped.rotation.set(tip, 0, 0.3);
  }

  dispose() {
    for (const s of this.sprites) {
      s.removeFromParent();
      if (spareSprites.length < SPARE_SPRITES) spareSprites.push(s);
      else s.material.dispose();
    }
    this.sprites = [];
    const free = (o: THREE.Object3D) =>
      o.traverse((x) => {
        const m = x as THREE.Mesh;
        if (!m.isMesh) return;
        m.geometry.dispose();
        // (Fingers are the animal's own coat.)
        if (!m.userData.skin && !kept.has(m.material as THREE.Material)) (m.material as THREE.Material).dispose();
      });
    if (this.props.r) free(this.props.r);
    if (this.props.l) free(this.props.l);
    this.props.r?.removeFromParent();
    this.props.l?.removeFromParent();
    // (The dropped mic is a clone sharing the mic's geometry and materials, freed above.)
    this.group.removeFromParent();
  }
}
