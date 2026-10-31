import { useCallback, useEffect, useRef, useState } from 'react';
import { useHud } from '../../game/hud';
import { useKeys } from '../../jobs/shared';
import { useClient } from '../../net/client';
import { encodeArt, loadDraft, saveDraft, submitArt } from '../../gallery/client';
import { ART_H, ART_W } from '../../gallery/types';

/**
 * In bed at night: tonight's picture for the gallery. A canvas of its own fixed size (scaled to fit the screen) to
 * draw on with a mouse, a finger or a pen, sixteen colours, four brush sizes, a rubber, a paint pot, undo and clear.
 * The drawing is kept in this browser as it goes, so a wake, the hooded figure or dawn can close the panel without
 * losing it; sending it in can wait until later in the night, and one never sent goes in by itself at dawn.
 */

const COLOURS = [
  '#1f1a17', '#ffffff', '#8a8a8a', '#7a4a2a',
  '#e0403a', '#ff8c2e', '#ffd23f', '#f6c6a0',
  '#7ccf5a', '#2f8a46', '#7fd0f0', '#2f6fd0',
  '#1f2f6f', '#9a5fd0', '#ff8fbf', '#c49a6c',
];
const SIZES = [3, 7, 14, 28];
const UNDO_KEPT = 15;
const PAPER = '#ffffff';

type Tool = 'brush' | 'rubber' | 'fill';

export function DrawPanel() {
  const tonight = useClient((s) => s.priv?.gallery?.tonight ?? null);
  const note = useClient((s) => s.priv?.gallery?.note ?? null);
  const room = useClient((s) => s.pub?.room ?? '');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [colour, setColour] = useState(COLOURS[0]);
  const [size, setSize] = useState(1);
  const [tool, setTool] = useState<Tool>('brush');
  const [undoCount, setUndoCount] = useState(0);
  const [sent, setSent] = useState(false);
  const [marks, setMarks] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const undo = useRef<ImageData[]>([]);
  const stroke = useRef<{ id: number; pts: { x: number; y: number }[] } | null>(null);
  const close = useCallback(() => useHud.setState({ draw: false }), []);
  const night = tonight?.night ?? null;

  // The night is over (or never was): nothing to draw for.
  useEffect(() => {
    if (!tonight) close();
  }, [tonight, close]);

  // The paper, and whatever was drawn on it earlier tonight.
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true });
    if (!ctx || night === null) return;
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, ART_W, ART_H);
    const d = loadDraft(room, night);
    if (!d) return;
    setSent(d.sent);
    setMarks(d.marks);
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = d.img;
  }, [room, night]);

  const keep = useCallback(
    (wasSent = false) => {
      const c = canvasRef.current;
      if (!c || night === null) return;
      saveDraft({ room, night, img: c.toDataURL('image/png'), marks: true, sent: wasSent });
    },
    [room, night],
  );

  const ctxOf = () => canvasRef.current?.getContext('2d', { willReadFrequently: true }) ?? null;

  const remember = () => {
    const ctx = ctxOf();
    if (!ctx) return;
    undo.current = [...undo.current, ctx.getImageData(0, 0, ART_W, ART_H)].slice(-UNDO_KEPT);
    setUndoCount(undo.current.length);
  };
  const changed = () => {
    setMarks(true);
    setSent(false);
    keep(false);
  };

  const undoLast = () => {
    const ctx = ctxOf();
    const last = undo.current.pop();
    if (!ctx || !last) return;
    ctx.putImageData(last, 0, 0);
    setUndoCount(undo.current.length);
    changed();
  };
  const clear = () => {
    const ctx = ctxOf();
    if (!ctx) return;
    remember();
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, ART_W, ART_H);
    changed();
  };

  useKeys((e, down) => {
    if (e.key === 'Escape') {
      if (down) close();
      return true;
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      if (down) undoLast();
      return true;
    }
    return false;
  });

  // ---------------------------------------------------------------- drawing

  const at = (e: { clientX: number; clientY: number }) => {
    const r = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * ART_W, y: ((e.clientY - r.top) / r.height) * ART_H };
  };
  const ink = () => (tool === 'rubber' ? PAPER : colour);

  /** From the last points on to `p`, through the midpoints, so the line comes out smooth rather than in straight bits. */
  const extend = (p: { x: number; y: number }) => {
    const ctx = ctxOf();
    const s = stroke.current;
    if (!ctx || !s) return;
    const pts = s.pts;
    const last = pts[pts.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) < 0.8) return;
    pts.push(p);
    ctx.strokeStyle = ink();
    ctx.lineWidth = SIZES[size];
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    if (pts.length < 3) {
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
    } else {
      const a = pts[pts.length - 3];
      const b = last;
      ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2);
      ctx.quadraticCurveTo(b.x, b.y, (b.x + p.x) / 2, (b.y + p.y) / 2);
    }
    ctx.stroke();
    if (s.pts.length > 64) s.pts = s.pts.slice(-3);
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (stroke.current || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    const ctx = ctxOf();
    if (!ctx) return;
    const p = at(e);
    remember();
    if (tool === 'fill') {
      floodFill(ctx, Math.floor(p.x), Math.floor(p.y), colour);
      changed();
      return;
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* (a pointer the browser no longer knows: the stroke still draws) */
    }
    stroke.current = { id: e.pointerId, pts: [p] };
    // A dot, for a tap without a drag.
    ctx.fillStyle = ink();
    ctx.beginPath();
    ctx.arc(p.x, p.y, SIZES[size] / 2, 0, Math.PI * 2);
    ctx.fill();
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (stroke.current?.id !== e.pointerId) return;
    const all = e.nativeEvent.getCoalescedEvents?.() ?? [];
    for (const ev of all.length ? all : [e.nativeEvent]) extend(at(ev));
  };
  const up = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (stroke.current?.id !== e.pointerId) return;
    extend(at(e));
    stroke.current = null;
    changed();
  };

  const send = () => {
    const c = canvasRef.current;
    if (!c || night === null) return;
    const img = encodeArt(c);
    if (!img) return setSending('That drawing is too detailed to send. Try a simpler one!');
    submitArt(img, night);
    setSent(true);
    keep(true);
    setSending(null);
  };

  if (!tonight) return null;
  return (
    <div className="job-dock cosy draw-dock" role="dialog" aria-label="Tonight’s drawing">
      <div className="job-panel cosy-panel draw-panel">
        <header className="job-head">
          <span className="job-icon" aria-hidden="true">
            🎨
          </span>
          <div className="job-titles">
            <span className="job-hint">Tonight, draw…</span>
            <strong className="draw-prompt">{tonight.prompt}</strong>
          </div>
          <button className="cosy-btn small job-stop" onClick={close}>
            Close <span className="cosy-key">Esc</span>
          </button>
        </header>
        <div className="draw-body">
          <div className="draw-paper">
            <canvas
              ref={canvasRef}
              width={ART_W}
              height={ART_H}
              className={`draw-canvas tool-${tool}`}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              onContextMenu={(e) => e.preventDefault()}
              aria-label="Your drawing"
            />
          </div>
          <div className="draw-tools">
            <div className="draw-colours" role="radiogroup" aria-label="Colour">
              {COLOURS.map((c) => (
                <button
                  key={c}
                  className={`draw-swatch ${c === colour && tool !== 'rubber' ? 'on' : ''}`}
                  style={{ background: c }}
                  aria-label={`Colour ${c}`}
                  aria-checked={c === colour}
                  role="radio"
                  onClick={() => {
                    setColour(c);
                    if (tool === 'rubber') setTool('brush');
                  }}
                />
              ))}
            </div>
            <div className="draw-row">
              {SIZES.map((s, i) => (
                <button key={s} className={`draw-size ${i === size ? 'on' : ''}`} aria-label={`Brush size ${i + 1}`} onClick={() => setSize(i)}>
                  <span style={{ width: Math.max(4, s * 0.8), height: Math.max(4, s * 0.8), background: tool === 'rubber' ? '#c9b8a0' : colour }} />
                </button>
              ))}
            </div>
            <div className="draw-row">
              <button className={`draw-tool ${tool === 'brush' ? 'on' : ''}`} onClick={() => setTool('brush')} title="Brush">
                🖌️<span>Brush</span>
              </button>
              <button className={`draw-tool ${tool === 'rubber' ? 'on' : ''}`} onClick={() => setTool('rubber')} title="Rubber">
                🧽<span>Rubber</span>
              </button>
              <button className={`draw-tool ${tool === 'fill' ? 'on' : ''}`} onClick={() => setTool('fill')} title="Fill">
                🪣<span>Fill</span>
              </button>
            </div>
            <div className="draw-row">
              <button className="draw-tool" onClick={undoLast} disabled={!undoCount} title="Undo">
                ↩️<span>Undo</span>
              </button>
              <button className="draw-tool" onClick={clear} title="Start again">
                🗑️<span>Clear</span>
              </button>
            </div>
          </div>
        </div>
        <footer className="draw-foot">
          <span className={`draw-note ${note && !note.ok ? 'bad' : ''}`}>
            {sending ?? (sent ? (note?.text ?? 'Sent! You can still change it and send it again tonight.') : 'It goes up in the gallery tomorrow, with no names on until the voting’s done.')}
          </span>
          <button className="cosy-btn primary" disabled={!marks || sent} onClick={send}>
            {sent ? 'Sent ✓' : 'Send it in'}
          </button>
        </footer>
      </div>
    </div>
  );
}

/** The paint pot: fills the patch of (nearly) the same colour around x, y. */
function floodFill(ctx: CanvasRenderingContext2D, x: number, y: number, hex: string) {
  if (x < 0 || y < 0 || x >= ART_W || y >= ART_H) return;
  const img = ctx.getImageData(0, 0, ART_W, ART_H);
  const d = img.data;
  const n = parseInt(hex.slice(1), 16);
  const fill = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const at = (y * ART_W + x) * 4;
  const from = [d[at], d[at + 1], d[at + 2]];
  if (Math.abs(from[0] - fill[0]) + Math.abs(from[1] - fill[1]) + Math.abs(from[2] - fill[2]) < 6) return;
  // Soft edges from the brush count as the same patch, so fills reach right up to the lines.
  const near = (i: number) => Math.abs(d[i] - from[0]) + Math.abs(d[i + 1] - from[1]) + Math.abs(d[i + 2] - from[2]) < 96;
  const seen = new Uint8Array(ART_W * ART_H);
  const stack = [x, y];
  while (stack.length) {
    const py = stack.pop()!;
    let px = stack.pop()!;
    while (px >= 0 && !seen[py * ART_W + px] && near((py * ART_W + px) * 4)) px--;
    px++;
    let upOpen = false;
    let downOpen = false;
    while (px < ART_W && !seen[py * ART_W + px] && near((py * ART_W + px) * 4)) {
      const k = py * ART_W + px;
      seen[k] = 1;
      d[k * 4] = fill[0];
      d[k * 4 + 1] = fill[1];
      d[k * 4 + 2] = fill[2];
      d[k * 4 + 3] = 255;
      // Any patch just above or below that starts here is filled in its turn.
      if (py > 0) {
        const ok = !seen[k - ART_W] && near((k - ART_W) * 4);
        if (ok && !upOpen) stack.push(px, py - 1);
        upOpen = ok;
      }
      if (py < ART_H - 1) {
        const ok = !seen[k + ART_W] && near((k + ART_W) * 4);
        if (ok && !downOpen) stack.push(px, py + 1);
        downOpen = ok;
      }
      px++;
    }
  }
  ctx.putImageData(img, 0, 0);
}
