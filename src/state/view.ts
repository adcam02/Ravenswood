import { createContext, useContext, useMemo } from 'react';
import { defaultAlignment, getRole, type Alignment, type Script } from '../data';
import { useClient } from '../net/client';
import { useHostNet } from '../net/host';
import { isTraveller, seatAlignment, useHost, visitFor } from './host';
import type { AwakeState, DawnReel, DayTimer, DeathRecord, Execution, GameEnd, LetterIn, Nomination, NominationRequest, Phase, Reminder, SlayerShot, TownHall, Visit, VoteRecord, PitState } from './types';
import type { Look, TownState, Weather } from '../world/types';
import { nickFor, useNicks } from './nicks';
import { SONGS } from '../lib/disco';
import { useUI } from './ui';
import { pitPublic } from '../game/pitRules';

export type Mode = 'st' | 'player';
export const ModeContext = createContext<Mode>('player');
export const useMode = () => useContext(ModeContext);

export interface SeatView {
  id: string;
  index: number;
  /** Their real name, as everyone else sees it (and the host keeps). */
  name: string;
  /** What this viewer calls them: the nickname they gave them (see `nicks.ts`), else their name, else "Seat 3". */
  label: string;
  /** The nickname this viewer gave them, if any (only ever on this screen). */
  nick: string | null;
  claimed: boolean;
  connected: boolean;
  /** Storyteller only: their line is slow, this many milliseconds there and back (null when it's fine). */
  slow: number | null;
  dead: boolean;
  ghostVote: boolean;
  /** The character this viewer can see on the token. */
  roleId: string | null;
  /** Storyteller only: what the player believes they are, when it differs. */
  shownRoleId: string | null;
  alignment: Alignment | null;
  reminders: Reminder[];
  isMe: boolean;
  awake: AwakeState | null;
  traveller: boolean;
  /** Storyteller only: killed tonight, so players won't see it until day. */
  diesAtDawn: boolean;
  look: Look | null;
  /** Wearing a gold star today, for counting the sheep right last night. */
  star: boolean;
  /** Letters are waiting in their letterbox. */
  mail: boolean;
}

export interface View {
  mode: Mode;
  room: string;
  phase: Phase;
  day: number;
  script: Script;
  seats: SeatView[];
  fabled: string[];
  nomination: Nomination | null;
  marked: { seatId: string; votes: number } | null;
  history: VoteRecord[];
  /** Requests to nominate today: every one for the Storyteller, a player's own for them. */
  nomRequests: NominationRequest[];
  townHall: TownHall | null;
  execution: Execution | null;
  weather: Weather;
  /** The day's countdown, in this browser's own clock. */
  dayTimer: DayTimer | null;
  town: TownState;
  revealed: boolean;
  grimoireRevealed: boolean;
  mySeatId: string | null;
  /** Slayer claims this game (the Storyteller also sees which were the real Slayer). */
  slayer: SlayerShot[];
  /** The game is over. */
  ended: GameEnd | null;
  /** Every death this game (players get these once it's over). */
  deaths: DeathRecord[];
  /** Player: the letters that have arrived for them. */
  letters: LetterIn[];
  /** Hooded-figure visits tonight: the player's own, if they've been killed; every one, for the Storyteller. */
  visits: Visit[];
  /** Messenger pigeons in the air lately, and whose shoulder each is for (in this browser's clock). */
  pigeons: { id: string; to: string; at: number }[];
  /** Player: the pigeons that came for them, with who sent each and where they were. */
  pigeonNotes: { id: string; name: string; where: string; at: number }[];
  /** The pet pit in the tavern's cellar (times in this browser's clock), or null before it's opened. */
  pit: PitState | null;
  /** The song on at the club, since when (in this browser's clock), and who put it on ('' for nobody yet). */
  club: { song: string; at: number; by: string };
  /** This morning's replay of the night's deaths (in this browser's clock). */
  dawn: DawnReel | null;
}

/** The pit with its times moved onto this browser's clock. */
function pitHere(p: PitState | undefined, offset: number): PitState | null {
  if (!p) return null;
  return {
    fight: p.fight && { ...p.fight, until: p.fight.until - offset, at: p.fight.at - offset },
    challenges: p.challenges.map((c) => ({ ...c, at: c.at - offset })),
    board: p.board,
  };
}

const label = (name: string, i: number, nicks: Record<string, string>) => nickFor(name, nicks) ?? (name || `Seat ${i + 1}`);

/** An execution's times (the vote closing, the wheel's draw) in this browser's own clock. */
const localExecution = (ex: Execution, offset: number): Execution => ({
  ...ex,
  at: ex.at - offset,
  vote: ex.vote && { ...ex.vote, until: ex.vote.until - offset },
  drawn: ex.drawn && { ...ex.drawn, at: ex.drawn.at - offset },
});

/** The club's song, in this browser's clock (`offset` is the host's clock less ours). */
const clubOf = (town: TownState, offset: number) => ({ song: town.club?.song ?? SONGS[0].id, at: (town.club?.at ?? 0) - offset, by: town.club?.by ?? '' });

export function useStorytellerView(): View {
  const g = useHost((s) => s.g);
  const online = useHostNet((s) => s.online);
  const slow = useHostNet((s) => s.slow);
  const hide = useUI((s) => s.hideGrimoire) && !g.ended;
  const nicks = useNicks();
  return useMemo(
    () => ({
      mode: 'st',
      room: g.room,
      phase: g.phase,
      day: g.day,
      script: g.script,
      seats: g.seats.map((s, i) => ({
        id: s.id,
        index: i,
        name: s.name,
        label: label(s.name, i, nicks),
        nick: nickFor(s.name, nicks),
        claimed: Boolean(s.playerId),
        connected: Boolean(s.playerId && online[s.playerId]),
        slow: (s.playerId && online[s.playerId] && slow[s.playerId]) || null,
        dead: s.dead,
        ghostVote: s.ghostVote,
        roleId: hide && !isTraveller(s.roleId) ? null : s.roleId,
        shownRoleId: hide ? null : s.shownRoleId,
        alignment: hide ? null : seatAlignment(s),
        reminders: hide ? [] : s.reminders,
        isMe: false,
        awake: g.awake[s.id] ?? null,
        traveller: isTraveller(s.roleId),
        diesAtDawn: g.phase === 'night' && g.nightDeaths.includes(s.id),
        look: s.look,
        star: s.star != null && s.star === g.day,
        mail: (g.letters ?? []).some((l) => l.to === s.id && l.night > g.day),
      })),
      fabled: g.fabled,
      nomination: g.nomination,
      marked: g.marked,
      history: g.history,
      nomRequests: (g.nomRequests ?? []).filter((r) => r.day === g.day),
      townHall: g.townHall,
      execution: g.execution,
      weather: g.weather ?? 'clear',
      dayTimer: g.dayTimer ?? null,
      town: g.town,
      revealed: g.revealed,
      grimoireRevealed: g.grimoireRevealed,
      mySeatId: null,
      slayer: g.slayer,
      ended: g.ended,
      deaths: g.deaths,
      letters: [],
      visits: g.nightDeaths.map((id) => visitFor(g, id)).filter((x): x is Visit => Boolean(x)),
      pigeons: (g.pigeons ?? []).filter((p) => Date.now() - p.at < 60000).map(({ id, to, at }) => ({ id, to, at })),
      pigeonNotes: [],
      pit: pitHere(g.pit && pitPublic(g.pit), 0),
      club: clubOf(g.town, 0),
      dawn: g.dawn ?? null,
    }),
    [g, online, slow, hide, nicks],
  );
}

export function usePlayerView(): View | null {
  const pub = useClient((s) => s.pub);
  const priv = useClient((s) => s.priv);
  const clockOffset = useClient((s) => s.clockOffset);
  const nicks = useNicks();
  return useMemo(() => {
    if (!pub) return null;
    return {
      mode: 'player',
      room: pub.room,
      phase: pub.phase,
      day: pub.day,
      script: pub.script,
      seats: pub.seats.map((s, i) => {
        // A player's own seat shows what they were told, until the grimoire is revealed and shows the truth
        // (the Drunk, the Lunatic and the Marionette find out at the end).
        const mine = priv?.seatId === s.id && !pub.grimoireRevealed;
        const isMe = priv?.seatId === s.id;
        const roleId = mine && priv?.roleId ? priv.roleId : s.roleId;
        return {
          id: s.id,
          index: i,
          name: s.name,
          label: label(s.name, i, nicks),
          nick: nickFor(s.name, nicks),
          claimed: s.claimed,
          connected: s.connected,
          slow: null,
          dead: s.dead,
          ghostVote: s.ghostVote,
          roleId,
          shownRoleId: s.shownRoleId ?? null,
          alignment: mine && priv?.roleId ? priv.alignment : s.alignment ?? defaultAlignment(getRole(roleId)?.team),
          reminders: [],
          isMe,
          awake: null,
          traveller: isTraveller(s.roleId),
          diesAtDawn: false,
          look: s.look ?? null,
          star: s.star != null && s.star === pub.day,
          mail: Boolean(s.mail),
        };
      }),
      fabled: pub.fabled,
      // (Whoever has the floor before the vote, until when in this browser's clock.)
      nomination: pub.nomination?.speech
        ? { ...pub.nomination, speech: { ...pub.nomination.speech, until: pub.nomination.speech.until - (clockOffset ?? 0) } }
        : pub.nomination,
      marked: pub.marked,
      history: pub.history,
      nomRequests: Array.isArray(priv?.nomRequests) ? priv.nomRequests : [],
      townHall: pub.townHall ?? null,
      execution: pub.execution ? localExecution(pub.execution, clockOffset ?? 0) : null,
      weather: pub.weather ?? 'clear',
      dayTimer: pub.dayTimer ? { ...pub.dayTimer, start: pub.dayTimer.start - (clockOffset ?? 0), end: pub.dayTimer.end - (clockOffset ?? 0) } : null,
      town: pub.town,
      revealed: pub.revealed,
      grimoireRevealed: pub.grimoireRevealed,
      mySeatId: priv?.seatId ?? null,
      slayer: pub.slayer ?? [],
      ended: pub.ended ?? null,
      deaths: pub.deaths ?? [],
      letters: Array.isArray(priv?.letters) ? priv.letters : [],
      visits: priv?.visit ? [priv.visit] : [],
      pigeons: (Array.isArray(pub.pigeons) ? pub.pigeons : []).map((p) => ({ ...p, at: p.at - (clockOffset ?? 0) })),
      pigeonNotes: (Array.isArray(priv?.pigeons) ? priv.pigeons : []).map((p) => ({ ...p, at: p.at - (clockOffset ?? 0) })),
      pit: pitHere(pub.pit, clockOffset ?? 0),
      club: clubOf(pub.town, clockOffset ?? 0),
      dawn: pub.dawn ? { ...pub.dawn, at: pub.dawn.at - (clockOffset ?? 0) } : null,
    };
  }, [pub, priv, clockOffset, nicks]);
}

export const ViewContext = createContext<View | null>(null);
export function useView(): View {
  const v = useContext(ViewContext);
  if (!v) throw new Error('No view');
  return v;
}
