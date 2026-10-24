import * as THREE from 'three';
import { SMOOTH_LOOK, eyeMaterial, glow, shifting, soft, wet, type Shift, type Vec3 } from './build';
import { all, any, armForms, details, finishSculpt, region, sculptOf, sock, useSurface } from './forms';
import { buildHat, fitHat, type BuiltHat, type HatBit, type HatFit, type HatHead, type HatNudge } from './hats';
import { buildItem, disposeObject } from './items';
import { Fold, lowDetail, seedOf, seeded, solid, tube } from './paper';
import { ellipsoid, rod, type Probe } from './sculpt';
import { DETAILS, RECIPES, profileOf } from './recipes';
import { col, colorsFor, mix, newKit, type Kit, type Mannerism, type Part, type Profile, type Shape } from './species';
import { animalInfo, isDance, wrapAngle, type Anim, type AnimalId, type HatId, type Item, type ItemKind, type Look, type PetId } from './types';

import { buildPet } from './pets';
export { buildPet, type Pet } from './pets';

/**
 * Papercraft animals, folded in code from faceted card (see species.ts and recipes.ts). Each animal is one
 * skinned mesh (the body, plus the eyes in their own material) on a small skeleton: body, neck, eyes, arms,
 * legs and tail, plus whatever extra bones the species needs (ears, tail segments, a nose, eye stalks).
 * Everything moves procedurally, in the species' own style, so there are no model files or clips to load.
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
  /** 'low' swaps in a cheaper version of the model, for players far away. */
  setDetail(level: 'high' | 'low'): void;
  dispose(): void;
}

// ---------------------------------------------------------------- poses

interface Pose {
  /** The body shifted sideways (a dance's hips swinging under a steady head). */
  bx: number;
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
  /** Arms turned about the upright (folding a bat's wings round its back). */
  aly: number;
  ary: number;
  /** How far a wing's membrane is spread across (1 open, less closed up like an umbrella). */
  wl: number;
  wr: number;
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
  /** Elbow bends (a sculpted arm's forearm raised forward), left and right. */
  el: number;
  er: number;
  /** How far a two-pawed load is slid across to sit in front of the middle of the body. */
  carry: number;
}

const POSE_KEYS = ['bx', 'by', 'bz', 'brx', 'bry', 'brz', 'hrx', 'hry', 'hrz', 'alx', 'alz', 'arx', 'arz', 'aly', 'ary', 'wl', 'wr', 'llx', 'llz', 'lrx', 'lrz', 'trx', 'try', 'tilt', 'sl', 'sr', 'el', 'er', 'carry'] as const;

/**
 * How a bat holds its wings folded, like a closed umbrella down each side: hanging, turned so what's left of
 * the membrane lies outward (seen from the front), drawn in narrow, and the forearm folded back up behind so
 * the tip sits by the shoulder.
 */
const FOLD = { x: 0.31, y: -2.575, z: -0.455, el: 2.4, w: 0.3 };

const restPose = (): Pose => ({
  bx: 0,
  by: 0,
  bz: 0,
  brx: 0,
  bry: 0,
  brz: 0,
  hrx: 0,
  hry: 0,
  hrz: 0,
  alx: -0.14,
  alz: 0.16,
  arx: -0.14,
  arz: -0.16,
  aly: 0,
  ary: 0,
  wl: 1,
  wr: 1,
  llx: 0,
  llz: 0,
  lrx: 0,
  lrz: 0,
  trx: 0,
  try: 0,
  tilt: 0,
  sl: 1,
  sr: 1,
  el: 0,
  er: 0,
  carry: 0,
});

/** Rotation, offset from rest and scale for one of the extra bones (ears, tail segments, nose, stalks). */
type AuxPose = [number, number, number, number, number, number, number];
type AuxMap = Map<string, AuxPose>;
const restAux = (): AuxPose => [0, 0, 0, 0, 0, 0, 1];
function aux(A: AuxMap, name: string): AuxPose {
  let a = A.get(name);
  if (!a) A.set(name, (a = restAux()));
  return a;
}

/**
 * How each thing is carried: where the paw goes (up from the shoulder, forward of the front of the body, and
 * out to the side of the shoulder, in metres), and whether both paws hold it in front of the middle.
 */
interface Hold {
  dy: number;
  dz: number;
  out: number;
  both?: boolean;
  /**
   * For a sip (or a nibble): the spot on the item that meets the mouth (up from the grip, and forward of
   * it), and how far it's tipped towards the face.
   */
  sip?: [number, number, number];
  /** How far it reaches below the grip (a bucket hangs from its handle). */
  hang?: number;
}

// Held up in front of the chest, about half the animal's height, clear of the body (an elbow brings the paw
// up; the other paw can stay down).
const MUG: Hold = { dy: -0.06, dz: 0.07, out: 0.05, sip: [0.14, 0.0, 0.6] };
const HOLD: Record<ItemKind, Hold> = {
  ale: MUG,
  cider: MUG,
  milk: MUG,
  cocoa: MUG,
  wine: { dy: -0.04, dz: 0.07, out: 0.05, sip: [0.185, 0.03, 0.5] },
  // Food isn't tipped: the head nods down to take a bite.
  bun: { dy: -0.02, dz: 0.07, out: 0.04, sip: [0.05, -0.06, 0] },
  loaf: { dy: -0.08, dz: 0.07, out: 0, both: true, sip: [0.04, -0.1, 0] },
  pie: { dy: -0.08, dz: 0.07, out: 0, both: true, sip: [0.06, -0.1, 0] },
  // Held up to show it off, out to the side of the face.
  fish: { dy: 0.02, dz: 0.08, out: 0.16 },
  flower: { dy: 0.0, dz: 0.07, out: 0.12 },
  // Low at the side and angled out, clear of the head.
  rod: { dy: -0.14, dz: 0.02, out: 0.1 },
  // Heavier things ride lower, but off the ground.
  can: { dy: -0.18, dz: 0.05, out: 0, both: true, hang: 0.1 },
  washing: { dy: -0.2, dz: 0.1, out: 0.02, both: true, hang: 0.12 },
  // A bucket hangs by its handle at the side, and is lifted right up to drink from.
  water: { dy: -0.06, dz: 0.02, out: 0.12, sip: [-0.1, -0.07, 0.4], hang: 0.32 },
  // Firewood is hugged against the chest.
  firewood: { dy: -0.08, dz: 0.03, out: 0, both: true, hang: 0.1 },
  grimoire: { dy: -0.12, dz: 0.12, out: 0, both: true },
};


/** How long each idle mannerism takes, in seconds. */
const CLIP_LEN: Record<Mannerism, number> = {
  earSwivel: 2.4,
  earTwitch: 1.1,
  tailSwish: 2.4,
  headTilt: 2.2,
  sniff: 2.1,
  rubPaws: 2.6,
  noseWiggle: 1.5,
  hop: 1.2,
  stalks: 3.4,
  stretch: 3.2,
  headSwivel: 2.8,
  slowBlink: 1.8,
  lickPaw: 3.0,
  tailCurl: 2.6,
  wag: 2.0,
  pant: 2.6,
  sway: 3.2,
  scratch: 2.2,
  flap: 1.6,
  throat: 2.0,
  chill: 4.5,
  wingStretch: 2.8,
  flutter: 2.2,
  lookAround: 3.0,
  sentinel: 4.2,
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** Eases in over the first fifth and out over the last. */
const envelope = (p: number) => {
  const x = clamp01(Math.min(p / 0.2, (1 - p) / 0.2));
  return x * x * (3 - 2 * x);
};

const GHOST_EYES = new THREE.MeshBasicMaterial({ color: '#3a4a7a', transparent: true, opacity: 0.85 });

/**
 * Little wings on the back (on bones of their own) stand up and out from it, facing back. Each way of moving them:
 * how they're turned shut and open (about the upright, then about the front-to-back axis, for the left wing), and how
 * fast and far they beat (about the front-to-back axis, sweeping up and down). A bee's are made as they're held
 * buzzing and fold back along its body to sleep; a dragon's are made folded and spread out a little to flutter.
 */
const WING_MOTION = {
  buzz: { shut: [0.95, -0.5], open: [0, 0], rate: 70, beat: 0.5, ease: 6 },
  flutter: { shut: [0, 0], open: [-0.4, -0.45], rate: 21, beat: 0.5, ease: 9 },
} as const;
/** Bones that move on their own rather than with the poses: forearms go with the arms, wings beat, turrets look about. */
const OWN_MOTION = ['foreL', 'foreR', 'wingL', 'wingR', 'turretL', 'turretR'];

// ---------------------------------------------------------------- skeleton and skin

const STANDARD = ['body', 'neck', 'eyes', 'armL', 'armR', 'legL', 'legR', 'tail'];

interface Skel {
  names: string[];
  parent: Map<string, string | null>;
  local: Map<string, THREE.Vector3>;
  /** Where each bone sits at rest, in the model's space. */
  rest: Map<string, THREE.Vector3>;
}

function skeletonOf(k: Kit): Skel {
  const j = k.joints;
  const defs: [string, string | null, Vec3][] = [
    ['body', null, [0, 0, 0]],
    ['neck', 'body', j.neck],
    ['eyes', 'neck', [0, k.eyeY, 0]],
    ['armL', 'body', j.shoulder],
    ['armR', 'body', [-j.shoulder[0], j.shoulder[1], j.shoulder[2]]],
    ['legL', 'body', j.hip],
    ['legR', 'body', [-j.hip[0], j.hip[1], j.hip[2]]],
    ['tail', 'body', j.tail],
    ...k.bones.map((b): [string, string, Vec3] => [b.name, b.parent, b.pos]),
  ];
  const sk: Skel = { names: [], parent: new Map(), local: new Map(), rest: new Map() };
  for (const [name, parent, pos] of defs) {
    sk.names.push(name);
    sk.parent.set(name, parent);
    sk.local.set(name, new THREE.Vector3(...pos));
    sk.rest.set(name, new THREE.Vector3(...pos).add(parent ? sk.rest.get(parent)! : new THREE.Vector3()));
  }
  return sk;
}

/**
 * Puts every part into the model's space and ties each corner to its bone (or blends it along a chain): the body,
 * then the eyes (in their own material), then anything see-through (a bee's wings), if it has any.
 */
function skin(k: Kit, sk: Skel): THREE.BufferGeometry {
  const index = new Map(sk.names.map((n, i) => [n, i]));
  const pos: number[] = [];
  const colr: number[] = [];
  const si: number[] = [];
  const sw: number[] = [];
  const groups: [number, number][] = [];
  const pass = (p: Part) => (p.glass ? 2 : p.eyes ? 1 : 0);
  for (const which of [0, 1, 2]) {
    const start = pos.length / 3;
    for (const p of k.parts.values()) {
      if (pass(p) !== which || p.fold.empty) continue;
      const o = sk.rest.get(p.space) ?? new THREE.Vector3();
      // A bone that starts turned (a sculpted arm) turns what's built in its space with it.
      const turn = k.bind?.[p.space] ? new THREE.Quaternion().setFromEuler(new THREE.Euler(...k.bind[p.space])) : null;
      const at = new THREE.Vector3();
      const b = index.get(p.bone) ?? 0;
      const chain = p.chain?.map((n) => index.get(n) ?? b);
      const f = p.fold;
      const own = f.bones?.map((n) => index.get(n) ?? b);
      for (let v = 0; v < f.pos.length / 3; v++) {
        at.fromArray(f.pos, v * 3);
        if (turn) at.applyQuaternion(turn);
        pos.push(at.x + o.x, at.y + o.y, at.z + o.z);
        colr.push(f.col[v * 3], f.col[v * 3 + 1], f.col[v * 3 + 2]);
        const t = f.along[v];
        if (own) {
          for (let q = 0; q < 4; q++) {
            si.push(own[f.si[v * 4 + q]]);
            sw.push(f.sw[v * 4 + q]);
          }
        } else if (chain && t >= 0) {
          const n = chain.length;
          const x = t * n;
          const i = Math.min(n - 1, Math.floor(x));
          if (i >= n - 1) {
            si.push(chain[n - 1], 0, 0, 0);
            sw.push(1, 0, 0, 0);
          } else {
            si.push(chain[i], chain[i + 1], 0, 0);
            sw.push(1 - (x - i), x - i, 0, 0);
          }
        } else {
          si.push(b, 0, 0, 0);
          sw.push(1, 0, 0, 0);
        }
      }
    }
    groups.push([start, pos.length / 3 - start]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3));
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
  g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
  g.addGroup(groups[0][0], groups[0][1], 0);
  g.addGroup(groups[1][0], groups[1][1], 1);
  if (groups[2][1]) g.addGroup(groups[2][0], groups[2][1], 2);
  g.computeVertexNormals();
  if (SMOOTH_LOOK) smoothNormals(g);
  g.computeBoundingSphere();
  return g;
}

/**
 * The smooth finish: corners in the same place share one normal (each face counting by its area), across folds
 * gentler than 60 degrees, so the sculpted surface shades round while spikes and locks keep their edges.
 */
function smoothNormals(g: THREE.BufferGeometry) {
  const pos = g.getAttribute('position') as THREE.BufferAttribute;
  const nrm = g.getAttribute('normal') as THREE.BufferAttribute;
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const faces: THREE.Vector3[] = [];
  for (let f = 0; f < pos.count / 3; f++) {
    a.fromBufferAttribute(pos, f * 3);
    b.fromBufferAttribute(pos, f * 3 + 1);
    c.fromBufferAttribute(pos, f * 3 + 2);
    faces.push(c.sub(b).cross(a.sub(b)).clone());
  }
  const at = new Map<string, number[]>();
  for (let v = 0; v < pos.count; v++) {
    const key = `${Math.round(pos.getX(v) * 1e5)},${Math.round(pos.getY(v) * 1e5)},${Math.round(pos.getZ(v) * 1e5)}`;
    const list = at.get(key);
    if (list) list.push(v);
    else at.set(key, [v]);
  }
  const crease = Math.cos(THREE.MathUtils.degToRad(60));
  const own = new THREE.Vector3();
  const sum = new THREE.Vector3();
  for (const list of at.values()) {
    for (const v of list) {
      own.copy(faces[Math.floor(v / 3)]).normalize();
      sum.set(0, 0, 0);
      for (const w of list) {
        const n = faces[Math.floor(w / 3)];
        if (n.dot(own) >= crease * n.length()) sum.add(n);
      }
      if (sum.lengthSq() > 1e-20) nrm.setXYZ(v, ...sum.normalize().toArray());
    }
  }
  nrm.needsUpdate = true;
}

// ---------------------------------------------------------------- the rig

interface RigParts {
  kit: Kit;
  profile: Profile;
  material: THREE.Material;
  ghostColor: THREE.Color;
  floats: boolean;
  tentacles: boolean;
  noLegs?: boolean;
  /** How high a floating rig hovers. */
  hover?: number;
  /** The arms are wings and beat on their own. */
  flaps?: boolean;
  /** Slower, droopier idling with half-closed eyes (the sloth). */
  sleepy?: boolean;
  /** The right arm only comes out to hold or gesture. */
  tendril?: boolean;
  /** Little wings on the back, on bones wingL and wingR: a bee's buzz, or a dragon's flutter now and then. */
  wings?: 'buzz' | 'flutter';
  /** Turret eyes on bones turretL and turretR, each looking about on its own (the chameleon). */
  swivel?: boolean;
  /** A skin that shifts colour over time (the chameleon's), set going each frame. */
  shift?: Shift;
  /** Extra things that hang off the body (the Storyteller's lantern). */
  extras?: (body: THREE.Object3D, hand: THREE.Group, armL: THREE.Object3D) => void;
  eyeMaterial?: THREE.Material;
  /** Where a hat sits; none for the Storyteller, who never wears one. */
  hatFit?: HatPlace;
  /** Builds the same animal with lighter shapes, and the key its geometry is cached under. */
  lowKit?: () => Kit;
  lowKey?: string;
}

/** Distant versions of each animal and colour, shared by every rig that needs one. Never disposed: they're small. */
const lowCache = new Map<string, THREE.BufferGeometry>();

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * The turns (about z, then x) and stretch that put an arm's grip on a point, all in body space. The grip
 * hangs below the shoulder (and a little in front of it) when the arm is at rest.
 */
const X_AXIS = new THREE.Vector3(1, 0, 0);

function aim(shoulder: THREE.Vector3, grip: THREE.Vector3, target: THREE.Vector3, stretch = 1.3): { ax: number; az: number; s: number } {
  const d = target.clone().sub(shoulder);
  const len = grip.length();
  const s = THREE.MathUtils.clamp(d.length() / len, 0.7, stretch);
  const D = d.normalize().multiplyScalar(len);
  // Turning about z swings the grip out sideways; then turning about x carries it forward or up.
  const az = Math.asin(THREE.MathUtils.clamp(D.x / -grip.y, -1, 1));
  const gy = grip.y * Math.cos(az);
  const ax = wrap(Math.atan2(D.z, D.y) - Math.atan2(grip.z, gy));
  return { ax, az, s };
}

/** How far below the ground a tail (or a tentacle) may reach before it's lifted: a hair, so it still rests. */
const CLEAR_FLOOR = -0.012;
/**
 * How far the covers stand above the mattress, where a sleeper's root is (see the bed in town/interiors.ts), and how
 * far into them a sleeper sinks: asleep, it lies on top of them, and its tail along them.
 */
const COVERS = 0.04;
const SINK = 0.008;
const kcV = new THREE.Vector3();
const kcLow = new THREE.Vector3();
const kcPivot = new THREE.Vector3();
const kcAxis = new THREE.Vector3();
const kcUp = new THREE.Vector3(0, 1, 0);
const kcToRoot = new THREE.Matrix4();
const kcQ = new THREE.Quaternion();
const kcQr = new THREE.Quaternion();
const kcQp = new THREE.Quaternion();

class AnimalRig implements Rig {
  root = new THREE.Group();
  /** A few points near the ends of the tail (and tentacles), in their bones' own space, grouped by chain. */
  private lowPoints: { pivot: THREE.Bone; points: { bone: THREE.Bone; local: THREE.Vector3 }[] }[] | null = null;
  headHeight = 1;
  private float = new THREE.Group();
  private bones = new Map<string, THREE.Bone>();
  private body: THREE.Bone;
  private neck: THREE.Bone;
  private armL: THREE.Bone;
  private armR: THREE.Bone;
  private legL: THREE.Bone;
  private legR: THREE.Bone;
  private tail: THREE.Bone;
  private blinkers: THREE.Bone[];
  private extra: string[];
  private foreL: THREE.Bone | null;
  private foreR: THREE.Bone | null;
  /** How far down the arm the elbow is (0 for an arm that doesn't bend). */
  private elbow: number;
  private hand = new THREE.Group();
  private handTilt = new THREE.Group();
  private mesh: THREE.SkinnedMesh;
  private sk: Skel;
  private material: THREE.Material;
  private eyeMaterial: THREE.Material;
  private ghostMaterial: THREE.MeshStandardMaterial;
  private wisp: THREE.Mesh;
  private item: THREE.Object3D | null = null;
  private itemKey = '';
  private hold: Hold | null = null;
  private ghost = false;
  private pose = restPose();
  private auxNow: AuxMap = new Map();
  private phase = 0;
  /** What it's doing, and since when (rig time), so a dance starts from its first step. */
  private animNow: Anim = 'idle';
  private animStart = 0;
  private blinkAt = 2 + Math.random() * 3;
  private blinkT = -1;
  private seed = Math.random() * 100;
  /**
   * How far the body reaches below its feet at rest (a sculpted foot is rounded underneath): the whole
   * animal is raised by this, so it stands on the ground rather than in it.
   */
  private footLift = 0;
  /** How far the body is raised asleep, so it lies on top of the covers rather than in them (see measureBed). */
  private bedLift = 0;
  private prof: Profile;
  private clip: { name: Mannerism; t0: number; dur: number; side: number; data: number[] } | null = null;
  private nextClip = 1.5 + Math.random() * 3;
  private shut = 0;
  private grow = 0;
  private floats: boolean;
  private hover: number;
  private flaps: boolean;
  private tentacles: boolean;
  private noLegs: boolean;
  private sleepy: boolean;
  private tendril: boolean;
  /** Wings on the back: which way they move, their bones (and sides), how open they are and want to be, and the beat. */
  private wings: { mode: 'buzz' | 'flutter'; bones: [THREE.Bone, number][]; open: number; want: number; phase: number } | null = null;
  /** How much a mannerism has the wings fluttering. */
  private flutter = 0;
  /** Turret eyes: each one's bone and side, where it's looking (turned forward and up), where it's darting to, and when it next darts. */
  private turrets: { bone: THREE.Bone; side: number; yaw: number; pitch: number; toYaw: number; toPitch: number; next: number }[] = [];
  private shift: Shift | null;
  /** See-through parts (a bee's wings), if it has any. */
  private glassMaterial: THREE.Material | null = null;
  private owned: THREE.Material[] = [];
  private highGeo: THREE.BufferGeometry;
  private detail: 'high' | 'low' = 'high';
  private lowKit?: () => Kit;
  private lowKey?: string;
  private hatFit?: HatPlace;
  private hat: { id: HatId; built: BuiltHat; holder: THREE.Group; fold: string[] } | null = null;
  private baseHeadHeight = 1;
  // Landmarks in body space, for aiming paws.
  private shoulder: THREE.Vector3;
  private grip: THREE.Vector3;
  private paw: THREE.Vector3;
  /** How far the paw sticks out round its middle. */
  private pawR: number;
  private seat: number;
  /** How far a sculpted animal's back legs swing forward to sit (just enough to keep its feet down). */
  private sitLeg: number | null;
  private sipLow: boolean;
  private lift: number;
  /** How the arms hang at rest: forward and out (a sculpted animal's, the way it was made). */
  private armFwd: number;
  private armOut: number;
  private front: number;
  private mouth: THREE.Vector3;
  private eyePos: THREE.Vector3;
  private neckPos: THREE.Vector3;
  /** The head's middle (body space) and its half-width (cheeks included), height and depth. */
  private headC: THREE.Vector3;
  private headR: THREE.Vector3;
  private hasLegs: boolean;
  private shape: Shape;
  private v = new THREE.Vector3();
  private v2 = new THREE.Vector3();
  private v3 = new THREE.Vector3();
  private m4 = new THREE.Matrix4();
  private m5 = new THREE.Matrix4();
  private m6 = new THREE.Matrix4();

  constructor(p: RigParts) {
    const k = p.kit;
    const j = k.joints;
    this.prof = p.profile;
    this.floats = p.floats;
    this.hover = p.hover ?? 0.35;
    this.flaps = Boolean(p.flaps);
    this.tentacles = p.tentacles;
    this.noLegs = Boolean(p.noLegs);
    this.sleepy = Boolean(p.sleepy);
    this.tendril = Boolean(p.tendril);
    this.shift = p.shift ?? null;
    this.material = p.material;
    this.eyeMaterial = p.eyeMaterial ?? p.material;
    this.hatFit = p.hatFit;
    this.lowKit = p.lowKit;
    this.lowKey = p.lowKey;
    this.owned.push(p.material);
    if (p.eyeMaterial) this.owned.push(p.eyeMaterial);
    this.shoulder = new THREE.Vector3(-j.shoulder[0], j.shoulder[1], j.shoulder[2]);
    this.grip = new THREE.Vector3(...j.hand);
    this.paw = new THREE.Vector3(...(j.paw ?? [j.hand[0], j.hand[1], j.hand[2] * 0.2]));
    this.pawR = Math.max(0.03, (j.hand[2] - this.paw.z) * 0.9);
    this.seat = k.seat;
    const foot = k.sculpt?.named('legLFoot');
    const reach = foot ? k.joints.hip[1] - foot.c.y : 0;
    this.sipLow = Boolean(k.sipLow);
    this.lift = k.lift ?? 0;
    this.sitLeg = foot ? -Math.acos(THREE.MathUtils.clamp((reach - k.seat) / reach, -1, 1)) : null;
    const bind = k.bind?.armL;
    this.armFwd = bind ? -bind[0] : 0.14;
    this.armOut = bind ? bind[2] : 0.16;
    this.shape = k.shape;
    const s = k.shape;
    this.front = k.front ?? s.tc[2] + s.tr[2] * 1.12;
    this.mouth = new THREE.Vector3(...(k.nose ?? [0, s.hc[1] - s.hr[1] * 0.4, s.hc[2] + s.hr[2]])).add(new THREE.Vector3(...j.neck));
    this.eyePos = new THREE.Vector3(k.eyeX, k.eyeY, k.eyeZ).add(new THREE.Vector3(...j.neck));
    this.neckPos = new THREE.Vector3(...j.neck);
    this.headC = new THREE.Vector3(...s.hc).add(this.neckPos);
    this.headR = new THREE.Vector3(s.hr[0] * 1.15, s.hr[1], s.hr[2]);
    this.hasLegs = !k.legL.empty || Boolean(k.sculpt?.shapes.some((sh) => sh.bone === 'legL'));

    // The skeleton, at rest.
    this.sk = skeletonOf(k);
    for (const name of this.sk.names) {
      const b = new THREE.Bone();
      b.name = name;
      b.position.copy(this.sk.local.get(name)!);
      const parent = this.sk.parent.get(name);
      (parent ? this.bones.get(parent)! : this.float).add(b);
      this.bones.set(name, b);
    }
    const bone = (n: string) => this.bones.get(n)!;
    this.body = bone('body');
    this.neck = bone('neck');
    this.armL = bone('armL');
    this.armR = bone('armR');
    this.legL = bone('legL');
    this.legR = bone('legR');
    this.tail = bone('tail');
    this.blinkers = k.blink.map(bone).filter(Boolean);
    // A sculpted arm bends at the elbow; the forearms are posed with the arms, not as extras.
    this.foreL = this.bones.get('foreL') ?? null;
    this.foreR = this.bones.get('foreR') ?? null;
    this.elbow = this.foreR ? k.elbow ?? 0 : 0;
    this.extra = this.sk.names.filter((n) => !STANDARD.includes(n) && !OWN_MOTION.includes(n));
    const wl = this.bones.get('wingL');
    const wr = this.bones.get('wingR');
    if (p.wings && wl && wr) this.wings = { mode: p.wings, bones: [[wl, 1], [wr, -1]], open: 0, want: 0, phase: 0 };
    if (p.swivel) {
      for (const [name, side] of [['turretL', 1], ['turretR', -1]] as const) {
        const b = this.bones.get(name);
        if (b) this.turrets.push({ bone: b, side, yaw: 0, pitch: 0, toYaw: 0, toPitch: 0, next: 0 });
      }
    }
    this.root.add(this.float);
    // The hand's placement is worked out each frame (see applyPose), so it stays level and full size.
    this.hand.matrixAutoUpdate = false;
    (this.foreR ?? this.armR).add(this.hand);
    this.hand.add(this.handTilt);

    // One skinned mesh for the whole animal, eyes in their own material (and see-through parts in another).
    this.highGeo = skin(k, this.sk);
    if (this.highGeo.groups.length > 2) {
      const glass = soft();
      glass.transparent = true;
      glass.opacity = 0.5;
      glass.depthWrite = false;
      this.glassMaterial = glass;
      this.owned.push(glass);
    }
    this.mesh = new THREE.SkinnedMesh(this.highGeo, this.skinMaterials());
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = false;
    this.float.add(this.mesh);
    // Bones that start turned are bound turned (their poses still say where they point outright).
    for (const [name, rot] of Object.entries(k.bind ?? {})) this.bones.get(name)?.rotation.set(...rot);
    this.root.updateMatrixWorld(true);
    this.mesh.bind(new THREE.Skeleton(this.sk.names.map(bone)));
    {
      // The lowest point of the body at rest, leaving out the tail (kept clear of the ground on its own).
      const pos = this.highGeo.getAttribute('position') as THREE.BufferAttribute;
      const idx = this.highGeo.getAttribute('skinIndex') as THREE.BufferAttribute;
      const tails = new Set(this.chainOf('tail').map((n) => this.sk.names.indexOf(n)));
      let low = 0;
      for (let i = 0; i < pos.count; i++) if (!tails.has(idx.getX(i))) low = Math.min(low, pos.getY(i));
      this.footLift = Math.min(0.05, -low);
    }
    // Everything an animal does stays within this, so there's no need to work it out each frame.
    this.mesh.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.5, 0), 1.4);

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
    const wf = new Fold();
    tube(wf, seeded(7), {
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
    this.wisp = new THREE.Mesh(wf.geometry(), this.ghostMaterial);
    this.wisp.visible = false;
    // A sculpted body sits right down to the ground, so its wisp trails further below it.
    if (k.sculpt) {
      this.wisp.scale.set(0.8, 1.6, 0.8);
      this.wisp.position.y = 0.36 * (1 - 1.6);
    }
    this.body.add(this.wisp);

    p.extras?.(this.body, this.handTilt, this.armL);

    // (The sculpted Storyteller's robe is empty underneath: no wisp.)
    if (this.noLegs) {
      this.wisp.visible = !k.sculpt;
      this.wisp.material = this.material;
    }

    // Measure the head with the rig at rest.
    this.applyPose(1);
    this.root.updateMatrixWorld(true);
    // (A bat stands with its wings folded, and only hovers while it's flying.)
    this.headHeight = this.measureHead() + (this.floats && !this.flaps ? this.hover : 0);
    this.baseHeadHeight = this.headHeight;
    this.bedLift = this.measureBed();
  }

  /**
   * How far the body has to be raised asleep for its lowest point to rest on top of the covers, however deep its
   * back, its shell or its fins: measured once, with the rig put in its sleeping pose and then back at rest. (Tails,
   * and tentacles walked on, are left out beyond their roots: they're kept clear of the covers on their own.)
   */
  private measureBed(): number {
    const pose = { ...this.pose };
    const auxAt = new Map([...this.auxNow].map(([n, a]) => [n, [...a]]));
    // (Settled upright, its tentacles are already laid out over the covers: they count too.)
    const chains = this.prof.bed === 'upright' ? [] : this.freeChains();
    const free = new Set(chains.flatMap((r) => this.chainOf(r).map((n) => this.sk.names.indexOf(n))));
    const idx = this.highGeo.getAttribute('skinIndex') as THREE.BufferAttribute;
    const wgt = this.highGeo.getAttribute('skinWeight') as THREE.BufferAttribute;
    const v = new THREE.Vector3();
    let low = Infinity;
    // (At a few moments, as tentacles drift a little in their sleep.)
    for (const t of [0, 1.4, 2.8, 4.2, 5.6]) {
      this.applyPose(1, this.target({ anim: 'sleep', speed: 0, dt: 0, t: t - this.seed }));
      this.root.updateMatrixWorld(true);
      // (Right by the root of a tail, which barely moves as the tail is lifted, it counts as body.)
      const roots = chains.flatMap((n) => this.bones.get(n)?.getWorldPosition(new THREE.Vector3()) ?? []);
      for (let i = 0; i < idx.count; i++) {
        let onFree = 0;
        for (let k = 0; k < 4; k++) if (free.has(idx.getComponent(i, k))) onFree += wgt.getComponent(i, k);
        this.mesh.getVertexPosition(i, v);
        if (onFree > 0.85 && roots.every((r) => r.distanceTo(v) > 0.18)) continue;
        low = Math.min(low, v.y);
      }
    }
    Object.assign(this.pose, pose);
    this.auxNow = auxAt as AuxMap;
    this.clip = null;
    this.applyPose(1);
    this.root.updateMatrixWorld(true);
    return low === Infinity ? 0 : COVERS - SINK - this.footLift - low;
  }

  /** The top of everything that rides on the neck, at rest. */
  private measureHead(): number {
    const pos = this.mesh.geometry.getAttribute('position') as THREE.BufferAttribute;
    const idx = this.mesh.geometry.getAttribute('skinIndex') as THREE.BufferAttribute;
    const onHead = new Set<number>();
    this.sk.names.forEach((n, i) => {
      for (let b: string | null | undefined = n; b; b = this.sk.parent.get(b)) {
        if (b === 'neck') {
          onHead.add(i);
          break;
        }
      }
    });
    let top = 0;
    for (let i = 0; i < pos.count; i++) if (onHead.has(idx.getX(i))) top = Math.max(top, pos.getY(i));
    return top;
  }

  /** For the test bench: the rig's insides. */
  inspect() {
    return { mesh: this.mesh, bones: this.bones, shape: this.shape, item: this.item, body: this.body, neck: this.neck, profile: this.prof, hold: this.hold };
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
    // Worked out once for each animal and hat, from the head's shape and what stands off it.
    const key = `${this.hatFit.id}:${hat}`;
    let fit = fitted.get(key);
    if (!fit) {
      const place = this.hatFit;
      // (A sleepy head hangs forward as it stands about.)
      const droop = this.prof.head + (this.sleepy ? 0.2 : 0);
      fit = fitHat(hat, built, { ...place.head, droop, bits: this.hatBits() }, { ...place.nudge, ...place.nudge.hats?.[hat] });
      fitted.set(key, fit);
    }
    const holder = new THREE.Group();
    holder.position.set(...fit.pos);
    holder.rotation.set(...fit.rot);
    holder.scale.set(...fit.scale);
    holder.add(built.group);
    this.neck.add(holder);
    this.hat = { id: hat, built, holder, fold: fit.fold };
    this.applyHatGhost();
    // The name label and anything floating over the head have to clear the hat.
    const top = this.sk.rest.get('neck')!.y + fit.pos[1] + built.top * fit.scale[1] + (this.floats ? this.hover : 0);
    this.headHeight = Math.max(this.baseHeadHeight, top);
  }

  /**
   * What stands off the head (neck space, at rest), for fitting hats round: the ears (and antennae and anything
   * else that folds away under a hat), the eyes, eye stalks, and whatever else stands out of the skull above the eyes
   * (horns, antlers, crests), a few dozen points of each.
   */
  private hatBits(): HatBit[] {
    const place = this.hatFit!;
    // (Always the close-up surface, whichever is showing.)
    const pos = this.highGeo.getAttribute('position') as THREE.BufferAttribute;
    const idx = this.highGeo.getAttribute('skinIndex') as THREE.BufferAttribute;
    const [nx, ny, nz] = place.neckAt;
    const { c, r } = place.head;
    // (From the eyes up, or the middle of the head up if the eyes are higher than that, on stalks.)
    const low = Math.min(place.head.eye.at[1] - place.head.eye.r, c[1]);
    const bumps = place.nudge.bumps;
    const groups = new Map<string, THREE.Vector3[]>();
    for (let i = 0; i < pos.count; i++) {
      const bone = this.sk.names[idx.getX(i)];
      const is = hatBitOf(bone);
      if (!is) continue;
      const p = new THREE.Vector3(pos.getX(i) - nx, pos.getY(i) - ny, pos.getZ(i) - nz);
      // On the head itself, from the eyes up: the skull (which a hat should cover, or fit round), and whatever
      // stands out of it (which a hat has to keep clear of).
      let group = bone;
      if (bone === 'neck') {
        if (p.y < low) continue;
        const out = ((p.x - c[0]) / r[0]) ** 2 + ((p.y - c[1]) / r[1]) ** 2 + ((p.z - c[2]) / r[2]) ** 2 > 1.25;
        if (out && bumps === 'none') continue;
        group = out && bumps !== 'head' ? 'neck' : 'skull';
      }
      (groups.get(group) ?? groups.set(group, []).get(group)!).push(p);
    }
    const bits: HatBit[] = [];
    for (const [bone, pts] of groups) {
      const keep = bone === 'skull' ? 160 : 30;
      const step = Math.max(1, Math.floor(pts.length / keep));
      const some = pts.filter((_, i) => i % step === 0);
      // What stands out of the skull, one piece at a time (a horn, an antler, a tuft).
      if (bone === 'neck') for (const piece of clumps(pts, 0.03)) bits.push({ bone, is: 'solid', pts: piece.filter((_, i) => i % Math.max(1, Math.floor(piece.length / 30)) === 0) });
      else bits.push({ bone, is: bone === 'skull' ? 'head' : hatBitOf(bone)!, pts: some });
    }
    return bits;
  }

  private applyHatGhost() {
    const solids = this.hat?.built.solid ?? [];
    for (const { mesh, material } of solids) {
      mesh.material = this.ghost ? this.ghostMaterial : material;
      mesh.castShadow = !this.ghost;
    }
  }

  setDetail(level: 'high' | 'low') {
    if (level === this.detail) return;
    if (level === 'low') {
      const g = this.prepareLow();
      if (!g) return;
      this.mesh.geometry = g;
    } else this.mesh.geometry = this.highGeo;
    this.detail = level;
  }

  /**
   * Sculpts the far-off model now, if it isn't already (it's kept for every animal of that look). That takes about as
   * long as building the animal, so it's done along with that, rather than as they first wander off across town,
   * where it stalled a frame for each animal.
   */
  prepareLow(): THREE.BufferGeometry | null {
    if (!this.lowKit || !this.lowKey) return null;
    let g = lowCache.get(this.lowKey);
    if (!g) {
      const lk = lowDetail(this.lowKit);
      g = skin(lk, this.sk);
      lowCache.set(this.lowKey, g);
    }
    return g;
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

  /** The skinned mesh's materials, for the body, the eyes and anything see-through: its own, or a ghost's. */
  private skinMaterials(): THREE.Material[] {
    const glass = this.glassMaterial ? [this.ghost ? this.ghostMaterial : this.glassMaterial] : [];
    return this.ghost ? [this.ghostMaterial, GHOST_EYES, ...glass] : [this.material, this.eyeMaterial, ...glass];
  }

  setGhost(on: boolean) {
    if (on === this.ghost) return;
    this.ghost = on;
    this.mesh.material = this.skinMaterials();
    this.mesh.castShadow = !on;
    if (!this.noLegs && this.hasLegs) this.wisp.visible = on;
    this.wisp.material = on || !this.noLegs ? this.ghostMaterial : this.material;
    this.item?.traverse((o) => (o.castShadow = !on));
    this.applyHatGhost();
  }

  /**
   * Puts the right paw's grip on a spot in body space: `y` up, `z` forward, and `out` metres further out to
   * the side than the shoulder (less than 0 brings it in towards the middle). The left paw takes the mirror
   * image.
   */
  private reach(P: Pose, side: 'r' | 'l' | 'both', y: number, z: number, out: number, by: 'grip' | 'paw' = 'grip') {
    const sh = this.shoulder;
    const end = by === 'paw' ? this.paw : this.grip;
    const target = new THREE.Vector3(sh.x - out, Math.max(0.1, y), z);
    // An arm with an elbow bends just enough for the paw to land on the spot (the forearm coming up forward),
    // and the whole arm is then turned to point there.
    const bend = this.elbow ? this.bendFor(end, target.distanceTo(sh)) : 0;
    const reachVec = this.elbow ? this.bent(end, bend) : end;
    // A snail's tendril is stretchier than a leg.
    const { ax, az, s } = aim(sh, reachVec, target, this.tendril ? 2 : this.elbow ? 1.15 : 1.3);
    if (side !== 'l') {
      P.arx = ax;
      P.arz = az;
      P.sr = s;
      P.er = bend;
    }
    if (side !== 'r') {
      P.alx = ax;
      P.alz = -az;
      P.sl = s;
      P.el = bend;
    }
  }

  /** Where a point on the forearm (in the straight arm's space) ends up with the elbow bent this far. */
  private bent(p: THREE.Vector3, bend: number): THREE.Vector3 {
    const e = new THREE.Vector3(0, this.elbow, 0);
    return p.clone().add(e).applyAxisAngle(X_AXIS, -bend).sub(e);
  }

  /** The bend that brings a point on the forearm this far from the shoulder (straight if it can't reach). */
  private bendFor(p: THREE.Vector3, dist: number): number {
    let lo = 0;
    let hi = 2.6;
    if (this.bent(p, 0).length() <= dist) return 0;
    for (let i = 0; i < 14; i++) {
      const m = (lo + hi) / 2;
      if (this.bent(p, m).length() > dist) lo = m;
      else hi = m;
    }
    return (lo + hi) / 2;
  }

  /**
   * Where the grip goes to carry something: short arms carry things higher up, within an easy reach, and
   * far enough forward that the paw (not just the thing in it) is clear of the tummy.
   */
  private holdSpot(h: Hold): { y: number; z: number } {
    const low = this.shoulder.y - this.grip.length() * 0.8;
    // Under a jellyfish's bell, things are kept down below it.
    const y = Math.min(Math.max(low, this.shoulder.y + h.dy), this.sipLow ? this.shoulder.y - 0.1 : Infinity);
    return {
      // A snail's tendril starts low, so it lifts things up to about the height of its head.
      y: this.tendril ? Math.max(y + 0.1, (h.hang ?? 0.08) + 0.18, 0.54) : y + this.lift,
      z: Math.max(this.front + h.dz, this.front + this.pawR + (this.grip.z - this.paw.z) * 0.8) + (this.tendril ? -0.02 : 0),
    };
  }

  /** Paws holding something clear of the body, for standing, walking and sitting (or just the right paw). */
  private carryPose(P: Pose, sway: number, rightOnly = false) {
    const h = this.hold;
    if (!h) return;
    const at = this.holdSpot(h);
    const both = h.both && !rightOnly;
    this.reach(P, both ? 'both' : 'r', at.y, at.z, both ? h.out : Math.max(h.out, 0.04));
    P.arx += sway;
    P.carry = 0;
    if (both) {
      P.alx += sway;
      P.carry = 1;
    }
  }

  /** Where a spot on the head (body space, at rest) is once the head is pitched by `hrx`. */
  private headNow(p: THREE.Vector3, hrx: number): THREE.Vector3 {
    return p.clone().sub(this.neckPos).applyAxisAngle(new THREE.Vector3(1, 0, 0), hrx).add(this.neckPos);
  }

  /** How far the grip can reach from the shoulder (the arm straight). */
  private reachLength(): number {
    return this.grip.length();
  }

  /** How far forward the face is (body space, at rest) at a height. */
  private faceFront(y: number): number {
    const u = (y - this.headC.y) / this.headR.y;
    return this.headC.z + this.headR.z * Math.sqrt(Math.max(0, 1 - u * u));
  }

  /** Out to the side of the head, clear of it, as an `out` for `reach`. */
  private besideHead(extra = 0): number {
    return this.headR.x + this.pawR + 0.03 + extra - Math.abs(this.shoulder.x);
  }

  /**
   * A paw raised beside the head: as high as `y` if the arm reaches, otherwise as high as it can while
   * staying clear of the side of the head (a bunny can't get a paw over its ears).
   */
  private raise(P: Pose, side: 'r' | 'both', y: number, extra = 0) {
    // (A wing goes up and out wide, so its membrane doesn't sweep across the head.)
    const out = this.besideHead(extra) + (this.flaps ? 0.22 : 0);
    const sh = this.shoulder;
    const z = this.headC.z;
    const L = this.paw.length() * 1.25;
    const room = L * L - out * out - (z - sh.z) ** 2;
    const top = sh.y + Math.sqrt(Math.max(0, room));
    this.reach(P, side, Math.min(y, top), z, out, 'paw');
  }

  /** The paw that isn't busy: held up in front for animals that carry their paws that way. */
  private freePaw(P: Pose) {
    if (!this.prof.paws) return;
    const left = this.rest();
    this.reach(left, 'l', this.shoulder.y - this.prof.paws, this.front + this.pawR + 0.01, -0.035, 'paw');
    P.alx = left.alx;
    P.alz = left.alz;
    P.sl = left.sl;
    P.el = left.el;
  }

  /** Whether a winged flier has its wings folded: whenever it isn't flying or gesturing with them. */
  private folded(s: RigState): boolean {
    return s.anim === 'idle' || s.anim === 'sit' || s.anim === 'sleep' || s.anim === 'drink' || s.anim === 'fish' || s.anim === 'laugh' || s.anim === 'cry';
  }

  /** The pose everything starts from, with the arms hanging the way this animal's do. */
  private rest(): Pose {
    const P = restPose();
    P.alx = P.arx = -this.armFwd;
    P.alz = this.armOut;
    P.arz = -this.armOut;
    return P;
  }

  /** Walking and running, in the species' own gait. */
  private gait(P: Pose, A: AuxMap, s: RigState) {
    const run = s.anim === 'run';
    const w = this.phase;
    const sin = Math.sin;
    const prof = this.prof;
    const amp = THREE.MathUtils.clamp(Math.max(s.speed, run ? 3 : 1.5) / 3.6, 0.35, 0.95) * prof.stride;
    switch (prof.gait) {
      case 'hop': {
        // Both back feet together: kick off, tuck up in the air, reach forward to land.
        const up = Math.max(0, sin(w));
        const down = Math.max(0, -sin(w));
        P.by = up * (run ? 0.13 : 0.085);
        P.brx = 0.05 + up * 0.14;
        P.llx = P.lrx = up * 0.6 - down * 0.25;
        // Paws tucked up in front of the chest, bobbing with each hop.
        this.reach(P, 'both', this.shoulder.y - (prof.paws || 0.1) + up * 0.02, this.front + this.pawR + 0.01, -0.03, 'paw');
        P.alx -= up * 0.15;
        P.arx -= up * 0.15;
        P.hrx = -up * 0.12;
        aux(A, 'earL')[0] = aux(A, 'earR')[0] = -0.2 - up * 0.45;
        break;
      }
      case 'slither': {
        // The back of the foot draws up, then the front pushes on: a slow stretch and contract, the head
        // dipping as it pushes and the stalks swaying.
        const k = sin(w);
        aux(A, 'rear')[5] = 0.08 * k;
        P.hrx = -0.14 * Math.max(0, -k) + 0.05;
        P.hrz = sin(w * 0.5) * 0.06;
        P.brx = 0;
        P.by = Math.max(0, k) * 0.012;
        aux(A, 'stalkL')[0] = aux(A, 'stalkR')[0] = 0.18 + 0.08 * k;
        aux(A, 'stalkL')[2] = 0.06 + sin(w * 0.5) * 0.08;
        aux(A, 'stalkR')[2] = -0.06 + sin(w * 0.5 + 1) * 0.08;
        break;
      }
      case 'waddle': {
        // Short quick steps and a big rock from foot to foot, wings (or flippers) held out a little for
        // balance, the head keeping level and the tail wagging the other way.
        P.llx = sin(w) * amp * 0.9;
        P.lrx = -sin(w) * amp * 0.9;
        P.brz = sin(w) * 0.17;
        P.bry = sin(w) * 0.06;
        P.by = Math.abs(sin(w)) * 0.03;
        P.brx = run ? 0.12 : 0.03;
        P.hrz = -P.brz * 0.7;
        P.hrx = -P.brx * 0.6;
        const outward = 0.35 + Math.abs(sin(w)) * 0.12;
        P.alz = this.armOut + outward;
        P.arz = -this.armOut - outward;
        P.alx = P.arx = -this.armFwd - 0.05;
        P.try = -sin(w) * 0.45;
        break;
      }
      case 'float': {
        // Drifting along: a slow bob and a lean into the way it's going, everything trailing a beat behind.
        P.by = sin(w * 0.5) * 0.03;
        P.brx = run ? 0.25 : 0.14;
        P.brz = sin(w * 0.5) * 0.05;
        P.hrx = -P.brx * 0.4;
        P.alx = P.arx = -this.armFwd + 0.35 + sin(w - 0.8) * 0.15;
        P.alz = this.armOut + 0.1;
        P.arz = -this.armOut - 0.1;
        P.llx = P.lrx = 0.4 + sin(w - 1.2) * 0.15;
        break;
      }
      case 'flap': {
        // Flying low: the wings beat (see the flapping below), the body bobs with each beat and the feet tuck up.
        P.by = Math.abs(sin(w)) * 0.04;
        P.brx = run ? 0.3 : 0.18;
        P.hrx = -P.brx * 0.7;
        P.llx = P.lrx = 0.5;
        P.brz = sin(w * 0.5) * 0.06;
        break;
      }
      case 'scuttle': {
        // Rippling along on its tentacles: quick little bobs and a roll, the arms paddling too.
        P.by = Math.abs(sin(w * 2)) * 0.035;
        P.brz = sin(w) * 0.1;
        P.bry = sin(w) * 0.08;
        P.brx = run ? 0.12 : 0.04;
        P.hrz = -P.brz * 0.5;
        P.llx = sin(w) * 0.3;
        P.lrx = -sin(w) * 0.3;
        P.alx = -this.armFwd - 0.2 - sin(w) * 0.35;
        P.arx = -this.armFwd - 0.2 + sin(w) * 0.35;
        P.el = Math.max(0, sin(w)) * 0.6;
        P.er = Math.max(0, -sin(w)) * 0.6;
        break;
      }
      case 'amble': {
        // A rolling, hunched amble: big steps, a bob on every step and a roll from side to side, front paws
        // swinging like front legs (lifted on the way forward), and the tail swinging a beat behind.
        P.llx = sin(w) * amp * 1.5;
        P.lrx = -sin(w) * amp * 1.5;
        // Swinging about a forward point (ahead of where they rest), so the paws never swing back into the belly.
        const fwd = run ? Math.max(0.58, this.armFwd + 0.25) : Math.max(0.34, this.armFwd + 0.08);
        P.alx = -fwd - sin(w) * amp * (run ? 0.5 : 0.55);
        P.arx = -fwd + sin(w) * amp * (run ? 0.5 : 0.55);
        P.el = Math.max(0, sin(w)) * 0.7;
        P.er = Math.max(0, -sin(w)) * 0.7;
        P.alz = 0.1;
        P.arz = -0.1;
        P.brz = sin(w) * 0.13;
        P.bry = sin(w) * 0.09;
        P.by = Math.abs(sin(w)) * 0.04;
        P.brx = run ? 0.18 : 0.06;
        P.hrx = -P.brx * 0.6 + sin(w * 2) * 0.05;
        P.hrz = -sin(w) * 0.1;
        P.try = sin(w - 0.6) * 0.4;
        P.trx = run ? 0.2 : 0.05;
        aux(A, 'tail1')[1] = sin(w - 1.2) * 0.3;
        aux(A, 'tail2')[1] = sin(w - 1.8) * 0.35;
        break;
      }
      default: {
        // A light, quick trot: long steps, a spring on every step, front paws lifting as they come forward,
        // and the tail streaming a beat behind.
        P.llx = sin(w) * amp * 1.4;
        P.lrx = -sin(w) * amp * 1.4;
        const fwd = Math.max(0.3, this.armFwd);
        P.alx = -fwd - sin(w) * amp * 0.55;
        P.arx = -fwd + sin(w) * amp * 0.55;
        P.el = Math.max(0, sin(w)) * 0.8;
        P.er = Math.max(0, -sin(w)) * 0.8;
        P.alz = 0.12;
        P.arz = -0.12;
        P.by = Math.abs(sin(w)) * (run ? 0.06 : 0.045);
        P.brz = sin(w) * 0.07;
        P.bry = sin(w) * 0.05;
        P.brx = run ? 0.14 : 0.05;
        P.hrx = -P.brx * 0.6 + Math.abs(sin(w)) * 0.04;
        P.try = sin(w - 0.6) * 0.4;
        P.trx = run ? 0.25 : 0.08;
        aux(A, 'tail1')[1] = sin(w - 1.2) * 0.3;
        aux(A, 'tail2')[1] = sin(w - 1.8) * 0.35;
      }
    }
    if (prof.earsBack && prof.gait !== 'hop') aux(A, 'earL')[0] = aux(A, 'earR')[0] = -prof.earsBack * (run ? 1 : 0.5);
    if (this.hold) {
      const left = [P.alx, P.alz, P.sl, P.el] as const;
      this.carryPose(P, prof.gait === 'hop' ? 0 : sin(w) * 0.06);
      if (!this.hold.both) [P.alx, P.alz, P.sl, P.el] = left;
    }
  }

  /** Sitting down, in the species' own way. */
  private sit(P: Pose, A: AuxMap, t: number) {
    const sh = this.shoulder;
    const style = this.prof.sit;
    if (style === 'settle' || !this.hasLegs) {
      // Settling low: the head bows a touch and the stalks relax.
      P.by = -0.01;
      P.hrx = 0.12;
      aux(A, 'rear')[5] = 0.025;
      aux(A, 'stalkL')[0] = aux(A, 'stalkR')[0] = 0.3;
      aux(A, 'stalkL')[2] = 0.12;
      aux(A, 'stalkR')[2] = -0.12;
      if (this.hold) this.carryPose(P, 0);
      return;
    }
    P.by = -this.seat + 0.004;
    if (style === 'feet') {
      // Sat back with the big feet out in front, paws resting on the tummy.
      P.brx = -0.14;
      P.llx = P.lrx = this.sitLeg ?? -1.5;
      P.llz = 0.22;
      P.lrz = -0.22;
      this.reach(P, 'both', sh.y - Math.min(0.2, this.grip.length() * 0.7), this.front + this.pawR + 0.005, -0.05, 'paw');
      P.hrx = 0.1;
      P.trx = 0.4;
    } else {
      // Back feet forward, front legs straight down to the ground, like the papercraft raccoon.
      P.llx = P.lrx = this.sitLeg ?? -1.3;
      P.llz = 0.16;
      P.lrz = -0.16;
      this.reach(P, 'both', this.seat + this.pawR * 0.8, this.front + this.pawR + 0.03, -0.02, 'paw');
      if (style === 'wrap') {
        // The tail swept round on the ground to lie by the front feet, head tilted. (Angles found by fitting
        // the tail to the ground and round the side on the test bench.)
        P.trx = 0.8;
        P.try = -0.34;
        aux(A, 'tail1')[0] = -0.8;
        aux(A, 'tail1')[1] = -1.6;
        aux(A, 'tail2')[0] = -0.66;
        aux(A, 'tail2')[1] = -0.85;
        P.hrz = 0.16;
        P.hry = 0.12 + Math.sin(t * 0.3) * 0.08;
      } else {
        // The tail curled round on the ground beside it, like the papercraft raccoon's.
        P.trx = 0.67;
        P.try = -0.08;
        aux(A, 'tail1')[0] = -0.79;
        aux(A, 'tail1')[1] = -1.08;
        aux(A, 'tail2')[0] = 0.29;
        aux(A, 'tail2')[1] = -1.21;
        P.hry = Math.sin(t * 0.35) * 0.2;
      }
    }
    if (this.hold) {
      const left = [P.alx, P.alz, P.sl, P.el] as const;
      this.carryPose(P, 0);
      if (!this.hold.both) [P.alx, P.alz, P.sl, P.el] = left;
    }
  }

  /**
   * The dances from the Dances picker, `d` seconds in (each starts from its beginning). All at 120 beats a minute,
   * built from the same few bones as everything else, so they work on any body: legs, tentacles or none.
   */
  private dance(P: Pose, A: AuxMap, anim: Anim, d: number) {
    const sin = Math.sin;
    const cos = Math.cos;
    const sh = this.shoulder;
    const hipY = this.sk.rest.get('legL')!.y;
    const beat = d * 2;
    const ears = (x: number, z: number) => {
      aux(A, 'earL')[0] = aux(A, 'earR')[0] = x;
      aux(A, 'earL')[2] = aux(A, 'earR')[2] = z;
    };
    switch (anim) {
      case 'twerk': {
        // Bent right over, feet wide, paws on the knees and the bum bouncing and wiggling as fast as it goes, the
        // tail going like mad, with a cheeky look back over the shoulder now and then.
        // (Four pops a second, the bum going up with each and swinging to alternate sides.)
        const pop = Math.abs(sin(d * 13));
        const w = sin(d * 13);
        const drift = sin(d * Math.PI);
        P.brx = 0.62 + pop * 0.16;
        P.bz = -0.07;
        P.by = -0.04 + pop * 0.035;
        P.bry = w * 0.15 + drift * 0.1;
        // Rocked from side to side about the shoulders, so it's the bum that swings.
        P.brz = w * 0.24;
        P.bx = sh.y * sin(P.brz);
        P.llx = P.lrx = -0.6;
        P.llz = 0.32;
        P.lrz = -0.32;
        this.reach(P, 'both', Math.max(hipY - 0.04, 0.12), this.front + this.pawR + 0.02, 0.06, 'paw');
        const look = THREE.MathUtils.smoothstep(sin(d * 1.3), 0.3, 0.8);
        P.hrx = -0.55;
        P.hry = look * 0.9;
        P.hrz = look * 0.2;
        P.trx = 0.7;
        P.try = w * 0.9;
        aux(A, 'tail1')[1] = w * 0.5;
        aux(A, 'tail2')[1] = -w * 0.6;
        aux(A, 'rear')[3] = w * 0.04;
        ears(0, w * 0.2);
        break;
      }
      case 'griddy': {
        // Six beats of heel taps, a hop onto each heel in turn with the arms swinging big, then both paws up round
        // the eyes like goggles for two.
        const bar = beat % 8;
        if (bar < 6) {
          const side = Math.floor(bar) % 2 ? 1 : -1;
          const u = bar % 1;
          const tap = sin(u * Math.PI);
          P.by = tap * 0.06;
          P.brx = -0.1;
          // The heel out in front, toes up; the other leg bent under.
          P.llx = side > 0 ? -0.75 * tap : 0.15 * tap;
          P.lrx = side < 0 ? -0.75 * tap : 0.15 * tap;
          P.bry = side * 0.2 * tap;
          P.brz = side * 0.05;
          const swing = side * (0.4 + 0.6 * tap);
          P.alx = -0.3 - swing;
          P.arx = -0.3 + swing;
          P.alz = this.armOut + 0.25;
          P.arz = -this.armOut - 0.25;
          P.el = P.er = 0.7;
          P.hrz = -side * 0.1;
          P.try = side * 0.6;
        } else {
          const e = this.headNow(this.eyePos, -0.15);
          this.reach(P, 'both', e.y, e.z + this.pawR + 0.04, e.x - Math.abs(sh.x) - 0.02, 'paw');
          const k = sin(d * 10);
          P.alx += k * 0.06;
          P.arx -= k * 0.06;
          P.hrx = -0.15;
          P.hry = sin(d * 3) * 0.3;
          P.by = Math.abs(sin(d * Math.PI * 2)) * 0.03;
          P.brx = -0.06;
          P.llz = 0.12;
          P.lrz = -0.12;
        }
        ears(-0.15, 0);
        break;
      }
      case 'floss': {
        // Straight arms swung from side to side together, in front going one way and behind coming back, the
        // hips swinging the other way and the head bobbing along.
        const side = sin(d * Math.PI * 2.2);
        P.alz = this.armOut + 0.2 + side * 1.15;
        P.arz = -this.armOut - 0.2 + side * 1.15;
        P.alx = P.arx = -0.15 - side * 0.95;
        P.brz = side * 0.16;
        P.bry = -side * 0.22;
        P.hrz = -side * 0.22;
        P.by = Math.abs(cos(d * Math.PI * 2.2)) * 0.025;
        P.llz = 0.1 - side * 0.12;
        P.lrz = -0.1 - side * 0.12;
        P.try = -side * 0.6;
        ears(0, side * 0.2);
        break;
      }
      case 'robot': {
        // Stiff, held poses that snap from one to the next on every beat, the head and body turning in jerks.
        const n = Math.floor(beat) % 8;
        const up = Math.PI * 0.85;
        const fwd = -1.5;
        const poses: [number, number, number, number, number, number, number, number][] = [
          // alx, alz, arx, arz, elbows, head turn, body turn, head nod
          [fwd, 0.15, fwd, -0.15, 0, 0, 0, 0],
          [fwd, 0.15, -0.1, -up, 0, -0.55, 0, 0],
          [-0.1, 1.5, -0.1, -1.5, 0, 0, 0.45, 0],
          [-0.1, 1.5, -0.1, -1.5, 1.4, 0.4, 0.45, 0.15],
          [-0.1, up, fwd, -0.15, 0, 0.55, -0.4, 0],
          [-0.2, 0.2, -0.2, -0.2, 1.5, 0, -0.4, 0.3],
          [-0.1, 2.3, -0.1, -0.7, 0.9, -0.3, 0, -0.1],
          [-0.1, 0.7, -0.1, -2.3, 0.9, 0.3, 0, -0.1],
        ];
        const [alx, alz, arx, arz, el, hry, bry, hrx] = poses[n];
        P.alx = alx;
        P.alz = alz;
        P.arx = arx;
        P.arz = arz;
        P.el = P.er = el;
        P.hry = hry;
        P.bry = bry;
        P.hrx = hrx;
        // A little jolt as each pose locks in.
        P.by = Math.max(0, 1 - (beat % 1) * 6) * 0.025;
        P.llz = 0.08;
        P.lrz = -0.08;
        break;
      }
      case 'moonwalk': {
        // Gliding backwards on the spot with the feet sliding in turn, a spin, and up on the toes with a paw in
        // the air, then round again.
        const c = d % 4;
        if (c < 2.8) {
          const u = c / 2.8;
          P.bz = 0.13 - 0.3 * u;
          const step = sin(u * Math.PI * 4);
          // One foot slides back flat while the other is bent up on its toe, swapping over.
          P.llx = step * 0.35;
          P.lrx = -step * 0.35;
          P.by = Math.abs(step) * 0.015;
          P.brx = 0.06;
          P.alx = -0.2 + step * 0.3;
          P.arx = -0.2 - step * 0.3;
          P.el = P.er = 0.8;
          P.hrx = -0.05 + Math.abs(step) * 0.05;
          P.try = step * 0.3;
        } else if (c < 3.4) {
          const u = THREE.MathUtils.smoothstep((c - 2.8) / 0.6, 0, 1);
          P.bry = u * Math.PI * 2;
          P.bz = -0.17 + 0.3 * u;
          P.alz = this.armOut + 0.6;
          P.arz = -this.armOut - 0.6;
          P.llz = 0.05;
          P.lrz = -0.05;
          P.try = 0.6;
        } else {
          // On tiptoe, a paw up and the head cocked.
          P.bz = 0.13;
          P.by = 0.04;
          P.brx = -0.08;
          this.raise(P, 'r', this.headC.y + this.headR.y + 0.1, 0);
          P.alz = this.armOut + 0.3;
          P.hrz = 0.2;
          P.hrx = -0.15;
          P.llz = 0.02;
          P.lrz = -0.02;
          ears(-0.3, 0);
        }
        break;
      }
      case 'horse': {
        // Riding an invisible horse: a skip from foot to foot, two hops on each, paws crossed at the wrists holding
        // the reins and bouncing; every fourth bar the right paw goes up to swing a lasso.
        const q = d * 4;
        const hop = Math.abs(sin(q * Math.PI));
        const left = Math.floor(q / 2) % 2 === 0;
        P.by = hop * 0.06;
        P.llx = left ? -0.55 * hop : 0.05;
        P.lrx = left ? 0.05 : -0.55 * hop;
        P.brx = -0.06;
        P.bry = (left ? 1 : -1) * 0.12;
        P.brz = (left ? -1 : 1) * 0.05;
        this.reach(P, 'both', sh.y - 0.04 + hop * 0.03, this.front + this.pawR + 0.08, sh.x - 0.02, 'paw');
        if (beat % 16 >= 12) {
          // The lasso: up over the head, going round.
          this.raise(P, 'r', this.headC.y + this.headR.y + 0.14, 0.04 + sin(d * 14) * 0.08);
          P.arx += cos(d * 14) * 0.25;
          P.hrx = -0.2;
        } else P.hrx = hop * 0.12 - 0.04;
        P.try = (left ? 1 : -1) * 0.5;
        ears(-0.2 + hop * 0.2, 0);
        break;
      }
      case 'macarena': {
        // Sixteen beats: each paw in turn out front, palm down then up, to the opposite shoulder, behind the head,
        // to the opposite hip and onto the bum; a wiggle, then a jump and a quarter turn.
        const bar = beat % 16;
        const r = Math.floor(bar / 2);
        const l = Math.floor((bar + 15) / 2) % 8;
        const across = sh.x * 2 - 0.02;
        const back = this.shape.tc[2] - this.shape.tr[2] - this.pawR;
        const place = (side: 'r' | 'l', step: number) => {
          switch (Math.min(step, 5)) {
            case 0:
              this.reach(P, side, sh.y - 0.02, this.front + 0.4, -0.02, 'paw');
              break;
            case 1:
              this.reach(P, side, sh.y + 0.04, this.front + 0.4, -0.02, 'paw');
              break;
            case 2:
              this.reach(P, side, sh.y - 0.02, this.front + this.pawR, across, 'paw');
              break;
            case 3:
              this.reach(P, side, this.headC.y + 0.04, this.headC.z - this.headR.z * 0.2, this.besideHead(0.01), 'paw');
              break;
            case 4:
              this.reach(P, side, hipY + 0.04, this.front + this.pawR, across * 0.6, 'paw');
              break;
            default:
              this.reach(P, side, hipY + 0.02, back, 0.02, 'paw');
          }
        };
        place('r', r);
        place('l', l);
        const wiggle = bar >= 12 && bar < 15 ? sin((bar - 12) * Math.PI * 2) : 0;
        P.bry = wiggle * 0.25;
        P.brz = -wiggle * 0.08;
        P.try = wiggle * 0.8;
        // The jump and the turn, which carries on from wherever the last one left off.
        const turns = Math.floor(beat / 16) + (bar >= 15 ? THREE.MathUtils.smoothstep(bar - 15, 0, 1) : 0);
        P.bry += (turns % 4) * (Math.PI / 2);
        P.by = bar >= 15 ? sin((bar - 15) * Math.PI) * 0.12 : Math.abs(sin(beat * Math.PI)) * 0.015;
        P.hry = bar < 12 ? (r % 2 ? 0.15 : -0.15) : 0;
        P.hrz = sin(beat * Math.PI) * 0.06;
        ears(0, sin(beat * Math.PI) * 0.15);
        break;
      }
    }
  }

  /** The little things it does while standing about, one at a time. */
  private mannerism(P: Pose, A: AuxMap, t: number) {
    if (!this.clip && t >= this.nextClip && this.prof.idles.length) {
      const name = this.prof.idles[Math.floor(Math.random() * this.prof.idles.length)];
      const r = () => Math.random() * 2 - 1;
      this.clip = { name, t0: t, dur: CLIP_LEN[name], side: Math.random() < 0.5 ? -1 : 1, data: [r(), r(), r(), r()] };
    }
    const c = this.clip;
    if (!c) return;
    const p = (t - c.t0) / c.dur;
    if (p >= 1 || p < 0) {
      this.clip = null;
      this.nextClip = t + 2.5 + Math.random() * 4.5;
      return;
    }
    const e = envelope(p);
    const sd = c.side;
    const sin = Math.sin;
    const sh = this.shoulder;
    const blendTo = (target: Pose, keys: (keyof Pose)[]) => {
      for (const key of keys) P[key] += (target[key] - P[key]) * e;
    };
    switch (c.name) {
      case 'earSwivel': {
        // One ear turns out to listen, then the other, then both come back.
        const a = envelope(clamp01(p / 0.65));
        const b = envelope(clamp01((p - 0.3) / 0.65));
        aux(A, sd > 0 ? 'earL' : 'earR')[1] += sd * 0.7 * a;
        aux(A, sd > 0 ? 'earR' : 'earL')[1] += -sd * 0.7 * b;
        aux(A, 'earL')[0] -= 0.1 * Math.max(a, b);
        aux(A, 'earR')[0] -= 0.1 * Math.max(a, b);
        P.hry += sd * 0.12 * e;
        break;
      }
      case 'earTwitch': {
        // A quick double flick of one ear.
        const f = sin(p * Math.PI * 4);
        aux(A, sd > 0 ? 'earL' : 'earR')[0] -= 0.5 * f * f * e;
        aux(A, sd > 0 ? 'earL' : 'earR')[2] += sd * 0.15 * f * e;
        break;
      }
      case 'tailSwish': {
        const w = p * Math.PI * 2 * 1.5;
        P.try += sin(w) * 0.6 * e;
        aux(A, 'tail1')[1] += sin(w - 0.8) * 0.4 * e;
        aux(A, 'tail2')[1] += sin(w - 1.6) * 0.5 * e;
        break;
      }
      case 'headTilt':
        P.hrz += sd * 0.34 * e;
        P.hry += sd * 0.14 * e;
        P.hrx -= 0.06 * e;
        aux(A, 'earL')[1] += 0.2 * e;
        aux(A, 'earR')[1] -= 0.2 * e;
        break;
      case 'sniff': {
        // Nose up, quick little sniffs.
        P.hrx -= 0.22 * e;
        P.hrx += sin(t * 26) * 0.02 * e;
        const n = aux(A, 'nose');
        n[0] += sin(t * 30) * 0.18 * e;
        n[6] = 1 + 0.15 * Math.max(0, sin(t * 30)) * e;
        break;
      }
      case 'rubPaws': {
        // Both paws together in front of the chest, rubbing.
        const T = this.rest();
        this.reach(T, 'both', sh.y - 0.1, this.front + this.pawR + 0.02, this.pawR * 0.9 - Math.abs(sh.x), 'paw');
        blendTo(T, ['alx', 'arx', 'alz', 'arz', 'sl', 'sr']);
        const r = sin(t * 13) * 0.09 * e;
        P.alz += r;
        P.arz += r;
        P.alx += sin(t * 13 + 1.5) * 0.05 * e;
        P.arx -= sin(t * 13 + 1.5) * 0.05 * e;
        P.hrx += 0.12 * e;
        break;
      }
      case 'noseWiggle': {
        const n = aux(A, 'nose');
        n[0] += sin(t * 26) * 0.25 * e;
        n[1] += sin(t * 19) * 0.18 * e;
        n[6] = 1 + 0.12 * sin(t * 26) * e;
        P.hrx += sin(t * 13) * 0.02 * e;
        break;
      }
      case 'hop': {
        // Two little hops on the spot.
        const h = Math.max(0, sin(p * Math.PI * 4)) * e;
        P.by += 0.075 * h;
        P.llx += 0.5 * h;
        P.lrx += 0.5 * h;
        P.brx += 0.08 * h;
        aux(A, 'earL')[0] -= 0.35 * h;
        aux(A, 'earR')[0] -= 0.35 * h;
        break;
      }
      case 'stalks': {
        // Each eye stalk looks somewhere of its own, one after the other.
        const a = envelope(clamp01(p / 0.7));
        const b = envelope(clamp01((p - 0.25) / 0.7));
        const L = aux(A, 'stalkL');
        const R = aux(A, 'stalkR');
        L[0] += c.data[0] * 0.45 * a;
        L[2] += (0.25 + c.data[1] * 0.3) * a;
        R[0] += c.data[2] * 0.45 * b;
        R[2] -= (0.25 + c.data[3] * 0.3) * b;
        P.hry += c.data[0] * 0.15 * e;
        break;
      }
      case 'stretch': {
        // Stretches up and forward, the foot drawing out behind, then settles back down.
        aux(A, 'rear')[5] -= 0.045 * e;
        P.hrx -= 0.28 * e;
        P.by += 0.012 * e;
        aux(A, 'stalkL')[0] -= 0.25 * e;
        aux(A, 'stalkR')[0] -= 0.25 * e;
        aux(A, 'stalkL')[2] += 0.12 * e;
        aux(A, 'stalkR')[2] -= 0.12 * e;
        break;
      }
      case 'headSwivel':
        P.hry += sd * 1.1 * envelope(clamp01(p / 0.8));
        break;
      case 'slowBlink':
        this.shut = Math.max(this.shut, e);
        break;
      case 'chill':
        this.shut = Math.max(this.shut, 0.55 * e);
        P.hrx += 0.06 * e;
        break;
      case 'lookAround':
        P.hry += sin(p * Math.PI * 2) * 0.55 * e;
        P.hrx -= 0.05 * e;
        break;
      case 'sentinel': {
        // Up tall on its toes to keep watch: a sharp look one way, then the other, each held a moment, then back.
        const look = p < 0.25 ? 0 : p < 0.5 ? sd : p < 0.75 ? -sd : 0;
        P.by += 0.015 * e;
        P.brx -= 0.07 * e;
        P.hrx -= 0.06 * e;
        P.hry += look * 0.75 * e;
        aux(A, 'earL')[0] -= 0.15 * e;
        aux(A, 'earR')[0] -= 0.15 * e;
        break;
      }
      case 'tailCurl':
        aux(A, 'tail1')[0] -= 0.6 * e;
        aux(A, 'tail2')[0] -= 0.8 * e;
        break;
      case 'wag':
        P.try = sin(t * 16) * 0.6 * e + P.try * (1 - e);
        break;
      case 'pant':
        P.hrx += sin(t * 14) * 0.03 * e - 0.05 * e;
        P.by += sin(t * 14) * 0.004 * e;
        break;
      case 'sway':
        P.brz += sin(p * Math.PI * 2) * 0.08 * e;
        P.hrz -= sin(p * Math.PI * 2) * 0.05 * e;
        break;
      case 'scratch': {
        const T = this.rest();
        this.reach(T, 'r', sh.y - 0.18, this.front - 0.02, 0.03);
        blendTo(T, ['arx', 'arz', 'sr']);
        P.arz += sin(t * 18) * 0.1 * e;
        P.hrx += 0.15 * e;
        break;
      }
      case 'lickPaw': {
        const T = this.rest();
        this.reach(T, 'r', this.mouth.y - 0.06, this.mouth.z + 0.02, 0.04 - Math.abs(sh.x));
        blendTo(T, ['arx', 'arz', 'sr']);
        P.hrx += (0.18 + sin(t * 9) * 0.05) * e;
        P.hry -= 0.15 * e;
        break;
      }
      case 'flap':
      case 'wingStretch': {
        const k = c.name === 'flap' ? sin(t * 14) * 0.4 : 0;
        P.alz += (1.4 + k) * e;
        P.arz -= (1.4 + k) * e;
        break;
      }
      case 'throat':
        aux(A, 'throat')[6] = 1 + Math.max(0, sin(t * 9)) * 0.3 * e;
        break;
      case 'flutter':
        // The little wings on its back open and flutter (see beatWings), with a bounce and a look up.
        this.flutter = Math.max(this.flutter, e);
        P.by += Math.max(0, sin(p * Math.PI * 4)) * 0.018 * e;
        P.hrx -= 0.1 * e;
        break;
    }
  }

  private target(s: RigState): { P: Pose; A: AuxMap } {
    const P = this.rest();
    const A: AuxMap = new Map();
    const t = s.t + this.seed;
    const sin = Math.sin;
    const sh = this.shoulder;
    const prof = this.prof;
    if (s.anim !== 'idle') this.clip = null;
    // (A dance starts from its first step.)
    if (s.anim !== this.animNow) {
      this.animNow = s.anim;
      this.animStart = s.t;
    }
    this.shut = 0;
    this.flutter = 0;
    switch (s.anim) {
      case 'walk':
      case 'run':
        this.gait(P, A, s);
        break;
      case 'sit':
        this.sit(P, A, t);
        break;
      case 'sleep':
        // (Something that floats, a jellyfish or a bat, just draws in where it is.)
        if (!this.hasLegs || this.floats) {
          // Drawn in: head down, stalks pulled in.
          P.hrx = 0.35;
          for (const n of ['stalkL', 'stalkR']) {
            const a = aux(A, n);
            a[0] = 0.6;
            a[6] = 0.4;
          }
          aux(A, 'rear')[5] = 0.03;
          if (this.hold) this.carryPose(P, 0);
          break;
        }
        if (prof.bed === 'upright') {
          // Settled down at the pillow end, leaning back against it, with its tentacles spread flat over the
          // covers (on its back, with webbing between them, they'd crumple).
          P.brx = -0.45;
          P.bz = -0.28;
          P.by = -0.02;
          P.llx = P.lrx = 0.45;
          P.llz = 0.1;
          P.lrz = -0.1;
          P.alz = 0.35;
          P.arz = -0.35;
          P.hrx = 0.12;
          break;
        }
        if (prof.bed === 'side') {
          // Curled up on its left side, facing out into the room, knees drawn up and chin tucked in.
          P.brx = -Math.PI / 2;
          P.bry = Math.PI / 2;
          P.bz = 0.45;
          P.llx = P.lrx = 0.9;
          P.alx = P.arx = -0.55;
          P.alz = 0.15;
          P.arz = -0.15;
          P.hrx = 0.22;
          P.trx = 0.9;
          aux(A, 'earL')[0] = aux(A, 'earR')[0] = 0.3;
          break;
        }
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
        aux(A, 'earL')[0] = aux(A, 'earR')[0] = 0.3;
        break;
      case 'wave':
        // Up beside the head, clear of it, waving side to side.
        this.raise(P, 'r', this.headC.y + 0.02, 0.02 + sin(t * 9) * 0.05);
        this.freePaw(P);
        P.hrz = 0.1;
        P.brz = 0.04;
        P.try = sin(t * 6) * 0.4;
        if (prof.gait === 'hop') P.by = Math.max(0, sin(t * 4.5)) * 0.03;
        break;
      case 'hand':
        // A paw straight up beside the head, for a vote.
        this.raise(P, 'r', this.headC.y + this.headR.y + 0.12, -0.02);
        this.freePaw(P);
        P.by = Math.abs(sin(t * 2.5)) * 0.012;
        P.hrz = 0.06;
        break;
      case 'cheer': {
        const k = sin(t * 10) * 0.04;
        this.raise(P, 'both', this.headC.y + this.headR.y + 0.08 + k, 0.03);
        P.by = Math.abs(sin(t * 5)) * (prof.gait === 'hop' ? 0.14 : 0.1);
        P.hrx = -0.18;
        P.try = sin(t * 10) * 0.5;
        aux(A, 'earL')[0] = aux(A, 'earR')[0] = -0.25;
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
        aux(A, 'earL')[2] = b * 0.25;
        aux(A, 'earR')[2] = b * 0.25;
        aux(A, 'rear')[3] = b * 0.04;
        aux(A, 'stalkL')[2] = 0.2 + b * 0.25;
        aux(A, 'stalkR')[2] = -0.2 + b * 0.25;
        break;
      }
      case 'twerk':
      case 'griddy':
      case 'floss':
      case 'robot':
      case 'moonwalk':
      case 'horse':
      case 'macarena':
        this.dance(P, A, s.anim, s.t - this.animStart);
        break;
      case 'laugh':
        P.hrx = -0.32 + sin(t * 16) * 0.06;
        P.brz = sin(t * 18) * 0.035;
        P.by = Math.abs(sin(t * 9)) * 0.025;
        // Paws on the belly.
        this.reach(P, 'both', sh.y - 0.2, this.front + this.pawR, 0, 'paw');
        P.try = sin(t * 9) * 0.3;
        break;
      case 'cry':
        P.hrx = 0.34 + sin(t * 12) * 0.03;
        {
          // Paws up over the eyes (where they are with the head bowed); a paw holding something keeps it.
          const e = this.headNow(this.eyePos, 0.34 + prof.head - prof.lean);
          this.reach(P, this.hold ? 'l' : 'both', e.y - 0.02, e.z + this.pawR + 0.025, e.x - Math.abs(sh.x), 'paw');
          if (this.hold) {
            const left = [P.alx, P.alz, P.sl, P.el] as const;
            this.carryPose(P, 0);
            if (!this.hold.both) [P.alx, P.alz, P.sl, P.el] = left;
          }
        }
        P.brz = sin(t * 14) * 0.025;
        P.by = -0.01;
        aux(A, 'earL')[0] = aux(A, 'earR')[0] = 0.35;
        aux(A, 'stalkL')[0] = aux(A, 'stalkR')[0] = 0.45;
        break;
      case 'work': {
        const k = sin(t * 7) * 0.05;
        // Short forepaws (the bunny's) scrub up in front of the chest, where they can reach clear of it.
        const low = sh.y - this.grip.length() * (this.grip.length() < 0.22 ? 0.5 : 0.8);
        // Low enough that the load stays under the chin (a shark's head comes down low and forward).
        const wy = Math.min(Math.max(low, sh.y - 0.26), this.headC.y - this.headR.y - 0.16) + k;
        // Out past the end of the nose too, so a long snout bobbing over the load doesn't dip into it.
        const wz = Math.max(this.front + 0.14 + (this.hold?.hang ?? 0), this.front + this.pawR + (this.grip.z - this.paw.z), this.mouth.z + 0.04);
        this.reach(P, 'both', wy, wz, -0.03);
        P.alx += k * 2;
        P.arx -= k * 2;
        // (Short arms hold the load up close: the head stays up, clear of it.)
        P.hrx = this.grip.length() < 0.22 ? 0.06 : 0.25;
        P.brx = 0.08;
        P.by = Math.abs(sin(t * 7)) * 0.012;
        if (this.hold?.both) P.carry = 1;
        break;
      }
      case 'fish': {
        const twitch = sin(t * 0.9) > 0.9 ? sin(t * 40) * 0.08 : 0;
        // Both paws forward round the rod (or the book).
        const both = Boolean(this.hold?.both);
        this.reach(P, 'both', sh.y + (both ? -0.08 : -0.16), this.front + (both ? 0.14 : 0.1), both ? -0.02 : 0.02);
        P.alx += twitch;
        P.arx += twitch;
        P.hrx = 0.12;
        P.hry = both ? 0 : sin(t * 0.3) * 0.1;
        if (both) P.carry = 1;
        break;
      }
      case 'water':
        this.reach(P, 'r', sh.y - 0.16, this.front + 0.1, 0.05);
        P.alz = 0.2;
        P.hrx = 0.28;
        P.tilt = 0.75 + sin(t * 3) * 0.1;
        this.freePaw(P);
        break;
      case 'drink': {
        const cyc = t % 3.2;
        const sip = cyc < 1.4 ? sin((cyc / 1.4) * Math.PI) : 0;
        // From the carrying spot up to the mouth (a mug's rim is about 0.14 above the grip and 0.07 in front).
        const h = this.hold ?? MUG;
        const { y: y0, z: z0 } = this.holdSpot(h);
        // Put the paw where the item's rim (or the bite) meets the mouth once it's tipped towards the face.
        const [cy, cz, tip] = h.sip ?? MUG.sip!;
        const th = -tip;
        const m = this.headNow(this.mouth, (tip ? -0.15 : 0.12) + prof.head - prof.lean);
        const y1 = m.y - (cy * Math.cos(th) - cz * Math.sin(th));
        // A flat face (a frog's, an owl's) can't have the paw tucked under its chin: the cup is held just in
        // front of the face instead.
        // Clear of the face where the cup's rim comes up to (tipped back towards it), as well as at the paw.
        const clear = (y: number) => Math.max(this.faceFront(y) + this.pawR + 0.03, this.faceFront(y + cy * Math.cos(th)) + Math.max(0, cy * Math.sin(tip)) + 0.07);
        let z1 = Math.max(m.z + 0.015 - (cy * Math.sin(th) + cz * Math.cos(th)), clear(y1));
        let ty = y1;
        // Short arms (a frog's, a shark's fins) can't bring it right up to the mouth: it's lifted as far as
        // they reach towards it, out in front of the face.
        // Short arms (a frog's, a shark's fins) can't bring it up to the mouth at all: it's lifted a little in
        // front of the chest and tipped a touch, and the head bends to it.
        const short = this.sipLow || Math.hypot(0.03 - Math.abs(sh.x), ty - sh.y, z1 - sh.z) > this.reachLength() * 1.05;
        if (short) {
          ty = y0 + 0.04;
          z1 = z0 + 0.02;
        }
        this.reach(P, 'r', y0 + (ty - y0) * sip, z0 + (z1 - z0) * sip, h.out * (1 - sip) + (short ? h.out : 0.03 - Math.abs(sh.x)) * sip);
        P.hrx = short ? sip * 0.2 : tip ? -sip * 0.15 : sip * 0.12;
        P.tilt = th * sip * (short ? 0.35 : 1);
        P.try = sin(t * 2) * 0.2;
        this.freePaw(P);
        break;
      }
      default: {
        // Idle: breathing, a lazy tail, the paws carried the species' way, and now and then a mannerism.
        const slow = this.sleepy ? 0.45 : 1;
        P.hry = sin(t * 0.37 * slow) * 0.12 * (sin(t * 0.13) > 0 ? 1 : 0.3);
        P.hrz = sin(t * 0.29 * slow) * 0.04;
        P.try = sin(t * 1.6 * slow) * prof.tailSway;
        aux(A, 'tail1')[1] = sin(t * 1.6 * slow - 0.7) * prof.tailSway * 0.6;
        aux(A, 'tail2')[1] = sin(t * 1.6 * slow - 1.4) * prof.tailSway * 0.8;
        P.by = sin(t * 2.2 * slow) * 0.005;
        if (prof.paws) {
          // Paws held up in front of the chest, this far below the shoulders.
          this.reach(P, 'both', sh.y - prof.paws + sin(t * 2.2) * 0.005, this.front + this.pawR + 0.01, -0.035, 'paw');
        } else {
          P.alx = P.arx = -this.armFwd;
          P.alz = this.armOut + sin(t * 2.2 * slow) * 0.02;
          P.arz = -this.armOut - sin(t * 2.2 * slow) * 0.02;
        }
        if (prof.gait === 'slither') {
          aux(A, 'rear')[5] = sin(t * 0.9) * 0.006;
          aux(A, 'stalkL')[2] = 0.08 + sin(t * 0.7) * 0.05;
          aux(A, 'stalkR')[2] = -0.08 + sin(t * 0.8 + 1) * 0.05;
        }
        if (this.sleepy) {
          P.hrx = 0.2 + sin(t * 0.6) * 0.04;
          P.alz = 0.25;
          P.arz = -0.25;
        }
        this.mannerism(P, A, t);
        if (this.hold) {
          const left = [P.alx, P.alz, P.sl, P.el] as const;
          this.carryPose(P, sin(t * 2.2 * slow) * 0.02);
          if (!this.hold.both) [P.alx, P.alz, P.sl, P.el] = left;
        }
      }
    }
    // Holding something through a gesture: the other paw does the waving and the holding paw keeps hold
    // (a snail's single tendril just keeps hold).
    if (this.hold && (s.anim === 'wave' || s.anim === 'hand' || s.anim === 'cheer' || s.anim === 'cry' || s.anim === 'laugh' || isDance(s.anim))) {
      if ((s.anim === 'wave' || s.anim === 'hand') && !this.tendril) {
        P.alx = P.arx;
        P.alz = -P.arz;
        P.sl = P.sr;
      }
      this.carryPose(P, 0, true);
    }
    // The species' posture on top: a hunch or an upright carriage, with the face kept level.
    if (s.anim !== 'sleep') {
      const lean = prof.lean * (s.anim === 'sit' ? 0.5 : 1);
      P.brx += lean;
      P.hrx += prof.head - lean;
      P.hrz += prof.tilt;
    }
    if (s.speaking) {
      P.hrx += sin(t * 13) * 0.04;
      P.hrz += sin(t * 7) * 0.025;
    }
    // Long feelers (the prawn's) drift as it goes about, and on its back lie along the covers rather than reaching
    // down through the bed.
    if (this.bones.has('feelerL')) {
      const lie = s.anim === 'sleep' && prof.bed !== 'upright' && this.hasLegs && !this.floats ? -1 : 0;
      for (const [n, side] of [
        ['feelerL', 1],
        ['feelerR', -1],
      ] as const) {
        const a = aux(A, n);
        a[0] += lie + sin(t * 0.9 + side) * 0.05;
        a[2] += side * sin(t * 1.3 + side * 0.7) * 0.04;
      }
    }
    if (this.tentacles && s.anim === 'sleep') {
      if (prof.bed !== 'upright') {
        // On its back the tentacles would stand straight up out of the covers: turned back down to lie flat.
        P.llx = P.lrx = Math.PI / 2 - 0.12;
        P.llz = 0.12;
        P.lrz = -0.12;
      }
      // Drifting a little as it breathes.
      P.llz += sin(t * 0.9) * 0.04;
      P.lrz -= sin(t * 0.9 + 1) * 0.04;
    } else if (this.tentacles) {
      if (s.anim === 'idle') {
        // A slow sway from side to side over the tentacles, the head keeping a little steadier.
        P.brz += sin(t * 1.3) * 0.05;
        P.hrz -= sin(t * 1.3) * 0.03;
      }
      P.llz += sin(t * 3) * 0.14;
      P.lrz -= sin(t * 3 + 1) * 0.14;
      P.llx *= 0.4;
      P.lrx *= 0.4;
    }
    if (this.flaps && this.folded(s)) {
      // Wings folded down and round the back like a cloak (the right one still holding whatever is in it),
      // breathing a little.
      const b = sin(t * 1.6) * 0.03;
      if (!this.hold?.both) {
        P.alz = FOLD.z + b;
        P.alx = FOLD.x;
        P.aly = -FOLD.y;
        P.el = FOLD.el;
        P.wl = FOLD.w;
        P.sl = 1;
      }
      if (!this.hold) {
        P.arz = -FOLD.z - b;
        P.arx = FOLD.x;
        P.ary = FOLD.y;
        P.er = FOLD.el;
        P.wr = FOLD.w;
        P.sr = 1;
      }
    }
    if (this.flaps) {
      // A wing bent at the elbow (holding something, gesturing) gathers its membrane in, as a bat's does, so
      // it doesn't bunch up against the body.
      P.wl = Math.min(P.wl, Math.max(FOLD.w, 1 - P.el * 0.8));
      P.wr = Math.min(P.wr, Math.max(FOLD.w, 1 - P.er * 0.8));
    }
    if (this.flaps && (s.anim === 'walk' || s.anim === 'run')) {
      // Flying: the wings beat, quicker the faster it goes, and the right wing keeps still enough to hold
      // whatever is in it.
      const rate = s.anim === 'run' ? 16 : 12;
      const amp = 0.45;
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
    if (this.wings) {
      // A bee's wings buzz the whole time it's up in the air; a dragon's stay folded until it cheers or dances,
      // or flutters them now and then.
      this.wings.want = this.wings.mode === 'buzz' ? (s.anim === 'sleep' ? 0 : 1) : s.anim === 'cheer' || isDance(s.anim) ? 1 : this.flutter;
    }
    return { P, A };
  }

  private applyPose(k: number, target?: { P: Pose; A: AuxMap }) {
    const P = this.pose;
    if (target) {
      // Turning about the upright goes the short way round, so a dance's spin carries on rather than unwinding.
      const bry = P.bry + wrapAngle(target.P.bry - P.bry) * k;
      for (const key of POSE_KEYS) P[key] += (target.P[key] - P[key]) * k;
      P.bry = wrapAngle(bry);
      for (const name of this.extra) {
        const now = this.auxNow.get(name) ?? restAux();
        const want = target.A.get(name) ?? restAux();
        for (let i = 0; i < 7; i++) now[i] += (want[i] - now[i]) * k;
        this.auxNow.set(name, now);
      }
    }
    this.body.position.set(P.bx, P.by, P.bz);
    this.body.rotation.set(P.brx, P.bry, P.brz);
    this.neck.rotation.set(P.hrx, P.hry, P.hrz);
    this.armL.rotation.set(P.alx, P.aly, P.alz);
    this.armR.rotation.set(P.arx, P.ary, P.arz);
    this.armL.scale.set(P.wl, P.sl, 1);
    this.armR.scale.set(P.wr, P.sr, 1);
    this.foreL?.rotation.set(-P.el, 0, 0);
    this.foreR?.rotation.set(-P.er, 0, 0);
    this.legL.rotation.set(P.llx, 0, P.llz);
    this.legR.rotation.set(P.lrx, 0, P.lrz);
    // Ghosts float on a wisp instead of legs: the legs fold away into the hips.
    const legs = this.ghost ? 0.001 : 1;
    this.legL.scale.setScalar(legs);
    this.legR.scale.setScalar(legs);
    this.tail.rotation.set(P.trx, P.try, 0);
    for (const name of this.extra) {
      const a = this.auxNow.get(name) ?? restAux();
      const b = this.bones.get(name)!;
      const rest = this.sk.local.get(name)!;
      b.rotation.set(a[0], a[1], a[2]);
      b.position.set(rest.x + a[3], rest.y + a[4], rest.z + a[5]);
      b.scale.setScalar(a[6]);
    }
    // Ears, antennae and anything else standing up off the top of the head (the robot's antenna, the homunculus's
    // sprout) fold away under a hat that covers them.
    if (this.hat?.holder.visible) for (const name of this.hat.fold) this.bones.get(name)?.scale.setScalar(0.001);
    // A tendril only comes out when there's something to hold or a gesture to make.
    const grow = this.tendril ? Math.max(0.001, this.grow) : 1;
    if (this.tendril) this.armR.scale.multiplyScalar(grow);
    // The hand sits on the grip, square to the body and unstretched whatever the arm is doing (so mugs
    // don't spill), then the item is tipped on purpose.
    this.armR.updateMatrix();
    // With an elbow, the hand hangs off the forearm: the grip in its space, and the arm's and forearm's turns
    // together to undo.
    const chain = this.m6.copy(this.armR.matrix);
    let local = this.grip;
    if (this.foreR) {
      this.foreR.updateMatrix();
      chain.multiply(this.foreR.matrix);
      local = this.v2.copy(this.grip).add(this.v3.set(0, this.elbow, 0));
    }
    const grip = this.v.copy(local).applyMatrix4(chain);
    this.hand.matrix
      .copy(chain)
      .invert()
      .multiply(this.m4.makeTranslation(grip.x, grip.y, grip.z))
      .multiply(this.m5.makeScale(grow, grow, grow));
    this.hand.matrixWorldNeedsUpdate = true;
    this.handTilt.rotation.set(P.tilt, 0, 0);
    // A load held in both paws slides across to sit in front of the middle of the body.
    if (this.item) this.item.position.x = -grip.x * P.carry;
  }

  update(s: RigState) {
    const dt = Math.min(Math.max(s.dt, 0), 0.1);
    if (s.anim === 'walk' || s.anim === 'run') {
      const sp = THREE.MathUtils.clamp(s.speed || (s.anim === 'run' ? 4 : 2), 0.8, 7);
      this.phase += dt * (5 + sp * 1.6) * this.prof.cadence;
    }
    if (this.tendril) {
      const out = Boolean(this.item) || !(s.anim === 'idle' || s.anim === 'walk' || s.anim === 'run' || s.anim === 'sit' || s.anim === 'sleep');
      this.grow += ((out ? 1 : 0) - this.grow) * (1 - Math.exp(-dt * 8));
    }
    const target = this.target(s);
    if (s.anim === 'sleep') target.P.by += this.bedLift;
    this.applyPose(1 - Math.exp(-dt * 14), target);

    // Floating: ghosts and the Storyteller hover with a gentle bob.
    // (A bat only stays up while it's flying: with its wings folded it stands.)
    const floating = (this.floats && !(this.flaps && this.folded(s))) || this.ghost;
    // (Asleep, just a gentle rise and fall that never dips into the covers.)
    const h = s.anim === 'sleep' ? 0.012 : this.floats ? this.hover : 0.35;
    const fy = (floating ? h + Math.sin(s.t * 2 + this.seed) * (s.anim === 'sleep' ? 0.012 : 0.06) : 0) + this.footLift;
    this.float.position.y += (fy - this.float.position.y) * (1 - Math.exp(-dt * 6));
    if (floating) this.wisp.rotation.z = Math.sin(s.t * 3 + this.seed) * 0.15;
    this.keepClearOfGround(s.anim === 'sleep' ? COVERS + CLEAR_FLOOR : CLEAR_FLOOR);

    // Blinking (and eyes half shut for some mannerisms).
    this.blinkAt -= dt;
    if (this.blinkAt <= 0 && this.blinkT < 0) this.blinkT = 0;
    let open = 1;
    if (this.blinkT >= 0) {
      this.blinkT += dt;
      const b = this.blinkT / 0.14;
      open = b < 1 ? Math.max(0.12, Math.abs(1 - b * 2)) : 1;
      if (b >= 1) {
        this.blinkT = -1;
        this.blinkAt = 2 + Math.random() * 4;
      }
    }
    open = Math.min(open, 1 - 0.88 * this.shut);
    if (s.anim === 'sleep') open = 0.12;
    else if (s.anim === 'laugh') open = 0.35;
    else if (this.sleepy && s.anim === 'idle') open = Math.min(open, 0.5);
    for (const b of this.blinkers) b.scale.y = open * b.scale.x;

    if (this.wings) this.beatWings(dt);
    if (this.turrets.length) this.swivel(s, dt);
    if (this.shift) {
      // Away from its own colour round the colour wheel one way and back, then the other way, slowly, the shimmer
      // along it growing the further it has gone. (Time is wrapped where both shimmers come round again.)
      const away = Math.sin((s.t / 32) * Math.PI * 2);
      this.shift.hue.value = 1.6 * away;
      this.shift.wave.value = 0.1 + 0.25 * Math.abs(away);
      this.shift.time.value = s.t % (4 * Math.PI);
      this.shift.tint.value = Math.abs(away);
    }
    this.hat?.built.update?.(s.t + this.seed);
    // Hats come off for bed.
    if (this.hat) this.hat.holder.visible = s.anim !== 'sleep';
  }

  /**
   * Little wings on the back: swept back along it when shut, held out when open, and beating as they go (a bee's
   * too fast to follow, a dragon's in a flutter). Set straight on the bones, as a buzz is too quick to blend.
   */
  private beatWings(dt: number) {
    const w = this.wings!;
    const m = WING_MOTION[w.mode];
    w.open += (w.want - w.open) * (1 - Math.exp(-dt * m.ease));
    w.phase = (w.phase + dt * m.rate) % (Math.PI * 2);
    const flap = Math.sin(w.phase) * w.open * m.beat;
    const y = m.shut[0] + (m.open[0] - m.shut[0]) * w.open;
    const z = m.shut[1] + (m.open[1] - m.shut[1]) * w.open;
    for (const [b, side] of w.bones) b.rotation.set(0, side * y, side * (z + flap));
  }

  /**
   * Turret eyes: each darts to look somewhere of its own every so often, and now and then both look straight ahead
   * together. Asleep, they settle.
   */
  private swivel(s: RigState, dt: number) {
    const now = s.t;
    for (const e of this.turrets) {
      if (s.anim === 'sleep') {
        e.toYaw = 0.2;
        e.toPitch = 0;
      } else if (now >= e.next || e.next - now > 6) {
        if (Math.random() < 0.25) {
          for (const f of this.turrets) {
            f.toYaw = 0.55;
            f.toPitch = -0.05;
            f.next = now + 1.2 + Math.random() * 1.5;
          }
        } else {
          e.toYaw = -0.45 + Math.random() * 1.05;
          e.toPitch = -0.3 + Math.random() * 0.55;
          e.next = now + 0.5 + Math.random() * 2.2;
        }
      }
      const k = 1 - Math.exp(-dt * 16);
      e.yaw += (e.toYaw - e.yaw) * k;
      e.pitch += (e.toPitch - e.pitch) * k;
      // (Turned about the upright to look forward or back, and about the front-to-back axis to look up or down.)
      e.bone.rotation.set(0, -e.side * e.yaw, e.side * e.pitch);
    }
  }

  /** The chains kept clear of the ground on their own: the tail, and the legs of an animal that walks on tentacles. */
  private freeChains(): string[] {
    return ['tail', ...(this.prof.gait === 'scuttle' ? ['legL', 'legR'] : [])];
  }

  /** The bones in a chain: this one and everything hanging off it. */
  private chainOf(name: string): string[] {
    const out = [name];
    for (const n of this.sk.names) {
      for (let p = this.sk.parent.get(n); p; p = this.sk.parent.get(p)) {
        if (p === name) {
          out.push(n);
          break;
        }
      }
    }
    return out;
  }

  /**
   * Sample points on the tail (and, for animals that walk on tentacles, the legs): an even spread of up to
   * 120 of each bone's vertices (a pose can turn any part of it downward), kept in that bone's own space.
   */
  private findLowPoints() {
    const pos = this.highGeo.getAttribute('position') as THREE.BufferAttribute;
    const idx = this.highGeo.getAttribute('skinIndex') as THREE.BufferAttribute;
    const wgt = this.highGeo.getAttribute('skinWeight') as THREE.BufferAttribute;
    const bones = this.mesh.skeleton.bones;
    const inverses = this.mesh.skeleton.boneInverses;
    const roots = this.freeChains();
    const groups: NonNullable<AnimalRig['lowPoints']> = [];
    for (const rootName of roots) {
      const pivot = this.bones.get(rootName);
      if (!pivot) continue;
      const points: { bone: THREE.Bone; local: THREE.Vector3 }[] = [];
      for (const name of this.chainOf(rootName)) {
        const bi = this.sk.names.indexOf(name);
        const mine: number[] = [];
        for (let i = 0; i < pos.count; i++) {
          // Mostly carried by this bone.
          let top = 0;
          for (let k = 1; k < 4; k++) if (wgt.getComponent(i, k) > wgt.getComponent(i, top)) top = k;
          if (idx.getComponent(i, top) === bi && wgt.getComponent(i, top) >= 0.5) mine.push(i);
        }
        if (!mine.length) continue;
        const step = Math.max(1, Math.ceil(mine.length / 120));
        for (let k = 0; k < mine.length; k += step) {
          points.push({ bone: bones[bi], local: new THREE.Vector3().fromBufferAttribute(pos, mine[k]).applyMatrix4(inverses[bi]) });
        }
      }
      if (points.length) groups.push({ pivot, points });
    }
    return groups;
  }

  /**
   * Tails (and tentacles) never go through the ground: whatever the pose, if a point near the end would dip
   * below it, the chain's root bone turns just enough to lift it clear. Worked out fresh each frame from the
   * pose, so nothing builds up.
   */
  private keepClearOfGround(floor: number) {
    const groups = (this.lowPoints ??= this.findLowPoints());
    if (!groups.length) return;
    this.root.updateMatrixWorld(true);
    kcToRoot.copy(this.root.matrixWorld).invert();
    for (const g of groups) {
      for (let iter = 0; iter < 4; iter++) {
        let lowY = Infinity;
        for (const p of g.points) {
          kcV.copy(p.local).applyMatrix4(p.bone.matrixWorld).applyMatrix4(kcToRoot);
          if (kcV.y < lowY) {
            lowY = kcV.y;
            kcLow.copy(kcV);
          }
        }
        if (lowY >= floor) break;
        kcPivot.setFromMatrixPosition(g.pivot.matrixWorld).applyMatrix4(kcToRoot);
        const dir = kcLow.sub(kcPivot);
        const reach = Math.max(0.06, dir.length());
        kcAxis.crossVectors(dir, kcUp);
        if (kcAxis.lengthSq() < 1e-8) break;
        kcAxis.normalize();
        // The axis, from the animal's space into the pivot's parent's, then turn the pivot about it.
        this.root.getWorldQuaternion(kcQr);
        g.pivot.parent!.getWorldQuaternion(kcQp);
        kcQr.invert().multiply(kcQp).invert();
        kcAxis.applyQuaternion(kcQr);
        g.pivot.quaternion.premultiply(kcQ.setFromAxisAngle(kcAxis, (floor - lowY + 0.004) / reach));
        g.pivot.updateMatrixWorld(true);
      }
    }
  }

  dispose() {
    this.setItem(null);
    this.setHat(null);
    // Back to this rig's own geometry first: the distant version is shared and stays cached.
    this.setDetail('high');
    this.highGeo.dispose();
    this.mesh.skeleton.dispose();
    this.wisp.geometry.dispose();
    this.root.traverse((o) => {
      if (o !== this.mesh && o !== this.wisp && (o as THREE.Mesh).isMesh) (o as THREE.Mesh).geometry.dispose();
    });
    for (const m of this.owned) m.dispose();
    this.root.removeFromParent();
  }
}

export function buildAnimal(look: Look): Rig {
  const info = animalInfo(look.animal);
  const coat = /^#[0-9a-f]{6}$/i.test(look.color) ? look.color : info.colors[0];
  const k = newKit(info.id);
  const res = RECIPES[info.id](k, colorsFor(coat, info.id), coat);
  details(k, DETAILS[info.id] ?? {});
  finishSculpt(k, info.id, coat);
  const aquatic = res.aquatic ?? info.aquatic;
  const material = aquatic ? wet() : soft();
  const rig = new AnimalRig({
    kit: k,
    profile: profileOf(info.id),
    material,
    shift: res.shifts ? shifting(material) : undefined,
    wings: res.wings,
    swivel: res.swivel,
    eyeMaterial: eyeMaterial(),
    ghostColor: mix(coat, '#e6f0ff', 0.75),
    floats: Boolean(res.hover),
    hover: res.hover,
    flaps: res.flaps,
    tentacles: res.legs === 'tentacles',
    sleepy: res.sleepy,
    tendril: res.tendril,
    hatFit: hatFit(info.id, k),
    lowKey: `${info.id}:${coat}`,
    lowKit: () => {
      const lk = newKit(info.id);
      RECIPES[info.id](lk, colorsFor(coat, info.id), coat);
      finishSculpt(lk, info.id, coat);
      return lk;
    },
  });
  if (look.hat) rig.setHat(look.hat);
  return rig;
}

/**
 * Where a hat goes on each animal: worked out from the skull and what stands off it (see fitHat), so most heads need
 * nothing here. Some heads aren't where the skull is (a mushroom's is its cap) or want a hat moved, resized or tipped,
 * or a particular hat put somewhere else: `skull` replaces the ellipsoid hats fit, `brow` is how high a snug hat's
 * rim comes at the front (instead of just above the eyes), `bumps` says what stands out of the skull is just more
 * head ('head') or nothing a hat need keep clear of ('none'), rather than horns and antlers, and the rest moves it.
 */
type HatTweak = HatNudge & { skull?: { c: Vec3; r: Vec3 }; brow?: number; bumps?: 'head' | 'none'; hats?: Partial<Record<HatId, HatNudge>> };
const HAT_NUDGE: Partial<Record<AnimalId, HatTweak>> = {
  // The mushroom's head is its cap, and the squid's is the point of its mantle, above the fins.
  fungi: { skull: { c: [0, 0.28, -0.04], r: [0.34, 0.21, 0.32] }, brow: 0.45 },
  squid: { skull: { c: [0, 0.52, -0.055], r: [0.11, 0.16, 0.1] }, brow: 0.6 },
  // A boxy head, whose corners stand out of the skull but are as much head as the rest; and spines a hat can sit
  // among.
  robot: { bumps: 'head' },
  hedgehog: { bumps: 'none' },
  // Eyes on stalks at the front of the head: hats go behind them.
  snail: { dz: -0.04 },
  crab: { dz: -0.04 },
};

/** Where hats go on one animal: its head as hats see it (all but what stands off it, which the rig finds), and any nudges. */
type HatPlace = { id: AnimalId; head: Omit<HatHead, 'bits'>; nudge: HatTweak; neckAt: Vec3 };

/** Fits worked out so far, by animal and hat. */
const fitted = new Map<string, HatFit>();

function hatFit(id: AnimalId, k: Kit): HatPlace {
  const s = k.shape;
  const n = HAT_NUDGE[id] ?? {};
  const c = n.skull?.c ?? s.hc;
  const r = n.skull?.r ?? s.hr;
  const head = { c, r, size: THREE.MathUtils.clamp(r[0] / 0.25, 0.45, 1.2), eye: { at: [k.eyeX, k.eyeY, k.eyeZ] as Vec3, r: k.eyeR }, brow: n.brow };
  return { id, head, nudge: n, neckAt: k.joints.neck };
}

/** Points split into clumps, each point within `gap` of another in its clump. */
function clumps(pts: THREE.Vector3[], gap: number): THREE.Vector3[][] {
  const cell = (p: THREE.Vector3) => `${Math.floor(p.x / gap)},${Math.floor(p.y / gap)},${Math.floor(p.z / gap)}`;
  const at = new Map<string, number[]>();
  pts.forEach((p, i) => (at.get(cell(p)) ?? at.set(cell(p), []).get(cell(p))!).push(i));
  const seen = new Uint8Array(pts.length);
  const out: THREE.Vector3[][] = [];
  for (let i = 0; i < pts.length; i++) {
    if (seen[i]) continue;
    const clump: THREE.Vector3[] = [];
    const todo = [i];
    seen[i] = 1;
    while (todo.length) {
      const p = pts[todo.pop()!];
      clump.push(p);
      const [x, y, z] = cell(p).split(',').map(Number);
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) for (const j of at.get(`${x + dx},${y + dy},${z + dz}`) ?? []) if (!seen[j] && pts[j].distanceTo(p) < gap) {
        seen[j] = 1;
        todo.push(j);
      }
    }
    out.push(clump);
  }
  return out;
}

/** Which bones a hat has to fold away (ears, antennae, antlers, crests), keep clear of (eyes), or fit round (stalks, horns); the rest it ignores. */
function hatBitOf(bone: string): HatBit['is'] | null {
  if (/^ear|^crest|^antler/.test(bone)) return 'fold';
  if (/^eyes$|^blink/.test(bone)) return 'eye';
  if (/^stalk|^turret|^neck$/.test(bone)) return 'solid';
  return null;
}

// ---------------------------------------------------------------- the Storyteller

const ROBE = '#3b2a5a';
const TRIM = '#e8c26a';
const HOLLOW = '#0d0a14';

export function buildStoryteller(): Rig {
  const k = newKit('storyteller');
  k.joints.neck = [0, 0.6, 0];
  k.joints.shoulder = [0.19, 0.6, 0.02];
  k.shape.tc = [0, 0.4, 0];
  k.shape.tr = [0.28, 0.38, 0.26];
  k.shape.hc = [0, 0.27, 0];
  k.shape.hr = [0.25, 0.27, 0.25];
  const sc = sculptOf(k);
  const n = k.joints.neck;
  // A tall robe narrowing from a flared hem to the shoulders.
  sc.add(rod('body', [0, 0.06, 0], [0, 0.6, 0], 0.29, 0.16, { name: 'robe' }));
  sc.add(ellipsoid('body', [0, 0.07, 0], [0.31, 0.045, 0.29], { k: 0.05, name: 'hem' }));
  // Cut off flat underneath (it hovers, and an empty robe has no bottom).
  sc.add(ellipsoid('body', [0, -0.5, 0], [0.9, 0.54, 0.9], { k: 0.02, carve: true }));
  sc.add(ellipsoid('body', [0, 0.6, 0], [0.22, 0.09, 0.18], { k: 0.08, name: 'shoulders' }));
  // The hood: a deep cowl drooping to a point behind, its front hollowed out into shadow.
  sc.add(ellipsoid('neck', [0, n[1] + 0.27, 0], [0.25, 0.27, 0.25], { k: 0.06, anchor: n, reach: 0.18, name: 'hood' }));
  sc.add(rod('neck', [0, n[1] + 0.42, -0.1], [0, n[1] + 0.5, -0.32], 0.12, 0.026, { k: 0.06, name: 'hoodTip' }));
  const hollow = ellipsoid('neck', [0, n[1] + 0.28, 0.21], [0.17, 0.19, 0.15], { k: 0.03, carve: true, name: 'hollow' });
  sc.add(hollow);
  // Wide sleeves flaring to the cuffs, with pale hands.
  armForms(k, { len: 0.25, r0: 0.06, r1: 0.085, paw: [0.05, 0.05, 0.05], fwd: 0.2, out: 0.2, pawOut: 0.075 });
  useSurface(k);
  // Two glowing eyes at the back of the hollow.
  k.eyeY = 0.28;
  k.eyeX = 0.075;
  k.eyeR = 0.035;
  k.eyeZ = 0.09;
  for (const side of [-1, 1]) {
    solid(k.eyes, k.rnd, { base: 'ico0', r: [0.036, 0.02, 0.012], pos: [side * 0.075, 0.28, 0.09], rot: [0, side * 0.3, -side * 0.25], jitter: 0.03, color: '#ffe08a', tone: 0 });
  }
  const inHollow = (q: Probe) => hollow.d(q.p.x, q.p.y, q.p.z);
  k.marks = {
    base: ROBE,
    marks: [
      { color: HOLLOW, f: (q) => inHollow(q) - 0.012 },
      // Gold round the opening of the hood, round the hem, down the front and at the cuffs.
      { color: TRIM, f: (q) => inHollow(q) - 0.045 },
      { color: '#d8d0f0', f: region(k, 'armLPaw', 'armRPaw') },
      { color: TRIM, f: any(sock(k, 'L', 0.8), sock(k, 'R', 0.8)) },
      // Under the hem there's only darkness, as if the robe were empty.
      { color: HOLLOW, f: all(region(k, 'robe', 'hem', 'shoulders'), (q) => q.p.y - 0.035) },
      { color: TRIM, f: all(region(k, 'robe', 'hem', 'shoulders'), (q) => q.p.y - 0.11) },
      { color: TRIM, f: all(region(k, 'robe', 'hem', 'shoulders'), (q) => Math.abs(q.p.x) - 0.028, (q) => 0.05 - q.p.z) },
    ],
  };
  finishSculpt(k, 'storyteller', ROBE);
  k.seat = 0;
  const lanternGlow = glow('#ffcf6a', 1.6);
  const eyeGlow = new THREE.MeshBasicMaterial({ color: '#ffe08a' });
  return new AnimalRig({
    kit: k,
    profile: { ...profileOf('raccoon'), lean: 0, head: 0, paws: 0, idles: ['lookAround', 'headTilt'], sit: 'settle', gait: 'trot', tailSway: 0 },
    material: soft(),
    eyeMaterial: eyeGlow,
    ghostColor: col('#cbbcf0'),
    floats: true,
    tentacles: false,
    noLegs: true,
    extras: (_body, _hand, armL) => {
      // The lantern hangs from the left sleeve, so the right paw is free for anything else.
      const lantern = new THREE.Group();
      const lf = new Fold();
      const lr = seeded(seedOf('lantern'));
      const iron = '#4d3a2a';
      solid(lf, lr, { base: 'limb', r: [0.07, 0.03, 0.07], pos: [0, 0.12, 0], jitter: 0.02, color: iron });
      solid(lf, lr, { base: 'cone5', r: [0.075, 0.07, 0.075], pos: [0, 0.17, 0], jitter: 0.03, color: iron });
      solid(lf, lr, { base: 'ico0', r: 0.02, pos: [0, 0.22, 0], jitter: 0.02, color: iron });
      solid(lf, lr, { base: 'limb', r: [0.075, 0.025, 0.075], pos: [0, -0.05, 0], jitter: 0.02, color: iron });
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        solid(lf, lr, { base: 'box', r: [0.012, 0.16, 0.012], pos: [Math.cos(a) * 0.06, 0.035, Math.sin(a) * 0.06], jitter: 0, color: iron });
      }
      const frame = new THREE.Mesh(lf.geometry(), soft());
      frame.castShadow = true;
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
let thumbIdle: ReturnType<typeof setTimeout> | null = null;

/** The picture renderer is a second WebGL context: it's let go a few seconds after the last picture. */
function releaseThumbRenderer() {
  thumbRenderer?.dispose();
  thumbRenderer?.forceContextLoss();
  thumbRenderer = null;
}
let thumbScene: THREE.Scene | null = null;
let thumbCamera: THREE.PerspectiveCamera | null = null;
const thumbCache = new Map<string, string>();

/** Heads whose tops are well above their faces (a squid's mantle, a snail's eye stalks): the picture comes down. */
const THUMB_NUDGE: Partial<Record<AnimalId, number>> = { squid: -0.2, snail: 0.1 };

/** The renderer, scene and camera for pictures, made when first wanted. */
function thumbStage(size: number) {
  if (!thumbRenderer) {
    thumbRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    thumbRenderer.setPixelRatio(1);
    // Lit and toned like the town by day, so the picture matches the animal in the game.
    thumbRenderer.toneMapping = THREE.NeutralToneMapping;
    thumbRenderer.toneMappingExposure = 1.06;
    thumbScene = new THREE.Scene();
    thumbScene.add(new THREE.HemisphereLight('#cfe8ff', '#a89a80', 1.35));
    const sun = new THREE.DirectionalLight('#fff1d2', 2.4);
    sun.position.set(1.5, 3, 2.5);
    thumbScene.add(sun);
    thumbCamera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
  }
  thumbRenderer.setSize(size, size, false);
  return { renderer: thumbRenderer, scene: thumbScene!, camera: thumbCamera! };
}

/** Draws the picture, then lets the renderer go a few seconds after the last one. '' if the graphics are gone. */
function snap(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): string {
  renderer.render(scene, camera);
  // A lost context draws nothing: no picture (and nothing kept) rather than a blank one.
  const lost = renderer.getContext().isContextLost();
  const url = lost ? '' : renderer.domElement.toDataURL('image/png');
  if (thumbIdle) clearTimeout(thumbIdle);
  thumbIdle = setTimeout(releaseThumbRenderer, lost ? 0 : 4000);
  return url;
}

/** A pet's portrait, the whole of it, turned a little to one side. Cached for the visit. */
export function petThumbnail(pet: PetId, size = 96): string {
  const key = `pet:${pet}:${size}`;
  const hit = thumbCache.get(key);
  if (hit) return hit;
  try {
    const { renderer, scene, camera } = thumbStage(size);
    const p = buildPet(pet);
    for (let i = 0; i < 20; i++) p.update(0.05, i * 0.05, false);
    p.root.rotation.y = 0.45;
    scene.add(p.root);
    p.root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(p.root);
    const c = box.getCenter(new THREE.Vector3());
    // Framed on its longest side (with room for corners as it turns), so little pets fill their tile too.
    const sz = box.getSize(new THREE.Vector3());
    const r = Math.max(0.05, Math.max(sz.x, sz.y, sz.z) * 0.75);
    const dist = (r * 1.08) / Math.sin(THREE.MathUtils.degToRad(15));
    camera.position.set(c.x + dist * 0.15, c.y + dist * 0.25, c.z + dist);
    camera.lookAt(c);
    const url = snap(renderer, scene, camera);
    scene.remove(p.root);
    p.dispose();
    if (url) thumbCache.set(key, url);
    return url;
  } catch {
    return '';
  }
}

export function animalThumbnail(look: Look, size = 128): string {
  const key = `${look.animal}:${look.color}:${look.hat ?? ''}:${size}`;
  const hit = thumbCache.get(key);
  if (hit) return hit;
  try {
    const { renderer: thumbRenderer } = thumbStage(size);
    const rig = buildAnimal(look);
    rig.update({ anim: 'idle', speed: 0, dt: 0.016, t: 0 });
    for (let i = 0; i < 30; i++) rig.update({ anim: 'idle', speed: 0, dt: 0.05, t: 0 });
    rig.root.rotation.y = 0.35;
    thumbScene!.add(rig.root);
    // Head and shoulders: the same height of picture down from the top of every head, whether that's a frog's
    // or a deer's antlers.
    const top = rig.headHeight + 0.03 + (THUMB_NUDGE[look.animal] ?? 0);
    const bottom = top - 0.64;
    const cy = (bottom + top) / 2;
    const dist = ((top - bottom) * 1.12) / (2 * Math.tan(THREE.MathUtils.degToRad(15)));
    thumbCamera!.position.set(dist * 0.18, cy + 0.08, dist);
    thumbCamera!.lookAt(0, cy, 0);
    const url = snap(thumbRenderer, thumbScene!, thumbCamera!);
    thumbScene!.remove(rig.root);
    rig.dispose();
    if (url) thumbCache.set(key, url);
    return url;
  } catch {
    return '';
  }
}
