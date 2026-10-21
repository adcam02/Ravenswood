import * as THREE from 'three';
import { mergeGeometries, toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

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
    const mesh = new THREE.Mesh(this.geometry(opts.crease), material);
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
 * How the animals are shaded. 'smooth' (the default) is the sculpted shapes smooth-shaded in a soft storybook
 * finish: painted bands of light with warm shadows, a gentle rim, round glossy eyes. 'card' (or 'paper') is the
 * flat-lit folded-card papercraft finish; 'toon' the same cel shading on the faceted cut, 'matte' plain and
 * 'shiny' the old glossy look. `?look=paper` (or card, toon, matte, shiny) switches it, for comparing.
 */
type CharacterLook = 'smooth' | 'card' | 'toon' | 'matte' | 'shiny';
const LOOK: CharacterLook = (() => {
  try {
    const v = new URLSearchParams(location.search).get('look');
    return v === 'paper' || v === 'card' ? 'card' : v === 'toon' || v === 'matte' || v === 'shiny' ? v : 'smooth';
  } catch {
    return 'smooth';
  }
})();
/** The default smooth finish (see LOOK): smooth normals, no facet jitter, the storybook material, cute faces. */
export const SMOOTH_LOOK = LOOK === 'smooth';

/**
 * A soft ramp from deep shadow up to a lit band that stops short of full brightness (so pale coats don't blow
 * out in daylight), with a gentle mid-tone between so the forms read as rounded. Linear filtering blends it.
 */
const RAMP = (() => {
  const data = new Uint8Array([80, 90, 108, 132, 158, 182, 200, 212, 218]);
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
        outgoingLight += diffuseColor.rgb * 0.04;
        // A soft rim in the animal's own colour, brightest at the silhouette.
        outgoingLight += mix(diffuseColor.rgb, vec3(1.0, 0.92, 0.8), 0.25) * pow(1.0 - facing, 2.8) * 0.24;
        ${wetGlint ? `
        // A little cartoon glint, as if fresh out of the water.
        // (Small and soft, and fainter on dark coats, where a white glint reads as a grey patch.)
        float glint = smoothstep(0.96, 0.985, dot(normal, normalize(vec3(-0.35, 0.6, 0.72))));
        outgoingLight += (diffuseColor.rgb * 0.3 + 0.06) * glint;` : ''}
      }
      #include <opaque_fragment>`,
    );
  };
  m.customProgramCacheKey = () => (wetGlint ? 'storybook-wet' : 'storybook');
  return m;
}

/**
 * Card: the material for the papercraft animals, built by hand with big flat facets. Matte, flat-lit, with a
 * faint paper grain and a touch of warm bounce so shadowed faces stay warm. `wetSheen` adds a soft glint for
 * aquatic animals (?look=paper).
 */
export function card(wetSheen = false): THREE.MeshLambertMaterial {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  m.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      `
      {
        float grain = fract(sin(dot(floor(gl_FragCoord.xy / 1.5), vec2(12.9898, 78.233))) * 43758.5453);
        outgoingLight *= 0.97 + grain * 0.06;
        outgoingLight += diffuseColor.rgb * 0.06;
        ${wetSheen ? `
        // Small and soft, and fainter on dark coats (where a white glint reads as a grey patch).
        float glint = smoothstep(0.965, 0.99, dot(normal, normalize(vec3(-0.35, 0.6, 0.72))));
        outgoingLight += (diffuseColor.rgb * 0.25 + 0.05) * glint;` : ''}
      }
      #include <opaque_fragment>`,
    );
  };
  m.customProgramCacheKey = () => (wetSheen ? 'card-wet' : 'card');
  return m;
}

/** The characters' material: the storybook finish (see LOOK above for the other looks, kept for comparing). */
export const soft = (): THREE.Material =>
  LOOK === 'card'
    ? card()
    : LOOK === 'matte'
      ? new THREE.MeshLambertMaterial({ vertexColors: true })
      : LOOK === 'shiny'
        ? new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82, metalness: 0 })
        : storybook(false);

/** Aquatic animals: the same, with a little wet glint (or the old glossy clearcoat with ?look=shiny). */
export const wet = (): THREE.Material =>
  LOOK === 'card'
    ? card(true)
    : LOOK === 'matte'
      ? new THREE.MeshLambertMaterial({ vertexColors: true })
      : LOOK === 'shiny'
        ? new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.28, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12 })
        : storybook(true);

/** Eyes: smooth and a little reflective, so the catchlights read as a shine (flat card with ?look=paper). */
export const eyeMaterial = (): THREE.Material =>
  SMOOTH_LOOK ? new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.22, metalness: 0.05 }) : card();

/** Things that glow on their own (lit windows, lanterns, the Storyteller). */
export const glow = (color: THREE.ColorRepresentation, intensity = 1) =>
  new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, flatShading: true, roughness: 1 });
