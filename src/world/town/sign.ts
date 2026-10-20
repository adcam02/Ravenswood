import * as THREE from 'three';

export interface SignStyle {
  /** Canvas size in pixels. */
  w: number;
  h: number;
  bg: string;
  fg: string;
  border?: string;
  /** Wood grain lines across the board. */
  grain?: boolean;
  round?: boolean;
  weight?: number;
  /** Largest font size in pixels; text shrinks to fit. */
  size?: number;
  italic?: boolean;
}

const FONT = 'Fredoka, "Trebuchet MS", "Segoe UI", system-ui, sans-serif';

const live = new Set<TextSign>();

/** A canvas texture with a line or two of text, redrawn when its text changes or the web font arrives. */
export class TextSign {
  readonly canvas: HTMLCanvasElement;
  readonly texture: THREE.CanvasTexture;
  private lines: string[] = [];

  constructor(
    private style: SignStyle,
    text: string | string[] = '',
  ) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = style.w;
    this.canvas.height = style.h;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 4;
    this.set(text);
    live.add(this);
  }

  set(text: string | string[]) {
    const lines = Array.isArray(text) ? text : [text];
    if (lines.join('\n') === this.lines.join('\n') && this.lines.length) return;
    this.lines = lines;
    this.draw();
  }

  draw() {
    const { w, h, bg, fg, border, grain, round } = this.style;
    const c = this.canvas.getContext('2d')!;
    c.clearRect(0, 0, w, h);
    c.save();
    const r = round ? Math.min(w, h) / 2 : Math.min(w, h) * 0.14;
    c.beginPath();
    c.roundRect(4, 4, w - 8, h - 8, r);
    c.fillStyle = bg;
    c.fill();
    c.clip();
    if (grain) {
      c.strokeStyle = 'rgba(70, 40, 20, 0.16)';
      c.lineWidth = 3;
      for (let y = 14; y < h; y += 22) {
        c.beginPath();
        c.moveTo(0, y + Math.sin(y) * 3);
        c.bezierCurveTo(w * 0.3, y - 6, w * 0.7, y + 6, w, y + Math.cos(y) * 3);
        c.stroke();
      }
    }
    c.restore();
    if (border) {
      c.beginPath();
      c.roundRect(6, 6, w - 12, h - 12, r);
      c.strokeStyle = border;
      c.lineWidth = 8;
      c.stroke();
    }
    const lines = this.lines.filter(Boolean);
    if (!lines.length) {
      this.texture.needsUpdate = true;
      return;
    }
    c.fillStyle = fg;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    const weight = this.style.weight ?? 600;
    const italic = this.style.italic ? 'italic ' : '';
    const max = this.style.size ?? h * 0.5;
    const room = (h * 0.78) / lines.length;
    lines.forEach((line, i) => {
      // The first line is the big one; any others are smaller captions.
      let size = Math.min(max * (i === 0 ? 1 : 0.62), room * (i === 0 ? 0.95 : 0.7));
      c.font = `${italic}${weight} ${size}px ${FONT}`;
      while (c.measureText(line).width > w * 0.86 && size > 10) {
        size -= 2;
        c.font = `${italic}${weight} ${size}px ${FONT}`;
      }
      const y = h / 2 + (i - (lines.length - 1) / 2) * room;
      c.fillText(line, w / 2, y + size * 0.04);
    });
    this.texture.needsUpdate = true;
  }

  dispose() {
    live.delete(this);
    this.texture.dispose();
  }
}

// Signs drawn before the web font loaded get redrawn once it has.
if (typeof document !== 'undefined' && document.fonts) {
  const redraw = () => live.forEach((s) => s.draw());
  document.fonts.ready.then(redraw).catch(() => {});
  document.fonts.addEventListener?.('loadingdone', redraw);
}

/** A flat board showing a sign texture on both faces, so it reads the right way round from either side. */
export function signBoard(sign: TextSign, w: number, h: number, opts: { lit?: boolean } = {}): { mesh: THREE.Group; material: THREE.MeshLambertMaterial } {
  const material = new THREE.MeshLambertMaterial({
    map: sign.texture,
    transparent: true,
    alphaTest: 0.05,
    emissive: '#ffffff',
    emissiveMap: sign.texture,
    emissiveIntensity: opts.lit ? 0.35 : 0.08,
  });
  const g = new THREE.Group();
  const geo = new THREE.PlaneGeometry(w, h);
  const front = new THREE.Mesh(geo, material);
  front.position.z = 0.051;
  const back = new THREE.Mesh(geo, material);
  back.rotation.y = Math.PI;
  back.position.z = -0.051;
  g.add(front, back);
  return { mesh: g, material };
}
