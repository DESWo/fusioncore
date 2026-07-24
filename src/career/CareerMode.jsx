import { useEffect } from 'react';
import { useCareerStore } from './careerStore.js';
import CareerHUD from './components/CareerHUD.jsx';
import EventCard from './components/EventCard.jsx';
import CareerPanels from './components/CareerPanels.jsx';
import CharacterCreation from './components/CharacterCreation.jsx';
import Retrospective from './components/Retrospective.jsx';
import CareerSim from './components/CareerSim.jsx';
import YearPlan from './components/YearPlan.jsx';
import YearSummary from './components/YearSummary.jsx';
import { canRetire } from './engine/stages.js';
import '../career/career-theme.css';

/**
 * Career mode shell. Mobile-first per spec §12: a fixed header of vitals, one
 * event card at a time, and a large Age Up button pinned to the bottom. On
 * desktop the whole thing centres in a phone-width column, which suits a game
 * that is fundamentally a sequence of single decisions.
 */
export default function CareerMode({ onExit }) {
  const screen = useCareerStore((s) => s.screen);
  const yearResolved = useCareerStore((s) => s.yearResolved);
  const phase = useCareerStore((s) => s.phase);
  const yearQueue = useCareerStore((s) => s.yearQueue);
  const currentIndex = useCareerStore((s) => s.currentIndex);
  const player = useCareerStore((s) => s.player);
  const ageUp = useCareerStore((s) => s.ageUp);
  const setPanel = useCareerStore((s) => s.setPanel);
  const retire = useCareerStore((s) => s.retire);
  const pendingSim = useCareerStore((s) => s.pendingSim);

  // leaving career mode entirely hands control back to the host app
  useEffect(() => {
    if (screen === 'title') onExit?.();
  }, [screen, onExit]);

  if (screen === 'create') {
    return <Shell><CharacterCreation /></Shell>;
  }
  if (screen === 'retrospective') {
    return <Shell><Retrospective /></Shell>;
  }
  if (screen !== 'year') return null;

  const remaining = yearQueue.length - currentIndex - (yearResolved ? 0 : 1);
  const inPlan = phase === 'plan' && !pendingSim;

  return (
    <Shell>
      <div className="h-full flex flex-col relative overflow-hidden">
        <CareerHUD />

        {pendingSim ? <CareerSim />
          : phase === 'plan' ? <YearPlan />
          : phase === 'summary' ? <YearSummary />
          : <EventCard />}

        <div
          className="shrink-0 px-5 pb-5 pt-3"
          style={{ borderTop: '1px solid var(--c-line)' }}
        >
          <div className="flex gap-2 mb-2.5">
            <button onClick={() => setPanel('relationships')} className="c-btn-ghost flex-1 py-2 text-[12px]">
              People
            </button>
            <button onClick={() => setPanel('log')} className="c-btn-ghost flex-1 py-2 text-[12px]">
              The log
            </button>
            {canRetire(player) && (
              <button
                onClick={retire}
                className="c-btn-ghost flex-1 py-2 text-[12px]"
                style={{ borderColor: 'rgba(224,138,60,0.45)', color: 'var(--c-accent)' }}
              >
                Retire
              </button>
            )}
          </div>

          {/* The planning screen owns its own commit button, so the age-up
              control stays out of the way until the year is actually lived. */}
          {!inPlan && (
            <button
              onClick={ageUp}
              disabled={!yearResolved || !!pendingSim}
              className="c-btn w-full py-4 text-[15px]"
            >
              {yearResolved
                ? `Turn ${player.age + 1}`
                : remaining > 0
                  ? `${remaining} more this year`
                  : 'Finish the year'}
            </button>
          )}
        </div>

        <CareerPanels />
      </div>
    </Shell>
  );
}

/** Phone-width column, centred on anything bigger. Carries the career skin. */
function Shell({ children }) {
  return (
    <div
      className="career-theme h-full w-full flex justify-center overflow-hidden"
      style={{ background: '#0E0B09' }}
    >
      <div
        className="w-full max-w-[480px] h-full relative overflow-hidden"
        style={{
          background: 'var(--c-bg)',
          boxShadow: '0 0 60px rgba(0,0,0,0.6)',
          borderLeft: '1px solid var(--c-line)',
          borderRight: '1px solid var(--c-line)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
