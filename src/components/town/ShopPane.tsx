import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { money } from '../../game/profiles';
import { local } from '../../game/local';
import { useView } from '../../state/view';
import { AnimalPreview, type PreviewProp } from '../../world/AnimalPreview';
import { atShopCounter } from '../../world/town/layout';
import type { Anim, Look } from '../../world/types';

/**
 * The shop's preview, at the top of every shelf and staying there while the shelf scrolls: your own animal with
 * whatever's picked (wearing the hat, the pet beside it, doing the dance, sitting on the stool), its name and price,
 * and what you can do with it. Also whether you're at a counter, since things are only bought at one.
 */

/** Where things are bought, for anyone browsing from somewhere else. */
export const AWAY_NOTE = 'Buy this at the casino, the market or the tavern';

/** Whether this player is at one of the shop's counters right now (the Storyteller is never shopping). */
export function useAtCounter(): boolean {
  const player = useView().mode === 'player';
  const here = () => atShopCounter(local.zone, local.x, local.z);
  const [at, setAt] = useState(here);
  useEffect(() => {
    if (!player) return;
    const t = setInterval(() => setAt(here()), 400);
    return () => clearInterval(t);
  }, [player]);
  return !player || at;
}

/** Whether a buy button is in the preview (with room to say where to go) or on a card on the shelf. */
const InPane = createContext(false);

/** In place of a buy button away from a counter: where to go (on a card, just the price and "at a counter"). */
export function AwayNote({ price }: { price: number }) {
  return useContext(InPane) ? (
    <span className="shop-need shop-away-need">{AWAY_NOTE}.</span>
  ) : (
    <span className="shop-need shop-away-need" title={AWAY_NOTE}>
      {money(price)} at a counter
    </span>
  );
}

export function ShopPane({
  look,
  anim = 'idle',
  spin = false,
  prop = null,
  lift = 0,
  shift = 0,
  badge,
  shout,
  title,
  sub,
  note,
  action,
  className = '',
  zoom = 1.3,
}: {
  look: Look;
  anim?: Anim;
  spin?: boolean;
  prop?: PreviewProp | null;
  lift?: number;
  shift?: number;
  /** A big picture beside the animal (a move's icon), when the move itself can't be shown here. */
  badge?: string;
  /** What's said, in a bubble. */
  shout?: string;
  title: ReactNode;
  sub: ReactNode;
  note?: ReactNode;
  action?: ReactNode;
  className?: string;
  /** How much closer than the animal picker's framing (less with something beside the animal). */
  zoom?: number;
}) {
  return (
    <div className={`try-on shop-pane ${className}`}>
      <span className="shop-stage">
        <AnimalPreview look={look} size={150} spin={spin} anim={anim} prop={prop} lift={lift} shift={shift} zoom={zoom} className="try-on-picture try-on-live" />
        {badge && (
          <span className="shop-stage-badge" aria-hidden="true">
            {badge}
          </span>
        )}
        {shout && <span className="shop-stage-shout">“{shout}”</span>}
      </span>
      <div className="try-on-words">
        <b>{title}</b>
        <span>{sub}</span>
        {note && <span className="try-on-fx">{note}</span>}
        {action && (
          <span className="shop-pane-action">
            <InPane.Provider value={true}>{action}</InPane.Provider>
          </span>
        )}
      </div>
    </div>
  );
}
