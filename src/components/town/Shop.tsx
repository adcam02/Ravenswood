import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { casino, hostNow } from '../../casino/client';
import { boughtNote, danceKey, hatKey, petPrice, shopDances, shopHats, shopPets, shopSlayMoves, wareOf } from '../../casino/shop';
import { slayKey } from '../../game/slayMoves';
import type { CasinoView } from '../../casino/types';
import { game, useHud, type ShopTab } from '../../game/hud';
import { money } from '../../game/profiles';
import { useMoney, useMyItems, useMyPets, useProgress } from '../../game/progress';
import { tillSound } from '../../lib/audio';
import { useView } from '../../state/view';
import { HAT_FX } from '../../world/hatFx';
import { fixLook, HATS, TROPHY_HAT, type HatId } from '../../world/types';
import { HatPicture, PetPicture, TryOn, wearLook } from './JoinFlow';
import { GraveShelf, StoolShelf } from './SeatPicks';

/**
 * The Lucky Raven's shop, at the counter by the door: pets, hats and dances, each on its own shelf. Everything is
 * paid for and handed over by the Storyteller's browser (casino/host.ts); this only shows the shelves and sends what
 * you choose. A dance not bought yet opens it from anywhere (from the Dances picker), so hats and dances can be
 * bought away from the casino too; pets only at the counter.
 */
export function Shop({ view, tab: wanted, away }: { view: CasinoView | null; tab?: ShopTab; away?: boolean }) {
  const [tab, setTab] = useState<ShopTab>(wanted ?? 'pets');
  useEffect(() => {
    if (wanted) setTab(wanted);
  }, [wanted]);
  const coins = useMoney();
  const v = useView();
  const player = v.mode === 'player';
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const tabs: [ShopTab, string, string][] = [
    ['pets', '🐾', 'Pets'],
    ['hats', '🎩', 'Hats'],
    ['dances', '🪩', 'Dances'],
    ['seats', '🪑', 'Seats'],
    ['graves', '🪦', 'Graves'],
    ['slay', '🏹', 'Slayer moves'],
  ];
  return (
    <div className="notice-layer casino-layer" onClick={close}>
      <div className="casino-shop cosy-panel shop-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="The shop">
        <header>
          <span className="casino-eyebrow">The Lucky Raven</span>
          <h2>🛍️ The Shop</h2>
          {player && (
            <span className="casino-purse">
              You have <b>{money(coins)}</b>
            </span>
          )}
        </header>
        <div className="shop-tabs" role="tablist" aria-label="Shelves">
          {tabs.map(([id, icon, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={`shop-tab ${tab === id ? 'on' : ''}`} onClick={() => setTab(id)}>
              <span aria-hidden="true">{icon}</span> {label}
            </button>
          ))}
        </div>
        <ShopNote view={view} />
        {tab === 'pets' ? (
          <Pets away={away} />
        ) : tab === 'hats' ? (
          <Hats />
        ) : tab === 'seats' ? (
          <StoolShelf BuyButton={BuyButton} />
        ) : tab === 'graves' ? (
          <GraveShelf BuyButton={BuyButton} />
        ) : tab === 'slay' ? (
          <SlayMoves />
        ) : (
          <Dances />
        )}
        <button className="cosy-btn" onClick={close}>
          Close <span className="cosy-key">Esc</span>
        </button>
      </div>
    </div>
  );
}

const close = () => useHud.setState({ casino: null });

/** What a buy button says, or how much more it needs. */
function BuyButton({ price, onBuy, what }: { price: number; onBuy: () => void; what: string }) {
  const coins = useMoney();
  const player = useView().mode === 'player';
  const short = price - coins;
  return (
    <>
      <button className="cosy-btn primary" disabled={!player || short > 0} onClick={onBuy} title={short > 0 ? `Not enough money: you need ${money(short)} more for ${what}` : undefined}>
        Buy {money(price)}
      </button>
      {player && short > 0 && <span className="shop-need">Not enough money: {money(short)} more to go</span>}
    </>
  );
}

// ---------------------------------------------------------------- the shelves

function Pets({ away }: { away?: boolean }) {
  const pets = useMyPets();
  const v = useView();
  const me = v.seats.find((s) => s.isMe);
  const wear = (pet: string | null) => me?.look && wearLook(me.name, fixLook({ ...me.look, pet: pet as never }));
  return (
    <>
      <p className="casino-blurb">
        {away
          ? 'Pets are bought at the counter in the Lucky Raven, by the town square.'
          : 'A friend to trot along beside you, yours to keep in every game. Money comes from playing: finishing a game, winning, surviving, achievements, and the tables here.'}
      </p>
      <div className="shop-grid">
        {shopPets().map((p) => {
          const owned = pets.includes(p.id);
          const wearing = me?.look?.pet === p.id;
          return (
            <div key={p.id} className={`shop-pet ${owned ? 'owned' : ''}`}>
              <span className="shop-pet-icon">
                <PetPicture id={p.id} icon={p.icon} />
              </span>
              <span className="shop-pet-name">{p.name}</span>
              {owned ? (
                <button className="cosy-btn" disabled={!me?.look} onClick={() => wear(wearing ? null : p.id)}>
                  {wearing ? 'Wearing ✓' : 'Wear it'}
                </button>
              ) : away ? (
                <span className="shop-need">{money(petPrice(p.id))} at the counter</span>
              ) : (
                <BuyButton price={petPrice(p.id)} what={`the ${p.name.toLowerCase()}`} onBuy={() => casino({ k: 'buy', pet: p.id })} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Hats() {
  const items = useMyItems();
  const v = useView();
  const me = v.seats.find((s) => s.isMe);
  const owned = (hat: HatId) => items.includes(hatKey(hat));
  const hats = shopHats();
  // The one tried on: the first not bought yet, until another is picked.
  const [picked, setPicked] = useState<HatId>(() => (hats.find((h) => !owned(h.id)) ?? hats[0]).id);
  const tryOn = HATS.find((h) => h.id === picked)!;
  const wear = (hat: HatId | null) => me?.look && wearLook(me.name, fixLook({ ...me.look, hat }));
  const action = (hat: HatId, price: number, name: string) => {
    if (owned(hat)) {
      const wearing = me?.look?.hat === hat;
      return (
        <button className="cosy-btn" disabled={!me?.look} onClick={() => wear(wearing ? null : hat)}>
          {wearing ? 'Wearing ✓' : 'Wear it'}
        </button>
      );
    }
    return <BuyButton price={price} what={`the ${name.toLowerCase()}`} onBuy={() => casino({ k: 'buyItem', item: hatKey(hat) })} />;
  };
  return (
    <>
      <p className="casino-blurb">Hats you buy are yours to keep, and like every hat, each makes you a touch quicker about town. Tap one to try it on.</p>
      {me?.look && (
        <div className={`try-on ${picked === TROPHY_HAT ? 'trophy' : ''}`}>
          <TryOn look={{ ...me.look, hat: picked }} icon={tryOn.icon} />
          <div className="try-on-words">
            <b>{tryOn.name}</b>
            <span>{owned(picked) ? 'Yours' : money(tryOn.price ?? 0)}</span>
            {HAT_FX[picked] && <span className="try-on-fx">✨ Comes with {HAT_FX[picked]}</span>}
            {action(picked, tryOn.price ?? 0, tryOn.name)}
          </div>
        </div>
      )}
      <div className="shop-grid">
        {hats.map((h) => (
          <div
            key={h.id}
            className={`shop-pet shop-hat ${owned(h.id) ? 'owned' : ''} ${h.id === TROPHY_HAT ? 'trophy' : ''} ${picked === h.id ? 'picked' : ''}`}
            onClick={() => setPicked(h.id)}
          >
            <span className="shop-pet-icon">
              <HatPicture id={h.id} icon={h.icon} />
            </span>
            <span className="shop-pet-name">{h.name}</span>
            {h.id === TROPHY_HAT ? (
              <span className="shop-trophy-note">For showing off: it comes with a golden glow and gold sparkles all round you, and puts a little crown by your name.</span>
            ) : (
              HAT_FX[h.id] && <span className="shop-fx-note">✨ Comes with {HAT_FX[h.id]}</span>
            )}
            <span onClick={(e) => e.stopPropagation()} className="shop-hat-buy">
              {action(h.id, h.price!, h.name)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function Dances() {
  const items = useMyItems();
  const player = useView().mode === 'player';
  return (
    <>
      <p className="casino-blurb">New moves for the Dances picker (the old favourites stay free). Each one is yours to keep, and counts for every dancing achievement.</p>
      <div className="shop-grid">
        {shopDances().map((d) => {
          const owned = !player || items.includes(danceKey(d.anim));
          return (
            <div key={d.anim} className={`shop-pet shop-dance ${owned ? 'owned' : ''}`}>
              <span className="shop-pet-icon shop-dance-icon">{d.icon}</span>
              <span className="shop-pet-name">{d.label}</span>
              {owned ? (
                <button
                  className="cosy-btn"
                  onClick={() => {
                    close();
                    game.emote(d.anim);
                  }}
                >
                  Dance it
                </button>
              ) : (
                <BuyButton price={d.price!} what={`“${d.label}”`} onBuy={() => casino({ k: 'buyItem', item: danceKey(d.anim) })} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function SlayMoves() {
  const items = useMyItems();
  const player = useView().mode === 'player';
  return (
    <>
      <p className="casino-blurb">
        How you do it when you claim to be the Slayer: the whole town watches in the square. Whether anyone dies is still up to the Storyteller. Everyone has the crossbow; each of these is yours to keep.
      </p>
      <div className="shop-grid">
        {shopSlayMoves().map((m) => {
          const owned = !player || items.includes(slayKey(m.id));
          return (
            <div key={m.id} className={`shop-pet shop-slay ${owned ? 'owned' : ''}`}>
              <span className="shop-pet-icon shop-dance-icon">{m.icon}</span>
              <span className="shop-pet-name">{m.name}</span>
              <span className="shop-slay-note">{m.blurb}</span>
              {owned ? <span className="shop-owned">Yours ✓</span> : <BuyButton price={m.price!} what={`the ${m.name.toLowerCase()}`} onBuy={() => casino({ k: 'buyItem', item: slayKey(m.id) })} />}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- saying how it went

/**
 * Something just bought (a hat or a dance arriving in your profile while the shop is open), with a ring of the till.
 * Kept here rather than in the panel, so nothing that redraws the panel can lose it.
 */
const useFlash = create<{ text: string; at: number } | null>(() => null);
useProgress.subscribe((s, prev) => {
  if (s.items === prev.items || useHud.getState().casino?.kind !== 'shop') return;
  const ware = s.items.filter((k) => !prev.items.includes(k)).map(wareOf).find(Boolean);
  if (!ware) return;
  tillSound();
  useFlash.setState({ text: boughtNote(ware), at: Date.now() }, true);
});

/** The latest word for this player: the host's note (in the casino), or something just bought, for a few seconds. */
function ShopNote({ view }: { view: CasinoView | null }) {
  const flash = useFlash();
  const host = view?.note ? { text: view.note.text, at: view.note.at - (hostNow() - Date.now()) } : null;
  const note = host && (!flash || host.at > flash.at) ? host : flash;
  const age = note ? Date.now() - note.at : Infinity;
  const [, tick] = useState(0);
  // (Looks again once it's had its few seconds.)
  useEffect(() => {
    if (age >= NOTE_MS) return;
    const t = setTimeout(() => tick((n) => n + 1), NOTE_MS - age + 30);
    return () => clearTimeout(t);
  });
  return note && age < NOTE_MS ? (
    <p className="casino-note" role="status">
      {note.text}
    </p>
  ) : null;
}
const NOTE_MS = 6000;
