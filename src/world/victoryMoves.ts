import * as THREE from 'three';
import type { AuxMap, Pose } from './animals';
import type { Anim } from './types';
import type { VictoryId } from './victoryShop';

/**
 * The victory moves (see victoryShop.ts), `d` seconds in, posed from the same few bones as the dances in animals.ts
 * so they work on any body: legs, tentacles, wings or none. Most loop every few seconds, at 120 beats a minute.
 * A few are the bought dances done again for the lineup.
 */

/** What a move needs of the rig: its landmarks in body space, and its ways of aiming a paw. */
export interface WinBody {
  shoulder: THREE.Vector3;
  headC: THREE.Vector3;
  headR: THREE.Vector3;
  eyePos: THREE.Vector3;
  mouth: THREE.Vector3;
  armOut: number;
  front: number;
  pawR: number;
  hasLegs: boolean;
  floats: boolean;
  sk: { rest: Map<string, THREE.Vector3> };
  prof: { gait: string };
  reach(P: Pose, side: 'r' | 'l' | 'both', y: number, z: number, out: number, by?: 'grip' | 'paw'): void;
  raise(P: Pose, side: 'r' | 'both', y: number, extra?: number): void;
  besideHead(extra?: number): number;
  faceFront(y: number): number;
  dance(P: Pose, A: AuxMap, anim: Anim, d: number): void;
}

const smooth = THREE.MathUtils.smoothstep;
const { sin, cos, abs, max, PI } = Math;
const TAU = PI * 2;

function aux(A: AuxMap, name: string) {
  let a = A.get(name);
  if (!a) A.set(name, (a = [0, 0, 0, 0, 0, 0, 1]));
  return a;
}

/** Swaps left for right, so a move can be done the other way round. */
function mirror(P: Pose) {
  [P.alx, P.arx] = [P.arx, P.alx];
  [P.alz, P.arz] = [-P.arz, -P.alz];
  [P.aly, P.ary] = [-P.ary, -P.aly];
  [P.sl, P.sr] = [P.sr, P.sl];
  [P.el, P.er] = [P.er, P.el];
  [P.llx, P.lrx] = [P.lrx, P.llx];
  [P.llz, P.lrz] = [-P.lrz, -P.llz];
  P.bx = -P.bx;
  P.bry = -P.bry;
  P.brz = -P.brz;
  P.hry = -P.hry;
  P.hrz = -P.hrz;
  P.try = -P.try;
}

export function victoryPose(b: WinBody, P: Pose, A: AuxMap, id: VictoryId, d: number) {
  const sh = b.shoulder;
  const top = b.headC.y + b.headR.y;
  const hipY = b.sk.rest.get('legL')?.y ?? sh.y * 0.5;
  const beat = d * 2;
  const hop = b.prof.gait === 'hop' ? 1.3 : 1;
  /** The `out` for reach that puts a paw at this x (body space; the right side is -x). */
  const atX = (x: number) => sh.x - x;
  const ears = (x: number, z: number) => {
    aux(A, 'earL')[0] = aux(A, 'earR')[0] = x;
    aux(A, 'earL')[2] = aux(A, 'earR')[2] = z;
  };
  /** Bent over at the hips by `a`, the legs kept straight down under them. */
  const bendOver = (a: number) => {
    P.brx = a;
    P.llx = P.lrx = -a;
    P.by += hipY * (1 - cos(a));
    P.bz += -hipY * sin(a);
  };
  /** A paw on the hip, elbow out. */
  const onHip = (side: 'r' | 'l') => b.reach(P, side, hipY + 0.04, b.front * 0.4, 0.04, 'paw');
  /** Arms straight up and out in a V, a touch forward. */
  const armsUp = (spread = 0.78) => {
    P.alz = PI * spread;
    P.arz = -PI * spread;
    P.alx = P.arx = -0.12;
    P.el = P.er = 0;
  };

  switch (id) {
    case 'fistpump': {
      // A jump with a punch at the sky on every beat, the other paw clenched at the side; both fists every third.
      const u = beat % 1;
      const air = max(0, sin(u * TAU));
      const crouch = max(0, -sin(u * TAU));
      P.by = air * 0.1 * hop - crouch * 0.03;
      P.brx = crouch * 0.1;
      P.llx = P.lrx = -crouch * 0.25;
      const both = Math.floor(beat) % 3 === 2;
      b.raise(P, both ? 'both' : 'r', top + 0.06 + air * 0.08, 0.01);
      if (!both) {
        P.alz = b.armOut + 0.25;
        P.alx = -0.5;
        P.el = 1.3;
      }
      P.hrx = -0.12 - air * 0.15;
      P.try = sin(d * 12) * 0.5;
      ears(-0.25, 0);
      break;
    }
    case 'default': {
      // Arms swinging up and down in front in turn, a kick out to the side on each beat and a bounce; every
      // fourth bar, the paws pumping down in front while the knees bob.
      const bar = beat % 8;
      if (bar < 6) {
        const s = Math.floor(beat) % 2 ? 1 : -1;
        const k = sin((beat % 1) * PI);
        P.by = k * 0.04;
        P.alx = -0.4 - s * 0.7 * k;
        P.arx = -0.4 + s * 0.7 * k;
        P.alz = b.armOut + 0.15;
        P.arz = -b.armOut - 0.15;
        P.el = P.er = 1.2;
        if (s > 0) P.llz = 0.45 * k;
        else P.lrz = -0.45 * k;
        P.brz = -s * 0.08 * k;
        P.hrz = s * 0.12 * k;
        P.try = s * 0.6;
      } else {
        const pump = abs(sin(beat * TAU));
        b.reach(P, 'both', sh.y - 0.08 - pump * 0.08, b.front + b.pawR + 0.1, 0.02, 'paw');
        P.by = -pump * 0.04;
        P.llx = P.lrx = -pump * 0.3;
        P.brx = pump * 0.12;
        P.hrx = 0.1;
      }
      break;
    }
    case 'floss': {
      // The floss, half as fast again, with a hop on every swing.
      b.dance(P, A, 'floss', d * 1.5);
      P.by += abs(sin(d * PI * 3.3)) * 0.05 * hop;
      break;
    }
    case 'takel': {
      // An L on the forehead (the other paw on the hip) and a kick-step from foot to foot, the head going side to
      // side with a cheeky grin.
      const eye = b.eyePos.y + 0.07;
      b.reach(P, 'r', eye, b.faceFront(eye) + b.pawR + 0.03, atX(-0.01), 'paw');
      P.alz = b.armOut + 0.5;
      P.alx = -0.2 + sin(beat * PI) * 0.3;
      P.el = 0.8;
      const s = Math.floor(beat) % 2 ? 1 : -1;
      const k = sin((beat % 1) * PI);
      P.by = k * 0.05 * hop;
      if (s > 0) P.llx = -0.7 * k;
      else P.lrx = -0.7 * k;
      P.bry = s * 0.15;
      P.hry = sin(d * 4) * 0.25;
      P.hrz = s * 0.08;
      P.try = s * 0.5;
      break;
    }
    case 'dab': {
      // A dab to one side, a bounce, a dab to the other.
      const bar = beat % 4;
      const side = bar < 2 ? 1 : -1;
      const into = smooth(bar % 2, 0, 0.25);
      const bob = abs(sin(beat * PI));
      if (into < 0.05 || bar % 2 > 1.75) {
        P.by = bob * 0.05;
        P.alz = b.armOut + 0.2;
        P.arz = -b.armOut - 0.2;
        P.alx = P.arx = -0.3;
        P.el = P.er = 1;
        P.hrx = -0.1;
      } else {
        // The right elbow up across the face, the face tucked into it, the left arm out straight the same way.
        const y = b.eyePos.y + 0.02;
        b.reach(P, 'r', y, b.faceFront(y) + b.pawR + 0.08, atX(b.headR.x + 0.08), 'paw');
        P.alz = 2.2;
        P.alx = -0.5;
        P.el = 0;
        P.hrx = 0.38;
        P.hry = 0.45;
        P.hrz = 0.15;
        P.brz = -0.06;
        P.bry = 0.15;
        P.by = -0.01;
        P.llz = 0.12;
        P.lrz = -0.12;
        if (side < 0) mirror(P);
      }
      ears(-0.1, 0);
      break;
    }
    case 'gangnam': {
      // Wrists crossed in front holding the reins, a skip from foot to foot shuffling sideways, and every fourth
      // bar the right paw up swinging a lasso with the hips going.
      const q = d * 4;
      const jump = abs(sin(q * PI));
      const left = Math.floor(q / 2) % 2 === 0;
      P.by = jump * 0.07 * hop;
      P.llx = left ? -0.6 * jump : 0.1;
      P.lrx = left ? 0.1 : -0.6 * jump;
      P.bx = sin(d * PI * 0.5) * 0.08;
      P.brx = -0.05;
      b.reach(P, 'both', sh.y - 0.02 + jump * 0.03, b.front + b.pawR + 0.08, atX(0.02), 'paw');
      if (beat % 16 >= 12) {
        b.raise(P, 'r', top + 0.14, 0.04 + sin(d * 14) * 0.08);
        P.arx += cos(d * 14) * 0.25;
        P.bz = sin(d * 8) * 0.04;
        P.hrx = -0.15;
      } else P.hrx = jump * 0.1 - 0.05;
      P.hry = left ? 0.12 : -0.12;
      P.try = (left ? 1 : -1) * 0.5;
      ears(-0.2 + jump * 0.2, 0);
      break;
    }
    case 'zombie': {
      // Claws up together off to one side, the head lolling the other way, four shrugs of the shoulders, then a
      // shamble across to the other side.
      const bar = beat % 8;
      const side = bar < 4 ? 1 : -1;
      const shrug = max(0, sin((bar % 1) * TAU));
      const step = smooth(bar % 4, 3, 4);
      b.reach(P, 'both', sh.y + 0.08 + shrug * 0.03, b.front + b.pawR + 0.12, 0.02, 'paw');
      P.alz += side * 0.35;
      P.arz += side * 0.35;
      P.el = P.er = max(P.el, 0.6);
      P.bx = side * 0.05 * (1 - 2 * step);
      P.by = shrug * 0.02;
      P.brz = -side * 0.08;
      P.bry = side * 0.2;
      P.hrz = -side * 0.3;
      P.hry = side * 0.3;
      P.hrx = 0.12;
      P.llz = 0.12 + (side > 0 ? step * 0.3 : 0);
      P.lrz = -0.12 - (side < 0 ? step * 0.3 : 0);
      P.try = side * 0.3;
      ears(0.3, 0);
      break;
    }
    case 'carlton':
    case 'worm':
    case 'moonwalk':
    case 'ymca':
    case 'griddy':
    case 'macarena':
      b.dance(P, A, id, d);
      break;
    case 'pedro': {
      // Two beats each: stomping with the knees high and the arms flapping stiff; a slide sideways with the arms
      // swinging across; a jump, all four limbs flung out; and a shimmy with the head bobbing.
      const bar = beat % 8;
      const part = Math.floor(bar / 2);
      const k = sin((beat % 1) * PI);
      const s = Math.floor(beat) % 2 ? 1 : -1;
      if (part === 0) {
        P.by = k * 0.05;
        if (s > 0) P.llx = -1.0 * k;
        else P.lrx = -1.0 * k;
        P.alz = b.armOut + 0.3 + k * 0.5;
        P.arz = -b.armOut - 0.3 - k * 0.5;
        P.alx = P.arx = 0.2;
        P.hrx = -0.1 + k * 0.1;
      } else if (part === 1) {
        const u = (bar - 2) / 2;
        P.bx = sin(u * PI) * 0.12;
        P.alz = b.armOut + 0.3 + s * 0.9;
        P.arz = -b.armOut - 0.3 + s * 0.9;
        P.alx = P.arx = -0.3;
        P.llz = 0.2;
        P.lrz = -0.05;
        P.brz = -0.1;
        P.hry = -0.4;
      } else if (part === 2) {
        const u = (bar - 4) / 2;
        const air = sin(u * PI);
        P.by = air * 0.14 * hop;
        P.alz = b.armOut + air * 1.6;
        P.arz = -b.armOut - air * 1.6;
        P.llz = air * 0.5;
        P.lrz = -air * 0.5;
        P.hrx = -0.3 * air;
      } else {
        const w = sin(d * 18);
        P.brz = w * 0.08;
        P.bry = w * 0.15;
        P.alx = P.arx = -0.6;
        P.alz = b.armOut + 0.4 + w * 0.2;
        P.arz = -b.armOut - 0.4 + w * 0.2;
        P.el = P.er = 1.4;
        P.hrx = abs(sin(d * 9)) * 0.2 - 0.05;
        P.hrz = -w * 0.1;
      }
      P.try = s * 0.6;
      break;
    }
    case 'fever': {
      // The disco point: the right paw up high and out on one beat, down across to the left hip on the next, the
      // hips swinging out under it, the other paw on its hip.
      const up = Math.floor(beat) % 2 === 0;
      const k = smooth(beat % 1, 0, 0.3);
      if (up) {
        P.arz = -2.5;
        P.arx = -0.35;
        P.er = 0;
        P.brz = 0.12 * k;
        P.bx = -0.04 * k;
        P.hry = -0.35;
        P.hrx = -0.2;
      } else {
        b.reach(P, 'r', hipY - 0.04, b.front + b.pawR + 0.06, atX(-sh.x * 0.9), 'paw');
        P.brz = -0.08 * k;
        P.bx = 0.04 * k;
        P.hry = 0.2;
        P.hrx = 0.15;
      }
      onHip('l');
      P.llx = up ? 0 : -0.25;
      P.lrz = up ? -0.18 : -0.05;
      P.by = abs(sin(beat * PI)) * 0.015;
      P.try = up ? -0.5 : 0.5;
      break;
    }
    case 'chestbeat': {
      // Feet planted wide, fists pounding the chest in turn, faster and faster; then both arms flung wide and up
      // and the head thrown back in a roar.
      const bar = beat % 8;
      P.llz = 0.3;
      P.lrz = -0.3;
      P.by = -0.04;
      if (bar < 6) {
        const rate = 4 + bar;
        const w = sin(d * rate * PI);
        const chest = sh.y - 0.04;
        const z = b.front + b.pawR;
        b.reach(P, 'r', chest, z + max(0, w) * 0.12, atX(-0.05), 'paw');
        const r = [P.arx, P.arz, P.sr, P.er];
        b.reach(P, 'l', chest, z + max(0, -w) * 0.12, atX(-0.05), 'paw');
        [P.arx, P.arz, P.sr, P.er] = r;
        P.brx = -0.12;
        P.hrx = -0.15;
        P.bry = w * 0.08;
        P.by += abs(w) * 0.015;
      } else {
        const u = smooth(bar - 6, 0, 0.3);
        armsUp(0.62 + u * 0.1);
        P.brx = -0.18 * u;
        P.hrx = -0.4 * u + sin(d * 30) * 0.03;
        P.by += u * 0.02;
      }
      P.try = sin(d * 6) * 0.4;
      ears(-0.3, 0);
      break;
    }
    case 'rocky': {
      // Three seconds bouncing on the toes throwing jabs, then three with both arms up, jumping for joy.
      const c = d % 6;
      if (c < 3) {
        const bounce = abs(sin(d * PI * 4));
        P.by = bounce * 0.035;
        const jab = Math.floor(d * 3) % 2 ? 'r' : 'l';
        const out = max(0, sin(d * 3 * PI));
        const guard = sh.y + 0.02;
        b.reach(P, 'both', guard, b.front + b.pawR + 0.05, atX(-0.02), 'paw');
        const keep = jab === 'r' ? ([P.alx, P.alz, P.sl, P.el] as const) : ([P.arx, P.arz, P.sr, P.er] as const);
        b.reach(P, jab, guard, b.front + b.pawR + 0.05 + out * 0.3, atX(-0.04), 'paw');
        if (jab === 'r') [P.alx, P.alz, P.sl, P.el] = keep;
        else [P.arx, P.arz, P.sr, P.er] = keep;
        P.bry = (jab === 'r' ? 0.25 : -0.25) * out;
        P.hrx = 0.12;
        P.llx = -0.2;
        P.lrx = 0.15;
      } else {
        const air = abs(sin((c - 3) * PI * 2));
        armsUp(0.86);
        P.alz += sin(d * 12) * 0.1;
        P.arz += sin(d * 12) * 0.1;
        P.by = air * 0.1 * hop;
        P.hrx = -0.35;
        P.bry = sin((c - 3) * 1.5) * 0.5;
      }
      P.try = sin(d * 8) * 0.5;
      break;
    }
    case 'landing': {
      // Up out of the sky and down onto one knee, a fist to the floor and the other arm out behind, head up;
      // held, then up again.
      const c = d % 4;
      const fall = c < 0.5 ? 1 - smooth(c, 0, 0.5) : 0;
      const kneel = c < 0.5 ? smooth(c, 0.35, 0.5) : 1 - smooth(c, 3.3, 3.9);
      P.by = fall * 0.5 - kneel * hipY * 0.45;
      if (b.hasLegs) {
        P.llx = -1.3 * kneel;
        P.lrx = 1.1 * kneel;
        P.llz = 0.12;
        P.lrz = -0.1;
      }
      P.brx = 0.35 * kneel;
      b.reach(P, 'r', 0.03 + (1 - kneel) * (sh.y - 0.1), b.front + b.pawR + 0.1, atX(-0.02), 'paw');
      P.alx = 0.7 * kneel - 0.3 * fall;
      P.alz = b.armOut + 0.5 + fall * 0.8;
      P.el = 0.3;
      P.hrx = -0.45 * kneel;
      P.hry = 0.1 * kneel;
      P.trx = 0.4 * kneel;
      // (A little tremble as the stage takes the landing.)
      P.bx = c > 0.5 && c < 0.75 ? sin(c * 90) * 0.01 : 0;
      ears(-0.4 * fall + 0.1 * kneel, 0);
      break;
    }
    case 'bolt': {
      // Running on the spot, then the pose: leaning back, the left arm up and out pointing at the sky, the right
      // paw cocked by the chest pointing the same way. Held, with a little sway.
      const c = d % 4;
      if (c < 1) {
        const left = Math.floor(d * 8) % 2 === 0;
        const k = abs(sin(d * 8 * PI));
        P.by = 0.02 + k * 0.05;
        P.llx = left ? -1.0 * k : 0.3 * k;
        P.lrx = left ? 0.3 * k : -1.0 * k;
        P.alx = left ? -0.9 : 0.5;
        P.arx = left ? 0.5 : -0.9;
        P.el = P.er = 1.4;
        P.brx = 0.15;
      } else {
        const sway = sin(d * 2) * 0.02;
        P.alz = 2.35 + sway;
        P.alx = -0.35;
        P.el = 0;
        b.reach(P, 'r', sh.y + 0.08, b.front + b.pawR + 0.08, atX(-sh.x * 1.2), 'paw');
        P.brz = -0.14;
        P.brx = -0.1;
        P.bx = 0.02;
        P.bry = 0.25;
        P.hry = 0.45;
        P.hrx = -0.25;
        P.lrz = -0.25;
        P.llx = -0.15;
      }
      ears(-0.2, 0);
      break;
    }
    case 'woo': {
      // Strutting on the spot, chest out and knees high, the elbows flapping; then a chop, and the big "Woo!"
      // with the arms flung out and the head back.
      const bar = beat % 8;
      if (bar < 5) {
        const left = Math.floor(beat) % 2 === 0;
        const k = sin((beat % 1) * PI);
        P.llx = left ? -0.8 * k : 0;
        P.lrx = left ? 0 : -0.8 * k;
        P.by = k * 0.03;
        P.brx = -0.15;
        P.bry = (left ? 0.15 : -0.15) * k;
        P.alx = P.arx = 0.35;
        P.alz = b.armOut + 0.45 + k * 0.2;
        P.arz = -b.armOut - 0.45 - k * 0.2;
        P.el = P.er = 1.2;
        P.hrx = -0.2;
        P.hry = (left ? -0.2 : 0.2) * k;
      } else if (bar < 6) {
        const u = bar - 5;
        const chop = smooth(u, 0.3, 0.6);
        b.raise(P, 'r', top + 0.1 - chop * 0.35, 0.02);
        P.arx -= chop * 0.6;
        onHip('l');
        P.hrx = -0.1;
      } else {
        const u = smooth(bar - 6, 0, 0.3);
        P.alz = b.armOut + u * 1.3;
        P.arz = -b.armOut - u * 1.3;
        P.alx = P.arx = 0.2;
        P.brx = -0.2 * u;
        P.hrx = -0.55 * u + sin(d * 40) * 0.02;
        P.by = 0.02 * u;
      }
      P.try = sin(d * 9) * 0.5;
      break;
    }
    case 'hotline': {
      // Swaying from foot to foot with loose bent arms; a big forehand swing as if at tennis; then the paws
      // together in front, bobbing.
      const bar = beat % 8;
      if (bar < 4) {
        const s = sin(beat * PI * 0.5);
        P.bx = s * 0.05;
        P.brz = -s * 0.07;
        P.bry = s * 0.2;
        P.alx = P.arx = -0.7;
        P.alz = b.armOut + 0.25 + s * 0.25;
        P.arz = -b.armOut - 0.25 + s * 0.25;
        P.el = P.er = 1.5;
        P.hrz = s * 0.12;
        P.by = abs(s) * 0.015;
        P.llx = max(0, s) * -0.2;
        P.lrx = max(0, -s) * -0.2;
      } else if (bar < 6) {
        const u = (bar - 4) / 2;
        const swing = smooth(u, 0.15, 0.6);
        P.bry = -0.6 + swing * 1.1;
        P.arz = -b.armOut - 0.6;
        P.arx = 0.6 - swing * 1.8;
        P.er = 0.3;
        P.alx = -0.6;
        P.el = 1.2;
        P.hry = -0.3 + swing * 0.5;
        P.lrx = -0.2;
      } else {
        const k = abs(sin(beat * PI));
        b.reach(P, 'both', sh.y - 0.06, b.front + b.pawR + 0.08, atX(-0.03), 'paw');
        P.by = k * 0.03;
        P.llx = P.lrx = -k * 0.15;
        P.hrx = 0.1 - k * 0.1;
        P.hry = sin(d * 3) * 0.25;
      }
      P.try = sin(d * 4) * 0.4;
      break;
    }
    case 'lean': {
      // A tip of the hat, then the whole body tipping forward from the feet, stiff as a board, much further
      // than it should, held, and slowly back up.
      const c = d % 6;
      const tilt = smooth(c, 1.6, 3) * (1 - smooth(c, 4.4, 5.6));
      if (c < 1.4) {
        const tip = sin(smooth(c, 0.1, 1.3) * PI);
        b.raise(P, 'r', top + 0.02, -0.04 + tip * 0.02);
        P.hrx = 0.2 * tip;
      } else {
        P.arx = P.alx = 0;
        P.arz = -b.armOut * 0.5;
        P.alz = b.armOut * 0.5;
      }
      if (b.hasLegs && !b.floats) {
        P.brx = 0.72 * tilt;
        P.hrx -= 0.35 * tilt;
      } else P.brx = 0.4 * tilt;
      P.trx = -0.4 * tilt;
      ears(-0.2 * tilt, 0);
      break;
    }
    case 'moonpose': {
      // A twirl with the arms out, then the pose: a V over the right eye, the left arm out straight, the hip out
      // and a knee bent in.
      const c = d % 4;
      const spin = smooth(c, 0, 1.1);
      if (c < 1.15) {
        P.bry = spin * TAU;
        P.alz = b.armOut + 1.1;
        P.arz = -b.armOut - 1.1;
        P.by = sin(spin * PI) * 0.06 * hop;
        P.lrx = -0.5 * sin(spin * PI);
      } else {
        const y = b.eyePos.y;
        b.reach(P, 'r', y, b.faceFront(y) + b.pawR + 0.04, atX(-abs(b.eyePos.x)), 'paw');
        P.alz = b.armOut + 1.05;
        P.alx = -0.45;
        P.el = 0;
        P.brz = 0.1;
        P.bx = -0.03;
        P.hrz = -0.2;
        P.hry = 0.1;
        P.lrx = -0.3;
        P.lrz = 0.12;
        P.by = sin(d * 3) * 0.006;
      }
      ears(-0.15, 0);
      break;
    }
    case 'ninjarun': {
      // Leaning right into it with the arms streaming out straight behind, running on the spot as fast as it goes.
      const left = Math.floor(d * 10) % 2 === 0;
      const k = abs(sin(d * 10 * PI));
      P.brx = 0.45;
      P.bz = -0.05;
      P.by = 0.01 + k * 0.04;
      P.llx = (left ? -1.1 * k : 0.5 * k) - 0.45;
      P.lrx = (left ? 0.5 * k : -1.1 * k) - 0.45;
      P.alx = P.arx = 1.25;
      P.alz = b.armOut + 0.15;
      P.arz = -b.armOut - 0.15;
      P.el = P.er = 0;
      P.hrx = -0.5;
      P.trx = -0.3;
      P.try = sin(d * 20) * 0.3;
      ears(0.6, 0);
      break;
    }
    case 'jojo': {
      // One dramatic, twisted pose after another, each struck with a snap and held, trembling with menace.
      const n = Math.floor(d / 1.5) % 4;
      const shake = sin(d * 37) * 0.006;
      if (n === 0) {
        // A paw up at the brow, the other out low, the hips thrown out.
        const y = b.headC.y + b.headR.y * 0.4;
        b.reach(P, 'r', y, b.faceFront(y) + b.pawR + 0.03, atX(-b.headR.x * 0.4), 'paw');
        P.alx = -0.5;
        P.alz = b.armOut + 0.6;
        P.el = 0.2;
        P.bry = 0.5;
        P.brz = -0.16;
        P.bx = 0.05;
        P.hrz = 0.3;
        P.hry = -0.35;
        P.llx = -0.25;
        P.lrz = -0.12;
      } else if (n === 1) {
        // Pointing straight ahead, the other paw on the hip, leaning back.
        P.arx = -1.55;
        P.arz = -0.08;
        P.er = 0;
        onHip('l');
        P.brx = -0.15;
        P.bry = -0.35;
        P.hrx = -0.12;
        P.hry = 0.3;
        P.llz = 0.2;
        P.lrz = -0.2;
      } else if (n === 2) {
        // Bent back as far as it goes, arms crossed high in front of the face.
        b.reach(P, 'both', b.eyePos.y - 0.02, b.faceFront(b.eyePos.y) + b.pawR + 0.08, atX(sh.x * 0.3), 'paw');
        P.brx = -0.32;
        P.bz = 0.06;
        P.brz = 0.08;
        P.hrx = 0.1;
        P.hry = -0.4;
        P.llx = -0.35;
        P.lrx = 0.2;
      } else {
        // On one leg, the other knee up, framing the face with the paws.
        b.raise(P, 'both', b.headC.y + 0.04, -0.02);
        P.lrx = -1.1;
        P.lrz = 0.15;
        P.brz = 0.18;
        P.bx = -0.04;
        P.bry = 0.3;
        P.hrz = -0.25;
        P.by = 0.02;
      }
      P.bx += shake;
      P.hrx += shake * 4;
      ears(-0.2, 0);
      break;
    }
    case 'powerup': {
      // Crouched with the feet wide and fists clenched low, shaking harder and harder as the power builds, then
      // a burst: arms flung out and the head back, screaming.
      const c = d % 3;
      const build = smooth(c, 0, 2.2);
      const burst = smooth(c, 2.2, 2.4) * (1 - smooth(c, 2.8, 3));
      const shake = sin(d * 47) * (0.004 + build * 0.016);
      P.by = -0.06 + burst * 0.08;
      P.llz = 0.32;
      P.lrz = -0.32;
      P.llx = P.lrx = -0.2;
      P.brx = 0.18 - burst * 0.35;
      P.alx = P.arx = 0.35 - burst * 0.3;
      P.alz = b.armOut + 0.35 + burst * 1.0;
      P.arz = -b.armOut - 0.35 - burst * 1.0;
      P.el = P.er = 1.1 * (1 - burst);
      P.bx = shake;
      P.hrx = -0.15 - build * 0.2 - burst * 0.35;
      P.trx = -0.3 * build;
      ears(-0.5 * build, shake * 4);
      break;
    }
    case 'pointing': {
      // Pointing off to one side, jabbing the paw and staring in disbelief, the other paw on the hip; then the
      // other way.
      const bar = beat % 8;
      const jab = abs(sin(beat * PI * 2)) * 0.12;
      P.arz = -1.45 - jab * 0.5;
      P.arx = -0.55;
      P.er = 0;
      onHip('l');
      P.hry = -0.55;
      P.hrx = -0.08;
      P.bry = -0.12;
      P.brx = -0.05;
      P.by = jab * 0.08;
      P.lrz = -0.1;
      P.llz = 0.06;
      if (bar >= 4) mirror(P);
      ears(-0.3, 0);
      break;
    }
    case 'micdrop': {
      // The mic held to the mouth with the other paw waving as the speech goes on; then held out at arm's length
      // to the side, dropped (see Victory.tsx), and the arms folded, chin up.
      const c = d % 5;
      if (c < 2) {
        const m = b.mouth;
        b.reach(P, 'r', m.y, b.faceFront(m.y) + b.pawR + 0.07, atX(-0.03), 'paw');
        const talk = sin(d * 9);
        P.alz = b.armOut + 0.4 + talk * 0.25;
        P.alx = -0.8;
        P.el = 1.2;
        P.hrx = abs(talk) * 0.06 - 0.04;
        P.hry = sin(d * 2) * 0.2;
        P.by = abs(sin(d * 4)) * 0.01;
      } else if (c < 2.9) {
        const u = smooth(c, 2, 2.4);
        P.arz = -b.armOut - u * 1.25;
        P.arx = -0.4;
        P.er = 0;
        P.alz = b.armOut;
        P.hry = -0.4 * u;
        P.hrx = -0.1;
      } else {
        const u = smooth(c, 2.9, 3.3);
        b.reach(P, 'both', sh.y - 0.06, b.front + b.pawR + 0.02, atX(-sh.x * 0.6), 'paw');
        P.hrx = -0.25 * u;
        P.hry = 0.2 * u;
        P.brx = -0.08 * u;
      }
      break;
    }
    case 'backflip': {
      // A crouch with the arms swung back, a spring and a full flip backwards (about the middle of the body),
      // a landing, and both arms up.
      const c = d % 3;
      const mid = top * 0.5;
      if (c < 0.6) {
        const k = smooth(c, 0.1, 0.55);
        P.by = -0.06 * k;
        P.brx = 0.25 * k;
        P.llx = P.lrx = -0.4 * k;
        P.alx = P.arx = 0.8 * k;
      } else if (c < 1.35) {
        const u = (c - 0.6) / 0.75;
        const a = -TAU * smooth(u, 0, 1);
        const lift = 4 * u * (1 - u) * top * 0.6;
        P.brx = a;
        P.by = mid - mid * cos(a) + lift;
        P.bz = -mid * sin(a);
        const tuck = sin(u * PI);
        P.llx = P.lrx = -1.3 * tuck;
        P.alx = P.arx = -1.2 * tuck - 0.6 * (1 - tuck);
        P.alz = b.armOut + 0.2;
        P.arz = -b.armOut - 0.2;
        P.hrx = 0.3 * tuck;
      } else if (c < 1.7) {
        const k = sin(((c - 1.35) / 0.35) * PI);
        P.by = -0.07 * k;
        P.brx = 0.2 * k;
        P.llx = P.lrx = -0.4 * k;
        P.alz = b.armOut + 0.8;
        P.arz = -b.armOut - 0.8;
      } else {
        const k = smooth(c, 1.7, 1.9);
        armsUp(0.5 + k * 0.3);
        P.by = abs(sin((c - 1.7) * PI * 2)) * 0.02;
        P.hrx = -0.25 * k;
      }
      break;
    }
    case 'bow': {
      // A flourish: the right paw up and rolling round as it comes down across the tummy, the left out behind,
      // and a deep bow from the waist; up again, and a little wave.
      const c = d % 4;
      const bow = smooth(c, 0.9, 1.5) * (1 - smooth(c, 2.6, 3.2));
      if (c < 1.1) {
        const u = smooth(c, 0, 1.1);
        const roll = u * TAU * 1.5;
        b.raise(P, 'r', top - u * 0.15, 0.06 + sin(roll) * 0.05);
        P.arx += cos(roll) * 0.3 * (1 - u);
      } else if (c < 3.2) {
        b.reach(P, 'r', sh.y - 0.12, b.front + b.pawR + 0.03, atX(0.0), 'paw');
      } else {
        b.raise(P, 'r', b.headC.y + 0.02, 0.02 + sin(d * 9) * 0.05);
      }
      P.alx = 0.25 + bow * 0.5;
      P.alz = b.armOut + 0.35 + bow * 0.3;
      P.el = 0.2;
      if (b.hasLegs && !b.floats) bendOver(bow * 0.75);
      else P.brx = bow * 0.5;
      P.hrx += bow * 0.2;
      P.lrx += 0.25 * bow;
      ears(0.2 * bow, 0);
      break;
    }
    case 'pirouette': {
      // Down into a little plié, then up on one toe, the other foot at the knee and the arms in a ring overhead,
      // spinning three times round; arms opened out wide for the finish.
      const c = d % 4;
      if (c < 0.5) {
        const k = smooth(c, 0, 0.4);
        P.by = -0.04 * k;
        P.llx = P.lrx = -0.25 * k;
        P.llz = 0.15 * k;
        P.lrz = -0.15 * k;
        P.alz = b.armOut + 0.9;
        P.arz = -b.armOut - 0.9;
        P.alx = P.arx = -0.4;
        P.el = P.er = 0.4;
      } else if (c < 2.6) {
        const u = smooth(c, 0.5, 2.6);
        P.bry = u * TAU * 3;
        P.by = 0.04;
        P.lrx = -0.9;
        P.lrz = 0.35;
        b.raise(P, 'both', top + 0.1, -0.02);
        P.hrx = -0.1;
      } else {
        const k = smooth(c, 2.6, 2.9);
        P.alz = b.armOut + 1.0 * k + 0.3;
        P.arz = -b.armOut - 1.0 * k - 0.3;
        P.alx = P.arx = -0.25;
        P.lrx = -0.3 * k;
        P.lrz = 0.05;
        P.hrx = -0.2 * k;
        P.brx = -0.06 * k;
      }
      ears(-0.15, 0);
      break;
    }
  }
}

/** How a victory move's prop goes (the mic, for now): held until `drop` seconds into each `loop`, then let go. */
export const VICTORY_PROPS: Partial<Record<VictoryId, { kind: 'mic'; drop: number; loop: number }>> = {
  micdrop: { kind: 'mic', drop: 2.9, loop: 5 },
};

/** Lightweight checks used by the lineup: whether a move goes up in a golden aura. */
export const AURA: Partial<Record<VictoryId, boolean>> = { powerup: true };
