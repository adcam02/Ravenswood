import * as THREE from 'three';
import { Builder, soft } from './build';
import { DOMAIN_R, type DomainState } from './types';

/**
 * What an open Domain looks like (see game/domain.ts): a dome of night sky full of twinkling stars, darkest round
 * its edge so whoever is inside can still be made out, the same starry dark on the ground under it with a glowing
 * ring round the rim, and in the middle the grille of a little portable confession booth between its two sides.
 * It swells up out of the ground when it opens and shrinks away when it closes.
 */

const DOME_VERT = /* glsl */ `
  varying vec3 vDir;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vDir = position;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

/** Stars from a direction: a grid over the sphere, a star in some cells, each twinkling at its own pace. */
const STARS = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float stars(vec2 uv, float t) {
    vec2 cell = floor(uv);
    vec2 f = fract(uv) - 0.5;
    float h = hash(cell);
    if (h < 0.78) return 0.0;
    vec2 at = vec2(hash(cell + 3.1), hash(cell + 7.7)) - 0.5;
    float d = length(f - at * 0.6);
    float tw = 0.55 + 0.45 * sin(t * (1.5 + h * 3.0) + h * 40.0);
    return smoothstep(0.16, 0.0, d) * tw * (0.5 + (h - 0.78) * 2.2);
  }
`;

const DOME_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uOpen;
  varying vec3 vDir;
  varying vec3 vNormal;
  varying vec3 vView;
  ${STARS}
  void main() {
    vec3 dir = normalize(vDir);
    float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 1.6);
    vec2 uv = vec2(atan(dir.z, dir.x) * 7.0, dir.y * 14.0);
    float s = stars(uv + vec2(uTime * 0.05, 0.0), uTime) + stars(uv * 1.7 + 11.0, uTime * 1.3) * 0.7;
    // A slow purple and blue swirl through the dark.
    float swirl = 0.5 + 0.5 * sin(dir.x * 5.0 + dir.y * 3.0 + uTime * 0.4) * sin(dir.z * 4.0 - uTime * 0.3);
    vec3 sky = mix(vec3(0.02, 0.02, 0.09), vec3(0.16, 0.06, 0.32), swirl * 0.7 + rim * 0.3);
    vec3 col = sky + vec3(0.85, 0.9, 1.0) * s + vec3(0.35, 0.6, 1.0) * pow(rim, 3.0) * 0.6;
    float a = (0.22 + 0.68 * rim) + s * 0.6;
    gl_FragColor = vec4(col, clamp(a, 0.0, 0.95) * uOpen);
  }
`;

const FLOOR_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uOpen;
  varying vec3 vDir;
  ${STARS}
  void main() {
    // (On the floor, vDir is the point itself, from -1 to 1 across.)
    float r = length(vDir.xz);
    float s = stars(vDir.xz * 9.0, uTime) + stars(vDir.xz * 15.0 + 5.0, uTime * 1.2) * 0.6;
    float swirl = 0.5 + 0.5 * sin(atan(vDir.z, vDir.x) * 3.0 + r * 8.0 - uTime * 0.8);
    vec3 col = mix(vec3(0.02, 0.02, 0.08), vec3(0.12, 0.05, 0.26), swirl * 0.6) + vec3(0.9, 0.92, 1.0) * s;
    float a = smoothstep(1.0, 0.9, r) * 0.88;
    gl_FragColor = vec4(col, a * uOpen);
  }
`;

const RING_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uOpen;
  varying vec3 vDir;
  void main() {
    float pulse = 0.7 + 0.3 * sin(uTime * 2.4 + atan(vDir.z, vDir.x) * 3.0);
    gl_FragColor = vec4(vec3(0.45, 0.7, 1.0) * pulse, uOpen);
  }
`;

interface Shown {
  group: THREE.Group;
  uniforms: { uTime: { value: number }; uOpen: { value: number } };
  /** When it began opening, and closing (this page's clock, seconds). */
  born: number;
  dying: number | null;
  mats: THREE.Material[];
}

const OPEN_S = 0.7;
const CLOSE_S = 0.5;

export class DomainFx {
  private shown = new Map<string, Shown>();
  private dome = new THREE.SphereGeometry(1, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2);
  private floor = new THREE.CircleGeometry(1, 48).rotateX(-Math.PI / 2);
  private ring = new THREE.TorusGeometry(1, 0.012, 6, 64).rotateX(Math.PI / 2);
  private grille: THREE.BufferGeometry;
  private grilleMat = soft();

  constructor(private scene: THREE.Object3D) {
    // The booth's grille: a dark wooden frame, a lattice of brass across its window, and a little arch on top.
    const b = new Builder();
    const wood = '#4a301e';
    const brass = '#c8a24a';
    const box = new THREE.BoxGeometry(1, 1, 1);
    for (const z of [-0.55, 0.55]) b.add(box, wood, { pos: [0, 0.8, z], scale: [0.07, 1.6, 0.07] });
    b.add(box, wood, { pos: [0, 0.35, 0], scale: [0.05, 0.7, 1.1] });
    b.add(box, wood, { pos: [0, 1.58, 0], scale: [0.07, 0.07, 1.16] });
    b.add(box, wood, { pos: [0, 0.72, 0], scale: [0.07, 0.06, 1.16] });
    // A brass lattice across the window.
    for (let i = -3; i <= 3; i++) b.add(box, brass, { pos: [0, 1.15, i * 0.13], scale: [0.016, 0.8, 0.016] });
    for (let j = 0; j < 5; j++) b.add(box, brass, { pos: [0, 0.85 + j * 0.15, 0], scale: [0.016, 0.016, 1.04] });
    b.add(new THREE.TorusGeometry(0.55, 0.035, 6, 20, Math.PI), wood, { pos: [0, 1.6, 0], rot: [0, Math.PI / 2, 0] });
    b.add(new THREE.SphereGeometry(1, 8, 6), brass, { pos: [0, 2.17, 0], scale: 0.05 });
    box.dispose();
    this.grille = b.mesh(this.grilleMat).geometry;
  }

  /** How many domes are up (or still shrinking away). */
  get count() {
    return this.shown.size;
  }

  /** Keeps what's shown in step with the Domains open (`now` is this page's clock in seconds, `ground` the height there). */
  sync(list: DomainState[], t: number, ground: (x: number, z: number) => number) {
    for (const d of list) {
      if (this.shown.has(d.id)) continue;
      this.shown.set(d.id, this.make(d, t, ground(d.x, d.z)));
    }
    for (const [id, s] of this.shown) {
      if (s.dying === null && !list.some((d) => d.id === id)) s.dying = t;
    }
  }

  update(t: number) {
    for (const [id, s] of this.shown) {
      const k = s.dying !== null ? 1 - Math.min(1, (t - s.dying) / CLOSE_S) : Math.min(1, (t - s.born) / OPEN_S);
      if (s.dying !== null && k <= 0) {
        s.group.removeFromParent();
        for (const m of s.mats) m.dispose();
        this.shown.delete(id);
        continue;
      }
      // Overshooting a touch as it swells up.
      const e = s.dying !== null ? k * k : 1 - Math.pow(1 - k, 3) + Math.sin(k * Math.PI) * 0.08;
      s.group.scale.set(e, e, e);
      s.uniforms.uTime.value = t;
      s.uniforms.uOpen.value = Math.min(1, k * 1.4);
    }
  }

  private make(d: DomainState, t: number, y: number): Shown {
    const group = new THREE.Group();
    group.position.set(d.x, y, d.z);
    group.rotation.y = d.ry;
    const uniforms = { uTime: { value: t }, uOpen: { value: 0 } };
    const common = { uniforms, vertexShader: DOME_VERT, transparent: true, depthWrite: false };
    const domeMat = new THREE.ShaderMaterial({ ...common, fragmentShader: DOME_FRAG, side: THREE.DoubleSide });
    const floorMat = new THREE.ShaderMaterial({ ...common, fragmentShader: FLOOR_FRAG, polygonOffset: true, polygonOffsetFactor: -2 });
    const ringMat = new THREE.ShaderMaterial({ ...common, fragmentShader: RING_FRAG, blending: THREE.AdditiveBlending });
    const dome = new THREE.Mesh(this.dome, domeMat);
    dome.scale.set(DOMAIN_R, DOMAIN_R * 1.3, DOMAIN_R);
    // (Drawn after the floor and the people inside.)
    dome.renderOrder = 2;
    const floor = new THREE.Mesh(this.floor, floorMat);
    floor.scale.setScalar(DOMAIN_R);
    floor.position.y = 0.03;
    const ring = new THREE.Mesh(this.ring, ringMat);
    ring.scale.setScalar(DOMAIN_R);
    ring.position.y = 0.04;
    const grille = new THREE.Mesh(this.grille, this.grilleMat);
    grille.castShadow = true;
    for (const m of [dome, floor, ring]) m.castShadow = m.receiveShadow = false;
    group.add(floor, ring, grille, dome);
    this.scene.add(group);
    return { group, uniforms, born: t, dying: null, mats: [domeMat, floorMat, ringMat] };
  }

  dispose() {
    for (const s of this.shown.values()) {
      s.group.removeFromParent();
      for (const m of s.mats) m.dispose();
    }
    this.shown.clear();
    this.dome.dispose();
    this.floor.dispose();
    this.ring.dispose();
    this.grille.dispose();
    this.grilleMat.dispose();
  }
}
