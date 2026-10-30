import { Suspense, useContext, useEffect, useRef, useState } from 'react';
import { TopBar } from './components/TopBar';
import { SidePanel } from './components/SidePanel';
import { CrashNote, Guard } from './components/Guard';
import { lazyPart } from './lib/lazy';
// The grimoire and the big dialogs load when first opened, so the first visit downloads less.
const Square = lazyPart(() => import('./components/Square').then((m) => m.Square));
const ModalsLazy = lazyPart(() => import('./components/Modals').then((m) => m.Modals));
function Modals() {
  const modal = useUI((s) => s.modal);
  if (!modal) return null;
  return (
    <Guard
      fallback={(e) => (
        <div className="modal-backdrop">
          <CrashNote error={e} close={() => useUI.setState({ modal: null })} />
        </div>
      )}
    >
      <Suspense fallback={null}>
        <ModalsLazy />
      </Suspense>
    </Guard>
  );
}
// The casino's tables and the pet pit's panel only matter once you're there.
const CasinoLazy = lazyPart(() => import('./components/town/Casino').then((m) => m.CasinoPanels));
const PitLazy = lazyPart(() => import('./components/town/PitFight').then((m) => m.PitPanel));

/** A part that's still on its way (a slow line, before the quiet preload has got to it): a small note meanwhile. */
function OnItsWay() {
  return (
    <div className="part-wait cosy-panel" role="status">
      <div className="spinner" />
      <span>Just a moment…</span>
    </div>
  );
}

function CasinoPanels() {
  const at = useHud((s) => s.casino);
  if (!at) return null;
  return (
    <Guard fallback={(e) => <CrashNote error={e} close={() => useHud.setState({ casino: null })} />}>
      <Suspense fallback={<OnItsWay />}>
        <CasinoLazy />
      </Suspense>
    </Guard>
  );
}

function PitPanel() {
  const [here, setHere] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setHere(zoneKind(local.zone) === 'cellar'), 300);
    return () => clearInterval(t);
  }, []);
  if (!here) return null;
  return (
    <Guard fallback={() => null}>
      <Suspense fallback={null}>
        <PitLazy />
      </Suspense>
    </Guard>
  );
}
import { Toasts } from './components/Toasts';
import { BluffBar } from './components/BluffBar';
import { PickBanner } from './components/PickBanner';
import { SlayerPrompt } from './components/Slayer';
import { NominateDock, NominationPrompt } from './components/Nominate';
import { NightGuide } from './components/NightGuide';
import { AutoNightPanel } from './components/AutoNight';
import { NightVeil } from './components/NightVeil';
import { GameOverLayer, WinPrompt } from './components/GameOver';
import { MeetingVotes, MyCharacter, PlayerRail, VoteBar } from './components/PlayerBits';
import { WakeOverlay } from './components/WakeOverlay';
import { DayClock, ProgressWatcher, SceneBar } from './components/town/Scenes';
import { ExecVote } from './components/town/ExecVote';
import { DawnReel } from './components/town/DawnReel';
import { WorldSeatMenu } from './components/town/WorldSeatMenu';
import { UpdateNotice } from './components/UpdateNotice';
import { Landing } from './components/Landing';
import { JoinFlow } from './components/town/JoinFlow';
import { DoorPrompt, RestorePrompt } from './components/ProfilePrompts';
import { FlatsPanels } from './components/town/Flats';
import {
  ActionPrompt,
  Announce,
  BellCall,
  EmoteBar,
  Fade,
  GiftNotice,
  HandSlot,
  HelpCard,
  HomeMusic,
  JobLayer,
  MeetingSeat,
  NoticeBoard,
  PlaceChip,
  SheepLayer,
  BedGamesLayer,
  VisitCard,
  VoiceDock,
  WorldFailed,
  GraphicsLost,
} from './components/town/Hud';
import { useEffects } from './lib/effects';
import { clientLink, useClient } from './net/client';
import { hostLink } from './net/host';
import { notes } from './state/notes';
import { voice } from './voice/voice';
import { useUI } from './state/ui';
import { ModeContext, usePlayerView, useStorytellerView, ViewContext } from './state/view';
import { Icon } from './components/Icon';
import { BedLetters } from './components/Letters';
import { PigeonNote } from './components/Pigeon';
import { SpeechBanner } from './components/Speech';
import { World } from './world/World';
import { MiniGrimoire } from './components/town/MiniGrimoire';
import { MiniMap } from './components/town/MiniMap';
import { useHud } from './game/hud';
import { local } from './game/local';
import { zoneKind } from './world/types';

type Route = { kind: 'landing' } | { kind: 'st' } | { kind: 'player'; room: string };

function readRoute(): Route {
  const p = new URLSearchParams(location.search);
  const room = (p.get('room') ?? p.get('join') ?? '').trim().toUpperCase();
  if (room) return { kind: 'player', room };
  if (p.has('st')) return { kind: 'st' };
  return { kind: 'landing' };
}

export function go(route: Route) {
  const p = new URLSearchParams(location.search);
  p.delete('room');
  p.delete('join');
  p.delete('st');
  if (route.kind === 'player') p.set('room', route.room);
  if (route.kind === 'st') p.set('st', '');
  const q = p.toString().replace(/st=(&|$)/, 'st$1');
  history.pushState(null, '', `${location.pathname}${q ? `?${q}` : ''}`);
  window.dispatchEvent(new Event('popstate'));
}

export function App() {
  const [route, setRoute] = useState<Route>(readRoute);
  useEffect(() => {
    const on = () => setRoute(readRoute());
    window.addEventListener('popstate', on);
    return () => window.removeEventListener('popstate', on);
  }, []);
  if (route.kind === 'st') return <Storyteller />;
  if (route.kind === 'player') return <Player room={route.room} />;
  return <Landing />;
}

function Shell({ children }: { children: React.ReactNode }) {
  const panel = useUI((s) => s.panel);
  const grimoire = useUI((s) => s.grimoireOpen);
  const mode = useContext(ModeContext);
  // (A player's old Votes panel stays shut: the votes are on the noticeboard now.)
  const open = panel && !(mode === 'player' && panel === 'history');
  return <div className={`app mode-${mode} ${open ? 'has-panel' : ''} ${grimoire ? 'grimoire-open' : ''}`}>{children}</div>;
}

function Storyteller() {
  const view = useStorytellerView();
  const grimoire = useUI((s) => s.grimoireOpen);
  const pick = useUI((s) => s.pick);
  // The pages appear once the camera has swooped in to the book; they vanish the moment it closes.
  const [pages, setPages] = useState(false);
  useEffect(() => {
    if (!grimoire) return setPages(false);
    const t = setTimeout(() => setPages(true), 620);
    return () => clearTimeout(t);
  }, [grimoire]);
  useEffect(() => {
    hostLink.start(view.room);
    document.title = `Room ${view.room} · Ravenswood`;
  }, [view.room]);
  useEffects(view);
  // Picking a seat (a nominee, a swap) happens on the grimoire, so open it.
  useEffect(() => {
    if (pick) useUI.setState({ grimoireOpen: true });
  }, [pick]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || e.ctrlKey || e.altKey || e.metaKey || useUI.getState().modal) return;
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) return;
      e.preventDefault();
      useUI.setState((s) => ({ grimoireOpen: !s.grimoireOpen }));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <ModeContext.Provider value="st">
      <ViewContext.Provider value={view}>
        <Shell>
          <World mode="st" />
          <TopBar />
          {grimoire ? (
            pages && (
              <div className="grimoire-layer book">
                <Guard fallback={(e) => <CrashNote error={e} close={() => useUI.setState({ grimoireOpen: false })} />}>
                  <Suspense fallback={null}>
                    <Square />
                  </Suspense>
                </Guard>
                <BluffBar />
              </div>
            )
          ) : (
            <>
              <PlaceChip />
              <MiniMap />
              <VoiceDock />
              <ActionPrompt />
              <HandSlot />
              <div className="st-bottom">
                <Announce />
                <EmoteBar />
              </div>
              <MiniGrimoire />
              <SceneBar />
              <DayClock />
              <WorldSeatMenu />
              <JobLayer />
              <NoticeBoard />
              <PitPanel />
              <CasinoPanels />
              <FlatsPanels />
            </>
          )}
          <SidePanel />
          <PickBanner />
          <NightGuide />
          <AutoNightPanel />
          <SlayerPrompt />
          <NominationPrompt />
          <SpeechBanner />
          <DoorPrompt />
          <RestorePrompt />
          <ExecVote />
          <DawnReel />
          <WinPrompt />
          <GameOverLayer />
          <Modals />
          <GiftNotice />
          <Fade />
          <WorldFailed />
          <GraphicsLost />
          <UpdateNotice />
          <Toasts />
        </Shell>
      </ViewContext.Provider>
    </ModeContext.Provider>
  );
}

function Player({ room }: { room: string }) {
  useEffect(() => {
    notes.load(room);
    clientLink.start(room);
    document.title = `Room ${room} · Ravenswood`;
  }, [room]);
  const view = usePlayerView();
  const status = useClient((s) => s.status);
  // (Our own seat comes just after the town: until it has, someone back again would see the join screen flash up.)
  const known = useClient((s) => s.priv !== null);
  const me = view?.seats.find((s) => s.isMe);
  const joining = !me || !me.look;
  // Back from a refresh already seated, so straight into town: the mic comes back on by itself.
  const arrived = useRef(false);
  useEffect(() => {
    if (!view || !known || arrived.current) return;
    arrived.current = true;
    if (!joining) void voice.resume();
  }, [view, known, joining]);
  useEffects(view);
  if (!view || !known) {
    return (
      <div className="app">
        <World mode="preview" />
        <div className="connecting cosy">
          <div className="connecting-card cosy-panel">
            <div className="spinner" />
            <h1>Room {room}</h1>
            <p>
              {status === 'waiting'
                ? 'The Storyteller hasn’t opened this room yet. It will appear as soon as they do.'
                : status === 'reconnecting'
                  ? 'Having trouble reaching the lobby. Still trying…'
                  : 'Finding the Storyteller…'}
            </p>
            <button className="cosy-btn small" onClick={() => (location.href = location.pathname)}>
              <Icon name="chevronLeft" /> Use a different code
            </button>
          </div>
        </div>
        <WorldFailed />
        <GraphicsLost />
      </div>
    );
  }
  return (
    <ModeContext.Provider value="player">
      <ViewContext.Provider value={view}>
        <Shell>
          <World mode="player" />
          {joining ? (
            <JoinFlow room={room} current={me ? { name: me.name, look: me.look } : null} />
          ) : (
            <>
              <PlaceChip />
              <MiniMap />
              <VoiceDock />
              <MyCharacter />
              <PlayerRail />
              <SidePanel />
              <BellCall />
              <VoteBar />
              <SpeechBanner />
              <MeetingVotes />
              <MeetingSeat />
              <NominateDock />
              <ActionPrompt />
              <div className="player-bottom">
                <HandSlot />
                <EmoteBar />
              </div>
              <JobLayer />
              <SheepLayer />
              <BedGamesLayer />
              <BedLetters />
              <VisitCard />
              <PigeonNote />
              <ExecVote />
              <DawnReel />
              <DayClock />
              <PitPanel />
              <ProgressWatcher />
              <NoticeBoard />
              <CasinoPanels />
              <FlatsPanels />
              <HelpCard />
              <Modals />
              <WakeOverlay />
              <NightVeil />
              <GiftNotice />
              <HomeMusic />
              <GameOverLayer />
            </>
          )}
          <Fade />
          <WorldFailed />
          <GraphicsLost />
          <UpdateNotice />
          <Toasts />
        </Shell>
      </ViewContext.Provider>
    </ModeContext.Provider>
  );
}
