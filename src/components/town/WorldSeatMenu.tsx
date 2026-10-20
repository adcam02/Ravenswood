import { create } from 'zustand';
import { useEffect } from 'react';
import { game } from '../../game/hud';
import { ui, useUI } from '../../state/ui';
import { useView } from '../../state/view';
import { SeatMenu } from '../SeatMenu';
import type { Geometry } from '../Square';

/** Where the Storyteller clicked a player in the world. */
const useWorldMenu = create<{ seatId: string | null; x: number; y: number }>(() => ({ seatId: null, x: 0, y: 0 }));

/**
 * Storyteller: click anyone in the town to get the same menu as in the grimoire (wake, mark, kill, float
 * over, bring them here), opened right beside them.
 */
export function WorldSeatMenu() {
  const view = useView();
  const menuSeat = useUI((s) => s.menuSeat);
  const grimoire = useUI((s) => s.grimoireOpen);
  const at = useWorldMenu();
  useEffect(() => {
    game.pickSeat = (seatId, x, y) => {
      useWorldMenu.setState({ seatId, x, y });
      ui.menu(seatId);
    };
    return () => {
      game.pickSeat = () => {};
    };
  }, []);
  if (grimoire || !at.seatId || menuSeat !== at.seatId) return null;
  const seat = view.seats.find((s) => s.id === at.seatId);
  if (!seat) return null;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const geo: Geometry = { w, h, cx: w / 2, cy: h / 2, rx: w / 2, ry: h / 2, t: 56, dial: 0, pts: [] };
  return (
    <div className="world-menu-layer" onPointerDown={(e) => e.target === e.currentTarget && ui.menu(null)}>
      <SeatMenu seat={seat} geo={geo} pt={{ x: at.x, y: at.y }} />
    </div>
  );
}
