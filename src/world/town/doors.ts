import * as THREE from 'three';

/** A front door in town as it was built: at the foot of the door on the wall, facing out along its own +z. */
export interface DoorSpot {
  m: THREE.Matrix4;
  w: number;
  h: number;
  color: string;
  /** A round top over the square part (the public buildings' doors). */
  arched: boolean;
}

/** How long a door takes to swing open, stays open, and swings shut again, in seconds. */
const OPEN_S = 0.45;
const HOLD_S = 1.2;
const SHUT_S = 0.5;
/** How far it swings, in radians. */
const WIDE = 1.45;
/** Just proud of the closed door's ironwork and knobs. */
const FACE = 0.19;

const ease = (t: number) => t * t * (3 - 2 * t);

/** The door's outline, from its hinge side at x = 0: a rectangle, with a half circle on top for an arched one. */
function outline(s: DoorSpot): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(s.w, 0);
  shape.lineTo(s.w, s.h);
  if (s.arched) shape.absarc(s.w / 2, s.h, s.w / 2, 0, Math.PI, false);
  else shape.lineTo(0, s.h);
  shape.lineTo(0, 0);
  return shape;
}

/**
 * Front doors that swing open when someone goes in. The doors themselves are part of the buildings' merged meshes,
 * so opening one lays a dark doorway over it and swings a copy of the door out on its hinges, then back.
 */
export function makeSwingDoors(spots: DoorSpot[]) {
  const group = new THREE.Group();
  group.name = 'swing-doors';
  const dark = new THREE.MeshBasicMaterial({ color: '#21160e' });
  const doors = spots.map((s) => {
    const root = new THREE.Group();
    s.m.decompose(root.position, root.quaternion, root.scale);
    root.visible = false;
    const shape = outline(s);
    const gap = new THREE.Mesh(new THREE.ShapeGeometry(shape, 12), dark);
    gap.position.set(-s.w / 2, 0, FACE);
    const hinge = new THREE.Group();
    hinge.position.set(-s.w / 2, 0, FACE);
    const leafGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false, curveSegments: 12 });
    const leaf = new THREE.Mesh(leafGeo, new THREE.MeshLambertMaterial({ color: s.color }));
    // A dark band where the planks meet the frame, and a ring of a handle.
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.03, s.h, 0.09), new THREE.MeshLambertMaterial({ color: new THREE.Color(s.color).multiplyScalar(0.6) }));
    edge.position.set(s.w - 0.015, s.h / 2, 0.04);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshLambertMaterial({ color: '#e8c35a' }));
    knob.position.set(s.w * 0.82, s.h * 0.5, 0.12);
    hinge.add(leaf, edge, knob);
    root.add(gap, hinge);
    group.add(root);
    const at = new THREE.Vector3().setFromMatrixPosition(s.m);
    return { root, hinge, x: at.x, z: at.z, openedAt: -Infinity };
  });
  // Real time (the town's clock), so a slow machine sees the door swing at the same speed.
  let clock = 0;
  return {
    group,
    /** Swings open the door nearest x, z (if there's one within a few metres). */
    open(x: number, z: number) {
      let best: (typeof doors)[number] | null = null;
      let bestD = 3.2;
      for (const d of doors) {
        const dd = Math.hypot(d.x - x, d.z - z);
        if (dd < bestD) {
          bestD = dd;
          best = d;
        }
      }
      if (!best) return;
      // Already open: it stays open a little longer rather than slamming and swinging again.
      const age = clock - best.openedAt;
      best.openedAt = age >= 0 && age < OPEN_S + HOLD_S + SHUT_S ? clock - Math.min(age, OPEN_S) : clock;
    },
    update(t: number) {
      clock = t;
      for (const d of doors) {
        const age = clock - d.openedAt;
        if (age > OPEN_S + HOLD_S + SHUT_S) {
          if (d.root.visible) d.root.visible = false;
          continue;
        }
        d.root.visible = true;
        const k = age < OPEN_S ? ease(age / OPEN_S) : age < OPEN_S + HOLD_S ? 1 : 1 - ease((age - OPEN_S - HOLD_S) / SHUT_S);
        d.hinge.rotation.y = -WIDE * k;
      }
    },
  };
}
