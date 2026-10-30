import { getRole, TEAM_SINGULAR } from '../data';
import { useHud } from '../game/hud';
import { player } from '../net/client';
import { ui, useUI, type Panel } from '../state/ui';
import { useView } from '../state/view';
import { Icon, type IconName } from './Icon';
import { RichText } from './RichText';
import { nominateButton } from './Nominate';
import { pigeonBlock } from '../state/host';
import { slayerButton } from './Slayer';
import { TeamCounts } from './TeamCounts';
import { Token } from './Token';

export function MyCharacter() {
  const view = useView();
  const me = view.seats.find((s) => s.isMe);
  const role = getRole(me?.roleId);
  const fabled = view.fabled.map((id) => getRole(id)).filter(Boolean);

  return (
    <aside className="my-character">
      {fabled.length > 0 && (
        <div className="my-fabled">
          {fabled.map((f) => (
            <button key={f!.id} className="bluff-slot" title={f!.name} onClick={() => ui.open({ kind: 'role', roleId: f!.id })}>
              <Token roleId={f!.id} />
            </button>
          ))}
        </div>
      )}
      {/* How many of each kind of character a game this size has. */}
      <TeamCounts className="surface" />
      {!me ? (
        <div className="my-card surface hint">
          <Icon name="pin" />
          <p>Finding your seat…</p>
        </div>
      ) : role ? (
        <button className={`my-card surface align-${me.alignment ?? 'none'}`} onClick={() => ui.open({ kind: 'role', roleId: role.id })}>
          <Token roleId={role.id} alignment={me.alignment} dead={me.dead} />
          <div className="my-text">
            <span className="eyebrow">
              You are the {me.alignment ? (me.alignment === 'good' ? 'good ' : 'evil ') : ''}
              {TEAM_SINGULAR[role.team]}
            </span>
            <strong>{role.name}</strong>
            <p>
              <RichText text={role.ability} />
            </p>
          </div>
        </button>
      ) : (
        <div className="my-card surface hint">
          <Token roleId={null} />
          <p>{view.revealed ? 'Your character is on its way…' : 'Your character will appear here when the Storyteller hands them out.'}</p>
        </div>
      )}
    </aside>
  );
}

export function VoteBar() {
  const view = useView();
  const n = view.nomination;
  const me = view.seats.find((s) => s.isMe);
  if (!n || !me || n.status === 'done') return null;
  const nominee = view.seats.find((s) => s.id === n.nomineeId);
  const up = n.votes.includes(me.id);
  const locked = n.locked.includes(me.id);
  const canVote = !me.dead || me.ghostVote;
  const myTurn = n.status !== 'idle' && n.status !== 'countdown' && n.step > 0 && n.order[n.step - 1] === me.id && !locked;
  let note = '';
  if (locked) note = up ? 'Your vote is in.' : 'The hand has passed you.';
  else if (!canVote) note = 'You have used your ghost vote.';
  else if (myTurn) note = 'The hand is on you. You can still change your mind.';
  else if (n.speech) note = n.speech.kind === 'accuse' ? 'First the accusation, then the defence, then the vote.' : 'After the defence, the vote.';
  else if (me.dead) note = 'Voting uses your one ghost vote.';
  return (
    <div className={`vote-bar surface ${myTurn ? 'my-turn' : ''}`}>
      <div className="vote-q">
        <span className="vote-ask">
          Execute <b className="blood">{nominee?.label}</b>?
        </span>
        {note && <span>{note}</span>}
      </div>
      <button className="btn quiet vote-board" onClick={showVotes} title="The day’s votes so far, from the noticeboard">
        <Icon name="vote" />
        <span>Today’s votes</span>
      </button>
      <button
        className={`btn big ${up ? 'primary' : ''}`}
        disabled={locked || (!canVote && !up)}
        onClick={() => player.vote(!up)}
      >
        <Icon name="hand" /> {up ? 'Hand raised' : 'Raise hand'}
      </button>
    </div>
  );
}

/** The noticeboard's votes, brought to you: from the vote bar, or your stool at the meeting. */
const showVotes = () => useHud.setState({ notice: true });

/** Sat at the meeting between votes: the day's votes so far, without walking over to the noticeboard. */
export function MeetingVotes() {
  const view = useView();
  const seated = useHud((s) => s.meetingSeated);
  const job = useHud((s) => s.job);
  const voting = view.nomination && view.nomination.status !== 'done';
  if (!seated || job || voting || view.ended) return null;
  const today = view.history.filter((h) => h.day === view.day).length;
  return (
    <button className="meeting-votes cosy-btn small" onClick={showVotes} title="The day’s votes so far, from the noticeboard">
      <Icon name="vote" /> Today’s votes{today ? ` (${today})` : ''}
    </button>
  );
}

/** The player's menu: big, labelled buttons down the right side (along the bottom on phones). */
export function PlayerRail() {
  const view = useView();
  const panel = useUI((s) => s.panel);
  const modal = useUI((s) => s.modal?.kind);
  const me = view.seats.find((s) => s.isMe);
  const slayer = slayerButton(view);
  const nominate = nominateButton(view);
  const open = (p: Exclude<Panel, null>) => () => ui.togglePanel(p);
  const notesOpen = panel === 'notes' || panel === 'journal';
  const items: { key: string; icon: IconName; label: string; on?: boolean; disabled?: boolean; dim?: boolean; action: () => void }[] = [
    // Only on phones: on a wider screen the card in the corner is the same thing.
    {
      key: 'me',
      icon: 'user',
      label: 'Me',
      disabled: !me?.roleId,
      action: () => me?.roleId && ui.open({ kind: 'role', roleId: me.roleId }),
    },
    // Your name, animal, hat and pet (only the hat and pet while a game is on).
    { key: 'customise', icon: 'paw', label: 'Customise', on: modal === 'customise', action: () => ui.open({ kind: 'customise' }) },
    { key: 'reference', icon: 'book', label: 'Characters', on: panel === 'reference', action: open('reference') },
    // Your notes and what the Storyteller has shown you, as two tabs. (The votes are on the noticeboard in the square.)
    {
      key: 'notes',
      icon: 'notepad',
      label: 'Notepad',
      on: notesOpen,
      action: () => useUI.setState({ panel: notesOpen ? null : 'notes' }),
    },
    // By day, for the living: once a day, at a town meeting, for the Storyteller to start. (Outside a meeting it
    // says so when pressed.)
    ...(nominate.show
      ? [
          {
            key: 'nominate',
            icon: 'point' as const,
            label: nominate.waiting ? 'Waiting…' : nominate.why && !nominate.closed ? 'Nominated' : 'Nominate',
            disabled: Boolean(nominate.why && !nominate.waiting && !nominate.closed),
            dim: nominate.closed,
            action: () => ui.open({ kind: 'nominate' }),
          },
        ]
      : []),
    // Anyone can claim to be the Slayer, once a game, when the script has one. (Like Nominate, it comes before the
    // everyday buttons, so neither scrolls out of sight along a phone's bar.)
    ...(slayer.show
      ? [{ key: 'slayer', icon: 'dagger' as const, label: slayer.used ? 'Slayer used' : 'Slayer', disabled: slayer.used, action: () => ui.open({ kind: 'slayer' }) }]
      : []),
    // (While a nomination is on it stays pressable, to say why the pigeons are staying put.)
    {
      key: 'pigeon',
      icon: 'bird',
      label: 'Pigeon',
      disabled: view.phase === 'night',
      dim: Boolean(pigeonBlock(view)),
      action: () => ui.open({ kind: 'pigeon' }),
    },
    { key: 'awards', icon: 'trophy', label: 'Awards', action: () => ui.open({ kind: 'awards' }) },
    // (Settings are in the cog at the top right, with the sound and voice.)
  ];
  return (
    <nav className="player-rail surface" aria-label="Menu">
      {items.map((it) => (
        <button key={it.key} className={`rail-item rail-${it.key} ${it.on ? 'on' : ''} ${it.dim ? 'dim' : ''}`} onClick={it.action} disabled={it.disabled} aria-pressed={it.on}>
          <Icon name={it.icon} />
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}
