import { useEffect, useRef } from 'react';
import { local } from '../../game/local';
import { presence } from '../../game/presence';
import { useView } from '../../state/view';
import { BAKERY, CHURCH, CLUB, COTTAGE_NAMES, FLATS, FLATS_NAME, GALLOWS, GRAVEYARD, MEETING_CENTRE, POND, SQUARE_R, STOOL_R, TAVERN, TOWN_R, WASHHOUSE, WELL, houseSlots } from '../../world/town/layout';
import { CASINO } from '../../world/town/casinoLayout';
import { cottageSlot, houseOwner, inBooth, zoneKind, type Look } from '../../world/types';

// Twice the first version's size.
const SIZE = 344;
const SCALE = (SIZE / 2 - 10) / TOWN_R;

/** Where a dot goes for someone in a building: the building itself. */
function placeOf(zone: string, x: number, z: number, seatIndex: (id: string) => number): [number, number] {
  switch (zoneKind(zone)) {
    case 'tavern':
    case 'cellar':
      return [TAVERN.x, TAVERN.z];
    case 'bakery':
      return [BAKERY.x, BAKERY.z];
    case 'church':
      return [CHURCH.x, CHURCH.z];
    case 'tower':
      return [0, 0];
    case 'club':
      return [CLUB.x, CLUB.z];
    case 'casino':
      return [CASINO.x, CASINO.z];
    case 'lobby':
    case 'flat':
      return [FLATS.x, FLATS.z];
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

/** A box's half-size north to south on the map, turned as it stands. */
const halfZ = (b: { w: number; d: number; ry?: number }) => Math.abs((b.w / 2) * Math.sin(b.ry ?? 0)) + Math.abs((b.d / 2) * Math.cos(b.ry ?? 0));

/**
 * The names on the map, just off each building, north or south, on the side towards the middle of town (so they
 * stay on the map and clear of the dots gathered on the building). `size`: the smallest map (on screen, px) it's shown on, so a
 * small map only names the big places.
 */
const PLACES: { name: string; x: number; z: number; size: number }[] = (() => {
  const off = (b: { x: number; z: number; w: number; d: number; ry?: number }, gap = 2.2, south = b.z < -1) => ({ x: b.x, z: b.z + (south ? 1 : -1) * (halfZ(b) + gap) });
  return [
    // (The tavern's goes underneath, clear of the cottage beyond it.)
    { name: 'Tavern', ...off(TAVERN, 2.2, true), size: 0 },
    { name: 'Bakery', ...off(BAKERY, 3.2), size: 0 },
    { name: 'Church', ...off(CHURCH, 1.6), size: 0 },
    { name: 'Club', ...off(CLUB), size: 0 },
    { name: 'Casino', ...off(CASINO), size: 0 },
    { name: FLATS_NAME, ...off(FLATS), size: 0 },
    { name: 'Clock tower', x: 0, z: -3.6, size: 0 },
    ...houseSlots.map((h, i) => ({ name: COTTAGE_NAMES[i % COTTAGE_NAMES.length], ...off({ ...h, w: 5.2, d: 4.6 }), size: 200 })),
    { name: 'Gallows', x: GALLOWS.x + 1.2, z: GALLOWS.z - 3.2, size: 270 },
    { name: 'Graveyard', x: GRAVEYARD.x - 5.6, z: GRAVEYARD.z, size: 270 },
    { name: 'Pond', x: POND.x, z: POND.z + POND.rz + 2, size: 270 },
  ];
})();

/** One person's dot. `hidden`: sitting in a confession booth, so a plain grey "?" rather than who it is. */
interface Marker {
  look: Look | null;
  me: boolean;
  st: boolean;
  dead: boolean;
  name: string;
  hidden: boolean;
}

/** In a building, at most this many dots side by side; past it, the last one says how many more. */
const CLUSTER_MAX = 6;

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
      box(CLUB.x, CLUB.z, CLUB.w, CLUB.d, '#7a3f8a', CLUB.ry);
      box(CASINO.x, CASINO.z, CASINO.w, CASINO.d, '#8a2f4a', CASINO.ry);
      box(FLATS.x, FLATS.z, FLATS.w, FLATS.d, '#b5553a', FLATS.ry);
      // The buildings' names: the same size on screen however small the map is drawn, under the dots.
      const shown = el.clientWidth || SIZE;
      const k = SIZE / shown;
      const fs = (shown < 220 ? 9 : 10) * k;
      ctx.font = `600 ${fs.toFixed(1)}px Fredoka, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const p of PLACES) {
        if (shown < p.size) continue;
        const w = ctx.measureText(p.name).width + 6 * k;
        const h = fs + 3 * k;
        const cx = px(p.x);
        const cz = pz(p.z);
        ctx.fillStyle = 'rgba(255, 250, 238, 0.78)';
        ctx.beginPath();
        ctx.roundRect(cx - w / 2, cz - h / 2, w, h, h / 2);
        ctx.fill();
        ctx.fillStyle = '#3a2a20';
        ctx.fillText(p.name, cx, cz + 0.5 * k);
      }
      ctx.textBaseline = 'alphabetic';
      // Everyone.
      const dot = (cx: number, cz: number, m: Marker, r: number) => {
        ctx.beginPath();
        ctx.arc(cx, cz, m.me ? r + 2 : r, 0, Math.PI * 2);
        ctx.fillStyle = m.hidden ? '#b9b3a8' : m.st ? '#4b3a6e' : m.dead ? 'rgba(220, 236, 255, 0.85)' : (m.look?.color ?? '#ffffff');
        ctx.fill();
        ctx.lineWidth = m.me ? 3.5 : 2;
        ctx.strokeStyle = m.me ? '#ff9a62' : m.st && !m.hidden ? '#f6dc93' : '#3a2a20';
        ctx.stroke();
        ctx.fillStyle = m.st && !m.hidden ? '#f6dc93' : '#1a120c';
        ctx.font = `600 ${r > 8 ? 13 : 12}px Fredoka, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(m.hidden ? '?' : m.name.slice(0, 1).toUpperCase(), cx, cz + 4.5);
      };
      // Several in one building: side by side on it (two rows for a crowd), and a count.
      const cluster = (x: number, z: number, list: Marker[]) => {
        if (list.length === 1) return dot(px(x), pz(z), list[0], 9);
        // We're always among the dots shown, drawn last so we sit on top.
        const order = [...list.filter((m) => !m.me), ...list.filter((m) => m.me)];
        const shown = order.length > CLUSTER_MAX ? order.slice(-(CLUSTER_MAX - 1)) : order;
        const more = order.length - shown.length;
        const n = shown.length + (more ? 1 : 0);
        const perRow = n > 3 ? Math.ceil(n / 2) : n;
        const rows = Math.ceil(n / perRow);
        const step = 13;
        const at = (i: number): [number, number] => {
          const row = Math.floor(i / perRow);
          const inRow = Math.min(perRow, n - row * perRow);
          return [px(x) + ((i % perRow) - (inRow - 1) / 2) * step, pz(z) + (row - (rows - 1) / 2) * step];
        };
        shown.forEach((m, i) => dot(...at(more ? i + 1 : i), m, 8));
        if (more) {
          const [cx, cz] = at(0);
          ctx.beginPath();
          ctx.arc(cx, cz, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#fffaee';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#3a2a20';
          ctx.stroke();
          ctx.fillStyle = '#1a120c';
          ctx.font = '600 10px Fredoka, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`+${more}`, cx, cz + 3.5);
        }
        // The count, on the top right corner of the group.
        const bx = px(x) + ((perRow - 1) / 2) * step + 9;
        const bz = pz(z) - ((rows - 1) / 2) * step - 10;
        ctx.beginPath();
        ctx.arc(bx, bz, 8.5, 0, Math.PI * 2);
        ctx.fillStyle = '#d9423a';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = '700 11px Fredoka, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(list.length), bx, bz + 4);
      };
      const myKey = mode === 'st' ? 'st' : mySeat.current;
      const people: { zone: string; x: number; z: number; m: Marker }[] = [];
      for (const [key, p] of presence.others) {
        if (key === myKey) continue;
        const seat = seats.current.find((s) => s.id === key);
        if (key !== 'st' && !seat) continue;
        const hidden = mode !== 'st' && inBooth(p.zone, p.x, p.z);
        people.push({ zone: p.zone, x: p.x, z: p.z, m: { look: seat?.look ?? null, me: false, st: key === 'st', dead: Boolean(seat?.dead), name: key === 'st' ? 'S' : (seat?.label ?? '?'), hidden } });
      }
      if (myKey) {
        const me = seats.current.find((s) => s.id === myKey);
        people.push({ zone: local.zone, x: local.x, z: local.z, m: { look: me?.look ?? null, me: true, st: mode === 'st', dead: Boolean(me?.dead), name: mode === 'st' ? 'S' : (me?.name ?? '?'), hidden: false } });
      }
      // Out in town, where they stand (us last, on top); indoors, gathered on the building.
      const inside = new Map<string, { x: number; z: number; list: Marker[] }>();
      for (const { zone, x, z, m } of [...people.filter((q) => !q.m.me), ...people.filter((q) => q.m.me)]) {
        if (zoneKind(zone) === 'town') {
          dot(px(x), pz(z), m, 9);
          continue;
        }
        const [bx, bz] = placeOf(zone, x, z, seatIndex);
        const group = inside.get(zone) ?? { x: bx, z: bz, list: [] };
        group.list.push(m);
        inside.set(zone, group);
      }
      for (const g of inside.values()) cluster(g.x, g.z, g.list);
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
