import { useMemo, useState } from 'react';
import {
  adjustedComposition,
  canDuplicate,
  composition,
  compositionOptions,
  CORE_TEAMS,
  genericIcon,
  getRole,
  rolesByTeam,
  setupNote,
  TEAM_LABEL,
  TEAM_SINGULAR,
  tooFewFor,
  MIN_PLAYERS,
  type Team,
} from '../data';
import { shuffle } from '../lib/util';
import { disguise, DISGUISED, heldRole, isTraveller, NEEDS_SHOWN, setupPlayers, st, underway, useHost } from '../state/host';
import type { GameState } from '../state/types';
import { ui } from '../state/ui';
import { CharacterGrid } from './CharacterGrid';
import { Icon } from './Icon';
import { Modal } from './Modal';
import { ReminderToken, Token } from './Token';

type Step = 'fill' | 'deal';

export function BagModal() {
  const g = useHost((s) => s.g);
  const [step, setStep] = useState<Step>(g.bag.length && g.seats.some((s) => s.roleId) ? 'deal' : 'fill');
  const players = g.seats.filter((s) => !isTraveller(s.roleId)).length;

  return (
    <Modal
      title={step === 'fill' ? 'Fill the bag' : 'Hand out characters'}
      eyebrow={`${g.script.name} · ${players} players`}
      size="xl"
      className="bag-modal"
      head={
        <div className="steps" role="tablist">
          <button role="tab" aria-selected={step === 'fill'} className={step === 'fill' ? 'on' : ''} onClick={() => setStep('fill')}>
            <i>1</i> Fill the bag
          </button>
          <span className="steps-line" />
          <button role="tab" aria-selected={step === 'deal'} className={step === 'deal' ? 'on' : ''} onClick={() => setStep('deal')}>
            <i>2</i> Hand out
          </button>
        </div>
      }
      footer={step === 'fill' ? <FillFooter onNext={() => setStep('deal')} /> : <DealFooter />}
    >
      {step === 'fill' ? <Fill /> : <Deal />}
    </Modal>
  );
}

function useTargets() {
  const g = useHost((s) => s.g);
  const players = g.seats.filter((s) => !isTraveller(s.roleId)).length;
  const base = composition(players);
  const have: Record<string, number> = { townsfolk: 0, outsider: 0, minion: 0, demon: 0, traveller: 0 };
  for (const id of g.bag) {
    const r = getRole(id);
    if (r && r.team in have) have[r.team] += 1;
  }
  // With a choice (the Godfather's -1 or +1 Outsider), the target is whichever the bag is closest to.
  const target = base ? adjustedComposition(base, g.bag, { outsider: have.outsider }) : null;
  const options = base ? compositionOptions(base, g.bag) : [];
  const allowed = (team: Team) => [...new Set(options.map((o) => o[team as keyof typeof o]))].sort((a, b) => a - b);
  return { players, base, target, have, allowed };
}

function Fill() {
  const g = useHost((s) => s.g);
  const { players, target, have, allowed } = useTargets();
  const counts: Record<string, number> = {};
  for (const id of g.bag) counts[id] = (counts[id] ?? 0) + 1;
  const notes = [...new Set(g.bag)].map((id) => getRole(id)).filter((r) => r && setupNote(r));
  const disguised = [...new Set(g.bag)].filter((id) => DISGUISED[id]).map((id) => getRole(id)!);
  const byTeam = rolesByTeam(g.script.roles);
  // Characters kept out of games this small (the Fang Gu with 6 or fewer): greyed out, with the reason.
  const small = g.script.roles.filter((id) => tooFewFor(id, players));
  const tags = Object.fromEntries(small.map((id) => [id, `${MIN_PLAYERS[id]}+ players`]));

  const toggle = (id: string) => {
    const role = getRole(id);
    const why = tooFewFor(id, players);
    if (counts[id] && (!canDuplicate(role) || why)) st.removeFromBag(id);
    else if (why) ui.toast(why, 'info');
    else st.addToBag(id);
  };

  return (
    <div className="bag-fill">
      <div className="bag-summary">
        <div className="seat-count">
          <span className="eyebrow">Seats</span>
          <div className="stepper">
            <button className="btn small square" onClick={() => st.setSeatCount(Math.max(0, g.seats.length - 1))} aria-label="Remove a seat">
              <Icon name="minus" />
            </button>
            <b>{g.seats.length}</b>
            <button className="btn small square" onClick={() => st.setSeatCount(Math.min(20, g.seats.length + 1))} aria-label="Add a seat">
              <Icon name="plus" />
            </button>
          </div>
        </div>
        {target ? (
          CORE_TEAMS.map((team) => {
            const want = target[team as keyof typeof target];
            const got = have[team];
            const state = got === want ? 'ok' : got > want ? 'over' : 'under';
            return (
              <div key={team} className={`tally tally-${team} ${state}`}>
                <img src={genericIcon(team)} alt="" />
                <div>
                  <b>
                    {got}
                    <small> / {allowed(team).length > 1 ? allowed(team).join(' or ') : want}</small>
                  </b>
                  <span>{TEAM_LABEL[team]}</span>
                </div>
              </div>
            );
          })
        ) : (
          <p className="bag-warn">Blood on the Clocktower needs 5 to 20 players. You have {players} seats.</p>
        )}
        <div className="bag-actions">
          <button className="btn" onClick={() => randomBag()} disabled={!target}>
            <Icon name="dice" /> Random bag
          </button>
          <button className="btn quiet" onClick={() => st.setBag([])} disabled={!g.bag.length}>
            Empty
          </button>
        </div>
      </div>
      <SmallGame />
      {notes.length + disguised.length + small.length > 0 && (
        <div className="setup-notes">
          {small.map((id) => (
            <span key={id} className="setup-note">
              <Token roleId={id} label={false} /> <b>{getRole(id)?.name}</b> stays out of games with {MIN_PLAYERS[id] - 1} or fewer players, so
              it can’t go in the bag with {players}.
            </span>
          ))}
          {notes.map((r) => (
            <span key={r!.id} className="setup-note">
              <Token roleId={r!.id} label={false} /> <b>{r!.name}</b> {setupNote(r!)}
            </span>
          ))}
          {disguised.map((r) => (
            <span key={r.id} className="setup-note">
              <Token roleId={r.id} label={false} /> <b>{r.name}</b> goes out as a Townsfolk: whoever gets it is shown one that isn’t in play, and
              your grimoire shows that token with an “{DISGUISED[r.id]}” reminder.
            </span>
          ))}
        </div>
      )}
      <CharacterGrid
        ids={g.script.roles}
        counts={counts}
        onPick={toggle}
        onSecondary={st.removeFromBag}
        dimmed={new Set(small)}
        tags={tags}
        size={84}
        teams={['townsfolk', 'outsider', 'minion', 'demon']}
        teamExtra={(team) => (byTeam[team].length ? <TeamCount team={team} /> : null)}
      />
      <p className="bag-tip">
        Click a character to put it in the bag, and again to take it out.
        {g.script.roles.some((id) => canDuplicate(getRole(id))) && ' Characters that can appear more than once go in again on each click; right-click to remove one.'}
      </p>
    </div>
  );
}

function TeamCount({ team }: { team: Team }) {
  const { target, have } = useTargets();
  if (!target || !(team in target)) return null;
  const want = target[team as keyof typeof target];
  const got = have[team];
  return <em className={got === want ? 'ok' : got > want ? 'over' : 'under'}>{got === want ? '✓' : `${got} of ${want}`}</em>;
}

/** Fills the bag at random to the right counts, honouring setup characters like the Baron. */
export function randomBag() {
  const g = useHost.getState().g;
  const players = setupPlayers(g);
  const base = composition(players);
  if (!base) return;
  // Never anything kept out of a game this small (the Fang Gu with 6 or fewer).
  const byTeam = rolesByTeam(g.script.roles.filter((id) => !tooFewFor(id, players)));
  if (!byTeam.demon.length) ui.toast('This script has no Demon for a game this small, so the bag has none: choose one yourself.', 'info');
  for (let attempt = 0; attempt < 30; attempt++) {
    const bag: string[] = [];
    const demon = shuffle(byTeam.demon)[0];
    if (demon) bag.push(demon.id);
    bag.push(...shuffle(byTeam.minion).slice(0, base.minion).map((r) => r.id));
    // Where a bracket gives a choice (the Godfather's -1 or +1 Outsider), either way that the script can fill.
    const target = shuffle(compositionOptions(base, bag)).find((o) => o.outsider >= 0 && o.outsider <= byTeam.outsider.length);
    if (!target) continue;
    bag.push(...shuffle(byTeam.outsider).slice(0, target.outsider).map((r) => r.id));
    const t2 = adjustedComposition(base, bag, { outsider: target.outsider });
    bag.push(...shuffle(byTeam.townsfolk).slice(0, t2.townsfolk).map((r) => r.id));
    st.setBag(bag);
    return;
  }
}

/**
 * Characters in the bag, or handed out, that a game this small keeps out: until the first night (after that, a
 * Fang Gu's jump is part of the game).
 */
function smallGameBan(g: GameState): string[] {
  if (underway(g)) return [];
  const players = setupPlayers(g);
  return [...new Set([...g.bag, ...g.seats.map((s) => s.roleId)])].filter((id): id is string => Boolean(id && tooFewFor(id, players)));
}

/**
 * The seats went down after the bag was filled, and now it holds a character kept out of games this small (the Fang
 * Gu with 6 or fewer). Says so, and offers to swap it for another of its kind.
 */
function SmallGame() {
  const g = useHost((s) => s.g);
  const banned = smallGameBan(g);
  if (!banned.length) return null;
  const players = setupPlayers(g);
  return (
    <div className="bag-banned">
      {banned.map((id) => {
        const role = getRole(id);
        const who = g.seats.flatMap((s, i) => (s.roleId === id ? [s.name || `Seat ${i + 1}`] : []));
        return (
          <p key={id}>
            <Token roleId={id} label={false} />
            <span>
              <b>{role?.name}</b> is {who.length ? `with ${who.join(', ')}` : 'in the bag'}, but it stays out of games with {(MIN_PLAYERS[id] ?? 1) - 1}{' '}
              or fewer players, and there are only {players} now.
            </span>
            <button className="btn small" onClick={() => swapOut(id)}>
              <Icon name="shuffle" /> Swap for another {role ? TEAM_SINGULAR[role.team] : 'character'}
            </button>
          </p>
        );
      })}
    </div>
  );
}

/**
 * Swaps a character a small game keeps out for another of its team from the script, in the bag and on any seat
 * that has it. Its setup change goes with it (the Fang Gu's extra Outsider), so before anything is handed out,
 * Outsiders and Townsfolk in the bag are traded to put the counts right again (after, the tallies show it).
 */
function swapOut(id: string) {
  const g = useHost.getState().g;
  const players = setupPlayers(g);
  const role = getRole(id);
  if (!role) return;
  const byTeam = rolesByTeam(g.script.roles.filter((x) => !tooFewFor(x, players)));
  const next = shuffle(byTeam[role.team].map((r) => r.id).filter((x) => !g.bag.includes(x)))[0] ?? null;
  let bag = g.bag.filter((x) => x !== id);
  if (next) bag.push(next);
  const base = composition(players);
  if (base && !g.seats.some((s) => s.roleId)) {
    const count = (team: string) => bag.filter((x) => getRole(x)?.team === team).length;
    const target = adjustedComposition(base, bag, { outsider: count('outsider') });
    const unused = (team: 'townsfolk' | 'outsider') => shuffle(byTeam[team].map((r) => r.id).filter((x) => !bag.includes(x)));
    // Too many Outsiders now: one back for a Townsfolk, and the other way round.
    while (count('outsider') > target.outsider && unused('townsfolk').length) {
      const out = shuffle(bag.filter((x) => getRole(x)?.team === 'outsider'))[0];
      bag = [...bag.filter((x) => x !== out), unused('townsfolk')[0]];
    }
    while (count('outsider') < target.outsider && unused('outsider').length && count('townsfolk') > 0) {
      const tf = shuffle(bag.filter((x) => getRole(x)?.team === 'townsfolk'))[0];
      bag = [...bag.filter((x) => x !== tf), unused('outsider')[0]];
    }
  }
  st.setBag(bag);
  for (const s of g.seats) if (s.roleId === id) st.setRole(s.id, next);
  ui.toast(next ? `Swapped the ${role.name} for the ${getRole(next)?.name}.` : `Took the ${role.name} out. The script has nothing else to swap in.`, 'info');
}

function FillFooter({ onNext }: { onNext: () => void }) {
  const g = useHost((s) => s.g);
  const { players } = useTargets();
  const diff = g.bag.length - players;
  return (
    <>
      <span className="foot-note">
        {g.bag.length} in the bag
        {diff !== 0 && players > 0 && <em> · {diff > 0 ? `${diff} more than` : `${-diff} fewer than`} the seats</em>}
      </span>
      <button className="btn primary" onClick={onNext} disabled={!g.bag.length}>
        Hand them out <Icon name="chevronRight" />
      </button>
    </>
  );
}

function Deal() {
  const g = useHost((s) => s.g);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFor, setShowFor] = useState<string | null>(null);
  const seats = g.seats;
  const assigned = seats.map((s) => s.roleId).filter(Boolean) as string[];

  // What's still in the bag, counting duplicates.
  const tray = useMemo(() => {
    const left = [...g.bag];
    for (const id of assigned) {
      const i = left.indexOf(id);
      if (i >= 0) left.splice(i, 1);
    }
    return left;
  }, [g.bag, assigned]);

  const clickSeat = (id: string) => {
    if (!selected) setSelected(id);
    else if (selected === id) setSelected(null);
    else {
      st.swapRoles(selected, id);
      setSelected(null);
    }
  };
  const clickTray = (roleId: string) => {
    const target = selected ?? seats.find((s) => !s.roleId)?.id;
    if (!target) return;
    const why = tooFewFor(roleId, setupPlayers(g));
    if (why) return ui.toast(why, 'info');
    st.setRole(target, roleId);
    setSelected(null);
  };

  const inPlay = new Set(assigned);
  const byTeam = rolesByTeam(g.script.roles);

  return (
    <div className="deal">
      <SmallGame />
      <div className="deal-bar">
        <button className="btn" onClick={() => (st.dealRandom(), setSelected(null))} disabled={!g.bag.length || smallGameBan(g).length > 0}>
          <Icon name="shuffle" /> Deal at random
        </button>
        <button className="btn quiet" onClick={() => (st.clearRoles(), setSelected(null))} disabled={!assigned.length}>
          Take them all back
        </button>
        <span className="deal-help">
          {selected
            ? 'Now click another seat to swap, or a token from the bag to give it to them.'
            : 'Click two seats to swap their characters. Click a seat, then a token in the bag, to choose for them.'}
        </span>
      </div>

      <div className="deal-seats">
        {seats.map((s, i) => {
          const role = getRole(s.roleId);
          const needsShown = s.roleId && NEEDS_SHOWN.has(s.roleId);
          const shown = getRole(s.shownRoleId);
          // The Drunk's player holds a Townsfolk token: shown as that, with the Drunk reminder on it.
          const secret = disguise(s);
          const disguisedSeat = Boolean(s.roleId && DISGUISED[s.roleId]);
          return (
            <div key={s.id} className={`deal-seat ${selected === s.id ? 'on' : ''} ${!role ? 'empty' : ''}`}>
              <button className="deal-token" onClick={() => clickSeat(s.id)} aria-label={`Seat ${i + 1}`}>
                <Token roleId={heldRole(s)} blank="empty" />
                {secret && (
                  <span className="deal-secret">
                    <ReminderToken roleId={s.roleId!} text={secret} />
                  </span>
                )}
              </button>
              <div className="deal-who">
                <strong>{s.name || `Seat ${i + 1}`}</strong>
                <span>{!role ? 'No character' : disguisedSeat ? (shown ? `${shown.name}, secretly the ${role.name}` : `The ${role.name}: choose their Townsfolk`) : role.name}</span>
              </div>
              {needsShown && disguisedSeat && (
                <button className={`deal-shown ${showFor === s.id ? 'open' : ''}`} onClick={() => setShowFor(showFor === s.id ? null : s.id)} title="Which character they're shown, and think they are">
                  <span>their token</span>
                  <em>{shown ? 'Change' : 'Choose'}</em>
                </button>
              )}
              {needsShown && !disguisedSeat && (
                <button className={`deal-shown ${showFor === s.id ? 'open' : ''}`} onClick={() => setShowFor(showFor === s.id ? null : s.id)}>
                  <span>thinks they are</span>
                  <Token roleId={s.shownRoleId} blank="empty" label={false} />
                  <em>{shown?.name ?? 'Choose'}</em>
                </button>
              )}
              {s.roleId && (
                <button className="deal-clear" title="Put back in the bag" onClick={() => st.setRole(s.id, null)}>
                  <Icon name="x" />
                </button>
              )}
              {showFor === s.id && (
                <div className="deal-shown-pick">
                  {(s.roleId === 'lunatic' ? byTeam.demon : s.roleId === 'marionette' ? [...byTeam.townsfolk, ...byTeam.outsider] : byTeam.townsfolk).map((r) => (
                    <button
                      key={r.id}
                      className={`mini ${inPlay.has(r.id) ? 'dim' : ''} ${s.shownRoleId === r.id ? 'on' : ''}`}
                      title={`${r.name}${inPlay.has(r.id) ? ' (in play)' : ''}`}
                      onClick={() => {
                        st.setShownRole(s.id, r.id);
                        setShowFor(null);
                      }}
                    >
                      <Token roleId={r.id} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="tray">
        <span className="eyebrow">Still in the bag</span>
        <div className="tray-list">
          {tray.length ? (
            tray.map((id, i) => (
              <button key={`${id}${i}`} className="tray-token" onClick={() => clickTray(id)} title={getRole(id)?.name}>
                <Token roleId={id} />
              </button>
            ))
          ) : (
            <span className="tray-empty">Empty. Every character is in a seat.</span>
          )}
        </div>
      </div>
    </div>
  );
}

function DealFooter() {
  const g = useHost((s) => s.g);
  const missing = g.seats.filter((s) => !s.roleId).length;
  const needShown = g.seats.filter((s) => s.roleId && NEEDS_SHOWN.has(s.roleId) && !s.shownRoleId).length;
  const claimed = g.seats.filter((s) => s.playerId).length;
  return (
    <>
      <span className="foot-note">
        {missing ? `${missing} ${missing === 1 ? 'seat has' : 'seats have'} no character. ` : ''}
        {needShown ? 'Choose what the Drunk (or similar) thinks they are. ' : ''}
        {g.revealed ? 'Players can see their characters. Changes show up for them straight away.' : `${claimed} of ${g.seats.length} seats have a player.`}
      </span>
      {g.revealed ? (
        <button className="btn" onClick={() => st.reveal(false)}>
          <Icon name="eyeOff" /> Hide from players
        </button>
      ) : (
        <button
          className="btn primary"
          disabled={g.seats.every((s) => !s.roleId)}
          onClick={() => {
            st.reveal(true);
            ui.close();
            ui.toast('Characters handed out. Each player can now see their own.', 'good');
          }}
        >
          <Icon name="reveal" /> Show players their characters
        </button>
      )}
    </>
  );
}
