import * as THREE from 'three';
import { nomMove, type NomMove, type NomMoveId } from '../game/nomMoves';
import { animalThumbnail } from './animals';
import { Bursts, Dizzy, ease, easeOut, hash, span } from './exec/fx';
import type { Anim, Look } from './types';

/**
 * A nomination's little cutscene at the meeting, the same on every screen (it runs off the nomination's start time
 * alone). First a shot of the nominator doing their move (see game/nomMoves.ts) and calling out; then the camera
 * whips along the path of whatever they throw, point or shine across the circle; then an extreme close-up of the
 * one nominated, reacting the way the move calls for. Nobody leaves their stool: only the two of them are posed,
 * and the props come and go round them. Lazy loaded (engine.ts asks for it when a nomination starts).
 */

/** When the nominator lets go, when it lands, and when it's over (seconds from the start; see NOM_SHOW_MS too). */
export const NOM = { throw: 1.55, hit: 2.65, end: 5.3 };

/** Where someone is for the show: their eyes, which way they face (flat), and how tall they are. */
export interface NomEnd {
  face: THREE.Vector3;
  fwd: THREE.Vector3;
  top: number;
  /** The floor under them (under the stool, if they're on one). */
  floor: number;
  /** How far their snout (or anything else) sticks out in front of their eyes, for the close-up to stay clear of. */
  front?: number;
}

/** How the show has one of the two this frame: what they're doing, nudged by `off`, tipped back by `tip`. */
export interface NomPose {
  anim: Anim | null;
  off: THREE.Vector3;
  tip: number;
  roll: number;
  /** Turned this much more (towards whoever they're pointing at). */
  yaw: number;
}

export interface NomFrame {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  /** A cut (straight there) rather than a quick swing. */
  cut: boolean;
  /** Close enough that the camera's near plane must come in. */
  close: boolean;
  by: NomPose | null;
  target: NomPose | null;
}

const UP = new THREE.Vector3(0, 1, 0);
const v3 = () => new THREE.Vector3();

/** Whoever is nominated, for their photo on the conspiracy board. */
export interface NomWho {
  look: Look | null;
  name: string;
}

// The conspiracy board: its cork (in the canvas's pixels and the board's own size), what's pinned on it, and the red
// string between the pins. The camera follows the zig-zag `TRAIL` to the photo of the one nominated.
const CORK = { w: 600, h: 420, W: 1.2, H: 0.84, y: 1.08 };
const PHOTO = { x: 455, y: 205, w: 150, h: 178 };
type Pinned = { x: number; y: number; kind: 'photo' | 'note' | 'news'; text?: string; color?: string; tilt: number };
const PINNED: Pinned[] = [
  { x: 70, y: 70, kind: 'photo', tilt: -0.08 },
  { x: 215, y: 62, kind: 'news', tilt: 0.05 },
  { x: 345, y: 70, kind: 'note', text: 'night 2??', color: '#ffe36a', tilt: 0.1 },
  { x: 540, y: 52, kind: 'note', text: 'follow the $', color: '#9fdcff', tilt: -0.06 },
  { x: 60, y: 205, kind: 'note', text: 'alibi?', color: '#ff9fc0', tilt: 0.12 },
  { x: 200, y: 200, kind: 'photo', tilt: 0.06 },
  { x: 315, y: 210, kind: 'note', text: 'WHO?!', color: '#ffe36a', tilt: -0.1 },
  { x: 80, y: 340, kind: 'photo', tilt: 0.1 },
  { x: 205, y: 345, kind: 'note', text: 'LIES', color: '#b8f08a', tilt: -0.05 },
  { x: 330, y: 345, kind: 'news', tilt: -0.08 },
  { x: 545, y: 375, kind: 'note', text: 'seen at the tavern', color: '#ff9fc0', tilt: 0.07 },
];
/** Each one's pin: near its top edge. */
const pinOf = (p: Pinned) => ({ x: p.x, y: p.y - (p.kind === 'note' ? 24 : 30) });
const PHOTO_PIN = { x: PHOTO.x, y: PHOTO.y - PHOTO.h / 2 + 8 };
/** The string the camera follows, by index into PINNED, then on to the photo. */
const TRAIL = [0, 5, 2, 6, 9];
/** And all the other threads, pin to pin (-1 is the photo). */
const THREADS: [number, number][] = [
  [0, 5], [5, 2], [2, 6], [6, 9], [9, -1],
  [1, 4], [4, 7], [7, 8], [8, -1], [1, -1], [3, -1], [3, 6], [10, -1], [10, 8], [2, -1], [5, 8], [4, 6], [6, -1], [7, 5],
];

/** Bits that fly or hang about, built once per show. */
type Kit = Record<string, THREE.Object3D>;

export class NomShow {
  readonly group = new THREE.Group();
  readonly move: NomMove;
  private bursts = new Bursts();
  private dizzy = new Dizzy(5);
  private kit: Kit = {};
  private mats: THREE.Material[] = [];
  private geos: THREE.BufferGeometry[] = [];
  private texs: THREE.Texture[] = [];
  private done = new Set<string>();
  /** The face of the one nominated as it was when it landed, for a steady close-up. */
  private rest: { face: THREE.Vector3; fwd: THREE.Vector3; side: THREE.Vector3; top: number; front: number } | null = null;
  private shot = -1;
  private frame: NomFrame = { pos: v3(), look: v3(), cut: false, close: false, by: null, target: null };
  private byPose: NomPose = { anim: null, off: v3(), tip: 0, roll: 0, yaw: 0 };
  private toPose: NomPose = { anim: null, off: v3(), tip: 0, roll: 0, yaw: 0 };

  constructor(
    id: NomMoveId,
    private sound: (name: string) => void = () => {},
    private who: NomWho | null = null,
  ) {
    this.move = nomMove(id);
    this.group.add(this.bursts.group, this.dizzy.group);
    this.build();
  }

  // ---------------------------------------------------------------- materials and bits

  private mat(color: string, glow = false, opacity = 1): THREE.Material {
    const m = glow
      ? new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, depthWrite: opacity >= 1, side: THREE.DoubleSide })
      : new THREE.MeshLambertMaterial({ color, flatShading: true, side: THREE.DoubleSide });
    this.mats.push(m);
    return m;
  }

  private mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
    this.geos.push(geo);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    return m;
  }

  private add(name: string, o: THREE.Object3D) {
    o.visible = false;
    this.kit[name] = o;
    this.group.add(o);
    return o;
  }

  /** A word on a card that always faces the camera: a speech bubble, a jagged shout, a poster. */
  private card(text: string, o: { fg: string; bg: string; edge: string; jag?: boolean; h?: number; italic?: boolean }): THREE.Mesh {
    const c = document.createElement('canvas');
    const g = c.getContext('2d');
    const font = `${o.italic ? 'italic ' : ''}900 92px system-ui, "Segoe UI", sans-serif`;
    let w = 300;
    if (g) {
      g.font = font;
      w = Math.max(260, Math.ceil(g.measureText(text).width) + 120);
    }
    c.width = w;
    c.height = 200;
    if (g) {
      g.lineJoin = 'round';
      g.fillStyle = o.bg;
      g.strokeStyle = o.edge;
      g.lineWidth = 10;
      g.beginPath();
      if (o.jag) {
        // A burst with spikes all round, for shouting.
        const n = 22;
        for (let i = 0; i <= n; i++) {
          const a = (i / n) * Math.PI * 2;
          const r = i % 2 ? 0.8 : 1;
          const x = w / 2 + Math.cos(a) * (w / 2 - 8) * r;
          const y = 100 + Math.sin(a) * 92 * r;
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
      } else g.roundRect(8, 12, w - 16, 150, 60);
      g.fill();
      g.stroke();
      if (!o.jag) {
        // The little tail of a speech bubble.
        g.beginPath();
        g.moveTo(w * 0.3, 158);
        g.lineTo(w * 0.24, 196);
        g.lineTo(w * 0.42, 158);
        g.closePath();
        g.fill();
        g.stroke();
        g.fillRect(w * 0.29, 150, w * 0.14, 10);
      }
      g.font = font;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.lineWidth = 12;
      g.strokeStyle = o.edge;
      g.strokeText(text, w / 2, o.jag ? 102 : 90);
      g.fillStyle = o.fg;
      g.fillText(text, w / 2, o.jag ? 102 : 90);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.texs.push(tex);
    const h = o.h ?? 0.32;
    const m = this.mesh(new THREE.PlaneGeometry((h * w) / 200, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    this.mats.push(m.material as THREE.Material);
    m.renderOrder = 10;
    return m;
  }

  /** A poster: the old wanted notice, or the recruiting one. */
  private poster(kind: 'wanted' | 'you'): THREE.Mesh {
    const c = document.createElement('canvas');
    c.width = 240;
    c.height = 320;
    const g = c.getContext('2d');
    if (g) {
      g.fillStyle = kind === 'wanted' ? '#f1dfb0' : '#f6f1e4';
      g.fillRect(0, 0, 240, 320);
      g.strokeStyle = kind === 'wanted' ? '#7a5a30' : '#2a3f7a';
      g.lineWidth = 10;
      g.strokeRect(6, 6, 228, 308);
      g.textAlign = 'center';
      g.fillStyle = kind === 'wanted' ? '#5a3a1a' : '#b8282e';
      g.font = '900 48px Georgia, serif';
      g.fillText(kind === 'wanted' ? 'WANTED' : 'I WANT', 120, 60);
      // A plain little face, for whoever it is.
      g.fillStyle = kind === 'wanted' ? '#c9a26a' : '#e8c9a8';
      g.beginPath();
      g.arc(120, 150, 54, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#3a2a1a';
      g.beginPath();
      g.arc(100, 140, 7, 0, Math.PI * 2);
      g.arc(140, 140, 7, 0, Math.PI * 2);
      g.fill();
      g.lineWidth = 5;
      g.strokeStyle = '#3a2a1a';
      g.beginPath();
      g.arc(120, 172, 16, Math.PI * 1.15, Math.PI * 1.85);
      g.stroke();
      if (kind === 'you') {
        // The stern top hat.
        g.fillStyle = '#2a3f7a';
        g.fillRect(84, 70, 72, 46);
        g.fillRect(70, 110, 100, 10);
        g.fillStyle = '#f6f1e4';
        g.fillRect(84, 98, 72, 8);
      }
      g.fillStyle = kind === 'wanted' ? '#5a3a1a' : '#2a3f7a';
      g.font = '900 40px Georgia, serif';
      g.fillText(kind === 'wanted' ? 'REWARD' : 'YOU!', 120, 262);
      if (kind === 'wanted') {
        g.font = '700 26px Georgia, serif';
        g.fillText('$1,000,000', 120, 298);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.texs.push(tex);
    const m = this.mesh(new THREE.PlaneGeometry(0.3, 0.4), new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }));
    this.mats.push(m.material as THREE.Material);
    return m;
  }

  /** A cartoon hand pointing along +z: a fist with one finger out (and a thumb), in a colour. */
  private hand(color: string, size = 1, glow = false): THREE.Group {
    const g = new THREE.Group();
    const m = this.mat(color, glow);
    g.add(this.mesh(new THREE.BoxGeometry(0.12, 0.1, 0.11), m));
    const finger = this.mesh(new THREE.CylinderGeometry(0.025, 0.028, 0.14, 6), m, 0.03, 0.02, 0.11);
    finger.rotation.x = Math.PI / 2;
    g.add(finger);
    const tip = this.mesh(new THREE.SphereGeometry(0.026, 6, 4), m, 0.03, 0.02, 0.18);
    g.add(tip);
    const thumb = this.mesh(new THREE.CylinderGeometry(0.022, 0.024, 0.07, 6), m, -0.06, 0.04, 0.03);
    thumb.rotation.z = 0.9;
    g.add(thumb);
    for (let i = 0; i < 3; i++) g.add(this.mesh(new THREE.SphereGeometry(0.026, 6, 4), m, 0.04 - i * 0.035, -0.03, 0.06));
    // The cuff.
    const cuff = this.mesh(new THREE.CylinderGeometry(0.07, 0.075, 0.06, 8), this.mat(glow ? '#fff6c8' : '#ffffff', glow), 0, 0, -0.07);
    cuff.rotation.x = Math.PI / 2;
    g.add(cuff);
    g.scale.setScalar(size);
    return g;
  }

  /** Everything the move needs, hidden until its moment. */
  private build() {
    const id = this.move.id;
    // What they shout, over the nominator, and what the one nominated says back, beside their face.
    this.add(
      'shout',
      id === 'you'
        ? this.card(this.move.shout, { fg: '#3a1a2a', bg: '#ffffff', edge: '#3a1a2a', h: 0.5 })
        : this.card(this.move.shout, { fg: '#ffffff', bg: id === 'objection' ? '#2a4fb8' : '#e8506a', edge: '#3a1a2a', jag: id === 'objection' || id === 'jaccuse' || id === 'gavel' || id === 'board', italic: true }),
    );
    this.add('reply', this.card(this.move.reply, { fg: '#3a2a3a', bg: '#fffaf0', edge: '#3a2a3a' }));
    // Hearts (or "!"s) that pop out where it lands.
    const pops = new THREE.Group();
    const heart = new THREE.Shape();
    heart.moveTo(0, -0.5);
    heart.bezierCurveTo(-0.9, 0.1, -0.5, 0.8, 0, 0.35);
    heart.bezierCurveTo(0.5, 0.8, 0.9, 0.1, 0, -0.5);
    const cute = ['plane', 'finger', 'foam', 'pigeon', 'confetti', 'laser', 'card'].includes(id);
    for (let i = 0; i < 9; i++) {
      const p = cute ? this.mesh(new THREE.ShapeGeometry(heart, 5), this.mat(['#ff6b8f', '#ff9ab8', '#ffd0dd'][i % 3], true)) : this.bang();
      pops.add(p);
    }
    this.add('pops', pops);
    // Sweat drops, for a tremble.
    const sweat = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const d = new THREE.Group();
      const m = this.mat('#8fd3ff', true);
      d.add(this.mesh(new THREE.SphereGeometry(0.03, 8, 6), m));
      const tip = this.mesh(new THREE.ConeGeometry(0.03, 0.05, 8), m, 0, 0.035, 0);
      d.add(tip);
      sweat.add(d);
    }
    this.add('sweat', sweat);
    // A string of pearls, to clutch.
    const pearls = new THREE.Group();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      pearls.add(this.mesh(new THREE.SphereGeometry(0.018, 8, 6), this.pearl(), Math.cos(a) * 0.12, 0, Math.sin(a) * 0.12));
    }
    this.add('pearls', pearls);
    // Light shone in their face (the deer in the headlights) or from up above (the spotlight).
    const beam = this.mesh(new THREE.CylinderGeometry(0.12, 0.7, 1, 18, 1, true), this.mat('#fff2a8', true, 0.4));
    beam.geometry.translate(0, -0.5, 0);
    this.add('beam', beam);
    const pool = this.mesh(new THREE.CircleGeometry(0.7, 24), this.mat('#fff2a8', true, 0.55));
    pool.rotation.x = -Math.PI / 2;
    this.add('pool', pool);
    // A dotted trail behind whatever flies.
    const trail = new THREE.Group();
    for (let i = 0; i < 14; i++) trail.add(this.mesh(new THREE.SphereGeometry(0.018, 6, 4), this.mat(id === 'finger' ? '#ffe680' : '#ffffff', true, 0.85)));
    this.add('trail', trail);

    switch (id) {
      case 'plane': {
        const g = new THREE.BufferGeometry();
        // Two wings and a keel, folded paper.
        g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.2, -0.14, 0.02, -0.12, 0, 0.0, -0.12, 0, 0, 0.2, 0.14, 0.02, -0.12, 0, 0, -0.12, 0, 0, 0.2, 0, -0.05, -0.12, 0, 0, -0.12], 3));
        g.computeVertexNormals();
        this.add('flier', this.mesh(g, this.mat('#fbfbf6')));
        break;
      }
      case 'finger':
        this.add('flier', this.hand('#ffd9a0', 1.6, true));
        break;
      case 'gauntlet':
      case 'unmask': {
        const glove = this.hand('#f4f0e6', 1.3);
        this.add('flier', glove);
        if (id === 'gauntlet') this.add('slap', this.card('SLAP!', { fg: '#ffffff', bg: '#ff8a3a', edge: '#5a1a0a', jag: true, h: 0.22 }));
        if (id === 'unmask') {
          // A purple domino mask that comes off.
          const mask = new THREE.Group();
          const m = this.mat('#7a4ab8');
          const band = this.mesh(new THREE.TorusGeometry(0.1, 0.035, 6, 14, Math.PI), m);
          band.rotation.x = Math.PI / 2;
          band.scale.set(1.2, 1, 0.5);
          mask.add(band);
          for (const s of [-1, 1]) mask.add(this.mesh(new THREE.TorusGeometry(0.035, 0.015, 6, 10), this.mat('#2a1a3a'), s * 0.05, 0, 0.04));
          this.add('mask', mask);
        }
        break;
      }
      case 'card': {
        const card = new THREE.Group();
        card.add(this.mesh(new THREE.BoxGeometry(0.14, 0.2, 0.01), this.mat('#ffd21a', true)));
        this.add('flier', card);
        break;
      }
      case 'pigeon': {
        const p = new THREE.Group();
        const grey = this.mat('#a8b0c0');
        p.add(this.mesh(new THREE.SphereGeometry(0.09, 8, 6), grey));
        (p.children[0] as THREE.Mesh).scale.set(0.9, 0.85, 1.3);
        p.add(this.mesh(new THREE.SphereGeometry(0.06, 8, 6), this.mat('#8a92a8'), 0, 0.07, 0.1));
        const beak = this.mesh(new THREE.ConeGeometry(0.018, 0.05, 5), this.mat('#f0b040'), 0, 0.065, 0.17);
        beak.rotation.x = Math.PI / 2;
        p.add(beak);
        for (const s of [-1, 1]) {
          p.add(this.mesh(new THREE.SphereGeometry(0.012, 5, 4), this.mat('#1a1a1a'), s * 0.035, 0.09, 0.14));
          const wing = new THREE.Group();
          wing.name = s < 0 ? 'wingL' : 'wingR';
          wing.position.set(s * 0.07, 0.03, 0);
          wing.add(this.mesh(new THREE.BoxGeometry(0.16, 0.012, 0.11), grey, s * 0.08, 0, 0));
          p.add(wing);
        }
        const env = this.mesh(new THREE.BoxGeometry(0.16, 0.1, 0.01), this.mat('#fbf4e0'), 0, -0.13, 0.04);
        env.add(this.mesh(new THREE.CircleGeometry(0.02, 10), this.mat('#c8283a'), 0, 0, 0.006));
        env.name = 'envelope';
        p.add(env);
        this.add('flier', p);
        break;
      }
      case 'wanted':
        this.add('flier', this.poster('wanted'));
        break;
      case 'wantyou':
        this.add('flier', this.card('I WANT YOU!', { fg: '#ffffff', bg: '#b8282e', edge: '#1a2a5a', jag: true }));
        this.add('held', this.poster('you'));
        break;
      case 'objection':
        this.add('flier', this.card('OBJECTION!', { fg: '#ffffff', bg: '#2a4fb8', edge: '#0a1030', jag: true, italic: true, h: 0.4 }));
        break;
      case 'foam': {
        const f = this.hand('#3a7ad8', 2.2);
        this.add('flier', f);
        const arm = this.mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 8), this.mat('#f2a33a'));
        arm.geometry.rotateX(Math.PI / 2);
        arm.geometry.translate(0, 0, 0.5);
        this.add('arm', arm);
        break;
      }
      case 'laser': {
        this.add('dot', this.mesh(new THREE.CircleGeometry(0.05, 12), this.mat('#ff2a2a', true)));
        const ray = this.mesh(new THREE.CylinderGeometry(0.006, 0.006, 1, 5), this.mat('#ff4040', true, 0.7));
        ray.geometry.rotateX(Math.PI / 2);
        ray.geometry.translate(0, 0, 0.5);
        this.add('ray', ray);
        this.add('cat', this.cat());
        break;
      }
      case 'lasso': {
        const loop = this.mesh(new THREE.TorusGeometry(0.22, 0.014, 5, 20), this.mat('#c89a5a'));
        loop.rotation.x = Math.PI / 2;
        const g = new THREE.Group();
        g.add(loop);
        this.add('flier', g);
        const rope = this.mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 5), this.mat('#c89a5a'));
        rope.geometry.rotateX(Math.PI / 2);
        rope.geometry.translate(0, 0, 0.5);
        this.add('arm', rope);
        break;
      }
      case 'gavel': {
        const g = new THREE.Group();
        const wood = this.mat('#8a5a32');
        const head = this.mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.6, 10), wood);
        head.rotation.z = Math.PI / 2;
        g.add(head);
        for (const s of [-1, 1]) {
          const band = this.mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.06, 10), this.mat('#e0b040'), s * 0.22, 0, 0);
          band.rotation.z = Math.PI / 2;
          g.add(band);
        }
        g.add(this.mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.1, 8), this.mat('#6a4022'), 0, 0.75, 0));
        this.add('flier', g);
        this.add('order', this.card('ORDER!', { fg: '#ffe680', bg: '#6a3a1a', edge: '#2a1408', jag: true, h: 0.3 }));
        break;
      }
      case 'meme': {
        const frame = new THREE.Group();
        const gold = this.mat('#e8b830');
        for (const [w, h, x, y] of [
          [0.7, 0.07, 0, 0.3],
          [0.7, 0.07, 0, -0.3],
          [0.07, 0.67, 0.32, 0],
          [0.07, 0.67, -0.32, 0],
        ] as const)
          frame.add(this.mesh(new THREE.BoxGeometry(w, h, 0.05), gold, x, y, 0));
        this.add('flier', frame);
        this.add('held', frame.clone());
        break;
      }
      case 'jaccuse':
      case 'you':
        break;
      case 'board':
        this.add('board', this.board());
        break;
      case 'confetti': {
        const cannon = new THREE.Group();
        const barrel = this.mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.42, 10), this.mat('#e84a8a'));
        barrel.rotation.x = Math.PI / 2;
        barrel.position.z = 0.1;
        cannon.add(barrel);
        cannon.add(this.mesh(new THREE.TorusGeometry(0.085, 0.02, 5, 12), this.mat('#ffd21a'), 0, 0, 0.31));
        for (const s of [-1, 1]) {
          const wheel = this.mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 10), this.mat('#6a4a2a'), s * 0.12, -0.06, 0);
          wheel.rotation.z = Math.PI / 2;
          cannon.add(wheel);
        }
        this.add('held', cannon);
        const stream = new THREE.Group();
        const colours = ['#ff5a8a', '#ffd21a', '#4ad0ff', '#7aea6a', '#b88aff'];
        for (let i = 0; i < 26; i++) stream.add(this.mesh(new THREE.PlaneGeometry(0.05, 0.03), this.mat(colours[i % 5], true)));
        this.add('flier', stream);
        break;
      }
    }
  }

  /** The conspiracy board on its wheeled stand, facing +z, its feet at 0: cork, photos, notes, pins and red string. */
  private board(): THREE.Group {
    const g = new THREE.Group();
    const c = document.createElement('canvas');
    c.width = CORK.w;
    c.height = CORK.h;
    const ctx = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    this.texs.push(tex);
    if (ctx) {
      this.drawCork(ctx, null);
      // Their own portrait over the silhouette, once it's drawn (an animal's thumbnail, made for the picker).
      const look = this.who?.look;
      let url = '';
      try {
        url = look ? animalThumbnail(look, 128) : '';
      } catch {
        url = '';
      }
      if (url) {
        const img = new Image();
        img.onload = () => {
          this.drawCork(ctx, img);
          tex.needsUpdate = true;
        };
        img.src = url;
      }
    }
    const { W, H, y } = CORK;
    const cork = this.mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshLambertMaterial({ map: tex, side: THREE.FrontSide }), 0, y, 0.026);
    this.mats.push(cork.material as THREE.Material);
    g.add(cork);
    const wood = this.mat('#7a4e2a');
    g.add(this.mesh(new THREE.BoxGeometry(W + 0.06, H + 0.06, 0.04), this.mat('#5a3a20'), 0, y, 0));
    for (const [w, h, x, yy] of [
      [W + 0.12, 0.06, 0, y + H / 2 + 0.03],
      [W + 0.12, 0.06, 0, y - H / 2 - 0.03],
      [0.06, H + 0.12, W / 2 + 0.03, y],
      [0.06, H + 0.12, -W / 2 - 0.03, y],
    ] as const)
      g.add(this.mesh(new THREE.BoxGeometry(w, h, 0.07), wood, x, yy, 0.02));
    // The stand: two legs, a crossbar, and wheels.
    const metal = this.mat('#5a5e66');
    for (const s of [-1, 1]) {
      g.add(this.mesh(new THREE.BoxGeometry(0.05, y - H / 2 + 0.02, 0.05), metal, s * (W / 2 - 0.1), (y - H / 2) / 2, -0.03));
      g.add(this.mesh(new THREE.BoxGeometry(0.06, 0.04, 0.42), metal, s * (W / 2 - 0.1), 0.07, -0.03));
      for (const z of [-0.2, 0.15]) {
        const wheel = this.mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 10), this.mat('#2a2a2e'), s * (W / 2 - 0.1), 0.045, z - 0.03);
        wheel.rotation.z = Math.PI / 2;
        wheel.name = 'wheel';
        g.add(wheel);
      }
    }
    g.add(this.mesh(new THREE.BoxGeometry(W - 0.2, 0.04, 0.04), metal, 0, 0.3, -0.03));
    // Pin heads that stand off the cork, for a bit of depth as the camera skims past.
    const pinMats = ['#e8283a', '#2a6ae8', '#f0c020', '#2ab86a'].map((col) => this.mat(col));
    const pins = [...PINNED.map(pinOf), PHOTO_PIN];
    pins.forEach((p, i) => {
      const at = corkAt(p.x, p.y);
      const pin = this.mesh(new THREE.SphereGeometry(0.017, 8, 6), i === pins.length - 1 ? pinMats[0] : pinMats[i % 4], at.x, at.y, 0.05);
      g.add(pin);
      const shaft = this.mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.025, 4), metal, at.x, at.y, 0.035);
      shaft.rotation.x = Math.PI / 2;
      g.add(shaft);
    });
    return g;
  }

  /** The cork and all that's on it (with a silhouette in the photo, until their portrait is ready). */
  private drawCork(g: CanvasRenderingContext2D, img: HTMLImageElement | null) {
    const { w, h } = CORK;
    g.fillStyle = '#c69a5e';
    g.fillRect(0, 0, w, h);
    // Speckles in the cork.
    for (let i = 0; i < 900; i++) {
      g.fillStyle = ['#a87c44', '#d8b078', '#8e6634'][i % 3];
      g.globalAlpha = 0.5;
      g.fillRect(hash(i, 11) * w, hash(i, 12) * h, 2 + hash(i, 13) * 3, 2 + hash(i, 14) * 2);
    }
    g.globalAlpha = 1;
    const hand = '"Comic Sans MS", "Marker Felt", "Chalkboard SE", cursive';
    for (const [i, p] of PINNED.entries()) {
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.tilt);
      g.shadowColor = 'rgba(40,20,0,0.35)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 3;
      if (p.kind === 'photo') {
        // A polaroid of someone else: a grey figure and a big question mark.
        g.fillStyle = '#fbfaf4';
        g.fillRect(-48, -32, 96, 74);
        g.shadowColor = 'transparent';
        g.fillStyle = ['#7a8aa0', '#8a7a6a', '#6a8a7a'][i % 3];
        g.fillRect(-42, -26, 84, 54);
        g.fillStyle = '#3a3a48';
        g.beginPath();
        g.arc(0, -4, 12, 0, Math.PI * 2);
        g.fill();
        g.fillRect(-18, 8, 36, 20);
        g.fillStyle = '#ffffff';
        g.font = `700 22px ${hand}`;
        g.textAlign = 'center';
        g.fillText('?', 0, 4);
      } else if (p.kind === 'note') {
        g.fillStyle = p.color!;
        g.fillRect(-42, -26, 84, 66);
        g.shadowColor = 'transparent';
        g.fillStyle = '#2a2a6a';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        const words = p.text!.split(' ');
        const lines = words.length > 2 ? [words.slice(0, 2).join(' '), words.slice(2).join(' ')] : [p.text!];
        g.font = `700 ${lines.length > 1 ? 15 : 19}px ${hand}`;
        lines.forEach((l, j) => g.fillText(l, 0, 8 + (j - (lines.length - 1) / 2) * 18));
      } else {
        // A newspaper clipping: a headline and lines of print.
        g.fillStyle = '#ecebe2';
        g.fillRect(-50, -32, 100, 70);
        g.shadowColor = 'transparent';
        g.fillStyle = '#2a2a2a';
        g.fillRect(-42, -24, 84, 9);
        g.fillStyle = '#8a8a86';
        for (let k = 0; k < 6; k++) g.fillRect(-42, -8 + k * 7, k % 3 === 2 ? 50 : 84, 3);
      }
      g.restore();
    }
    this.drawPhoto(g, img);
    // The red string, pin to pin, over the lot.
    const at = (k: number) => (k < 0 ? PHOTO_PIN : pinOf(PINNED[k]));
    g.strokeStyle = '#d4202c';
    g.lineWidth = 3;
    g.lineCap = 'round';
    g.shadowColor = 'rgba(40,10,0,0.4)';
    g.shadowBlur = 3;
    g.shadowOffsetY = 2;
    for (const [a, b] of THREADS) {
      g.beginPath();
      g.moveTo(at(a).x, at(a).y);
      g.lineTo(at(b).x, at(b).y);
      g.stroke();
    }
    g.shadowColor = 'transparent';
    // And a scrawl: circled, with question marks.
    g.strokeStyle = '#d4202c';
    g.lineWidth = 4;
    g.beginPath();
    g.ellipse(PHOTO.x, PHOTO.y + 4, PHOTO.w * 0.62, PHOTO.h * 0.6, -0.05, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = '#d4202c';
    g.font = `700 34px ${hand}`;
    g.textAlign = 'center';
    g.fillText('?!', PHOTO.x - PHOTO.w * 0.62, PHOTO.y + PHOTO.h * 0.5);
    g.fillText('!!', PHOTO.x + PHOTO.w * 0.5, PHOTO.y - PHOTO.h * 0.42);
  }

  /** The photo of the one nominated, with their name: their portrait if there is one, or a silhouette in their colour. */
  private drawPhoto(g: CanvasRenderingContext2D, img: HTMLImageElement | null) {
    const { x, y, w, h } = PHOTO;
    g.save();
    g.translate(x, y);
    g.rotate(0.04);
    g.shadowColor = 'rgba(40,20,0,0.4)';
    g.shadowBlur = 8;
    g.shadowOffsetY = 4;
    g.fillStyle = '#fbfaf4';
    g.fillRect(-w / 2, -h / 2, w, h);
    g.shadowColor = 'transparent';
    const pw = w - 18;
    const ph = pw;
    const top = -h / 2 + 9;
    g.fillStyle = '#9ec8e0';
    g.fillRect(-pw / 2, top, pw, ph);
    if (img) g.drawImage(img, -pw / 2, top, pw, ph);
    else {
      // Head and shoulders in their own colour.
      g.fillStyle = this.who?.look?.color ?? '#6a5a7a';
      g.beginPath();
      g.arc(0, top + ph * 0.42, ph * 0.22, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.ellipse(0, top + ph, ph * 0.38, ph * 0.3, 0, Math.PI, 0);
      g.fill();
    }
    g.fillStyle = '#2a2a3a';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const name = this.who?.name || '???';
    let size = 22;
    g.font = `700 ${size}px "Comic Sans MS", "Marker Felt", cursive`;
    while (size > 11 && g.measureText(name).width > w - 12) g.font = `700 ${--size}px "Comic Sans MS", "Marker Felt", cursive`;
    g.fillText(name, 0, top + ph + (h / 2 - (top + ph)) / 2 + 1);
    g.restore();
    // Its pin, on top.
    g.fillStyle = '#e8283a';
    g.beginPath();
    g.arc(PHOTO_PIN.x, PHOTO_PIN.y, 6, 0, Math.PI * 2);
    g.fill();
  }

  private pearlMat: THREE.Material | null = null;
  private pearl() {
    return (this.pearlMat ??= this.mat('#fff8f0', true));
  }

  /** An exclamation mark: a bar and a dot. */
  private bang(): THREE.Group {
    const g = new THREE.Group();
    const m = this.mat(['#ff5a3a', '#ffd21a'][Math.floor(Math.random() * 2)], true);
    g.add(this.mesh(new THREE.BoxGeometry(0.18, 0.6, 0.04), m, 0, 0.25, 0));
    g.add(this.mesh(new THREE.BoxGeometry(0.18, 0.18, 0.04), m, 0, -0.25, 0));
    return g;
  }

  /** A little ginger cat, low-poly, facing +z. */
  private cat(): THREE.Group {
    const g = new THREE.Group();
    const fur = this.mat('#f0a050');
    const body = this.mesh(new THREE.SphereGeometry(0.1, 8, 6), fur, 0, 0.1, 0);
    body.scale.set(0.8, 0.75, 1.4);
    g.add(body);
    g.add(this.mesh(new THREE.SphereGeometry(0.075, 8, 6), fur, 0, 0.17, 0.14));
    for (const s of [-1, 1]) {
      const ear = this.mesh(new THREE.ConeGeometry(0.03, 0.06, 4), fur, s * 0.04, 0.25, 0.14);
      g.add(ear);
      g.add(this.mesh(new THREE.SphereGeometry(0.012, 5, 4), this.mat('#2a2a1a'), s * 0.03, 0.18, 0.21));
      for (const z of [-0.08, 0.08]) g.add(this.mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.08, 5), fur, s * 0.05, 0.04, z));
    }
    const tail = this.mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.2, 5), fur, 0, 0.18, -0.16);
    tail.rotation.x = -0.6;
    tail.name = 'tail';
    g.add(tail);
    return g;
  }

  // ---------------------------------------------------------------- the show, a frame of it

  private once(key: string, at: number, age: number, f: () => void) {
    if (age >= at && !this.done.has(key)) {
      this.done.add(key);
      // Only if it came due since the last frame and not long ago: a screen that stuttered still hears it as it
      // sees it, and one that joined late doesn't play every sound at once.
      if (this.lastAge < at && age - at < 1.2) f();
    }
  }
  /** The moment of the last frame. */
  private lastAge = -1;

  private show(name: string, on: boolean) {
    const o = this.kit[name];
    if (o) o.visible = on;
    return o;
  }

  /** The two ends of the flight: from the nominator's paw to the nominee's face. */
  private ends(from: NomEnd, to: NomEnd) {
    const a = from.face.clone().addScaledVector(from.fwd, 0.2 + from.top * 0.15).addScaledVector(UP, -from.top * 0.15);
    const b = to.face.clone().addScaledVector(to.fwd, 0.1 + to.top * 0.12);
    return { a, b };
  }

  update(age: number, from: NomEnd, to: NomEnd, camera: THREE.Camera, aspect = 1.6): NomFrame {
    const id = this.move.id;
    this.aspect = aspect;
    const { a, b } = this.ends(from, to);
    const dir = b.clone().sub(a);
    const dist = Math.max(0.5, dir.length());
    dir.divideScalar(dist);
    const side = new THREE.Vector3().crossVectors(UP, dir).normalize();
    const flat = (v: THREE.Vector3) => new THREE.Vector3(v.x, 0, v.z).normalize();
    // How high it arcs on the way.
    const arc = id === 'finger' || id === 'objection' || id === 'wantyou' ? 0.12 : id === 'gauntlet' || id === 'lasso' ? 0.3 + dist * 0.12 : 0.2 + dist * 0.08;
    const flying = age >= NOM.throw && age < NOM.hit;
    const u = Math.min(1, Math.max(0, (age - NOM.throw) / (NOM.hit - NOM.throw)));
    const uu = u * 0.55 + ease(u) * 0.45;
    const along = (k: number) => a.clone().lerp(b, k).addScaledVector(UP, arc * 4 * k * (1 - k));
    const at = along(uu);
    const hitAge = age - NOM.hit;
    const landed = hitAge >= 0;

    // The sounds, each at its moment.
    this.once('shout', 0.25, age, () => this.sound(id === 'card' ? 'whistle' : id === 'objection' ? 'objection' : id === 'jaccuse' ? 'spot' : 'call'));
    // (Plain "YOU!" throws nothing: just the call, and their gasp.)
    this.once('throw', NOM.throw, age, () => id !== 'you' && this.sound(id === 'laser' ? 'zap' : id === 'pigeon' ? 'flap' : id === 'confetti' ? 'cannon' : 'whoosh'));
    this.once('hit', NOM.hit, age, () => id !== 'you' && this.sound(id === 'gauntlet' ? 'slap' : id === 'gavel' ? 'gavel' : id === 'laser' ? 'meow' : id === 'confetti' ? 'party' : id === 'board' ? 'dun2' : 'boop'));
    if (this.move.react === 'dun') for (let i = 0; i < 3; i++) this.once(`dun${i}`, NOM.hit + 0.15 + i * 0.5, age, () => this.sound(i === 2 ? 'dun2' : 'dun'));
    this.once('react', NOM.hit + 0.2, age, () => this.move.react !== 'dun' && this.sound(this.move.react === 'faint' ? 'faint' : this.move.react === 'tremble' ? 'shiver' : 'gasp'));
    // The pop where it lands.
    if (landed && !this.done.has('burst') && id !== 'you') {
      this.done.add('burst');
      // (Kept small and off to the side of the face: the camera is about to be right there.)
      const bk = id === 'confetti' ? 'confetti' : id === 'gavel' ? 'dust' : 'sparkle';
      const at = id === 'gavel' ? b.clone().addScaledVector(side, -to.top * 0.5).setY(to.floor + 0.1) : b.clone().addScaledVector(UP, to.top * 0.2);
      this.bursts.add(NOM.hit, bk, at, id === 'confetti' ? 0.9 : 0.6);
      if (id === 'confetti') this.bursts.add(NOM.hit + 0.15, 'confetti', b.clone().addScaledVector(UP, 0.3 + to.top * 0.3), 0.8);
    }
    this.bursts.update(age, camera);

    // Whoever is nominated, as it lands: their face then, for a steady close-up.
    if (landed && !this.rest) {
      const fwd = flat(to.fwd);
      this.rest = { face: to.face.clone(), fwd, side: new THREE.Vector3().crossVectors(UP, fwd).normalize(), top: to.top, front: to.front ?? 0 };
    }

    // ---- the props
    for (const k of Object.keys(this.kit)) this.kit[k].visible = false;
    const face = (o: THREE.Object3D) => o.quaternion.copy(camera.quaternion);
    // The shout over the nominator, while they make it.
    if (age > 0.2 && age < (id === 'board' ? NOM.throw : NOM.hit)) {
      const s = this.show('shout', true)!;
      const k = easeOut((age - 0.2) / 0.25);
      s.position.copy(from.face).addScaledVector(UP, 0.22 + from.top * 0.2).addScaledVector(side, -0.1);
      // ("YOU!" pops in big, with a bounce.)
      const pop = id === 'you' ? 1 + 0.25 * Math.sin(Math.min(1, (age - 0.2) / 0.35) * Math.PI) : 1;
      s.scale.setScalar(Math.max(0.01, k) * pop * (0.9 + from.top * 0.25) * (1 + Math.sin(age * 9) * 0.03));
      face(s);
    }
    const flier = this.kit.flier;
    const held = (o: THREE.Object3D, up = 0.05, out = 0.15) => {
      o.visible = true;
      o.position.copy(a).addScaledVector(UP, up).addScaledVector(from.fwd, out);
    };
    switch (id) {
      case 'board':
        this.placeBoard(age, from, dir);
        break;
      case 'card':
        if (age > 0.3 && age < NOM.throw) {
          // Held up high, with a blast on the whistle.
          held(flier, 0.15 + from.top * 0.2, 0.05);
          flier.position.addScaledVector(side, 0.15 + from.top * 0.1);
          face(flier);
          flier.rotateZ(Math.sin(age * 8) * 0.12);
        }
        break;
      case 'wantyou':
        if (age > 0.3 && age < NOM.throw) {
          const p = this.show('held', true)!;
          p.position.copy(from.face).addScaledVector(side, from.top * 0.45 + 0.2).addScaledVector(from.fwd, 0.2);
          p.scale.setScalar(easeOut((age - 0.3) / 0.3) * (1 + from.top * 0.6));
          p.lookAt(p.position.clone().add(from.fwd));
        }
        break;
      case 'lasso':
        if (age > 0.2 && age < NOM.throw) {
          // Twirled over the head.
          held(flier, from.top * 0.45 + 0.25, -0.1);
          flier.rotation.set(0, age * 12, 0);
          flier.scale.setScalar(1);
        }
        break;
      case 'foam':
        if (age > 0.3 && age < NOM.throw) {
          held(flier, 0.08, 0.1);
          flier.lookAt(flier.position.clone().add(dir));
          flier.scale.setScalar(2.2 * easeOut((age - 0.3) / 0.3) * (1 + Math.sin(age * 10) * 0.04));
        }
        break;
      case 'meme':
        if (age > 0.35 && age < NOM.throw + 0.1) {
          const fr = this.show('held', true)!;
          fr.position.copy(from.face).addScaledVector(camera.position.clone().sub(from.face).normalize(), 0.3).addScaledVector(UP, -from.top * 0.05);
          fr.scale.setScalar((0.7 + from.top * 0.8) * easeOut((age - 0.35) / 0.2));
          face(fr);
        }
        break;
      case 'confetti':
        if (age > 0.2 && age < NOM.hit + 0.6) {
          const c = this.show('held', true)!;
          c.position.copy(from.face).addScaledVector(side, -(0.25 + from.top * 0.3)).addScaledVector(UP, -from.top * 0.35).addScaledVector(from.fwd, 0.15);
          c.scale.setScalar((0.8 + from.top * 0.6) * easeOut((age - 0.2) / 0.3));
          c.lookAt(c.position.clone().add(dir));
          c.rotateX(-0.35 - (age > NOM.throw && age < NOM.throw + 0.2 ? 0.25 : 0));
        }
        break;
    }
    // In flight.
    if (flying) {
      if (id === 'laser') {
        // The red dot runs along the ground, the cat after it.
        const g0 = new THREE.Vector3(a.x, groundBelow(from), a.z).addScaledVector(dir, 0.5);
        const g1 = new THREE.Vector3(b.x, groundBelow(to), b.z).addScaledVector(flat(to.fwd), 0.45);
        const dot = this.show('dot', true)!;
        dot.position.copy(g0).lerp(g1, Math.min(1, uu * 1.15)).add(new THREE.Vector3(Math.sin(age * 23) * 0.06, 0.02, Math.cos(age * 17) * 0.06));
        dot.rotation.set(-Math.PI / 2, 0, 0);
        this.ray(a, dot.position);
        const cat = this.show('cat', true)!;
        cat.position.copy(g0).lerp(g1, Math.max(0, uu * 1.15 - 0.2));
        cat.position.y += Math.abs(Math.sin(age * 22)) * 0.05;
        cat.lookAt(cat.position.clone().add(flat(dir)));
        cat.scale.setScalar(1.3);
        cat.getObjectByName('tail')!.rotation.z = Math.sin(age * 14) * 0.5;
      } else if (id === 'jaccuse') {
        this.spot(from, to, uu);
      } else if (id === 'gavel') {
        // Up in the sky over them, about to come down.
        flier.visible = u > 0.55;
        flier.position.copy(b).addScaledVector(side, -(to.top * 0.6 + 0.35)).addScaledVector(UP, 3 - 2.5 * ease((u - 0.55) / 0.45));
        flier.lookAt(flier.position.clone().add(dir));
        flier.scale.setScalar(0.8 + to.top * 0.4);
      } else if (flier) {
        flier.visible = true;
        flier.position.copy(at);
        if (id === 'pigeon') flier.position.addScaledVector(UP, Math.sin(u * Math.PI * 3) * 0.08);
        const next = along(Math.min(1, uu + 0.05));
        if (id === 'objection' || id === 'wantyou') {
          face(flier);
          flier.scale.setScalar(0.6 + u * 0.9);
          flier.rotateZ(Math.sin(age * 20) * 0.08);
        } else if (id === 'wanted' || id === 'card') {
          flier.lookAt(next);
          flier.rotateZ(age * 14);
          flier.rotateX(age * 6);
        } else if (id === 'gauntlet' || id === 'unmask') {
          flier.lookAt(next);
          if (id === 'gauntlet') flier.rotateZ(age * 16);
        } else if (id === 'lasso') {
          flier.rotation.set(0, age * 10, 0);
          flier.scale.setScalar(1 + u * 0.2);
          this.rope(a, at);
        } else if (id === 'foam') {
          flier.lookAt(next);
          flier.scale.setScalar(2.2);
          this.rope(a, at, 'arm');
        } else if (id === 'confetti') {
          // A stream of bits, the leading edge flying ahead.
          flier.position.set(0, 0, 0);
          flier.children.forEach((c, i) => {
            const k = Math.max(0, uu - hash(i, 3) * 0.25);
            c.position.copy(along(k)).addScaledVector(side, (hash(i, 4) - 0.5) * 0.35 * k).addScaledVector(UP, (hash(i, 5) - 0.5) * 0.3 * k);
            c.rotation.set(age * 9 + i, age * 7 + i * 2, 0);
          });
        } else if (id === 'meme') {
          flier.lookAt(next);
          flier.scale.setScalar(0.7 + to.top * 0.8);
        } else flier.lookAt(next);
        if (id === 'pigeon') {
          const flap = Math.sin(age * 30) * 0.7;
          flier.getObjectByName('wingL')!.rotation.z = flap;
          flier.getObjectByName('wingR')!.rotation.z = -flap;
          flier.scale.setScalar(1.3);
        }
        if (id === 'plane' || id === 'finger') {
          // A dotted line behind it.
          const tr = this.show('trail', true)!;
          tr.children.forEach((d, i) => {
            const k = uu - (i + 1) * 0.04;
            d.visible = k > 0;
            d.position.copy(along(Math.max(0, k)));
          });
        }
      }
    }
    // Landed.
    if (landed) this.landed(hitAge, age, to, a, b, side, dir, camera);
    if (id === 'jaccuse' && age >= NOM.hit) this.spot(from, to, 1);
    if (id === 'jaccuse' && age < NOM.throw && age > 0.2) this.spot(from, to, 0);

    // ---- how the two of them are posed
    const byPose = this.byPose;
    byPose.off.set(0, 0, 0);
    byPose.tip = 0;
    byPose.roll = 0;
    // Turned to face them (most of the way), for as long as they point.
    // (At the board, while they rant at it.)
    const fl = id === 'board' && this.boardAt && hitAge < 0 ? flat(this.boardAt.mid.clone().sub(from.face)) : flat(dir);
    const want = Math.atan2(fl.x, fl.z) - Math.atan2(from.fwd.x, from.fwd.z);
    const wrap = Math.atan2(Math.sin(want), Math.cos(want)) * 0.8;
    byPose.yaw = wrap * span(age, 0.05, 0.4) * (1 - span(hitAge, 0.6, 0.9));
    byPose.anim = age < 0.15 || hitAge > 0.9 ? null : id === 'lasso' || id === 'card' ? (age < NOM.throw ? 'hand' : 'point') : 'point';
    // A little lean into it as they let go.
    if (id === 'board') {
      // Jab, jab, jab at it.
      if (age > 0.6 && age < NOM.throw + 0.4) byPose.off.addScaledVector(fl, Math.max(0, Math.sin((age - 0.6) * 15)) * (0.03 + from.top * 0.03));
    } else if (age > NOM.throw - 0.2 && age < NOM.throw + 0.3) byPose.off.addScaledVector(from.fwd, Math.sin(((age - NOM.throw + 0.2) / 0.5) * Math.PI) * 0.06);
    const toPose = landed ? this.react(hitAge, to) : null;

    // ---- the camera
    const f = this.frame;
    f.cut = false;
    f.close = false;
    let shot = 0;
    if (id === 'board' && this.boardAt && age < NOM.hit) {
      shot = this.boardShot(age, from, aspect);
    } else if (age < NOM.throw || (id === 'you' && age < NOM.hit)) {
      // The nominator, three-quarters on, closing in as they wind up (or, for plain "YOU!", as they say it).
      const wind = id === 'you' ? NOM.hit : NOM.throw;
      const out = flat(dir);
      const sideN = new THREE.Vector3().crossVectors(UP, out).normalize();
      const d = (0.95 + from.top * 1.25) * (1.18 - 0.18 * ease(age / wind)) * (aspect < 0.8 ? 1.35 : 1) * (id === 'you' ? 1.15 : 1);
      f.pos.copy(from.face).addScaledVector(out.clone().multiplyScalar(0.8).addScaledVector(sideN, 0.75).normalize(), d).addScaledVector(UP, 0.1 + from.top * 0.12);
      f.look.copy(from.face).addScaledVector(UP, -from.top * 0.05).addScaledVector(dir, 0.15);
      f.close = d < 1.6;
    } else if (age < NOM.hit) {
      shot = 1;
      // Whipping along after it, from just behind and above.
      const low = id === 'laser' ? this.kit.cat.position.clone().addScaledVector(UP, 0.15) : at;
      f.pos.copy(low).addScaledVector(dir, -1.15).addScaledVector(UP, id === 'laser' ? 0.75 : 0.35).addScaledVector(side, 0.3);
      f.look.copy(low).addScaledVector(dir, 0.9);
    } else if (this.rest) {
      shot = 2;
      // Right in their face.
      const r = this.rest;
      const dc = (0.42 + r.top * 0.42 + r.front) * (aspect < 0.8 ? 1.3 : 1);
      let d = dc * (1.7 - 0.7 * easeOut(hitAge / 0.3));
      if (this.move.react === 'dun') {
        const i = hitAge < 0.15 ? -1 : Math.min(2, Math.floor((hitAge - 0.15) / 0.5));
        if (i !== this.dunShot) {
          this.dunShot = i;
          f.cut = true;
        }
        d = dc * (i < 0 ? 1.7 : [2.6, 1.7, 0.95][i]) * (i >= 0 ? 1 - 0.06 * easeOut((hitAge - 0.15 - i * 0.5) / 0.12) : 1);
      }
      const live = to.face;
      f.look.copy(r.face).lerp(live, this.move.react === 'faint' ? 0.7 : 0.35);
      f.pos.copy(r.face).addScaledVector(r.fwd, d).addScaledVector(r.side, d * 0.16).addScaledVector(UP, d * 0.06);
      if (this.move.react === 'faint') f.pos.addScaledVector(live.clone().sub(r.face), 0.35);
      f.close = true;
    }
    if (shot !== this.shot) {
      // (Into the flight it whips round; into the close-up it cuts.)
      f.cut = shot !== 1 || id === 'board';
      this.shot = shot;
    }
    // A thump of a shake where it lands hard.
    const thump = id === 'objection' || id === 'gavel' || id === 'gauntlet' ? Math.max(0, 1 - Math.max(0, hitAge) / 0.35) * (hitAge >= 0 ? 1 : 0) : 0;
    if (thump) f.pos.add(new THREE.Vector3(Math.sin(age * 90) * 0.025, Math.cos(age * 77) * 0.02, 0).multiplyScalar(thump));
    f.by = byPose;
    f.target = toPose;
    this.lastAge = age;
    return f;
  }

  private dunShot = -2;
  private aspect = 1.6;

  /** Where the conspiracy board stands once it's rolled in: its spot and way it faces, its size, its middle. */
  private boardAt: { home: THREE.Vector3; n: THREE.Vector3; out: THREE.Vector3; sideN: THREE.Vector3; sc: number; mid: THREE.Vector3 } | null = null;

  /** The board rolls in from the side to stand beside the nominator, facing the camera, with a wobble as it stops. */
  private placeBoard(age: number, from: NomEnd, dir: THREE.Vector3) {
    if (!this.boardAt) {
      // (Fixed where it was at the start, so it doesn't follow them about as they jab.)
      const out = new THREE.Vector3(dir.x, 0, dir.z).normalize();
      const sideN = new THREE.Vector3().crossVectors(UP, out).normalize();
      const n = out.clone().multiplyScalar(0.8).addScaledVector(sideN, 0.75).normalize();
      const sc = 0.55 + from.top * 0.5;
      const reach = 0.55 + sc * 0.55;
      const home = new THREE.Vector3(from.face.x, from.floor, from.face.z).addScaledVector(out, reach).addScaledVector(sideN, -reach);
      const mid = home.clone().addScaledVector(UP, CORK.y * sc);
      this.boardAt = { home, n, out, sideN, sc, mid };
    }
    const { home, n, sideN, sc } = this.boardAt;
    const b = this.show('board', true)!;
    const k = easeOut((age - 0.1) / 0.55);
    const roll = (1 - k) * 2.6 * sc;
    b.position.copy(home).addScaledVector(sideN, -roll);
    b.rotation.set(0, Math.atan2(n.x, n.z), 0);
    // A wobble on its wheels as it stops.
    const settle = age - 0.65;
    b.rotateZ(settle > 0 ? Math.sin(settle * 18) * 0.05 * Math.max(0, 1 - settle / 0.6) : 0);
    b.scale.setScalar(sc * Math.max(0.01, Math.min(1, age / 0.1)));
    for (const w of b.children) if (w.name === 'wheel') w.rotation.x = roll / 0.045;
    b.updateMatrixWorld(true);
  }

  /** A point on the board in the world, from the cork's pixels. */
  private onBoard(px: number, py: number) {
    return this.kit.board.localToWorld(corkAt(px, py));
  }

  /**
   * The camera for the board: the nominator and the board side by side as they rant at it, then skimming along the
   * red string, pin to pin, to the photo of the one nominated.
   */
  private boardShot(age: number, from: NomEnd, aspect: number): number {
    const f = this.frame;
    const { n, sc, mid } = this.boardAt!;
    const tall = aspect < 0.8;
    if (age < NOM.throw) {
      // (On a screen held upright, further back and more on the board, so it all fits across.)
      const centre = from.face.clone().lerp(mid, tall ? 0.55 : 0.5);
      const d = (1.9 + from.top * 1.1) * (1.1 - 0.1 * ease(age / NOM.throw)) * (tall ? 2.5 : 1);
      f.pos.copy(centre).addScaledVector(n, d).addScaledVector(UP, 0.15 + from.top * 0.1);
      f.look.copy(centre);
      f.close = false;
      return 0;
    }
    const u = Math.min(1, (age - NOM.throw) / (NOM.hit - NOM.throw - 0.15));
    const pts = [...TRAIL.map((i) => pinOf(PINNED[i])), { x: PHOTO.x, y: PHOTO.y }].map((p) => this.onBoard(p.x, p.y));
    const along = (k: number) => {
      // By length along the string.
      const lens = pts.slice(1).map((p, i) => p.distanceTo(pts[i]));
      let left = Math.max(0, Math.min(1, k)) * lens.reduce((x, y) => x + y, 0);
      for (let i = 0; i < lens.length; i++) {
        if (left <= lens[i] || i === lens.length - 1) return pts[i].clone().lerp(pts[i + 1], Math.min(1, left / lens[i]));
        left -= lens[i];
      }
      return pts[pts.length - 1].clone();
    };
    const k = u * 0.35 + ease(u) * 0.65;
    const here = along(k);
    const d = sc * (0.42 + 0.3 * ease(u)) * (tall ? 1.5 : 1);
    f.pos.copy(here).addScaledVector(n, d).addScaledVector(UP, 0.04 * sc);
    f.look.copy(along(Math.min(1, k + 0.12)));
    f.close = true;
    return 1;
  }

  /** A thin line (the laser) from a to b. */
  private ray(a: THREE.Vector3, b: THREE.Vector3) {
    const r = this.show('ray', true)!;
    r.position.copy(a);
    r.lookAt(b);
    r.scale.set(1, 1, a.distanceTo(b));
  }

  /** The rope (or the foam finger's arm) out to where its end has got to. */
  private rope(a: THREE.Vector3, b: THREE.Vector3, name = 'arm') {
    const r = this.show(name, true)!;
    r.position.copy(a);
    r.lookAt(b);
    r.scale.set(name === 'arm' && this.move.id === 'foam' ? 1.4 : 1, name === 'arm' && this.move.id === 'foam' ? 1.4 : 1, Math.max(0.01, a.distanceTo(b)));
  }

  /** The spotlight from high above, swung from the nominator (k 0) to the nominee (k 1). */
  private spot(from: NomEnd, to: NomEnd, k: number) {
    const fx = from.face.x + (to.face.x - from.face.x) * k;
    const fz = from.face.z + (to.face.z - from.face.z) * k;
    const gy = groundBelow(k < 0.5 ? from : to);
    const top = new THREE.Vector3(fx * 0.3, gy + 7, fz * 0.3);
    const foot = new THREE.Vector3(fx, gy, fz);
    const beam = this.show('beam', true)!;
    beam.position.copy(top);
    const len = top.distanceTo(foot);
    beam.scale.set(1, len, 1);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), foot.clone().sub(top).normalize());
    const pool = this.show('pool', true)!;
    pool.position.copy(foot).setY(gy + 0.03);
  }

  /** What's left of the props once it's landed, and the reaction's bits round their face. */
  private landed(h: number, age: number, to: NomEnd, a: THREE.Vector3, b: THREE.Vector3, side: THREE.Vector3, dir: THREE.Vector3, camera: THREE.Camera) {
    const id = this.move.id;
    const r = this.rest!;
    const flier = this.kit.flier;
    const facing = (o: THREE.Object3D) => o.quaternion.copy(camera.quaternion);
    // The little pop of hearts (or "!"s) round their head.
    if (h < 1.1 && id !== 'you') {
      const pops = this.show('pops', true)!;
      const k = easeOut(h / 0.6);
      pops.children.forEach((p, i) => {
        const ang = (i / pops.children.length) * Math.PI * 2 + 0.3;
        p.position.copy(r.face).addScaledVector(r.side, Math.cos(ang) * (0.12 + r.top * 0.3) * k).addScaledVector(UP, Math.sin(ang) * (0.1 + r.top * 0.24) * k + h * 0.1).addScaledVector(r.fwd, 0.1);
        facing(p);
        p.scale.setScalar((0.05 + r.top * 0.035) * (1 - span(h, 0.7, 1.1)) * (0.8 + hash(i, 1) * 0.5));
      });
    }
    // What they say back.
    if (h > 0.25) {
      const s = this.show('reply', true)!;
      const dc = 0.42 + r.top * 0.42 + r.front;
      // (Over the head on a screen held upright, where there's no room beside it.)
      const tall = this.aspect < 0.8;
      s.position.copy(r.face).addScaledVector(r.fwd, dc * 0.35).addScaledVector(r.side, tall ? 0 : -dc * 0.16).addScaledVector(UP, dc * (tall ? 0.3 : 0.15));
      facing(s);
      s.scale.setScalar(dc * 0.3 * easeOut((h - 0.25) / 0.2));
    }
    const chest = r.face.clone().addScaledVector(UP, -r.top * 0.3).addScaledVector(r.fwd, 0.12 + r.top * 0.15);
    switch (id) {
      case 'wanted':
        // Stuck on the front of them.
        if (flier) {
          flier.visible = true;
          flier.position.copy(chest);
          flier.lookAt(chest.clone().add(r.fwd));
          flier.rotateZ(0.12);
          flier.scale.setScalar(0.8 + r.top * 0.4);
        }
        break;
      case 'gauntlet':
        if (h < 0.6) {
          const s = this.show('slap', true)!;
          s.position.copy(r.face).addScaledVector(r.side, 0.15 + r.top * 0.12).addScaledVector(r.fwd, 0.1);
          facing(s);
          s.scale.setScalar(easeOut(h / 0.12) * (0.8 + r.top * 0.4));
          // The glove drops away.
          flier.visible = true;
          flier.position.copy(b).addScaledVector(UP, -h * h * 3).addScaledVector(r.side, h * 0.4);
          flier.rotateZ(0.2);
        }
        break;
      case 'unmask':
        if (h < 1.2) {
          // The mask on their face for a blink, then pulled off and flung away up.
          const m = this.show('mask', true)!;
          const off = span(h, 0.15, 0.6);
          m.position.copy(r.face).addScaledVector(r.fwd, 0.12 + r.top * 0.1).addScaledVector(dir, -off * 1.2).addScaledVector(UP, off * 0.8);
          m.lookAt(m.position.clone().add(r.fwd));
          m.rotateZ(off * 9);
          m.scale.setScalar(0.9 + r.top * 0.7);
        }
        break;
      case 'card':
        // Held up in front of them.
        if (h < 1.6 && flier) {
          flier.visible = true;
          flier.position.copy(r.face).addScaledVector(r.fwd, 0.3 + r.top * 0.25).addScaledVector(r.side, 0.12 + r.top * 0.2).addScaledVector(UP, 0.05);
          facing(flier);
          flier.rotateZ(-0.2);
        }
        break;
      case 'pigeon':
        if (h < 1.5 && flier) {
          // It drops the summons in their lap and flaps off.
          flier.visible = true;
          flier.position.copy(b).addScaledVector(UP, h * 1.5).addScaledVector(dir, h * 0.6);
          flier.lookAt(flier.position.clone().add(dir).addScaledVector(UP, 0.6));
          const flap = Math.sin(age * 30) * 0.7;
          flier.getObjectByName('wingL')!.rotation.z = flap;
          flier.getObjectByName('wingR')!.rotation.z = -flap;
          flier.getObjectByName('envelope')!.visible = false;
        }
        break;
      case 'foam':
        // A boop, then the arm draws back.
        if (h < 0.8) {
          const back = span(h, 0.15, 0.6);
          const tip = b.clone().addScaledVector(dir, -0.15 - r.top * 0.1).lerp(a, back);
          flier.visible = true;
          flier.position.copy(tip);
          flier.lookAt(tip.clone().add(dir));
          flier.scale.setScalar(1.6 * (1 - 0.15 * Math.sin(Math.min(1, h / 0.15) * Math.PI)));
          this.rope(a, tip, 'arm');
        }
        break;
      case 'lasso': {
        // Round them, pulled tight.
        const loop = flier;
        loop.visible = true;
        loop.position.copy(chest).addScaledVector(r.fwd, -0.1 - r.top * 0.1);
        loop.rotation.set(0, 0, 0);
        const tight = 1 - 0.35 * easeOut(h / 0.3);
        loop.scale.setScalar((0.6 + r.top * 0.6) * tight);
        this.rope(a, loop.position.clone().addScaledVector(dir, -(0.2 + r.top * 0.15)));
        break;
      }
      case 'laser': {
        // The cat pounces into their lap.
        const cat = this.show('cat', true)!;
        const k = Math.min(1, h / 0.35);
        const g1 = new THREE.Vector3(b.x, groundBelow(to), b.z).addScaledVector(r.fwd, 0.45);
        cat.position.copy(g1).lerp(chest.clone().addScaledVector(UP, -0.1), k).addScaledVector(UP, Math.sin(k * Math.PI) * 0.4);
        cat.lookAt(cat.position.clone().sub(r.fwd));
        cat.scale.setScalar(1.3);
        break;
      }
      case 'gavel': {
        // It comes down beside them with a bang, and rests there.
        if (h < 1.8) {
          flier.visible = true;
          flier.position.copy(b).addScaledVector(side, -(to.top * 0.6 + 0.35)).addScaledVector(UP, Math.max(0, 0.5 - h * 4) - 0.25);
          flier.lookAt(flier.position.clone().add(dir));
          flier.rotateX(h < 0.15 ? 0 : -0.15 * Math.sin(Math.min(1, (h - 0.15) / 0.3) * Math.PI));
          flier.scale.setScalar(0.8 + to.top * 0.4);
          if (h < 1) {
            const o = this.show('order', true)!;
            o.position.copy(r.face).addScaledVector(UP, r.top * 0.35 + 0.15).addScaledVector(r.side, 0.1);
            facing(o);
            o.scale.setScalar(easeOut(h / 0.15) * (0.9 + r.top * 0.4));
          }
        }
        break;
      }
      case 'meme': {
        const fr = flier;
        fr.visible = true;
        fr.position.copy(r.face).addScaledVector(camera.position.clone().sub(r.face).normalize(), 0.2 + r.front);
        facing(fr);
        fr.scale.setScalar((0.55 + r.top * 0.55) * (1 + 0.15 * (1 - easeOut(h / 0.15))));
        break;
      }
      case 'confetti':
        if (h < 1.6) {
          // Streamers settling over them.
          flier.visible = true;
          flier.children.forEach((c, i) => {
            const ang = hash(i, 6) * Math.PI * 2;
            c.position
              .copy(r.face)
              .addScaledVector(r.side, Math.cos(ang) * (0.15 + r.top * 0.3) * (0.5 + h))
              .addScaledVector(UP, 0.3 + r.top * 0.2 - h * 0.5 + hash(i, 7) * 0.3)
              .addScaledVector(r.fwd, Math.sin(ang) * 0.2 + 0.1);
            c.rotation.set(age * 6 + i, age * 5 + i, 0);
          });
        }
        break;
    }
    // ---- the reaction's own bits
    const react = this.move.react;
    if (react === 'tremble') {
      const sw = this.show('sweat', true)!;
      sw.children.forEach((d, i) => {
        const k = (h * 1.3 + hash(i, 8)) % 1;
        const s = i % 2 ? 1 : -1;
        d.position
          .copy(r.face)
          .addScaledVector(r.side, s * (0.1 + r.top * 0.16 + k * 0.08))
          .addScaledVector(UP, r.top * 0.12 - k * 0.25)
          .addScaledVector(r.fwd, 0.04);
        d.scale.setScalar((0.8 + r.top * 0.5) * (1 - k * 0.5));
      });
    }
    if (react === 'pearls') {
      const p = this.show('pearls', true)!;
      p.position.copy(r.face).addScaledVector(UP, -r.top * 0.22 - 0.04).addScaledVector(r.fwd, 0.04);
      // (A ring round the neck, dipping at the front.)
      p.quaternion.setFromAxisAngle(r.side, 0.35);
      p.scale.setScalar(0.7 + r.top * 0.5);
    }
    if (react === 'freeze') {
      // A light in their face, from the front.
      const beam = this.show('beam', true)!;
      const src = r.face.clone().addScaledVector(r.fwd, 3).addScaledVector(UP, 0.4);
      beam.position.copy(src);
      beam.scale.set(0.6, src.distanceTo(r.face), 0.6);
      beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), r.face.clone().sub(src).normalize());
    }
    this.dizzy.update(age, react === 'faint' && h > 1 ? to.face.clone().addScaledVector(UP, to.top * 0.25 + 0.08) : null, 0.1 + to.top * 0.12, camera);
  }

  /** The nominee's reaction this moment (`h` seconds after it landed). */
  private react(h: number, to: NomEnd): NomPose | null {
    const p = this.toPose;
    p.off.set(0, 0, 0);
    p.tip = 0;
    p.roll = 0;
    p.anim = 'gasp';
    const r = this.rest;
    const side = r?.side ?? new THREE.Vector3(1, 0, 0);
    switch (this.move.react) {
      case 'jump': {
        // Out of their skin, and a smaller bounce.
        const k = h / 0.45;
        p.off.y = (k < 1 ? Math.sin(k * Math.PI) : Math.max(0, Math.sin((k - 1) * Math.PI * 1.6)) * 0.3) * (0.18 + to.top * 0.18);
        break;
      }
      case 'tremble':
        p.off.addScaledVector(side, Math.sin(h * 80) * 0.012 * (0.6 + to.top * 0.4));
        p.roll = Math.sin(h * 63) * 0.02;
        break;
      case 'gasp':
        p.tip = -0.18 * easeOut(h / 0.25);
        break;
      case 'faint':
        // A gasp, a wobble, and over backwards.
        if (h > 0.5) p.anim = 'idle';
        p.roll = h > 0.4 && h < 0.8 ? Math.sin((h - 0.4) * 20) * 0.08 : 0;
        p.tip = -0.85 * span(h, 0.65, 1.0) + (h > 1 ? Math.sin(Math.min(1, (h - 1) / 0.3) * Math.PI) * 0.1 : 0);
        break;
      case 'pearls':
        p.roll = Math.sin(h * 4) * 0.05;
        p.tip = -0.12 * easeOut(h / 0.3);
        break;
      case 'freeze':
        // Stock still, eyes front.
        p.anim = 'idle';
        p.off.y = 0.02 * easeOut(h / 0.1);
        break;
      case 'dun':
        p.tip = -0.08;
        break;
    }
    return h > NOM.end - NOM.hit + 0.2 ? null : p;
  }

  dispose() {
    this.group.removeFromParent();
    this.bursts.dispose();
    this.dizzy.dispose();
    for (const m of this.mats) m.dispose();
    for (const g of this.geos) g.dispose();
    for (const t of this.texs) t.dispose();
  }
}

const groundBelow = (e: NomEnd) => e.floor;

/** A point on the cork, from its canvas pixels to the board's own space (on its face). */
function corkAt(px: number, py: number): THREE.Vector3 {
  return new THREE.Vector3((px / CORK.w - 0.5) * CORK.W, CORK.y + (0.5 - py / CORK.h) * CORK.H, 0.03);
}

const _box = new THREE.Box3();

/**
 * Where someone is for the show, from their animal: their eyes (from the rig's eye bone, or near the top of the
 * head on a model without one), which way they face on their own (`ry`) and how tall they are to their eyes (a tall
 * hat doesn't count).
 */
export function nomEndOf(root: THREE.Object3D, headHeight: number, floor: number, ry = root.rotation.y): NomEnd {
  root.updateMatrixWorld(true);
  const eyes = root.getObjectByName('eyes');
  const face = eyes ? eyes.getWorldPosition(v3()) : root.position.clone().addScaledVector(UP, headHeight * 0.8);
  const top = eyes ? Math.max(0.3, Math.min(headHeight, (face.y - root.position.y) * 1.15)) : headHeight;
  // (`ry` is the way they face on their stool, before the show turns them.)
  const fwd = new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry));
  // How far the model reaches out in front of the eyes: measured square on, turned back for a moment.
  let front = 0;
  if (eyes) {
    const eye = root.worldToLocal(face.clone());
    const turn = root.quaternion.clone();
    root.quaternion.identity();
    root.updateMatrixWorld(true);
    _box.setFromObject(root);
    front = Math.max(0, Math.min(top, _box.max.z - root.position.z - eye.z * root.scale.z));
    root.quaternion.copy(turn);
    root.updateMatrixWorld(true);
  }
  return { front, face, fwd, top, floor };
}

/** Puts one of the two in the show's pose (after their animal has had its frame): nudged, tipped back, rocked. */
export function applyNomPose(root: THREE.Object3D, p: NomPose) {
  // (Turned first, then tipped about their own side, so they fall back whichever way they face.)
  root.rotation.order = 'YXZ';
  root.position.add(p.off);
  root.rotation.x = p.tip;
  root.rotation.z += p.roll;
  root.rotation.y += p.yaw;
}

/** Back to normal once it's over. */
export function clearNomPose(root: THREE.Object3D) {
  root.rotation.x = 0;
  root.rotation.order = 'XYZ';
}
