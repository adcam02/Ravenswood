import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { getRole } from '../data';
import { drawless } from '../lib/util';
import type { SeatView } from '../state/view';
import { buildAnimal, buildPet, type Pet, type Rig } from '../world/animals';
import { townCovered } from '../world/engine';
import { Fireworks } from '../world/fireworks';
import { AURA, VICTORY_PROPS } from '../world/victoryMoves';
import { victoryAnim, victoryMove } from '../world/victoryShop';
import { PetFeel } from '../world/petMood';

const params = new URLSearchParams(location.search);
const LOW = params.get('fx') === 'low';
const FRAME_MS = Math.max(LOW ? 1000 / 12 : 1000 / 40, 1000 / (Number(params.get('fps')) || 60));
/** How long the lineup lasts before the card with the recap comes up. */
export const LINEUP_SECONDS = 14;
/** Metres between winners in a row, and between rows (each row behind on a step up). */
const GAP = 1.35;
const ROW = 1.05;
const STEP = 0.8;

const TEAM = {
  good: { name: 'Good', sky: ['#060b1f', '#12306b', '#3b6fc4'], stage: '#1d2742', rim: ['#7cc4ff', '#ffe08a'], spot: '#cfe6ff' },
  evil: { name: 'Evil', sky: ['#12030a', '#4a0b22', '#8a1f3c'], stage: '#2a1119', rim: ['#ff5d6c', '#b46bff'], spot: '#ffd0d6' },
} as const;

/** The sky behind the stage: dark at the top, the team's colour glowing up from the horizon. */
function skyTexture(winner: 'good' | 'evil'): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 256;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  const [top, mid, low] = TEAM[winner].sky;
  grad.addColorStop(0, top);
  grad.addColorStop(0.6, mid);
  grad.addColorStop(1, low);
  g.fillStyle = grad;
  g.fillRect(0, 0, 4, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** A little stage microphone, standing up out of the paw. */
function microphone(): THREE.Object3D {
  const g = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.012, 0.16, 10), new THREE.MeshStandardMaterial({ color: '#222', roughness: 0.5 }));
  handle.position.y = 0.05;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.036, 14, 10), new THREE.MeshStandardMaterial({ color: '#b8bcc4', metalness: 0.6, roughness: 0.35 }));
  head.position.y = 0.15;
  g.add(handle, head);
  return g;
}

interface Winner {
  seat: SeatView;
  rig: Rig;
  pet: Pet | null;
  /** Their pet's celebrating, and where it stands. */
  feel: PetFeel | null;
  at: { x: number; y: number; z: number };
  /** When their move starts (lineup seconds), one after another down the line. */
  start: number;
  mic: { obj: THREE.Object3D; held: boolean; vy: number } | null;
  aura: THREE.Mesh | null;
}

/** Where each winner stands: rows of at most `per`, the front row first, each row behind a step up. */
function layout(n: number, per: number, gap: number): { x: number; y: number; z: number; row: number }[] {
  const rows = Math.ceil(n / per);
  const out: { x: number; y: number; z: number; row: number }[] = [];
  for (let r = 0; r < rows; r++) {
    // (The front row takes the remainder when they don't divide evenly, so the back rows are full.)
    const count = r === 0 ? n - per * (rows - 1) : per;
    // (Rows of the same evenness would stand right behind each other: every other one goes half a place across.)
    const front = n - per * (rows - 1);
    const shift = rows > 1 && front % 2 === per % 2 ? (r % 2 ? gap / 4 : -gap / 4) : 0;
    for (let i = 0; i < count; i++) out.push({ x: (i - (count - 1) / 2) * gap + shift, y: r * STEP, z: -r * ROW, row: r });
  }
  return out;
}

/**
 * The end-of-match lineup: the winning team side by side on a little stage with the fireworks going off behind,
 * hats, pets and names, each doing their victory move (chosen in Customise, see world/victoryShop.ts), the camera
 * coming in on them and the title over the top. Everyone sees it; it lasts about fourteen seconds, or until skipped.
 */
export function VictoryLineup({ winner, seats, reason, onDone }: { winner: 'good' | 'evil'; seats: SeatView[]; reason: string; onDone: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const tags = useRef<(HTMLDivElement | null)[]>([]);
  const shouts = useRef<(HTMLDivElement | null)[]>([]);
  // (Whoever was on the winning team when it ended: later changes don't rebuild the stage.)
  const [cast] = useState(() => seats.filter((s) => s.look));
  const [leaving, setLeaving] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const el = canvas.current;
    if (!el || drawless() || !cast.length) {
      done.current();
      return;
    }
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: el, antialias: !LOW, powerPreference: 'high-performance' });
    } catch {
      done.current();
      return;
    }
    townCovered.on = true;
    const team = TEAM[winner];
    renderer.setPixelRatio(LOW ? 1 : Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = !LOW;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    const sky = skyTexture(winner);
    scene.background = sky;
    scene.fog = new THREE.Fog(team.sky[1], 14, 34);

    // Lit from the front for the faces, with the team's colours catching the edges from behind.
    scene.add(new THREE.HemisphereLight('#fff6ea', team.sky[1], 1.5));
    const key = new THREE.DirectionalLight('#fff4e2', 2.2);
    key.position.set(2, 7, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const rims = team.rim.map((c, i) => {
      const l = new THREE.DirectionalLight(c, 2.4);
      l.position.set(i ? 6 : -6, 4, -6);
      scene.add(l);
      return l;
    });

    // Who stands where: as many to a row as the screen is wide for.
    const per = () => {
      const aspect = el.clientWidth / Math.max(1, el.clientHeight);
      return aspect < 0.6 ? 2 : aspect < 0.75 ? 3 : aspect < 1.25 ? 4 : 6;
    };
    const perRow = Math.min(cast.length, per());
    // (Closer together on a narrow screen.)
    const gap = el.clientWidth < el.clientHeight ? 1.08 : GAP;
    const spots = layout(cast.length, perRow, gap);
    const rows = Math.ceil(cast.length / perRow);
    const width = (perRow - 1) * gap + (rows > 1 ? gap / 2 : 0) + 1.3;

    // The stage: a round dais, gold-edged, with a step up for each row behind.
    const owned: { dispose(): void }[] = [sky];
    const stageMat = new THREE.MeshStandardMaterial({ color: team.stage, roughness: 0.35, metalness: 0.25 });
    const goldMat = new THREE.MeshStandardMaterial({ color: '#e8b648', emissive: '#6a4a10', roughness: 0.3, metalness: 0.8 });
    owned.push(stageMat, goldMat);
    const radius = Math.max(width / 2 + 0.6, 2.2);
    const disc = (r: number, y: number, z: number) => {
      const geo = new THREE.CylinderGeometry(r, r + 0.06, 0.3, 64);
      const m = new THREE.Mesh(geo, stageMat);
      m.position.set(0, y - 0.15, z);
      m.receiveShadow = true;
      scene.add(m);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.01, 0.025, 6, 64), goldMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(0, y, z);
      scene.add(ring);
      owned.push(geo, ring.geometry);
    };
    disc(radius, 0, -(rows - 1) * ROW * 0.5);
    // Steps up for the rows behind, like a team photo's benches, gold along the front edge.
    for (let r = 1; r < rows; r++) {
      const geo = new THREE.BoxGeometry(width + 0.6, r * STEP, ROW);
      const m = new THREE.Mesh(geo, stageMat);
      m.position.set(0, (r * STEP) / 2, -r * ROW);
      m.receiveShadow = m.castShadow = true;
      const edgeGeo = new THREE.BoxGeometry(width + 0.62, 0.04, 0.04);
      const edge = new THREE.Mesh(edgeGeo, goldMat);
      edge.position.set(0, r * STEP, -r * ROW + ROW / 2);
      scene.add(m, edge);
      owned.push(geo, edgeGeo);
    }

    // A pool of light on the stage under each of them, and a soft beam coming down.
    const poolGeo = new THREE.CircleGeometry(0.55, 32);
    const beamGeo = new THREE.ConeGeometry(0.7, 7, 24, 1, true);
    const poolMat = new THREE.MeshBasicMaterial({ color: team.spot, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending });
    const beamMat = new THREE.MeshBasicMaterial({ color: team.spot, transparent: true, opacity: 0.05, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
    owned.push(poolGeo, beamGeo, poolMat, beamMat);
    for (const p of spots) {
      const pool = new THREE.Mesh(poolGeo, poolMat);
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(p.x, p.y + 0.004, p.z);
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(p.x, p.y + 3.5, p.z);
      scene.add(pool, beam);
    }

    const fireworks = new Fireworks({ x: 0, z: -9 });
    fireworks.start(winner, LINEUP_SECONDS);
    scene.add(fireworks.points);
    owned.push(fireworks);

    const auraGeo = new THREE.CylinderGeometry(0.42, 0.62, 1, 20, 1, true);
    owned.push(auraGeo);
    const people: Winner[] = cast.map((seat, i) => {
      const p = spots[i];
      const rig = buildAnimal(seat.look!);
      rig.root.position.set(p.x, p.y, p.z);
      // (On the stage, even up a step: the props that stand on the floor are wanted. See world/victoryProps.ts.)
      rig.root.userData.stage = true;
      // (Turned a touch in towards the middle, like a team photo.)
      rig.root.rotation.y = -p.x * 0.05;
      rig.root.traverse((o) => (o.castShadow = (o as THREE.Mesh).isMesh === true));
      scene.add(rig.root);
      let pet: Pet | null = null;
      let feel: PetFeel | null = null;
      if (seat.look!.pet) {
        pet = buildPet(seat.look!.pet);
        pet.root.position.set(p.x + 0.45, p.y, p.z + 0.4);
        pet.root.rotation.y = -0.35;
        pet.root.traverse((o) => (o.castShadow = (o as THREE.Mesh).isMesh === true));
        scene.add(pet.root);
        // It celebrates too (world/petMood.ts), once its owner starts.
        feel = new PetFeel();
        feel.measure(pet.root);
        scene.add(feel.group);
      }
      const move = victoryMove(seat.look!.win);
      const mic = VICTORY_PROPS[move.id] ? { obj: microphone(), held: false, vy: 0 } : null;
      let aura: THREE.Mesh | null = null;
      if (AURA[move.id]) {
        aura = new THREE.Mesh(auraGeo, new THREE.MeshBasicMaterial({ color: '#ffd34d', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
        aura.scale.y = rig.headHeight * 1.5;
        aura.position.set(p.x, p.y + aura.scale.y / 2, p.z);
        scene.add(aura);
      }
      return { seat, rig, pet, feel, at: { x: p.x + 0.45, y: p.y, z: p.z + 0.4 }, start: 0.9 + i * 0.18, mic, aura };
    });

    // Framed so the whole team fits under the title, coming in from further out and round to one side.
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
    const tanH = Math.tan(THREE.MathUtils.degToRad(15));
    const head = Math.max(...people.map((w) => w.rig.headHeight));
    const tall = (rows - 1) * STEP + head + 0.5;
    const mid = { y: ((rows - 1) * STEP + head) / 2, z: -(rows - 1) * ROW * 0.5 };
    let dist = 6;
    const fit = () => {
      const w = el.clientWidth || window.innerWidth;
      const h = el.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // (Only about the middle 60% of the height is free: the title is over the top, the names along the bottom.)
      dist = Math.max(tall / 0.62 / 2 / tanH, width / 2 / (tanH * camera.aspect)) + (rows - 1) * ROW * 0.5;
      const k = key.shadow.camera;
      k.left = k.bottom = -radius - 1;
      k.right = k.top = radius + 1;
      k.updateProjectionMatrix();
    };
    fit();
    window.addEventListener('resize', fit);

    const v = new THREE.Vector3();
    const place = (div: HTMLDivElement | null | undefined, x: number, y: number, z: number) => {
      if (!div) return;
      v.set(x, y, z).project(camera);
      div.style.transform = `translate(-50%, -50%) translate(${((v.x + 1) / 2) * el.clientWidth}px, ${((1 - v.y) / 2) * el.clientHeight}px)`;
    };

    let raf = 0;
    let last = performance.now();
    let t = 0;
    let ending = false;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      // (Its own clock, so a struggling machine sees the whole show, just slower, rather than skipping it.)
      t += dt;
      // The camera swings in over the first few seconds, then drifts.
      const inK = 1 - Math.pow(1 - Math.min(1, t / 3), 3);
      const d = dist * (1.55 - 0.55 * inK);
      const yaw = 0.42 * (1 - inK) + Math.sin(t * 0.25) * 0.05 * inK;
      camera.position.set(Math.sin(yaw) * d, mid.y + d * 0.12 + (1 - inK) * 1.2, mid.z + Math.cos(yaw) * d);
      // (The team sits a little below the middle of the picture, under the title.)
      camera.lookAt(0, mid.y + d * tanH * 0.2, mid.z);
      for (const l of rims) l.intensity = 2.4 + Math.sin(t * 3 + l.position.x) * 0.5;
      fireworks.update(dt);
      people.forEach((w, i) => {
        const go = t >= w.start;
        const anim = go ? victoryAnim(w.seat.look!.win) : t > 0.3 ? 'cheer' : 'idle';
        w.rig.update({ anim, speed: 0, dt, t });
        w.pet?.update(dt, t, false);
        if (w.pet && w.feel) {
          w.pet.root.position.set(w.at.x, w.at.y, w.at.z);
          w.pet.root.rotation.y = -0.35;
          w.feel.apply(w.pet.root, go ? { kind: 'cheer' } : null, dt, t);
        }
        const into = t - w.start;
        if (w.mic) {
          const prop = VICTORY_PROPS[victoryMove(w.seat.look!.win).id]!;
          const c = go ? into % prop.loop : 0;
          if (c < prop.drop && !w.mic.held) {
            w.mic.obj.position.set(0, 0, 0);
            w.mic.obj.rotation.set(0, 0, 0);
            w.rig.holdProp?.(w.mic.obj);
            w.mic.held = true;
          } else if (c >= prop.drop && w.mic.held) {
            // Let go: it falls to the stage from where the paw was, and lies there.
            scene.attach(w.mic.obj);
            w.mic.held = false;
            w.mic.vy = 0;
          }
          if (!w.mic.held) {
            const o = w.mic.obj;
            const floor = spots[i].y + 0.04;
            if (o.position.y > floor) {
              w.mic.vy -= 9.8 * dt;
              o.position.y = Math.max(floor, o.position.y + w.mic.vy * dt);
              o.rotation.z += dt * 6;
            } else o.rotation.z = Math.PI / 2;
          }
        }
        if (w.aura) {
          const c = go ? into % 3 : 0;
          const build = go ? THREE.MathUtils.smoothstep(c, 0, 2.2) : 0;
          const burst = THREE.MathUtils.smoothstep(c, 2.2, 2.4) * (1 - THREE.MathUtils.smoothstep(c, 2.8, 3));
          const mat = w.aura.material as THREE.MeshBasicMaterial;
          mat.opacity = go ? 0.08 + build * 0.22 + burst * 0.35 + Math.sin(t * 31) * 0.04 : 0;
          w.aura.scale.x = w.aura.scale.z = 1 + burst * 0.5 + Math.sin(t * 17) * 0.04;
          w.aura.rotation.y += dt * 3;
        }
        const p = spots[i];
        // (A name plate at the feet for the front row; over the head for the rows behind, where the feet are hidden.)
        const over = p.row > 0;
        place(tags.current[i], p.x, over ? p.y + w.rig.headHeight + 0.3 : p.y - 0.12, over ? p.z : p.z + 0.55);
        place(shouts.current[i], p.x, p.y + w.rig.headHeight + (over ? 0.85 : 0.3), p.z);
        const bubble = shouts.current[i];
        if (bubble) {
          const c = into % 6;
          bubble.classList.toggle('on', go && c > 1 && c < 4);
        }
      });
      renderer.render(scene, camera);
      if (!ending && t > LINEUP_SECONDS - 0.7) {
        ending = true;
        setLeaving(true);
      }
      if (t > LINEUP_SECONDS) done.current();
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', fit);
      townCovered.on = false;
      for (const w of people) {
        w.rig.holdProp?.(null);
        w.rig.dispose();
        w.pet?.dispose();
        w.feel?.dispose();
        if (w.aura) (w.aura.material as THREE.Material).dispose();
        if (w.mic) w.mic.obj.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.isMesh) {
            m.geometry.dispose();
            (m.material as THREE.Material).dispose();
          }
        });
      }
      for (const o of owned) o.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => (e.key === 'Escape' || e.key === 'Enter') && done.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className={`lineup ${winner} ${leaving ? 'leaving' : ''}`} role="dialog" aria-label={`${TEAM[winner].name} wins`}>
      <canvas ref={canvas} className="lineup-canvas" />
      <div className="lineup-head">
        <span className="victory-eyebrow">The game is over</span>
        <h1 className="victory-title">{TEAM[winner].name} wins!</h1>
        <p className="victory-reason">{reason}</p>
      </div>
      <div className="lineup-tags" aria-hidden="true">
        {cast.map((s, i) => {
          const move = victoryMove(s.look?.win);
          return (
            <div key={s.id}>
              <div ref={(d) => void (tags.current[i] = d)} className={`lineup-tag ${s.isMe ? 'me' : ''}`} style={{ animationDelay: `${1 + i * 0.12}s` }}>
                <b>
                  {s.dead && '👻 '}
                  {s.label}
                </b>
                <span>{getRole(s.roleId)?.name ?? ''}</span>
                <em>
                  {move.icon} {move.name}
                </em>
              </div>
              {move.shout && (
                <div ref={(d) => void (shouts.current[i] = d)} className="lineup-shout">
                  {move.shout}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button className="cosy-btn lineup-skip" onClick={() => done.current()}>
        Continue <span className="cosy-key">Enter</span>
      </button>
    </div>
  );
}
