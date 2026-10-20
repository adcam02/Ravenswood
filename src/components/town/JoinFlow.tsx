import { useEffect, useMemo, useState } from 'react';
import { create } from 'zustand';
import { askForNotifications } from '../../lib/notify';
import { player } from '../../net/client';
import { useVoice, voice } from '../../voice/voice';
import { AnimalPreview } from '../../world/AnimalPreview';
import { animalThumbnail } from '../../world/animals';
import { ANIMALS, animalInfo, EXTRA_COLORS, fixLook, isJarrod, type AnimalId, type Look } from '../../world/types';

type Step = 'name' | 'animal' | 'mic';

/** Lets the settings window reopen the animal picker later. */
export const useJoin = create<{ reopen: boolean }>(() => ({ reopen: false }));

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

/** Arriving in Ravenswood: your name, then your animal (unless you're Jarrod), then your microphone. */
export function JoinFlow({ room, current }: { room: string; current: { name: string; look: Look | null } | null }) {
  const reopen = useJoin((s) => s.reopen);
  const [step, setStep] = useState<Step>(reopen && current ? 'animal' : 'name');
  const [name, setName] = useState(current?.name || saved<string>(NAME_KEY, ''));
  const [look, setLook] = useState<Look>(() => fixLook(name, current?.look ?? saved<Look | null>(LOOK_KEY, null)));
  const jarrod = isJarrod(name);

  const finish = (l: Look) => {
    const clean = name.trim();
    save(NAME_KEY, clean);
    save(LOOK_KEY, l);
    player.join(clean, fixLook(clean, l));
    askForNotifications();
    useJoin.setState({ reopen: false });
  };

  const afterName = () => {
    if (!name.trim()) return;
    voice.unlock();
    if (isJarrod(name)) {
      // Jarrod skips the picker: the bunny is his.
      setLook(fixLook(name, look));
      setStep(reopen ? 'animal' : 'mic');
    } else {
      setLook((l) => fixLook(name, l));
      setStep('animal');
    }
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
      {step === 'animal' && !jarrod && <AnimalPicker name={name} look={look} setLook={setLook} onBack={() => setStep('name')} onDone={() => (reopen ? finish(look) : setStep('mic'))} />}
      {step === 'animal' && jarrod && (
        <div className="join-card cosy-panel join-bunny">
          <AnimalPreview look={look} size={220} spin anim="wave" />
          <h1>Jarrod, you’re the bunny!</h1>
          <p>Nobody else gets to be the bunny. It’s yours.</p>
          <button className="cosy-btn primary big" onClick={() => finish(look)}>
            Hop in
          </button>
        </div>
      )}
      {step === 'mic' && <MicStep name={name} look={look} jarrod={jarrod} onBack={() => setStep(jarrod ? 'name' : 'animal')} onDone={() => finish(look)} />}
    </div>
  );
}

function AnimalPicker({ name, look, setLook, onBack, onDone }: { name: string; look: Look; setLook: (l: Look) => void; onBack: () => void; onDone: () => void }) {
  const choices = useMemo(() => ANIMALS.filter((a) => !a.reservedFor), []);
  const info = animalInfo(look.animal);
  const colors = [...info.colors, ...EXTRA_COLORS.filter((c) => !info.colors.includes(c))];
  const pick = (id: AnimalId) => {
    const next = animalInfo(id);
    setLook({ animal: id, color: next.colors[0] });
  };
  return (
    <div className="join-card cosy-panel join-animal">
      <div className="join-animal-head">
        <span className="join-eyebrow">Hi {name.trim()}!</span>
        <h1>Choose your animal</h1>
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
        </div>
        <div className="join-grid" role="radiogroup" aria-label="Animal">
          {choices.map((a) => (
            <AnimalTile key={a.id} id={a.id} on={a.id === look.animal} onPick={() => pick(a.id)} />
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

function AnimalTile({ id, on, onPick }: { id: AnimalId; on: boolean; onPick: () => void }) {
  const info = animalInfo(id);
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    // Thumbnails render one at a time off screen, so let the page draw first.
    const t = setTimeout(() => {
      try {
        setSrc(animalThumbnail({ animal: id, color: info.colors[0] }, 96));
      } catch {
        setSrc(null);
      }
    }, 30);
    return () => clearTimeout(t);
  }, [id, info.colors]);
  return (
    <button className={`join-tile ${on ? 'on' : ''} ${info.aquatic ? 'wet' : ''}`} onClick={onPick} role="radio" aria-checked={on} title={info.name}>
      {src ? <img src={src} alt="" /> : <span className="join-tile-blank" />}
      <span>{info.name}</span>
    </button>
  );
}

function MicStep({ name, look, jarrod, onBack, onDone }: { name: string; look: Look; jarrod: boolean; onBack: () => void; onDone: () => void }) {
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
      {jarrod && <span className="join-eyebrow">Hello Jarrod! The bunny is yours, and only yours.</span>}
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
