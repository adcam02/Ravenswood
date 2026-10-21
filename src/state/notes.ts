import { create } from 'zustand';
import { loadJSON, saveJSON } from '../lib/util';

/** What a player has noted about one other seat: the character they claim, and the one you think they really are. */
export interface SeatNote {
  claim?: string;
  guess?: string;
}

export type NoteKind = keyof SeatNote;

/** A player's private notes about other seats. They never leave this browser. */
interface Notes {
  room: string;
  notes: Record<string, SeatNote>;
}

export const useNotes = create<Notes>(() => ({ room: '', notes: {} }));

const keyFor = (room: string) => `ravenswood:notes:${room}`;

export const notes = {
  load(room: string) {
    // Notes saved before claims existed were just a guess per seat.
    const raw = loadJSON<Record<string, string | SeatNote>>(keyFor(room), {});
    const loaded = Object.fromEntries(Object.entries(raw).map(([seatId, n]) => [seatId, typeof n === 'string' ? { guess: n } : n]));
    useNotes.setState({ room, notes: loaded });
  },
  set(seatId: string, kind: NoteKind, roleId: string | null) {
    const { room, notes: cur } = useNotes.getState();
    const note = { ...cur[seatId] };
    if (roleId) note[kind] = roleId;
    else delete note[kind];
    const next = { ...cur };
    if (note.claim || note.guess) next[seatId] = note;
    else delete next[seatId];
    useNotes.setState({ notes: next });
    saveJSON(keyFor(room), next);
  },
  clear() {
    const { room } = useNotes.getState();
    useNotes.setState({ notes: {} });
    saveJSON(keyFor(room), {});
  },
};
