import { useState } from 'react';
import { keepArt, letGoArt, useArtImage, useGalleryView, voteArt } from '../gallery/client';
import { gallery } from '../gallery/host';
import { money } from '../game/profiles';
import { PRIZES, SAVED_MAX, type PieceView } from '../gallery/types';
import { shownName, useNicks } from '../state/nicks';
import { useView } from '../state/view';
import { Modal } from './Modal';

const MEDALS = ['🥇', '🥈', '🥉'];

/**
 * The night gallery: last night's drawings, with nobody's name on them while the voting is open. A vote for a
 * favourite (one each, not your own; it can be moved until the voting closes at nightfall), then the artists, the
 * votes and the top three. Artists can keep their own pieces, to hang in their flat. The Storyteller can change
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
  const st = mode === 'st' ? (g as ReturnType<typeof useGalleryView> & { drawnTonight?: number; voters?: number }) : null;

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
      {mode === 'player' && g && g.saved.length > 0 && (
        <p className="gallery-note">
          You’ve kept {g.saved.length} of {SAVED_MAX} drawings. Hang them in your flat in Wren Court with a “Your art” frame from the furniture shop.
        </p>
      )}
      {st && (
        <div className="gallery-st">
          {st.tonight ? (
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
        {mode === 'player' && piece.mine && (
          <button className="cosy-btn small" title={kept ? 'Kept in your profile (press to let it go)' : 'Keep it, to hang in your flat'} disabled={(!kept && full) || !img} onClick={() => (kept ? letGoArt(piece.id) : keepArt(piece.id))}>
            {kept ? 'Kept ✓' : 'Keep'}
          </button>
        )}
      </div>
    </div>
  );
}
