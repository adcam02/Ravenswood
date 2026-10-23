import * as THREE from 'three';

/** One seat round the circle, in the grimoire's order. */
export interface SeatingEntry {
  name: string;
  dead: boolean;
  /** The bedroom's owner, marked as "you" (or as whose room it is, to a visitor). */
  owner: boolean;
}

const FONT = 'Fredoka, "Trebuchet MS", "Segoe UI", system-ui, sans-serif';
const SIZE = 1024;

/**
 * The chart on the bedroom wall: everyone's name round a circle, in the order the Storyteller sees them in the
 * grimoire (the first seat at the top, going clockwise), with no characters or reminders. It shows players who sits
 * where before the first town meeting, which clockwise and anticlockwise depend on.
 */
export class SeatingChart {
  readonly canvas: HTMLCanvasElement;
  readonly texture: THREE.CanvasTexture;
  private seats: SeatingEntry[] = [];
  private key = '';

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = SIZE;
    this.canvas.height = SIZE;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 4;
    this.draw();
    // Drawn before the web font loaded: again once it has.
    document.fonts?.ready.then(() => this.draw()).catch(() => {});
  }

  set(seats: SeatingEntry[]) {
    const key = seats.map((s) => `${s.name}|${s.dead ? 1 : 0}|${s.owner ? 1 : 0}`).join(',');
    if (key === this.key) return;
    this.key = key;
    this.seats = seats;
    this.draw();
  }

  private draw() {
    const c = this.canvas.getContext('2d')!;
    const mid = SIZE / 2;
    c.clearRect(0, 0, SIZE, SIZE);
    // Parchment with a soft darker edge.
    const paper = c.createRadialGradient(mid, mid, SIZE * 0.2, mid, mid, SIZE * 0.75);
    paper.addColorStop(0, '#f8eed8');
    paper.addColorStop(1, '#e6d2a8');
    c.fillStyle = paper;
    c.fillRect(0, 0, SIZE, SIZE);
    c.strokeStyle = '#8a5a36';
    c.lineWidth = 10;
    c.strokeRect(22, 22, SIZE - 44, SIZE - 44);
    c.lineWidth = 3;
    c.strokeRect(38, 38, SIZE - 76, SIZE - 76);
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    // The circle, with arrowheads round it showing which way is clockwise.
    const ring = 318;
    c.strokeStyle = 'rgba(138, 90, 54, 0.55)';
    c.lineWidth = 6;
    c.beginPath();
    c.arc(mid, mid + 20, ring, 0, Math.PI * 2);
    c.stroke();
    c.fillStyle = 'rgba(138, 90, 54, 0.7)';
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      const x = mid + Math.sin(a) * ring;
      const y = mid + 20 - Math.cos(a) * ring;
      c.save();
      c.translate(x, y);
      // Pointing along the circle, the clockwise way round.
      c.rotate(a);
      c.beginPath();
      c.moveTo(18, 0);
      c.lineTo(-10, -14);
      c.lineTo(-10, 14);
      c.closePath();
      c.fill();
      c.restore();
    }
    c.fillStyle = '#6a4228';
    c.font = `600 52px ${FONT}`;
    c.fillText('Round the circle', mid, 92);
    c.font = `500 30px ${FONT}`;
    c.fillStyle = '#8a6a50';
    c.fillText('as the Storyteller', mid, mid - 8);
    c.fillText('sees it', mid, mid + 28);
    c.font = `600 34px ${FONT}`;
    c.fillText('clockwise ↻', mid, mid + 82);
    // The names, first seat at the top, going clockwise.
    const n = this.seats.length;
    this.seats.forEach((s, i) => {
      const a = (i / Math.max(1, n)) * Math.PI * 2;
      const x = mid + Math.sin(a) * ring;
      const y = mid + 20 - Math.cos(a) * ring;
      let size = n > 12 ? 36 : 46;
      c.font = `600 ${size}px ${FONT}`;
      const label = s.name || '…';
      while (c.measureText(label).width > 236 && size > 18) {
        size -= 2;
        c.font = `600 ${size}px ${FONT}`;
      }
      const w = c.measureText(label).width + 34;
      const h = size + 22;
      c.beginPath();
      c.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
      c.fillStyle = s.owner ? '#e8b84a' : s.dead ? '#d8cdbb' : '#fffaf0';
      c.fill();
      c.lineWidth = 4;
      c.strokeStyle = s.owner ? '#a8741c' : '#a88a6a';
      c.stroke();
      c.fillStyle = s.dead ? '#8a7f72' : '#3a2a20';
      c.fillText(label, x, y + 1);
      if (s.dead) {
        // Dead: a line through the name.
        c.strokeStyle = 'rgba(90, 70, 60, 0.7)';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(x - w / 2 + 14, y + 1);
        c.lineTo(x + w / 2 - 14, y + 1);
        c.stroke();
      }
    });
    if (!n) {
      c.font = `500 34px ${FONT}`;
      c.fillStyle = '#8a6a50';
      c.fillText('Nobody seated yet', mid, mid + 80);
    }
    this.texture.needsUpdate = true;
  }
}
