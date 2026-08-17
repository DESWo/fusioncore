import { lazy, Suspense, useEffect, useState } from 'react';
import { useReactorStore, scheduleLoop } from './store/reactorStore.js';
import { initAudio, applyVolumes, updateSoundscape } from './audio/synth.js';
import TopHUD from './components/TopHUD.jsx';
import Dashboard from './components/dashboard/Dashboard.jsx';
import AdvisorPanel from './components/advisor/AdvisorPanel.jsx';
import AnnunciatorPanel from './components/dashboard/AnnunciatorPanel.jsx';
import TitleScreen from './components/modals/TitleScreen.jsx';
import { useCareerStore } from './career/careerStore.js';
import HeroOverlay from './components/HeroOverlay.jsx';
import TutorialOverlay from './components/TutorialOverlay.jsx';
import NotificationStack from './components/advisor/NotificationStack.jsx';
import LevelUpCutscene from './components/modals/LevelUpCutscene.jsx';
import AckModal from './components/modals/AckModal.jsx';
import SourcesFooter from './components/common/SourcesFooter.jsx';

// Split the heavy and the rarely-opened out of the first download.
// three + @react-three/* is the bulk of the bundle, career mode is a whole
// second game, and a modal nobody opens should not cost anything up front.
const ReactorScene = lazy(() => import('./components/reactor3d/ReactorScene.jsx'));
const FissionScene = lazy(() => import('./components/reactor3d/FissionScene.jsx'));
const FissionDashboard = lazy(() => import('./components/dashboard/FissionDashboard.jsx'));
const CareerMode = lazy(() => import('./career/CareerMode.jsx'));
const GameOverModal = lazy(() => import('./components/modals/GameOverModal.jsx'));
const SettingsModal = lazy(() => import('./components/modals/SettingsModal.jsx'));
const CaseFilesModal = lazy(() => import('./components/modals/CaseFilesModal.jsx'));
const CareerModal = lazy(() => import('./components/modals/CareerModal.jsx'));

/** Holds the stage's shape while the 3D chunk arrives, so nothing reflows. */
function SceneFallback() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-base">
      <span className="label-mono text-[10px] text-ink/55">[ spinning up the machine ]</span>
    </div>
  );
}

const TABS = [
  { id: 'controls', label: 'Controls' },
  { id: 'diagnostics', label: 'Systems' },
  { id: 'advisor', label: 'Advisor' },
];

export default function App() {
  const screen = useReactorStore((s) => s.screen);
  const mode = useReactorStore((s) => s.mode);
  const settings = useReactorStore((s) => s.settings);
  const settingsOpen = useReactorStore((s) => s.settingsOpen);
  const caseFilesOpen = useReactorStore((s) => s.caseFilesOpen);
  const careerOpen = useReactorStore((s) => s.careerOpen);
  const pendingCutscene = useReactorStore((s) => s.pendingCutscene);
  const gameOver = useReactorStore((s) => s.gameOver);
  const speed = useReactorStore((s) => s.speed);
  const onboardingActive = useReactorStore((s) => s.onboarding.active);
  const careerScreen = useCareerStore((s) => s.screen);
  const [tab, setTab] = useState('controls');

  useEffect(() => {
    useReactorStore.getState().boot();
    return () => scheduleLoop(); // clears the interval on unmount in dev/HMR
  }, []);

  // Reflect accessibility settings onto <body> so CSS overlays apply globally
  useEffect(() => {
    const b = document.body;
    b.classList.toggle('font-dyslexic', settings.dyslexicFont);
    b.classList.toggle('reduced-motion', settings.reducedMotion);
    ['cb-protanopia', 'cb-deuteranopia', 'cb-tritanopia'].forEach((c) => b.classList.remove(c));
    if (settings.colorblind !== 'none') b.classList.add(`cb-${settings.colorblind}`);
    document.documentElement.style.setProperty('--ui-scale', settings.uiScale);
    applyVolumes(settings);
  }, [settings]);

  // Feed the procedural soundscape from state changes
  useEffect(() => {
    const unsub = useReactorStore.subscribe((s) => {
      updateSoundscape({
        B: s.sim.controls.B ?? 4 + (100 - (s.sim.controls.rods ?? 100)) * 0.16,
        pFusionMW: s.sim.physics.pFusionMW ?? s.sim.physics.P ?? 0,
        plasmaOn: s.sim.physics.plasmaOn,
        alarmLevel: s.alarmLevel,
        screen: s.screen,
        speed: s.speed,
        settings: s.settings,
      });
    });
    return unsub;
  }, []);

  // First user gesture unlocks the audio context (autoplay policy)
  useEffect(() => {
    const unlock = () => {
      initAudio();
      applyVolumes(useReactorStore.getState().settings);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // Keyboard shortcuts: space = pause/resume, 1-5 = speed steps
  useEffect(() => {
    const onKey = (e) => {
      const st = useReactorStore.getState();
      if (st.screen !== 'game' || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        st.setSpeed(st.speed === 0 ? st.prevSpeed || 1 : 0);
      } else if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(e.code)) {
        st.setSpeed([0.25, 1, 2, 4, 8][Number(e.code.slice(-1)) - 1]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Career mode is its own game: a life sim that borrows the physics engine
  // for five set-pieces. It takes the whole screen when active.
  if (careerScreen !== 'title') {
    return (
      <Suspense fallback={<SceneFallback />}>
        <CareerMode onExit={() => useCareerStore.getState().exit()} />
      </Suspense>
    );
  }

  if (screen === 'title') {
    return (
      <>
        <TitleScreen />
        <Suspense fallback={null}>{settingsOpen && <SettingsModal />}</Suspense>
      </>
    );
  }

  const showPaused = speed === 0 && !pendingCutscene && !gameOver && !settingsOpen && !onboardingActive;

  return (
    <div className="h-full flex flex-col bg-base text-ink overflow-hidden">
      <TopHUD />
      {/* The stage: the machine full-bleed on desktop, top block on tablet.
          <main> because this IS the page: machine, mission and controls all
          live inside it, so a screen reader's jump-to-main lands on the game. */}
      <main className="flex-1 relative min-h-0">
        <div className="h-[38%] lg:h-full lg:absolute lg:inset-0">
          <Suspense fallback={<SceneFallback />}>
            {mode === 'fission' ? <FissionScene /> : <ReactorScene />}
          </Suspense>
        </div>

        {showPaused && (
          <button
            onClick={() => useReactorStore.getState().setSpeed(1)}
            className="absolute top-2 left-1/2 -translate-x-1/2 z-20 glass rounded-full px-4 py-1.5 label-mono text-[10px] text-warn hover:text-ink"
          >
            Paused / press 1x or Space
          </button>
        )}

        {/* Alerts float over the machine, clear of the control column */}
        <div className="absolute top-2 right-2 lg:right-[424px] w-64 sm:w-72 z-20">
          <NotificationStack />
        </div>

        <HeroOverlay />
        <TutorialOverlay />

        {/* Floating instrument column (full-width sheet below lg) */}
        {/* The sheet is square-cornered below lg and rounded above it, so the
            brackets sit flush on mobile and step inside the radius on desktop.
            Both stay >= 0 because the panel clips its overflow. */}
        {/* A named region: everything operable lives in this column, and
            "controls and diagnostics" is what its tabs actually contain. */}
        <section
          aria-label="Controls and diagnostics"
          className="absolute inset-x-0 bottom-0 top-[38%] lg:left-auto lg:top-3 lg:right-3 lg:bottom-3 lg:w-[404px] z-10 flex flex-col min-h-0 lg:glass overflow-hidden framed [--frame-inset:0px] lg:[--frame-inset:7px]">
          <div className="flex border-b border-raise/60 shrink-0">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2.5 label-mono text-[10px] ${
                  tab === t.id ? 'text-ink bg-raise/60 border-b-2 border-accent' : 'text-ink/70 hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {/* Pinned above the scrolling content, and outside the tab switch:
              an alarm board you have to scroll to find, or change tabs to
              reach, is not an alarm board. */}
          <div className="shrink-0">
            <AnnunciatorPanel />
          </div>
          {tab === 'advisor' ? (
            <AdvisorPanel />
          ) : (
            <>
              <Suspense fallback={null}>
                {mode === 'fission' ? <FissionDashboard tabletTab={tab} /> : <Dashboard tabletTab={tab} />}
              </Suspense>
              <SourcesFooter />
            </>
          )}
        </section>
      </main>

      {pendingCutscene && <LevelUpCutscene />}
      <Suspense fallback={null}>
        {gameOver && <GameOverModal />}
        {settingsOpen && <SettingsModal />}
        {careerOpen && <CareerModal />}
        {caseFilesOpen && <CaseFilesModal />}
      </Suspense>
      <AckModal />
    </div>
  );
}
