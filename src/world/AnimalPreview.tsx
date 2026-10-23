import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import * as THREE from 'three';
import { animalThumbnail, buildAnimal, buildPet, type Pet, type Rig } from './animals';
import type { Anim, Look } from './types';
import { drawless } from '../lib/util';
import { Icon } from '../components/Icon';

const LOW = new URLSearchParams(location.search).get('fx') === 'low';
/** The preview only needs to look alive, so it draws at a gentle rate and leaves the rest of the page responsive. */
const FRAME_MS = LOW ? 1000 / 8 : 1000 / 30;
/** How fast a held turn button turns the animal (radians a second), and how far one tap turns it. */
const TURN_SPEED = 2.2;
const TURN_TAP = 0.35;

/**
 * A small turntable showing one animal (and its pet, beside it), for the animal picker. With `turnable`, buttons
 * either side turn it (hold one to keep turning) and it can be dragged round.
 */
export function AnimalPreview({
  look,
  size = 260,
  spin = true,
  anim = 'idle',
  className,
  turnable = false,
}: {
  look: Look;
  size?: number;
  spin?: boolean;
  anim?: Anim;
  className?: string;
  turnable?: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<{ renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; table: THREE.Group; rig: Rig | null; pet: Pet | null } | null>(null);
  const animRef = useRef(anim);
  const spinRef = useRef(spin);
  // Where the turntable is heading, which way a held button is turning it, and whether anyone has turned it yet.
  const turn = useRef({ want: 0.4, hold: 0, touched: false, drag: null as { x: number; want: number } | null });
  const [fallback, setFallback] = useState<string | null>(null);
  animRef.current = anim;
  spinRef.current = spin;

  useEffect(() => {
    const el = canvas.current;
    if (!el || drawless()) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: el, antialias: !LOW, alpha: true, powerPreference: 'low-power' });
    } catch {
      setFallback(animalThumbnail(look, size) || null);
      return;
    }
    renderer.setPixelRatio(LOW ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(size, size, false);
    renderer.shadowMap.enabled = !LOW;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight('#fff8ee', '#9a8a70', 2));
    const sun = new THREE.DirectionalLight('#fff2dc', 1.8);
    sun.position.set(1.5, 4, 2.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(512, 512);
    sun.shadow.camera.left = -1.5;
    sun.shadow.camera.right = 1.5;
    sun.shadow.camera.top = 1.5;
    sun.shadow.camera.bottom = -1.5;
    scene.add(sun);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(0.75, 24), new THREE.ShadowMaterial({ opacity: 0.22 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    // The animal and its pet stand on a turntable together.
    const table = new THREE.Group();
    table.rotation.y = turn.current.want;
    scene.add(table);
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 30);
    camera.position.set(0, 1.25, 3.1);
    camera.lookAt(0, 0.62, 0);
    stage.current = { renderer, scene, camera, table, rig: null, pet: null };

    let raf = 0;
    let last = performance.now();
    const start = last;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      // (A held button turns it at the same pace however few frames a slow machine manages.)
      const held = Math.min((now - last) / 1000, 0.3);
      last = now;
      const st = stage.current;
      if (!st?.rig) return;
      const tt = turn.current;
      if (tt.hold) tt.want += tt.hold * held * TURN_SPEED;
      else if (spinRef.current && !tt.touched) tt.want += dt * 0.6;
      table.rotation.y += (tt.want - table.rotation.y) * (1 - Math.exp(-dt * 12));
      const t = (now - start) / 1000;
      st.rig.update({ anim: animRef.current, speed: animRef.current === 'walk' ? 1.6 : 0, dt, t });
      st.pet?.update(dt, t, animRef.current === 'walk');
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      stage.current?.rig?.dispose();
      stage.current?.pet?.dispose();
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      stage.current = null;
    };
  }, [size]);

  useEffect(() => {
    const st = stage.current;
    if (!st) return;
    st.rig?.dispose();
    const rig = buildAnimal(look);
    st.table.add(rig.root);
    st.rig = rig;
    // Frame tall animals (long ears, antlers) a little further back.
    const top = Math.max(rig.headHeight, 1.1);
    st.camera.position.set(0, 0.55 + top * 0.65, 1.6 + top * 1.35);
    st.camera.lookAt(0, top * 0.52, 0);
  }, [look.animal, look.color, look.hat, size]);

  useEffect(() => {
    const st = stage.current;
    if (!st?.rig) return;
    st.pet?.root.removeFromParent();
    st.pet?.dispose();
    st.pet = look.pet ? buildPet(look.pet) : null;
    if (!st.pet) return;
    // Just beside the animal and a little in front, however wide it is, turned a touch towards it.
    const box = new THREE.Box3().setFromObject(st.rig.root);
    st.pet.root.position.set(Math.min(Math.max(0.5, box.max.x + 0.16), 0.75), 0, 0.28);
    st.pet.root.rotation.y = -0.45;
    st.pet.root.traverse((o) => (o.castShadow = (o as THREE.Mesh).isMesh === true));
    st.table.add(st.pet.root);
  }, [look.pet, look.animal, size]);

  if (fallback) return <img src={fallback} alt="" className={className} width={size} height={size} style={{ width: size, height: size }} />;
  const view = <canvas ref={canvas} className={className} width={size} height={size} style={{ width: size, height: size }} />;
  if (!turnable) return view;

  // Hold a button to keep turning; a tap turns it a little, and the keyboard a step.
  const press = (dir: number) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const tt = turn.current;
    tt.touched = true;
    tt.hold = dir;
    tt.want += dir * TURN_TAP;
  };
  const release = () => (turn.current.hold = 0);
  const step = (dir: number) => {
    turn.current.touched = true;
    turn.current.want += dir * TURN_TAP * 2;
  };
  const drag = {
    onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('button')) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      turn.current.touched = true;
      turn.current.drag = { x: e.clientX, want: turn.current.want };
    },
    onPointerMove: (e: ReactPointerEvent<HTMLDivElement>) => {
      const d = turn.current.drag;
      if (d) turn.current.want = d.want + (e.clientX - d.x) * 0.014;
    },
    onPointerUp: () => (turn.current.drag = null),
    onPointerCancel: () => (turn.current.drag = null),
  };
  return (
    <div className="preview-turn" {...drag}>
      {view}
      <button
        type="button"
        className="preview-turn-btn left"
        aria-label="Turn left"
        title="Turn left"
        onPointerDown={press(-1)}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
        onClick={(e) => e.detail === 0 && step(-1)}
      >
        <Icon name="turnLeft" />
      </button>
      <button
        type="button"
        className="preview-turn-btn right"
        aria-label="Turn right"
        title="Turn right"
        onPointerDown={press(1)}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
        onClick={(e) => e.detail === 0 && step(1)}
      >
        <Icon name="turnRight" />
      </button>
    </div>
  );
}
