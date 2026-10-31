import { useEffect, useRef, useState } from 'react';
import { earn, tally } from '../game/progress';
import { useHud } from '../game/hud';
import { loadJSON, saveJSON } from '../lib/util';
import { player, useClient, usePosted } from '../net/client';
import { LETTER_MAX } from '../state/host';
import { withReal } from '../state/nicks';
import type { LetterIn } from '../state/types';
import { ui } from '../state/ui';
import { useView } from '../state/view';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { SeatingCircle } from './PanelView';

const READ_KEY = 'ravenswood:letters-read';
const readIds = () => new Set(loadJSON<string[]>(READ_KEY, []));
function markRead(id: string) {
  const ids = readIds();
  if (ids.has(id)) return;
  saveJSON(READ_KEY, [...ids, id].slice(-300));
}

/** At the post office: who it's for, what it says, and whether to sign it. It goes in their letterbox and arrives tonight. */
export function WriteLetterModal() {
  const view = useView();
  const me = view.seats.find((s) => s.isMe);
  const [to, setTo] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [signed, setSigned] = useState(true);
  const [sent, setSent] = useState<'waiting' | 'ok' | 'no' | null>(null);
  const sentAt = useRef(0);
  const posted = usePosted();
  const choices = view.seats.filter((s) => !s.isMe && (s.claimed || s.name));
  const target = view.seats.find((s) => s.id === to);
  const night = view.phase === 'night';
  // A Storyteller on an older page doesn't know about letters yet.
  const outdated = useClient((s) => s.hostOutdated);

  // The Storyteller's answer: it went in (and counts toward the postie's cap), or it didn't.
  useEffect(() => {
    if (sent !== 'waiting' || posted.at < sentAt.current) return;
    setSent(posted.ok ? 'ok' : 'no');
    if (posted.ok) tally('letters', 1, `letter:${view.room}:${sentAt.current}`);
    if (posted.ok && !signed) earn('admirer');
  }, [posted.at, posted.ok, sent, view.room, signed]);
  // No answer at all (an older Storyteller page): say it's gone anyway, after a moment.
  useEffect(() => {
    if (sent !== 'waiting') return;
    const t = setTimeout(() => setSent((s) => (s === 'waiting' ? 'ok' : s)), 4000);
    return () => clearTimeout(t);
  }, [sent]);

  const post = () => {
    if (!target || !text.trim()) return;
    sentAt.current = Date.now();
    setSent('waiting');
    player.letter(target.id, text.trim(), signed);
  };

  if (sent === 'ok' || sent === 'no') {
    return (
      <Modal title={sent === 'ok' ? 'Posted!' : 'It didn’t go in'} eyebrow="Ravenswood Post" size="sm" className="letter-modal">
        <div className="letter-done">
          <span className="letter-done-icon">{sent === 'ok' ? '📮' : '🚫'}</span>
          <p>
            {sent === 'ok'
              ? `Your letter is in ${target?.label ?? 'their'}’s letterbox. They can open it tonight, in bed.`
              : 'The letterboxes only take letters by day, and only so many from each person a day. Try again tomorrow.'}
          </p>
          <div className="letter-actions">
            <button
              className="btn"
              onClick={() => {
                setSent(null);
                setText('');
                setTo(null);
              }}
            >
              Write another
            </button>
            <button className="btn primary" onClick={ui.close}>
              Done
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Write a letter" eyebrow="Ravenswood Post" size="md" className="letter-modal">
      {!me ? (
        <p className="letter-blurb">Take a seat in town first.</p>
      ) : night ? (
        <p className="letter-blurb">The post office is shut for the night. Letters go in by day.</p>
      ) : outdated ? (
        <p className="letter-blurb">The Storyteller’s page is out of date, so the post isn’t running yet. Ask them to reload it.</p>
      ) : (
        <>
          <p className="letter-blurb">It goes in their letterbox now, and they can open it tonight when they’re in bed.</p>
          <h3 className="letter-ask">Who is it for?</h3>
          <div className="ask-seats">
            {choices.map((s) => (
              <button key={s.id} className={`ask-seat ${to === s.id ? 'on' : ''} ${s.dead ? 'dead' : ''}`} onClick={() => setTo(s.id)}>
                <span className="ask-num">{s.index + 1}</span>
                {s.label}
              </button>
            ))}
          </div>
          <div className="letter-paper">
            <span className="letter-to">Dear {target?.label ?? '…'},</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, LETTER_MAX))}
              maxLength={LETTER_MAX}
              rows={6}
              placeholder="Write your letter here…"
              aria-label="Your letter"
            />
            <span className="letter-sign">{signed ? `From ${me.label}` : 'From a friend (unsigned)'}</span>
            <span className="letter-count">
              {text.length} / {LETTER_MAX}
            </span>
          </div>
          <label className="letter-signed">
            <input type="checkbox" checked={signed} onChange={(e) => setSigned(e.target.checked)} /> Sign it with my name
          </label>
          <div className="letter-actions">
            <button className="btn primary big" disabled={!target || !text.trim() || sent === 'waiting'} onClick={post}>
              <Icon name="scroll" /> {sent === 'waiting' ? 'Posting…' : target ? `Post it to ${target.label}` : 'Choose who it’s for'}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

/** In bed at night: the letters that have come, newest first. Opening one shows it on a sheet of paper. */
export function ReadLettersModal() {
  const view = useView();
  const [open, setOpen] = useState<string | null>(null);
  const [read, setRead] = useState(readIds);
  const list = [...view.letters].sort((a, b) => b.at - a.at);
  const letter = list.find((l) => l.id === open);
  const show = (l: LetterIn) => {
    markRead(l.id);
    setRead(readIds());
    setOpen(l.id);
  };
  return (
    <Modal title={letter ? 'A letter' : 'Your letters'} eyebrow={letter ? (letter.night === view.day ? 'Came tonight' : `Came on night ${letter.night}`) : 'In bed'} size="md" className="letter-modal">
      {letter ? (
        <div className="letter-read">
          <div className="letter-paper reading">
            <p>{letter.text}</p>
            <span className="letter-sign">{letter.name ? `From ${withReal(letter.name)}` : 'Unsigned'}</span>
          </div>
          <div className="letter-actions">
            <button className="btn" onClick={() => setOpen(null)}>
              <Icon name="chevronLeft" /> All letters
            </button>
          </div>
        </div>
      ) : list.length ? (
        <div className="letter-list">
          {list.map((l) => (
            <button key={l.id} className={`letter-envelope ${read.has(l.id) ? 'read' : 'new'}`} onClick={() => show(l)}>
              <span className="letter-env-icon">{read.has(l.id) ? '📭' : '💌'}</span>
              <span className="letter-env-from">{l.name ? `From ${withReal(l.name)}` : 'Unsigned'}</span>
              <em>{l.night === view.day ? 'tonight' : `night ${l.night}`}</em>
            </button>
          ))}
        </div>
      ) : (
        <p className="letter-blurb">No letters yet. Anyone can post you one at the post office by day.</p>
      )}
    </Modal>
  );
}

/**
 * Tucked up in bed: a button to open any letters waiting (and the fan mail achievement for three in a night), and one
 * for who sits where round the circle.
 */
export function BedLetters() {
  const view = useView();
  const place = useHud((s) => s.place);
  const sheep = useHud((s) => s.sheep);
  const job = useHud((s) => s.job);
  const bedMenu = useHud((s) => s.bedMenu);
  const draw = useHud((s) => s.draw);
  const visit = useHud((s) => s.visit);
  const tonightArt = useClient((s) => s.priv?.gallery?.tonight ?? null);
  const awake = useClient((s) => Boolean(s.priv?.wake));
  const tonight = view.letters.filter((l) => l.night === view.day).length;
  const [read, setRead] = useState(readIds);
  useEffect(() => {
    if (view.phase === 'night' && tonight >= 3) earn('fanmail');
  }, [view.phase, tonight]);
  // (Re-read after the reader closes, so the count of new ones is right.)
  useEffect(() => {
    const t = setInterval(() => setRead(readIds()), 1500);
    return () => clearInterval(t);
  }, []);
  if (view.mode !== 'player' || view.phase !== 'night' || place !== 'Your bedroom' || sheep === 'playing' || job || bedMenu || draw) return null;
  const fresh = view.letters.filter((l) => !read.has(l.id)).length;
  return (
    <div className="bed-buttons">
      {view.letters.length > 0 && (
        <button className={`bed-letters cosy-btn ${fresh ? 'primary' : ''}`} onClick={() => ui.open({ kind: 'letters' })}>
          {fresh ? '💌' : '📭'} {fresh ? `${fresh} new ${fresh === 1 ? 'letter' : 'letters'}` : 'Your letters'}
        </button>
      )}
      <button className="cosy-btn" onClick={() => ui.open({ kind: 'seating' })}>
        🪑 Who sits where
      </button>
      {sheep && !visit && !awake && (
        <button className="cosy-btn" onClick={() => useHud.setState({ bedMenu: true })}>
          🎲 Pass the time
        </button>
      )}
      {sheep && !visit && !awake && tonightArt && (
        <button className={`cosy-btn ${tonightArt.sent ? '' : 'primary'}`} onClick={() => useHud.setState({ draw: true })}>
          🎨 {tonightArt.sent ? 'Your drawing' : 'Draw'}
        </button>
      )}
    </div>
  );
}

/** Who sits where round the circle, as the Storyteller sees it in the grimoire: the chart on the bedroom wall, up close. */
export function SeatingModal() {
  const view = useView();
  const me = view.seats.find((s) => s.isMe);
  return (
    <Modal title="Who sits where" eyebrow="Round the circle" size="sm" className="seating-modal">
      <SeatingCircle seatFor={me?.id ?? null} dir="clockwise" />
      <p className="letter-blurb">The first seat is at the top. The arrow shows which way is clockwise.</p>
    </Modal>
  );
}
