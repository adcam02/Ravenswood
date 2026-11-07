import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { casino, hostNow } from '../../casino/client';
import { boughtNote, danceKey, hatKey, petPrice, shopDances, shopEmotes, shopHats, shopPets, shopSlayMoves, wareOf } from '../../casino/shop';
import { emoteKey, type EmoteAnim } from '../../world/emotes';
import { SLAY_KINDS, slayKey } from '../../game/slayMoves';
import type { CasinoView } from '../../casino/types';
import { game, useHud, type ShopTab } from '../../game/hud';
import { money } from '../../game/profiles';
import { useMoney, useMyItems, useMyPets, useProgress } from '../../game/progress';
import { tillSound } from '../../lib/audio';
import { useView } from '../../state/view';
import { HAT_FX } from '../../world/hatFx';
import { DOMAIN_HAT, fixLook, HATS, TROPHY_HAT, type Anim, type HatId } from '../../world/types';
import { nomMove, ownsNom } from '../../game/nomMoves';
import { HatPicture, PetPicture, wearLook } from './JoinFlow';
import { AwayNote, ShopPane, useAtCounter } from './ShopPane';
import { GraveShelf, StoolShelf } from './SeatPicks';
import { VictoryShelf } from './VictoryPicks';
import { NomShelf } from './NomPicks';

/**
 * The Lucky Raven's shop, at the counter by the door: pets, hats and dances, each on its own shelf, with your own
 * animal at the top showing whichever is picked. Everything is paid for and handed over by the Storyteller's browser
 * (casino/host.ts); this only shows the shelves and sends what you choose. Something not bought yet (a locked dance in
 * the Dances picker, say) opens it from anywhere to look, but things are only bought at a counter: the casino's, the
 * tavern's shop corner, or the market's main stall, which open this same shop.
 */
export function Shop({ view, tab: wanted }: { view: CasinoView | null; tab?: ShopTab; away?: boolean }) {
  const [tab, setTab] = useState<ShopTab>(wanted ?? 'pets');
  const counter = useAtCounter();
  const [nomPick, setNomPick] = useState<string | null>(null);
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
    ['emotes', '🎭', 'Emotes'],
    ['win', '🏆', 'Victory'],
    ['nom', '👉', 'Nominations'],
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
        {!counter && <p className="shop-away">Just looking: things are bought at the shop’s counters, in the casino, the market or the tavern.</p>}
        {tab === 'pets' ? (
          <Pets />
        ) : tab === 'hats' ? (
          <Hats />
        ) : tab === 'seats' ? (
          <StoolShelf BuyButton={BuyButton} />
        ) : tab === 'graves' ? (
          <GraveShelf BuyButton={BuyButton} />
        ) : tab === 'slay' ? (
          <SlayMoves />
        ) : tab === 'emotes' ? (
          <Emotes />
        ) : tab === 'win' ? (
          <VictoryShelf />
        ) : tab === 'nom' ? (
          <>
            <NomPane picked={nomPick} />
            <div className="shop-shelf" onClick={(e) => setNomPick((e.target as Element).closest('[data-pick]')?.getAttribute('data-pick') ?? nomPick)}>
              <NomShelf BuyButton={BuyButton} />
            </div>
          </>
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

/**
 * What a buy button says, or how much more it needs. Away from a counter there's no button: things are only bought at
 * one (and the host refuses anything else).
 */
function BuyButton({ price, onBuy, what }: { price: number; onBuy: () => void; what: string }) {
  const coins = useMoney();
  const player = useView().mode === 'player';
  const counter = useAtCounter();
  const short = price - coins;
  if (!counter) {
    return <AwayNote price={price} />;
  }
  return (
    <>
      <button className="cosy-btn primary" disabled={!player || short > 0} onClick={onBuy} title={short > 0 ? `Not enough money: you need ${money(short)} more for ${what}` : undefined}>
        Buy {money(price)}
      </button>
      {player && short > 0 && <span className="shop-need">Not enough money: {money(short)} more to go</span>}
    </>
  );
}

/** Tapping a card picks it for the preview; its buttons do their own thing. */
const keep = (e: { stopPropagation: () => void }) => e.stopPropagation();

// ---------------------------------------------------------------- the shelves

function Pets() {
  const pets = useMyPets();
  const v = useView();
  const me = v.seats.find((s) => s.isMe);
  const list = shopPets();
  const owned = (id: string) => pets.includes(id as never);
  // The one beside you in the preview: the one you have with you, or the first not bought yet, until another is picked.
  const [picked, setPicked] = useState<string>(() => me?.look?.pet ?? (list.find((p) => !owned(p.id)) ?? list[0]).id);
  const shown = list.find((p) => p.id === picked) ?? list[0];
  const wear = (pet: string | null) => me?.look && wearLook(me.name, fixLook({ ...me.look, pet: pet as never }));
  const action = (p: (typeof list)[number]) => {
    if (owned(p.id)) {
      const wearing = me?.look?.pet === p.id;
      return (
        <button className="cosy-btn" disabled={!me?.look} onClick={() => wear(wearing ? null : p.id)}>
          {wearing ? 'Wearing ✓' : 'Wear it'}
        </button>
      );
    }
    return <BuyButton price={petPrice(p.id)} what={`the ${p.name.toLowerCase()}`} onBuy={() => casino({ k: 'buy', pet: p.id })} />;
  };
  return (
    <>
      <p className="casino-blurb">A friend to trot along beside you, yours to keep in every game. Money comes from playing: finishing a game, winning, surviving, achievements, and the tables here. Tap one to see it with you.</p>
      {me?.look && (
        <ShopPane
          look={{ ...me.look, pet: shown.id as never }}
          spin
          zoom={1.1}
          title={
            <>
              {shown.icon} {shown.name}
            </>
          }
          sub={owned(shown.id) ? 'Yours' : money(petPrice(shown.id))}
          action={action(shown)}
        />
      )}
      <div className="shop-grid">
        {list.map((p) => (
          <div key={p.id} className={`shop-pet shop-hat ${owned(p.id) ? 'owned' : ''} ${picked === p.id ? 'picked' : ''}`} onClick={() => setPicked(p.id)}>
            <span className="shop-pet-icon">
              <PetPicture id={p.id} icon={p.icon} />
            </span>
            <span className="shop-pet-name">{p.name}</span>
            <span onClick={keep} className="shop-hat-buy">
              {action(p)}
            </span>
          </div>
        ))}
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
        <ShopPane
          className={picked === TROPHY_HAT ? 'trophy' : ''}
          look={{ ...me.look, pet: null, hat: picked }}
          spin
          title={
            <>
              {tryOn.icon} {tryOn.name}
            </>
          }
          sub={owned(picked) ? 'Yours' : money(tryOn.price ?? 0)}
          note={HAT_FX[picked] && <>✨ Comes with {HAT_FX[picked]}</>}
          action={action(picked, tryOn.price ?? 0, tryOn.name)}
        />
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
            ) : h.id === DOMAIN_HAT ? (
              <span className="shop-trophy-note">
                Domain Expansion: once a day, out in town, open a starry dome where you stand. Up to three can be inside: they hear only each other, nobody outside hears them, for up to three minutes, and nobody sees who they are.
              </span>
            ) : (
              HAT_FX[h.id] && <span className="shop-fx-note">✨ Comes with {HAT_FX[h.id]}</span>
            )}
            <span onClick={keep} className="shop-hat-buy">
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
  const v = useView();
  const player = v.mode === 'player';
  const me = v.seats.find((s) => s.isMe);
  const list = shopDances();
  const owned = (anim: Anim) => !player || items.includes(danceKey(anim));
  const [picked, setPicked] = useState<Anim>(() => (list.find((d) => !owned(d.anim)) ?? list[0]).anim);
  const shown = list.find((d) => d.anim === picked) ?? list[0];
  const action = (d: (typeof list)[number]) =>
    owned(d.anim) ? (
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
    );
  return (
    <>
      <p className="casino-blurb">New moves for the Dances picker (the old favourites stay free). Each one is yours to keep, and counts for every dancing achievement. Tap one to see it.</p>
      {me?.look && (
        <ShopPane
          look={{ ...me.look, pet: null }}
          anim={shown.anim}
          title={
            <>
              {shown.icon} {shown.label}
            </>
          }
          sub={owned(shown.anim) ? 'Yours' : money(shown.price!)}
          action={action(shown)}
        />
      )}
      <div className="shop-grid">
        {list.map((d) => (
          <div key={d.anim} className={`shop-pet shop-dance shop-emote ${owned(d.anim) ? 'owned' : ''} ${picked === d.anim ? 'picked' : ''}`} onClick={() => setPicked(d.anim)}>
            <span className="shop-pet-icon shop-dance-icon">{d.icon}</span>
            <span className="shop-pet-name">{d.label}</span>
            <span onClick={keep} className="shop-hat-buy">
              {action(d)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

function SlayMoves() {
  const items = useMyItems();
  const v = useView();
  const player = v.mode === 'player';
  const me = v.seats.find((s) => s.isMe);
  const list = shopSlayMoves();
  const owned = (id: string) => !player || items.includes(slayKey(id as never));
  const [picked, setPicked] = useState<string>(() => (list.find((m) => !owned(m.id)) ?? list[0]).id);
  const shown = list.find((m) => m.id === picked) ?? list[0];
  const action = (m: (typeof list)[number]) =>
    owned(m.id) ? <span className="shop-owned">Yours ✓</span> : <BuyButton price={m.price!} what={`the ${m.name.toLowerCase()}`} onBuy={() => casino({ k: 'buyItem', item: slayKey(m.id) })} />;
  return (
    <>
      <p className="casino-blurb">
        How you do it when you claim to be the Slayer: the whole town watches in the square. Whether anyone dies is still up to the Storyteller. Everyone has the crossbow; each of these is yours to keep.
      </p>
      {me?.look && (
        // (The show itself needs the square: here it's you squaring up with it.)
        <ShopPane
          look={{ ...me.look, pet: null }}
          anim="point"
          badge={shown.icon}
          title={shown.name}
          sub={owned(shown.id) ? 'Yours' : money(shown.price!)}
          note={shown.blurb}
          action={action(shown)}
        />
      )}
      {/* On shelves by kind, cheapest first on each. */}
      {SLAY_KINDS.map(([kind, label]) => (
        <section key={kind} className="shop-slay-shelf">
          <h3 className="shop-slay-kind">{label}</h3>
          <div className="shop-grid">
            {list
              .filter((m) => m.kind === kind)
              .map((m) => (
                <div key={m.id} className={`shop-pet shop-slay shop-hat ${owned(m.id) ? 'owned' : ''} ${picked === m.id ? 'picked' : ''}`} onClick={() => setPicked(m.id)}>
                  <span className="shop-pet-icon shop-dance-icon">{m.icon}</span>
                  <span className="shop-pet-name">{m.name}</span>
                  <span className="shop-slay-note">{m.blurb}</span>
                  <span onClick={keep} className="shop-hat-buy">
                    {action(m)}
                  </span>
                </div>
              ))}
          </div>
        </section>
      ))}
    </>
  );
}

function Emotes() {
  const items = useMyItems();
  const v = useView();
  const player = v.mode === 'player';
  const me = v.seats.find((s) => s.isMe);
  const list = shopEmotes();
  const owned = (anim: EmoteAnim) => !player || items.includes(emoteKey(anim));
  // The one shown on your animal: the first not bought yet, until another is picked.
  const [picked, setPicked] = useState<EmoteAnim>(() => (list.find((e) => !owned(e.anim)) ?? list[0]).anim);
  const shown = list.find((e) => e.anim === picked)!;
  const action = (e: (typeof list)[number]) =>
    owned(e.anim) ? (
      <button
        className="cosy-btn"
        onClick={() => {
          close();
          game.emote(e.anim);
        }}
      >
        Do it
      </button>
    ) : (
      <BuyButton price={e.price} what={`“${e.label}”`} onBuy={() => casino({ k: 'buyItem', item: emoteKey(e.anim) })} />
    );
  return (
    <>
      <p className="casino-blurb">
        Little moves for every animal, a couple of seconds each, some with a prop or a puff of something. Yours to keep: put them on your emote bar from Customise, or find them in the
        Emotes picker. Tap one to see it.
      </p>
      {me?.look && (
        <ShopPane
          className="emote-try"
          look={{ ...me.look, pet: null }}
          anim={picked}
          title={
            <>
              {shown.icon} {shown.label}
            </>
          }
          sub={owned(picked) ? 'Yours' : money(shown.price)}
          note={shown.blurb}
          action={action(shown)}
        />
      )}
      <div className="shop-grid">
        {list.map((e) => (
          <div key={e.anim} className={`shop-pet shop-dance shop-emote ${owned(e.anim) ? 'owned' : ''} ${picked === e.anim ? 'picked' : ''}`} onClick={() => setPicked(e.anim)}>
            <span className="shop-pet-icon shop-dance-icon">{e.icon}</span>
            <span className="shop-pet-name">{e.label}</span>
            <span onClick={keep} className="shop-hat-buy">
              {action(e)}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

/**
 * The preview for the Nominations shelf (the shelf is NomPicks.tsx's): you pointing, with the move's picture and what
 * you shout. A card tapped on the shelf (each says which it is, `data-pick`) is the one shown.
 */
function NomPane({ picked }: { picked: string | null }) {
  const items = useMyItems();
  const v = useView();
  const player = v.mode === 'player';
  const me = v.seats.find((s) => s.isMe);
  if (!me?.look) return null;
  const m = nomMove(picked ?? me.look.nom);
  const owned = !player || ownsNom(m.id, items);
  return <ShopPane look={{ ...me.look, pet: null }} anim="point" badge={m.icon} shout={m.shout} title={m.name} sub={owned ? 'Yours' : money(m.price ?? 0)} note={m.blurb} />;
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
