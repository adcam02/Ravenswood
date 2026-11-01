import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { buildAnimal } from '../animals';
import { ANIMALS, type AnimalId, type HatId } from '../types';

/**
 * The statue gravestone's statue: a player's own animal (and the hat they had on), carved in weathered grey stone
 * with moss creeping up from its feet. Baked once per animal and hat from the animal's own model, standing at rest,
 * into one plain geometry with the stone's colours on its corners, so each statue in the churchyard is one small
 * draw call with the stones' shared material. Positions and colours only, to be painted in with a Builder. Origin
 * at its feet, facing +z, about `STATUE_H` tall.
 */

export interface StatueLook {
  animal: AnimalId;
  hat?: HatId | null;
}

export const STATUE_H = 0.7;
const STONE = new THREE.Color('#a39e94');
const DARK = new THREE.Color('#857f76');
const MOSS = new THREE.Color('#6a8648');

const baked = new Map<string, THREE.BufferGeometry>();
export const statueKey = (s: StatueLook) => `${s.animal}:${s.hat ?? ''}`;

export function statueGeometry(s: StatueLook): THREE.BufferGeometry {
  const key = statueKey(s);
  let g = baked.get(key);
  if (g) return g;
  const info = ANIMALS.find((a) => a.id === s.animal) ?? ANIMALS[0];
  const rig = buildAnimal({ animal: info.id, color: info.colors[0], hat: s.hat ?? null });
  // The cheaper model is plenty in stone, at this size.
  rig.setDetail('low');
  rig.update({ anim: 'idle', speed: 0, dt: 0.016, t: 0 });
  rig.root.updateMatrixWorld(true);
  const parts: THREE.BufferGeometry[] = [];
  const v = new THREE.Vector3();
  const shown = (o: THREE.Object3D) => {
    for (let p: THREE.Object3D | null = o; p; p = p.parent) if (!p.visible) return false;
    return true;
  };
  rig.root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || (o as THREE.InstancedMesh).isInstancedMesh || !shown(o)) return;
    const mat = mesh.material as THREE.Material;
    if (mat && !Array.isArray(mat) && mat.transparent && mat.opacity < 0.6) return;
    const src = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry;
    const pos = src.getAttribute('position');
    const out = new Float32Array(pos.count * 3);
    const skinned = (mesh as THREE.SkinnedMesh).isSkinnedMesh ? (mesh as THREE.SkinnedMesh) : null;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      if (skinned) skinned.applyBoneTransform(i, v);
      v.applyMatrix4(mesh.matrixWorld);
      out.set([v.x, v.y, v.z], i * 3);
    }
    if (src !== mesh.geometry) src.dispose();
    const part = new THREE.BufferGeometry();
    part.setAttribute('position', new THREE.BufferAttribute(out, 3));
    parts.push(part);
  });
  rig.dispose();
  g = mergeGeometries(parts) ?? new THREE.BufferGeometry();
  for (const p of parts) p.dispose();
  // Stood on its feet and made the statue's size.
  g.computeBoundingBox();
  const box = g.boundingBox!;
  const k = Math.min(STATUE_H / Math.max(0.1, box.max.y - box.min.y), 0.62 / Math.max(0.1, box.max.x - box.min.x), 0.5 / Math.max(0.1, box.max.z - box.min.z));
  g.translate(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
  g.scale(k, k, k);
  // Weathered: each face a slightly different grey, darker in the hollows low down, and moss up from the feet.
  const pos = g.getAttribute('position');
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let f = 0; f < pos.count; f += 3) {
    const y = (pos.getY(f) + pos.getY(f + 1) + pos.getY(f + 2)) / 3;
    const n = Math.sin(pos.getX(f) * 61 + pos.getZ(f) * 37 + y * 23) * 0.5 + 0.5;
    c.copy(STONE).lerp(DARK, n * 0.45 + Math.max(0, 0.2 - y) * 1.2);
    const moss = Math.max(0, 1 - y / 0.16) * 0.75 + (n > 0.93 ? 0.35 : 0);
    c.lerp(MOSS, Math.min(0.8, moss));
    for (let j = 0; j < 3; j++) c.toArray(colors, (f + j) * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  baked.set(key, g);
  return g;
}
