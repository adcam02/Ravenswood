import { useEffect, useState } from 'react';
import { hostNow } from '../../casino/client';
import { choosePrompt, suggestPrompt } from '../../gallery/client';
import { IDEA_MAX, cleanIdea } from '../../gallery/types';
import { useHud } from '../../game/hud';
import { useClient } from '../../net/client';

/**
 * Nightfall: a little card with tonight's prompts to vote on for a few seconds (and a box for an idea of your own,
 * which goes up for everyone). It stays out of the way: no card while the Storyteller has you awake or the hooded
 * figure is about, and whoever doesn't vote just draws what the others chose.
 */
export function PromptVote() {
  const choosing = useClient((s) => s.priv?.gallery?.tonight?.choosing ?? null);
  const awake = useClient((s) => Boolean(s.priv?.wake));
  const visit = useHud((s) => s.visit);
  const job = useHud((s) => s.job);
  const note = useClient((s) => s.priv?.gallery?.note ?? null);
  const [, tick] = useState(0);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    if (!choosing) return;
    const t = setInterval(() => tick((n) => n + 1), 250);
    return () => clearInterval(t);
  }, [choosing]);
  useEffect(() => {
    if (!choosing) setTyping(false);
  }, [choosing]);
  if (!choosing || awake || visit || job) return null;
  const left = Math.max(0, Math.ceil((choosing.until - hostNow()) / 1000));
  if (left <= 0) return null;
  const send = () => {
    const idea = cleanIdea(text);
    if (!idea) return;
    suggestPrompt(idea);
    setText('');
    setTyping(false);
  };
  return (
    <div className="prompt-vote cosy-panel" role="group" aria-label="Vote on tonight’s drawing">
      <div className="prompt-vote-head">
        <strong>🎨 What shall we draw tonight?</strong>
        <span className="prompt-vote-time" aria-label={`${left} seconds left`}>
          {left}s
        </span>
      </div>
      <div className="prompt-vote-options">
        {choosing.options.map((o) => (
          <button key={o.id} className={`prompt-vote-option ${choosing.vote === o.id ? 'on' : ''} ${o.by ? 'idea' : ''}`} onClick={() => choosePrompt(o.id)}>
            <span>{o.text}</span>
            {o.by && <em>{o.by}’s idea</em>}
            {o.votes > 0 && <b>{o.votes}</b>}
          </button>
        ))}
      </div>
      {!choosing.idea &&
        (typing ? (
          <form
            className="prompt-vote-idea"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input className="cosy-input" value={text} maxLength={IDEA_MAX} placeholder="Your own idea" autoFocus onChange={(e) => setText(e.target.value)} />
            <button className="cosy-btn small primary" disabled={!cleanIdea(text)}>
              Add
            </button>
          </form>
        ) : (
          <button className="cosy-btn small prompt-vote-add" onClick={() => setTyping(true)}>
            ✏️ Add your own idea
          </button>
        ))}
      {note && !note.ok && <p className="prompt-vote-note">{note.text}</p>}
    </div>
  );
}
