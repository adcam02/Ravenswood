import * as THREE from 'three';
import { Builder, matte, rng } from '../build';
import { G } from './kit';

/**
 * The town's moving effects, all cheap on the CPU: a sky dome, rain and its splashes, ground mist, night
 * glows, swaying leaves, birds that take off when you come close, and rings on the pond.
 */

// ---------------------------------------------------------------- swaying leaves and grass

/** Shared by every swaying material: the time, and how windy it is (1 normal, more in rain). */
export const swayUniforms = { uSwayTime: { value: 0 }, uSway: { value: 1 } };

/**
 * Makes a material sway in the wind. The sway grows with height above the ground (world y for the merged
 * town meshes, local y for instanced trees), so trunks and stems stay planted while crowns move.
 */
export function addSway<M extends THREE.Material>(mat: M): M {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uSwayTime = swayUniforms.uSwayTime;
    shader.uniforms.uSway = swayUniforms.uSway;
    shader.vertexShader =
      'uniform float uSwayTime;\nuniform float uSway;\n' +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        {
          vec2 swayP = transformed.xz;
          #ifdef USE_INSTANCING
            swayP += instanceMatrix[3].xz;
          #endif
          float swayH = clamp(transformed.y, 0.0, 3.6);
          float swayA = sin(uSwayTime * 1.55 + swayP.x * 0.35 + swayP.y * 0.27) + 0.45 * sin(uSwayTime * 2.7 + swayP.x * 0.9 - swayP.y * 0.6);
          transformed.x += swayA * swayH * 0.028 * uSway;
          transformed.z += cos(uSwayTime * 1.25 + swayP.y * 0.31 + swayP.x * 0.12) * swayH * 0.016 * uSway;
        }`,
      );
  };
  mat.customProgramCacheKey = () => 'sway';
  return mat;
}

// ---------------------------------------------------------------- the sky

export interface Sky {
  mesh: THREE.Mesh;
  top: THREE.Color;
  horizon: THREE.Color;
  bottom: THREE.Color;
  sunDir: THREE.Vector3;
  sunColor: THREE.Color;
  setGlow(v: number): void;
}

/** A dome with a gradient from the horizon to the top, and a soft glow around the sun. Centred on the town. */
export function makeSky(radius = 280): Sky {
  const uniforms = {
    uTop: { value: new THREE.Color('#8cc8ef') },
    uHorizon: { value: new THREE.Color('#c3e4f4') },
    uBottom: { value: new THREE.Color('#9cc77c') },
    uSunDir: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() },
    uSunColor: { value: new THREE.Color('#fff1d2') },
    uGlow: { value: 0.25 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop;
      uniform vec3 uHorizon;
      uniform vec3 uBottom;
      uniform vec3 uSunDir;
      uniform vec3 uSunColor;
      uniform float uGlow;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = h > 0.0 ? mix(uHorizon, uTop, pow(clamp(h * 1.6, 0.0, 1.0), 0.6)) : mix(uHorizon, uBottom, clamp(-h * 5.0, 0.0, 1.0));
        float sd = max(dot(d, normalize(uSunDir)), 0.0);
        // A wide warm haze around the sun, strongest near the horizon, and a tight bright core.
        float haze = pow(sd, 5.0) * (0.55 + 0.45 * (1.0 - clamp(h * 2.5, 0.0, 1.0)));
        col += uSunColor * (haze * 0.45 + pow(sd, 120.0) * 0.5) * uGlow;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 40, 20), material);
  mesh.renderOrder = -10;
  mesh.frustumCulled = false;
  mesh.name = 'sky-dome';
  return {
    mesh,
    top: uniforms.uTop.value,
    horizon: uniforms.uHorizon.value,
    bottom: uniforms.uBottom.value,
    sunDir: uniforms.uSunDir.value,
    sunColor: uniforms.uSunColor.value,
    setGlow: (v) => (uniforms.uGlow.value = v),
  };
}

// ---------------------------------------------------------------- rain

export interface Rain {
  group: THREE.Group;
  /** 0 dry to 1 pouring; drops beyond this fraction are hidden. */
  set(amount: number, time: number, center: THREE.Vector3): void;
}

/** Falling streaks and splash rings around a point. Everything moves on the GPU; the CPU only sets uniforms. */
export function makeRain(drops = 2600, splashes = 260): Rain {
  const group = new THREE.Group();
  group.name = 'rain';
  const BOX = 44;
  const H = 18;
  const r = rng(91);

  // Streaks: thin quads that turn to face the camera about the vertical.
  const quad = new THREE.PlaneGeometry(0.035, 0.62);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = quad.index;
  geo.setAttribute('position', quad.getAttribute('position'));
  const off = new Float32Array(drops * 4);
  for (let i = 0; i < drops; i++) off.set([r() * BOX, r() * H, r() * BOX, r()], i * 4);
  geo.setAttribute('aOff', new THREE.InstancedBufferAttribute(off, 4));
  geo.instanceCount = drops;
  const dropU = {
    uTime: { value: 0 },
    uCenter: { value: new THREE.Vector3() },
    uAmount: { value: 0 },
    uColor: { value: new THREE.Color('#c9d6e6') },
  };
  const dropMat = new THREE.ShaderMaterial({
    uniforms: dropU,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uCenter;
      uniform float uAmount;
      attribute vec4 aOff;
      varying float vAlpha;
      void main() {
        float on = step(aOff.w, uAmount);
        float y = mod(aOff.y - uTime * (13.0 + aOff.w * 5.0), ${H.toFixed(1)});
        vec2 xz = uCenter.xz + mod(aOff.xz - uCenter.xz, ${BOX.toFixed(1)}) - ${(BOX / 2).toFixed(1)};
        vec3 wp = vec3(xz.x, y, xz.y);
        vec3 toCam = cameraPosition - wp;
        vec3 right = normalize(vec3(toCam.z, 0.0, -toCam.x) + vec3(0.0001, 0.0, 0.0));
        wp += right * position.x;
        wp.y += position.y;
        wp.x += (y + position.y) * 0.09;
        vAlpha = on * smoothstep(0.0, 0.6, y) * (1.0 - smoothstep(${(H - 3).toFixed(1)}, ${H.toFixed(1)}, y));
        vAlpha *= 1.0 - smoothstep(24.0, 34.0, length(toCam));
        gl_Position = on > 0.5 ? projectionMatrix * viewMatrix * vec4(wp, 1.0) : vec4(2.0, 2.0, 2.0, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        gl_FragColor = vec4(uColor, 0.4 * vAlpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
  });
  const dropMesh = new THREE.Mesh(geo, dropMat);
  dropMesh.frustumCulled = false;
  dropMesh.renderOrder = 3;
  group.add(dropMesh);

  // Splashes: little rings that open and fade on the ground and the pond, at new places each time.
  const ring = new THREE.PlaneGeometry(2, 2);
  ring.rotateX(-Math.PI / 2);
  const sgeo = new THREE.InstancedBufferGeometry();
  sgeo.index = ring.index;
  sgeo.setAttribute('position', ring.getAttribute('position'));
  sgeo.setAttribute('uv', ring.getAttribute('uv'));
  const seeds = new Float32Array(splashes * 2);
  for (let i = 0; i < splashes; i++) seeds.set([r(), r() * 0.8], i * 2);
  sgeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 2));
  sgeo.instanceCount = splashes;
  const splashU = {
    uTime: { value: 0 },
    uCenter: { value: new THREE.Vector3() },
    uAmount: { value: 0 },
    uColor: { value: new THREE.Color('#e6eef6') },
  };
  const splashMat = new THREE.ShaderMaterial({
    uniforms: splashU,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uCenter;
      uniform float uAmount;
      attribute vec2 aSeed;
      varying vec2 vUv;
      varying float vLife;
      varying float vOn;
      float hash(float n) { return fract(sin(n) * 43758.5453); }
      void main() {
        float cyc = uTime * (1.5 + aSeed.y) + aSeed.x * 10.0;
        float k = floor(cyc);
        float life = fract(cyc);
        float a = hash(k * 1.2898 + aSeed.x * 78.233) * 6.2831;
        float rr = sqrt(hash(k * 3.9346 + aSeed.x * 11.135)) * 15.0;
        vec2 xz = uCenter.xz + vec2(cos(a), sin(a)) * rr;
        float s = 0.03 + life * 0.2;
        vec3 wp = vec3(xz.x + position.x * s, 0.078, xz.y + position.z * s);
        vUv = uv;
        vLife = life;
        vOn = step(fract(aSeed.x * 7.13), uAmount);
        gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying vec2 vUv;
      varying float vLife;
      varying float vOn;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float ring = smoothstep(0.55, 0.78, d) * (1.0 - smoothstep(0.84, 1.0, d));
        float a = ring * (1.0 - vLife) * vOn * 0.5;
        if (a < 0.01) discard;
        gl_FragColor = vec4(uColor, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
  });
  const splashMesh = new THREE.Mesh(sgeo, splashMat);
  splashMesh.frustumCulled = false;
  splashMesh.renderOrder = 2;
  group.add(splashMesh);

  group.visible = false;
  return {
    group,
    set(amount, time, center) {
      group.visible = amount > 0.01;
      dropU.uAmount.value = amount;
      splashU.uAmount.value = amount;
      dropU.uTime.value = time;
      splashU.uTime.value = time;
      dropU.uCenter.value.copy(center);
      splashU.uCenter.value.copy(center);
    },
  };
}

// ---------------------------------------------------------------- mist

/** A soft round texture: white in the middle fading to nothing. */
function softDisc(size = 64, falloff = 1): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.5 * falloff, 'rgba(255,255,255,0.5)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

export interface Mist {
  group: THREE.Group;
  set(amount: number, dt: number, center: THREE.Vector3, color: THREE.Color): void;
}

/** Low sheets of mist drifting over the ground around a point. */
export function makeMist(n = 12): Mist {
  const group = new THREE.Group();
  group.name = 'mist';
  const material = new THREE.MeshBasicMaterial({ map: softDisc(128, 1.1), color: '#e8eef2', transparent: true, opacity: 0, depthWrite: false });
  const r = rng(23);
  const SPAN = 52;
  const sheets = Array.from({ length: n }, (_, i) => {
    const size = 11 + r() * 9;
    const geo = new THREE.PlaneGeometry(size, size * (0.6 + r() * 0.4));
    geo.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(geo, material);
    m.renderOrder = 4;
    m.rotation.y = r() * Math.PI;
    const s = { mesh: m, x: r() * SPAN, z: r() * SPAN, y: 0.35 + (i % 4) * 0.4, speed: 0.15 + r() * 0.25 };
    group.add(m);
    return s;
  });
  group.visible = false;
  return {
    group,
    set(amount, dt, center, color) {
      group.visible = amount > 0.01;
      if (!group.visible) return;
      material.opacity = 0.28 * amount;
      material.color.copy(color);
      for (const s of sheets) {
        s.x = (s.x + s.speed * dt) % SPAN;
        const wrap = (v: number, c: number) => c + ((((v - c) % SPAN) + SPAN) % SPAN) - SPAN / 2;
        s.mesh.position.set(wrap(s.x, center.x), s.y, wrap(s.z, center.z));
      }
    },
  };
}

// ---------------------------------------------------------------- night glows

export interface GlowSpot {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
}

export interface Glows {
  mesh: THREE.Mesh;
  set(amount: number, fogNear: number, fogFar: number): void;
}

/** Soft additive halos round lamps, lanterns, lit windows and the clock faces: a cheap stand-in for bloom. */
export function makeGlows(spots: GlowSpot[]): Glows {
  const quad = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = quad.index;
  geo.setAttribute('position', quad.getAttribute('position'));
  geo.setAttribute('uv', quad.getAttribute('uv'));
  const pos = new Float32Array(spots.length * 3);
  const size = new Float32Array(spots.length);
  const col = new Float32Array(spots.length * 3);
  const c = new THREE.Color();
  spots.forEach((s, i) => {
    pos.set([s.x, s.y, s.z], i * 3);
    size[i] = s.size;
    c.set(s.color);
    col.set([c.r, c.g, c.b], i * 3);
  });
  geo.setAttribute('aPos', new THREE.InstancedBufferAttribute(pos, 3));
  geo.setAttribute('aSize', new THREE.InstancedBufferAttribute(size, 1));
  geo.setAttribute('aColor', new THREE.InstancedBufferAttribute(col, 3));
  geo.instanceCount = spots.length;
  const uniforms = { uGlow: { value: 0 }, uFogNear: { value: 40 }, uFogFar: { value: 120 } };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      attribute vec3 aPos;
      attribute float aSize;
      attribute vec3 aColor;
      uniform float uFogNear;
      uniform float uFogFar;
      varying vec2 vUv;
      varying vec3 vColor;
      varying float vFade;
      void main() {
        vec4 mv = modelViewMatrix * vec4(aPos, 1.0);
        // Pulled a little toward the camera, so a halo on a wall doesn't get cut by the wall.
        mv.xyz += normalize(-mv.xyz) * 0.6;
        mv.xy += position.xy * aSize;
        vUv = uv;
        vColor = aColor;
        vFade = 1.0 - smoothstep(uFogNear, uFogFar, -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uGlow;
      varying vec2 vUv;
      varying vec3 vColor;
      varying float vFade;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float a = pow(max(1.0 - d, 0.0), 2.2);
        gl_FragColor = vec4(vColor * a * uGlow * vFade, 1.0);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 5;
  mesh.name = 'night-glow';
  mesh.visible = false;
  return {
    mesh,
    set(amount, fogNear, fogFar) {
      mesh.visible = amount > 0.01;
      uniforms.uGlow.value = amount;
      uniforms.uFogNear.value = fogNear;
      uniforms.uFogFar.value = fogFar;
    },
  };
}

// ---------------------------------------------------------------- birds

export interface Birds {
  group: THREE.Group;
  update(dt: number, t: number, follow: THREE.Vector3, active: boolean): void;
}

type BirdMode = 'perch' | 'fly' | 'away' | 'land';

interface Bird {
  mode: BirdMode;
  perch: number;
  pos: THREE.Vector3;
  heading: number;
  from: THREE.Vector3;
  ctrl: THREE.Vector3;
  to: THREE.Vector3;
  t0: number;
  dur: number;
  wait: number;
  hopAt: number;
  hopStart: number;
  scale: number;
}

/** Small birds sitting on roofs, lamps and benches. Come within a few metres and they're off; they come back later. */
export function makeBirds(perches: THREE.Vector3[], count = 8): Birds {
  const group = new THREE.Group();
  group.name = 'birds';
  const r = rng(404);
  // One body shape and one wing shape, each drawn for every bird at once.
  const body = new Builder();
  const back = '#7a6450';
  body.add(G.sphere(16, 10), back, { pos: [0, 0.09, 0], scale: [0.13, 0.08, 0.09] });
  body.add(G.sphere(16, 10), '#e0d2bc', { pos: [0.02, 0.07, 0], scale: [0.1, 0.06, 0.075] });
  body.add(G.sphere(16, 10), back, { pos: [0.1, 0.16, 0], scale: [0.066, 0.066, 0.066] });
  body.add(G.sphere(12, 8), '#e07a4a', { pos: [0.11, 0.12, 0], scale: [0.05, 0.04, 0.055] });
  body.add(G.cone(8), '#e8c35a', { pos: [0.17, 0.152, 0], rot: [0, 0, -Math.PI / 2], scale: [0.018, 0.06, 0.018] });
  for (const sz of [-1, 1]) body.add(G.sphere(8, 6), '#1e1a20', { pos: [0.135, 0.175, sz * 0.035], scale: [0.012, 0.014, 0.012] });
  body.add(G.box(), '#5e4c3c', { pos: [-0.15, 0.115, 0], rot: [0, 0, 0.35], scale: [0.11, 0.018, 0.06] });
  for (const sz of [-1, 1]) body.add(G.cyl(6), '#c99a5a', { pos: [0.01, 0.02, sz * 0.03], scale: [0.008, 0.05, 0.008] });
  const wing = new Builder();
  wing.add(G.sphere(12, 6), '#6a5644', { pos: [0, 0, 0.075], scale: [0.075, 0.012, 0.085] });
  wing.add(G.sphere(10, 6), '#4e4034', { pos: [-0.03, -0.003, 0.11], scale: [0.05, 0.01, 0.05] });
  const bodyMesh = new THREE.InstancedMesh(body.geometry(), matte(), count);
  const wingMesh = new THREE.InstancedMesh(wing.geometry(), matte(), count * 2);
  for (const m of [bodyMesh, wingMesh]) {
    m.castShadow = false;
    m.receiveShadow = false;
    m.frustumCulled = false;
    group.add(m);
  }
  const tint = new THREE.Color();
  for (let i = 0; i < count; i++) {
    tint.setScalar(0.85 + r() * 0.3);
    bodyMesh.setColorAt(i, tint);
    wingMesh.setColorAt(i * 2, tint);
    wingMesh.setColorAt(i * 2 + 1, tint);
  }
  const taken = new Set<number>();
  const order = perches.map((_, i) => i).sort(() => r() - 0.5);
  const birds: Bird[] = Array.from({ length: Math.min(count, perches.length) }, (_, i) => {
    const perch = order[i];
    taken.add(perch);
    return {
      mode: 'perch' as BirdMode,
      perch,
      pos: perches[perch].clone(),
      heading: r() * Math.PI * 2,
      from: new THREE.Vector3(),
      ctrl: new THREE.Vector3(),
      to: new THREE.Vector3(),
      t0: 0,
      dur: 1,
      wait: 0,
      hopAt: r() * 4,
      hopStart: -10,
      scale: 1.25 + r() * 0.25,
    };
  });
  bodyMesh.count = birds.length;
  wingMesh.count = birds.length * 2;

  const m4 = new THREE.Matrix4();
  const w4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const tmp = new THREE.Vector3();
  const prev = new THREE.Vector3();
  const shoulder = new THREE.Matrix4();
  const flapM = new THREE.Matrix4();
  const hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  const turnOver = new THREE.Matrix4().makeRotationX(Math.PI);
  const bez = (out: THREE.Vector3, a: THREE.Vector3, c: THREE.Vector3, b: THREE.Vector3, u: number) => {
    const k = 1 - u;
    return out.set(k * k * a.x + 2 * k * u * c.x + u * u * b.x, k * k * a.y + 2 * k * u * c.y + u * u * b.y, k * k * a.z + 2 * k * u * c.z + u * u * b.z);
  };

  return {
    group,
    update(dt, t, follow, active) {
      void dt;
      group.visible = active;
      if (!active) return;
      birds.forEach((b, i) => {
        let flap = -0.15;
        let hop = 0;
        if (b.mode === 'perch') {
          const p = perches[b.perch];
          if (Math.hypot(p.x - follow.x, p.z - follow.z) < 4) {
            // Off it goes, away from whoever came close, climbing as it goes.
            let ax = p.x - follow.x;
            let az = p.z - follow.z;
            const len = Math.hypot(ax, az) || 1;
            ax /= len;
            az /= len;
            const side = r() - 0.5;
            b.mode = 'fly';
            b.from.copy(p);
            b.ctrl.set(p.x + ax * 5 - az * side * 4, p.y + 1.2, p.z + az * 5 + ax * side * 4);
            b.to.set(p.x + ax * 34 - az * side * 12, p.y + 14 + r() * 6, p.z + az * 34 + ax * side * 12);
            b.t0 = t;
            b.dur = 3.4 + r();
            taken.delete(b.perch);
          } else {
            b.pos.copy(p);
            if (t > b.hopAt) {
              b.hopStart = t;
              b.hopAt = t + 1.5 + r() * 4;
              b.heading += (r() - 0.5) * 1.4;
            }
            const h = (t - b.hopStart) / 0.22;
            if (h >= 0 && h <= 1) hop = Math.sin(h * Math.PI) * 0.05;
          }
        }
        if (b.mode === 'fly' || b.mode === 'land') {
          const u = Math.min(1, (t - b.t0) / b.dur);
          const e = b.mode === 'fly' ? u * u * (1.6 - 0.6 * u) : 1 - (1 - u) * (1 - u);
          prev.copy(b.pos);
          bez(b.pos, b.from, b.ctrl, b.to, e);
          tmp.subVectors(b.pos, prev);
          if (tmp.lengthSq() > 1e-6) b.heading = Math.atan2(-tmp.z, tmp.x);
          flap = Math.sin(t * (b.mode === 'land' && u > 0.8 ? 14 : 34) + i) * 0.95;
          if (u >= 1) {
            if (b.mode === 'fly') {
              b.mode = 'away';
              b.wait = t + 20 + r() * 20;
            } else {
              b.mode = 'perch';
              b.hopAt = t + 1 + r() * 3;
            }
          }
        }
        if (b.mode === 'away' && t > b.wait) {
          // Back in to a free perch, well away from the player.
          const choices = perches.map((_, k) => k).filter((k) => !taken.has(k) && Math.hypot(perches[k].x - follow.x, perches[k].z - follow.z) > 9);
          if (!choices.length) b.wait = t + 5;
          else {
            const k = choices[Math.floor(r() * choices.length)];
            taken.add(k);
            b.perch = k;
            const p = perches[k];
            const a = r() * Math.PI * 2;
            b.mode = 'land';
            b.from.set(p.x + Math.cos(a) * 30, p.y + 12, p.z + Math.sin(a) * 30);
            b.ctrl.set(p.x + Math.cos(a) * 6, p.y + 3, p.z + Math.sin(a) * 6);
            b.to.copy(p);
            b.pos.copy(b.from);
            b.t0 = t;
            b.dur = 4 + r() * 1.5;
          }
        }
        if (b.mode === 'away') {
          bodyMesh.setMatrixAt(i, hidden);
          wingMesh.setMatrixAt(i * 2, hidden);
          wingMesh.setMatrixAt(i * 2 + 1, hidden);
          return;
        }
        q.setFromAxisAngle(up, b.heading);
        s.setScalar(b.scale);
        tmp.set(b.pos.x, b.pos.y + hop, b.pos.z);
        m4.compose(tmp, q, s);
        bodyMesh.setMatrixAt(i, m4);
        for (const side of [-1, 1]) {
          shoulder.makeTranslation(0.0, 0.125, side * 0.045);
          flapM.makeRotationX(side * flap);
          // The left wing is the right one turned over (a rotation, not a mirror, so its faces still face out).
          if (side < 0) flapM.multiply(turnOver);
          w4.copy(m4).multiply(shoulder).multiply(flapM);
          wingMesh.setMatrixAt(i * 2 + (side < 0 ? 0 : 1), w4);
        }
      });
      bodyMesh.instanceMatrix.needsUpdate = true;
      wingMesh.instanceMatrix.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------- rings on the pond

export interface Ripples {
  mesh: THREE.Mesh;
  spawn(x: number, z: number, size: number, time: number): void;
  setTime(time: number): void;
}

/** Expanding rings on the water, from a pool reused in turn. The GPU grows and fades them. */
export function makeRipples(n = 24, y = 0.08): Ripples {
  const ring = new THREE.PlaneGeometry(2, 2);
  ring.rotateX(-Math.PI / 2);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = ring.index;
  geo.setAttribute('position', ring.getAttribute('position'));
  geo.setAttribute('uv', ring.getAttribute('uv'));
  const data = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) data.set([0, 0, -100, 0], i * 4);
  const attr = new THREE.InstancedBufferAttribute(data, 4);
  attr.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('aData', attr);
  geo.instanceCount = n;
  const uniforms = { uTime: { value: 0 }, uColor: { value: new THREE.Color('#eef8ff') } };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      uniform float uTime;
      attribute vec4 aData;
      varying vec2 vUv;
      varying float vLife;
      void main() {
        float life = (uTime - aData.z) / (1.4 + aData.w * 0.6);
        vLife = life;
        vUv = uv;
        float s = aData.w * (0.06 + clamp(life, 0.0, 1.0) * 0.9);
        vec3 wp = vec3(aData.x + position.x * s, ${y.toFixed(3)}, aData.y + position.z * s);
        gl_Position = (life < 0.0 || life > 1.0) ? vec4(2.0, 2.0, 2.0, 1.0) : projectionMatrix * viewMatrix * vec4(wp, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying vec2 vUv;
      varying float vLife;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float ring = smoothstep(0.7, 0.86, d) * (1.0 - smoothstep(0.9, 1.0, d));
        float a = ring * (1.0 - vLife) * 0.65;
        if (a < 0.01) discard;
        gl_FragColor = vec4(uColor, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  mesh.renderOrder = 2;
  mesh.name = 'ripples';
  let next = 0;
  return {
    mesh,
    spawn(x, z, size, time) {
      data.set([x, z, time, size], next * 4);
      attr.needsUpdate = true;
      next = (next + 1) % n;
    },
    setTime(time) {
      uniforms.uTime.value = time;
    },
  };
}
