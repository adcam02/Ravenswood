import { useEffect, useState } from 'react';
import { SONGS, songById } from '../lib/disco';
import { player } from '../net/client';
import { SONG_PRICE, SONG_REST_MS, townAction } from '../state/host';
import { money } from '../game/profiles';
import { useMoney } from '../game/progress';
import { ui } from '../state/ui';
import { useView } from '../state/view';
import { Modal } from './Modal';

/**
 * The Velvet Horn's jukebox: the songs it plays, with the one that's on now. Anyone in the club can put another one
 * on (for everyone in there), once the last has had a few seconds, for a dollar (the Storyteller's are free).
 */
export function JukeboxModal() {
  const view = useView();
  const now = songById(view.club.song);
  const coins = useMoney();
  const paying = view.mode === 'player';
  const [broke, setBroke] = useState(false);
  const [, tick] = useState(0);
  // (Ticks over while a fresh song is resting, so its buttons come back on their own.)
  const resting = view.club.by ? Math.max(0, SONG_REST_MS - (Date.now() - view.club.at)) : 0;
  useEffect(() => {
    if (!resting) return;
    const t = setTimeout(() => tick((n) => n + 1), Math.min(resting, 1000) + 30);
    return () => clearTimeout(t);
  });
  const play = (id: string) => {
    if (paying && coins < SONG_PRICE) return setBroke(true);
    const a = { k: 'song' as const, song: id };
    if (view.mode === 'st') townAction('The Storyteller', a);
    else player.town(a);
    ui.close();
  };
  return (
    <Modal title="The jukebox" eyebrow="The Velvet Horn" size="md" className="jukebox-modal">
      <p className="jukebox-now">
        <span className="jukebox-eq" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        Now playing: <b>{now.name}</b>
        {view.club.by ? <em> · put on by {view.club.by}</em> : null}
      </p>
      <div className="jukebox-list">
        {SONGS.map((s) => {
          const on = s.id === now.id;
          return (
            <button key={s.id} className={`jukebox-song ${on ? 'on' : ''}`} disabled={on || resting > 0} onClick={() => play(s.id)}>
              <span className="jukebox-emoji">{s.emoji}</span>
              <span className="jukebox-name">
                <b>{s.name}</b>
                <em>{s.blurb}</em>
              </span>
              <span className="jukebox-bpm">{on ? 'On now' : paying ? <span className="jukebox-price">{money(SONG_PRICE)}</span> : 'Free'}</span>
            </button>
          );
        })}
      </div>
      <p className={`letter-blurb jukebox-foot ${broke ? 'jukebox-broke' : ''}`} role={broke ? 'alert' : undefined}>
        {broke
          ? `Not enough money: a song is ${money(SONG_PRICE)}, and you have ${money(coins)}. Play a game, a job or the tables to earn some.`
          : resting > 0
            ? `A new song just went on. Give it ${Math.ceil(resting / 1000)} seconds.`
            : paying
              ? `${money(SONG_PRICE)} a song, and everyone in the club hears whatever you put on. You have ${money(coins)}.`
              : 'Everyone in the club hears whatever you put on (free for the Storyteller).'}
      </p>
    </Modal>
  );
}
