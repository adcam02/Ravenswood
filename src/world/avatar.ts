import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as Animals from './animals';
import { buildAnimal, buildStoryteller, type Rig } from './animals';
import type { Anim, BackId, FaceId, HatId, Item, Look, NeckId, PetId } from './types';

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
  /** Their hand is up in a vote: a big hand floats over their head so the whole square can see. */
  voting?: boolean;
}

/** A big cartoon hand, palm out, fingers up, built once and shared. */
const HAND_GEO = (() => {
  const parts: THREE.BufferGeometry[] = [];
  const add = (g: THREE.BufferGeometry, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, rz = 0) => {
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, rz)), new THREE.Vector3(sx, sy, sz)));
    parts.push(g.index ? g.toNonIndexed() : g);
  };
  // Palm, four fingers, a thumb off to the side, and a cuff at the wrist.
  add(new THREE.SphereGeometry(1, 14, 10), 0, 0.02, 0, 0.19, 0.2, 0.08);
  add(new THREE.BoxGeometry(1, 1, 1), 0, -0.02, 0, 0.3, 0.3, 0.14);
  const finger = (x: number, len: number, lean: number) => {
    add(new THREE.CapsuleGeometry(0.052, len, 4, 10), x, 0.16 + len / 2, 0, 1, 1, 1, lean);
  };
  finger(-0.11, 0.2, 0.12);
  finger(-0.035, 0.26, 0.03);
  finger(0.04, 0.24, -0.03);
  finger(0.115, 0.17, -0.14);
  add(new THREE.CapsuleGeometry(0.055, 0.18, 4, 10), 0.19, 0.0, 0.02, 1, 1, 1, -1.0);
  add(new THREE.CylinderGeometry(0.17, 0.19, 0.08, 16), 0, -0.19, 0, 1, 1, 0.55);
  const merged = new THREE.BufferGeometry();
  // Positions only, so any part merges with any other.
  let count = 0;
  for (const g of parts) count += g.getAttribute('position').count;
  const pos = new Float32Array(count * 3);
  let off = 0;
  for (const g of parts) {
    const a = g.getAttribute('position') as THREE.BufferAttribute;
    pos.set(a.array as Float32Array, off);
    off += a.count * 3;
  }
  merged.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  merged.computeVertexNormals();
  return merged;
})();
const HAND_MAT = new THREE.MeshStandardMaterial({ color: '#fff6e8', roughness: 0.55, flatShading: true });
const HAND_CUFF_MAT = new THREE.MeshStandardMaterial({ color: '#e8c778', roughness: 0.5, flatShading: true });

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

/** A soft round shadow under each animal (animals don't cast into the town's baked shadow map). */
const BLOB_GEO = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
const BLOB_TEX = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(0.55, 'rgba(0,0,0,0.3)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
})();

/** Rig features that arrive with the animals pass: called only if the rig has them. */
type RigExtras = {
  setHat?: (hat: HatId | null) => void;
  setDetail?: (level: 'high' | 'low') => void;
  setDressUp?: (d: { face?: FaceId | null; neck?: NeckId | null; back?: BackId | null }) => void;
};
interface Pet {
  root: THREE.Object3D;
  update(dt: number, t: number, moving: boolean): void;
  setGhost(on: boolean): void;
  dispose(): void;
}
const buildPet = (Animals as unknown as { buildPet?: (pet: PetId) => Pet }).buildPet;

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
  private blob: THREE.Mesh;
  private blobMat: THREE.MeshBasicMaterial;
  private hatKey: string | undefined = undefined;
  private dressKey: string | undefined = undefined;
  private petKey = '';
  private pet: Pet | null = null;
  private petPos = new THREE.Vector3();
  private petRy = 0;
  private detail: 'high' | 'low' = 'high';
  private hand: THREE.Group | null = null;

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
    this.blobMat = new THREE.MeshBasicMaterial({ map: BLOB_TEX, transparent: true, depthWrite: false, opacity: 1 });
    this.blob = new THREE.Mesh(BLOB_GEO, this.blobMat);
    this.blob.renderOrder = 1;
    this.blob.scale.setScalar(info.storyteller ? 0 : 0.95);
    scene.add(this.blob);
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
    this.hatKey = undefined;
    this.dressKey = undefined;
    this.detail = 'high';
    rig.root.userData.avatar = this;
    AvatarView.noShadows(rig.root);
    return rig;
  }

  setInfo(info: AvatarInfo) {
    this.info = info;
    if (lookKey(info) !== this.key) {
      this.rig.root.remove(this.label);
      this.star?.removeFromParent();
      this.star = null;
      this.hand?.removeFromParent();
      this.hand = null;
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
      AvatarView.noShadows(this.rig.root);
    }
    // The hat and the rest of the outfit they've chosen, if the rig can wear them.
    const look = info.storyteller ? null : info.look;
    const hat = look?.hat ?? null;
    if ((hat ?? '') !== this.hatKey) {
      this.hatKey = hat ?? '';
      (this.rig as unknown as RigExtras).setHat?.(hat);
      AvatarView.noShadows(this.rig.root);
    }
    const dress = { face: look?.face ?? null, neck: look?.neck ?? null, back: look?.back ?? null };
    const dressKey = `${dress.face}|${dress.neck}|${dress.back}`;
    if (dressKey !== this.dressKey) {
      this.dressKey = dressKey;
      (this.rig as unknown as RigExtras).setDressUp?.(dress);
      AvatarView.noShadows(this.rig.root);
    }
    // A pet that trots along beside them.
    const petId = look?.pet ?? null;
    if ((petId ?? '') !== this.petKey) {
      this.petKey = petId ?? '';
      this.pet?.root.removeFromParent();
      this.pet?.dispose();
      this.pet = petId && buildPet ? buildPet(petId) : null;
      if (this.pet) {
        AvatarView.noShadows(this.pet.root);
        this.petPos.set(this.x - 0.6, 0, this.z + 0.6);
        this.pet.root.position.copy(this.petPos);
        this.scene.add(this.pet.root);
      }
    }
    this.pet?.setGhost(ghost);
    const voting = Boolean(info.voting) && !info.storyteller;
    if (voting && (!this.hand || this.hand.parent !== this.rig.root)) {
      this.hand?.removeFromParent();
      this.hand = new THREE.Group();
      const palm = new THREE.Mesh(HAND_GEO, HAND_MAT);
      palm.castShadow = true;
      // A cuff in the player's colour.
      const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.035, 8, 20), HAND_CUFF_MAT);
      cuff.rotation.x = Math.PI / 2;
      cuff.position.y = -0.2;
      this.hand.add(palm, cuff);
      this.hand.scale.setScalar(1.25);
      this.rig.root.add(this.hand);
    } else if (!voting && this.hand) {
      this.hand.removeFromParent();
      this.hand = null;
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
    // Ghosts float, so their name floats with them; a star or a raised hand needs headroom too.
    this.label.position.y = this.rig.headHeight + 0.28 + (ghost ? 0.35 : 0) + (star ? 0.32 : 0) + (voting ? 0.75 : 0);
    if (this.star) this.star.position.set(0, this.rig.headHeight + 0.26 + (ghost ? 0.35 : 0) + (voting ? 0.75 : 0), 0);
    if (this.hand) this.hand.position.set(0, this.rig.headHeight + 0.55 + (ghost ? 0.35 : 0), 0);
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
    AvatarView.noShadows(this.rig.root);
  }

  /** Animals keep their soft blob shadow instead of casting into the town's shadow map. */
  private static noShadows(root: THREE.Object3D) {
    root.traverse((o) => (o.castShadow = false));
  }

  /** Close up in full detail, far off in a lighter version (if the rig supports it). */
  setDetail(level: 'high' | 'low') {
    if (level === this.detail) return;
    this.detail = level;
    (this.rig as unknown as RigExtras).setDetail?.(level);
  }

  /** Name tags far away are hidden, to keep the screen (and the page) uncluttered. */
  setTagShown(on: boolean) {
    const show = on && !this.away;
    if (this.label.visible !== show) this.label.visible = show;
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
    // The blob shadow stays on the floor, fainter and smaller the higher they float or sit.
    const lift = Math.max(0, this.y);
    this.blob.visible = !this.away && !this.info.storyteller;
    this.blob.position.set(this.x, 0.025, this.z);
    this.blob.scale.setScalar(Math.max(0.5, 0.95 - lift * 0.25));
    this.blobMat.opacity = (this.ghost ? 0.35 : 1) * Math.max(0.25, 1 - lift * 0.6);
    if (this.pet) {
      // The pet keeps a little behind and to the side of its owner, catching up with a lag.
      const side = 0.55;
      const behind = 0.55;
      const wantX = this.x - Math.sin(this.ry) * behind + Math.cos(this.ry) * side;
      const wantZ = this.z - Math.cos(this.ry) * behind - Math.sin(this.ry) * side;
      const dx = wantX - this.petPos.x;
      const dz = wantZ - this.petPos.z;
      const gap = Math.hypot(dx, dz);
      if (gap > 6) this.petPos.set(wantX, 0, wantZ);
      else {
        const k = 1 - Math.exp(-dt * 4.5);
        this.petPos.x += dx * k;
        this.petPos.z += dz * k;
      }
      const moving = gap > 0.12;
      if (moving) this.petRy = Math.atan2(dx, dz);
      else {
        // Standing still, it turns to look at its owner.
        this.petRy = Math.atan2(this.x - this.petPos.x, this.z - this.petPos.z);
      }
      const root = this.pet.root;
      root.visible = !this.away;
      root.position.set(this.petPos.x, 0, this.petPos.z);
      let d = this.petRy - root.rotation.y;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      root.rotation.y += d * Math.min(1, dt * 8);
      this.pet.update(dt, t, moving);
    }
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
      this.star.position.y = this.rig.headHeight + 0.26 + (this.ghost ? 0.35 : 0) + (this.hand ? 0.75 : 0) + Math.sin(t * 2.2) * 0.04;
    }
    if (this.hand) {
      // Waves gently, facing the way the player faces, and bobs.
      this.hand.rotation.z = Math.sin(t * 4.5) * 0.18;
      this.hand.position.y = this.rig.headHeight + 0.55 + (this.ghost ? 0.35 : 0) + Math.abs(Math.sin(t * 3)) * 0.06;
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
    this.blob.removeFromParent();
    this.blobMat.dispose();
    this.pet?.root.removeFromParent();
    this.pet?.dispose();
    this.pet = null;
    this.star?.removeFromParent();
    this.star = null;
    this.hand?.removeFromParent();
    this.hand = null;
    this.rig.root.remove(this.label);
    this.el.remove();
    this.scene.remove(this.rig.root);
    this.rig.dispose();
  }
}
