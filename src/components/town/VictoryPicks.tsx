import { useState } from 'react';
import { casino } from '../../casino/client';
import { shopVictories } from '../../casino/shop';
import { useHud } from '../../game/hud';
import { money } from '../../game/profiles';
import { useMoney, useMyItems } from '../../game/progress';
import { useView } from '../../state/view';
import { AnimalPreview } from '../../world/AnimalPreview';
import { fixLook, type Look } from '../../world/types';
import { DEFAULT_VICTORY, ownsVictory, victoryAnim, victoryKey, victoryMove, VICTORY_MOVES, type VictoryId } from '../../world/victoryShop';
import { wearLook } from './JoinFlow';

/**
 * Victory moves: Customise's Victory tab (choose among yours, try any of them on your animal) and the Shop's shelf of
 * them. The one chosen goes on your look ('win'), and everyone sees it in the lineup when your team wins.
 */

/** Buy button for a victory move, straight from here (the host takes the money and says how it went). */
function BuyNow({ id }: { id: VictoryId }) {
  const coins = useMoney();
  const move = victoryMove(id);
  const short = (move.price ?? 0) - coins;
  return (
    <>
      <button className="cosy-btn primary" disabled={short > 0} onClick={() => casino({ k: 'buyItem', item: victoryKey(id) })}>
        Buy {money(move.price ?? 0)}
      </button>
      {short > 0 && <span className="shop-need">Not enough money: {money(short)} more to go</span>}
    </>
  );
}

// ---------------------------------------------------------------- Customise's Victory tab

/** Your victory move among those you own; tapping any of them plays it on your animal (see LookEditor). */
export function VictoryPicks({ look, setLook, trying, setTrying }: { look: Look; setLook: (l: Look) => void; trying: VictoryId | null; setTrying: (id: VictoryId) => void }) {
  const items = useMyItems();
  const v = useView();
  // (Bought from here only once seated: the host needs to know whose money it is.)
  const seated = v.mode === 'player' && Boolean(v.seats.find((s) => s.isMe)?.look);
  const chosen = look.win ?? DEFAULT_VICTORY;
  const shown = victoryMove(trying ?? chosen);
  const owned = (id: VictoryId) => ownsVictory(id, items);
  // Yours first (the fist pump at the top), then the rest cheapest first.
  const list = [...VICTORY_MOVES].sort((a, b) => Number(!owned(a.id)) - Number(!owned(b.id)) || (a.price ?? 0) - (b.price ?? 0));
  return (
    <>
      <p className="join-pick-note">
        What you do in the lineup when your team wins. Tap one to see it.{' '}
        <button className="link-btn" onClick={() => useHud.setState({ casino: { kind: 'shop', tab: 'win', away: true } })}>
          More at the shop
        </button>
      </p>
      <div className={`win-pick-now ${owned(shown.id) ? '' : 'locked'}`}>
        <b>
          {shown.icon} {shown.name}
        </b>
        <span>{shown.blurb}</span>
        {!owned(shown.id) && (seated ? <BuyNow id={shown.id} /> : <span className="shop-need">{money(shown.price ?? 0)} at the Lucky Raven’s shop</span>)}
        {owned(shown.id) && shown.id === chosen && <span className="win-pick-yours">Yours, and chosen ✓</span>}
      </div>
      <div className="join-items" role="radiogroup" aria-label="Victory move">
        {list.map((m) => {
          const mine = owned(m.id);
          const on = m.id === chosen;
          return (
            <button
              key={m.id}
              className={`join-item ${on ? 'on' : ''} ${mine ? '' : 'locked'} ${trying === m.id ? 'trying' : ''}`}
              onClick={() => {
                setTrying(m.id);
                if (mine) setLook({ ...look, win: m.id === DEFAULT_VICTORY ? null : m.id });
              }}
              role="radio"
              aria-checked={on}
              title={mine ? m.name : `${m.name}: ${money(m.price ?? 0)} at the Lucky Raven’s shop`}
            >
              <span className="join-item-icon">{m.icon}</span>
              <span className="join-item-name">{m.name}</span>
              {!mine && <i>🔒</i>}
              {!mine && <span className="join-item-price">{money(m.price ?? 0)}</span>}
            </button>
          );
        })}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- the shop's shelf

/** The Victory shelf: thirty moves for the end of the game, one of them playing on your animal at the top. */
export function VictoryShelf() {
  const items = useMyItems();
  const v = useView();
  const player = v.mode === 'player';
  const me = v.seats.find((s) => s.isMe);
  const moves = shopVictories();
  const owned = (id: VictoryId) => !player || ownsVictory(id, items);
  const [picked, setPicked] = useState<VictoryId>(() => (moves.find((m) => !owned(m.id)) ?? moves[0]).id);
  const shown = victoryMove(picked);
  const using = (me?.look?.win ?? DEFAULT_VICTORY) === picked;
  const use = (id: VictoryId) => me?.look && wearLook(me.name, fixLook({ ...me.look, win: id }));
  const action = (id: VictoryId) => {
    if (!owned(id)) return <BuyNow id={id} />;
    if (!player) return <span className="shop-owned">On the shelf</span>;
    const on = (me?.look?.win ?? DEFAULT_VICTORY) === id;
    return (
      <button className="cosy-btn" disabled={!me?.look || on} onClick={() => use(id)}>
        {on ? 'Using ✓' : 'Use it'}
      </button>
    );
  };
  return (
    <>
      <p className="casino-blurb">
        When your team wins, everyone sees the winners lined up on a stage, each doing their victory move. Everyone has the fist pump; each of these is yours to keep. Tap one to see it.
      </p>
      {me?.look && (
        <div className="try-on win-try-on">
          <AnimalPreview look={me.look} size={150} spin={false} anim={victoryAnim(picked)} className="try-on-picture try-on-live" />
          <div className="try-on-words">
            <b>
              {shown.icon} {shown.name}
            </b>
            <span>{owned(picked) ? (using ? 'Yours, and what you’ll do' : 'Yours') : money(shown.price ?? 0)}</span>
            <span className="try-on-fx">{shown.blurb}</span>
            {action(picked)}
          </div>
        </div>
      )}
      <div className="shop-grid">
        {moves.map((m) => (
          <div key={m.id} className={`shop-pet shop-win ${owned(m.id) ? 'owned' : ''} ${picked === m.id ? 'picked' : ''}`} onClick={() => setPicked(m.id)}>
            <span className="shop-pet-icon shop-dance-icon">{m.icon}</span>
            <span className="shop-pet-name">{m.name}</span>
            <span onClick={(e) => e.stopPropagation()} className="shop-hat-buy">
              {action(m.id)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
