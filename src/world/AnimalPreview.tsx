import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { buildAnimal, type Rig } from './animals';
import type { Anim, Look } from './types';

/** A small turntable showing one animal, for the animal picker. */
export function AnimalPreview({ look, size = 260, spin = true, anim = 'idle', className }: { look: Look; size?: number; spin?: boolean; anim?: Anim; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<{ renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; rig: Rig | null } | null>(null);
  const animRef = useRef(anim);
  const spinRef = useRef(spin);
  animRef.current = anim;
  spinRef.current = spin;

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(size, size, false);
    renderer.shadowMap.enabled = true;
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
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 30);
    camera.position.set(0, 1.25, 3.1);
    camera.lookAt(0, 0.62, 0);
    stage.current = { renderer, scene, camera, rig: null };

    let raf = 0;
    let last = performance.now();
    const start = last;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const st = stage.current;
      if (!st?.rig) return;
      if (spinRef.current) st.rig.root.rotation.y += dt * 0.6;
      st.rig.update({ anim: animRef.current, speed: animRef.current === 'walk' ? 1.6 : 0, dt, t: (now - start) / 1000 });
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      stage.current?.rig?.dispose();
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
    const ry = st.rig?.root.rotation.y ?? 0.4;
    st.rig?.dispose();
    const rig = buildAnimal(look);
    rig.root.rotation.y = ry;
    st.scene.add(rig.root);
    st.rig = rig;
    // Frame tall animals (long ears, antlers) a little further back.
    const top = Math.max(rig.headHeight, 1.1);
    st.camera.position.set(0, 0.55 + top * 0.65, 1.6 + top * 1.35);
    st.camera.lookAt(0, top * 0.52, 0);
  }, [look.animal, look.color, size]);

  return <canvas ref={canvas} className={className} width={size} height={size} style={{ width: size, height: size }} />;
}
