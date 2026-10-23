import { underway } from '../state/host';
import { ui, useUI } from '../state/ui';
import { useView } from '../state/view';

export function PickBanner() {
  const pick = useUI((s) => s.pick);
  const view = useView();
  if (!pick) return null;
  // During the game, whether alignments stay with the players (the Barber) or go with the characters (a Snake Charmer).
  const sides = pick.kind === 'swapRole' && underway(view);
  const name = (id: string | null) => (id ? view.seats.find((s) => s.id === id)?.label ?? 'Someone' : 'The Storyteller');
  const text =
    pick.kind === 'nominee'
      ? `Who did ${name(pick.nominatorId)} nominate?`
      : pick.kind === 'swap'
        ? `Swap ${name(pick.seatId)}’s seat with…`
        : pick.kind === 'move'
          ? `Move ${name(pick.seatId)} to which seat?`
          : `Swap ${name(pick.seatId)}’s character with…`;
  return (
    <div className="pick-banner surface" role="status">
      <span>{text}</span>
      {sides && (
        <label className="check" title="Off: each player keeps their alignment, as with the Barber. On: alignments swap too, as with the Snake Charmer.">
          <input type="checkbox" checked={Boolean(pick.alignments)} onChange={(e) => ui.pick({ ...pick, alignments: e.target.checked })} /> Alignments swap too
        </label>
      )}
      <button className="btn small quiet" onClick={() => ui.pick(null)}>
        Cancel
      </button>
    </div>
  );
}
