import * as THREE from 'three';

/**
 * The seat's-eye view at a card table: the camera eases in to where the player's eyes are, looking down across the
 * felt (their cards in front, the dealer and everyone else round it). Holding the right mouse button and dragging,
 * or dragging a finger, turns the head, within the limits of someone sitting at a table. It's its own camera mode,
 * so the town's usual camera is left as it is.
 */
export class TableCam {
  /** How far the head is turned from looking at the table, in radians. */
  yaw = 0;
  pitch = 0;
  private drag: { id: number; x: number; y: number } | null = null;
  private eye = new THREE.Vector3();
  private ahead = new THREE.Vector3();

  constructor(
    private canvas: HTMLCanvasElement,
    /** Where the eyes are and the spot on the table they look at to begin with. */
    eye: THREE.Vector3,
    look: THREE.Vector3,
  ) {
    this.eye.copy(eye);
    this.ahead.copy(look).sub(eye);
    // (Caught first, so the town's own camera swing and click-to-walk leave the seat alone.)
    canvas.addEventListener('pointerdown', this.onDown, true);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
    window.addEventListener('pointercancel', this.onUp);
  }

  dispose() {
    this.canvas.removeEventListener('pointerdown', this.onDown, true);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    window.removeEventListener('pointercancel', this.onUp);
  }

  /** Where the camera is and what it looks at now. */
  shot(pos: THREE.Vector3, look: THREE.Vector3) {
    pos.copy(this.eye);
    const flat = Math.hypot(this.ahead.x, this.ahead.z);
    const baseYaw = Math.atan2(this.ahead.x, this.ahead.z);
    const basePitch = Math.atan2(this.ahead.y, flat);
    const yaw = baseYaw + this.yaw;
    const pitch = THREE.MathUtils.clamp(basePitch + this.pitch, -1.3, 0.5);
    look.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).add(this.eye);
  }

  private onDown = (e: PointerEvent) => {
    // Every press on the picture is the seat's while sitting here.
    e.stopImmediatePropagation();
    // The right button with a mouse; any drag with a finger or a pen.
    if (e.pointerType === 'mouse' ? e.button !== 2 : !e.isPrimary) return;
    this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
    e.preventDefault();
  };

  private onMove = (e: PointerEvent) => {
    const d = this.drag;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    // Like turning your head: drag right to look right.
    const k = 3 / Math.max(300, this.canvas.clientWidth);
    this.yaw = THREE.MathUtils.clamp(this.yaw - dx * k, -1.6, 1.6);
    this.pitch = THREE.MathUtils.clamp(this.pitch - dy * k, -0.6, 0.75);
  };

  private onUp = (e: PointerEvent) => {
    if (this.drag?.id === e.pointerId) this.drag = null;
  };
}
