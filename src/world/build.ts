import * as THREE from 'three';
import { mergeGeometries, mergeVertices, toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier.js';

export type Vec3 = [number, number, number];

export interface Place {
  pos?: Vec3;
  /** Euler angles in radians, applied in XYZ order. */
  rot?: Vec3;
  scale?: number | Vec3;
}

const tmpColor = new THREE.Color();

export function placeMatrix(p: Place = {}): THREE.Matrix4 {
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...(p.rot ?? [0, 0, 0])));
  const s = typeof p.scale === 'number' ? new THREE.Vector3(p.scale, p.scale, p.scale) : new THREE.Vector3(...(p.scale ?? [1, 1, 1]));
  m.compose(new THREE.Vector3(...(p.pos ?? [0, 0, 0])), q, s);
  return m;
}

/**
 * Collects coloured, positioned primitives and merges them into one geometry with vertex colours, so a
 * whole building (or an animal's head) is a single draw call. Everything is flat shaded and low-poly.
 */
export class Builder {
  private parts: THREE.BufferGeometry[] = [];

  /** Adds a copy of `geo`, painted `color`, placed by `p` (or a matrix), optionally inside a parent matrix. */
  add(geo: THREE.BufferGeometry, color: THREE.ColorRepresentation, p: Place | THREE.Matrix4 = {}, parent?: THREE.Matrix4): this {
    let g = geo.index ? geo.toNonIndexed() : geo.clone();
    const m = p instanceof THREE.Matrix4 ? p.clone() : placeMatrix(p);
    if (parent) m.premultiply(parent);
    g.applyMatrix4(m);
    // Only position and colour are kept, so any primitive merges with any other.
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const clean = new THREE.BufferGeometry();
    clean.setAttribute('position', pos);
    tmpColor.set(color);
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      colors[i * 3] = tmpColor.r;
      colors[i * 3 + 1] = tmpColor.g;
      colors[i * 3 + 2] = tmpColor.b;
    }
    clean.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.dispose();
    g = clean;
    this.parts.push(g);
    return this;
  }

  /** Adds an already-coloured geometry from another builder. */
  addColored(geo: THREE.BufferGeometry, p: Place | THREE.Matrix4 = {}): this {
    const g = geo.clone();
    g.applyMatrix4(p instanceof THREE.Matrix4 ? p : placeMatrix(p));
    this.parts.push(g);
    return this;
  }

  get empty(): boolean {
    return this.parts.length === 0;
  }

  /**
   * The merged geometry. Normals are smoothed across edges gentler than `creaseDeg` (round things read as
   * smooth), and kept hard across sharper ones (boxes keep their corners). 0 gives flat facets everywhere.
   */
  geometry(creaseDeg = SMOOTH_DEG): THREE.BufferGeometry {
    let g = this.parts.length ? mergeGeometries(this.parts, false) ?? new THREE.BufferGeometry() : new THREE.BufferGeometry();
    for (const p of this.parts) p.dispose();
    this.parts = [];
    if (creaseDeg > 0 && g.getAttribute('position')?.count) {
      const smoothed = toCreasedNormals(g, THREE.MathUtils.degToRad(creaseDeg));
      g.dispose();
      g = smoothed;
    } else g.computeVertexNormals();
    g.computeBoundingSphere();
    return g;
  }

  mesh(material: THREE.Material, opts: { cast?: boolean; receive?: boolean; crease?: number } = {}): THREE.Mesh {
    const geo = material.userData.paper ? papercraft(this.geometry(0)) : this.geometry(opts.crease);
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = opts.cast ?? true;
    mesh.receiveShadow = opts.receive ?? true;
    return mesh;
  }
}

/** Deterministic random numbers, so the town looks the same on every screen. */
export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Nudges every vertex a little, for rocks, bushes and tree crowns that shouldn't look machine-made. */
export function jitter(geo: THREE.BufferGeometry, amount: number, seed = 1): THREE.BufferGeometry {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  const r = rng(seed);
  // Shared corners must move together or the faces split, so offsets are keyed by position.
  const seen = new Map<string, Vec3>();
  for (let i = 0; i < pos.count; i++) {
    const key = `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`;
    let o = seen.get(key);
    if (!o) {
      o = [(r() - 0.5) * amount, (r() - 0.5) * amount, (r() - 0.5) * amount];
      seen.set(key, o);
    }
    pos.setXYZ(i, pos.getX(i) + o[0], pos.getY(i) + o[1], pos.getZ(i) + o[2]);
  }
  pos.needsUpdate = true;
  return geo;
}

// ---------------------------------------------------------------- shared materials

/** Edges gentler than this are shaded smooth; sharper ones stay crisp. */
export const SMOOTH_DEG = 38;

/** The standard matte look, coloured by vertex, smooth where the geometry is round. */
export const matte = () => new THREE.MeshLambertMaterial({ vertexColors: true });

/**
 * How the animals are shaded. 'toon' (the default) is soft painted bands of light with warm shadows and a
 * gentle rim of light round the edges, like a storybook; 'matte' is plain and flat-lit; 'shiny' is the old
 * glossy look. `?look=matte` (or toon, shiny) switches it, for comparing.
 */
type CharacterLook = 'toon' | 'matte' | 'shiny' | 'paper';
const LOOK: CharacterLook = (() => {
  try {
    const v = new URLSearchParams(location.search).get('look');
    return v === 'matte' || v === 'shiny' || v === 'paper' ? v : 'toon';
  } catch {
    return 'toon';
  }
})();

/** A soft four-step ramp: deep shadow, shadow, half-lit, lit. Linear filtering softens the band edges. */
const RAMP = (() => {
  const data = new Uint8Array([118, 168, 222, 255]);
  const t = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  t.minFilter = THREE.LinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  return t;
})();

/**
 * Cel shading with life in it: the colour glows a touch in the shadows (so dark sides stay warm, not
 * muddy), a soft rim of the animal's own colour lights its edges, and wet animals get a cartoon glint.
 */
function storybook(wetGlint: boolean): THREE.MeshToonMaterial {
  const m = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: RAMP });
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      `
      {
        vec3 viewDir = normalize(vViewPosition);
        float facing = clamp(dot(normal, viewDir), 0.0, 1.0);
        // Warm bounce light: the colour itself, gently, everywhere.
        outgoingLight += diffuseColor.rgb * 0.07;
        // A soft rim in the animal's own colour, brightest at the silhouette.
        outgoingLight += mix(diffuseColor.rgb, vec3(1.0, 0.92, 0.8), 0.35) * pow(1.0 - facing, 2.6) * 0.42;
        ${wetGlint ? `
        // A little cartoon glint, as if fresh out of the water.
        float glint = smoothstep(0.955, 0.97, dot(normal, normalize(vec3(-0.35, 0.6, 0.72))));
        outgoingLight += vec3(1.0) * glint * 0.32;` : ''}
      }
      #include <opaque_fragment>`,
    );
  };
  m.customProgramCacheKey = () => (wetGlint ? 'storybook-wet' : 'storybook');
  return m;
}

/**
 * A papercraft sculpture: each part is simplified into big irregular flat facets (colour patches stay
 * separate, like cut card), lit flat and matte with a faint paper grain. A preview for now (?look=paper).
 */
function papercraft(geo: THREE.BufferGeometry): THREE.BufferGeometry {
  const plain = new THREE.BufferGeometry();
  plain.setAttribute('position', geo.getAttribute('position'));
  plain.setAttribute('color', geo.getAttribute('color'));
  const welded = mergeVertices(plain, 1e-4);
  const count = welded.getAttribute('position').count;
  // Keep about a sixth of the corners: big facets, the silhouette still reads.
  let out = count > 60 ? new SimplifyModifier().modify(welded, Math.floor(count * 0.84)) : welded;
  out = out.index ? out.toNonIndexed() : out;
  // A little variation in each facet's tone, as if each were a separate piece of card.
  const col = out.getAttribute('color') as THREE.BufferAttribute;
  for (let f = 0; f < col.count; f += 3) {
    const k = 1 + (Math.sin(f * 12.9898) * 43758.5453 - Math.floor(Math.sin(f * 12.9898) * 43758.5453) - 0.5) * 0.07;
    for (let v = 0; v < 3; v++) col.setXYZ(f + v, col.getX(f + v) * k, col.getY(f + v) * k, col.getZ(f + v) * k);
  }
  out.computeVertexNormals();
  out.computeBoundingSphere();
  geo.dispose();
  welded.dispose();
  return out;
}

function paperMaterial(): THREE.Material {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  m.userData.paper = true;
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      `
      {
        // A faint paper grain, fixed to the screen so it reads as the card's texture.
        float grain = fract(sin(dot(floor(gl_FragCoord.xy / 1.5), vec2(12.9898, 78.233))) * 43758.5453);
        outgoingLight *= 0.97 + grain * 0.06;
        outgoingLight += diffuseColor.rgb * 0.05;
      }
      #include <opaque_fragment>`,
    );
  };
  m.customProgramCacheKey = () => 'paper';
  return m;
}

/** The characters' material (see LOOK above). */
export const soft = (): THREE.Material =>
  LOOK === 'paper'
    ? paperMaterial()
    : LOOK === 'toon'
    ? storybook(false)
    : LOOK === 'matte'
      ? new THREE.MeshLambertMaterial({ vertexColors: true })
      : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0 });

/** Aquatic animals: the same, with a little wet glint (or the old glossy clearcoat with ?look=shiny). */
export const wet = (): THREE.Material =>
  LOOK === 'paper'
    ? paperMaterial()
    : LOOK === 'toon'
    ? storybook(true)
    : LOOK === 'matte'
      ? new THREE.MeshLambertMaterial({ vertexColors: true })
      : new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12 });

/** Things that glow on their own (lit windows, lanterns, the Storyteller). */
export const glow = (color: THREE.ColorRepresentation, intensity = 1) =>
  new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, flatShading: true, roughness: 1 });
