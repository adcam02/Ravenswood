import * as THREE from 'three';
import type { SlMachineView } from '../../casino/types';
import { SEVEN, SL, SYMBOLS } from '../../casino/slots';
import { SLOTS } from './casinoLayout';

/**
 * The moving parts of the casino's slot machines (the cabinets themselves are built with the room, in interiors.ts):
 * three reels behind a gold frame, the lever on the side, and a row of lamps over the reels that chase round on a
 * win. Everyone in the room sees the same pull: the view says what the reels stop on and when the lever went down
 * (host clock), and each screen turns them to that.
 */

/** Each machine's front is +z in its own frame; the reels sit in its window, the lever on its right-hand side (+x). */
export const REEL_Y = 1.18;
const REEL_R = 0.18;
const REEL_W = 0.15;
/** The drums stand a little out of the dark panel (its face is at z 0.32), the frame just in front of them. */
const REEL_Z = 0.185;
/** How far up and down the window opens (as far as the drums stand out of the panel). */
const OPEN = 0.12;
export const REEL_X = [-0.19, 0, 0.19];
const FACES = 10;
/** Each reel's symbols in order round the drum (every symbol at least once), each reel starting at a different place. */
const STRIP = [SEVEN, 0, 1, 2, 3, 1, 4, 2, 5, 0];
const stripOf = (reel: number) => STRIP.map((_, k) => STRIP[(k + reel * 3) % FACES]);
const LEVER = { x: 0.43, y: 0.95, pull: 1.15 };
const LAMPS = 5;

/** The symbols, side by side, each in a cell the shape of a face of the drum. */
function symbolAtlas(): THREE.CanvasTexture {
  const S = 128;
  const H = 96;
  const canvas = document.createElement('canvas');
  canvas.width = S * SYMBOLS.length;
  canvas.height = H;
  const g = canvas.getContext('2d')!;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  SYMBOLS.forEach((s, i) => {
    const x = i * S;
    g.fillStyle = '#fffaf0';
    g.fillRect(x, 0, S, H);
    // A soft shadow top and bottom, as on a curved reel.
    const shade = g.createLinearGradient(0, 0, 0, H);
    shade.addColorStop(0, 'rgba(60, 40, 30, 0.18)');
    shade.addColorStop(0.25, 'rgba(60, 40, 30, 0)');
    shade.addColorStop(0.75, 'rgba(60, 40, 30, 0)');
    shade.addColorStop(1, 'rgba(60, 40, 30, 0.18)');
    g.fillStyle = shade;
    g.fillRect(x, 0, S, H);
    if (i === SEVEN) {
      g.font = '900 84px Fredoka, "Trebuchet MS", sans-serif';
      g.lineWidth = 8;
      g.strokeStyle = '#d8b04a';
      g.strokeText('7', x + S / 2, H / 2 + 5);
      g.fillStyle = '#c8303a';
      g.fillText('7', x + S / 2, H / 2 + 5);
    } else {
      g.font = '66px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      g.fillStyle = '#1d1a24';
      g.fillText(s.glyph, x + S / 2, H / 2 + 5);
    }
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** A drum of FACES flat faces round the x axis, face k centred at angle k * 2π / FACES (0 faces +z), its symbol upright. */
function drumGeometry(strip: number[]): THREE.BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  const nor: number[] = [];
  const step = (Math.PI * 2) / FACES;
  const n = SYMBOLS.length;
  strip.forEach((sym, k) => {
    const a0 = k * step - step / 2;
    const a1 = k * step + step / 2;
    const corner = (x: number, a: number) => [x, Math.sin(a) * REEL_R, Math.cos(a) * REEL_R];
    const u0 = sym / n + 0.004;
    const u1 = (sym + 1) / n - 0.004;
    const quad = [
      [corner(-REEL_W / 2, a0), u0, 0],
      [corner(REEL_W / 2, a0), u1, 0],
      [corner(REEL_W / 2, a1), u1, 1],
      [corner(-REEL_W / 2, a1), u0, 1],
    ] as const;
    for (const i of [0, 1, 2, 0, 2, 3]) {
      const [p, u, v] = quad[i];
      pos.push(...p);
      uv.push(u, v);
      nor.push(0, Math.sin(k * step), Math.cos(k * step));
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return geo;
}

const easeOutBack = (p: number) => {
  const c = 1.2;
  return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
};
const smooth01 = (p: number) => (p <= 0 ? 0 : p >= 1 ? 1 : p * p * (3 - 2 * p));

interface Machine {
  drums: THREE.Mesh[];
  strips: number[][];
  lever: THREE.Group;
  lamps: THREE.Mesh[];
}

export interface SlotMachines {
  /** The machines as the host last said. */
  set(view: SlMachineView[] | null): void;
  /** Where everything is at this moment, on the host's clock (ms). */
  update(ms: number): void;
}

export function makeSlotMachines(group: THREE.Group): SlotMachines {
  const reelMat = new THREE.MeshLambertMaterial({ map: symbolAtlas(), emissive: '#ffffff', emissiveIntensity: 0.12 });
  // (The emissive map lights the symbols a little, as if lit from inside the cabinet.)
  reelMat.emissiveMap = reelMat.map;
  const gold = new THREE.MeshLambertMaterial({ color: '#d8b04a', emissive: '#5a4010', emissiveIntensity: 0.3 });
  const knob = new THREE.MeshLambertMaterial({ color: '#e0605a', emissive: '#3a0a08', emissiveIntensity: 0.4 });
  const lampOff = new THREE.MeshBasicMaterial({ color: '#8a6a3a' });
  const lampOn = ['#ffe08a', '#ff7a6a', '#8affc0', '#8ac8ff'].map((c) => new THREE.MeshBasicMaterial({ color: c }));
  const frameGeo = new THREE.BoxGeometry(1, 1, 1);
  const lampGeo = new THREE.SphereGeometry(0.018, 10, 6);
  const machines: Machine[] = SLOTS.map((at, i) => {
    const m = new THREE.Group();
    m.position.set(at.x, 0, at.z);
    m.rotation.y = -Math.PI / 2;
    group.add(m);
    const strips = REEL_X.map((_, r) => stripOf(r + i));
    const drums = REEL_X.map((x, r) => {
      const d = new THREE.Mesh(drumGeometry(strips[r]), reelMat);
      d.position.set(x, REEL_Y, REEL_Z);
      // To begin with, each machine shows a different (losing) line.
      d.rotation.x = ((r * 5 + i * 3) % FACES) * ((Math.PI * 2) / FACES);
      m.add(d);
      return d;
    });
    // The gold frame round the window, and the dividers between the reels, standing just proud of the drums.
    const bar = (w: number, h: number, x: number, y: number) => {
      const b = new THREE.Mesh(frameGeo, gold);
      b.scale.set(w, h, 0.05);
      b.position.set(x, REEL_Y + y, 0.35);
      m.add(b);
    };
    bar(0.64, 0.035, 0, OPEN + 0.0175);
    bar(0.64, 0.035, 0, -OPEN - 0.0175);
    for (const sx of [-1, 1]) bar(0.035, OPEN * 2 + 0.07, sx * 0.3025, 0);
    for (const sx of [-1, 1]) bar(0.03, OPEN * 2, sx * 0.095, 0);
    // The pay line's little arrows, either side.
    for (const sx of [-1, 1]) {
      const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.04, 3), knob);
      arrow.rotation.z = sx * (Math.PI / 2);
      arrow.position.set(sx * 0.345, REEL_Y, 0.36);
      m.add(arrow);
    }
    const lamps = Array.from({ length: LAMPS }, (_, k) => {
      const l = new THREE.Mesh(lampGeo, lampOff);
      l.position.set((k - (LAMPS - 1) / 2) * 0.12, REEL_Y + OPEN + 0.055, 0.34);
      m.add(l);
      return l;
    });
    // The lever: a gold rod with a red knob, pivoting at its foot on the right-hand side of the cabinet.
    const lever = new THREE.Group();
    lever.position.set(LEVER.x, LEVER.y, 0);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 0.4, 8), gold);
    rod.position.y = 0.2;
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 10), knob);
    ball.position.y = 0.42;
    lever.add(rod, ball);
    m.add(lever);
    return { drums, strips, lever, lamps };
  });

  let view: SlMachineView[] | null = null;
  /** Which face each reel last came to rest on, so the next spin starts from there. */
  const rest = machines.map((m) => m.drums.map((d) => d.rotation.x));
  const settledNo = machines.map(() => -1);
  const step = (Math.PI * 2) / FACES;

  return {
    set(v) {
      view = v;
    },
    update(ms) {
      machines.forEach((m, i) => {
        const spin = view?.[i]?.spin ?? null;
        const t0 = spin ? spin.at : 0;
        // The lever goes down as the pull starts and springs back as the reels set off.
        let lever = 0;
        if (spin && ms >= t0 - SL.pullMs && ms < t0 + 450) lever = ms < t0 ? smooth01((ms - (t0 - SL.pullMs)) / SL.pullMs) : 1 - smooth01((ms - t0) / 450);
        m.lever.rotation.x = lever * LEVER.pull;
        if (!spin) return;
        m.drums.forEach((d, r) => {
          // A face showing this reel's symbol, picked by the pull's number so the drums don't always stop the same way.
          const faces = m.strips[r].map((s, k) => (s === spin.reels[r] ? k : -1)).filter((k) => k >= 0);
          const face = faces[(spin.no + r) % faces.length];
          const from = rest[i][r];
          // The drum's angle at rest on that face, a few whole turns on from where it was (they roll downwards).
          const turns = 3 + r;
          const target = face * step + Math.ceil((from - face * step) / (Math.PI * 2)) * Math.PI * 2 + turns * Math.PI * 2;
          const stop = t0 + SL.stops[r];
          if (ms <= t0) d.rotation.x = from;
          else if (ms >= stop) d.rotation.x = target;
          else d.rotation.x = from + (target - from) * Math.min(1.02, easeOutBack((ms - t0) / (stop - t0)));
        });
        const done = t0 + SL.stops[SL.stops.length - 1];
        if (ms >= done && settledNo[i] !== spin.no) {
          settledNo[i] = spin.no;
          m.drums.forEach((d, r) => (rest[i][r] = d.rotation.x % (Math.PI * 2)));
        }
        // On a win the lamps chase round (all colours, and faster, for the jackpot) for a few seconds after the stop.
        const winning = spin.won > 0 && ms >= done && ms < done + SL.winMs;
        const jackpot = spin.won >= spin.bet * 100;
        const beat = Math.floor((ms - done) / (jackpot ? 90 : 160));
        m.lamps.forEach((l, k) => {
          l.material = !winning ? lampOff : jackpot ? lampOn[(beat + k) % lampOn.length] : (beat + k) % 2 ? lampOn[0] : lampOff;
        });
      });
    },
  };
}
