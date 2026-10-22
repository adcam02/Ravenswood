import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { rng } from '../build';

/**
 * Touches that make the town feel solid and alive, all drawn on this screen only and sized once when the town is
 * built: soft contact shadows where things meet the ground, cloud shadows drifting over, puddles in the rain, dust
 * kicked up on the paths, and sunbeams through the church windows.
 */

// ---------------------------------------------------------------- contact shadows

/** Something standing on the ground: a box (`hw` by `hd`, turned `rot`) or a round footprint. */
export interface Footprint {
  x: number;
  z: number;
  /** Height of the surface it stands on. */
  y: number;
  hw: number;
  hd: number;
  rot: number;
  round: boolean;
  /** How far out the shadow fades, in metres. */
  soft: number;
  /** How dark it is at the edge of the footprint, 0 to 1. */
  strength: number;
}

/**
 * Soft darkening on the ground round everything standing on it, the way light can't quite reach where a wall meets
 * the ground. One draw for a whole place. It sits a few centimetres up, so paths and rugs don't cover it.
 */
export function makeContactShadows(list: Footprint[], lift = 0.03): THREE.Mesh {
  const quad = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = quad.index;
  geo.setAttribute('position', quad.getAttribute('position'));
  const centre = new Float32Array(list.length * 3);
  const box = new Float32Array(list.length * 4);
  const turn = new Float32Array(list.length * 2);
  list.forEach((f, i) => {
    centre.set([f.x, f.y + lift, f.z], i * 3);
    box.set([f.hw, f.hd, f.soft, f.strength], i * 4);
    turn.set([f.rot, f.round ? 1 : 0], i * 2);
  });
  geo.setAttribute('aCentre', new THREE.InstancedBufferAttribute(centre, 3));
  geo.setAttribute('aBox', new THREE.InstancedBufferAttribute(box, 4));
  geo.setAttribute('aTurn', new THREE.InstancedBufferAttribute(turn, 2));
  geo.instanceCount = list.length;
  const material = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uColor: { value: new THREE.Color('#1c140e') } }]),
    vertexShader: /* glsl */ `
      attribute vec3 aCentre;
      attribute vec4 aBox;
      attribute vec2 aTurn;
      varying vec2 vP;
      varying vec4 vBox;
      varying float vRound;
      varying float vDepth;
      void main() {
        // The quad covers the footprint and its soft edge; vP is in metres from the middle, along the footprint.
        vP = position.xy * 2.0 * (aBox.xy + aBox.z);
        float c = cos(aTurn.x);
        float s = sin(aTurn.x);
        vec3 world = aCentre + vec3(vP.x * c + vP.y * s, 0.0, -vP.x * s + vP.y * c);
        vBox = aBox;
        vRound = aTurn.y;
        vec4 mv = modelViewMatrix * vec4(world, 1.0);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      #ifdef USE_FOG
        uniform float fogNear;
        uniform float fogFar;
      #endif
      varying vec2 vP;
      varying vec4 vBox;
      varying float vRound;
      varying float vDepth;
      void main() {
        float d;
        if (vRound > 0.5) d = max(length(vP / vBox.xy) - 1.0, 0.0) * min(vBox.x, vBox.y);
        else d = length(max(abs(vP) - vBox.xy, 0.0));
        float k = 1.0 - clamp(d / vBox.z, 0.0, 1.0);
        float a = vBox.w * k * k;
        #ifdef USE_FOG
          a *= 1.0 - smoothstep(fogNear, fogFar, vDepth);
        #endif
        if (a < 0.003) discard;
        gl_FragColor = vec4(uColor, a);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: true,
  });
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 1;
  mesh.name = 'contact-shadows';
  return mesh;
}

// ---------------------------------------------------------------- clouds

/** A tiling map of soft cloud shapes: bright where a cloud is. */
function cloudMap(size = 256): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.fillStyle = '#000';
  g.fillRect(0, 0, size, size);
  const r = rng(41);
  for (let i = 0; i < 9; i++) {
    // A cloud is a cluster of soft puffs; each is drawn at its wrapped copies too, so the map tiles.
    const cx = r() * size;
    const cy = r() * size;
    for (let k = 0; k < 6; k++) {
      const x = cx + (r() - 0.5) * size * 0.16;
      const y = cy + (r() - 0.5) * size * 0.1;
      const rad = size * (0.04 + r() * 0.05);
      for (const ox of [-size, 0, size]) {
        for (const oy of [-size, 0, size]) {
          const grad = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad);
          grad.addColorStop(0, 'rgba(255,255,255,0.75)');
          grad.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = grad;
          g.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2);
        }
      }
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** Shared by everything the clouds' shadows fall on: the map, how far it has drifted, and how strong it is. */
export const cloudUniforms = {
  uCloudMap: { value: null as THREE.Texture | null },
  uCloudShift: { value: new THREE.Vector2() },
  uCloudK: { value: 0 },
};

/**
 * Lets the clouds' shadows fall on a material: only the direct sunlight dims under a cloud, as it would. Keeps any
 * change the material already makes to its shader (such as swaying).
 */
export function addCloudShadow<M extends THREE.Material>(mat: M): M {
  // Many meshes share a material: it must only be changed once.
  if (mat.userData.cloudShadow) return mat;
  mat.userData.cloudShadow = true;
  cloudUniforms.uCloudMap.value ??= cloudMap();
  const before = mat.onBeforeCompile;
  const key = mat.customProgramCacheKey.bind(mat);
  mat.onBeforeCompile = (shader, renderer) => {
    before.call(mat, shader, renderer);
    shader.uniforms.uCloudMap = cloudUniforms.uCloudMap;
    shader.uniforms.uCloudShift = cloudUniforms.uCloudShift;
    shader.uniforms.uCloudK = cloudUniforms.uCloudK;
    shader.vertexShader = `varying vec2 vCloudP;\n${shader.vertexShader}`.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
      vCloudP = (modelMatrix * vec4(transformed, 1.0)).xz;`,
    );
    shader.fragmentShader = `uniform sampler2D uCloudMap;\nuniform vec2 uCloudShift;\nuniform float uCloudK;\nvarying vec2 vCloudP;\n${shader.fragmentShader}`.replace(
      '#include <lights_fragment_end>',
      `#include <lights_fragment_end>
      {
        float cloud = texture2D(uCloudMap, vCloudP * 0.011 + uCloudShift).r;
        float shade = 1.0 - uCloudK * smoothstep(0.18, 0.6, cloud);
        reflectedLight.directDiffuse *= shade;
        reflectedLight.directSpecular *= shade;
      }`,
    );
  };
  mat.customProgramCacheKey = () => `${key()}|cloud`;
  return mat;
}

export interface Clouds {
  group: THREE.Group;
  /** Drifts them along; `day` (0 to 1) is how much they and their shadows show, less at night and in rain. */
  update(dt: number, day: number, show: boolean): void;
}

/** A few puffy clouds drifting high over the town, and their shadows sliding over the ground. */
export function makeClouds(n = 9): Clouds {
  const group = new THREE.Group();
  group.name = 'clouds';
  const material = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#c8d4e0', emissiveIntensity: 0.35, transparent: true, opacity: 0.95, fog: false, flatShading: true });
  const r = rng(61);
  const puff = new THREE.IcosahedronGeometry(1, 1);
  const m4 = new THREE.Matrix4();
  // Each cloud is a few lumps merged into one mesh.
  const clouds = Array.from({ length: n }, () => {
    const lumps = 4 + Math.floor(r() * 3);
    const parts = Array.from({ length: lumps }, (_, k) => {
      const s = 4 + r() * 4;
      return puff.clone().applyMatrix4(m4.compose(new THREE.Vector3((k - lumps / 2) * 4.5 + (r() - 0.5) * 2, (r() - 0.3) * 2.5, (r() - 0.5) * 5), new THREE.Quaternion(), new THREE.Vector3(s * 1.2, s * 0.7, s)));
    });
    const cloud = new THREE.Mesh(mergeGeometries(parts) ?? puff, material);
    for (const g of parts) g.dispose();
    const a = r() * Math.PI * 2;
    const d = 70 + r() * 110;
    cloud.position.set(Math.cos(a) * d, 48 + r() * 22, Math.sin(a) * d);
    group.add(cloud);
    return cloud;
  });
  // The shadows drift the same way as the clouds, slowly.
  const WIND = new THREE.Vector2(1.1, 0.35);
  const SPAN = 360;
  return {
    group,
    update(dt, day, show) {
      group.visible = show && day > 0.02;
      material.opacity = 0.95 * day;
      cloudUniforms.uCloudK.value = 0.32 * day;
      // Moving the map back moves the shadows forward, at the clouds' speed.
      const shift = cloudUniforms.uCloudShift.value;
      shift.set((shift.x - WIND.x * 0.9 * 0.011 * dt) % 1, (shift.y - WIND.y * 0.9 * 0.011 * dt) % 1);
      if (!group.visible) return;
      for (const c of clouds) {
        c.position.x += WIND.x * 0.9 * dt;
        c.position.z += WIND.y * 0.9 * dt;
        if (c.position.x > SPAN / 2) c.position.x -= SPAN;
        if (c.position.z > SPAN / 2) c.position.z -= SPAN;
      }
    },
  };
}

// ---------------------------------------------------------------- puddles

export interface PuddleSpot {
  x: number;
  y: number;
  z: number;
  /** Size across, in metres. */
  r: number;
}

export interface Puddles {
  mesh: THREE.Mesh;
  /** `wet` 0 to 1 is how far they've filled; `rain` 0 to 1 sets the rings from the drops. */
  set(wet: number, rain: number, time: number, sky: THREE.Color): void;
}

/** Puddles that spread in the rain and shrink away after it: dark water showing the sky, with rings from the drops. */
export function makePuddles(spots: PuddleSpot[]): Puddles {
  const quad = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = quad.index;
  geo.setAttribute('position', quad.getAttribute('position'));
  const centre = new Float32Array(spots.length * 3);
  const shape = new Float32Array(spots.length * 3);
  const r = rng(83);
  spots.forEach((s, i) => {
    centre.set([s.x, s.y, s.z], i * 3);
    shape.set([s.r, 0.55 + r() * 0.45, r() * 100], i * 3);
  });
  geo.setAttribute('aCentre', new THREE.InstancedBufferAttribute(centre, 3));
  geo.setAttribute('aShape', new THREE.InstancedBufferAttribute(shape, 3));
  geo.instanceCount = spots.length;
  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    { uWet: { value: 0 }, uRain: { value: 0 }, uTime: { value: 0 }, uSky: { value: new THREE.Color('#9fb4c4') } },
  ]);
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      attribute vec3 aCentre;
      attribute vec3 aShape;
      varying vec2 vP;
      varying float vSeed;
      varying float vDepth;
      void main() {
        float c = cos(aShape.z);
        float s = sin(aShape.z);
        vec2 p = position.xy * aShape.x;
        p.y *= aShape.y;
        vP = position.xy;
        vSeed = aShape.z;
        vec3 world = aCentre + vec3(p.x * c - p.y * s, 0.0, p.x * s + p.y * c);
        vec4 mv = modelViewMatrix * vec4(world, 1.0);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uWet;
      uniform float uRain;
      uniform float uTime;
      uniform vec3 uSky;
      #ifdef USE_FOG
        uniform float fogNear;
        uniform float fogFar;
      #endif
      varying vec2 vP;
      varying float vSeed;
      varying float vDepth;
      float hash(float n) { return fract(sin(n) * 43758.5453); }
      void main() {
        // A lumpy outline that grows as the puddle fills.
        float ang = atan(vP.y, vP.x);
        float edge = 0.4 * (1.0 + 0.16 * sin(3.0 * ang + vSeed) + 0.09 * sin(5.0 * ang + vSeed * 1.7));
        float rho = length(vP) / edge;
        float size = mix(0.35, 1.0, uWet);
        float a = 1.0 - smoothstep(size - 0.18, size, rho);
        a *= smoothstep(0.0, 0.25, uWet);
        if (a < 0.01) discard;
        // Dark water with a little of the sky in it, brighter towards the far side and along the rim.
        vec3 col = mix(vec3(0.025, 0.03, 0.038), uSky, 0.12 + 0.14 * clamp(0.5 - vP.y, 0.0, 1.0));
        col += vec3(0.05) * smoothstep(size - 0.22, size - 0.08, rho) * (1.0 - smoothstep(size - 0.08, size, rho));
        // Rings from the raindrops.
        float rings = 0.0;
        for (int k = 0; k < 3; k++) {
          float fk = float(k);
          float t = uTime * 0.9 + hash(vSeed + fk * 7.1);
          float cycle = floor(t);
          float ph = fract(t);
          vec2 c = vec2(hash(vSeed + fk * 3.3 + cycle * 1.7), hash(vSeed + fk * 5.9 + cycle * 2.3)) - 0.5;
          float d = length(vP - c * size * 0.8);
          rings += (1.0 - ph) * (1.0 - smoothstep(0.0, 0.025, abs(d - ph * 0.3)));
        }
        col += vec3(0.22) * rings * uRain;
        #ifdef USE_FOG
          a *= 1.0 - smoothstep(fogNear, fogFar, vDepth);
        #endif
        gl_FragColor = vec4(col, a * 0.7);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: true,
  });
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 2;
  mesh.name = 'puddles';
  mesh.visible = false;
  return {
    mesh,
    set(wet, rain, time, sky) {
      mesh.visible = wet > 0.01;
      uniforms.uWet.value = wet;
      uniforms.uRain.value = rain;
      uniforms.uTime.value = time;
      (uniforms.uSky.value as THREE.Color).copy(sky);
    },
  };
}

// ---------------------------------------------------------------- dust

export interface Dust {
  points: THREE.Points;
  /** A little puff at someone's feet. */
  puff(x: number, y: number, z: number): void;
  /** `light` dims the dust at night. */
  update(dt: number, light: number): void;
}

/** Little puffs of dust kicked up on the dirt paths: a fixed handful, reused as they fade. */
export function makeDust(n = 48, color = '#d9c7a4'): Dust {
  const pos = new Float32Array(n * 3);
  const life = new Float32Array(n).fill(1);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aLife', new THREE.BufferAttribute(life, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  const uniforms = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uColor: { value: new THREE.Color(color) }, uLight: { value: 1 }, uHeight: { value: 800 } }]);
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      attribute float aLife;
      uniform float uHeight;
      varying float vLife;
      varying float vDepth;
      void main() {
        vLife = aLife;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        // The puff's size in metres, as pixels at this distance.
        float metres = 0.25 + 0.55 * aLife;
        gl_PointSize = aLife >= 1.0 ? 0.0 : metres * projectionMatrix[1][1] * uHeight * 0.5 / max(1.0, -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uLight;
      #ifdef USE_FOG
        uniform float fogNear;
        uniform float fogFar;
      #endif
      varying float vLife;
      varying float vDepth;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float a = (1.0 - smoothstep(0.3, 1.0, d)) * 0.42 * (1.0 - vLife) * smoothstep(0.0, 0.08, vLife);
        #ifdef USE_FOG
          a *= 1.0 - smoothstep(fogNear, fogFar, vDepth);
        #endif
        if (a < 0.01) discard;
        gl_FragColor = vec4(uColor * uLight, a);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    fog: true,
  });
  const points = new THREE.Points(geo, material);
  points.frustumCulled = false;
  points.renderOrder = 3;
  points.name = 'dust';
  const view = new THREE.Vector2();
  points.onBeforeRender = (renderer) => {
    uniforms.uHeight.value = renderer.getDrawingBufferSize(view).y;
  };
  const drift = new Float32Array(n * 2);
  let next = 0;
  const r = rng(97);
  return {
    points,
    puff(x, y, z) {
      const i = next;
      next = (next + 1) % n;
      pos.set([x + (r() - 0.5) * 0.2, y + 0.08, z + (r() - 0.5) * 0.2], i * 3);
      drift.set([(r() - 0.5) * 0.5, (r() - 0.5) * 0.5], i * 2);
      life[i] = 0;
    },
    update(dt, light) {
      uniforms.uLight.value = light;
      let any = false;
      for (let i = 0; i < n; i++) {
        if (life[i] >= 1) continue;
        any = true;
        life[i] = Math.min(1, life[i] + dt / 0.9);
        pos[i * 3] += drift[i * 2] * dt;
        pos[i * 3 + 1] += 0.3 * dt;
        pos[i * 3 + 2] += drift[i * 2 + 1] * dt;
      }
      points.visible = any;
      if (!any) return;
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aLife.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------- sunbeams

/** Shared by the sunbeams indoors: how bright the day outside is. */
export const beamUniforms = { uBeam: { value: 0 } };

/**
 * The material for sunbeams falling through a window: added light, fading along the beam (v, 0 at the window) and
 * softly at its sides (u). Its brightness follows the day outside.
 */
export function beamMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { uBeam: beamUniforms.uBeam },
    vertexShader: /* glsl */ `
      attribute vec3 color;
      varying vec2 vUv;
      varying vec3 vColor;
      void main() {
        vUv = uv;
        vColor = color;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uBeam;
      varying vec2 vUv;
      varying vec3 vColor;
      void main() {
        float side = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
        float along = (1.0 - 0.65 * vUv.y) * smoothstep(0.0, 0.08, vUv.y);
        gl_FragColor = vec4(vColor * side * along * uBeam, 1.0);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

/**
 * A sunbeam's faces, from a window to the floor: `corners` are the window's corners (in order round it), `dir` the
 * way the light travels. Each side of the beam is a quad with u across it and v along it; the patch of light it makes
 * on the floor is added too.
 */
export function beamGeometry(beams: { corners: THREE.Vector3[]; dir: THREE.Vector3; color: THREE.Color; floorGlow: number }[]): THREE.BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  const col: number[] = [];
  const push = (p: THREE.Vector3, u: number, v: number, c: THREE.Color, k = 1) => {
    pos.push(p.x, p.y, p.z);
    uv.push(u, v);
    col.push(c.r * k, c.g * k, c.b * k);
  };
  for (const b of beams) {
    // Where each corner's ray meets the floor.
    const ends = b.corners.map((c) => c.clone().addScaledVector(b.dir, c.y / -b.dir.y));
    const sides = b.corners.length;
    for (let k = 0; k < sides; k++) {
      const n = (k + 1) % sides;
      const [a0, a1, e1, e0] = [b.corners[k], b.corners[n], ends[n], ends[k]];
      push(a0, 0, 0, b.color);
      push(a1, 1, 0, b.color);
      push(e1, 1, 1, b.color);
      push(a0, 0, 0, b.color);
      push(e1, 1, 1, b.color);
      push(e0, 0, 1, b.color);
    }
    // The bright patch on the floor, just above it.
    const f = ends.map((e) => new THREE.Vector3(e.x, 0.055, e.z));
    for (let k = 1; k < sides - 1; k++) {
      push(f[0], 0.5, 0.2, b.color, b.floorGlow);
      push(f[k], 0.5, 0.2, b.color, b.floorGlow);
      push(f[k + 1], 0.5, 0.2, b.color, b.floorGlow);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.computeBoundingSphere();
  return geo;
}
