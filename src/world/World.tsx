import { debugHooks } from '../lib/util';
import { useContext, useEffect, useMemo, useRef } from 'react';
import { game, useHud } from '../game/hud';
import { local, receiveItem, reportPoseWith } from '../game/local';
import { ambience } from '../lib/ambience';
import { presence } from '../game/presence';
import { clientLink, player } from '../net/client';
import { hostLink } from '../net/host';
import { st, townAction, useHost } from '../state/host';
import { useUI } from '../state/ui';
import { useJoin } from '../components/town/JoinFlow';
import { ViewContext, type View } from '../state/view';
import { voice } from '../voice/voice';
import { Engine, type WorldView } from './engine';
import { emptyTown } from './types';

function lastWakeOf(g: { wakes: { id: string; to: string[] }[] }) {
  const w = g.wakes[g.wakes.length - 1];
  return w ? { id: w.id, to: w.to } : null;
}

function toWorldView(view: View | null, mode: 'st' | 'player' | 'preview', paused: boolean, reading: boolean): WorldView {
  const me = view?.seats.find((s) => s.isMe);
  const dim = mode === 'player' && (!me?.look || useJoin.getState().reopen);
  if (!view) {
    return {
      mode: 'preview',
      joined: false,
      mySeatId: null,
      phase: 'day',
      started: false,
      seats: [],
      nomination: null,
      marked: null,
      townHall: null,
      execution: null,
      weather: 'clear',
      dayTimer: null,
      town: emptyTown(),
      paused: true,
      reading: false,
      dim: true,
      lastWake: null,
      slayer: [],
      ended: null,
    };
  }
  return {
    mode,
    joined: mode === 'st' || Boolean(me?.look),
    mySeatId: view.mySeatId,
    phase: view.phase,
    started: view.phase === 'night' || view.day > 0,
    seats: view.seats.map((s) => ({
      id: s.id,
      name: s.label,
      look: s.look,
      dead: s.dead,
      // Characters float over heads for the Storyteller, and for everyone once the grimoire is revealed.
      roleId: mode === 'st' || view.grimoireRevealed ? s.roleId : null,
      evil: s.alignment === 'evil',
      star: s.star,
    })),
    nomination: view.nomination,
    marked: view.marked,
    townHall: view.townHall,
    execution: view.execution,
    weather: view.weather,
    dayTimer: view.dayTimer,
    town: view.town,
    paused,
    reading,
    dim,
    lastWake: mode === 'st' ? lastWakeOf(useHost.getState().g) : null,
    slayer: view.slayer,
    ended: view.ended,
  };
}

/** The 3D town, filling the screen behind everything else. */
export function World({ mode }: { mode: 'st' | 'player' | 'preview' }) {
  const ref = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);
  const view = useContext(ViewContext);
  const modal = useUI((s) => s.modal);
  const grimoire = useUI((s) => s.grimoireOpen);
  const paused = Boolean(modal) || grimoire;
  const reading = mode === 'st' && grimoire;
  const reopen = useJoin((s) => s.reopen);
  const wv = useMemo(() => toWorldView(view, mode, paused, reading), [view, mode, paused, reading, reopen]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    try {
      engine.current = new Engine(el, {
        townAction: (a) => {
          if (mode === 'st') {
            const item = townAction('The Storyteller', a);
            if (item) receiveItem(item, null);
          } else player.town(a);
        },
        give: (to, item) => {
          if (mode === 'st') hostLink.giveFromStoryteller(to, item);
          else player.give(to, item);
        },
      });
      if (debugHooks()) Object.assign(window, { __engine: engine.current, __local: local, __presence: presence, __hud: useHud, __game: game, __st: { st }, __ambience: ambience });
    } catch (e) {
      console.error(e);
      useHud.setState({ failed: e instanceof Error ? e.message : String(e) });
    }
    return () => {
      engine.current?.dispose();
      engine.current = null;
    };
  }, [mode]);

  useEffect(() => {
    engine.current?.setView(wv);
  }, [wv]);

  // Players report where they are; the Storyteller's own position goes out with everyone else's.
  const joined = wv.joined && mode === 'player';
  useEffect(() => {
    reportPoseWith(joined ? player.pose : null);
    return () => reportPoseWith(null);
  }, [joined]);

  // Voice rides on the same lobby connection as the game, which opens (and reopens) on its own schedule.
  useEffect(() => {
    if (mode === 'preview') return;
    const attach = () => voice.attach(mode === 'st' ? hostLink.peerRef : clientLink.peerRef);
    attach();
    const t = setInterval(attach, 1500);
    return () => clearInterval(t);
  }, [mode]);

  return <div className="world" ref={ref} />;
}
