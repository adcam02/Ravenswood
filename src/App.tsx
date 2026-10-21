import { Suspense, useContext, useEffect, useState } from 'react';
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
import { Toasts } from './components/Toasts';
import { BluffBar } from './components/BluffBar';
import { PickBanner } from './components/PickBanner';
import { SlayerPrompt } from './components/Slayer';
import { GameOverLayer, WinPrompt } from './components/GameOver';
import { MyCharacter, PlayerRail, VoteBar } from './components/PlayerBits';
import { WakeOverlay } from './components/WakeOverlay';
import { DayClock, ProgressWatcher, SceneBar } from './components/town/Scenes';
import { WorldSeatMenu } from './components/town/WorldSeatMenu';
import { UpdateNotice } from './components/UpdateNotice';
import { Landing } from './components/Landing';
import { JoinFlow, useJoin } from './components/town/JoinFlow';
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
  VoiceDock,
  WorldFailed,
  GraphicsLost,
} from './components/town/Hud';
import { useEffects } from './lib/effects';
import { clientLink, useClient } from './net/client';
import { hostLink } from './net/host';
import { notes } from './state/notes';
import { useUI } from './state/ui';
import { ModeContext, usePlayerView, useStorytellerView, ViewContext } from './state/view';
import { Icon } from './components/Icon';
import { World } from './world/World';
import { MiniGrimoire } from './components/town/MiniGrimoire';
import { MiniMap } from './components/town/MiniMap';

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
  return <div className={`app mode-${mode} ${panel ? 'has-panel' : ''} ${grimoire ? 'grimoire-open' : ''}`}>{children}</div>;
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
            </>
          )}
          <SidePanel />
          <PickBanner />
          <SlayerPrompt />
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
  const reopen = useJoin((s) => s.reopen);
  useEffects(view);
  if (!view) {
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
  const me = view.seats.find((s) => s.isMe);
  const joining = !me || !me.look || reopen;
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
              <MeetingSeat />
              <ActionPrompt />
              <div className="player-bottom">
                <HandSlot />
                <EmoteBar />
              </div>
              <JobLayer />
              <SheepLayer />
              <DayClock />
              <ProgressWatcher />
              <NoticeBoard />
              <HelpCard />
              <Modals />
              <WakeOverlay />
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
