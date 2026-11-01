import { useState } from 'react';
import { heartArt, keepArt, letGoArt, useArtImage, useGalleryView, voteArt } from '../gallery/client';
import { gallery, type galleryForST } from '../gallery/host';
import { money } from '../game/profiles';
import { HEART_CAP, HEART_PAY, IDEA_MAX, PRIZES, SAVED_MAX, THUMB, cleanIdea, type BookPiece, type ChoosingView, type PieceView } from '../gallery/types';
import { ui } from '../state/ui';
import { shownName, useNicks } from '../state/nicks';
import { useView } from '../state/view';
import { Modal } from './Modal';

const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * The night gallery: last night's drawings, with nobody's name on them while the voting is open. A vote for a
 * favourite (one each, not your own; it can be moved until the voting closes at nightfall), then the artists, the
 * votes and the top three. Anyone can keep a piece to hang in their flat (their own any time, anyone's once named). The Storyteller can change
 * tonight's prompt (before anyone has drawn) and close the voting early.
 */
export function GalleryModal() {
  const view = useView();
  const mode = view.mode === 'st' ? 'st' : 'player';
  const g = useGalleryView(mode);
  const nicks = useNicks();
  const [zoom, setZoom] = useState<string | null>(null);
  const show = g?.show ?? null;
  const saved = new Set(g?.saved.map((a) => a.id) ?? []);
  const st = mode === 'st' ? (g as ReturnType<typeof galleryForST> | null) : null;

  return (
    <Modal title={show ? `“${show.prompt}”` : 'The night gallery'} eyebrow={show ? `The night gallery · drawn on night ${show.night}` : 'By the post office'} size="lg" className="gallery-modal">
      {!g && mode === 'player' ? (
        <p className="gallery-empty">Take a seat in town first.</p>
      ) : !show?.pieces.length ? (
        <p className="gallery-empty">Nothing’s hanging yet. Each night everyone in bed gets something to draw, and the drawings go up here in the morning.</p>
      ) : (
        <>
          <p className="gallery-prompt">
            {show.open
              ? mode === 'st'
                ? `Voting is open: ${st?.voters ?? 0} ${st?.voters === 1 ? 'vote' : 'votes'} so far. It closes at nightfall.`
                : `Vote for your favourite (not your own)! The voting closes at nightfall, then the artists are named and the top three win ${PRIZES.map(money).join(', ')}.`
              : 'The voting’s closed. Here’s who drew what.'}
          </p>
          <div className="gallery-grid">
            {show.pieces.map((p) => (
              <Piece
                key={p.id}
                piece={p}
                mode={mode}
                open={show.open}
                voted={show.vote === p.id}
                kept={saved.has(p.id)}
                full={(g?.saved.length ?? 0) >= SAVED_MAX}
                name={p.name ? shownName(p.name, 'Someone', nicks) : undefined}
                zoom={setZoom}
              />
            ))}
          </div>
        </>
      )}
      {g?.note && <p className={`gallery-note ${g.note.ok ? '' : 'bad'}`}>{g.note.text}</p>}
      {g?.book && (
        <p className="gallery-note">
          The game’s over: look back through every night’s drawings.{' '}
          <button className="cosy-btn small primary" onClick={() => ui.open({ kind: 'artbook' })}>
            🎨 The game’s art
          </button>
        </p>
      )}
      {mode === 'player' && g && g.saved.length > 0 && (
        <p className="gallery-note">
          You’ve kept {g.saved.length} of {SAVED_MAX} drawings. Hang them in your flat in Wren Court with a “Your art” frame from the furniture shop.
        </p>
      )}
      {st && (
        <div className="gallery-st">
          {st.tonight?.choosing ? (
            <ChoosingST choosing={st.tonight.choosing} />
          ) : st.tonight ? (
            <>
              <span>
                Tonight: <strong>“{st.tonight.prompt}”</strong> · {st.drawnTonight ?? 0} drawn so far
              </span>
              {!st.drawnTonight && (
                <button className="btn" onClick={() => gallery.newPrompt()}>
                  Another prompt
                </button>
              )}
            </>
          ) : (
            <span>Each night brings a new thing to draw.</span>
          )}
          {show?.open && (
            <button className="btn" onClick={() => gallery.close()}>
              Close the voting now
            </button>
          )}
          <IdeaST queued={st.stIdea} choosing={Boolean(st.tonight?.choosing)} />
        </div>
      )}
      {zoom && (
        <div className="gallery-zoom" onClick={() => setZoom(null)} role="presentation">
          <img src={zoom} alt="A drawing, up close" />
        </div>
      )}
    </Modal>
  );
}

function Piece({ piece, mode, open, voted, kept, full, name, zoom }: { piece: PieceView; mode: 'st' | 'player'; open: boolean; voted: boolean; kept: boolean; full: boolean; name?: string; zoom: (img: string) => void }) {
  const img = useArtImage(piece.id, mode);
  const medal = !open && piece.prize && piece.place ? MEDALS[piece.place - 1] : null;
  return (
    <div className={`gallery-piece ${voted ? 'voted' : ''} ${piece.mine ? 'mine' : ''}`}>
      {medal && (
        <span className="gallery-ribbon" aria-label={`Place ${piece.place}`}>
          {medal}
        </span>
      )}
      {img ? <img className="gallery-pic big" src={img} alt={name ? `${name}’s drawing` : 'A drawing'} onClick={() => zoom(img)} /> : <div className="gallery-pic">{img === null ? 'Missing' : 'Fetching…'}</div>}
      <div className="gallery-caption">
        {open ? (
          <span>{piece.mine ? 'Yours' : voted ? 'Your vote ✓' : ''}</span>
        ) : (
          <span>
            <strong>{name ?? 'Someone'}</strong> · {piece.votes ?? 0} {piece.votes === 1 ? 'vote' : 'votes'}
            {piece.prize ? ` · ${money(piece.prize)}` : ''}
          </span>
        )}
        {mode === 'player' && open && !piece.mine && !voted && (
          <button className="cosy-btn small primary" onClick={() => voteArt(piece.id)}>
            Vote
          </button>
        )}
        {mode === 'player' && (piece.mine || !open) && (
          <button className="cosy-btn small" title={kept ? 'Kept in your profile (press to let it go)' : 'Keep it, to hang in your flat'} disabled={(!kept && full) || !img} onClick={() => (kept ? letGoArt(piece.id) : keepArt(piece.id))}>
            {kept ? 'Kept ✓' : 'Keep'}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * The game's art, once it's over: every night's drawings with the artists named, each night under its prompt. Little
 * copies in the grid (a tap fetches the whole picture), and a heart to give any piece but your own, which pays the
 * artist until the next game starts.
 */
export function ArtBookModal() {
  const view = useView();
  const mode = view.mode === 'st' ? 'st' : 'player';
  const g = useGalleryView(mode);
  const nicks = useNicks();
  const [zoom, setZoom] = useState<string | null>(null);
  const book = g?.book ?? null;
  const count = book?.nights.reduce((n, x) => n + x.pieces.length, 0) ?? 0;
  const saved = new Set(g?.saved.map((a) => a.id) ?? []);
  const full = (g?.saved.length ?? 0) >= SAVED_MAX;
  return (
    <Modal title="The game’s art" eyebrow={book ? `${count} ${count === 1 ? 'drawing' : 'drawings'} from ${book.nights.length} ${book.nights.length === 1 ? 'night' : 'nights'}` : 'The night gallery'} size="lg" className="gallery-modal artbook">
      {!book ? (
        <p className="gallery-empty">Once a game is over, every drawing from its nights is here to look back on.</p>
      ) : (
        <>
          <p className="gallery-prompt">
            {mode === 'player'
              ? `Give your favourites a ❤️ (not your own). Each heart pays the artist ${money(HEART_PAY)}, up to ${money(HEART_CAP)} a game, until the next game starts.`
              : `Players can give any piece a ❤️ until the next game starts: each pays the artist ${money(HEART_PAY)}, up to ${money(HEART_CAP)} each a game.`}
          </p>
          {book.nights.map((n) => (
            <section key={n.night} className="artbook-night">
              <h3>
                <span className="eyebrow">Night {n.night}</span> “{n.prompt}”
              </h3>
              <div className="gallery-grid artbook-grid">
                {n.pieces.map((p) => (
                  <BookItem key={p.id} piece={p} mode={mode} name={shownName(p.name, 'Someone', nicks)} kept={saved.has(p.id)} full={full} zoom={setZoom} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
      {g?.note && <p className={`gallery-note ${g.note.ok ? '' : 'bad'}`}>{g.note.text}</p>}
      {mode === 'player' && book && (
        <p className="gallery-note">
          Keep any piece to hang in your flat in Wren Court with a “Your art” frame ({g?.saved.length ?? 0} of {SAVED_MAX} kept).
        </p>
      )}
      {zoom && <Zoom id={zoom} mode={mode} close={() => setZoom(null)} />}
    </Modal>
  );
}

function BookItem({ piece, mode, name, kept, full, zoom }: { piece: BookPiece; mode: 'st' | 'player'; name: string; kept: boolean; full: boolean; zoom: (id: string) => void }) {
  const thumb = useArtImage(piece.id + THUMB, mode);
  const can = mode === 'player' && !piece.mine;
  return (
    <div className={`gallery-piece ${piece.hearted ? 'voted' : ''} ${piece.mine ? 'mine' : ''}`}>
      {thumb ? <img className="gallery-pic big" src={thumb} alt={`${name}’s drawing`} loading="lazy" onClick={() => zoom(piece.id)} /> : <div className="gallery-pic">{thumb === null ? 'Missing' : 'Fetching…'}</div>}
      <div className="gallery-caption artbook-caption">
        <strong>{piece.mine ? 'Yours' : name}</strong>
        <span className="artbook-actions">
          {mode === 'player' && (
            <button className="cosy-btn small" title={kept ? 'Kept in your profile (press to let it go)' : 'Keep it, to hang in your flat'} disabled={!kept && full} onClick={() => (kept ? letGoArt(piece.id) : keepArt(piece.id))}>
              {kept ? 'Kept ✓' : 'Keep'}
            </button>
          )}
          <button
            className={`cosy-btn small artbook-heart ${piece.hearted ? 'on' : ''}`}
            disabled={!can}
            title={piece.mine ? 'Your own drawing' : can ? (piece.hearted ? 'Take your heart back' : `Give it a heart (${money(HEART_PAY)} to ${name})`) : undefined}
            aria-pressed={piece.hearted ? true : false}
            onClick={() => heartArt(piece.id)}
          >
            {piece.hearted ? '❤️' : '🤍'} {piece.hearts}
          </button>
        </span>
      </div>
    </div>
  );
}

/** One drawing up close: the whole picture, fetched as it's opened (its little copy until then). */
function Zoom({ id, mode, close }: { id: string; mode: 'st' | 'player'; close: () => void }) {
  const img = useArtImage(id, mode);
  const thumb = useArtImage(id + THUMB, mode);
  const src = img || thumb;
  return (
    <div className="gallery-zoom" onClick={close} role="presentation">
      {src ? <img src={src} alt="A drawing, up close" /> : null}
    </div>
  );
}

/** "The game's art", for the end of the game (only once there's some). `onOpen`: put away whatever it's on first. */
export function GameArtButton({ onOpen }: { onOpen?: () => void }) {
  const view = useView();
  const g = useGalleryView(view.mode === 'st' ? 'st' : 'player');
  const count = g?.book?.nights.reduce((n, x) => n + x.pieces.length, 0) ?? 0;
  if (!count) return null;
  return (
    <button
      className="btn artbook-open"
      onClick={() => {
        onOpen?.();
        ui.open({ kind: 'artbook' });
      }}
    >
      🎨 The game’s art <span>({count})</span>
    </button>
  );
}

/** Storyteller: tonight's prompt vote as it goes, with anyone's ideas (any of which can be taken out). */
function ChoosingST({ choosing }: { choosing: ChoosingView }) {
  return (
    <div className="gallery-choosing">
      <span>Everyone’s choosing tonight’s prompt:</span>
      <ul>
        {choosing.options.map((o) => (
          <li key={o.id}>
            “{o.text}”{o.by ? ` (${o.by})` : ''} · {o.votes} {o.votes === 1 ? 'vote' : 'votes'}
            {o.by && (
              <button className="btn small quiet" onClick={() => gallery.dropIdea(o.id)} title="Take this idea out of the vote">
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Storyteller: an idea of their own for the prompt vote (tonight's, while it's on, or else the next night's). */
function IdeaST({ queued, choosing }: { queued?: string; choosing: boolean }) {
  const [text, setText] = useState('');
  const [why, setWhy] = useState<string | null>(null);
  if (queued && !choosing) {
    return (
      <span className="gallery-idea">
        Your idea for the next night’s vote: <strong>“{queued}”</strong>{' '}
        <button className="btn small quiet" onClick={() => gallery.dropIdea('next')}>
          Remove
        </button>
      </span>
    );
  }
  return (
    <form
      className="gallery-idea"
      onSubmit={(e) => {
        e.preventDefault();
        const err = gallery.idea(text);
        setWhy(err);
        if (!err) setText('');
      }}
    >
      <input className="input" value={text} maxLength={IDEA_MAX} placeholder={choosing ? 'Add an idea to tonight’s vote' : 'An idea for the next night’s vote'} onChange={(e) => setText(e.target.value)} />
      <button className="btn small" disabled={!cleanIdea(text)}>
        Add
      </button>
      {why && <em>{why}</em>}
    </form>
  );
}
