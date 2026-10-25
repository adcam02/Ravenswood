import * as THREE from 'three';
import type { Anim, HatId } from './types';

/**
 * The prestige hats' effects: the dearest hats in the shop and the hardest ones to earn each come with something
 * that follows whoever wears one (a golden glow, a ring of stars, rising embers), seen by everyone.
 *
 * Cheap to draw, since a dozen players might wear them at once: each layer is one draw call, motes are point sprites
 * moved entirely on the graphics card (no work per frame here beyond setting the time), nothing casts shadows and
 * nothing is a light. On low graphics there are fewer motes and no glow.
 */

/** What each effect is, for the shop and the wardrobe ("Comes with …"). */
export const HAT_FX: Partial<Record<HatId, string>> = {
  trophy: 'a golden glow and drifting gold sparkles',
  topper: 'a magician’s swirl of silver sparkles',
  tiara: 'a sprinkle of diamond glitter',
  centurion: 'a glowing ripple of glory at your feet',
  crown: 'a ring of little gold stars',
  witch: 'moons and stars drifting round you',
  mortarboard: 'a whizzing atom, for the brainy',
  knight: 'rose petals falling for the hero',
  pumpkin: 'spooky embers and a few bats',
  astronaut: 'a little planet in orbit',
};

let low = new URLSearchParams(location.search).get('fx') === 'low';
/** Low graphics (the engine's own setting, or ?fx=low): fewer motes, and no glow. */
export function setHatFxLow(on: boolean) {
  low = on;
}

// ---------------------------------------------------------------- the pictures each mote can be

/** The pictures on one sheet, four to a row, white (each mote is tinted its own colour). */
const GLYPH = { dot: 0, twinkle: 1, star: 2, moon: 3, petal: 4, ember: 5, gem: 6, planet: 7, bat: 8 } as const;

let atlas: THREE.Texture | null = null;
function glyphAtlas(): THREE.Texture {
  if (atlas) return atlas;
  const S = 64;
  const c = document.createElement('canvas');
  c.width = c.height = S * 4;
  const g = c.getContext('2d')!;
  const cell = (i: number, draw: () => void, glow = 6) => {
    g.save();
    g.translate((i % 4) * S + S / 2, Math.floor(i / 4) * S + S / 2);
    g.fillStyle = g.strokeStyle = '#fff';
    g.shadowColor = 'rgba(255,255,255,0.9)';
    g.shadowBlur = glow;
    draw();
    g.restore();
  };
  const poly = (pts: [number, number][]) => {
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fill();
  };
  const starPts = (n: number, r: number, inner: number, turn = -Math.PI / 2): [number, number][] =>
    Array.from({ length: n * 2 }, (_, i) => {
      const a = (i / (n * 2)) * Math.PI * 2 + turn;
      const rr = i % 2 ? inner : r;
      return [Math.cos(a) * rr, Math.sin(a) * rr];
    });
  // A soft round glow.
  cell(
    GLYPH.dot,
    () => {
      const grad = g.createRadialGradient(0, 0, 0, 0, 0, 28);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.25, 'rgba(255,255,255,0.8)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(-32, -32, 64, 64);
    },
    0,
  );
  // A four-pointed twinkle, long and thin.
  cell(GLYPH.twinkle, () => poly(starPts(4, 28, 5)), 8);
  cell(GLYPH.star, () => poly(starPts(5, 25, 11)), 6);
  // A crescent moon: a disc with a bite out of it.
  cell(GLYPH.moon, () => {
    g.beginPath();
    g.arc(0, 0, 22, 0, Math.PI * 2);
    g.fill();
    g.globalCompositeOperation = 'destination-out';
    g.shadowBlur = 0;
    g.beginPath();
    g.arc(10, -7, 19, 0, Math.PI * 2);
    g.fill();
  });
  // A petal: a teardrop, a little darker down the middle.
  cell(
    GLYPH.petal,
    () => {
      g.beginPath();
      g.moveTo(0, -24);
      g.bezierCurveTo(20, -12, 16, 16, 0, 24);
      g.bezierCurveTo(-16, 16, -20, -12, 0, -24);
      g.fill();
      g.shadowBlur = 0;
      g.fillStyle = 'rgba(0,0,0,0.18)';
      g.fillRect(-1.5, -16, 3, 34);
    },
    2,
  );
  // An ember: a flame-shaped drop with a bright heart.
  cell(
    GLYPH.ember,
    () => {
      const grad = g.createRadialGradient(0, 6, 0, 0, 4, 22);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.75)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(0, -26);
      g.bezierCurveTo(14, -6, 18, 10, 0, 22);
      g.bezierCurveTo(-18, 10, -14, -6, 0, -26);
      g.fill();
    },
    0,
  );
  // A cut gem: a long diamond with a bright facet.
  cell(GLYPH.gem, () => {
    poly([
      [0, -26],
      [15, 0],
      [0, 26],
      [-15, 0],
    ]);
  }, 8);
  // A ringed planet: a ball with a tilted ring round it.
  cell(GLYPH.planet, () => {
    g.beginPath();
    g.arc(0, 0, 15, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 4.5;
    g.beginPath();
    g.ellipse(0, 0, 28, 8, -0.35, 0.15, Math.PI - 0.15);
    g.stroke();
    g.globalAlpha = 0.6;
    g.beginPath();
    g.ellipse(0, 0, 28, 8, -0.35, Math.PI + 0.55, Math.PI * 2 - 0.55);
    g.stroke();
  });
  // A little bat, wings out.
  cell(
    GLYPH.bat,
    () => {
      g.beginPath();
      g.moveTo(0, -6);
      g.quadraticCurveTo(-10, -16, -28, -10);
      g.quadraticCurveTo(-22, -4, -24, 4);
      g.quadraticCurveTo(-16, -2, -12, 6);
      g.quadraticCurveTo(-6, 0, 0, 10);
      g.quadraticCurveTo(6, 0, 12, 6);
      g.quadraticCurveTo(16, -2, 24, 4);
      g.quadraticCurveTo(22, -4, 28, -10);
      g.quadraticCurveTo(10, -16, 0, -6);
      g.fill();
      // Ears.
      poly([
        [-5, -6],
        [-4, -14],
        [-1, -8],
        [1, -8],
        [4, -14],
        [5, -6],
      ]);
    },
    0,
  );
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  atlas = tex;
  return tex;
}

// ---------------------------------------------------------------- what each hat comes with

type Glyph = keyof typeof GLYPH;

/**
 * Motes: point sprites, each a little picture. 'rise' drifts them from `y` to `y1` (fractions of the head's height;
 * downwards if `y1` is lower, so they fall), born somewhere new round the wearer each time, swirling `swirl` radians
 * on the way and drawing in to `taper` of the way out by the end. 'orbit' circles them round at their own height and
 * tilt.
 */
interface Motes {
  kind: 'motes';
  mode: 'rise' | 'orbit';
  n: number;
  glyphs: Glyph[];
  colors: string[];
  /** Size across, in metres: smallest and largest. */
  size: [number, number];
  /** Seconds for one trip (or one way round), shortest and longest; less than 0 orbits the other way. */
  period: [number, number];
  /** How far out, in body radii: nearest and furthest. */
  out: [number, number];
  y: number;
  y1?: number;
  swirl?: number;
  taper?: number;
  /** How far they wander side to side as they go (metres). */
  drift?: number;
  /** How fast they turn (radians a second, either way). */
  spin?: number;
  /** How much they flicker (0 steady, 1 flaring in and out). */
  twinkle?: number;
  /** Orbits: tipped this far about the x and z axes (radians), and bobbing this much (metres). */
  tilt?: [number, number][];
  bob?: number;
  /** Orbits: each mote followed by this many smaller fading ones, a little behind (a comet's tail). */
  trail?: number;
  /** 'normal' for motes that are solid things (petals, bats) rather than light. */
  blend?: 'add' | 'normal';
  /** How strongly they show (1 fully). */
  strength?: number;
}
/** A soft glow standing behind the wearer, so it shows round their outline. */
interface Aura {
  kind: 'aura';
  color: string;
  strength: number;
}
/** A glow on the ground at their feet, and (`ring`) a ripple spreading out from it every so often. */
interface Pool {
  kind: 'pool';
  color: string;
  strength: number;
  ring?: { color: string; every: number };
}
type Layer = Motes | Aura | Pool;

const FX: Partial<Record<HatId, Layer[]>> = {
  // The Crown of Midas: the grandest. A warm golden glow round them and on the ground, and gold glints rising.
  trophy: [
    { kind: 'aura', color: '#ffd458', strength: 0.6 },
    { kind: 'pool', color: '#ffd65a', strength: 0.6 },
    { kind: 'motes', mode: 'rise', n: 24, glyphs: ['twinkle', 'twinkle', 'dot'], colors: ['#ffd84a', '#fff0a0', '#ffb52a'], size: [0.12, 0.21], period: [2.6, 4.2], out: [0.95, 1.35], y: 0.05, y1: 1.2, swirl: 0.9, drift: 0.04, spin: 1.2, twinkle: 0.7 },
  ],
  // The topper: a magician's swirl, silver and lilac sparkles spiralling up round them.
  topper: [
    { kind: 'motes', mode: 'rise', n: 22, glyphs: ['twinkle', 'star', 'dot'], colors: ['#f4f0ff', '#c29cff', '#9cd0ff'], size: [0.1, 0.18], period: [2.8, 3.6], out: [1.15, 1.3], y: 0.02, y1: 1.15, swirl: 7.5, taper: 0.55, spin: 2, twinkle: 0.6 },
  ],
  // The tiara: glitter falling softly round them, white, pink and ice blue, glinting as it turns.
  tiara: [
    { kind: 'motes', mode: 'rise', n: 24, glyphs: ['gem', 'twinkle', 'gem'], colors: ['#ffffff', '#ffb4e4', '#aeeaff'], size: [0.08, 0.14], period: [3.4, 5], out: [0.85, 1.3], y: 1.25, y1: 0.02, swirl: 0.6, drift: 0.06, spin: 2.5, twinkle: 0.85 },
  ],
  // The centurion: a ripple of red-gold glory spreading out from their feet, and a few sparks.
  centurion: [
    { kind: 'pool', color: '#ff8a3a', strength: 0.3, ring: { color: '#ffc84a', every: 2.4 } },
    { kind: 'motes', mode: 'rise', n: 10, glyphs: ['ember'], colors: ['#ffb84a', '#ff7a2a'], size: [0.09, 0.13], period: [1.8, 2.6], out: [0.7, 1.1], y: 0.0, y1: 0.6, drift: 0.03, twinkle: 0.3 },
  ],
  // The crown (ten gold stars): a ring of little gold stars turning slowly round them.
  crown: [
    {
      kind: 'motes',
      mode: 'orbit',
      n: 7,
      glyphs: ['star'],
      colors: ['#ffd23f', '#ffe27a'],
      size: [0.18, 0.2],
      period: [9, 9],
      out: [1.35, 1.35],
      y: 0.62,
      tilt: [[0.12, 0.05]],
      bob: 0.03,
      spin: 1.2,
      twinkle: 0.25,
    },
  ],
  // The witch's hat (ten nights): little moons and stars drifting up round them, night colours.
  witch: [
    { kind: 'pool', color: '#a07aff', strength: 0.25 },
    { kind: 'motes', mode: 'rise', n: 14, glyphs: ['moon', 'star', 'twinkle'], colors: ['#d0b2ff', '#a8ffd0', '#fff2a8'], size: [0.13, 0.2], period: [4, 6], out: [1.0, 1.35], y: 0.1, y1: 1.15, swirl: 1.6, drift: 0.05, spin: 0.6, twinkle: 0.4 },
  ],
  // The mortarboard (three stars at six jobs): an atom, three electrons whizzing round them on their own tilted orbits.
  mortarboard: [
    {
      kind: 'motes',
      mode: 'orbit',
      n: 3,
      glyphs: ['dot'],
      colors: ['#8ae8ff', '#b8f4ff', '#8ae8ff'],
      size: [0.21, 0.21],
      period: [1.4, 1.8],
      out: [1.3, 1.3],
      y: 0.6,
      tilt: [
        [0.8, 0.45],
        [-0.8, 0.45],
        [0.1, -0.6],
      ],
      trail: 6,
      twinkle: 0.15,
    },
  ],
  // The knight's helm (nominated three times and lived): rose petals falling for the hero.
  knight: [
    { kind: 'motes', mode: 'rise', n: 16, glyphs: ['petal'], colors: ['#ff4a62', '#ff7f96', '#e02a48', '#ffd1da'], size: [0.12, 0.17], period: [3.6, 5.5], out: [0.8, 1.35], y: 1.3, y1: 0.0, swirl: 1.2, drift: 0.12, spin: 2.2, blend: 'normal', strength: 0.95 },
  ],
  // The jack-o'-lantern (danced among the graves as a ghost): embers rising, some witch-fire green, and bats.
  pumpkin: [
    { kind: 'motes', mode: 'rise', n: 18, glyphs: ['ember', 'ember', 'dot'], colors: ['#ff8a1f', '#ffc23a', '#ff6a10', '#9cff5a'], size: [0.09, 0.17], period: [1.8, 3], out: [0.7, 1.15], y: 0.05, y1: 1.05, swirl: 0.8, drift: 0.05, twinkle: 0.5 },
    { kind: 'motes', mode: 'orbit', n: 3, glyphs: ['bat'], colors: ['#3a2a4a'], size: [0.18, 0.22], period: [4.5, 5.5], out: [1.5, 1.75], y: 0.95, tilt: [[0.15, 0], [-0.1, 0.12], [0.05, -0.15]], bob: 0.08, blend: 'normal', strength: 1 },
  ],
  // The astronaut's helmet (as high as you can go): a little ringed planet in orbit, and a scatter of stars.
  astronaut: [
    { kind: 'motes', mode: 'orbit', n: 1, glyphs: ['planet'], colors: ['#ffc98a'], size: [0.3, 0.3], period: [7, 7], out: [1.45, 1.45], y: 0.7, tilt: [[0.25, 0.1]], bob: 0.03 },
    { kind: 'motes', mode: 'orbit', n: 14, glyphs: ['twinkle', 'dot'], colors: ['#ffffff', '#bcd6ff', '#e4d4ff'], size: [0.065, 0.13], period: [-14, -18], out: [1.2, 1.7], y: 0.45, tilt: [[0.35, 0.2]], bob: 0.2, spin: 0.8, twinkle: 0.9 },
  ],
};

// ---------------------------------------------------------------- drawing them

const MOTE_VERT = /* glsl */ `
attribute vec4 aA;
attribute vec4 aB;
attribute vec3 aC;
attribute vec3 aCol;
uniform float uTime;
uniform float uH;
uniform float uR;
uniform float uHalfH;
uniform float uY0;
uniform float uY1;
uniform float uSwirl;
uniform float uTaper;
uniform float uDrift;
uniform float uSpin;
uniform float uTwinkle;
uniform float uBob;
varying vec3 vColor;
varying float vAlpha;
varying vec2 vCell;
varying float vSpin;
#include <fog_pars_vertex>
float hash(float n) { return fract(sin(n) * 43758.5453); }
void main() {
  float t = uTime;
  vec3 p;
  float alpha = 1.0;
#ifdef ORBIT
  // aA: angle, radii out, height (of the head's), seconds round. aC: tilt about x, about z, how far behind its leader.
  float a = aA.x + t * 6.2832 / aA.w - aC.z;
  vec3 q = vec3(cos(a), 0.0, sin(a)) * uR * aA.y;
  float cx = cos(aC.x), sx = sin(aC.x), cz = cos(aC.y), sz = sin(aC.y);
  q = vec3(q.x, q.y * cx - q.z * sx, q.y * sx + q.z * cx);
  q = vec3(q.x * cz - q.y * sz, q.x * sz + q.y * cz, q.z);
  p = q + vec3(0.0, aA.z * uH + sin(t * 1.3 + aA.x * 3.0) * uBob, 0.0);
  // (A trail fades behind its leader.)
  alpha = 1.0 - aC.z * 1.5;
#else
  // aA: angle, radii out, where it is in its trip to start with, seconds a trip. Born somewhere new each trip.
  float k = t / aA.w + aA.z;
  float u = fract(k);
  float n = floor(k);
  float a = aA.x + hash(n * 7.13 + aA.x) * 6.2832 + u * uSwirl;
  float r = uR * aA.y * (0.8 + 0.4 * hash(n * 3.71 + aA.z)) * mix(1.0, uTaper, u);
  float y = mix(uY0, uY1, u) * uH;
  // Kept further out passing in front of the face.
  float front = smoothstep(0.0, 0.7, sin(a));
  float face = 1.0 - smoothstep(0.0, 0.3 * uH, abs(y - 0.8 * uH));
  r *= 1.0 + 0.45 * front * face;
  p = vec3(cos(a) * r, y, sin(a) * r);
  p.x += sin(t * 1.3 + aA.x * 5.0) * uDrift;
  p.z += cos(t * 1.1 + aA.x * 3.0) * uDrift;
  alpha = smoothstep(0.0, 0.15, u) * (1.0 - smoothstep(0.65, 1.0, u));
#endif
  // aB: picture, size, turn rate, flicker rate.
  alpha *= 1.0 - uTwinkle + uTwinkle * (0.5 + 0.5 * sin(t * aB.w + aA.x * 11.0));
  vAlpha = alpha;
  vColor = aCol;
  vCell = vec2(mod(aB.x, 4.0), floor(aB.x / 4.0));
  vSpin = aB.z * uSpin * t + aA.x * 4.0;
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  // (The object's own scale, for a staged animal grown or shrunk.)
  float s = length(modelMatrix[0].xyz);
  gl_PointSize = aB.y * s * projectionMatrix[1][1] * uHalfH / max(0.1, -mvPosition.z);
  // (Never smaller than a few pixels, so they still read from across the square.)
  gl_PointSize = max(gl_PointSize, 4.0);
  #include <fog_vertex>
}
`;

/**
 * The end of each fragment shader: `gl_FragColor` holds the colour and `a` how strong it is. It's added as light, and
 * covers `uCover` of what's behind it as well (a little, so a glint keeps its colour against bright grass; fully, for
 * solid things like petals). Fog fades it away to nothing, rather than to the fog's colour.
 */
const FINISH = /* glsl */ `
  #include <colorspace_fragment>
  float fade = 1.0;
#ifdef USE_FOG
  #ifdef FOG_EXP2
    fade = exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
  #else
    fade = 1.0 - smoothstep(fogNear, fogFar, vFogDepth);
  #endif
#endif
  gl_FragColor = vec4(gl_FragColor.rgb * a * fade, a * fade * uCover);
`;

const MOTE_FRAG = /* glsl */ `
uniform sampler2D uAtlas;
uniform float uFade;
uniform float uCover;
varying vec3 vColor;
varying float vAlpha;
varying vec2 vCell;
varying float vSpin;
#include <fog_pars_fragment>
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float c = cos(vSpin), s = sin(vSpin);
  uv = mat2(c, -s, s, c) * uv * 1.06 + 0.5;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) discard;
  vec4 tex = texture2D(uAtlas, (vec2(vCell.x, 3.0 - vCell.y) + vec2(uv.x, 1.0 - uv.y)) / 4.0);
  float a = tex.a * vAlpha * uFade;
  if (a < 0.004) discard;
  // A whiter heart where it's brightest, so a glint reads as light.
  vec3 col = mix(vColor, vec3(1.0), pow(tex.a, 4.0) * 0.35 * BRIGHT) * tex.rgb;
  gl_FragColor = vec4(col, 1.0);
  ${FINISH}
}
`;

/** A square standing behind the wearer, facing the camera (pushed back from them, so they stand in front of it). */
const AURA_VERT = /* glsl */ `
uniform float uH;
uniform float uR;
varying vec2 vUv;
#include <fog_pars_vertex>
void main() {
  vUv = uv * 2.0 - 1.0;
  float s = length(modelMatrix[0].xyz);
  vec4 mvPosition = modelViewMatrix * vec4(0.0, uH * 0.52, 0.0, 1.0);
  // Back along the line from the camera (so it stays centred on them), grown to look the same size from there.
  float k = 1.0 + uR * 1.1 * s / max(0.5, length(mvPosition.xyz));
  mvPosition.xyz *= k;
  mvPosition.xy += position.xy * vec2(uR * 3.0, uH * 1.5) * s * k;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;
const AURA_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform float uStrength;
uniform float uTime;
uniform float uFade;
uniform float uCover;
varying vec2 vUv;
#include <fog_pars_fragment>
void main() {
  float d = length(vUv);
  float a = pow(smoothstep(1.0, 0.15, d), 1.5) * uStrength * uFade * (0.85 + 0.15 * sin(uTime * 1.6));
  gl_FragColor = vec4(uColor, 1.0);
  ${FINISH}
}
`;

/** A square on the ground at their feet: a soft glow, and a ripple going out from it. */
const POOL_VERT = /* glsl */ `
uniform float uR;
varying vec2 vUv;
#include <fog_pars_vertex>
void main() {
  vUv = uv * 2.0 - 1.0;
  vec4 mvPosition = modelViewMatrix * vec4(position.x * uR * 2.6, 0.03, -position.y * uR * 2.6, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;
const POOL_FRAG = /* glsl */ `
uniform vec3 uColor;
uniform vec3 uRing;
uniform float uStrength;
uniform float uEvery;
uniform float uTime;
uniform float uFade;
uniform float uCover;
varying vec2 vUv;
#include <fog_pars_fragment>
void main() {
  float d = length(vUv);
  float pool = pow(max(0.0, 1.0 - d / 0.62), 1.6) * uStrength;
  vec3 col = uColor * pool;
  float a = pool;
  if (uEvery > 0.0) {
    // The ripple: a bright band going out and fading as it goes.
    float u = fract(uTime / uEvery);
    float ring = exp(-pow((d - (0.2 + u * 0.78)) / 0.06, 2.0)) * (1.0 - u) * 1.3;
    col += uRing * ring;
    a += ring;
  }
  gl_FragColor = vec4(col / max(a, 0.001), 1.0);
  a *= uFade * (1.0 - smoothstep(0.92, 1.0, d));
  ${FINISH}
}
`;

/** Each hat's motes, made once and shared by everyone wearing it (they move in the shader). */
const moteGeos = new Map<string, THREE.BufferGeometry>();
let square: THREE.PlaneGeometry | null = null;

function moteGeo(key: string, m: Motes): THREE.BufferGeometry {
  const hit = moteGeos.get(key);
  if (hit) return hit;
  const trail = m.mode === 'orbit' ? (m.trail ?? 0) : 0;
  const count = m.n * (1 + trail);
  const A = new Float32Array(count * 4);
  const B = new Float32Array(count * 4);
  const C = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const rnd = (() => {
    let s = 0;
    for (const ch of key) s = (s * 31 + ch.charCodeAt(0)) | 0;
    return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  })();
  const lerp = ([a, b]: [number, number], k: number) => a + (b - a) * k;
  const c = new THREE.Color();
  let i = 0;
  for (let j = 0; j < m.n; j++) {
    const angle = m.mode === 'orbit' ? (j / m.n) * Math.PI * 2 : rnd() * Math.PI * 2;
    const out = lerp(m.out, rnd());
    const period = lerp(m.period, rnd());
    const glyph = GLYPH[m.glyphs[j % m.glyphs.length]];
    const size = lerp(m.size, rnd());
    const turn = (rnd() < 0.5 ? -1 : 1) * (0.5 + rnd());
    const flicker = 2 + rnd() * 3;
    const tilt = m.tilt?.[j % m.tilt.length] ?? [0, 0];
    c.set(m.colors[j % m.colors.length]);
    for (let k = 0; k <= trail; k++, i++) {
      // Spread evenly through their trips, so they don't all set off together.
      A.set([angle, out, m.mode === 'orbit' ? m.y : (j + rnd() * 0.5) / m.n, period], i * 4);
      B.set([glyph, size * (1 - k * 0.17), turn, flicker], i * 4);
      C.set([tilt[0], tilt[1], k * 0.1], i * 3);
      col.set([c.r, c.g, c.b], i * 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  g.setAttribute('aA', new THREE.BufferAttribute(A, 4));
  g.setAttribute('aB', new THREE.BufferAttribute(B, 4));
  g.setAttribute('aC', new THREE.BufferAttribute(C, 3));
  g.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
  // (Where they are is only worked out on the graphics card, so this is just generous.)
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 1, 0), 2.6);
  moteGeos.set(key, g);
  return g;
}

/** Light added over what's behind (see FINISH), and how much of that it covers, by layer. */
const LIGHT = { blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor } as const;
const COVER = { motes: 0.55, aura: 0.5, pool: 0.8 };

const fogUniforms = () => THREE.UniformsUtils.clone(THREE.UniformsLib.fog);

/** One wearer's effect: added to their rig, told the time and what they're doing each frame. */
export interface HatFx {
  /** Everything that floats with them (motes, the glow). */
  group: THREE.Group;
  /** What stays on the ground at their feet. */
  ground: THREE.Group;
  /** `t` is the rig's own time; sitting and lying down keep the glow off the ground. */
  update(t: number, anim: Anim, ghost: boolean): void;
  dispose(): void;
}

/**
 * The effect for a hat (null if it hasn't one), sized for a wearer `height` to the top of their head (not counting
 * the hat) and `radius` round.
 */
export function buildHatFx(hat: HatId, height: number, radius: number): HatFx | null {
  const layers = FX[hat];
  if (!layers) return null;
  const group = new THREE.Group();
  const ground = new THREE.Group();
  group.name = ground.name = 'hatFx';
  const mats: THREE.ShaderMaterial[] = [];
  const motes: { pts: THREE.Points; full: number }[] = [];
  const glows: THREE.Mesh[] = [];
  const pools: THREE.Mesh[] = [];
  const halfH = { value: 400 };
  const size = new THREE.Vector2();
  // (The pixels a metre makes depend on the picture's height, which only the renderer knows.)
  const measure = (renderer: THREE.WebGLRenderer) => {
    renderer.getDrawingBufferSize(size);
    halfH.value = size.y / 2;
  };
  layers.forEach((layer, li) => {
    const shared = { uTime: { value: 0 }, uH: { value: height }, uR: { value: radius }, uFade: { value: 1 }, uCover: { value: layer.kind === 'motes' && layer.blend === 'normal' ? 1 : COVER[layer.kind] } };
    if (layer.kind === 'motes') {
      const geo = moteGeo(`${hat}:${li}`, layer);
      const rise = layer.mode === 'rise';
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          ...fogUniforms(),
          ...shared,
          uHalfH: halfH,
          uAtlas: { value: glyphAtlas() },
          uY0: { value: layer.y },
          uY1: { value: layer.y1 ?? layer.y },
          uSwirl: { value: layer.swirl ?? 0 },
          uTaper: { value: layer.taper ?? 1 },
          uDrift: { value: layer.drift ?? 0 },
          uSpin: { value: layer.spin ?? 0 },
          uTwinkle: { value: layer.twinkle ?? 0 },
          uBob: { value: layer.bob ?? 0 },
        },
        vertexShader: MOTE_VERT,
        fragmentShader: MOTE_FRAG,
        defines: { ...(rise ? {} : { ORBIT: '' }), BRIGHT: layer.blend === 'normal' ? '0.0' : '1.0' },
        transparent: true,
        depthWrite: false,
        ...LIGHT,
        fog: true,
      });
      mat.uniforms.uFade.value = layer.strength ?? 1;
      mat.userData.strength = layer.strength ?? 1;
      const pts = new THREE.Points(geo, mat);
      pts.onBeforeRender = measure;
      pts.renderOrder = 2;
      group.add(pts);
      mats.push(mat);
      motes.push({ pts, full: geo.getAttribute('position').count });
    } else {
      square ??= new THREE.PlaneGeometry(1, 1);
      const aura = layer.kind === 'aura';
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          ...fogUniforms(),
          ...shared,
          uColor: { value: new THREE.Color(layer.color) },
          uStrength: { value: layer.strength },
          uRing: { value: new THREE.Color(layer.kind === 'pool' ? (layer.ring?.color ?? layer.color) : layer.color) },
          uEvery: { value: layer.kind === 'pool' ? (layer.ring?.every ?? 0) : 0 },
        },
        vertexShader: aura ? AURA_VERT : POOL_VERT,
        fragmentShader: aura ? AURA_FRAG : POOL_FRAG,
        transparent: true,
        depthWrite: false,
        ...LIGHT,
        fog: true,
      });
      mat.userData.strength = 1;
      const mesh = new THREE.Mesh(square, mat);
      // (Placed by its shader, so never culled, and never baked into an execution show's pieces.)
      mesh.frustumCulled = false;
      mesh.userData.noBake = true;
      mesh.renderOrder = aura ? 0 : 1;
      (aura ? group : ground).add(mesh);
      (aura ? glows : pools).push(mesh);
      mats.push(mat);
    }
  });
  return {
    group,
    ground,
    update(t, anim, ghost) {
      // (Wrapped now and then, so the time stays precise on the graphics card.)
      const tt = t % 1800;
      const fade = ghost ? 0.55 : 1;
      for (const m of mats) {
        m.uniforms.uTime.value = tt;
        m.uniforms.uFade.value = fade * m.userData.strength;
      }
      for (const { pts, full } of motes) pts.geometry.setDrawRange(0, low ? Math.ceil(full * 0.4) : full);
      for (const g of glows) g.visible = !low;
      // On the ground only while standing (not up on a seat), and not under a ghost.
      const standing = anim !== 'sit' && anim !== 'sleep' && !ghost;
      for (const p of pools) p.visible = !low && standing;
    },
    dispose() {
      group.removeFromParent();
      ground.removeFromParent();
      for (const m of mats) m.dispose();
    },
  };
}
