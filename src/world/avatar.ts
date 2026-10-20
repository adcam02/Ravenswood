import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { buildAnimal, buildStoryteller, type Rig } from './animals';
import type { Anim, Item, Look } from './types';

export interface AvatarInfo {
  name: string;
  look: Look | null;
  ghost: boolean;
  storyteller: boolean;
  isMe: boolean;
  /** A character token shown over their head: the Storyteller's grimoire view, or the end-of-game reveal. */
  role: { name: string; icon: string; evil: boolean } | null;
  /** A small badge by the name: "on the block", "nominated". */
  badge: string | null;
  /** A gold star over their head today, for counting the sheep right last night. */
  star?: boolean;
}

const STAR_GEO = (() => {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 0.16 : 0.07;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 2 });
  g.center();
  return g;
})();
const STAR_MAT = new THREE.MeshStandardMaterial({ color: '#f6c445', emissive: '#c98a12', emissiveIntensity: 0.55, metalness: 0.35, roughness: 0.35, flatShading: true });

const lookKey = (info: AvatarInfo) => (info.storyteller ? 'st' : `${info.look?.animal}:${info.look?.color}`);

/** One animal in the world: its model, its name tag, and smooth movement toward where it's been reported. */
export class AvatarView {
  rig: Rig;
  readonly label: CSS2DObject;
  private el: HTMLDivElement;
  private nameEl: HTMLSpanElement;
  private roleEl: HTMLSpanElement;
  private badgeEl: HTMLSpanElement;
  private earEl: HTMLSpanElement;
  private bubbleEl: HTMLDivElement;
  private bubbleTimer: ReturnType<typeof setTimeout> | null = null;
  private key = '';
  private info: AvatarInfo;
  private itemKey = '';
  private ghost = false;
  private away = false;
  private star: THREE.Mesh | null = null;

  x = 0;
  z = 0;
  y = 0;
  ry = 0;
  tx = 0;
  tz = 0;
  ty = 0;
  try_ = 0;
  speed = 0;
  placed = false;

  constructor(
    private scene: THREE.Scene,
    info: AvatarInfo,
  ) {
    this.info = info;
    this.el = document.createElement('div');
    this.el.className = 'tag';
    this.bubbleEl = document.createElement('div');
    this.bubbleEl.className = 'tag-bubble';
    this.roleEl = document.createElement('span');
    this.roleEl.className = 'tag-role';
    const plate = document.createElement('div');
    plate.className = 'tag-plate';
    const voice = document.createElement('i');
    voice.className = 'tag-voice';
    this.earEl = document.createElement('span');
    this.earEl.className = 'tag-ear';
    this.earEl.textContent = '🔊';
    this.earEl.title = 'Can hear you';
    this.nameEl = document.createElement('span');
    this.nameEl.className = 'tag-name';
    this.badgeEl = document.createElement('span');
    this.badgeEl.className = 'tag-badge';
    plate.append(voice, this.nameEl, this.earEl, this.badgeEl);
    this.el.append(this.bubbleEl, this.roleEl, plate);
    this.label = new CSS2DObject(this.el);
    this.label.center.set(0.5, 1);
    this.rig = this.build(info);
    this.setInfo(info);
  }

  private build(info: AvatarInfo): Rig {
    const rig = info.storyteller || !info.look ? buildStoryteller() : buildAnimal(info.look);
    this.key = lookKey(info);
    this.ghost = false;
    rig.root.add(this.label);
    this.label.position.set(0, rig.headHeight + 0.28, 0);
    this.scene.add(rig.root);
    this.itemKey = '';
    return rig;
  }

  setInfo(info: AvatarInfo) {
    this.info = info;
    if (lookKey(info) !== this.key) {
      this.rig.root.remove(this.label);
      this.star?.removeFromParent();
      this.star = null;
      this.scene.remove(this.rig.root);
      this.rig.dispose();
      this.rig = this.build(info);
      this.rig.root.position.set(this.x, this.y, this.z);
      this.rig.root.rotation.y = this.ry;
    }
    const ghost = info.ghost && !info.storyteller;
    if (ghost !== this.ghost) {
      this.ghost = ghost;
      this.rig.setGhost(ghost);
    }
    const star = Boolean(info.star) && !info.storyteller;
    if (star && (!this.star || this.star.parent !== this.rig.root)) {
      this.star?.removeFromParent();
      this.star = new THREE.Mesh(STAR_GEO, STAR_MAT);
      this.star.castShadow = true;
      this.rig.root.add(this.star);
    } else if (!star && this.star) {
      this.star.removeFromParent();
      this.star = null;
    }
    // Ghosts float, so their name floats with them; a star needs headroom too.
    this.label.position.y = this.rig.headHeight + 0.28 + (ghost ? 0.35 : 0) + (star ? 0.32 : 0);
    if (this.star) this.star.position.set(0, this.rig.headHeight + 0.26 + (ghost ? 0.35 : 0), 0);
    this.nameEl.textContent = (star ? '⭐ ' : '') + (info.storyteller ? 'The Storyteller' : info.name || 'Someone');
    this.el.classList.toggle('is-ghost', ghost);
    this.el.classList.toggle('is-st', info.storyteller);
    this.el.classList.toggle('is-me', info.isMe);
    if (info.role) {
      this.roleEl.innerHTML = '';
      const img = document.createElement('img');
      img.src = info.role.icon;
      img.alt = '';
      const txt = document.createElement('span');
      txt.textContent = info.role.name;
      this.roleEl.append(img, txt);
      this.roleEl.className = `tag-role on ${info.role.evil ? 'evil' : 'good'}`;
    } else this.roleEl.className = 'tag-role';
    this.badgeEl.textContent = info.badge ?? '';
    this.badgeEl.classList.toggle('on', Boolean(info.badge));
  }

  setTarget(x: number, z: number, ry: number, y = 0) {
    this.tx = x;
    this.tz = z;
    this.try_ = ry;
    this.ty = y;
    if (!this.placed) this.snap();
  }

  snap() {
    this.x = this.tx;
    this.z = this.tz;
    this.y = this.ty;
    this.ry = this.try_;
    this.placed = true;
    this.speed = 0;
  }

  setItem(item: Item | null) {
    const k = item ? `${item.k}:${item.c ?? ''}` : '';
    if (k === this.itemKey) return;
    this.itemKey = k;
    this.rig.setItem(item);
  }

  /** In the same place as us, and drawn. */
  get shown(): boolean {
    return !this.away;
  }

  setVisible(on: boolean) {
    this.away = !on;
    // The Storyteller's lantern is a light, and lights coming and going makes the renderer stutter, so
    // they're parked out of sight instead of hidden.
    if (!this.info.storyteller) this.rig.root.visible = on;
    else if (!on) this.rig.root.position.set(0, -500, 0);
    this.label.visible = on;
    this.el.style.display = on ? '' : 'none';
  }

  /** Moves toward the reported position (remote players), or sits exactly on it (the local player). */
  update(dt: number, t: number, anim: Anim, speaking: boolean, follow: boolean) {
    const px = this.x;
    const pz = this.z;
    if (follow) {
      const d = Math.hypot(this.tx - this.x, this.tz - this.z);
      if (d > 6) this.snap();
      else {
        const k = 1 - Math.exp(-dt * 11);
        this.x += (this.tx - this.x) * k;
        this.z += (this.tz - this.z) * k;
        this.y += (this.ty - this.y) * k;
        let dr = this.try_ - this.ry;
        while (dr > Math.PI) dr -= Math.PI * 2;
        while (dr < -Math.PI) dr += Math.PI * 2;
        this.ry += dr * Math.min(1, dt * 12);
      }
    } else {
      this.x = this.tx;
      this.z = this.tz;
      this.y = this.ty;
      this.ry = this.try_;
    }
    const moved = dt > 0 ? Math.hypot(this.x - px, this.z - pz) / dt : 0;
    this.speed += (moved - this.speed) * Math.min(1, dt * 10);
    const root = this.rig.root;
    if (this.away) return;
    root.position.set(this.x, this.y, this.z);
    root.rotation.y = this.ry;
    // Remote players reported as walking but standing still (or the other way round) look odd, so speed decides.
    let a = anim;
    if ((a === 'walk' || a === 'run') && this.speed < 0.3) a = 'idle';
    if (a === 'idle' && this.speed > 0.6) a = this.speed > 4.2 ? 'run' : 'walk';
    this.rig.update({ anim: a, speed: this.speed, dt, t, speaking });
    if (this.star) {
      this.star.rotation.y = t * 1.6;
      this.star.position.y = this.rig.headHeight + 0.26 + (this.ghost ? 0.35 : 0) + Math.sin(t * 2.2) * 0.04;
    }
    this.el.classList.toggle('talking', speaking);
  }

  /** Whether they're within earshot, shown by a little speaker by their name. */
  setHearing(on: boolean) {
    this.el.classList.toggle('in-earshot', on);
  }

  /** A little speech-bubble note over their head ("caught a Trout!"). */
  bubble(text: string, ms = 3500) {
    this.bubbleEl.textContent = text;
    this.bubbleEl.classList.add('on');
    if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => this.bubbleEl.classList.remove('on'), ms);
  }

  dispose() {
    if (this.bubbleTimer) clearTimeout(this.bubbleTimer);
    this.star?.removeFromParent();
    this.star = null;
    this.rig.root.remove(this.label);
    this.el.remove();
    this.scene.remove(this.rig.root);
    this.rig.dispose();
  }
}
