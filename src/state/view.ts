import { createContext, useContext, useMemo } from 'react';
import { defaultAlignment, getRole, type Alignment, type Script } from '../data';
import { useClient } from '../net/client';
import { useHostNet } from '../net/host';
import { isTraveller, seatAlignment, useHost, visitFor } from './host';
import type { AwakeState, DayTimer, DeathRecord, Execution, GameEnd, LetterIn, Nomination, Phase, Reminder, SlayerShot, TownHall, Visit, VoteRecord } from './types';
import type { Look, TownState, Weather } from '../world/types';
import { useUI } from './ui';

export type Mode = 'st' | 'player';
export const ModeContext = createContext<Mode>('player');
export const useMode = () => useContext(ModeContext);

export interface SeatView {
  id: string;
  index: number;
  name: string;
  label: string;
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
}

const label = (name: string, i: number) => name || `Seat ${i + 1}`;

export function useStorytellerView(): View {
  const g = useHost((s) => s.g);
  const online = useHostNet((s) => s.online);
  const slow = useHostNet((s) => s.slow);
  const hide = useUI((s) => s.hideGrimoire) && !g.ended;
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
        label: label(s.name, i),
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
    }),
    [g, online, slow, hide],
  );
}

export function usePlayerView(): View | null {
  const pub = useClient((s) => s.pub);
  const priv = useClient((s) => s.priv);
  const clockOffset = useClient((s) => s.clockOffset);
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
          label: label(s.name, i),
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
      nomination: pub.nomination,
      marked: pub.marked,
      history: pub.history,
      townHall: pub.townHall ?? null,
      execution: pub.execution ?? null,
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
    };
  }, [pub, priv, clockOffset]);
}

export const ViewContext = createContext<View | null>(null);
export function useView(): View {
  const v = useContext(ViewContext);
  if (!v) throw new Error('No view');
  return v;
}
