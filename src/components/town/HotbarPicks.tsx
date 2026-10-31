import { useState, type DragEvent } from 'react';
import { create } from 'zustand';
import { useHud } from '../../game/hud';
import { setMyHotbar, useMyHotbar, useMyItems } from '../../game/progress';
import { useView } from '../../state/view';
import { BUY_EMOTES, DEFAULT_HOTBAR, hotChoice, hotChoices, hotOwned, PICK_DANCES, PICK_EMOTES, shownHotbar, type HotChoice } from '../../world/emotes';
import type { Anim } from '../../world/types';

/** What the turntable in Customise is doing while the Emotes tab is open: the emote or dance last tapped. */
export const usePreviewAnim = create<Anim | null>(() => null);

/**
 * Customise's Emotes tab: the emote hotbar along the bottom of the screen, eight slots with keys 1 to 8. Tap a slot,
 * then tap what goes in it (or drag one onto a slot, or one slot onto another to swap them). Saved as it changes,
 * under the player's name (game/progress.ts setMyHotbar), not with the Save button.
 */
export function HotbarPicks() {
  const items = useMyItems();
  const st = useView().mode === 'st';
  const slots = shownHotbar(useMyHotbar(), { items }, st);
  const [sel, setSel] = useState(0);
  const preview = usePreviewAnim();
  const save = (next: string[]) => setMyHotbar(next);

  /** Puts a choice in a slot; if it's already in another, the two swap. */
  const put = (i: number, id: string) => {
    const next = [...slots];
    const was = next.indexOf(id);
    if (was >= 0) next[was] = next[i];
    next[i] = id;
    save(next);
  };
  const swap = (a: number, b: number) => {
    if (b < 0 || b >= slots.length || a === b) return;
    const next = [...slots];
    [next[a], next[b]] = [next[b], next[a]];
    save(next);
  };
  const show = (id: string) => usePreviewAnim.setState(id && id !== PICK_DANCES && id !== PICK_EMOTES ? (id as Anim) : null, true);

  // Dragging: a choice (by id) or a slot (by number).
  const drag = (what: string) => (e: DragEvent) => {
    e.dataTransfer.setData('text/plain', what);
    e.dataTransfer.effectAllowed = 'move';
  };
  const drop = (i: number) => (e: DragEvent) => {
    e.preventDefault();
    const what = e.dataTransfer.getData('text/plain');
    if (what.startsWith('slot:')) swap(Number(what.slice(5)), i);
    else if (hotChoice(what)) put(i, what);
    setSel(i);
  };

  const all = hotChoices();
  const mine = all.filter((c) => hotOwned(c.id, { items }, st));
  const groups: [string, HotChoice[]][] = [
    ['Pickers', mine.filter((c) => c.kind === 'picker')],
    ['Emotes', mine.filter((c) => c.kind === 'free' || c.kind === 'emote')],
    ['Dances', mine.filter((c) => c.kind === 'dance')],
  ];
  const toBuy = BUY_EMOTES.filter((e) => !hotOwned(e.anim, { items }, st)).length;
  const cur = slots[sel] ? hotChoice(slots[sel]) : null;

  return (
    <>
      <p className="join-pick-note">
        Your emote bar along the bottom of the screen. Tap a slot, then tap what goes in it, or drag them about. Changes are kept as you make them.
      </p>
      <div className="hotbar-edit" role="listbox" aria-label="Emote bar slots">
        {slots.map((id, i) => {
          const c = id ? hotChoice(id) : null;
          return (
            <button
              key={i}
              role="option"
              aria-selected={sel === i}
              className={`hotbar-cell ${sel === i ? 'on' : ''} ${c ? '' : 'empty'}`}
              onClick={() => (setSel(i), show(id))}
              draggable={Boolean(c)}
              onDragStart={drag(`slot:${i}`)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={drop(i)}
              title={c ? `${i + 1}: ${c.label}` : `${i + 1}: empty`}
            >
              <span className="slot-key">{i + 1}</span>
              <span className="hotbar-cell-icon">{c?.icon ?? ''}</span>
              <span className="hotbar-cell-name">{c?.label ?? 'Empty'}</span>
            </button>
          );
        })}
      </div>
      <div className="hotbar-tools">
        <button className="cosy-btn small" disabled={sel === 0} onClick={() => (swap(sel, sel - 1), setSel(sel - 1))} aria-label="Move left">
          ◀
        </button>
        <button className="cosy-btn small" disabled={sel === slots.length - 1} onClick={() => (swap(sel, sel + 1), setSel(sel + 1))} aria-label="Move right">
          ▶
        </button>
        <button className="cosy-btn small" disabled={!cur} onClick={() => put(sel, '')}>
          Clear slot {sel + 1}
        </button>
        <button className="cosy-btn small" disabled={slots.join() === DEFAULT_HOTBAR.join()} onClick={() => save(DEFAULT_HOTBAR)}>
          Reset
        </button>
      </div>
      {groups.map(([title, list]) => (
        <div key={title}>
          <h3 className="seat-picks-head">{title}</h3>
          <div className="join-items hotbar-choices" role="group" aria-label={title}>
            {list.map((c) => {
              const at = slots.indexOf(c.id);
              return (
                <button
                  key={c.id}
                  className={`join-item ${at === sel ? 'on' : ''} ${preview === c.id ? 'playing' : ''}`}
                  onClick={() => {
                    show(c.id);
                    put(sel, c.id);
                    // On to the next slot, to fill a few in a row.
                    setSel(Math.min(sel + 1, slots.length - 1));
                  }}
                  draggable
                  onDragStart={drag(c.id)}
                  title={`Put ${c.label} in slot ${sel + 1}`}
                >
                  <span className="join-item-icon">{c.icon}</span>
                  <span className="join-item-name">{c.label}</span>
                  {at >= 0 && <span className="hotbar-at">{at + 1}</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {toBuy > 0 && (
        <p className="join-pick-note">
          {toBuy} more emote{toBuy === 1 ? '' : 's'} at the Lucky Raven’s shop, from a facepalm to a tiny trumpet.{' '}
          <button className="link-btn" onClick={() => useHud.setState({ casino: { kind: 'shop', tab: 'emotes', away: true } })}>
            See them
          </button>
        </p>
      )}
      {preview && <p className="hotbar-playing">Showing: {hotChoice(preview)?.label}</p>}
    </>
  );
}
