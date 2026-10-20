import { useEffect, useRef } from 'react';
import { local } from '../../game/local';
import { presence } from '../../game/presence';
import { useView } from '../../state/view';
import { BAKERY, CHURCH, GALLOWS, GRAVEYARD, MEETING_CENTRE, POND, SQUARE_R, STOOL_R, TAVERN, TOWN_R, WASHHOUSE, WELL, houseSlots } from '../../world/town/layout';
import { cottageSlot, houseOwner, zoneKind, type Look } from '../../world/types';

// Twice the first version's size.
const SIZE = 344;
const SCALE = (SIZE / 2 - 10) / TOWN_R;

/** Where a dot goes for someone in a building: the building itself. */
function placeOf(zone: string, x: number, z: number, seatIndex: (id: string) => number): [number, number] {
  switch (zoneKind(zone)) {
    case 'tavern':
      return [TAVERN.x, TAVERN.z];
    case 'bakery':
      return [BAKERY.x, BAKERY.z];
    case 'church':
      return [CHURCH.x, CHURCH.z];
    case 'house': {
      const slot = cottageSlot(zone);
      if (slot !== null) {
        const h = houseSlots[slot % houseSlots.length];
        return [h.x, h.z];
      }
      // Bedrooms aren't on the map: sleepers line up along the bottom edge.
      const i = Math.max(0, seatIndex(houseOwner(zone) ?? ''));
      return [-14 + (i % 10) * 3.1, 30.5 - Math.floor(i / 10) * 3.2];
    }
    default:
      return [x, z];
  }
}

/** A little map of the town with a dot for everyone, so you can see where people are. */
export function MiniMap() {
  const view = useView();
  const canvas = useRef<HTMLCanvasElement>(null);
  const seats = useRef(view.seats);
  seats.current = view.seats;
  const mySeat = useRef(view.mySeatId);
  mySeat.current = view.mySeatId;
  const mode = view.mode;

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    el.width = SIZE * dpr;
    el.height = SIZE * dpr;
    const px = (x: number) => SIZE / 2 + x * SCALE;
    const pz = (z: number) => SIZE / 2 + z * SCALE;
    const seatIndex = (id: string) => seats.current.findIndex((s) => s.id === id);

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, SIZE, SIZE);
      // Grass, the square, paths to the buildings.
      ctx.fillStyle = '#8bc366';
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, TOWN_R * SCALE, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d9bd8f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, 25.5 * SCALE, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#cdbfa9';
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SQUARE_R * SCALE, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b98e74';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(px(MEETING_CENTRE.x), pz(MEETING_CENTRE.z), STOOL_R * SCALE, 0, Math.PI * 2);
      ctx.stroke();
      // The pond, the buildings and the houses.
      ctx.fillStyle = '#5fb6cf';
      ctx.beginPath();
      ctx.ellipse(px(POND.x), pz(POND.z), POND.rx * SCALE, POND.rz * SCALE, 0, 0, Math.PI * 2);
      ctx.fill();
      const box = (x: number, z: number, w: number, d: number, color: string, rot = 0) => {
        ctx.save();
        ctx.translate(px(x), pz(z));
        ctx.rotate(-rot);
        ctx.fillStyle = color;
        ctx.fillRect((-w / 2) * SCALE, (-d / 2) * SCALE, w * SCALE, d * SCALE);
        ctx.restore();
      };
      box(CHURCH.x, CHURCH.z, CHURCH.w, CHURCH.d, '#9a9ab0', CHURCH.ry);
      box(TAVERN.x, TAVERN.z, TAVERN.w, TAVERN.d, '#55507a', TAVERN.ry);
      box(BAKERY.x, BAKERY.z, BAKERY.w, BAKERY.d, '#c4643f', BAKERY.ry);
      box(WASHHOUSE.x, WASHHOUSE.z, WASHHOUSE.w, WASHHOUSE.d, '#4f6f9a');
      box(GRAVEYARD.x, GRAVEYARD.z, GRAVEYARD.hw * 2, GRAVEYARD.hd * 2, '#7aa85a');
      box(GALLOWS.x, GALLOWS.z, 2.6, 2.6, '#5a3d2a');
      ctx.fillStyle = '#a99c89';
      ctx.beginPath();
      ctx.arc(px(WELL.x), pz(WELL.z), 1.2 * SCALE, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px(0), pz(0), 1.8 * SCALE, 0, Math.PI * 2);
      ctx.fillStyle = '#6b6b78';
      ctx.fill();
      for (const h of houseSlots) box(h.x, h.z, 5.2, 4.6, '#d8c8a8', h.ry);
      // Everyone.
      const dot = (x: number, z: number, look: Look | null, me: boolean, st: boolean, dead: boolean, name: string) => {
        const cx = px(x);
        const cz = pz(z);
        ctx.beginPath();
        ctx.arc(cx, cz, me ? 11 : 9, 0, Math.PI * 2);
        ctx.fillStyle = st ? '#4b3a6e' : dead ? 'rgba(220, 236, 255, 0.85)' : (look?.color ?? '#ffffff');
        ctx.fill();
        ctx.lineWidth = me ? 3.5 : 2;
        ctx.strokeStyle = me ? '#ff9a62' : st ? '#f6dc93' : '#3a2a20';
        ctx.stroke();
        ctx.fillStyle = st ? '#f6dc93' : '#1a120c';
        ctx.font = '600 13px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(name.slice(0, 1).toUpperCase(), cx, cz + 4.5);
      };
      const myKey = mode === 'st' ? 'st' : mySeat.current;
      for (const [key, p] of presence.others) {
        if (key === myKey) continue;
        const seat = seats.current.find((s) => s.id === key);
        if (key !== 'st' && !seat) continue;
        const [x, z] = placeOf(p.zone, p.x, p.z, seatIndex);
        dot(x, z, seat?.look ?? null, false, key === 'st', Boolean(seat?.dead), key === 'st' ? 'S' : (seat?.name ?? '?'));
      }
      if (myKey) {
        const me = seats.current.find((s) => s.id === myKey);
        const [x, z] = placeOf(local.zone, local.x, local.z, seatIndex);
        dot(x, z, me?.look ?? null, true, mode === 'st', Boolean(me?.dead), mode === 'st' ? 'S' : (me?.name ?? '?'));
      }
    };
    draw();
    const t = setInterval(draw, 250);
    return () => clearInterval(t);
  }, [mode]);

  return (
    <div className="minimap cosy-panel" title="Where everyone is">
      <canvas ref={canvas} style={{ width: SIZE, height: SIZE, maxWidth: 'min(344px, 30vw)', maxHeight: 'min(344px, 30vw)' }} />
    </div>
  );
}
