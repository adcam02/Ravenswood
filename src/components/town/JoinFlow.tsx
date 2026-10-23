import { useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { askForNotifications } from '../../lib/notify';
import { drawless } from '../../lib/util';
import { player, useClient, useTaken } from '../../net/client';
import { useVoice, voice } from '../../voice/voice';
import { AnimalPreview } from '../../world/AnimalPreview';
import { animalThumbnail } from '../../world/animals';
import { ANIMALS, animalInfo, BACKS, EXTRA_COLORS, FACES, fixLook, HATS, NECKS, PETS, type AnimalId, type Look } from '../../world/types';
import { useProgress } from '../../game/progress';

type Step = 'name' | 'animal' | 'mic';

/** Lets the settings window reopen the animal picker later. */
export const useJoin = create<{ reopen: boolean; held: string | null }>(() => ({ reopen: false, held: null }));

/** Holds an animal with the host while we look at it (or choose it), so nobody else takes it meanwhile. */
function holdAnimal(name: string, animal: string) {
  if (useJoin.getState().held === animal) return;
  useJoin.setState({ held: animal });
  player.hold(name, animal);
}

const NAME_KEY = 'ravenswood:name';
const LOOK_KEY = 'ravenswood:look';

function saved<T>(key: string, fallback: T): T {
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

/** Arriving in Ravenswood: your name, then your animal, then your microphone. */
export function JoinFlow({ room, current }: { room: string; current: { name: string; look: Look | null } | null }) {
  const reopen = useJoin((s) => s.reopen);
  const [step, setStep] = useState<Step>(reopen && current ? 'animal' : 'name');
  const [name, setName] = useState(current?.name || saved<string>(NAME_KEY, ''));
  const others = useOthersAnimals();
  const [look, setLook] = useState<Look>(() => fixLook(current?.look ?? saved<Look | null>(LOOK_KEY, null)));
  const [note, setNote] = useState<string | null>(null);

  // The host said our animal is someone else's: back to the picker, which moves us to a free one.
  const taken = useTaken();
  useEffect(() => {
    if (!taken.animal || Date.now() - taken.at > 5000) return;
    // We don't hold it after all.
    if (useJoin.getState().held === taken.animal) useJoin.setState({ held: null });
    const who = animalInfo(taken.animal as AnimalId)?.name ?? 'that animal';
    setNote(`${taken.by} just took the ${who.toLowerCase()}. Pick another!`);
    setStep((s) => (s === 'name' ? s : 'animal'));
  }, [taken.at, taken.animal, taken.by]);

  const finish = (l: Look) => {
    const clean = name.trim();
    save(NAME_KEY, clean);
    save(LOOK_KEY, l);
    player.join(clean, fixLook(l));
    askForNotifications();
    useJoin.setState({ reopen: false });
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
        <AnimalPicker
          name={name}
          look={look}
          setLook={setLook}
          others={others}
          note={note}
          onBack={() => setStep('name')}
          onDone={() => {
            setNote(null);
            if (reopen) finish(look);
            else setStep('mic');
          }}
        />
      )}
      {step === 'mic' && <MicStep name={name} look={look} onBack={() => setStep('animal')} onDone={() => finish(look)} />}
    </div>
  );
}

type DressTab = 'hat' | 'face' | 'neck' | 'back' | 'pet';
const TABS: { id: DressTab; label: string; icon: string }[] = [
  { id: 'hat', label: 'Hats', icon: '🎩' },
  { id: 'face', label: 'Face', icon: '👓' },
  { id: 'neck', label: 'Neck', icon: '🎀' },
  { id: 'back', label: 'Back', icon: '🎒' },
  { id: 'pet', label: 'Pet', icon: '🐾' },
];

/** Dress-up, like Among Us: hats are earned in earlier games (locked ones say how); the rest is free. */
function DressUp({ look, setLook }: { look: Look; setLook: (l: Look) => void }) {
  const progress = useProgress();
  const [tab, setTab] = useState<DressTab>('hat');
  const items: { id: string; name: string; icon: string; locked?: string }[] =
    tab === 'hat'
      ? HATS.map((h) => {
          const got = h.unlocked(progress);
          // Secret hats keep their secret until they're found.
          return got ? { id: h.id, name: h.name, icon: h.icon } : h.secret ? { id: h.id, name: 'A secret hat', icon: '❓', locked: 'Keep exploring Ravenswood…' } : { id: h.id, name: h.name, icon: h.icon, locked: h.how };
        })
      : tab === 'face'
        ? FACES
        : tab === 'neck'
          ? NECKS
          : tab === 'back'
            ? BACKS
            : PETS;
  const current = (look[tab] ?? null) as string | null;
  const choose = (id: string | null) => setLook({ ...look, [tab]: id });
  return (
    <div className="dress-up">
      <div className="dress-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={`dress-tab ${tab === t.id ? 'on' : ''} ${look[t.id] ? 'has' : ''}`} onClick={() => setTab(t.id)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>
      <div className="join-hats" role="radiogroup" aria-label={TABS.find((t) => t.id === tab)?.label}>
        <button className={`join-hat ${!current ? 'on' : ''}`} onClick={() => choose(null)} role="radio" aria-checked={!current} title="None">
          <span>🚫</span>
        </button>
        {items.map((it) => (
          <button
            key={it.id}
            className={`join-hat ${current === it.id ? 'on' : ''} ${it.locked ? 'locked' : ''}`}
            onClick={() => !it.locked && choose(it.id)}
            role="radio"
            aria-checked={current === it.id}
            aria-disabled={Boolean(it.locked)}
            title={it.locked ? `${it.name}: ${it.locked}` : it.name}
          >
            <span>{it.icon}</span>
            {it.locked && <i>🔒</i>}
          </button>
        ))}
      </div>
    </div>
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

function AnimalPicker({
  name,
  look,
  setLook,
  others,
  note,
  onBack,
  onDone,
}: {
  name: string;
  look: Look;
  setLook: (l: Look) => void;
  others: Map<string, { by: string; choosing: boolean }>;
  note: string | null;
  onBack: () => void;
  onDone: () => void;
}) {
  const choices = ANIMALS;
  const theirs = (id: string) => others.get(id);
  // Hold whatever we're looking at; if it's someone else's, move to the first free animal.
  useEffect(() => {
    if (theirs(look.animal)) {
      const free = choices.find((a) => !theirs(a.id));
      if (free && free.id !== look.animal) setLook({ ...look, animal: free.id, color: free.colors[0] });
      return;
    }
    holdAnimal(name, look.animal);
  });
  const info = animalInfo(look.animal);
  const colors = [...info.colors, ...EXTRA_COLORS.filter((c) => !info.colors.includes(c))];
  const pick = (id: AnimalId) => {
    if (theirs(id)) return;
    const next = animalInfo(id);
    // A new animal keeps its outfit.
    setLook({ ...look, animal: id, color: next.colors[0] });
  };
  return (
    <div className="join-card cosy-panel join-animal">
      <div className="join-animal-head">
        <span className="join-eyebrow">Hi {name.trim()}!</span>
        <h1>Choose your animal</h1>
        {note && <p className="join-note">{note}</p>}
      </div>
      <div className="join-animal-body">
        <div className="join-stage">
          <AnimalPreview look={look} size={260} spin anim="idle" />
          <strong className="join-animal-name">
            {info.name}
            {info.aquatic && <span className="join-wet"> · a little bit wet</span>}
          </strong>
          <div className="join-colors" role="radiogroup" aria-label="Colour">
            {colors.map((c) => (
              <button
                key={c}
                className={`join-color ${look.color.toLowerCase() === c.toLowerCase() ? 'on' : ''}`}
                style={{ background: c }}
                onClick={() => setLook({ ...look, color: c })}
                aria-label={c}
                role="radio"
                aria-checked={look.color.toLowerCase() === c.toLowerCase()}
              />
            ))}
          </div>
          <DressUp look={look} setLook={setLook} />
        </div>
        <div className="join-grid" role="radiogroup" aria-label="Animal">
          {choices.map((a) => (
            <AnimalTile key={a.id} id={a.id} on={a.id === look.animal} owner={theirs(a.id)} onPick={() => pick(a.id)} />
          ))}
        </div>
      </div>
      <div className="join-actions">
        <button className="cosy-btn" onClick={onBack}>
          Back
        </button>
        <button className="cosy-btn primary big" onClick={onDone}>
          This is me!
        </button>
      </div>
    </div>
  );
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

function AnimalTile({ id, on, owner, onPick }: { id: AnimalId; on: boolean; owner?: { by: string; choosing: boolean }; onPick: () => void }) {
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
      className={`join-tile ${on ? 'on' : ''} ${info.aquatic ? 'wet' : ''} ${owner ? 'taken' : ''}`}
      onClick={onPick}
      role="radio"
      aria-checked={on}
      aria-disabled={Boolean(owner)}
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
