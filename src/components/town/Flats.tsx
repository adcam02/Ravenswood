import { useEffect, useMemo, useState } from 'react';
import { FLOORS, PIECES, SHELVES, WALLS, countPlaced, pieceById, whyNot, type Finish, type FlatView, type Shelf } from '../../flats/catalogue';
import { decor, flatNav, useDecor, useDirectory, useFlatView } from '../../flats/client';
import { useHud } from '../../game/hud';
import { local } from '../../game/local';
import { money, nameKey } from '../../game/profiles';
import { useMoney } from '../../game/progress';
import { hostNow } from '../../casino/client';
import { nickFor, shownName, useNicks } from '../../state/nicks';
import { useView } from '../../state/view';
import { flatOwner } from '../../world/types';
import '../../styles/flats.css';

/**
 * Wren Court's panels: the lobby's list of flats (by the lift), the Decorate button in your own flat, and the
 * decorating panel along the bottom while the camera looks down over the room. Buying goes through the Storyteller;
 * laying out is done here and sent after every change.
 */
export function FlatsPanels() {
  const dir = useDecor((s) => s.dir);
  const draft = useDecor((s) => s.draft);
  // (The place's name changes whenever we go somewhere, so this follows where we are.)
  useHud((s) => s.place);
  const view = useView();
  const fv = useFlatView();
  const key = flatOwner(local.zone);
  const mine = view.mode === 'player' && fv?.flat?.key === key && fv.flat.mine;
  if (dir) return <Directory />;
  if (draft && mine && fv) return <Decorate view={fv} />;
  if (mine && fv?.flat) {
    return (
      <button className="flat-decorate cosy-btn primary" onClick={() => decor.start(fv.flat!.layout)}>
        🛋️ Decorate
      </button>
    );
  }
  return null;
}

/** The host's word on the last thing we did, for a few seconds. */
function Note({ view }: { view: FlatView | null }) {
  const note = view?.note;
  const [shown, setShown] = useState<{ text: string; ok: boolean } | null>(null);
  useEffect(() => {
    if (!note || hostNow() - note.at > 6000) return;
    setShown(note);
    const t = setTimeout(() => setShown(null), 6000 - Math.max(0, hostNow() - note.at));
    return () => clearTimeout(t);
  }, [note?.at, note?.text]);
  return shown ? (
    <p className={`flat-note ${shown.ok ? 'ok' : ''}`} role="status">
      {shown.text}
    </p>
  ) : null;
}

// ---------------------------------------------------------------- the lobby's list

function Directory() {
  const view = useView();
  const mode = view.mode === 'st' ? 'st' : 'player';
  const list = useDirectory(mode);
  const nicks = useNicks();
  const [find, setFind] = useState('');
  const myName = view.seats.find((s) => s.isMe)?.name;
  const me = myName ? nameKey(myName) : null;
  const close = () => useDecor.setState({ dir: false });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const rows = useMemo(() => {
    const all = (list ?? []).map((r) => ({ ...r, shown: shownName(r.name, 'Someone', nicks), mine: r.key === me }));
    const q = find.trim().toLowerCase();
    return all
      .filter((r) => !q || r.shown.toLowerCase().includes(q) || r.name.toLowerCase().includes(q))
      .sort((a, b) => Number(b.mine) - Number(a.mine) || a.shown.localeCompare(b.shown));
  }, [list, nicks, find, me]);
  return (
    <div className="notice-layer flat-layer" onClick={close}>
      <div className="flat-dir cosy-panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="The flats">
        <header>
          <span className="flat-eyebrow">Wren Court</span>
          <h2>🛗 Which flat?</h2>
        </header>
        {(list?.length ?? 0) > 10 && <input className="flat-find" placeholder="Find someone…" value={find} onChange={(e) => setFind(e.target.value)} aria-label="Find someone" />}
        {!list ? (
          <p className="flat-blurb">Just a moment…</p>
        ) : (
          <ul className="flat-list">
            {rows.map((r, i) => (
              <li key={r.key}>
                <button className={`flat-row ${r.mine ? 'mine' : ''}`} onClick={() => flatNav.go(r.key)}>
                  <span className="flat-door">{r.mine ? '🏠' : i % 3 === 0 ? '🚪' : i % 3 === 1 ? '🪟' : '🌷'}</span>
                  <span className="flat-who">{r.mine ? 'Your flat' : `${r.shown}’s flat`}</span>
                  {nickFor(r.name, nicks) && !r.mine && <span className="flat-real">{r.name}</span>}
                  <span className="flat-go">Go up ›</span>
                </button>
              </li>
            ))}
            {!rows.length && <li className="flat-blurb">Nobody by that name lives here.</li>}
          </ul>
        )}
        <button className="cosy-btn" onClick={close}>
          Stay down here <span className="cosy-key">Esc</span>
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- decorating

function Decorate({ view }: { view: FlatView }) {
  const draft = useDecor((s) => s.draft)!;
  const held = useDecor((s) => s.held);
  const tab = useDecor((s) => s.tab);
  const hint = useDecor((s) => s.hint);
  const waiting = useDecor((s) => s.waiting);
  const coins = useMoney();
  const owned = view.own?.owned ?? {};
  const finishes = view.own?.finishes ?? [];
  const placed = countPlaced(draft.items);
  const stored = PIECES.filter((p) => (owned[p.id] ?? 0) > (placed[p.id] ?? 0));
  const storedCount = stored.reduce((n, p) => n + (owned[p.id] ?? 0) - (placed[p.id] ?? 0), 0);
  // Something just bought comes straight out into the room.
  useEffect(() => {
    if (!waiting || (owned[waiting.id] ?? 0) <= waiting.had) return;
    useDecor.setState({ waiting: null });
    decor.takeOut(waiting.id);
  }, [waiting, owned[waiting?.id ?? '']]);
  // A wallpaper or floor just bought goes straight up (the Storyteller has already put it up).
  useEffect(() => {
    const lay = view.flat?.layout;
    if (!lay) return;
    const d = useDecor.getState().draft;
    if (!d) return;
    if (finishes.includes(lay.wall) && lay.wall !== d.wall) useDecor.setState({ draft: { ...d, wall: lay.wall } });
    if (finishes.includes(lay.floor) && lay.floor !== d.floor) useDecor.setState({ draft: { ...useDecor.getState().draft!, floor: lay.floor } });
  }, [finishes.join(',')]);
  return (
    <div className="flat-panel cosy-panel" role="dialog" aria-label="Decorating your flat">
      <header className="flat-head">
        <strong>🛋️ Your flat</strong>
        <span className="casino-purse">
          You have <b>{money(coins)}</b>
        </span>
        <button className="cosy-btn primary small" onClick={() => decor.finish()}>
          Done
        </button>
      </header>
      <Note view={view} />
      {held ? <Holding /> : <Tabs storedCount={storedCount} />}
      {!held && hint && <p className="flat-hint">{hint}</p>}
      {!held && tab === 'shop' && <Shop owned={owned} coins={coins} />}
      {!held && tab === 'storage' && <Storage stored={stored} owned={owned} placed={placed} />}
      {!held && tab === 'room' && <Finishes finishes={finishes} coins={coins} wall={draft.wall} floor={draft.floor} />}
    </div>
  );
}

function Tabs({ storedCount }: { storedCount: number }) {
  const tab = useDecor((s) => s.tab);
  const tabs: [typeof tab, string][] = [
    ['shop', '🛒 Shop'],
    ['storage', `📦 Storage${storedCount ? ` (${storedCount})` : ''}`],
    ['room', '🎨 Walls & floors'],
  ];
  return (
    <div className="flat-tabs" role="tablist">
      {tabs.map(([id, label]) => (
        <button key={id} role="tab" aria-selected={tab === id} className={`flat-tab ${tab === id ? 'on' : ''}`} onClick={() => decor.tab(id)}>
          {label}
        </button>
      ))}
      <span className="flat-tip">Tap anything in the room to move it.</span>
    </div>
  );
}

/** The piece in hand: move it, turn it, put it down or away. */
function Holding() {
  const held = useDecor((s) => s.held)!;
  const draft = useDecor((s) => s.draft)!;
  const hint = useDecor((s) => s.hint);
  const piece = pieceById(held.item.id);
  const why = whyNot(draft.items, held.item, held.index);
  const wall = piece?.kind === 'wall';
  return (
    <div className="flat-holding">
      <div className="flat-holding-name">
        <span className="flat-icon">{piece?.icon}</span>
        <strong>{piece?.name}</strong>
        <span className={`flat-fit ${why ? 'bad' : 'ok'}`}>{hint ?? why ?? 'Fits here'}</span>
      </div>
      <div className="flat-pad" aria-label="Move it">
        <button className="cosy-btn small" onClick={() => decor.nudge(-1, 0)} aria-label="Left">
          ◀
        </button>
        <button className="cosy-btn small" onClick={() => decor.nudge(0, -1)} aria-label="Back">
          ▲
        </button>
        <button className="cosy-btn small" onClick={() => decor.nudge(0, 1)} aria-label="Forward">
          ▼
        </button>
        <button className="cosy-btn small" onClick={() => decor.nudge(1, 0)} aria-label="Right">
          ▶
        </button>
        {!wall && (
          <button className="cosy-btn small" onClick={() => decor.turn()}>
            ⟳ Turn <span className="cosy-key">R</span>
          </button>
        )}
      </div>
      <div className="flat-actions">
        <button className="cosy-btn primary" disabled={Boolean(why)} onClick={() => decor.place()}>
          ✓ Put it here
        </button>
        <button className="cosy-btn" onClick={() => decor.putAway()}>
          📦 Put away
        </button>
        <button className="cosy-btn" onClick={() => decor.cancel()}>
          {held.index >= 0 ? 'Leave it' : 'Not now'}
        </button>
      </div>
    </div>
  );
}

function Shop({ owned, coins }: { owned: Record<string, number>; coins: number }) {
  const [shelf, setShelf] = useState<Shelf>('seat');
  return (
    <>
      <div className="flat-shelves">
        {SHELVES.map((s) => (
          <button key={s.id} className={`flat-shelf ${shelf === s.id ? 'on' : ''}`} onClick={() => setShelf(s.id)}>
            {s.name}
          </button>
        ))}
      </div>
      <div className="flat-grid">
        {PIECES.filter((p) => p.shelf === shelf).map((p) => {
          const have = owned[p.id] ?? 0;
          const short = p.price - coins;
          return (
            <div key={p.id} className="flat-card">
              <span className="flat-icon">{p.icon}</span>
              <span className="flat-name">{p.name}</span>
              {have > 0 && <span className="flat-have">You have {have}</span>}
              <button className="cosy-btn primary small" disabled={short > 0} onClick={() => decor.buy(p.id, have)} title={short > 0 ? `You need ${money(short)} more` : undefined}>
                Buy {money(p.price)}
              </button>
              {short > 0 && <span className="flat-need">{money(short)} more to go</span>}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Storage({ stored, owned, placed }: { stored: typeof PIECES; owned: Record<string, number>; placed: Record<string, number> }) {
  if (!stored.length) return <p className="flat-blurb">Nothing in storage. Things you buy wait here until you put them out, and anything you put away comes back here.</p>;
  return (
    <div className="flat-grid">
      {stored.map((p) => (
        <div key={p.id} className="flat-card">
          <span className="flat-icon">{p.icon}</span>
          <span className="flat-name">{p.name}</span>
          <span className="flat-have">× {(owned[p.id] ?? 0) - (placed[p.id] ?? 0)}</span>
          <button className="cosy-btn small" onClick={() => decor.takeOut(p.id)}>
            Put it out
          </button>
        </div>
      ))}
    </div>
  );
}

function Finishes({ finishes, coins, wall, floor }: { finishes: string[]; coins: number; wall: string; floor: string }) {
  const row = (kind: 'wall' | 'floor', list: Finish[], current: string) => (
    <div className="flat-swatches">
      {list.map((f) => {
        const have = f.price === 0 || finishes.includes(f.id);
        const on = current === f.id;
        return (
          <div key={f.id} className={`flat-swatch ${on ? 'on' : ''}`}>
            <span className={`flat-sample ${f.pattern}`} style={{ ['--a' as string]: f.a, ['--b' as string]: f.b }} />
            <span className="flat-name">{f.name}</span>
            {have ? (
              <button className="cosy-btn small" disabled={on} onClick={() => decor.finishes(kind, f.id)}>
                {on ? 'Up ✓' : 'Use it'}
              </button>
            ) : (
              <button className="cosy-btn primary small" disabled={f.price > coins} onClick={() => decor.buy(f.id, 0)} title={f.price > coins ? `You need ${money(f.price - coins)} more` : undefined}>
                Buy {money(f.price)}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
  return (
    <>
      <h3 className="flat-sub">Wallpaper</h3>
      {row('wall', WALLS, wall)}
      <h3 className="flat-sub">Floor</h3>
      {row('floor', FLOORS, floor)}
    </>
  );
}
