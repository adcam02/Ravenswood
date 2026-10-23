import { useRef, useState } from 'react';
import { money, profiles, useProfiles, type Profile } from '../game/profiles';
import { ui } from '../state/ui';
import { FEATS, HATS, PETS } from '../world/types';
import { Icon } from './Icon';
import { Modal } from './Modal';

const AMOUNTS = [5, 10, 25, 50, 100];

/**
 * Storyteller: every player's profile kept in this browser, by name: their money, achievements and hats. Give or take
 * money and achievements, and save them all to a file (or load them back) to move to another browser.
 */
export function ProfilesModal() {
  const book = useProfiles((s) => s.profiles);
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const file = useRef<HTMLInputElement>(null);
  const all = Object.entries(book).sort((a, b) => a[1].name.localeCompare(b[1].name));
  const q = query.trim().toLowerCase();
  const list = q ? all.filter(([key]) => key.includes(q)) : all;

  const save = () => {
    const blob = new Blob([profiles.exportJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ravenswood-profiles-${new Date().toLocaleDateString('en-CA')}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const load = async (f: File | undefined) => {
    if (!f) return;
    const got = profiles.importJSON(await f.text());
    if (typeof got === 'string') ui.toast(got, 'evil');
    else ui.toast(`Loaded ${got} ${got === 1 ? 'profile' : 'profiles'}`, 'good');
    if (file.current) file.current.value = '';
  };

  return (
    <Modal
      title="Players’ profiles"
      eyebrow={`${all.length} ${all.length === 1 ? 'name' : 'names'} · kept in this browser`}
      size="lg"
      className="profiles-modal"
      head={
        <div className="profiles-tools">
          <button className="btn small" onClick={save} disabled={!all.length} title="Save every profile to a file">
            <Icon name="download" /> Export
          </button>
          <button className="btn small" onClick={() => file.current?.click()} title="Load profiles from a file (same names are replaced)">
            <Icon name="upload" /> Import
          </button>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => void load(e.target.files?.[0])} />
        </div>
      }
    >
      <p className="profiles-blurb">
        Each player’s money, achievements and hats, kept under their name (however they write it) and sent to whichever device they play on. Export
        them to keep them safe or to host from another browser.
      </p>
      {all.length > 6 && <input className="input search profiles-search" placeholder="Find a name" value={query} onChange={(e) => setQuery(e.target.value)} />}
      {!all.length ? (
        <p className="profiles-empty">Nobody has played here yet. Players appear as soon as they join.</p>
      ) : (
        <ul className="profile-list">
          {list.map(([key, p]) => (
            <ProfileRow key={key} id={key} p={p} open={open === key} toggle={() => setOpen(open === key ? null : key)} />
          ))}
        </ul>
      )}
    </Modal>
  );
}

function ProfileRow({ id, p, open, toggle }: { id: string; p: Profile; open: boolean; toggle: () => void }) {
  const hats = HATS.filter((h) => h.id !== 'beanie' && h.unlocked(p));
  return (
    <li className={`profile ${open ? 'open' : ''}`}>
      <button className="profile-row" onClick={toggle} aria-expanded={open}>
        <strong>{p.name}</strong>
        <span className="profile-money">{money(p.coins)}</span>
        <span className="profile-feats" title="Achievements">
          🏆 {p.feats.length}
        </span>
        <span className="profile-hats" title={hats.map((h) => h.name).join(', ')}>
          {hats.slice(0, 9).map((h) => h.icon)}
          {hats.length > 9 && <em>+{hats.length - 9}</em>}
        </span>
        <Icon name="chevronDown" className="profile-chevron" />
      </button>
      {open && <ProfileDetail id={id} p={p} />}
    </li>
  );
}

function ProfileDetail({ id, p }: { id: string; p: Profile }) {
  const [amount, setAmount] = useState(10);
  const [forget, setForget] = useState(false);
  const pets = PETS.filter((x) => p.pets.includes(x.id));
  return (
    <div className="profile-detail">
      <div className="profile-section">
        <span className="eyebrow">Money</span>
        <div className="profile-money-row">
          <strong>{money(p.coins)}</strong>
          <div className="seg">
            {AMOUNTS.map((n) => (
              <button key={n} className={amount === n ? 'on' : ''} onClick={() => setAmount(n)}>
                {money(n)}
              </button>
            ))}
          </div>
          <button className="btn small primary" onClick={() => profiles.adjust(id, amount)}>
            <Icon name="plus" /> Give
          </button>
          <button className="btn small" onClick={() => profiles.adjust(id, -amount)} disabled={p.coins <= 0}>
            <Icon name="minus" /> Take
          </button>
        </div>
      </div>
      <div className="profile-section">
        <span className="eyebrow">
          Achievements · {p.feats.length} of {FEATS.length} · tap one to give it or take it away
        </span>
        <div className="profile-feat-grid">
          {FEATS.map((f) => {
            const got = p.feats.includes(f.id);
            return (
              <button
                key={f.id}
                className={`profile-feat ${got ? 'got' : ''}`}
                onClick={() => (got ? profiles.takeFeat(id, f.id) : profiles.grantFeat(id, f.id))}
                title={`${f.how}${f.secret ? ' (secret)' : ''}`}
                aria-pressed={got}
              >
                <span>{f.icon}</span>
                {f.name}
              </button>
            );
          })}
        </div>
      </div>
      <div className="profile-section">
        <span className="eyebrow">Hats and the rest</span>
        <p className="profile-facts">
          {HATS.filter((h) => h.unlocked(p))
            .map((h) => `${h.icon} ${h.name}`)
            .join(' · ')}
        </p>
        <p className="profile-facts dim">
          {p.stars} gold {p.stars === 1 ? 'star' : 'stars'} · {p.records} town {p.records === 1 ? 'record' : 'records'} · {p.nights} nights asleep ·{' '}
          {p.perfect.length} jobs done perfectly
          {pets.length > 0 && ` · pets: ${pets.map((x) => `${x.icon} ${x.name}`).join(', ')}`} · last played{' '}
          {new Date(p.updated).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
        </p>
      </div>
      <div className="profile-forget">
        <button className={`btn small ${forget ? 'blood' : 'quiet'}`} onClick={() => (forget ? profiles.forget(id) : setForget(true))}>
          {forget ? `Yes, forget ${p.name}` : `Forget ${p.name}`}
        </button>
      </div>
    </div>
  );
}
