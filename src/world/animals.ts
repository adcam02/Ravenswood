import * as THREE from 'three';
import { Builder, card, glow, soft, wet, type Vec3 } from './build';
import { buildBack, buildFace, buildNeck, type BackFit, type BuiltPiece, type FaceFit, type NeckFit } from './dressup';
import { buildHat, type BuiltHat, type HatFit } from './hats';
import { buildItem, disposeObject } from './items';
import { lowDetail, pillar, seedOf, seeded, solid, tube } from './paper';
import { RECIPES, col, colorsFor, mix, newKit, onHead, type Kit, type Shape } from './species';
import { animalInfo, type Anim, type AnimalId, type BackId, type FaceId, type HatId, type Item, type ItemKind, type Look, type NeckId } from './types';

export { buildPet, type Pet } from './pets';

/** What's worn besides a hat: on the face, round the neck, on the back. */
export interface DressUp {
  face?: FaceId | null;
  neck?: NeckId | null;
  back?: BackId | null;
}

/**
 * Papercraft animals, folded in code from faceted shapes (see species.ts). Each moving part (torso, head,
 * eyes, each arm and leg, the tail) is a single vertex-coloured mesh hung on a pivot, and everything moves
 * procedurally, so there are no model files or animation clips to load.
 */

export interface RigState {
  anim: Anim;
  /** Ground speed in metres a second. */
  speed: number;
  dt: number;
  /** Seconds since the start, shared by everyone so idle motion doesn't line up. */
  t: number;
  speaking?: boolean;
}

export interface Rig {
  /** Origin at the feet; the model faces +z when root.rotation.y is 0. */
  root: THREE.Group;
  /** Height of the top of the head (ears included), for name labels. */
  headHeight: number;
  update(s: RigState): void;
  setItem(item: Item | null): void;
  setGhost(on: boolean): void;
  /** Puts a hat on (or takes it off). The Storyteller never wears one. Raises `headHeight` to clear it. */
  setHat(hat: HatId | null): void;
  /** 'low' swaps in a cheaper version of every part, for players far away. */
  setDetail(level: 'high' | 'low'): void;
  /** Puts on (or takes off) face, neck and back pieces; a field left out is left as it is, null takes it off. */
  setDressUp(d: DressUp): void;
  dispose(): void;
}

// ---------------------------------------------------------------- poses

interface Pose {
  by: number;
  bz: number;
  brx: number;
  bry: number;
  brz: number;
  hrx: number;
  hry: number;
  hrz: number;
  alx: number;
  alz: number;
  arx: number;
  arz: number;
  llx: number;
  llz: number;
  lrx: number;
  lrz: number;
  trx: number;
  try: number;
  /** Extra forward tilt of whatever is in the right paw (pouring, sipping). */
  tilt: number;
  /** Arm stretch, so a paw can reach exactly where it's going. */
  sl: number;
  sr: number;
  /** How far a two-pawed load is slid across to sit in front of the middle of the body. */
  carry: number;
}

const POSE_KEYS = ['by', 'bz', 'brx', 'bry', 'brz', 'hrx', 'hry', 'hrz', 'alx', 'alz', 'arx', 'arz', 'llx', 'llz', 'lrx', 'lrz', 'trx', 'try', 'tilt', 'sl', 'sr', 'carry'] as const;

const restPose = (): Pose => ({
  by: 0,
  bz: 0,
  brx: 0,
  bry: 0,
  brz: 0,
  hrx: 0,
  hry: 0,
  hrz: 0,
  alx: -0.06,
  alz: 0.1,
  arx: -0.06,
  arz: -0.1,
  llx: 0,
  llz: 0,
  lrx: 0,
  lrz: 0,
  trx: 0,
  try: 0,
  tilt: 0,
  sl: 1,
  sr: 1,
  carry: 0,
});

/**
 * How each thing is carried: where the paw goes (up from the shoulder, and forward of the front of the
 * body), how far the arm swings out, and whether both paws hold it in front of the middle of the body.
 */
interface Hold {
  dy: number;
  dz: number;
  out: number;
  both?: boolean;
}

const MUG: Hold = { dy: -0.2, dz: 0.03, out: 0.16 };
const HOLD: Record<ItemKind, Hold> = {
  ale: MUG,
  cider: MUG,
  milk: MUG,
  cocoa: MUG,
  wine: { dy: -0.17, dz: 0.03, out: 0.16 },
  bun: { dy: -0.2, dz: 0.04, out: 0.14 },
  loaf: { dy: -0.24, dz: 0.05, out: 0.05, both: true },
  pie: { dy: -0.24, dz: 0.05, out: 0.04, both: true },
  // Held up to show it off, out to the side of the face.
  fish: { dy: -0.04, dz: 0.06, out: 0.42 },
  flower: { dy: -0.1, dz: 0.05, out: 0.38 },
  // Low at the side and angled out, clear of the head.
  rod: { dy: -0.26, dz: 0.0, out: 0.32 },
  can: { dy: -0.26, dz: 0.04, out: 0.04, both: true },
  washing: { dy: -0.3, dz: 0.06, out: 0.0, both: true },
  // A bucket hangs by its handle at the side.
  water: { dy: -0.36, dz: -0.02, out: 0.34 },
  firewood: { dy: -0.24, dz: 0.05, out: 0.0, both: true },
  grimoire: { dy: -0.12, dz: 0.12, out: 0.0, both: true },
};

const GHOST_EYES = new THREE.MeshBasicMaterial({ color: '#3a4a7a', transparent: true, opacity: 0.85 });

interface RigParts {
  parts: Kit;
  material: THREE.Material;
  ghostColor: THREE.Color;
  floats: boolean;
  tentacles: boolean;
  aquatic: boolean;
  noLegs?: boolean;
  /** How high a floating rig hovers. */
  hover?: number;
  /** The arms are wings and beat on their own. */
  flaps?: boolean;
  /** Slower, droopier idling with half-closed eyes (the sloth). */
  sleepy?: boolean;
  /** Extra things that hang off the body (the Storyteller's lantern). */
  extras?: (body: THREE.Group, hand: THREE.Group, armL: THREE.Group) => void;
  eyeMaterial?: THREE.Material;
  /** Where a hat sits; none for the Storyteller, who never wears one. */
  hatFit?: HatFit;
  /** Builds the same animal with the light shapes, and the key its parts are cached under. */
  lowKit?: () => Kit;
  lowKey?: string;
  /** Where dress-up goes; none for the Storyteller. */
  dressFit?: { face: FaceFit; neck: NeckFit; back: BackFit };
}

type PartName = 'torso' | 'head' | 'eyes' | 'armL' | 'armR' | 'legL' | 'legR' | 'tail';
const PART_NAMES: PartName[] = ['torso', 'head', 'eyes', 'armL', 'armR', 'legL', 'legR', 'tail'];

/** Distant versions of each animal and colour, shared by every rig that needs one. Never disposed: they're small. */
const lowCache = new Map<string, Partial<Record<PartName, THREE.BufferGeometry>>>();

function lowParts(key: string, make: () => Kit): Partial<Record<PartName, THREE.BufferGeometry>> {
  const hit = lowCache.get(key);
  if (hit) return hit;
  const kit = lowDetail(make);
  const out: Partial<Record<PartName, THREE.BufferGeometry>> = {};
  for (const name of PART_NAMES) {
    const b = kit[name];
    if (b.empty) continue;
    const g = b.geometry(0);
    if (name === 'eyes') g.translate(0, -kit.eyeY, 0);
    out[name] = g;
  }
  lowCache.set(key, out);
  return out;
}

/** The angle (about x) and stretch that point an arm's grip from its shoulder at a target, both in body space. */
function aim(shoulder: THREE.Vector3, grip: THREE.Vector3, ty: number, tz: number): { a: number; s: number } {
  const dy = ty - shoulder.y;
  const dz = tz - shoulder.z;
  const reach = Math.hypot(grip.y, grip.z);
  const lead = Math.atan2(grip.z, -grip.y);
  return { a: Math.atan2(-dz, -dy) + lead, s: THREE.MathUtils.clamp(Math.hypot(dy, dz) / reach, 0.7, 1.25) };
}

class AnimalRig implements Rig {
  root = new THREE.Group();
  headHeight = 1;
  private float = new THREE.Group();
  private body = new THREE.Group();
  private neck = new THREE.Group();
  private eyes = new THREE.Group();
  private armL = new THREE.Group();
  private armR = new THREE.Group();
  private legL = new THREE.Group();
  private legR = new THREE.Group();
  private tail = new THREE.Group();
  private hand = new THREE.Group();
  private handTilt = new THREE.Group();
  private meshes: THREE.Mesh[] = [];
  private eyeMesh: THREE.Mesh;
  private material: THREE.Material;
  private eyeMaterial: THREE.Material;
  private ghostMaterial: THREE.MeshStandardMaterial;
  private wisp: THREE.Mesh;
  private drips: THREE.InstancedMesh | null = null;
  private dripState: { x: number; y: number; z: number; v: number; wait: number }[] = [];
  private item: THREE.Object3D | null = null;
  private itemKey = '';
  private hold: Hold | null = null;
  private ghost = false;
  private pose = restPose();
  private phase = 0;
  private blinkAt = 2 + Math.random() * 3;
  private blinkT = -1;
  private seed = Math.random() * 100;
  private floats: boolean;
  private hover: number;
  private flaps: boolean;
  private tentacles: boolean;
  private noLegs: boolean;
  private sleepy: boolean;
  private owned: THREE.Material[] = [];
  private parts: Partial<Record<PartName, THREE.Mesh>> = {};
  private highGeo = new Map<THREE.Mesh, THREE.BufferGeometry>();
  private detail: 'high' | 'low' = 'high';
  private lowKit?: () => Kit;
  private lowKey?: string;
  private hatFit?: HatFit;
  private hat: { id: HatId; built: BuiltHat; holder: THREE.Group } | null = null;
  private baseHeadHeight = 1;
  private dressFit?: { face: FaceFit; neck: NeckFit; back: BackFit };
  private worn: Record<'face' | 'neck' | 'back', { id: string; piece: BuiltPiece } | null> = { face: null, neck: null, back: null };
  private lastSpeed = 0;
  private lastT = 0;
  // Landmarks in body space, for aiming paws.
  private shoulder: THREE.Vector3;
  private grip: THREE.Vector3;
  private seat: number;
  private front: number;
  private mouth: THREE.Vector3;
  private eyePos: THREE.Vector3;
  private hasLegs: boolean;
  private v = new THREE.Vector3();

  constructor(p: RigParts) {
    const k = p.parts;
    const j = k.joints;
    this.floats = p.floats;
    this.hover = p.hover ?? 0.35;
    this.flaps = Boolean(p.flaps);
    this.tentacles = p.tentacles;
    this.noLegs = Boolean(p.noLegs);
    this.sleepy = Boolean(p.sleepy);
    this.material = p.material;
    this.eyeMaterial = p.eyeMaterial ?? p.material;
    this.hatFit = p.hatFit;
    this.dressFit = p.dressFit;
    this.lowKit = p.lowKit;
    this.lowKey = p.lowKey;
    this.owned.push(p.material);
    if (p.eyeMaterial) this.owned.push(p.eyeMaterial);
    this.shoulder = new THREE.Vector3(-j.shoulder[0], j.shoulder[1], j.shoulder[2]);
    this.grip = new THREE.Vector3(...j.hand);
    this.seat = k.seat;
    const s = k.shape;
    this.front = s.tc[2] + s.tr[2] * 1.02;
    this.mouth = new THREE.Vector3(...(k.nose ?? [0, s.hc[1] - s.hr[1] * 0.4, s.hc[2] + s.hr[2]])).add(new THREE.Vector3(...j.neck));
    this.eyePos = new THREE.Vector3(k.eyeX, k.eyeY, k.eyeZ).add(new THREE.Vector3(...j.neck));
    this.hasLegs = !k.legL.empty;

    this.root.add(this.float);
    this.float.add(this.body);
    this.body.add(this.neck, this.armL, this.armR, this.legL, this.legR, this.tail);
    this.neck.position.set(...j.neck);
    this.armL.position.set(j.shoulder[0], j.shoulder[1], j.shoulder[2]);
    this.armR.position.set(-j.shoulder[0], j.shoulder[1], j.shoulder[2]);
    this.legL.position.set(j.hip[0], j.hip[1], j.hip[2]);
    this.legR.position.set(-j.hip[0], j.hip[1], j.hip[2]);
    this.tail.position.set(...j.tail);
    this.hand.position.set(...j.hand);
    this.armR.add(this.hand);
    this.hand.add(this.handTilt);

    const mk = (name: PartName, b: Builder, parent: THREE.Object3D, mat = this.material) => {
      if (b.empty) return null;
      const m = b.mesh(mat, { cast: true, receive: false, crease: 0 });
      parent.add(m);
      this.meshes.push(m);
      this.parts[name] = m;
      return m;
    };
    mk('torso', k.torso, this.body);
    mk('head', k.head, this.neck);
    this.eyes.position.set(0, k.eyeY, 0);
    this.neck.add(this.eyes);
    // Eye geometry is built around the neck; shift it so blinking squashes around the eyes.
    const eg = k.eyes.geometry(0);
    eg.translate(0, -k.eyeY, 0);
    this.eyeMesh = new THREE.Mesh(eg, this.eyeMaterial);
    this.eyeMesh.castShadow = false;
    this.eyes.add(this.eyeMesh);
    this.parts.eyes = this.eyeMesh;
    mk('armL', k.armL, this.armL);
    mk('armR', k.armR, this.armR);
    mk('legL', k.legL, this.legL);
    mk('legR', k.legR, this.legR);
    mk('tail', k.tail, this.tail);

    this.ghostMaterial = new THREE.MeshStandardMaterial({
      color: p.ghostColor,
      emissive: '#9fc4ff',
      emissiveIntensity: 0.55,
      transparent: true,
      opacity: 0.6,
      depthWrite: true,
      roughness: 1,
      flatShading: true,
    });
    this.owned.push(this.ghostMaterial);

    // A faceted wisp that replaces the legs of ghosts (and the Storyteller).
    const wb = new Builder();
    tube(wb, seeded(7), {
      pts: [
        [0, 0.36, 0.0],
        [0, 0.22, -0.02],
        [0.02, 0.08, -0.07],
        [0.05, -0.02, -0.15],
      ],
      radii: [0.17, 0.14, 0.08, 0.02],
      sides: 7,
      jitter: 0.1,
      round: false,
      color: '#ffffff',
    });
    this.wisp = new THREE.Mesh(wb.geometry(0), this.ghostMaterial);
    this.wisp.visible = false;
    this.body.add(this.wisp);

    if (p.aquatic) {
      const dripMat = new THREE.MeshStandardMaterial({ color: '#a8d8ff', transparent: true, opacity: 0.75, roughness: 0.1, flatShading: true });
      this.owned.push(dripMat);
      const dg = new THREE.IcosahedronGeometry(1, 0);
      dg.scale(0.018, 0.028, 0.018);
      this.drips = new THREE.InstancedMesh(dg, dripMat, 4);
      this.drips.frustumCulled = false;
      for (let i = 0; i < 4; i++) this.dripState.push({ x: 0, y: -1, z: 0, v: 0, wait: Math.random() * 2.5 });
      this.root.add(this.drips);
    }
    p.extras?.(this.body, this.handTilt, this.armL);

    if (this.noLegs) {
      this.legL.visible = false;
      this.legR.visible = false;
      this.wisp.visible = true;
      this.wisp.material = this.material;
    }

    // Measure the head with the rig at rest.
    this.applyPose(1);
    this.root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(this.neck);
    this.headHeight = box.max.y + (this.floats ? this.hover : 0);
    this.baseHeadHeight = this.headHeight;
  }

  setHat(hat: HatId | null) {
    if (!this.hatFit) return;
    if ((this.hat?.id ?? null) === hat) return;
    if (this.hat) {
      this.hat.holder.removeFromParent();
      this.hat.built.group.traverse((o) => (o as THREE.Mesh).isMesh && (o as THREE.Mesh).geometry.dispose());
      for (const m of this.hat.built.materials) m.dispose();
      this.hat = null;
    }
    this.headHeight = this.baseHeadHeight;
    if (!hat) return;
    const built = buildHat(hat);
    if (!built) return;
    const fit = this.hatFit;
    const holder = new THREE.Group();
    holder.position.set(...fit.pos);
    holder.rotation.set(...fit.rot);
    holder.scale.setScalar(fit.scale);
    holder.add(built.group);
    this.neck.add(holder);
    this.hat = { id: hat, built, holder };
    this.applyHatGhost();
    // The name label and anything floating over the head have to clear the hat.
    const top = this.neck.position.y + fit.pos[1] + built.top * fit.scale + (this.floats ? this.hover : 0);
    this.headHeight = Math.max(this.baseHeadHeight, top);
  }

  setDressUp(d: DressUp) {
    const fit = this.dressFit;
    if (!fit) return;
    const slots: ['face' | 'neck' | 'back', string | null | undefined][] = [
      ['face', d.face],
      ['neck', d.neck],
      ['back', d.back],
    ];
    for (const [slot, id] of slots) {
      if (id === undefined) continue;
      const cur = this.worn[slot];
      if ((cur?.id ?? null) === id) continue;
      if (cur) {
        cur.piece.group.removeFromParent();
        cur.piece.group.traverse((o) => (o as THREE.Mesh).isMesh && (o as THREE.Mesh).geometry.dispose());
        for (const m of cur.piece.materials) m.dispose();
        this.worn[slot] = null;
      }
      if (!id) continue;
      const piece = slot === 'face' ? buildFace(id as FaceId, fit.face) : slot === 'neck' ? buildNeck(id as NeckId, fit.neck) : buildBack(id as BackId, fit.back);
      if (!piece) continue;
      // Face pieces move with the head; the rest with the body.
      (slot === 'face' ? this.neck : this.body).add(piece.group);
      this.worn[slot] = { id, piece };
      piece.update?.(this.lastT, 0, this.lastSpeed);
    }
    this.applyHatGhost();
  }

  private applyHatGhost() {
    const solids = [...(this.hat?.built.solid ?? []), ...Object.values(this.worn).flatMap((w) => w?.piece.solid ?? [])];
    for (const { mesh, material } of solids) {
      mesh.material = this.ghost ? this.ghostMaterial : material;
      mesh.castShadow = !this.ghost;
    }
  }

  setDetail(level: 'high' | 'low') {
    if (level === this.detail) return;
    if (level === 'low') {
      if (!this.lowKit || !this.lowKey) return;
      const low = lowParts(this.lowKey, this.lowKit);
      for (const name of PART_NAMES) {
        const mesh = this.parts[name];
        const g = low[name];
        if (!mesh || !g) continue;
        if (!this.highGeo.has(mesh)) this.highGeo.set(mesh, mesh.geometry);
        mesh.geometry = g;
      }
    } else {
      for (const [mesh, g] of this.highGeo) mesh.geometry = g;
    }
    this.detail = level;
  }

  setItem(item: Item | null) {
    const key = item ? `${item.k}:${item.c ?? ''}` : '';
    if (key === this.itemKey) return;
    this.itemKey = key;
    if (this.item) {
      this.handTilt.remove(this.item);
      disposeObject(this.item);
      this.item = null;
    }
    this.hold = item ? HOLD[item.k] ?? MUG : null;
    if (item) {
      this.item = buildItem(item);
      this.item.traverse((o) => (o.castShadow = !this.ghost));
      this.handTilt.add(this.item);
    }
  }

  setGhost(on: boolean) {
    if (on === this.ghost) return;
    this.ghost = on;
    for (const m of this.meshes) {
      m.material = on ? this.ghostMaterial : this.material;
      m.castShadow = !on;
    }
    this.eyeMesh.material = on ? GHOST_EYES : this.eyeMaterial;
    if (!this.noLegs) {
      this.legL.visible = !on;
      this.legR.visible = !on;
      this.wisp.visible = on;
    }
    this.wisp.material = on || !this.noLegs ? this.ghostMaterial : this.material;
    if (this.drips) this.drips.visible = !on;
    this.item?.traverse((o) => (o.castShadow = !on));
    this.applyHatGhost();
  }

  /** Points the right paw's grip at a spot in body space (and the left paw at its mirror image). */
  private reach(P: Pose, side: 'r' | 'l' | 'both', y: number, z: number, out: number) {
    const { a, s } = aim(this.shoulder, this.grip, y, z);
    if (side !== 'l') {
      P.arx = a;
      P.sr = s;
      P.arz = -out;
    }
    if (side !== 'r') {
      P.alx = a;
      P.sl = s;
      P.alz = out;
    }
  }

  /** Paws holding something clear of the body, for standing, walking and sitting. */
  private carryPose(P: Pose, sway: number) {
    const h = this.hold;
    if (!h) return;
    const sh = this.shoulder;
    this.reach(P, h.both ? 'both' : 'r', sh.y + h.dy, this.front + h.dz, h.out);
    P.arx += sway;
    if (h.both) {
      P.alx += sway;
      P.carry = 1;
    }
  }

  private target(s: RigState): Pose {
    const P = restPose();
    const t = s.t + this.seed;
    const sin = Math.sin;
    const sh = this.shoulder;
    switch (s.anim) {
      case 'walk':
      case 'run': {
        const run = s.anim === 'run';
        const w = this.phase;
        const A = THREE.MathUtils.clamp(Math.max(s.speed, run ? 3 : 1.5) / 3.6, 0.35, 0.95);
        P.llx = sin(w) * A;
        P.lrx = -sin(w) * A;
        // The front legs swing too, like an animal's, a little less than the back ones.
        P.alx = -0.08 - sin(w) * A * 0.55;
        P.arx = -0.08 + sin(w) * A * 0.55;
        P.by = Math.abs(sin(w)) * (run ? 0.05 : 0.028);
        P.brz = sin(w) * 0.045;
        P.brx = run ? 0.14 : 0.05;
        P.hrx = -P.brx * 0.6;
        P.try = sin(w) * 0.35;
        P.trx = run ? 0.25 : 0.08;
        if (this.hold) {
          const left = P.alx;
          this.carryPose(P, sin(w) * 0.06);
          if (!this.hold.both) P.alx = left;
        }
        break;
      }
      case 'sit': {
        // Sat on its bottom like the papercraft raccoon: back feet forward, front legs straight down to the ground.
        P.by = -this.seat + 0.004;
        P.llx = P.lrx = -1.3;
        P.llz = 0.16;
        P.lrz = -0.16;
        const sy = sh.y + P.by;
        const reachDown = Math.hypot(this.grip.y, this.grip.z) + 0.03;
        const a = sy < reachDown ? Math.acos(THREE.MathUtils.clamp(sy / reachDown, 0, 1)) : 0;
        P.alx = P.arx = -a - 0.12;
        P.sl = P.sr = sy > reachDown ? THREE.MathUtils.clamp(sy / reachDown, 1, 1.25) : 1;
        // Front paws close together, just in front of the back feet.
        P.alz = -0.1;
        P.arz = 0.1;
        // The tail curls round on the ground beside it.
        P.trx = 0.22;
        P.try = -0.7;
        P.hry = sin(t * 0.35) * 0.2;
        if (this.hold) {
          const left = [P.alx, P.alz, P.sl] as const;
          this.carryPose(P, 0);
          if (!this.hold.both) [P.alx, P.alz, P.sl] = left;
        }
        break;
      }
      case 'sleep':
        // On its back, head towards the back of the root, centred on the origin.
        P.brx = -Math.PI / 2;
        P.by = 0.18;
        P.bz = 0.45;
        P.alz = 0.5;
        P.arz = -0.5;
        P.alx = P.arx = -0.3;
        P.llz = 0.15;
        P.lrz = -0.15;
        P.hry = 0.25;
        P.trx = 0.6;
        break;
      case 'wave':
        P.arz = -2.3 + sin(t * 9) * 0.35;
        P.arx = -0.2;
        P.hrz = 0.1;
        P.brz = 0.04;
        P.try = sin(t * 6) * 0.4;
        break;
      case 'hand':
        P.arz = -2.75;
        P.arx = -0.15;
        P.by = Math.abs(sin(t * 2.5)) * 0.012;
        P.hrz = 0.06;
        break;
      case 'cheer': {
        const k = sin(t * 10) * 0.22;
        P.alz = 2.45 + k;
        P.arz = -(2.45 + k);
        P.alx = P.arx = -0.2;
        P.by = Math.abs(sin(t * 5)) * 0.1;
        P.hrx = -0.18;
        P.try = sin(t * 10) * 0.5;
        break;
      }
      case 'dance': {
        const b = sin(t * 5.5);
        P.by = Math.abs(b) * 0.09;
        P.bry = sin(t * 2.75) * 0.7;
        P.brz = b * 0.11;
        P.alz = 1.2 + b * 0.55;
        P.arz = -(1.2 - b * 0.55);
        P.alx = P.arx = -0.25;
        P.llx = Math.max(0, b) * -0.55;
        P.lrx = Math.max(0, -b) * -0.55;
        P.hrz = b * 0.15;
        P.try = b * 0.6;
        break;
      }
      case 'laugh': {
        P.hrx = -0.32 + sin(t * 16) * 0.06;
        P.brz = sin(t * 18) * 0.035;
        P.by = Math.abs(sin(t * 9)) * 0.025;
        // Paws on the belly.
        this.reach(P, 'both', sh.y - 0.24, this.front + 0.03, 0.04);
        P.try = sin(t * 9) * 0.3;
        break;
      }
      case 'cry':
        P.hrx = 0.34 + sin(t * 12) * 0.03;
        // Paws up over the eyes.
        this.reach(P, 'both', this.eyePos.y - 0.06, this.eyePos.z + 0.07, -0.08);
        P.brz = sin(t * 14) * 0.025;
        P.by = -0.01;
        break;
      case 'work': {
        const k = sin(t * 7) * 0.05;
        this.reach(P, 'both', sh.y - 0.26 + k, this.front + 0.1, 0.02);
        P.alx += k * 2;
        P.arx -= k * 2;
        P.hrx = 0.25;
        P.brx = 0.08;
        P.by = Math.abs(sin(t * 7)) * 0.012;
        if (this.hold?.both) P.carry = 1;
        break;
      }
      case 'fish': {
        const twitch = sin(t * 0.9) > 0.9 ? sin(t * 40) * 0.08 : 0;
        // Both paws forward round the rod (or the book).
        const both = Boolean(this.hold?.both);
        this.reach(P, 'both', sh.y + (both ? -0.08 : -0.16), this.front + (both ? 0.14 : 0.1), both ? 0 : 0.06);
        P.alx += twitch;
        P.arx += twitch;
        P.hrx = 0.12;
        P.hry = both ? 0 : sin(t * 0.3) * 0.1;
        if (both) P.carry = 1;
        break;
      }
      case 'water':
        this.reach(P, 'r', sh.y - 0.16, this.front + 0.1, 0.1);
        P.alz = 0.2;
        P.hrx = 0.28;
        P.tilt = 0.75 + sin(t * 3) * 0.1;
        break;
      case 'drink': {
        const cyc = t % 3.2;
        const sip = cyc < 1.4 ? sin((cyc / 1.4) * Math.PI) : 0;
        // From the carrying spot up to the mouth (a mug's rim is about 0.14 above the grip and 0.07 in front).
        const h = this.hold ?? MUG;
        const y0 = sh.y + h.dy;
        const z0 = this.front + h.dz;
        const y1 = this.mouth.y - 0.13;
        const z1 = this.mouth.z - 0.02;
        this.reach(P, 'r', y0 + (y1 - y0) * sip, z0 + (z1 - z0) * sip, h.out * (1 - sip) + 0.02 * sip);
        P.hrx = -sip * 0.22;
        P.tilt = -sip * 0.8;
        P.try = sin(t * 2) * 0.2;
        break;
      }
      default: {
        // Idle: a little breathing, glancing about and a lazy tail.
        const slow = this.sleepy ? 0.45 : 1;
        P.hry = sin(t * 0.37 * slow) * 0.22 * (sin(t * 0.13) > 0 ? 1 : 0.3);
        P.hrz = sin(t * 0.29 * slow) * 0.05;
        P.try = sin(t * 1.6 * slow) * 0.25;
        P.by = sin(t * 2.2 * slow) * 0.006;
        P.alz = 0.1 + sin(t * 2.2 * slow) * 0.02;
        P.arz = -0.1 - sin(t * 2.2 * slow) * 0.02;
        if (this.sleepy) {
          P.hrx = 0.2 + sin(t * 0.6) * 0.04;
          P.alz = 0.25;
          P.arz = -0.25;
        }
        if (this.hold) {
          const left = [P.alx, P.alz] as const;
          this.carryPose(P, sin(t * 2.2 * slow) * 0.02);
          if (!this.hold.both) [P.alx, P.alz] = left;
        }
      }
    }
    if (s.speaking) {
      P.hrx += sin(t * 13) * 0.04;
      P.hrz += sin(t * 7) * 0.025;
    }
    if (this.tentacles) {
      P.llz += sin(t * 3) * 0.14;
      P.lrz -= sin(t * 3 + 1) * 0.14;
      P.llx *= 0.4;
      P.lrx *= 0.4;
    }
    if (!this.hasLegs && s.anim === 'sit') P.by = 0;
    if (this.flaps && (s.anim === 'idle' || s.anim === 'walk' || s.anim === 'run' || s.anim === 'sit' || s.anim === 'fish')) {
      // Wings beat on their own: quicker on the move, lazier when sitting, and the right wing keeps
      // still enough to hold whatever is in it.
      const rate = s.anim === 'run' ? 16 : s.anim === 'walk' ? 12 : s.anim === 'sit' ? 4 : 9;
      const amp = s.anim === 'sit' ? 0.2 : 0.45;
      const beat = sin(t * rate);
      P.alz = 1.5 + beat * amp;
      P.alx = -0.1;
      P.sl = 1;
      if (!this.hold) {
        P.arz = -(1.5 + beat * amp);
        P.arx = -0.1;
        P.sr = 1;
      } else P.arz -= beat * amp * 0.15;
      P.by += Math.max(0, beat) * 0.02;
    }
    return P;
  }

  private applyPose(k: number, target?: Pose) {
    const P = this.pose;
    if (target) for (const key of POSE_KEYS) P[key] += (target[key] - P[key]) * k;
    this.body.position.set(0, P.by, P.bz);
    this.body.rotation.set(P.brx, P.bry, P.brz);
    this.neck.rotation.set(P.hrx, P.hry, P.hrz);
    this.armL.rotation.set(P.alx, 0, P.alz);
    this.armR.rotation.set(P.arx, 0, P.arz);
    this.armL.scale.set(1, P.sl, 1);
    this.armR.scale.set(1, P.sr, 1);
    this.legL.rotation.set(P.llx, 0, P.llz);
    this.legR.rotation.set(P.lrx, 0, P.lrz);
    this.tail.rotation.set(P.trx, P.try, 0);
    // Keep the held item level whatever the arm is doing, then tip it on purpose.
    this.hand.quaternion.copy(this.armR.quaternion).invert();
    this.hand.scale.set(1, 1 / P.sr, 1);
    this.handTilt.rotation.set(P.tilt, 0, 0);
    // A load held in both paws slides across to sit in front of the middle of the body.
    if (this.item) {
      const v = this.v.copy(this.grip).multiply(this.armR.scale).applyEuler(this.armR.rotation).add(this.armR.position);
      this.item.position.x = -v.x * P.carry;
    }
  }

  update(s: RigState) {
    const dt = Math.min(Math.max(s.dt, 0), 0.1);
    if (s.anim === 'walk' || s.anim === 'run') {
      const sp = THREE.MathUtils.clamp(s.speed || (s.anim === 'run' ? 4 : 2), 0.8, 7);
      this.phase += dt * (5 + sp * 1.6);
    }
    const target = this.target(s);
    this.applyPose(1 - Math.exp(-dt * 14), target);

    // Floating: ghosts and the Storyteller hover with a gentle bob.
    const floating = this.floats || this.ghost;
    const h = s.anim === 'sleep' ? 0.03 : this.floats ? this.hover : 0.35;
    const fy = floating ? h + Math.sin(s.t * 2 + this.seed) * 0.06 : 0;
    this.float.position.y += (fy - this.float.position.y) * (1 - Math.exp(-dt * 6));
    if (floating) this.wisp.rotation.z = Math.sin(s.t * 3 + this.seed) * 0.15;

    // Blinking.
    this.blinkAt -= dt;
    if (this.blinkAt <= 0 && this.blinkT < 0) this.blinkT = 0;
    if (this.blinkT >= 0) {
      this.blinkT += dt;
      const b = this.blinkT / 0.14;
      this.eyes.scale.y = b < 1 ? Math.max(0.12, Math.abs(1 - b * 2)) : 1;
      if (b >= 1) {
        this.blinkT = -1;
        this.blinkAt = 2 + Math.random() * 4;
      }
    }
    if (s.anim === 'sleep') this.eyes.scale.y = 0.12;
    else if (s.anim === 'laugh') this.eyes.scale.y = 0.35;
    else if (this.sleepy && s.anim === 'idle') this.eyes.scale.y = Math.min(this.eyes.scale.y, 0.5);

    if (this.drips && !this.ghost) this.updateDrips(dt);
    this.hat?.built.update?.(s.t + this.seed);
    const moving = s.anim === 'walk' || s.anim === 'run' ? Math.max(s.speed, s.anim === 'run' ? 4 : 1.6) : 0;
    this.lastSpeed = moving;
    this.lastT = s.t + this.seed;
    for (const w of Object.values(this.worn)) w?.piece.update?.(s.t + this.seed, dt, moving);
  }

  private updateDrips(dt: number) {
    const m = new THREE.Matrix4();
    this.dripState.forEach((d, i) => {
      if (d.wait > 0) {
        d.wait -= dt;
        if (d.wait <= 0) {
          // Start a new drip somewhere on the body.
          const a = Math.random() * Math.PI * 2;
          d.x = Math.cos(a) * 0.17;
          d.z = Math.sin(a) * 0.14;
          d.y = 0.25 + Math.random() * 0.4 + this.body.position.y;
          d.v = 0;
        }
        m.makeScale(0, 0, 0);
      } else {
        d.v += 9.8 * dt;
        d.y -= d.v * dt;
        if (d.y <= 0.01) {
          d.wait = 0.6 + Math.random() * 2.4;
          m.makeScale(0, 0, 0);
        } else m.makeTranslation(d.x, d.y, d.z);
      }
      this.drips!.setMatrixAt(i, m);
    });
    this.drips!.instanceMatrix.needsUpdate = true;
  }

  dispose() {
    this.setItem(null);
    this.setHat(null);
    this.setDressUp({ face: null, neck: null, back: null });
    // Back to this rig's own geometry first: the distant versions are shared and stay cached.
    this.setDetail('high');
    for (const m of this.meshes) m.geometry.dispose();
    this.eyeMesh.geometry.dispose();
    this.wisp.geometry.dispose();
    this.drips?.geometry.dispose();
    this.root.traverse((o) => {
      if (o !== this.root && (o as THREE.Mesh).isMesh && !this.meshes.includes(o as THREE.Mesh) && o !== this.eyeMesh && o !== this.wisp && o !== this.drips) {
        (o as THREE.Mesh).geometry.dispose();
      }
    });
    for (const m of this.owned) m.dispose();
    this.root.removeFromParent();
  }
}

export function buildAnimal(look: Look): Rig {
  const info = animalInfo(look.animal);
  const coat = /^#[0-9a-f]{6}$/i.test(look.color) ? look.color : info.colors[0];
  const k = newKit(info.id);
  const c = colorsFor(coat);
  const res = RECIPES[info.id](k, c, coat);
  const aquatic = res.aquatic ?? info.aquatic;
  const rig = new AnimalRig({
    parts: k,
    material: res.jelly ? jelly() : aquatic ? wet() : soft(),
    eyeMaterial: card(),
    ghostColor: mix(coat, '#e6f0ff', 0.75),
    floats: Boolean(res.hover),
    hover: res.hover,
    flaps: res.flaps,
    tentacles: res.legs === 'tentacles',
    aquatic,
    sleepy: res.sleepy,
    hatFit: hatFit(info.id, k),
    dressFit: dressFit(info.id, k),
    lowKey: `${info.id}:${coat}`,
    lowKit: () => {
      const lk = newKit(info.id);
      RECIPES[info.id](lk, colorsFor(coat), coat);
      return lk;
    },
  });
  if (look.hat) rig.setHat(look.hat);
  if (look.face || look.neck || look.back) rig.setDressUp({ face: look.face ?? null, neck: look.neck ?? null, back: look.back ?? null });
  return rig;
}

/** Torso half-width at a height, from its pear (narrower towards the top). */
function torsoR(s: Shape, y: number) {
  const u = (y - s.tc[1]) / s.tr[1];
  const sm = THREE.MathUtils.smoothstep((u + 1) / 2, 0.25, 1);
  return s.tr[0] * Math.sqrt(Math.max(0, 1 - u * u)) * (1 - 0.42 * sm);
}

/** Some bodies need their neck ring or back placed by hand: the snail's back is its shell, the squid's its mantle. */
const DRESS_NUDGE: Partial<Record<AnimalId, { neck?: Partial<NeckFit>; back?: Partial<BackFit>; floating?: boolean }>> = {
  snail: { neck: { centre: [0, 0.33, 0.28], r: 0.11, tilt: 0.35 }, back: { centre: [0, 0.36, -0.08], r: 0.18, depth: 0.25, top: 0.58, bottom: 0.16 }, floating: true },
};

function dressFit(id: AnimalId, k: Kit): { face: FaceFit; neck: NeckFit; back: BackFit } {
  const s = k.shape;
  const neckY = k.joints.neck[1];
  const n = DRESS_NUDGE[id] ?? {};
  // The neck ring sits just under the chin, wide enough to show round the top of the torso.
  const chin = neckY + s.hc[1] - s.hr[1] * 0.9;
  const ny = Math.min(chin, s.tc[1] + s.tr[1] * 0.85);
  const nr = Math.max(0.09, torsoR(s, ny) + 0.015);
  const neck: NeckFit = { centre: [0, ny, s.tc[2] + 0.01], r: nr, tilt: 0.12, ...n.neck };
  const back: BackFit = {
    centre: s.tc,
    r: s.tr[0] * 0.9,
    depth: s.tr[2],
    top: s.tc[1] + s.tr[1] * 0.7,
    bottom: s.tc[1] - s.tr[1] * 0.8,
    headTop: neckY + s.hc[1] + s.hr[1],
    ...n.back,
  };
  const face: FaceFit = { eyeX: k.eyeX, eyeY: k.eyeY, eyeR: k.eyeR, eyeZ: k.eyeZ, nose: k.nose, hc: s.hc, hr: s.hr, floating: n.floating };
  return { face, neck, back };
}

/**
 * Where a hat goes on each animal. By default it sits on the crown, scaled to the head's width and tipped
 * back a touch; some heads need it nudged clear of ears, antlers, fins or eye stalks.
 */
const HAT_NUDGE: Partial<Record<AnimalId, { dy?: number; dz?: number; dx?: number; scale?: number; rot?: Vec3 }>> = {
  bunny: { dy: -0.01, dz: -0.01, scale: 0.95 },
  snail: { dy: -0.01, dz: 0.0, scale: 0.85 },
};

function hatFit(id: AnimalId, k: Kit): HatFit {
  const s = k.shape;
  const n = HAT_NUDGE[id] ?? {};
  const top = onHead(k, 0, 0.995);
  const scale = THREE.MathUtils.clamp(s.hr[0] / 0.25, 0.55, 1.2) * (n.scale ?? 1);
  return {
    pos: [s.hc[0] + (n.dx ?? 0), top.y - 0.01 + (n.dy ?? 0), s.hc[2] - 0.01 + (n.dz ?? 0)],
    scale,
    rot: n.rot ?? [-0.12, 0, 0],
  };
}

/** See-through and glossy, for the jellyfish. */
const jelly = () =>
  new THREE.MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.25,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
    transparent: true,
    opacity: 0.8,
    flatShading: true,
  });

// ---------------------------------------------------------------- the Storyteller

const ROBE = '#3b2a5a';
const TRIM = '#e8c26a';
const HOLLOW = '#0d0a14';

export function buildStoryteller(): Rig {
  const k = newKit('storyteller');
  const rnd = k.rnd;
  k.joints.neck = [0, 0.6, 0];
  k.joints.shoulder = [0.19, 0.62, 0.02];
  k.shape.tc = [0, 0.4, 0];
  k.shape.tr = [0.28, 0.38, 0.26];
  // A tall faceted robe that narrows to the shoulders, with a hem and a stripe of gold down the front.
  tube(k.torso, rnd, {
    pts: [
      [0, 0.04, 0],
      [0, 0.22, 0.0],
      [0, 0.45, 0.0],
      [0, 0.66, 0.0],
    ],
    radii: [0.3, 0.27, 0.21, 0.15],
    sides: 8,
    jitter: 0.06,
    up: [1, 0, 0],
    color: ROBE,
    paint: (u) => (u.y < 0.06 ? TRIM : u.z < -0.93 ? TRIM : null),
  });
  solid(k.torso, rnd, { base: 'ico1', r: [0.25, 0.12, 0.21], pos: [0, 0.66, 0], jitter: 0.06, color: ROBE });
  // The hood: a deep cowl with a dark hollow where a face should be, rimmed in gold, and a point at the back.
  k.shape.hc = [0, 0.27, 0];
  k.shape.hr = [0.25, 0.27, 0.25];
  solid(k.head, rnd, {
    base: 'ico2',
    r: k.shape.hr,
    pos: k.shape.hc,
    jitter: 0.05,
    color: ROBE,
    paint: (u) => {
      const d = Math.hypot(u.x / 0.78, (u.y + 0.08) / 0.82);
      if (u.z > 0.3 && d < 0.8) return HOLLOW;
      if (u.z > 0.2 && d < 0.98) return TRIM;
      return null;
    },
  });
  solid(k.head, rnd, { base: 'pyramid', r: [0.12, 0.24, 0.1], pos: [0, 0.52, -0.12], rot: [-0.7, 0, 0], jitter: 0.04, color: ROBE });
  k.eyeY = 0.28;
  k.eyeX = 0.075;
  k.eyeR = 0.035;
  k.eyeZ = 0.26;
  for (const side of [-1, 1]) {
    solid(k.eyes, rnd, { base: 'ico0', r: [0.036, 0.02, 0.012], pos: [side * 0.075, 0.28, 0.235], rot: [0, side * 0.3, -side * 0.25], jitter: 0.03, color: '#ffe08a', tone: 0 });
  }
  // Wide sleeves for arms, with gold cuffs and pale hands.
  for (const b of [k.armL, k.armR]) {
    pillar(b, rnd, [0, 0.03, 0], [0, -0.27, 0.01], 0.06, 0.095, ROBE, { paint: (u) => (u.y > 0.36 ? TRIM : null) });
    solid(b, rnd, { base: 'ico1', r: [0.045, 0.045, 0.05], pos: [0, -0.31, 0.02], jitter: 0.06, color: '#d8d0f0' });
  }
  k.joints.hand = [0, -0.31, 0.07];
  k.seat = 0;
  const lanternGlow = glow('#ffcf6a', 1.6);
  const eyeGlow = new THREE.MeshBasicMaterial({ color: '#ffe08a' });
  return new AnimalRig({
    parts: k,
    material: soft(),
    eyeMaterial: eyeGlow,
    ghostColor: col('#cbbcf0'),
    floats: true,
    tentacles: false,
    aquatic: false,
    noLegs: true,
    extras: (_body, _hand, armL) => {
      // The lantern hangs from the left sleeve, so the right paw is free for anything else.
      const lantern = new THREE.Group();
      const lb = new Builder();
      const lr = seeded(seedOf('lantern'));
      const iron = '#4d3a2a';
      solid(lb, lr, { base: 'limb', r: [0.07, 0.03, 0.07], pos: [0, 0.12, 0], jitter: 0.02, color: iron });
      solid(lb, lr, { base: 'cone5', r: [0.075, 0.07, 0.075], pos: [0, 0.17, 0], jitter: 0.03, color: iron });
      solid(lb, lr, { base: 'ico0', r: 0.02, pos: [0, 0.22, 0], jitter: 0.02, color: iron });
      solid(lb, lr, { base: 'limb', r: [0.075, 0.025, 0.075], pos: [0, -0.05, 0], jitter: 0.02, color: iron });
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        solid(lb, lr, { base: 'box', r: [0.012, 0.16, 0.012], pos: [Math.cos(a) * 0.06, 0.035, Math.sin(a) * 0.06], jitter: 0, color: iron });
      }
      const frame = lb.mesh(soft(), { cast: true, receive: false, crease: 0 });
      const flame = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), lanternGlow);
      flame.scale.set(0.9, 1.3, 0.9);
      flame.position.y = 0.035;
      const light = new THREE.PointLight('#ffcf7a', 1.6, 6, 2);
      light.position.y = 0.04;
      lantern.add(frame, flame, light);
      lantern.position.set(0.04, -0.42, 0.06);
      lantern.name = 'lantern';
      armL.add(lantern);
    },
  });
}

// ---------------------------------------------------------------- thumbnails

let thumbRenderer: THREE.WebGLRenderer | null = null;
let thumbScene: THREE.Scene | null = null;
let thumbCamera: THREE.PerspectiveCamera | null = null;
const thumbCache = new Map<string, string>();

export function animalThumbnail(look: Look, size = 128): string {
  const key = `${look.animal}:${look.color}:${look.hat ?? ''}:${look.face ?? ''}:${look.neck ?? ''}:${look.back ?? ''}:${size}`;
  const hit = thumbCache.get(key);
  if (hit) return hit;
  try {
    if (!thumbRenderer) {
      thumbRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      thumbRenderer.setPixelRatio(1);
      thumbScene = new THREE.Scene();
      thumbScene.add(new THREE.HemisphereLight('#fff8ee', '#8a7a6a', 2.2));
      const sun = new THREE.DirectionalLight('#fff2dc', 1.6);
      sun.position.set(1.5, 3, 2.5);
      thumbScene.add(sun);
      thumbCamera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    }
    thumbRenderer.setSize(size, size, false);
    const rig = buildAnimal(look);
    rig.update({ anim: 'idle', speed: 0, dt: 0.016, t: 0 });
    for (let i = 0; i < 30; i++) rig.update({ anim: 'idle', speed: 0, dt: 0.05, t: 0 });
    rig.root.rotation.y = 0.35;
    thumbScene!.add(rig.root);
    // Head and shoulders, with room for tall ears and antlers.
    const top = Math.max(rig.headHeight, 0.92);
    const bottom = 0.36;
    const cy = (bottom + top) / 2;
    const dist = ((top - bottom) * 1.12) / (2 * Math.tan(THREE.MathUtils.degToRad(15)));
    thumbCamera!.position.set(dist * 0.18, cy + 0.08, dist);
    thumbCamera!.lookAt(0, cy, 0);
    thumbRenderer.render(thumbScene!, thumbCamera!);
    const url = thumbRenderer.domElement.toDataURL('image/png');
    thumbScene!.remove(rig.root);
    rig.dispose();
    thumbCache.set(key, url);
    return url;
  } catch {
    return '';
  }
}
