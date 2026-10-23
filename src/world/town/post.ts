import * as THREE from 'three';
import { POST, POST_COLS, POST_ROWS } from './layout';
import { POST_GRID } from './outdoor';

const FONT = 'Fredoka, "Trebuchet MS", "Segoe UI", system-ui, sans-serif';
/** Pixels per metre on the post office's front. */
const PX = 500;

/**
 * The post office's front: a little door for each player in grimoire order, with a brass slot, their name on a
 * plate, and a red flag (and a letter sticking out of the slot) while letters are waiting for them. One picture over
 * the whole front, redrawn only when a name or a flag changes.
 */
export function postFront() {
  const g = POST_GRID;
  // The picture covers the wooden front, a little wider and taller than the grid, with the title above it.
  const w = 2.3;
  const h = 1.4;
  const left = -w / 2;
  const bottom = 0.2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * PX);
  canvas.height = Math.round(h * PX);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const material = new THREE.MeshLambertMaterial({
    map: texture,
    emissive: '#ffffff',
    emissiveMap: texture,
    emissiveIntensity: 0.12,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  // In the post office's own frame, just in front of the wood (and behind the bars between the doors).
  const holder = new THREE.Group();
  holder.position.set(POST.x, 0, POST.z);
  holder.rotation.y = POST.ry;
  mesh.position.set(0, bottom + h / 2, g.z + 0.008);
  mesh.receiveShadow = true;
  holder.add(mesh);
  holder.name = 'post-front';

  // Canvas pixels for a point on the front, in metres (y up).
  const cx = (x: number) => (x - left) * PX;
  const cy = (y: number) => (bottom + h - y) * PX;
  let key = '';

  const draw = (names: string[], mail: boolean[]) => {
    const c = canvas.getContext('2d');
    if (!c) return;
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = '#7a4f30';
    c.fillRect(0, 0, canvas.width, canvas.height);
    // The title on a red board above the doors.
    c.fillStyle = '#9a2f2a';
    c.beginPath();
    c.roundRect(cx(g.x0), cy(bottom + h - 0.02), (g.x1 - g.x0) * PX, (bottom + h - 0.02 - g.y1 - 0.025) * PX, 14);
    c.fill();
    c.fillStyle = '#f2d27a';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = `700 ${Math.round(0.09 * PX)}px ${FONT}`;
    c.fillText('✉  RAVENSWOOD POST  ✉', cx(0), cy((bottom + h - 0.02 + g.y1 + 0.025) / 2) + 2);
    const cw = (g.x1 - g.x0) / POST_COLS;
    const rh = (g.y1 - g.y0) / POST_ROWS;
    for (let i = 0; i < POST_COLS * POST_ROWS; i++) {
      const col = i % POST_COLS;
      const row = Math.floor(i / POST_COLS);
      const x0 = cx(g.x0 + col * cw) + 8;
      const y0 = cy(g.y1 - row * rh) + 8;
      const dw = cw * PX - 16;
      const dh = rh * PX - 16;
      const name = names[i];
      // The door.
      c.fillStyle = name ? '#9a6a42' : '#6a4630';
      c.beginPath();
      c.roundRect(x0, y0, dw, dh, 10);
      c.fill();
      c.strokeStyle = 'rgba(40, 24, 12, 0.45)';
      c.lineWidth = 4;
      c.stroke();
      if (name === undefined) continue;
      // The brass slot.
      const sw = dw * 0.62;
      const sx = x0 + (dw - sw) / 2;
      const sy = y0 + dh * 0.16;
      c.fillStyle = '#d8b25a';
      c.beginPath();
      c.roundRect(sx - 6, sy - 6, sw + 12, 26, 8);
      c.fill();
      c.fillStyle = '#2a1d12';
      c.beginPath();
      c.roundRect(sx, sy, sw, 14, 6);
      c.fill();
      // The name plate.
      const pw = dw * 0.86;
      const ph = dh * 0.36;
      const px = x0 + (dw - pw) / 2;
      const py = y0 + dh * 0.52;
      c.fillStyle = '#f4ead2';
      c.beginPath();
      c.roundRect(px, py, pw, ph, 8);
      c.fill();
      c.strokeStyle = '#c9a24f';
      c.lineWidth = 3;
      c.stroke();
      let size = Math.round(ph * 0.62);
      c.font = `600 ${size}px ${FONT}`;
      const label = name || '·';
      while (c.measureText(label).width > pw * 0.9 && size > 12) {
        size -= 2;
        c.font = `600 ${size}px ${FONT}`;
      }
      c.fillStyle = '#3b2a1e';
      c.fillText(label, px + pw / 2, py + ph / 2 + 2);
      if (!mail[i]) continue;
      // Letters waiting: an envelope poking out of the slot, and the little red flag up.
      c.save();
      c.translate(sx + sw * 0.55, sy + 2);
      c.rotate(-0.12);
      c.fillStyle = '#fffaf0';
      c.fillRect(-28, -26, 56, 32);
      c.strokeStyle = '#c9b89a';
      c.lineWidth = 2;
      c.strokeRect(-28, -26, 56, 32);
      c.beginPath();
      c.moveTo(-28, -26);
      c.lineTo(0, -8);
      c.lineTo(28, -26);
      c.stroke();
      c.restore();
      const fx = x0 + dw - 18;
      c.fillStyle = '#3b2a1e';
      c.fillRect(fx, y0 + 8, 5, dh * 0.42);
      c.fillStyle = '#d8343a';
      c.beginPath();
      c.moveTo(fx, y0 + 8);
      c.lineTo(fx - 30, y0 + 18);
      c.lineTo(fx, y0 + 30);
      c.closePath();
      c.fill();
    }
    texture.needsUpdate = true;
  };

  return {
    object: holder,
    /** Names in grimoire order, and which of them have letters waiting. */
    set(names: string[], mail: boolean[]) {
      const shown = names.slice(0, POST_COLS * POST_ROWS);
      const next = JSON.stringify([shown, mail.slice(0, shown.length)]);
      if (next === key) return;
      key = next;
      draw(shown, mail);
    },
    /** Once the web font has arrived, the names are drawn again in it. */
    redraw() {
      if (!key) return;
      const [names, mail] = JSON.parse(key) as [string[], boolean[]];
      draw(names, mail);
    },
    dispose() {
      texture.dispose();
      material.dispose();
      mesh.geometry.dispose();
    },
  };
}
