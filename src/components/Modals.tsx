import { useEffect, useMemo, useState } from 'react';
import { go } from '../App';
import { ALL_ROLES, defaultAlignment, genericIcon, getRole, jinxesFor, nightReminder, TEAM_SINGULAR, rolesOfTeam } from '../data';
import { player } from '../net/client';
import { hostLink, type PlayerLine } from '../net/host';
import { NEEDS_SHOWN, seatName, st, underway, useHost } from '../state/host';
import { notes, useNotes } from '../state/notes';
import { ui, useUI } from '../state/ui';
import { useView } from '../state/view';
import { BagModal } from './Bag';
import { CharacterGrid } from './CharacterGrid';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { RichText } from './RichText';
import { evilInfoStatus } from '../lib/evilInfo';
import { canWakeTogether, demonInfo, minionInfo, tell, wholeEvilTeam } from '../lib/presets';
import { joinNames } from '../lib/util';
import { askForNotifications, notificationsSupported } from '../lib/notify';
import { ScriptModal } from './ScriptPicker';
import { SlayerModal } from './Slayer';
import { ReadLettersModal, SeatingModal, WriteLetterModal } from './Letters';
import { AwardsModal } from './Awards';
import { PigeonModal } from './Pigeon';
import { ProfilesModal } from './Profiles';
import { JukeboxModal } from './Club';
import { IdeaModal, IdeasModal } from './Ideas';
import { EndGameSetting, RecapModal } from './GameOver';
import { useProblems } from '../lib/report';
import { ReminderToken, Token } from './Token';
import { WakeComposer } from './WakeComposer';
import { CustomiseModal } from './town/Customise';

export function Modals() {
  const modal = useUI((s) => s.modal);
  if (!modal) return null;
  switch (modal.kind) {
    case 'character':
      return <CharacterModal seatId={modal.seatId} purpose={modal.purpose} />;
    case 'bluff':
      return <BluffModal index={modal.index} />;
    case 'fabled':
      return <FabledModal />;
    case 'reminder':
      return <ReminderModal seatId={modal.seatId} />;
    case 'rename':
      return <RenameModal seatId={modal.seatId} />;
    case 'share':
      return <ShareModal />;
    case 'settings':
      return <SettingsModal />;
    case 'role':
      return <RoleModal roleId={modal.roleId} />;
    case 'script':
      return <ScriptModal />;
    case 'bag':
      return <BagModal />;
    case 'wake':
      return <WakeComposer />;
    case 'dawnCheck':
      return <DawnCheck />;
    case 'slayer':
      return <SlayerModal />;
    case 'recap':
      return <RecapModal />;
    case 'letter':
      return <WriteLetterModal />;
    case 'letters':
      return <ReadLettersModal />;
    case 'seating':
      return <SeatingModal />;
    case 'awards':
      return <AwardsModal />;
    case 'pigeon':
      return <PigeonModal />;
    case 'customise':
      return <CustomiseModal />;
    case 'profiles':
      return <ProfilesModal />;
    case 'jukebox':
      return <JukeboxModal />;
    case 'idea':
      return <IdeaModal />;
    case 'ideas':
      return <IdeasModal />;
  }
}

function Scope({ all, setAll, query, setQuery }: { all: boolean; setAll: (v: boolean) => void; query: string; setQuery: (q: string) => void }) {
  return (
    <div className="picker-tools">
      <div className="seg">
        <button className={!all ? 'on' : ''} onClick={() => setAll(false)}>
          This script
        </button>
        <button className={all ? 'on' : ''} onClick={() => setAll(true)}>
          Every character
        </button>
      </div>
      <input className="input search" placeholder="Search characters" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
    </div>
  );
}

const playable = ALL_ROLES.filter((r) => r.team !== 'fabled' && r.team !== 'loric').map((r) => r.id);

function CharacterModal({ seatId, purpose }: { seatId: string; purpose: 'role' | 'shown' | 'note' | 'claim' }) {
  const view = useView();
  const seat = view.seats.find((s) => s.id === seatId);
  const raw = useHost((s) => s.g.seats.find((x) => x.id === seatId));
  const [all, setAll] = useState(false);
  const [query, setQuery] = useState('');
  const inPlay = new Set(view.mode === 'st' ? useHost.getState().g.seats.map((s) => s.roleId).filter(Boolean) as string[] : []);
  const ids = all ? playable : view.script.roles;
  const tags: Record<string, string> = {};
  if (view.mode === 'st') for (const s of view.seats) if (s.roleId && s.id !== seatId) tags[s.roleId] = s.label;
  const noted = useNotes((s) => s.notes[seatId]);
  if (!seat) return null;

  const mine = purpose === 'note' || purpose === 'claim';
  const current =
    purpose === 'role' ? raw?.roleId : purpose === 'shown' ? raw?.shownRoleId : purpose === 'note' ? noted?.guess : noted?.claim;
  const pick = (id: string) => {
    const g = useHost.getState().g;
    if (purpose === 'role') st.setRole(seatId, id);
    else if (purpose === 'shown') st.setShownRole(seatId, id);
    else notes.set(seatId, purpose === 'note' ? 'guess' : 'claim', id);
    // A new character during the game (a starpass, a Hatter's tea party): the wake screen opens ready to tell them,
    // for the Storyteller to show when they're ready (or close).
    if (!mine && id !== current && raw?.playerId && underway(g)) tell([seatId]);
    else ui.close();
  };
  const title =
    purpose === 'role'
      ? `Character for ${seat.label}`
      : purpose === 'shown'
        ? `What ${seat.label} thinks they are`
        : purpose === 'claim'
          ? `What ${seat.label} claims to be`
          : `What you think ${seat.label} really is`;
  const eyebrow =
    purpose === 'shown'
      ? `Really the ${getRole(raw?.roleId)?.name ?? '…'}. Players see this instead.`
      : mine
        ? 'Only you can see this'
        : view.revealed && seat.claimed
          ? 'They’ll see the change straight away'
          : 'Choose a character';

  return (
    <Modal
      title={title}
      eyebrow={eyebrow}
      size="lg"
      footer={
        mine ? (
          current ? (
            <button className="btn quiet" onClick={() => (notes.set(seatId, purpose === 'note' ? 'guess' : 'claim', null), ui.close())}>
              <Icon name="x" /> {purpose === 'note' ? 'Clear my guess' : 'Clear their claim'}
            </button>
          ) : undefined
        ) : current ? (
          <button
            className="btn quiet"
            onClick={() => {
              if (purpose === 'role') st.setRole(seatId, null);
              else st.setShownRole(seatId, null);
              ui.close();
            }}
          >
            <Icon name="x" /> {purpose === 'role' ? 'Remove character' : 'Show their real character'}
          </button>
        ) : undefined
      }
    >
      <Scope all={all} setAll={setAll} query={query} setQuery={setQuery} />
      <CharacterGrid
        ids={ids}
        onPick={pick}
        selected={current ? [current] : []}
        dimmed={purpose === 'shown' ? inPlay : undefined}
        tags={mine ? undefined : tags}
        query={query}
        teams={mine ? ['townsfolk', 'outsider', 'minion', 'demon'] : undefined}
      />
    </Modal>
  );
}

function BluffModal({ index }: { index: number }) {
  const g = useHost((s) => s.g);
  const [all, setAll] = useState(false);
  const [query, setQuery] = useState('');
  const inPlay = new Set(g.seats.flatMap((s) => [s.roleId, s.shownRoleId]).filter(Boolean) as string[]);
  const tags: Record<string, string> = {};
  for (const s of g.seats) if (s.roleId) tags[s.roleId] = 'In play';
  g.bluffs.forEach((b, i) => b && i !== index && (tags[b] = 'Bluff'));
  return (
    <Modal
      title={`Demon bluff ${index + 1}`}
      eyebrow="Usually a good character that isn’t in play"
      size="lg"
      footer={
        g.bluffs[index] && (
          <button className="btn quiet" onClick={() => (st.setBluff(index, null), ui.close())}>
            <Icon name="x" /> Clear this bluff
          </button>
        )
      }
    >
      <Scope all={all} setAll={setAll} query={query} setQuery={setQuery} />
      <CharacterGrid
        ids={all ? playable : g.script.roles}
        onPick={(id) => (st.setBluff(index, id), ui.close())}
        selected={g.bluffs[index] ? [g.bluffs[index]!] : []}
        dimmed={inPlay}
        tags={tags}
        query={query}
      />
    </Modal>
  );
}

function FabledModal() {
  const fabled = useHost((s) => s.g.fabled);
  const ids = [...rolesOfTeam('fabled'), ...rolesOfTeam('loric')].map((r) => r.id);
  return (
    <Modal title="Fabled & Loric" eyebrow="Special rules everyone can see" size="lg">
      <CharacterGrid ids={ids} onPick={st.toggleFabled} selected={fabled} teams={['fabled', 'loric']} />
    </Modal>
  );
}

function ReminderModal({ seatId }: { seatId: string }) {
  const g = useHost((s) => s.g);
  const [all, setAll] = useState(false);
  const [custom, setCustom] = useState('');
  const seat = g.seats.find((s) => s.id === seatId);
  const roleIds = useMemo(() => {
    const ids = all ? [...g.script.roles, ...g.fabled] : [...g.seats.flatMap((s) => [s.roleId, s.shownRoleId]), ...g.fabled];
    return [...new Set(ids.filter(Boolean) as string[])];
  }, [g, all]);
  const add = (roleId: string, text: string) => {
    st.addReminder(seatId, roleId, text);
    ui.close();
  };
  const groups = roleIds
    .map((id) => getRole(id))
    .filter((r) => r && ((r.reminders?.length ?? 0) + (r.remindersGlobal?.length ?? 0) > 0));
  return (
    <Modal
      title={`Reminder for ${seat?.name || 'this seat'}`}
      eyebrow="Click a reminder to place it. Click a placed reminder to remove it."
      size="lg"
      head={
        <div className="seg">
          <button className={!all ? 'on' : ''} onClick={() => setAll(false)}>
            In play
          </button>
          <button className={all ? 'on' : ''} onClick={() => setAll(true)}>
            Whole script
          </button>
        </div>
      }
    >
      <div className="reminder-groups">
        {groups.map((r) => (
          <section key={r!.id} className="reminder-group">
            <h4>
              <Token roleId={r!.id} label={false} /> {r!.name}
            </h4>
            <div className="reminder-row">
              {[...(r!.reminders ?? []), ...(r!.remindersGlobal ?? [])].map((text, i) => (
                <button key={i} className="reminder-pick" onClick={() => add(r!.id, text)}>
                  <ReminderToken roleId={r!.id} text={text} />
                  <span>{text}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
        {!groups.length && <p className="char-empty">No characters with reminders yet. Switch to the whole script, or write your own below.</p>}
      </div>
      <form
        className="custom-reminder"
        onSubmit={(e) => {
          e.preventDefault();
          if (custom.trim()) add('', custom.trim().slice(0, 18));
        }}
      >
        <input className="input" placeholder="Write your own reminder" value={custom} onChange={(e) => setCustom(e.target.value)} maxLength={18} />
        <button className="btn" disabled={!custom.trim()}>
          Place
        </button>
        <button type="button" className="btn quiet" onClick={() => add('', 'Good')}>
          Good
        </button>
        <button type="button" className="btn quiet" onClick={() => add('', 'Evil')}>
          Evil
        </button>
      </form>
    </Modal>
  );
}

function RenameModal({ seatId }: { seatId: string }) {
  const view = useView();
  const seat = view.seats.find((s) => s.id === seatId);
  const [name, setName] = useState(seat?.name ?? '');
  if (!seat) return null;
  const save = () => {
    if (view.mode === 'st') st.renameSeat(seatId, name);
    else player.rename(name);
    ui.close();
  };
  return (
    <Modal title={view.mode === 'st' ? `Seat ${seat.index + 1}` : 'Your name'} size="sm">
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label className="field">
          <span>Name</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={24} autoFocus />
        </label>
        <button className="btn primary">Save</button>
      </form>
    </Modal>
  );
}

export function joinLink(room: string) {
  const p = new URLSearchParams(location.search);
  const peer = p.get('peer');
  return `${location.origin}${location.pathname}?room=${room}${peer ? `&peer=${peer}` : ''}`;
}

function ShareModal() {
  const view = useView();
  const [copied, setCopied] = useState(false);
  const link = joinLink(view.room);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const el = document.querySelector<HTMLInputElement>('.share-link');
      el?.select();
      document.execCommand('copy');
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const empty = view.seats.filter((s) => !s.claimed).length;
  return (
    <Modal title="Invite your players" eyebrow={`Room ${view.room}`} size="md">
      <div className="share">
        <p>Send this link to your players. Each one opens it, types their name and picks their animal, and they’ll appear in town.</p>
        <div className="share-row">
          <input className="input share-link" readOnly value={link} onFocus={(e) => e.target.select()} />
          <button className="btn primary" onClick={copy}>
            <Icon name={copied ? 'check' : 'copy'} /> {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
        <div className="share-code">
          <span className="eyebrow">Or the room code</span>
          <strong>{view.room}</strong>
        </div>
        <p className="share-note">
          {view.seats.length - empty} {view.seats.length - empty === 1 ? 'player has' : 'players have'} arrived. Keep this tab open while you play:
          your browser is the game’s host.
        </p>
      </div>
    </Modal>
  );
}

function Stepper({ value, onChange, min, max }: { value: number; onChange: (n: number) => void; min: number; max: number }) {
  return (
    <div className="stepper">
      <button className="btn small square" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Fewer">
        <Icon name="minus" />
      </button>
      <b>{value}</b>
      <button className="btn small square" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="More">
        <Icon name="plus" />
      </button>
    </div>
  );
}

function SettingsModal() {
  const view = useView();
  if (view.mode === 'player') return <PlayerSettings />;
  return <StorytellerSettings />;
}

function StorytellerSettings() {
  const g = useHost((s) => s.g);
  const [confirm, setConfirm] = useState<string | null>(null);
  const ask = (key: string, fn: () => void) => () => {
    if (confirm === key) {
      fn();
      setConfirm(null);
    } else setConfirm(key);
  };
  return (
    <Modal title="Game" eyebrow={`Room ${g.room}`} size="md">
      <div className="settings">
        <div className="setting">
          <div>
            <strong>Script</strong>
            <span>{g.script.name}</span>
          </div>
          <button className="btn" onClick={() => ui.open({ kind: 'script' })}>
            Change script
          </button>
        </div>
        <div className="setting">
          <div>
            <strong>Seats</strong>
            <span>Players can take any empty seat</span>
          </div>
          <Stepper value={g.seats.length} onChange={st.setSeatCount} min={0} max={20} />
        </div>
        <div className="setting">
          <div>
            <strong>Day or night</strong>
            <span>
              {g.day === 0 && g.phase === 'day' ? 'Before the game' : `${g.phase === 'night' ? 'Night' : 'Day'} ${g.day}`}
            </span>
          </div>
          <Stepper value={g.day} onChange={st.setDay} min={0} max={30} />
        </div>
        <hr className="rule" />
        <div className="setting">
          <div>
            <strong>Reveal the grimoire</strong>
            <span>At the end of the game, show everyone every character</span>
          </div>
          <button className={`btn ${g.grimoireRevealed ? 'primary' : ''}`} onClick={() => st.revealGrimoire(!g.grimoireRevealed)}>
            {g.grimoireRevealed ? 'Hide it again' : 'Reveal'}
          </button>
        </div>
        <EndGameSetting />
        <div className="setting">
          <div>
            <strong>Players’ profiles</strong>
            <span>Everyone’s money, achievements and hats, kept here by name</span>
          </div>
          <button className="btn" onClick={() => ui.open({ kind: 'profiles' })}>
            <Icon name="trophy" /> Profiles
          </button>
        </div>
        <PlayerLines />
        <PlayerProblems />
        <div className="setting">
          <div>
            <strong>New game</strong>
            <span>Same room, same players. Characters, deaths and votes are cleared.</span>
          </div>
          <button className={`btn ${confirm === 'new' ? 'blood' : ''}`} onClick={ask('new', () => (st.newGame(true), ui.close()))}>
            {confirm === 'new' ? 'Yes, start over' : 'New game'}
          </button>
        </div>
        <div className="setting">
          <div>
            <strong>New room</strong>
            <span>A fresh room code. Players will need the new link.</span>
          </div>
          <button className={`btn ${confirm === 'room' ? 'blood' : ''}`} onClick={ask('room', () => (st.newRoom(), ui.close()))}>
            {confirm === 'room' ? 'Yes, new room' : 'New room'}
          </button>
        </div>
        <div className="setting">
          <div>
            <strong>Leave</strong>
            <span>Your game is saved in this browser. Come back any time.</span>
          </div>
          <button className="btn quiet" onClick={() => (ui.close(), go({ kind: 'landing' }))}>
            <Icon name="logout" /> Main menu
          </button>
        </div>
      </div>
    </Modal>
  );
}

/**
 * Each player's line to the Storyteller, refreshed every couple of seconds while Settings is open: the network's round
 * trip, and whether they're straight through, through a relay, or on the backup route (which has no voice).
 */
function PlayerLines() {
  const g = useHost((s) => s.g);
  const [lines, setLines] = useState<PlayerLine[] | null>(null);
  useEffect(() => {
    let live = true;
    const read = () => void hostLink.lines().then((l) => live && setLines(l));
    read();
    const t = setInterval(read, 2000);
    return () => {
      live = false;
      clearInterval(t);
    };
  }, []);
  if (!lines?.length) return null;
  const name = (pid: string) => g.seats.find((s) => s.playerId === pid)?.name || 'Someone joining';
  const feel = (ms: number | null) => (ms === null ? '' : ms < 150 ? 'good' : ms < 400 ? 'fair' : 'poor');
  const sorted = [...lines].sort((a, b) => (b.ms ?? 0) - (a.ms ?? 0));
  return (
    <div className="setting lines">
      <div>
        <strong>Connections</strong>
        <span>Each player’s round trip to you. Under 150 ms feels instant; a relay adds a little.</span>
        <ul className="line-list">
          {sorted.map((l) => (
            <li key={l.playerId}>
              <b>{name(l.playerId)}</b>
              <span className={`line-ms ${feel(l.ms)}`}>{l.ms === null ? '…' : `${l.ms} ms`}</span>
              <span className="line-route">
                {l.route === 'backup' ? 'backup route (no voice)' : l.route === 'relay' ? `relay${l.via ? ` (${l.via})` : ''}` : 'direct'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Problems players' games have reported this session, newest first, for working out what went wrong. */
function PlayerProblems() {
  const list = useProblems((s) => s.list);
  if (!list.length) return null;
  return (
    <div className="setting problems">
      <div>
        <strong>Problems in players’ games</strong>
        <span>This session only. A reload usually sorts a player out.</span>
        <ul className="problem-list">
          {[...list].reverse().map((p, i) => (
            <li key={i}>
              <b>{p.who}</b> · {new Date(p.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · {p.where}
              <code>{p.message}</code>
            </li>
          ))}
        </ul>
      </div>
      <button className="btn quiet" onClick={() => useProblems.setState({ list: [] })}>
        Clear
      </button>
    </div>
  );
}

function PlayerSettings() {
  const ambienceOn = useUI((s) => s.ambience);
  const view = useView();
  return (
    <Modal title="Settings" eyebrow={`Room ${view.room}`} size="sm">
      <div className="settings">
        <div className="setting">
          <div>
            <strong>Ambient sound</strong>
            <span>A soft tune, birds, the pond, the fire: all well under the voices</span>
          </div>
          <button className="btn" onClick={() => useUI.setState({ ambience: !ambienceOn })}>
            {ambienceOn ? 'Turn off' : 'Turn on'}
          </button>
        </div>
        {notificationsSupported() && (
          <div className="setting">
            <div>
              <strong>Notifications</strong>
              <span>A pop-up when you’re woken or the bell rings, even while you’re in another tab</span>
            </div>
            {Notification.permission === 'granted' ? (
              <span className="setting-on">
                <Icon name="check" /> On
              </span>
            ) : Notification.permission === 'denied' ? (
              <span className="setting-off">Blocked in your browser’s site settings</span>
            ) : (
              <button className="btn" onClick={() => (askForNotifications(), ui.close())}>
                Turn on
              </button>
            )}
          </div>
        )}
        <div className="setting">
          <div>
            <strong>Your notes on players</strong>
            <span>The claims and guesses you’ve noted for other players</span>
          </div>
          <button className="btn quiet" onClick={() => (notes.clear(), ui.close())}>
            Clear them
          </button>
        </div>
        <div className="setting">
          <div>
            <strong>Leave the room</strong>
            <span>You can rejoin with the same link</span>
          </div>
          <button className="btn quiet" onClick={() => (location.href = location.pathname)}>
            <Icon name="logout" /> Leave
          </button>
        </div>
      </div>
    </Modal>
  );
}


function RoleModal({ roleId }: { roleId: string }) {
  const view = useView();
  const role = getRole(roleId);
  if (!role) return null;
  const jinxes = jinxesFor(view.script.roles.includes(roleId) ? view.script.roles : [...view.script.roles, roleId]).filter(
    (j) => j.a === roleId || j.b === roleId,
  );
  const me = view.seats.find((s) => s.isMe);
  const alignment = me?.roleId === roleId ? me.alignment : defaultAlignment(role.team);
  const first = nightReminder(roleId, 'first');
  const other = nightReminder(roleId, 'other');
  return (
    <Modal title={role.name} eyebrow={TEAM_SINGULAR[role.team]} size="sm" className="role-modal">
      <div className="role-detail">
        <Token roleId={roleId} alignment={alignment} />
        <p className="role-ability">
          <RichText text={role.ability} />
        </p>
        {role.flavor && <p className="role-flavor">“{role.flavor}”</p>}
        {jinxes.length > 0 && (
          <div className="role-jinxes">
            <span className="eyebrow">Jinxes</span>
            {jinxes.map((j, i) => {
              const other = getRole(j.a === roleId ? j.b : j.a);
              return (
                <div key={i} className="jinx">
                  <Token roleId={other?.id ?? null} label={false} />
                  <p>
                    <b>{other?.name}</b> {j.reason}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        {view.mode === 'st' && (first || other) && (
          <div className="role-night">
            {first && (
              <p>
                <span className="eyebrow">First night</span>
                <span>
                  <RichText text={first} />
                </span>
              </p>
            )}
            {other && (
              <p>
                <span className="eyebrow">Other nights</span>
                <span>
                  <RichText text={other} />
                </span>
              </p>
            )}
          </div>
        )}
        {view.mode === 'st' && NEEDS_SHOWN.has(roleId) && <p className="role-note">This player is told they are a different character. Set it from their seat.</p>}
      </div>
    </Modal>
  );
}

const haveOrHas = (n: number) => (n === 1 ? 'hasn’t' : 'haven’t');

/** Stops the first night ending before the evil team has its information. */
function DawnCheck() {
  const g = useHost((s) => s.g);
  const s = evilInfoStatus(g);
  const names = (list: { id: string }[]) => joinNames(list.map((x) => seatName(g, x.id)));
  const toDay = () => {
    st.setPhase('day');
    ui.close();
  };
  return (
    <Modal
      title="Before the sun rises"
      eyebrow="Night 1"
      size="sm"
      footer={
        <button className={`btn ${s.missing ? 'quiet' : 'primary'}`} onClick={toDay}>
          <Icon name="sun" /> {s.missing ? 'Go to day anyway' : 'Go to day'}
        </button>
      }
    >
      <div className="dawn-check">
        {!s.minionsShown && !s.bluffsShown && canWakeTogether(g) && (
          <button
            className="btn primary dawn-together"
            onClick={() => {
              const p = wholeEvilTeam();
              ui.wake(p.to, p.panels, null, p.extra);
            }}
          >
            <img src={genericIcon('evil')} alt="" /> Wake the evil team together
          </button>
        )}
        {!s.minionsShown && (
          <div className="dawn-item">
            <img src={genericIcon('minion')} alt="" />
            <div>
              <strong>
                {names(s.minions)} {haveOrHas(s.minions.length)} been shown the Demon
              </strong>
              <span>Minions learn who the Demon is, and who the other Minions are.</span>
            </div>
            <button
              className="btn"
              onClick={() => {
                const p = minionInfo();
                ui.wake(p.to, p.panels);
              }}
            >
              Minion info
            </button>
          </div>
        )}
        {!s.bluffsShown && (
          <div className="dawn-item">
            <img src={genericIcon('demon')} alt="" />
            <div>
              <strong>
                {names(s.demons)} {haveOrHas(s.demons.length)} been shown their bluffs
              </strong>
              <span>The Demon learns their Minions and three good characters that aren’t in play.</span>
            </div>
            <button
              className="btn primary"
              onClick={() => {
                const p = demonInfo();
                ui.wake(p.to, p.panels);
              }}
            >
              Demon info
            </button>
          </div>
        )}
        {!s.missing && <p className="char-empty">The evil team has everything it needs.</p>}
      </div>
    </Modal>
  );
}
