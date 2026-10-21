import * as THREE from 'three';

/** How many sparks can be in the air at once (they're reused, oldest first). */
const MAX = 1600;
const GRAVITY = -3.4;
const PARK = -999;

const PALETTES: Record<'good' | 'evil', string[]> = {
  good: ['#7cc4ff', '#ffe08a', '#ffffff', '#9ad8a4', '#c9b8ff'],
  evil: ['#ff5d6c', '#b46bff', '#ffb04a', '#ffffff', '#ff8fc8'],
};

/** A soft round spot, so each spark is a little glow rather than a square. */
function sparkTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.8)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface Rocket {
  x: number;
  y: number;
  z: number;
  top: number;
  colour: THREE.Color;
}

/**
 * Fireworks over the town square when the game ends, in the winning team's colours: rockets climb with a little
 * trail and burst into sparks that fall and fade. One draw call; nothing is created while it runs.
 */
export class Fireworks {
  readonly points: THREE.Points;
  private pos = new Float32Array(MAX * 3);
  private col = new Float32Array(MAX * 3);
  private vel = new Float32Array(MAX * 3);
  private base = new Float32Array(MAX * 3);
  private life = new Float32Array(MAX);
  private span = new Float32Array(MAX);
  private next = 0;
  private time = 0;
  private until = 0;
  private wait = 0;
  private palette: THREE.Color[] = [];
  private rockets: Rocket[] = [];

  constructor(private centre: { x: number; z: number }) {
    for (let i = 0; i < MAX; i++) this.pos[i * 3 + 1] = PARK;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage));
    geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3).setUsage(THREE.DynamicDrawUsage));
    const mat = new THREE.PointsMaterial({
      size: 0.34,
      map: sparkTexture(),
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    });
    this.points = new THREE.Points(geo, mat);
    this.points.frustumCulled = false;
    this.points.visible = false;
    this.points.renderOrder = 5;
  }

  /** Fireworks for this many seconds. */
  start(winner: 'good' | 'evil', seconds = 30) {
    this.palette = PALETTES[winner].map((c) => new THREE.Color(c));
    this.until = this.time + seconds;
    this.wait = 0;
    this.points.visible = true;
  }

  stop() {
    this.until = 0;
  }

  update(dt: number) {
    this.time += dt;
    if (!this.points.visible) return;
    const on = this.time < this.until;
    if (on) {
      this.wait -= dt;
      if (this.wait <= 0) {
        this.launch();
        // Now and then two at once.
        if (Math.random() < 0.25) this.launch();
        this.wait = 0.45 + Math.random() * 0.8;
      }
    }
    for (let r = this.rockets.length - 1; r >= 0; r--) {
      const k = this.rockets[r];
      k.y += 9 * dt;
      this.spark(k.x + (Math.random() - 0.5) * 0.05, k.y, k.z, 0, -0.6, 0, 0.35, 0.55, k.colour);
      if (k.y >= k.top) {
        this.burst(k);
        this.rockets.splice(r, 1);
      }
    }
    let any = this.rockets.length > 0;
    const drag = Math.exp(-1.3 * dt);
    for (let i = 0; i < MAX; i++) {
      if (this.life[i] <= 0) continue;
      any = true;
      const k = i * 3;
      this.life[i] -= dt;
      if (this.life[i] <= 0) {
        this.pos[k + 1] = PARK;
        this.col[k] = this.col[k + 1] = this.col[k + 2] = 0;
        continue;
      }
      this.vel[k] *= drag;
      this.vel[k + 1] = this.vel[k + 1] * drag + GRAVITY * dt;
      this.vel[k + 2] *= drag;
      this.pos[k] += this.vel[k] * dt;
      this.pos[k + 1] += this.vel[k + 1] * dt;
      this.pos[k + 2] += this.vel[k + 2] * dt;
      // Fading out (with additive blending, darker is see-through), with a little twinkle near the end.
      const f = this.life[i] / this.span[i];
      const twinkle = f < 0.4 ? 0.6 + 0.4 * Math.sin(this.time * 40 + i) : 1;
      const b = f * f * twinkle;
      this.col[k] = this.base[k] * b;
      this.col[k + 1] = this.base[k + 1] * b;
      this.col[k + 2] = this.base[k + 2] * b;
    }
    const geo = this.points.geometry;
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    if (!any && !on) this.points.visible = false;
  }

  dispose() {
    this.points.geometry.dispose();
    const mat = this.points.material as THREE.PointsMaterial;
    mat.map?.dispose();
    mat.dispose();
  }

  private launch() {
    const a = Math.random() * Math.PI * 2;
    const r = 2 + Math.random() * 6;
    this.rockets.push({
      x: this.centre.x + Math.cos(a) * r,
      y: 0.6,
      z: this.centre.z + Math.sin(a) * r - 3,
      top: 5.5 + Math.random() * 3.5,
      colour: this.palette[Math.floor(Math.random() * this.palette.length)],
    });
  }

  private burst(k: Rocket) {
    const n = 80 + Math.floor(Math.random() * 50);
    const speed = 3.2 + Math.random() * 1.6;
    // Some bursts are two-tone.
    const second = Math.random() < 0.4 ? this.palette[Math.floor(Math.random() * this.palette.length)] : k.colour;
    for (let j = 0; j < n; j++) {
      // Evenly over a sphere.
      const u = Math.random() * 2 - 1;
      const t = Math.random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const v = speed * (0.85 + Math.random() * 0.2);
      this.spark(k.x, k.y, k.z, s * Math.cos(t) * v, u * v, s * Math.sin(t) * v, 1.3 + Math.random() * 0.7, 1, j % 2 ? second : k.colour);
    }
  }

  private spark(x: number, y: number, z: number, vx: number, vy: number, vz: number, life: number, bright: number, colour: THREE.Color) {
    const i = this.next;
    this.next = (this.next + 1) % MAX;
    const k = i * 3;
    this.pos[k] = x;
    this.pos[k + 1] = y;
    this.pos[k + 2] = z;
    this.vel[k] = vx;
    this.vel[k + 1] = vy;
    this.vel[k + 2] = vz;
    this.base[k] = colour.r * bright;
    this.base[k + 1] = colour.g * bright;
    this.base[k + 2] = colour.b * bright;
    this.life[i] = life;
    this.span[i] = life;
  }
}
