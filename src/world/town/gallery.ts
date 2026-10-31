import * as THREE from 'three';
import { Builder } from '../build';
import { GALLERY } from './layout';
import { Paint, smoothMesh } from './kit';
import { matte } from '../build';
import { IRON, WOOD, WOOD_DARK } from './props';

const FONT = 'Fredoka, "Trebuchet MS", "Segoe UI", system-ui, sans-serif';
/** Pixels per metre on the board's front. */
const PX = 420;
/** Frames on the board: rows from the top, and how many across. */
export const GALLERY_COLS = 5;
export const GALLERY_ROWS = 3;
/** The board, in its own frame: its width and the heights of its bottom and top edges. */
const BOARD = { w: GALLERY.w, y0: 0.38, y1: 2.78 };

/** One piece on the board: its picture (a data URL; null for one that's missing), and once the voting's over, who and how it did. */
export interface GalleryPiece {
  id: string;
  img: string | null | undefined;
  name?: string;
  place?: number;
}

/**
 * The gallery by the post office: an open-air picture board under a little shingled roof, with the night's drawings
 * hung on it in frames. The frames and pictures are one picture over the board's front, drawn again only when
 * something on it changes (like the post office's letterboxes).
 */
export function galleryStand() {
  const holder = new THREE.Group();
  holder.position.set(GALLERY.x, 0, GALLERY.z);
  holder.rotation.y = GALLERY.ry;
  holder.name = 'gallery';

  // The board itself: two posts, a painted backing, a roof and a name board, and a lantern either end.
  const main = new Builder();
  const glass = new Builder();
  const p = new Paint({ main, glass });
  const hw = BOARD.w / 2;
  for (const sx of [-1, 1]) {
    p.box(WOOD_DARK, 0.18, 3.3, 0.18, sx * (hw + 0.1), 1.65, -0.02);
    p.box('#a8a196', 0.34, 0.12, 0.34, sx * (hw + 0.1), 0.06, -0.02);
    // Lanterns on brackets, out from the posts.
    p.box(IRON, 0.32, 0.04, 0.04, sx * (hw + 0.3), 2.92, 0.12);
    p.box(IRON, 0.16, 0.2, 0.16, sx * (hw + 0.42), 2.78, 0.12);
    p.glass.box('#ffe7a0', 0.12, 0.16, 0.12, sx * (hw + 0.42), 2.78, 0.12);
  }
  p.box('#3f5f4a', BOARD.w, BOARD.y1 - BOARD.y0 + 0.1, 0.1, 0, (BOARD.y0 + BOARD.y1) / 2, -0.06);
  p.box(WOOD, BOARD.w + 0.1, 0.08, 0.16, 0, BOARD.y0 - 0.03, -0.02);
  p.box(WOOD, BOARD.w + 0.1, 0.08, 0.16, 0, BOARD.y1 + 0.06, -0.02);
  // The name board above.
  p.box(WOOD_DARK, 2.5, 0.4, 0.08, 0, 3.12, -0.03);
  p.roof('#5f7f9a', BOARD.w + 0.3, 0.7, 0.32, 3.34, 0.14, 0.06, 0, -0.04);
  const frame = smoothMesh(main, matte());
  frame.castShadow = true;
  frame.receiveShadow = true;
  holder.add(frame);
  const lamps = glass.mesh(new THREE.MeshBasicMaterial({ vertexColors: true }), { cast: false, receive: false });
  holder.add(lamps);

  // The name, painted on the board.
  const nameCanvas = document.createElement('canvas');
  nameCanvas.width = 2.4 * 300;
  nameCanvas.height = 0.34 * 300;
  const nameTex = new THREE.CanvasTexture(nameCanvas);
  nameTex.colorSpace = THREE.SRGBColorSpace;
  const nameMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.34), new THREE.MeshLambertMaterial({ map: nameTex, emissive: '#ffffff', emissiveMap: nameTex, emissiveIntensity: 0.2 }));
  nameMesh.position.set(0, 3.12, 0.015);
  holder.add(nameMesh);
  const drawName = () => {
    const c = nameCanvas.getContext('2d');
    if (!c) return;
    c.fillStyle = '#4f321f';
    c.fillRect(0, 0, nameCanvas.width, nameCanvas.height);
    c.fillStyle = '#f2d27a';
    c.font = `700 ${Math.round(nameCanvas.height * 0.56)}px ${FONT}`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('✦  THE NIGHT GALLERY  ✦', nameCanvas.width / 2, nameCanvas.height / 2 + 3);
    nameTex.needsUpdate = true;
  };
  drawName();

  // The pictures, over the backing.
  const h = BOARD.y1 - BOARD.y0;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(BOARD.w * PX);
  canvas.height = Math.round(h * PX);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const material = new THREE.MeshLambertMaterial({ map: texture, emissive: '#ffffff', emissiveMap: texture, emissiveIntensity: 0.14 });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(BOARD.w, h), material);
  board.position.set(0, BOARD.y0 + h / 2, 0.0);
  board.receiveShadow = true;
  holder.add(board);

  const loaded = new Map<string, HTMLImageElement>();
  let key = '';
  let shown: { title: string; pieces: GalleryPiece[] } = { title: '', pieces: [] };

  const draw = () => {
    const c = canvas.getContext('2d');
    if (!c) return;
    const W = canvas.width;
    const H = canvas.height;
    c.fillStyle = '#3f5f4a';
    c.fillRect(0, 0, W, H);
    // A strip along the top: what they were asked to draw.
    const strip = H * 0.1;
    c.fillStyle = '#f4ead2';
    c.beginPath();
    c.roundRect(W * 0.08, 6, W * 0.84, strip - 10, 12);
    c.fill();
    c.fillStyle = '#3b2a1e';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    let size = Math.round(strip * 0.52);
    c.font = `600 ${size}px ${FONT}`;
    const title = shown.title ? `“${shown.title}”` : 'Tonight’s drawings hang here in the morning';
    while (c.measureText(title).width > W * 0.8 && size > 12) {
      size -= 2;
      c.font = `600 ${size}px ${FONT}`;
    }
    c.fillText(title, W / 2, strip / 2 + 1);
    const pieces = shown.pieces.slice(0, GALLERY_COLS * GALLERY_ROWS);
    const cols = GALLERY_COLS;
    const rows = GALLERY_ROWS;
    const gap = W * 0.022;
    const cw = (W - gap * (cols + 1)) / cols;
    const ch = (H - strip - gap * (rows + 1)) / rows;
    // 4:3 pictures in their frames, centred in each cell.
    const fw = Math.min(cw, ((ch - 18) * 4) / 3);
    const fh = (fw * 3) / 4;
    // Rows fill from the middle one out, so a few pieces sit at eye height.
    const order = rows === 3 ? [1, 0, 2] : Array.from({ length: rows }, (_, i) => i);
    pieces.forEach((piece, i) => {
      const row = order[Math.floor(i / cols)];
      const inRow = Math.min(cols, pieces.length - Math.floor(i / cols) * cols);
      const col = (i % cols) + (cols - inRow) / 2;
      const x = gap + col * (cw + gap) + (cw - fw) / 2;
      const y = strip + gap + row * (ch + gap) + (ch - fh - 18) / 2;
      const border = fw * 0.06;
      c.fillStyle = piece.place === 1 ? '#e8c14a' : '#a8743f';
      c.fillRect(x - border, y - border, fw + border * 2, fh + border * 2);
      c.fillStyle = 'rgba(0, 0, 0, 0.25)';
      c.fillRect(x - border * 0.35, y - border * 0.35, fw + border * 0.7, fh + border * 0.7);
      c.fillStyle = '#ffffff';
      c.fillRect(x, y, fw, fh);
      const img = loaded.get(piece.id);
      if (img) c.drawImage(img, x, y, fw, fh);
      else {
        c.fillStyle = '#b8a890';
        c.font = `500 ${Math.round(fh * 0.14)}px ${FONT}`;
        c.fillText(piece.img === null ? '(missing)' : '…', x + fw / 2, y + fh / 2);
      }
      // Once the voting's over: the artist's name on a little plate, and a rosette for the top three.
      if (piece.name) {
        const pw = fw * 0.8;
        const ph = 22;
        c.fillStyle = '#f4ead2';
        c.beginPath();
        c.roundRect(x + (fw - pw) / 2, y + fh + border + 2, pw, ph, 6);
        c.fill();
        c.fillStyle = '#3b2a1e';
        let s = 17;
        c.font = `600 ${s}px ${FONT}`;
        while (c.measureText(piece.name).width > pw * 0.92 && s > 9) {
          s -= 1;
          c.font = `600 ${s}px ${FONT}`;
        }
        c.fillText(piece.name, x + fw / 2, y + fh + border + 2 + ph / 2 + 1);
      }
      if (piece.place && piece.place <= 3) {
        const colour = ['#e8c14a', '#c9ccd6', '#d0905a'][piece.place - 1];
        const rx = x + fw - 4;
        const ry = y + 4;
        c.fillStyle = '#c0392b';
        c.beginPath();
        c.moveTo(rx - 14, ry);
        c.lineTo(rx - 22, ry + 46);
        c.lineTo(rx - 8, ry + 36);
        c.lineTo(rx + 4, ry + 48);
        c.lineTo(rx + 8, ry);
        c.fill();
        c.fillStyle = colour;
        c.beginPath();
        c.arc(rx - 3, ry, 22, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#3b2a1e';
        c.font = `700 22px ${FONT}`;
        c.fillText(String(piece.place), rx - 3, ry + 1);
      }
    });
    texture.needsUpdate = true;
  };

  return {
    object: holder,
    /** What they drew, and the pieces in the order they hang. */
    set(title: string, pieces: GalleryPiece[]) {
      const next = JSON.stringify([title, pieces.map((q) => [q.id, q.img === undefined ? 0 : q.img === null ? -1 : q.img.length, q.name ?? '', q.place ?? 0])]);
      if (next === key) return;
      key = next;
      shown = { title, pieces };
      const wanted = new Set(pieces.map((q) => q.id));
      for (const id of loaded.keys()) if (!wanted.has(id)) loaded.delete(id);
      for (const q of pieces) {
        if (!q.img || loaded.has(q.id)) continue;
        const img = new Image();
        img.onload = () => {
          if (!wanted.has(q.id)) return;
          loaded.set(q.id, img);
          draw();
        };
        img.src = q.img;
      }
      draw();
    },
    /** Once the web font has arrived, the words are drawn again in it. */
    redraw() {
      drawName();
      draw();
    },
  };
}
