import { useEffect, useRef, useState } from 'react';
import { JobGame } from '../../jobs';
import { game, useHud } from '../../game/hud';
import { local, useLocal } from '../../game/local';
import { presence } from '../../game/presence';
import { loadJSON, saveJSON } from '../../lib/util';
import { useClient } from '../../net/client';
import { ui, useUI } from '../../state/ui';
import { nightMusic } from '../../lib/music';
import { useView } from '../../state/view';
import { useVoice, voice } from '../../voice/voice';
import { EMOTES, type Item } from '../../world/types';
import { Icon } from '../Icon';

const ITEM_NAMES: Record<Item['k'], [string, string]> = {
  ale: ['🍺', 'an ale'],
  cider: ['🍹', 'a cider'],
  milk: ['🥛', 'a glass of milk'],
  cocoa: ['☕', 'a cocoa'],
  loaf: ['🍞', 'a loaf of bread'],
  pie: ['🥧', 'a pie'],
  bun: ['🥐', 'a bun'],
  fish: ['🐟', 'a fish'],
  flower: ['🌷', 'a flower'],
  rod: ['🎣', 'a fishing rod'],
  can: ['🚿', 'a watering can'],
  washing: ['🧺', 'the washing'],
  grimoire: ['📖', 'the grimoire'],
  water: ['🪣', 'a bucket of well water'],
};

export const itemName = (item: Item) => ITEM_NAMES[item.k]?.[1] ?? 'something';
export const itemEmoji = (item: Item) => ITEM_NAMES[item.k]?.[0] ?? '✨';

/** Where you are and what time of day it is. */
export function PlaceChip() {
  const view = useView();
  const place = useHud((s) => s.place);
  const status = useClient((s) => s.status);
  const night = view.phase === 'night';
  return (
    <div className="place-chip cosy-panel">
      <span className={`place-time ${night ? 'night' : 'day'}`}>
        <Icon name={night ? 'moon' : 'sun'} />
        {view.day === 0 && !night ? 'Before the game' : `${night ? 'Night' : 'Day'} ${view.day}`}
      </span>
      <strong>{place}</strong>
      {view.mode === 'player' && status !== 'open' && <span className="place-warn">{status === 'waiting' ? 'Waiting for the Storyteller…' : 'Reconnecting…'}</span>}
    </div>
  );
}

/** Microphone, push-to-talk and volume. */
export function VoiceDock() {
  const v = useVoice();
  const hearing = useHud((s) => s.hearing);
  const [open, setOpen] = useState(false);
  const [talking, setTalking] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const t = setInterval(() => setTalking(local.speaking), 120);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [open]);

  const live = v.mic === 'on' && !v.muted && (!v.pushToTalk || v.holding);
  let label = 'Turn on mic';
  if (v.mic === 'asking') label = 'Allow the mic…';
  else if (v.mic === 'denied') label = 'Mic blocked';
  else if (v.mic === 'error') label = 'No mic found';
  else if (v.mic === 'on') label = v.muted ? 'Muted' : v.pushToTalk ? (v.holding ? 'Talking' : 'Hold V to talk') : 'Mic on';

  return (
    <div className="voice-dock" ref={wrap}>
      <button
        className={`voice-main cosy-btn ${live ? 'live' : ''} ${talking ? 'talking' : ''} ${v.mic === 'on' && v.muted ? 'muted' : ''}`}
        onClick={() => {
          if (v.mic !== 'on') void voice.enableMic();
          else voice.setMuted(!v.muted);
        }}
        title={v.mic === 'on' ? 'Mute or unmute (M)' : 'Turn on your microphone'}
      >
        <Icon name={v.mic === 'on' && !v.muted ? 'mic' : 'micOff'} />
        <span>{label}</span>
      </button>
      <span className={`voice-ears cosy-btn ${hearing ? 'some' : ''}`} title="People close enough to hear you right now (the ones with a speaker by their name)">
        🔊 {hearing}
      </span>
      <button className="cosy-btn voice-more" onClick={() => setOpen(!open)} aria-label="Voice settings" title="Voice settings">
        <Icon name="cog" />
      </button>
      {open && (
        <div className="voice-pop cosy-panel">
          {!v.available && <p className="voice-note">Voice needs the main connection. It will come back on its own.</p>}
          {v.mic === 'denied' && <p className="voice-note">Your browser blocked the mic. Click the padlock by the address bar, allow the microphone, then refresh.</p>}
          <label className="voice-row">
            <span>Hold V to talk</span>
            <input type="checkbox" checked={v.pushToTalk} onChange={(e) => voice.setPushToTalk(e.target.checked)} />
          </label>
          <label className="voice-row col">
            <span>Everyone else’s volume</span>
            <input type="range" min={0} max={1} step={0.05} value={v.volume} onChange={(e) => useVoice.setState({ volume: Number(e.target.value) })} />
          </label>
          <p className="voice-note">
            {v.links ? `Connected to ${v.links} ${v.links === 1 ? 'person' : 'people'}.` : 'Nobody else connected yet.'} You hear people close by, and only people in the same building.
            Headphones stop echo. If you’re also in a Discord call, everyone hears everyone regardless, so leave the voice channel while you play.
          </p>
        </div>
      )}
    </div>
  );
}

/** "E  Pour a drink" */
export function ActionPrompt() {
  const prompt = useHud((s) => s.prompt);
  const job = useHud((s) => s.job);
  if (!prompt || job) return null;
  return (
    <button className={`action-prompt cosy-panel ${prompt.locked ? 'locked' : ''}`} onClick={() => !prompt.locked && game.interact()} disabled={prompt.locked}>
      {prompt.key && <span className="cosy-key">{prompt.key}</span>}
      <span>{prompt.label}</span>
    </button>
  );
}

/** What's in your paw, and what you can do with it. */
export function HandSlot() {
  const item = useLocal((s) => s.item);
  const giveTo = useHud((s) => s.giveTo);
  const canSip = useHud((s) => s.canSip);
  const job = useHud((s) => s.job);
  if (!item || item.k === 'grimoire' || job) return null;
  const drink = ['ale', 'cider', 'milk', 'cocoa'].includes(item.k);
  return (
    <div className="hand-slot cosy-panel">
      <span className="hand-item" title={itemName(item)}>
        {itemEmoji(item)}
      </span>
      <div className="hand-actions">
        {canSip && (
          <button className="cosy-btn small" onClick={game.sip}>
            {drink ? 'Sip' : 'Bite'}
          </button>
        )}
        {giveTo && (
          <button className="cosy-btn small primary" onClick={game.give} title="G">
            <Icon name="gift" /> Give to {giveTo.name}
          </button>
        )}
        <button className="cosy-btn small" onClick={game.putAway} title="Q">
          Put away
        </button>
      </div>
    </div>
  );
}

export function EmoteBar() {
  const emote = useHud((s) => s.emote);
  const job = useHud((s) => s.job);
  if (job) return null;
  return (
    <div className="emote-bar cosy-panel" role="toolbar" aria-label="Emotes">
      {EMOTES.map((e) => (
        <button key={e.anim} className={`emote ${emote === e.anim ? 'on' : ''}`} onClick={() => game.emote(e.anim)} title={`${e.label} (${e.key})`}>
          <span className="emote-icon">{({ wave: '👋', dance: '💃', cheer: '🙌', laugh: '😂', cry: '😢', sit: '🪑' } as Record<string, string>)[e.anim]}</span>
          <span className="emote-label">{e.label}</span>
        </button>
      ))}
    </div>
  );
}

/** The bell is ringing: off to the square. */
export function BellCall() {
  const view = useView();
  const call = view.townHall;
  const me = view.seats.find((s) => s.isMe);
  if (!call || !me || call.back.includes(me.id)) return null;
  return (
    <div className="bell-call cosy-panel" key={`${call.id}${call.ring}`}>
      <span className="bell-emoji">🔔</span>
      <div>
        <strong>The bell is ringing!</strong>
        <span>Taking you to your seat at the square…</span>
      </div>
      <button className="cosy-btn primary" onClick={game.goToSquare}>
        Go now
      </button>
    </div>
  );
}

/** During a meeting: hop onto your stool around the clock tower. */
export function MeetingSeat() {
  const view = useView();
  const me = view.seats.find((s) => s.isMe);
  const job = useHud((s) => s.job);
  if (!me || job || !(view.nomination || view.townHall)) return null;
  if (view.townHall && !view.townHall.back.includes(me.id)) return null;
  return (
    <button className="meeting-seat cosy-btn" onClick={game.takeMeetingSeat}>
      🪵 Take your seat
    </button>
  );
}

export function JobLayer() {
  const job = useHud((s) => s.job);
  if (!job) return null;
  return <JobGame key={job.station} job={job.job} onDone={(r) => game.jobDone(r)} onCancel={() => game.jobCancel()} />;
}

export function Fade() {
  const fading = useHud((s) => s.fading);
  return <div className={`world-fade ${fading ? 'on' : ''}`} aria-hidden="true" />;
}

/** "Abbey gave you a cocoa" */
export function GiftNotice() {
  const gift = useLocal((s) => s.gift);
  const seen = useRef<number | null>(null);
  useEffect(() => {
    if (!gift || gift.key === seen.current) return;
    seen.current = gift.key;
    ui.toast(gift.from ? `${gift.from} gave you ${itemName(gift.item)} ${itemEmoji(gift.item)}` : `You picked up ${itemName(gift.item)} ${itemEmoji(gift.item)}`, 'good');
  }, [gift]);
  return null;
}

/** Storyteller: hold to be heard all over town. */
export function Announce() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    presence.announce = on;
  }, [on]);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'b' && !e.repeat && !(document.activeElement instanceof HTMLInputElement)) setOn(true);
    };
    const up = (e: KeyboardEvent) => e.key.toLowerCase() === 'b' && setOn(false);
    const off = () => setOn(false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', off);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', off);
      presence.announce = false;
    };
  }, []);
  return (
    <button
      className={`announce cosy-btn ${on ? 'primary live' : ''}`}
      onPointerDown={() => setOn(true)}
      onPointerUp={() => setOn(false)}
      onPointerLeave={() => setOn(false)}
      title="Hold to speak to the whole town (B)"
    >
      <Icon name="megaphone" /> {on ? 'Everyone can hear you' : 'Hold to speak to everyone'} <span className="cosy-key">B</span>
    </button>
  );
}

const HELP_KEY = 'ravenswood:help-seen';

export function HelpCard() {
  const [open, setOpen] = useState(() => !loadJSON<boolean>(HELP_KEY, false));
  const close = () => {
    setOpen(false);
    saveJSON(HELP_KEY, true);
  };
  if (!open)
    return (
      <button className="help-btn cosy-btn small" onClick={() => setOpen(true)} title="Controls">
        <Icon name="keyboard" />
      </button>
    );
  return (
    <div className="help-card cosy-panel">
      <strong>How to get around</strong>
      <ul>
        <li>
          <span className="cosy-key">W</span>
          <span className="cosy-key">A</span>
          <span className="cosy-key">S</span>
          <span className="cosy-key">D</span> or click the ground to walk, <span className="cosy-key">Shift</span> to run
        </li>
        <li>
          <span className="cosy-key">E</span> to use things: doors open as you walk in
        </li>
        <li>
          <span className="cosy-key">1</span>–<span className="cosy-key">6</span> wave, dance and more
        </li>
        <li>
          <span className="cosy-key">G</span> give what you’re holding, <span className="cosy-key">Q</span> put it away
        </li>
        <li>
          <span className="cosy-key">M</span> mute, <span className="cosy-key">[</span> <span className="cosy-key">]</span> or right-drag to turn the camera, scroll to zoom
        </li>
      </ul>
      <p>Talk out loud: people nearby hear you, and buildings are private.</p>
      <button className="cosy-btn primary small" onClick={close}>
        Got it
      </button>
    </div>
  );
}

export function WorldFailed() {
  const failed = useHud((s) => s.failed);
  if (!failed) return null;
  return (
    <div className="world-failed cosy-panel">
      <strong>The 3D town couldn’t start</strong>
      <p>Your browser didn’t let the game use your graphics card. Try Chrome or Edge, and check hardware acceleration is turned on in its settings.</p>
      <code>{failed}</code>
    </div>
  );
}

/** A soft music box while you're home for the night (and quieter while someone talks to you). */
export function HomeMusic() {
  const view = useView();
  const place = useHud((s) => s.place);
  const muted = useUI((s) => s.muted);
  const awake = useClient((s) => Boolean(s.priv?.wake));
  const on = view.mode === 'player' && view.phase === 'night' && place === 'Your home' && !muted;
  useEffect(() => {
    if (on) {
      nightMusic.setLevel(0.35);
      nightMusic.start();
    } else nightMusic.stop();
  }, [on]);
  useEffect(() => () => nightMusic.stop(), []);
  useEffect(() => nightMusic.duck(awake), [awake]);
  return null;
}

/** The noticeboard by the square: the day's news, the votes so far, and the town's little records. */
export function NoticeBoard() {
  const view = useView();
  const open = useHud((s) => s.notice);
  if (!open) return null;
  const close = () => useHud.setState({ notice: false });
  const dead = view.seats.filter((s) => s.dead);
  const today = view.history.filter((h) => h.day === view.day);
  const earlier = view.history.filter((h) => h.day !== view.day);
  const fish = [...view.town.fish].sort((a, b) => b.cm - a.cm);
  const best = fish[0];
  const when = view.day === 0 && view.phase === 'day' ? 'Before the game' : `${view.phase === 'night' ? 'Night' : 'Day'} ${view.day}`;
  const line = (h: (typeof view.history)[number]) => (
    <li key={h.id}>
      <b>{h.nominatorName}</b> nominated <b>{h.nomineeName}</b>: {h.votes} {h.votes === 1 ? 'vote' : 'votes'}, needed {h.majority}
      {h.votes >= h.majority ? ' · enough' : ''}
    </li>
  );
  return (
    <div className="notice-layer" onClick={close}>
      <div className="notice-board cosy-panel" onClick={(e) => e.stopPropagation()}>
        <header>
          <span className="notice-pin" />
          <h2>Ravenswood Noticeboard</h2>
          <span className="notice-when">{when}</span>
        </header>
        <section>
          <h3>{dead.length ? 'In memoriam' : 'Everyone is alive and well'}</h3>
          {dead.length > 0 && <p>{dead.map((s) => s.label).join(', ')}. The churchyard has a stone for each.</p>}
        </section>
        <section>
          <h3>Nominations today</h3>
          {today.length ? <ul>{today.map(line)}</ul> : <p>None yet.</p>}
        </section>
        {earlier.length > 0 && (
          <section>
            <h3>Earlier days</h3>
            <ul>{earlier.slice(-6).map(line)}</ul>
          </section>
        )}
        <section>
          <h3>Around town</h3>
          <ul>
            <li>{view.town.drinks.length ? `${view.town.drinks.length} ${view.town.drinks.length === 1 ? 'drink' : 'drinks'} waiting on the bar at the Raven’s Rest.` : 'The bar at the Raven’s Rest is empty. Someone pour a round?'}</li>
            <li>{view.town.loaves.length ? `${view.town.loaves.length} fresh ${view.town.loaves.length === 1 ? 'bake' : 'bakes'} on the bakery shelf.` : 'Nothing on the bakery shelf yet.'}</li>
            <li>{best ? `Biggest catch: ${best.by}’s ${best.cm}cm ${best.kind}.` : 'Nobody has caught anything at the pond yet.'}</li>
            <li>{view.town.flowers.length ? `${view.town.flowers.length} ${view.town.flowers.length === 1 ? 'flower' : 'flowers'} planted around the square.` : 'The flower beds are bare.'}</li>
          </ul>
        </section>
        <button className="cosy-btn primary" onClick={close}>
          Close <span className="cosy-key">Esc</span>
        </button>
      </div>
    </div>
  );
}
