import { useEffect, useMemo, useRef, useState } from 'react';
import { create } from 'zustand';
import { askForNotifications } from '../../lib/notify';
import { drawless } from '../../lib/util';
import { player, useClient, useTaken } from '../../net/client';
import { useVoice, voice } from '../../voice/voice';
import { AnimalPreview } from '../../world/AnimalPreview';
import { animalThumbnail } from '../../world/animals';
import { ANIMALS_ABC, animalInfo, EXTRA_COLORS, fixLook, HATS, hatsOwned, hatSpeedLabel, PETS, type AnimalId, type Look } from '../../world/types';
import { useProgress } from '../../game/progress';

type Step = 'name' | 'animal' | 'mic';

/** The animal we're holding with the host while we look at it in the picker (or the customiser). */
export const useJoin = create<{ held: string | null }>(() => ({ held: null }));

/** Holds an animal with the host while we look at it (or choose it), so nobody else takes it meanwhile. */
function holdAnimal(name: string, animal: string) {
  if (useJoin.getState().held === animal) return;
  useJoin.setState({ held: animal });
  player.hold(name, animal);
}

/** Lets go of whatever we were holding (closing the customiser without changing animal, or the game starting). */
export function letGoOfAnimal(name: string) {
  if (!useJoin.getState().held) return;
  useJoin.setState({ held: null });
  player.hold(name, null);
}

const NAME_KEY = 'ravenswood:name';
const LOOK_KEY = 'ravenswood:look';

export function saved<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* fine */
  }
}

/** Remembers the name and look in this browser for next time, and asks the host for them. */
export function wearLook(name: string, look: Look) {
  const clean = name.trim();
  save(NAME_KEY, clean);
  save(LOOK_KEY, look);
  player.join(clean, fixLook(look));
}

export const savedLook = () => saved<Look | null>(LOOK_KEY, null);

/** Arriving in Ravenswood: your name, then your animal, then your microphone. */
export function JoinFlow({ room, current }: { room: string; current: { name: string; look: Look | null } | null }) {
  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState(current?.name || saved<string>(NAME_KEY, ''));
  const [look, setLook] = useState<Look>(() => fixLook(current?.look ?? savedLook()));
  // (Someone back again starts with their own animal in view in the list; someone new, at the top.)
  const [returning] = useState(() => Boolean(current?.look ?? savedLook()));
  const [tab, setTab] = useState<PickTab>('animal');
  const [note, setNote] = useState<string | null>(null);

  // The host said our animal is someone else's: back to the picker, which moves us to a free one.
  const taken = useTaken();
  useEffect(() => {
    if (!taken.animal || Date.now() - taken.at > 5000) return;
    // We don't hold it after all.
    if (useJoin.getState().held === taken.animal) useJoin.setState({ held: null });
    const who = animalInfo(taken.animal as AnimalId)?.name ?? 'that animal';
    setNote(`${taken.by} just took the ${who.toLowerCase()}. Pick another!`);
    setTab('animal');
    setStep((s) => (s === 'name' ? s : 'animal'));
  }, [taken.at, taken.animal, taken.by]);

  const finish = (l: Look) => {
    wearLook(name, l);
    askForNotifications();
  };

  const afterName = () => {
    if (!name.trim()) return;
    voice.unlock();
    setLook((l) => fixLook(l));
    setStep('animal');
  };

  return (
    <div className="join cosy">
      <div className="join-room">Room {room}</div>
      {step === 'name' && (
        <form
          className="join-card cosy-panel join-name"
          onSubmit={(e) => {
            e.preventDefault();
            afterName();
          }}
        >
          <span className="join-eyebrow">Welcome to Ravenswood</span>
          <h1>What’s your name?</h1>
          <input className="cosy-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} autoFocus placeholder="As your friends know you" />
          <button className="cosy-btn primary big" disabled={!name.trim()}>
            Next
          </button>
        </form>
      )}
      {step === 'animal' && (
        <div className="join-card cosy-panel join-animal">
          <div className="join-animal-head">
            <span className="join-eyebrow">Hi {name.trim()}!</span>
            <h1>Choose your animal</h1>
            {note && <p className="join-note">{note}</p>}
          </div>
          <LookEditor name={name} look={look} setLook={setLook} locked={false} tab={tab} setTab={setTab} showMine={returning} />
          <div className="join-actions">
            <button className="cosy-btn" onClick={() => setStep('name')}>
              Back
            </button>
            <button
              className="cosy-btn primary big"
              onClick={() => {
                setNote(null);
                setStep('mic');
              }}
            >
              This is me!
            </button>
          </div>
        </div>
      )}
      {step === 'mic' && <MicStep name={name} look={look} onBack={() => setStep('animal')} onDone={() => finish(look)} />}
    </div>
  );
}

export type PickTab = 'animal' | 'hat' | 'pet';
const TABS: { id: PickTab; label: string; icon: string }[] = [
  { id: 'animal', label: 'Animal', icon: '🦊' },
  { id: 'hat', label: 'Hats', icon: '🎩' },
  { id: 'pet', label: 'Pet', icon: '🐾' },
];

/**
 * Choosing how you look, for the join screen and the customiser alike: the animal turning on its stand (with its pet)
 * and its colours on one side; the animals, hats and pets to choose from on the other. While a game is on (`locked`)
 * the animal and colour stay as they are, and only the hat and pet can change.
 */
export function LookEditor({
  name,
  look,
  setLook,
  locked,
  tab,
  setTab,
  showMine = true,
}: {
  name: string;
  look: Look;
  setLook: (l: Look) => void;
  locked: boolean;
  tab: PickTab;
  setTab: (t: PickTab) => void;
  /** Scroll the list to the chosen animal when it opens. */
  showMine?: boolean;
}) {
  const others = useOthersAnimals();
  const theirs = (id: string) => others.get(id);
  // The animal we are (or are looking at) in view in the list, which can be a long way down.
  const grid = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (tab === 'animal' && showMine) grid.current?.querySelector('.join-tile.on')?.scrollIntoView({ block: 'nearest' });
  }, [tab, showMine]);
  // Hold whatever we're looking at; if it's someone else's, move to the first free animal.
  useEffect(() => {
    if (locked) return;
    if (theirs(look.animal)) {
      const free = ANIMALS_ABC.find((a) => !theirs(a.id));
      if (free && free.id !== look.animal) setLook({ ...look, animal: free.id, color: free.colors[0] });
      return;
    }
    holdAnimal(name, look.animal);
  });
  const info = animalInfo(look.animal);
  const colors = [...info.colors, ...EXTRA_COLORS.filter((c) => !info.colors.includes(c))];
  const pick = (id: AnimalId) => {
    if (locked || theirs(id)) return;
    const next = animalInfo(id);
    // A new animal keeps its hat and pet.
    setLook({ ...look, animal: id, color: next.colors[0] });
  };
  const stays = 'Your animal and its colour stay the same until this game ends';
  return (
    <div className="join-animal-body">
      <div className="join-stage">
        <AnimalPreview look={look} size={260} spin={false} turnable anim="idle" />
        <strong className="join-animal-name">
          {info.name}
          {info.aquatic && <span className="join-wet"> · a little bit wet</span>}
        </strong>
        <div className={`join-colors ${locked ? 'locked' : ''}`} role="radiogroup" aria-label="Colour">
          {colors.map((c) => (
            <button
              key={c}
              className={`join-color ${look.color.toLowerCase() === c.toLowerCase() ? 'on' : ''}`}
              style={{ background: c }}
              onClick={() => !locked && setLook({ ...look, color: c })}
              aria-label={c}
              role="radio"
              aria-checked={look.color.toLowerCase() === c.toLowerCase()}
              aria-disabled={locked}
              title={locked ? stays : undefined}
            />
          ))}
        </div>
      </div>
      <div className="join-picks">
        <div className="dress-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`dress-tab ${tab === t.id ? 'on' : ''} ${t.id !== 'animal' && look[t.id] ? 'has' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
        {tab === 'animal' ? (
          <>
            {locked && (
              <p className="join-pick-note locked">
                🔒 You’re the {info.name.toLowerCase()} until this game ends, so everyone can keep track of who’s who. Your hat and pet can change any time,
                and once the game is over you can choose a new animal.
              </p>
            )}
            <div ref={grid} className={`join-grid ${locked ? 'locked' : ''}`} role="radiogroup" aria-label="Animal">
              {ANIMALS_ABC.map((a) => (
                <AnimalTile key={a.id} id={a.id} on={a.id === look.animal} owner={theirs(a.id)} locked={locked && a.id !== look.animal} onPick={() => pick(a.id)} />
              ))}
            </div>
          </>
        ) : (
          <DressUp tab={tab} look={look} setLook={setLook} />
        )}
      </div>
    </div>
  );
}

/** Hats are earned in earlier games (locked ones say how, when picked); pets are free for everyone. */
function DressUp({ tab, look, setLook }: { tab: 'hat' | 'pet'; look: Look; setLook: (l: Look) => void }) {
  const progress = useProgress();
  const [hint, setHint] = useState<string | null>(null);
  useEffect(() => setHint(null), [tab]);
  const items: { id: string; name: string; icon: string; locked?: string }[] =
    tab === 'hat'
      ? HATS.map((h) => {
          const got = h.unlocked(progress);
          // Secret hats keep their secret until they're found.
          return got ? { id: h.id, name: h.name, icon: h.icon } : h.secret ? { id: h.id, name: 'A secret hat', icon: '❓', locked: 'Keep exploring Ravenswood…' } : { id: h.id, name: h.name, icon: h.icon, locked: h.how };
        })
          // The ones you have first.
          .sort((a, b) => Number(Boolean(a.locked)) - Number(Boolean(b.locked)))
      : PETS;
  const current = (look[tab] ?? null) as string | null;
  const choose = (id: string | null) => setLook({ ...look, [tab]: id });
  const owned = hatsOwned(progress);
  return (
    <>
      <p className="join-pick-note">
        {hint ??
          (tab === 'hat'
            ? `Each hat you own: +0.1% speed. You have ${owned}, so you’re ${hatSpeedLabel(owned)} quicker about town.`
            : 'Your pet trots along beside you wherever you go.')}
      </p>
      <div className="join-items" role="radiogroup" aria-label={tab === 'hat' ? 'Hat' : 'Pet'}>
        <button className={`join-item ${!current ? 'on' : ''}`} onClick={() => choose(null)} role="radio" aria-checked={!current}>
          <span className="join-item-icon">🚫</span>
          <span className="join-item-name">{tab === 'hat' ? 'No hat' : 'No pet'}</span>
        </button>
        {items.map((it) => (
          <button
            key={it.id}
            className={`join-item ${current === it.id ? 'on' : ''} ${it.locked ? 'locked' : ''}`}
            onClick={() => (it.locked ? setHint(`🔒 ${it.name}: ${it.locked}`) : (setHint(null), choose(it.id)))}
            role="radio"
            aria-checked={current === it.id}
            aria-disabled={Boolean(it.locked)}
            title={it.locked ? `${it.name}: ${it.locked}` : it.name}
          >
            <span className="join-item-icon">{it.icon}</span>
            <span className="join-item-name">{it.name}</span>
            {it.locked && <i>🔒</i>}
          </button>
        ))}
      </div>
    </>
  );
}

/**
 * Animals other players have (or are choosing right now), with who: each animal belongs to one player.
 * Our own seat and the animal we're holding don't count.
 */
function useOthersAnimals(): Map<string, { by: string; choosing: boolean }> {
  const pub = useClient((s) => s.pub);
  const mySeat = useClient((s) => s.priv?.seatId ?? null);
  const held = useJoin((s) => s.held);
  return useMemo(() => {
    const out = new Map<string, { by: string; choosing: boolean }>();
    for (const s of pub?.seats ?? []) if (s.claimed && s.id !== mySeat && s.look?.animal) out.set(s.look.animal, { by: s.name || 'Someone', choosing: false });
    for (const [animal, by] of Object.entries(pub?.picking ?? {})) if (animal !== held && !out.has(animal)) out.set(animal, { by, choosing: true });
    return out;
  }, [pub, mySeat, held]);
}

/** Portraits are drawn one per frame, in order, so the picker stays responsive while they appear. */
const thumbQueue: (() => void)[] = [];
let thumbPump = 0;
function queueThumbnail(job: () => void): () => void {
  thumbQueue.push(job);
  const pump = () => {
    thumbPump = 0;
    const next = thumbQueue.shift();
    if (!next) return;
    next();
    if (thumbQueue.length) thumbPump = requestAnimationFrame(pump);
  };
  if (!thumbPump) thumbPump = requestAnimationFrame(pump);
  return () => {
    const i = thumbQueue.indexOf(job);
    if (i >= 0) thumbQueue.splice(i, 1);
  };
}

/** Thumbnails are kept in the browser between visits, keyed by the build, so a return visit skips 36 renders. */
const thumbKey = (id: AnimalId, color: string) => `ravenswood:thumb:${__BUILD__}:${id}:${color}`;
function loadThumb(id: AnimalId, color: string): string | null {
  try {
    return localStorage.getItem(thumbKey(id, color));
  } catch {
    return null;
  }
}
function saveThumb(id: AnimalId, color: string, url: string) {
  try {
    // Older builds' thumbnails are cleared out the first time a new build stores one.
    if (!localStorage.getItem('ravenswood:thumbs-for') || localStorage.getItem('ravenswood:thumbs-for') !== __BUILD__) {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k?.startsWith('ravenswood:thumb:') && !k.startsWith(`ravenswood:thumb:${__BUILD__}:`)) localStorage.removeItem(k);
      }
      localStorage.setItem('ravenswood:thumbs-for', __BUILD__);
    }
    localStorage.setItem(thumbKey(id, color), url);
  } catch {
    /* storage full or blocked: thumbnails just render each visit */
  }
}

function AnimalTile({ id, on, owner, locked, onPick }: { id: AnimalId; on: boolean; owner?: { by: string; choosing: boolean }; locked?: boolean; onPick: () => void }) {
  const info = animalInfo(id);
  const [src, setSrc] = useState<string | null>(() => loadThumb(id, info.colors[0]));
  useEffect(() => {
    if (src || drawless()) return;
    let live = true;
    const cancel = queueThumbnail(() => {
      if (!live) return;
      try {
        const url = animalThumbnail({ animal: id, color: info.colors[0] }, 96) || null;
        setSrc(url);
        if (url) saveThumb(id, info.colors[0], url);
      } catch {
        setSrc(null);
      }
    });
    return () => {
      live = false;
      cancel();
    };
  }, [id, info.colors, src]);
  return (
    <button
      className={`join-tile ${on ? 'on' : ''} ${info.aquatic ? 'wet' : ''} ${owner ? 'taken' : ''} ${locked ? 'locked' : ''}`}
      onClick={onPick}
      role="radio"
      aria-checked={on}
      aria-disabled={Boolean(owner) || locked}
      title={owner ? `${info.name}: ${owner.choosing ? `${owner.by} is choosing it` : `taken by ${owner.by}`}` : info.name}
    >
      {src ? <img src={src} alt="" /> : <span className="join-tile-blank" />}
      <span>{info.name}</span>
      {owner && <em className="join-tile-owner">{owner.choosing ? `${owner.by} is looking…` : owner.by}</em>}
    </button>
  );
}

function MicStep({ name, look, onBack, onDone }: { name: string; look: Look; onBack: () => void; onDone: () => void }) {
  const mic = useVoice((s) => s.mic);
  const [level, setLevel] = useState(0);
  useEffect(() => {
    if (mic !== 'on') return;
    const t = setInterval(() => setLevel(voice.speaking() ? 1 : 0), 100);
    return () => clearInterval(t);
  }, [mic]);
  return (
    <div className="join-card cosy-panel join-mic">
      <AnimalPreview look={look} size={180} spin={false} anim={level ? 'laugh' : 'wave'} />
      <h1>Can everyone hear you?</h1>
      <p>Ravenswood has proximity chat: people close to you hear you, people far away don’t, and buildings are private. Headphones stop echo.</p>
      {mic === 'on' ? (
        <div className={`mic-meter ${level ? 'loud' : ''}`}>
          <span />
          {level ? 'We can hear you!' : 'Say something…'}
        </div>
      ) : (
        <button className="cosy-btn big" onClick={() => void voice.enableMic()} disabled={mic === 'asking'}>
          🎙️ {mic === 'asking' ? 'Waiting for your browser…' : 'Turn on my microphone'}
        </button>
      )}
      {mic === 'denied' && <p className="join-warn">Your browser blocked the mic. Click the padlock beside the address bar to allow it, or carry on and just listen.</p>}
      {mic === 'error' && <p className="join-warn">We couldn’t find a microphone. You can still listen.</p>}
      <div className="join-actions">
        <button className="cosy-btn" onClick={onBack}>
          Back
        </button>
        <button className="cosy-btn primary big" onClick={onDone}>
          {mic === 'on' ? `Into town, ${name.trim()}!` : 'Just listen for now'}
        </button>
      </div>
    </div>
  );
}
