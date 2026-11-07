import * as THREE from 'three';
import type { AuxMap, Pose } from './animals';
import type { WinBody } from './victoryMoves';
import { isPerched, jetHeight, podiumHeight, propSize } from './victoryProps';
import type { VictoryId } from './victoryShop';

/**
 * The victory moves built round props and staging (a podium, a trophy, a jetpack…): how the body goes, `d` seconds
 * in. The props themselves, and when they come and go, are in victoryProps.ts, timed off the same clock. Up on a
 * stool in the town (perched) there's no room for the things that stand on the floor, so those moves stay put.
 */

const smooth = THREE.MathUtils.smoothstep;
const { sin, cos, abs, max, min, PI } = Math;

function aux(A: AuxMap, name: string) {
  let a = A.get(name);
  if (!a) A.set(name, (a = [0, 0, 0, 0, 0, 0, 1]));
  return a;
}

export function propPose(b: WinBody, P: Pose, A: AuxMap, id: VictoryId, d: number) {
  const sh = b.shoulder;
  const top = b.headC.y + b.headR.y;
  const hipY = b.sk.rest.get('legL')?.y ?? sh.y * 0.5;
  const perched = isPerched((b as unknown as { root: THREE.Object3D }).root);
  const size = propSize(top);
  const beat = d * 2;
  const atX = (x: number) => sh.x - x;
  const ears = (x: number, z: number) => {
    aux(A, 'earL')[0] = aux(A, 'earR')[0] = x;
    aux(A, 'earL')[2] = aux(A, 'earR')[2] = z;
  };
  const bendOver = (a: number) => {
    P.brx = a;
    P.llx = P.lrx = -a;
    P.by += hipY * (1 - cos(a));
    P.bz += -hipY * sin(a);
  };
  const onHip = (side: 'r' | 'l') => b.reach(P, side, hipY + 0.04, b.front * 0.4, 0.04, 'paw');
  /** A step on the spot, `k` of the way through a stride (0 to 2), legs and arms swinging. */
  const step = (k: number, swing: number) => {
    const s = sin(k * PI);
    P.llx = -s * 0.45;
    P.lrx = s * 0.45;
    P.alx = s * swing;
    P.arx = -s * swing;
    P.by += abs(s) * 0.015;
  };

  switch (id) {
    case 'skyshow': {
      // Looking up at the sky behind, and pointing at each rocket as it bursts (three to a loop, see the props),
      // the other paw at the mouth for the "ooh".
      const c = d % 4.5;
      const which = c < 1.5 ? 0 : c < 3 ? 1 : 2;
      const side = [0.5, -0.6, 0.1][which];
      const k = smooth(c % 1.5, 0, 0.35);
      b.raise(P, 'r', top + 0.25, 0.04 + side * 0.08);
      P.arx -= 0.25;
      const m = b.mouth;
      b.reach(P, 'l', m.y, b.faceFront(m.y) + b.pawR + 0.05, atX(0.02), 'paw');
      P.hrx = -0.5 - k * 0.08;
      P.hry = side * 0.4 * k;
      P.bry = side * 0.15;
      P.brx = -0.08;
      P.by = abs(sin(c * PI * 2)) * 0.01;
      ears(-0.2, 0);
      break;
    }
    case 'coolwalk': {
      // Shades on and a slow, steady walk away from the explosion behind (towards us), not a glance back;
      // on a stool, the strut is done on the spot.
      const c = d % 5;
      step(d * 0.9, 0.25);
      P.alz = b.armOut + 0.08;
      P.arz = -b.armOut - 0.08;
      P.el = P.er = 0.25;
      if (!perched) P.bz = smooth(c, 0, 4.6) * 0.4 * size - smooth(c, 4.6, 5) * 0.4 * size;
      P.hrx = -0.08;
      P.hry = sin(d * 0.9) * 0.06;
      // (A flinch for the bang, no more.)
      const bang = max(0, 1 - c / 0.35) * (c > 0.05 ? 1 : 0);
      P.hrz = bang * 0.05;
      P.try = sin(d * 1.8) * 0.3;
      break;
    }
    case 'podium': {
      // Up on the podium as it rises underneath, then both arms up, a fist pump on the beat and a little hop.
      const lift = perched ? 0 : podiumHeight(size) * smooth(d, 0, 0.6);
      const u = beat % 1;
      const air = max(0, sin(u * PI * 2));
      P.by = lift + air * 0.04;
      b.raise(P, 'both', top + 0.12 + air * 0.06, 0.08 + air * 0.04);
      P.hrx = -0.18;
      P.hry = sin(d * 1.3) * 0.3;
      ears(-0.2, 0);
      break;
    }
    case 'fries': {
      // The bag held open in the left paw, the scoop in the right: down into the chips, up, over and tipped into
      // the bag, a shake, and a flat stare out at us. Again.
      const c = d % 4;
      const bagY = sh.y - 0.12;
      b.reach(P, 'l', bagY, b.front + b.pawR + 0.08, atX(-0.08), 'paw');
      // (The right paw's side is -x: down to the chips on that side, then over to the bag.)
      const low = { y: hipY + 0.02, z: b.front + 0.12, x: -0.16 };
      const over = { y: bagY + 0.12, z: b.front + b.pawR + 0.1, x: 0.06 };
      let k = 0;
      if (c < 0.6) k = 0;
      else if (c < 1.3) k = smooth(c, 0.6, 1.3);
      else k = 1 - smooth(c, 3.3, 3.9);
      b.reach(P, 'r', low.y + (over.y - low.y) * k, low.z + (over.z - low.z) * k, atX(low.x + (over.x - low.x) * k), 'paw');
      const tip = smooth(c, 1.4, 1.7) * (1 - smooth(c, 2.3, 2.6));
      P.tilt = tip * 1.5 + (c < 0.6 ? 0.5 * sin((c / 0.6) * PI) : 0);
      P.hrx = c < 2.6 ? 0.3 : 0.3 - smooth(c, 2.6, 2.9) * 0.3;
      P.hry = c < 2.6 ? 0.1 : 0;
      ears(0.15, 0);
      break;
    }
    case 'medal': {
      // Standing tall with the head bowed as the medal comes down over it, then chest out and a long salute.
      const c = d % 5;
      const bow = smooth(c, 0.3, 0.8) * (1 - smooth(c, 1.2, 1.5));
      P.hrx = bow * 0.35 - (c > 1.4 ? 0.12 : 0);
      P.brx = -0.08 * smooth(c, 1.2, 1.6);
      P.alz = b.armOut * 0.4;
      P.arz = -b.armOut * 0.4;
      P.alx = P.arx = -0.05;
      const sal = smooth(c, 1.6, 1.95) * (1 - smooth(c, 4.3, 4.7));
      if (sal > 0.01) {
        const y = b.eyePos.y + 0.04;
        const z = b.faceFront(y) + b.pawR * 0.7;
        b.reach(P, 'r', sh.y + (y - sh.y) * sal, b.front + (z - b.front) * sal, atX(-b.headR.x * 0.5 * sal), 'paw');
      }
      P.llz = 0.02;
      P.lrz = -0.02;
      break;
    }
    case 'trophy': {
      // The cup held up over the head in both paws and pumped up and down, a hop with it.
      const u = beat % 1;
      const pump = abs(sin(u * PI));
      b.raise(P, 'both', top + 0.04 + pump * 0.06, -0.02);
      P.by = pump * 0.035;
      P.hrx = -0.3;
      P.hry = sin(d * 1.2) * 0.15;
      P.brx = -0.06;
      ears(-0.25, 0);
      break;
    }
    case 'cheque': {
      // The cheque held out in front at the belly in both paws, swung up to show one side, then the other.
      const c = d % 4;
      const side = c < 2 ? 1 : -1;
      const k = smooth(c % 2, 0.1, 0.6) * (1 - smooth(c % 2, 1.6, 2));
      const y = sh.y - 0.1 + k * 0.06;
      b.reach(P, 'both', y, b.front + b.pawR + 0.08, 0.04, 'paw');
      P.bry = side * k * 0.35;
      P.hry = side * k * 0.25;
      P.hrx = -0.12;
      P.by = abs(sin(beat * PI)) * 0.015;
      break;
    }
    case 'crowned': {
      // Still and solemn, head a touch bowed, as the crown comes down onto it; then a sweep of the right paw out
      // and across with the cape swirling, and chin up, paw on the hip.
      const c = d % 5;
      const bow = smooth(c, 0.2, 0.6) * (1 - smooth(c, 1.1, 1.4));
      P.hrx = bow * 0.25;
      if (c < 1.5) {
        P.alz = b.armOut * 0.5;
        P.arz = -b.armOut * 0.5;
      } else if (c < 2.8) {
        const u = smooth(c, 1.5, 2.6);
        const a = u * PI;
        P.arz = -b.armOut - sin(a) * 1.3;
        P.arx = -0.3 - cos(a) * 0.6;
        P.er = 0.2;
        P.bry = -sin(a) * 0.35;
        onHip('l');
        P.hrx = -0.1 * u;
      } else {
        const k = smooth(c, 2.8, 3.1);
        onHip('l');
        P.arz = -b.armOut - 0.25 * k;
        P.arx = -0.25;
        P.er = 0.6;
        P.hrx = -0.22 * k;
        P.hry = 0.2 * k;
        P.brx = -0.07 * k;
      }
      break;
    }
    case 'redcarpet': {
      // Posing for the cameras: a turn to one side with a paw on the hip and a look over the shoulder, a wave, the
      // other side, and a blown kiss.
      const c = d % 4;
      const side = c < 2 ? 1 : -1;
      const k = smooth(c % 2, 0, 0.3) * (1 - smooth(c % 2, 1.75, 2));
      P.bry = side * 0.45 * k;
      P.hry = -side * 0.35 * k;
      P.hrx = -0.1;
      P.brz = side * 0.04 * k;
      if (side > 0) {
        onHip('l');
        b.raise(P, 'r', b.headC.y + 0.05, 0.03 + sin(d * 9) * 0.04);
      } else {
        onHip('r');
        const m = b.mouth;
        const kiss = smooth(c, 2.3, 2.6) * (1 - smooth(c, 3, 3.3));
        b.reach(P, 'l', m.y + 0.02 * (1 - kiss), b.faceFront(m.y) + b.pawR + 0.03 + kiss * 0.2, atX(0.02 + kiss * 0.15), 'paw');
      }
      P.llz = 0.03 * side;
      P.lrz = 0.03 * side;
      break;
    }
    case 'encore': {
      // At the mic stand, paws round the mic, singing; a deep bow as the roses come in; up again and paws held
      // out to the crowd.
      const c = d % 5;
      const bow = smooth(c, 1.7, 2.1) * (1 - smooth(c, 3.2, 3.6));
      if (c < 1.8) {
        const m = b.mouth;
        b.reach(P, 'both', m.y - 0.02, b.faceFront(m.y) + b.pawR + 0.07, atX(sh.x * 0.6), 'paw');
        P.hrx = abs(sin(d * 7)) * 0.05 - 0.08;
        P.hry = sin(d * 2) * 0.1;
        P.by = abs(sin(d * 4)) * 0.01;
      } else if (c < 3.6) {
        P.alx = 0.25 + bow * 0.4;
        P.arx = 0.25 + bow * 0.4;
        P.alz = b.armOut + 0.4;
        P.arz = -b.armOut - 0.4;
        if (b.hasLegs && !b.floats) bendOver(bow * 0.7);
        else P.brx = bow * 0.5;
        P.hrx = bow * 0.2;
      } else {
        const k = smooth(c, 3.6, 3.9);
        P.alz = b.armOut + 0.9 * k;
        P.arz = -b.armOut - 0.9 * k;
        P.alx = P.arx = -0.5 * k;
        P.el = P.er = 0.2;
        P.hrx = -0.15 * k;
      }
      ears(0.15 * bow, 0);
      break;
    }
    case 'makeitrain': {
      // The wad held up to the side, the notes flicked off it with the thumb, the other paw on the hip, bouncing.
      const u = (d * 4) % 1;
      const flick = sin(u * PI) ** 2;
      b.reach(P, 'r', sh.y + 0.12, b.front + 0.1, atX(-0.18), 'paw');
      P.arz -= flick * 0.25;
      P.er += flick * 0.3;
      onHip('l');
      P.by = abs(sin(beat * PI)) * 0.03;
      P.hrx = -0.15;
      P.hry = -0.2 + sin(d * 1.5) * 0.15;
      P.bry = -0.12;
      P.try = sin(d * 6) * 0.5;
      break;
    }
    case 'jetpack': {
      // A crouch as it fires up, up into the air, a hover with a fist to the sky, and down for a careful landing.
      const c = d % 5;
      const h = jetHeight(top, c);
      P.by = h;
      const crouch = smooth(c, 0, 0.5) * (1 - smooth(c, 0.7, 0.9)) + smooth(c, 4.5, 4.7) * (1 - smooth(c, 4.8, 5));
      P.by -= crouch * 0.05;
      P.llx = P.lrx = -crouch * 0.4;
      P.brx = crouch * 0.12;
      if (c < 0.9 || c > 4.4) {
        P.alz = b.armOut + 0.5;
        P.arz = -b.armOut - 0.5;
        P.alx = P.arx = 0.2;
      } else {
        // Up and away: one fist punched up, the other arm back, legs together and a little tucked.
        b.raise(P, 'r', top + 0.15, 0.0);
        P.alz = b.armOut + 0.4;
        P.alx = 0.5;
        P.el = 0.6;
        P.llx = -0.15;
        P.lrx = 0.1;
        P.brz = sin(d * 3) * 0.05;
        P.bx = sin(d * 1.7) * 0.03;
        P.hrx = -0.15;
      }
      ears(-0.3 * min(1, h * 4), 0);
      break;
    }
    case 'djset': {
      // A headphone cup held to one ear, the other paw on the record, scratching, the head nodding hard on the
      // beat; every third bar, both paws up in the air for the crowd.
      const bar = beat % 6;
      const nod = abs(sin(beat * PI));
      P.hrx = nod * 0.25 - 0.05;
      P.by = -nod * 0.03;
      P.llx = P.lrx = -nod * 0.15;
      P.brx = nod * 0.05;
      if (bar < 4) {
        const ear = b.headC.y;
        b.reach(P, 'l', ear, b.headC.z, b.besideHead(-0.02), 'paw');
        const scratch = sin(d * 14) * 0.04;
        b.reach(P, 'r', hipY + (sh.y - hipY) * 0.7, b.front + b.pawR + 0.12 + scratch, atX(-0.21 * size), 'paw');
      } else {
        const pump = abs(sin(beat * PI * 2));
        b.raise(P, 'both', top + 0.04 + pump * 0.05, 0.05);
        P.hrx = -0.25;
      }
      P.try = sin(beat * PI) * 0.6;
      break;
    }
    case 'selfie': {
      // The stick held up and out in front, the face turned up to the phone, with a new pose for each flash:
      // a peace sign, a pout and head tilt, a big grin with the paw out.
      const c = d % 4;
      b.reach(P, 'r', top - 0.02, b.front + 0.18, atX(-0.06), 'paw');
      const which = Math.floor(c / (4 / 3));
      P.hrx = -0.3;
      P.hry = -0.15;
      if (which === 0) {
        b.raise(P, 'both', b.headC.y + 0.06, 0.02);
        b.reach(P, 'r', top - 0.02, b.front + 0.18, atX(-0.06), 'paw');
        P.hrz = 0.15;
      } else if (which === 1) {
        onHip('l');
        P.hrz = -0.25;
        P.brz = 0.06;
      } else {
        P.alz = b.armOut + 1.1;
        P.alx = -0.3;
        P.el = 0.2;
        P.hrz = 0.1;
        P.by = 0.02;
      }
      ears(-0.15, 0);
      break;
    }
    case 'excalibur': {
      // The sword brought up from the side and thrust straight at the sky, feet planted wide, the other fist
      // clenched; the lightning comes down on it (see the props) and it's held there, crackling.
      const c = d % 4;
      const up = smooth(c, 0.1, 0.7);
      if (up < 1) {
        P.arz = -b.armOut - up * 2.4;
        P.arx = -0.4 * up;
        P.er = 0.3 * (1 - up);
      }
      if (up > 0.6) b.raise(P, 'r', top + 0.3, 0.0);
      P.alz = b.armOut + 0.35;
      P.alx = 0.15;
      P.el = 1.3;
      P.llz = 0.18;
      P.lrz = -0.18;
      const jolt = c > 0.75 && c < 1.2 ? sin(c * 60) * 0.02 : 0;
      P.by = -0.02 + jolt;
      P.hrx = -0.28;
      P.brx = -0.08;
      ears(-0.3, 0);
      break;
    }
  }
}
