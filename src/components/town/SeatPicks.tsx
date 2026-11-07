import { useEffect, useState } from 'react';
import type { Object3D } from 'three';
import { casino } from '../../casino/client';
import { useHud } from '../../game/hud';
import { money } from '../../game/profiles';
import { useMyItems } from '../../game/progress';
import { drawless } from '../../lib/util';
import { useView } from '../../state/view';
import { objectThumbnail } from '../../world/animals';
import { cleanEpitaph, EPITAPH_MAX, graveKey, GRAVES, stoolKey, STOOLS, type GraveId, type StoolId } from '../../world/stoolShop';
import { graveObject, SEAT, stoolObject } from '../../world/town/stools';
import { fixLook, type AnimalId, type Look } from '../../world/types';
import { loadThumb, queueThumbnail, saveThumb, wearLook } from './JoinFlow';
import { ShopPane } from './ShopPane';

/**
 * Stools for the circle and gravestones for the churchyard: their pictures, the Shop's two shelves of them, and the
 * Seat tab in Customise. Bought ones are chosen onto your look ('stool' and 'grave'), which everyone sees.
 */

/** A picture drawn once (its emoji until then), kept between visits like the hats'. */
function useThumb(key: string, make: () => Object3D): string | null {
  const [src, setSrc] = useState<string | null>(() => loadThumb(key as AnimalId, ''));
  useEffect(() => {
    if (src || drawless()) return;
    let live = true;
    const cancel = queueThumbnail(() => {
      if (!live) return;
      const url = objectThumbnail(key, make, 96) || null;
      setSrc(url);
      if (url) saveThumb(key as AnimalId, '', url);
    });
    return () => {
      live = false;
      cancel();
    };
  }, [key, src]);
  return src;
}

export function StoolPicture({ id, icon }: { id: StoolId | null; icon: string }) {
  const src = useThumb(`stool-${id ?? 'log'}`, () => stoolObject(id));
  return src ? <img className="pet-picture hat-picture" src={src} alt="" /> : <>{icon}</>;
}

export function GravePicture({ id, icon }: { id: GraveId | null; icon: string }) {
  const src = useThumb(`grave-${id ?? 'plain'}`, () => graveObject(id, 'R.I.P.'));
  return src ? <img className="pet-picture hat-picture" src={src} alt="" /> : <>{icon}</>;
}

const PLAIN_STOOL = { id: null, name: 'Log stool', icon: '🪵', price: 0 };
const PLAIN_GRAVE = { id: null, name: 'Plain stone', icon: '🪦', price: 0 };

// ---------------------------------------------------------------- the shop's shelves

/** What a buy button does, from the shop (it says how much more is needed when it can't). */
type Buy = (props: { price: number; onBuy: () => void; what: string }) => React.ReactElement;

function useMine() {
  const v = useView();
  const me = v.seats.find((s) => s.isMe);
  const wear = (change: Partial<Look>) => me?.look && wearLook(me.name, fixLook({ ...me.look, ...change }));
  return { me, look: me?.look ?? null, wear };
}

/** The Seats shelf: the stools for the circle round the dais. */
export function StoolShelf({ BuyButton }: { BuyButton: Buy }) {
  const items = useMyItems();
  const { look, wear } = useMine();
  const using = look?.stool ?? null;
  const list = [PLAIN_STOOL, ...STOOLS];
  // The one you're sat on in the preview: yours, until another is tapped.
  const [picked, setPicked] = useState<StoolId | null>(using);
  const shown = list.find((s) => s.id === picked) ?? list[0];
  const owned = (s: (typeof list)[number]) => !s.id || items.includes(stoolKey(s.id));
  const action = (s: (typeof list)[number]) =>
    owned(s) ? (
      <button className="cosy-btn" disabled={!look || using === s.id} onClick={() => wear({ stool: s.id })}>
        {using === s.id ? 'Your seat ✓' : 'Use this seat'}
      </button>
    ) : (
      <BuyButton price={s.price} what={`the ${s.name.toLowerCase()}`} onBuy={() => casino({ k: 'buyItem', item: stoolKey(s.id!) })} />
    );
  return (
    <>
      <p className="casino-blurb">A seat of your own in the circle round the dais in the square: everyone sees you sit on it, at every meeting. Yours to keep. Tap one to try it.</p>
      {look && (
        <ShopPane
          look={{ ...look, pet: null }}
          anim="sit"
          spin
          lift={SEAT}
          zoom={1.1}
          prop={{ key: `stool-${shown.id ?? 'log'}`, make: () => stoolObject(shown.id) }}
          title={
            <>
              {shown.icon} {shown.name}
            </>
          }
          sub={owned(shown) ? (using === shown.id ? 'Your seat' : 'Yours') : money(shown.price)}
          action={action(shown)}
        />
      )}
      <div className="shop-grid">
        {list.map((s) => (
          <div key={s.id ?? 'log'} className={`shop-pet shop-seat shop-hat ${owned(s) ? 'owned' : ''} ${picked === s.id ? 'picked' : ''}`} onClick={() => setPicked(s.id)}>
            <span className="shop-pet-icon">
              <StoolPicture id={s.id} icon={s.icon} />
            </span>
            <span className="shop-pet-name">{s.name}</span>
            <span onClick={(e) => e.stopPropagation()} className="shop-hat-buy">
              {action(s)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

/** The Gravestones shelf, and the line to put on yours. */
export function GraveShelf({ BuyButton }: { BuyButton: Buy }) {
  const items = useMyItems();
  const { me, look, wear } = useMine();
  const using = look?.grave ?? null;
  const list = [PLAIN_GRAVE, ...GRAVES];
  // The one shown beside you in the preview, with your name on it: yours, until another is tapped.
  const [picked, setPicked] = useState<GraveId | null>(using);
  const shown = list.find((g) => g.id === picked) ?? list[0];
  const owned = (g: (typeof list)[number]) => !g.id || items.includes(graveKey(g.id));
  const action = (g: (typeof list)[number]) =>
    owned(g) ? (
      <button className="cosy-btn" disabled={!look || using === g.id} onClick={() => wear({ grave: g.id })}>
        {using === g.id ? 'Yours ✓' : 'Choose it'}
      </button>
    ) : (
      <BuyButton price={g.price} what={`the ${g.name.toLowerCase()}`} onBuy={() => casino({ k: 'buyItem', item: graveKey(g.id!) })} />
    );
  const name = me?.name.trim() || 'R.I.P.';
  const epitaph = look?.epitaph ?? '';
  return (
    <>
      <p className="casino-blurb">When you die, a gravestone goes up for you in the churchyard. Choose how it looks, and what it says under your name. Yours to keep. Tap one to see it.</p>
      {look && (
        <ShopPane
          look={{ ...look, pet: null }}
          shift={0.42}
          zoom={1.1}
          prop={{ key: `grave-${shown.id ?? 'plain'}-${name}-${epitaph}`, make: () => graveObject(shown.id, name, epitaph), x: -0.36, ry: 0.25 }}
          title={
            <>
              {shown.icon} {shown.name}
            </>
          }
          sub={owned(shown) ? (using === shown.id ? 'Your gravestone' : 'Yours') : money(shown.price)}
          action={action(shown)}
        />
      )}
      {look && <Epitaph look={look} onSave={(epitaph) => wear({ epitaph })} />}
      <div className="shop-grid">
        {list.map((g) => (
          <div key={g.id ?? 'plain'} className={`shop-pet shop-seat shop-hat ${owned(g) ? 'owned' : ''} ${picked === g.id ? 'picked' : ''}`} onClick={() => setPicked(g.id)}>
            <span className="shop-pet-icon">
              <GravePicture id={g.id} icon={g.icon} />
            </span>
            <span className="shop-pet-name">{g.name}</span>
            <span onClick={(e) => e.stopPropagation()} className="shop-hat-buy">
              {action(g)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

/** The line under your name on your gravestone (40 characters), saved straight onto your look. */
function Epitaph({ look, onSave }: { look: Look; onSave: (epitaph: string) => void }) {
  const [text, setText] = useState(look.epitaph ?? '');
  useEffect(() => setText(look.epitaph ?? ''), [look.epitaph]);
  const clean = cleanEpitaph(text);
  const changed = clean !== (look.epitaph ?? '');
  return (
    <form
      className="epitaph"
      onSubmit={(e) => {
        e.preventDefault();
        if (changed) onSave(clean);
      }}
    >
      <label>
        <span>On your gravestone, under your name</span>
        <input className="cosy-input" value={text} maxLength={EPITAPH_MAX} onChange={(e) => setText(e.target.value)} placeholder="Here lies a very honest Washerwoman" />
      </label>
      <button className="cosy-btn" disabled={!changed}>
        {changed ? 'Save' : 'Saved ✓'}
      </button>
    </form>
  );
}

// ---------------------------------------------------------------- Customise's Seat tab

/** Your stool and gravestone among those you own, and your epitaph, in Customise (saved with the rest). */
export function SeatPicks({ look, setLook, only }: { look: Look; setLook: (l: Look) => void; only: 'stool' | 'grave' }) {
  const items = useMyItems();
  const stools = [PLAIN_STOOL, ...STOOLS];
  const graves = [PLAIN_GRAVE, ...GRAVES];
  const tile = (key: string, on: boolean, owned: boolean, name: string, price: number, picture: React.ReactNode, choose: () => void) => (
    <button key={key} className={`join-item ${on ? 'on' : ''} ${owned ? '' : 'locked'}`} onClick={() => owned && choose()} role="radio" aria-checked={on} aria-disabled={!owned} title={owned ? name : `${name}: ${money(price)} at the Lucky Raven’s shop`}>
      <span className="join-item-icon">{picture}</span>
      <span className="join-item-name">{name}</span>
      {!owned && <i>🔒</i>}
      {!owned && <span className="join-item-price">{money(price)}</span>}
    </button>
  );
  // Yours first, then the rest with their prices.
  const mine = <T extends { id: string | null }>(list: T[], kind: 'stool' | 'grave') => [...list].sort((a, b) => Number(Boolean(a.id) && !items.includes(`${kind}:${a.id}`)) - Number(Boolean(b.id) && !items.includes(`${kind}:${b.id}`)));
  return (
    <>
      {only === 'stool' ? (
        <>
          <p className="join-pick-note">
            Your stool in the circle round the dais, where you sit at every meeting.{' '}
            <button className="link-btn" onClick={() => useHud.setState({ casino: { kind: 'shop', tab: 'seats', away: true } })}>
              More at the shop
            </button>
          </p>
          <div className="join-items" role="radiogroup" aria-label="Stool">
            {mine(stools, 'stool').map((s) => tile(`s-${s.id}`, (look.stool ?? null) === s.id, !s.id || items.includes(stoolKey(s.id)), s.name, s.price, <StoolPicture id={s.id} icon={s.icon} />, () => setLook({ ...look, stool: s.id })))}
          </div>
        </>
      ) : (
        <>
          <p className="join-pick-note">
            Your gravestone in the churchyard, for when you die, and what it says under your name.{' '}
            <button className="link-btn" onClick={() => useHud.setState({ casino: { kind: 'shop', tab: 'graves', away: true } })}>
              More at the shop
            </button>
          </p>
          <label className="epitaph epitaph-in-picks">
            <span>On your gravestone, under your name</span>
            <input className="cosy-input" value={look.epitaph ?? ''} maxLength={EPITAPH_MAX} onChange={(e) => setLook({ ...look, epitaph: e.target.value.slice(0, EPITAPH_MAX) })} placeholder="Here lies a very honest Washerwoman" />
          </label>
          <div className="join-items" role="radiogroup" aria-label="Gravestone">
            {mine(graves, 'grave').map((g) => tile(`g-${g.id}`, (look.grave ?? null) === g.id, !g.id || items.includes(graveKey(g.id)), g.name, g.price, <GravePicture id={g.id} icon={g.icon} />, () => setLook({ ...look, grave: g.id })))}
          </div>
        </>
      )}
    </>
  );
}
