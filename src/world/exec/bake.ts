import * as THREE from 'three';

/**
 * Copies of an animal as it stands right now, as plain meshes that can be moved, cut, sooted and left lying about
 * on their own: the halves at the guillotine, and what's left behind when the ghost floats up. The skinned body is
 * posed on the CPU (as the GPU would), and hats and the like come along at their places.
 */

const tmpM = new THREE.Matrix4();
const skinM = new THREE.Matrix4();
const sumM = new THREE.Matrix4();
const normalM = new THREE.Matrix3();
const v = new THREE.Vector3();
const n = new THREE.Vector3();

/** The skinned mesh's geometry as it's posed now, in world space (with its colours and material groups). */
function poseSkinned(mesh: THREE.SkinnedMesh): THREE.BufferGeometry {
  const src = mesh.geometry;
  const pos = src.getAttribute('position') as THREE.BufferAttribute;
  const nor = src.getAttribute('normal') as THREE.BufferAttribute | undefined;
  const si = src.getAttribute('skinIndex') as THREE.BufferAttribute;
  const sw = src.getAttribute('skinWeight') as THREE.BufferAttribute;
  const bones = mesh.skeleton.bones;
  const inv = mesh.skeleton.boneInverses;
  // Each bone's skinning matrix, worked out once.
  const boneM = bones.map((b, i) => new THREE.Matrix4().multiplyMatrices(b.matrixWorld, inv[i]));
  const toWorld = new THREE.Matrix4().multiplyMatrices(mesh.matrixWorld, mesh.bindMatrixInverse);
  const out = new Float32Array(pos.count * 3);
  const outN = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    sumM.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    for (let k = 0; k < 4; k++) {
      const w = sw.getComponent(i, k);
      if (!w) continue;
      const m = boneM[si.getComponent(i, k)];
      if (!m) continue;
      for (let e = 0; e < 16; e++) sumM.elements[e] += m.elements[e] * w;
    }
    skinM.multiplyMatrices(toWorld, sumM).multiply(mesh.bindMatrix);
    v.fromBufferAttribute(pos, i).applyMatrix4(skinM);
    out.set([v.x, v.y, v.z], i * 3);
    if (nor) {
      normalM.getNormalMatrix(skinM);
      n.fromBufferAttribute(nor, i).applyMatrix3(normalM).normalize();
      outN.set([n.x, n.y, n.z], i * 3);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(out, 3));
  if (nor) g.setAttribute('normal', new THREE.BufferAttribute(outN, 3));
  else g.computeVertexNormals();
  const col = src.getAttribute('color');
  if (col) g.setAttribute('color', col);
  for (const grp of src.groups) g.addGroup(grp.start, grp.count, grp.materialIndex);
  g.computeBoundingSphere();
  return g;
}

/** A copy of a material for a baked piece (the special shading the animals use comes along too). */
function copyMaterial(m: THREE.Material): THREE.Material {
  const c = m.clone();
  c.onBeforeCompile = m.onBeforeCompile;
  c.customProgramCacheKey = m.customProgramCacheKey;
  return c;
}

/** One baked part: its geometry in world space, and the materials it was drawn with (copied by each piece made of it). */
export interface BakedPart {
  geometry: THREE.BufferGeometry;
  material: THREE.Material | THREE.Material[];
  /** The animal's own coat (not its eyes or a hat), which soot darkens: the first material of the body. */
  coat: boolean;
}

/** Everything drawn of an animal right now, baked where it stands. Free it with `freeBake` once the pieces are made. */
export function bakeAnimal(root: THREE.Object3D): BakedPart[] {
  root.updateMatrixWorld(true);
  const parts: BakedPart[] = [];
  root.traverseVisible((o) => {
    const mesh = o as THREE.Mesh;
    // (Nor a prestige hat's glow, placed by its shader: see hatFx.ts.)
    if (!mesh.isMesh || (o as THREE.InstancedMesh).isInstancedMesh || o.userData.noBake) return;
    if ((o as THREE.SkinnedMesh).isSkinnedMesh) {
      parts.push({ geometry: poseSkinned(o as THREE.SkinnedMesh), material: mesh.material, coat: true });
      return;
    }
    const g = mesh.geometry.clone();
    g.applyMatrix4(tmpM.copy(mesh.matrixWorld));
    parts.push({ geometry: g, material: mesh.material, coat: false });
  });
  return parts;
}

export function freeBake(parts: BakedPart[]) {
  for (const p of parts) p.geometry.dispose();
}

/** Inside, a cut animal is card: a plain cream, drawn on the backs of its faces where a cut opens them up. */
const CUT_COLOR = '#f2e3c9';

/**
 * A piece of a baked animal: meshes under a group whose origin is `pivot` (world space), optionally cut by a
 * plane through the pivot (only the side `keep` points to is drawn), with soot to darken it and frazzle to
 * rough up its coat. Move and turn `group` freely; call `update()` after, so the cut moves with it.
 */
export class BakedPiece {
  readonly group = new THREE.Group();
  private plane: THREE.Plane | null = null;
  private localPlane: THREE.Plane | null = null;
  private owned: THREE.Material[] = [];
  private geos: THREE.BufferGeometry[] = [];
  private coats: { m: THREE.MeshToonMaterial; base: THREE.Color }[] = [];

  constructor(parts: BakedPart[], pivot: THREE.Vector3, opts: { keep?: THREE.Vector3; frazzle?: number } = {}) {
    this.group.position.copy(pivot);
    if (opts.keep) {
      // Kept where the normal points: the plane runs through the pivot.
      this.localPlane = new THREE.Plane(opts.keep.clone().normalize(), 0);
      this.plane = this.localPlane.clone().translate(pivot);
    }
    const planes = this.plane ? [this.plane] : null;
    for (const p of parts) {
      const geo = p.geometry.clone();
      geo.translate(-pivot.x, -pivot.y, -pivot.z);
      if (opts.frazzle) frazzle(geo, opts.frazzle);
      this.geos.push(geo);
      const list = (Array.isArray(p.material) ? p.material : [p.material]).map((m) => {
        const c = copyMaterial(m);
        c.clippingPlanes = planes;
        this.owned.push(c);
        return c;
      });
      const coat = p.coat ? (list[0] as THREE.MeshToonMaterial) : null;
      if (coat?.color) this.coats.push({ m: coat, base: coat.color.clone() });
      const mesh = new THREE.Mesh(geo, Array.isArray(p.material) ? list : list[0]);
      this.group.add(mesh);
      if (planes) {
        const inside = new THREE.MeshBasicMaterial({ color: CUT_COLOR, side: THREE.BackSide, clippingPlanes: planes });
        this.owned.push(inside);
        this.group.add(new THREE.Mesh(geo, inside));
      }
    }
  }

  /** Darkens the coat towards soot-black: 0 as it was, 1 charred (the eyes stay white). */
  soot(k: number, color = '#2a2420') {
    const to = new THREE.Color(color);
    for (const c of this.coats) c.m.color.copy(c.base).lerp(to, THREE.MathUtils.clamp(k, 0, 1));
  }

  /** After moving the group: the cut goes with it. */
  update() {
    if (!this.plane || !this.localPlane) return;
    this.group.updateMatrixWorld(true);
    this.plane.copy(this.localPlane).applyMatrix4(this.group.matrixWorld);
  }

  dispose() {
    this.group.removeFromParent();
    for (const m of this.owned) m.dispose();
    for (const g of this.geos) g.dispose();
  }
}

/** Rough tufts sticking out all over, as after a shock or a blast: corners pushed out, the same amount wherever they meet. */
function frazzle(geo: THREE.BufferGeometry, amount: number) {
  const pos = geo.getAttribute('position') as THREE.BufferAttribute;
  geo.computeBoundingBox();
  const mid = geo.boundingBox!.getCenter(new THREE.Vector3());
  const p = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    const h = Math.sin(Math.round(p.x * 300) * 12.9898 + Math.round(p.y * 300) * 78.233 + Math.round(p.z * 300) * 37.719) * 43758.5453;
    const r = h - Math.floor(h);
    if (r < 0.82) continue;
    const out = p.clone().sub(mid).normalize().multiplyScalar(amount * (r - 0.82) / 0.18);
    pos.setXYZ(i, p.x + out.x, p.y + out.y, p.z + out.z);
  }
  pos.needsUpdate = true;
}

/** The live animal's coat, darkened (for soot or a toasting) and put back: its eyes stay as they are. */
export function tintAnimal(root: THREE.Object3D, color: THREE.Color | null, k = 1) {
  root.traverse((o) => {
    const mesh = o as THREE.SkinnedMesh;
    if (!mesh.isSkinnedMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const m = mats[0] as THREE.MeshToonMaterial;
    if (!m?.color || m.transparent) return;
    const base = (m.userData.execBase as THREE.Color | undefined) ?? (m.userData.execBase = m.color.clone());
    if (!color) {
      m.color.copy(base);
      delete m.userData.execBase;
    } else m.color.copy(base).lerp(color, THREE.MathUtils.clamp(k, 0, 1));
  });
}

/**
 * The animal measured as it stands now, in its own space (feet at the origin, facing +z): its bounds, its neck
 * (where the head turns) and the middle of its head, so the head can be told from the rest.
 */
export interface Build {
  box: THREE.Box3;
  neck: THREE.Vector3;
  head: THREE.Vector3;
  /** The front of the face, low down: about where the mouth is. */
  mouth: THREE.Vector3;
}

export function measureAnimal(root: THREE.Object3D): Build {
  root.updateMatrixWorld(true);
  const toLocal = root.matrixWorld.clone().invert();
  const box = new THREE.Box3();
  const head = new THREE.Vector3();
  const mouth = new THREE.Vector3(0, 0, -Infinity);
  let heads = 0;
  let neck: THREE.Vector3 | null = null;
  root.traverseVisible((o) => {
    const mesh = o as THREE.SkinnedMesh;
    if (!mesh.isSkinnedMesh) return;
    const nb = mesh.skeleton.bones.find((b) => b.name === 'neck');
    if (nb) neck = new THREE.Vector3().setFromMatrixPosition(nb.matrixWorld).applyMatrix4(toLocal);
    // Which bones ride on the neck.
    const onHead = new Set<number>();
    mesh.skeleton.bones.forEach((b, i) => {
      for (let x: THREE.Object3D | null = b; x && x !== mesh.parent; x = x.parent) {
        if (x === nb) {
          onHead.add(i);
          break;
        }
      }
    });
    const posed = poseSkinned(mesh);
    const pos = posed.getAttribute('position') as THREE.BufferAttribute;
    const si = mesh.geometry.getAttribute('skinIndex') as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(toLocal);
      box.expandByPoint(v);
      if (onHead.has(si.getX(i))) {
        head.add(v);
        heads++;
        if (v.z > mouth.z) mouth.copy(v);
      }
    }
    posed.dispose();
  });
  if (box.isEmpty()) box.set(new THREE.Vector3(-0.3, 0, -0.3), new THREE.Vector3(0.3, 1, 0.3));
  if (heads) head.divideScalar(heads);
  else head.set(0, box.max.y * 0.75, 0);
  if (!Number.isFinite(mouth.z)) mouth.set(0, head.y, box.max.z);
  // (Level with the lower half of the face, in the middle.)
  mouth.set(head.x, Math.min(mouth.y, head.y - 0.02), mouth.z);
  return { box, neck: neck ?? new THREE.Vector3(0, box.max.y * 0.55, 0), head, mouth };
}
