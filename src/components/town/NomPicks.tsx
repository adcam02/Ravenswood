import { casino } from '../../casino/client';
import { shopNomMoves } from '../../casino/shop';
import { useHud } from '../../game/hud';
import { NOM_MOVES, nomKey, ownsNom, type NomMove, type NomMoveId, type NomReaction } from '../../game/nomMoves';
import { money } from '../../game/profiles';
import { useMyItems } from '../../game/progress';
import { useView } from '../../state/view';
import { fixLook, type Look } from '../../world/types';
import { wearLook } from './JoinFlow';

/**
 * Ways to nominate (see game/nomMoves.ts): the Shop's shelf of them and the Nominate tab in Customise. The one
 * chosen goes on your look ('nom'), and plays for everyone at the meeting when you nominate someone.
 */

/** How the one nominated takes it, in a few words. */
const REACTS: Record<NomReaction, string> = {
  jump: 'they jump out of their skin',
  tremble: 'they tremble and sweat',
  gasp: 'they gasp',
  faint: 'they faint clean away',
  pearls: 'they clutch their pearls',
  freeze: 'they freeze in the light',
  dun: 'dun dun DUN',
};

const using = (look: Look | null | undefined): NomMoveId => look?.nom ?? 'you';

/** What a buy button does, from the shop (it says how much more is needed when it can't). */
type Buy = (props: { price: number; onBuy: () => void; what: string }) => React.ReactElement;

/** The Nominations shelf: each move with what it does and how they react, to buy or to choose. */
export function NomShelf({ BuyButton }: { BuyButton: Buy }) {
  const items = useMyItems();
  const v = useView();
  const player = v.mode === 'player';
  const me = v.seats.find((s) => s.isMe);
  const look = me?.look ?? null;
  const choose = (id: NomMoveId) => me && look && wearLook(me.name, fixLook({ ...look, nom: id }));
  return (
    <>
      <p className="casino-blurb">
        How you nominate at the meeting: everyone watches a little scene of you doing it, and of their face when it lands. A plain “YOU!” and the paper aeroplane are everyone’s; each of the
        rest is yours to keep.
      </p>
      <div className="shop-grid">
        {[...NOM_MOVES.filter((m) => !m.price), ...shopNomMoves()].map((m) => {
          const owned = !player || ownsNom(m.id, items);
          const on = using(look) === m.id;
          return (
            <div key={m.id} className={`shop-pet shop-slay shop-nom ${owned ? 'owned' : ''} ${on ? 'picked' : ''}`}>
              <NomBadge m={m} />
              <span className="shop-pet-name">{m.name}</span>
              <span className="shop-slay-note">{m.blurb}</span>
              {owned ? (
                <button className="cosy-btn" disabled={!look || on} onClick={() => choose(m.id)}>
                  {on ? 'Yours, chosen ✓' : 'Choose it'}
                </button>
              ) : (
                <BuyButton price={m.price!} what={`the ${m.name.toLowerCase()}`} onBuy={() => casino({ k: 'buyItem', item: nomKey(m.id) })} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

/** The move's picture: its icon flying over to a little face, and what they say. */
function NomBadge({ m }: { m: NomMove }) {
  return (
    <span className="nom-badge" aria-hidden="true">
      <span className="nom-badge-icon">{m.icon}</span>
      <span className="nom-badge-shout">“{m.shout}”</span>
      <span className="nom-badge-react" title={REACTS[m.react]}>
        {m.reply}
      </span>
    </span>
  );
}

/** Customise's Nominate tab: the moves you own (and the rest, locked, with their prices). */
export function NomPicks({ look, setLook }: { look: Look; setLook: (l: Look) => void }) {
  const items = useMyItems();
  const list = [...NOM_MOVES].sort((a, b) => Number(!ownsNom(a.id, items)) - Number(!ownsNom(b.id, items)));
  return (
    <>
      <p className="join-pick-note">
        What everyone sees when you nominate someone at the meeting.{' '}
        <button className="link-btn" onClick={() => useHud.setState({ casino: { kind: 'shop', tab: 'nom', away: true } })}>
          More at the shop
        </button>
      </p>
      <div className="join-items" role="radiogroup" aria-label="How you nominate">
        {list.map((m) => {
          const owned = ownsNom(m.id, items);
          const on = using(look) === m.id;
          return (
            <button
              key={m.id}
              className={`join-item ${on ? 'on' : ''} ${owned ? '' : 'locked'}`}
              onClick={() => owned && setLook({ ...look, nom: m.id === 'you' ? null : m.id })}
              role="radio"
              aria-checked={on}
              aria-disabled={!owned}
              title={owned ? `${m.name}: “${m.shout}”, and ${REACTS[m.react]}` : `${m.name}: ${money(m.price ?? 0)} at the Lucky Raven’s shop`}
            >
              <span className="join-item-icon">{m.icon}</span>
              <span className="join-item-name">{m.name}</span>
              {!owned && <i>🔒</i>}
              {!owned && <span className="join-item-price">{money(m.price ?? 0)}</span>}
            </button>
          );
        })}
      </div>
    </>
  );
}
