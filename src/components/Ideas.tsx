import { useEffect, useRef, useState } from 'react';
import { IDEA_MAX, ideas, unseenIdeas, useIdeas } from '../game/ideas';
import { player, useClient, useIdeaIn } from '../net/client';
import { ui } from '../state/ui';
import { Icon } from './Icon';
import { Modal } from './Modal';

/** At the idea box: an idea or a request, for the Storyteller's eyes only. */
export function IdeaModal() {
  const [text, setText] = useState('');
  const [sent, setSent] = useState<'waiting' | 'ok' | 'no' | null>(null);
  const sentAt = useRef(0);
  const answer = useIdeaIn();
  const outdated = useClient((s) => s.hostOutdated);

  useEffect(() => {
    if (sent !== 'waiting' || answer.at < sentAt.current) return;
    setSent(answer.ok ? 'ok' : 'no');
  }, [answer.at, answer.ok, sent]);
  // No answer at all (an older Storyteller page that doesn't know about the idea box).
  useEffect(() => {
    if (sent !== 'waiting') return;
    const t = setTimeout(() => setSent((s) => (s === 'waiting' ? 'no' : s)), 6000);
    return () => clearTimeout(t);
  }, [sent]);

  const post = () => {
    if (!text.trim()) return;
    sentAt.current = Date.now();
    setSent('waiting');
    player.idea(text.trim());
  };

  if (sent === 'ok' || sent === 'no') {
    return (
      <Modal title={sent === 'ok' ? 'Thank you!' : 'It didn’t go in'} eyebrow="The idea box" size="sm" className="letter-modal">
        <div className="letter-done">
          <span className="letter-done-icon">{sent === 'ok' ? '💡' : '🚫'}</span>
          <p>{sent === 'ok' ? 'Your idea is in the box. The Storyteller will read it.' : 'The box is a little full just now. Try again in a moment.'}</p>
          <div className="letter-actions">
            <button
              className="btn"
              onClick={() => {
                setSent(null);
                setText('');
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
    <Modal title="An idea for the Storyteller" eyebrow="The idea box" size="md" className="letter-modal idea-modal">
      {outdated ? (
        <p className="letter-blurb">The Storyteller’s page is out of date, so the idea box isn’t open yet. Ask them to reload it.</p>
      ) : (
        <>
          <p className="letter-blurb">Something you’d love to see in Ravenswood, a character or a script to try, or anything you’d like changed. Only the Storyteller reads these.</p>
          <div className="letter-paper">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, IDEA_MAX))}
              maxLength={IDEA_MAX}
              rows={5}
              placeholder="Wouldn’t it be fun if…"
              aria-label="Your idea"
            />
            <span className="letter-count">
              {text.length} / {IDEA_MAX}
            </span>
            <span className="letter-sign">With your name on it</span>
          </div>
          <div className="letter-actions">
            <button className="btn primary big" disabled={!text.trim() || sent === 'waiting'} onClick={post}>
              <Icon name="sparkle" /> {sent === 'waiting' ? 'Posting…' : 'Post it in the box'}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

const when = (at: number) => {
  const d = new Date(at);
  const today = new Date().toDateString() === d.toDateString();
  return today ? d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }) : d.toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};

/**
 * Storyteller: the ideas and requests players have posted in the idea box, newest first (the done ones after). Kept in
 * this browser; tick them off, delete them, or save them all to a file.
 */
export function IdeasModal() {
  const list = useIdeas((s) => s.list);
  const [seenAt] = useState(() => useIdeas.getState().seen);
  const [confirm, setConfirm] = useState<string | null>(null);
  // Opening the list counts as having seen them (the new ones stay marked while it's open).
  useEffect(() => ideas.seen(), []);
  const sorted = [...list].sort((a, b) => Number(Boolean(a.done)) - Number(Boolean(b.done)) || b.at - a.at);
  const save = () => {
    const blob = new Blob([ideas.exportText()], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ravenswood-ideas-${new Date().toLocaleDateString('en-CA')}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const left = list.filter((i) => !i.done).length;
  return (
    <Modal
      title="The idea box"
      eyebrow={list.length ? `${left} to look at · ${list.length - left} done` : 'Ideas and requests'}
      size="md"
      className="ideas-modal"
      head={
        list.length ? (
          <button className="btn small" onClick={save} title="Save every idea to a text file">
            <Icon name="download" /> Export
          </button>
        ) : null
      }
    >
      {!sorted.length ? (
        <p className="letter-blurb">Nothing in the box yet. Players can post ideas and requests for you at the idea box by the noticeboard.</p>
      ) : (
        <ul className="ideas-list">
          {sorted.map((i) => (
            <li key={i.id} className={`idea ${i.done ? 'done' : ''} ${i.at > seenAt && !i.done ? 'new' : ''}`}>
              <label className="idea-tick" title={i.done ? 'Not done after all' : 'Tick it off as done'}>
                <input type="checkbox" checked={Boolean(i.done)} onChange={() => ideas.toggle(i.id)} />
              </label>
              <div className="idea-body">
                <span className="idea-who">
                  <b>{i.who}</b> · {when(i.at)}
                  {i.at > seenAt && !i.done && <em className="idea-new">new</em>}
                </span>
                <p>{i.text}</p>
              </div>
              <button
                className={`btn quiet square small idea-delete ${confirm === i.id ? 'blood' : ''}`}
                title={confirm === i.id ? 'Click again to delete it' : 'Delete'}
                aria-label="Delete"
                onClick={() => {
                  if (confirm === i.id) {
                    ideas.remove(i.id);
                    setConfirm(null);
                  } else setConfirm(i.id);
                }}
              >
                <Icon name={confirm === i.id ? 'check' : 'trash'} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

/** Storyteller: how many ideas have come in since the list was last looked at, for the bar's button. */
export function useUnseenIdeas(): number {
  return useIdeas(unseenIdeas);
}
