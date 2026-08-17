import { lazy, Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { useReactorStore, levelsFor } from '../../store/reactorStore.js';
import { DIFFICULTIES } from '../../engine/constants.js';
import { getPosting, CAREER_POSTINGS } from '../../engine/career.js';
import { dailySeedKey } from '../../engine/tolerances.js';
import { useCareerStore } from '../../career/careerStore.js';
// The hero is three.js and the heaviest thing we ship. Let the menu paint and
// become clickable first; the machine fades in when its chunk lands.
const ReactorScene = lazy(() => import('../reactor3d/ReactorScene.jsx'));

// Helion-style hero: the machine full-bleed and slowly turning, one giant
// caption, a quiet mono menu. The reactor sells the game; the UI stays out
// of the way.

function MenuCard({ onClick, title, chip, chipTone = 'text-accent', sub, tone = 'border-raise-hi/70' }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3 px-4 text-left border glass hover:bg-raise/70 ${tone}`}
    >
      <div className="label-mono text-[11px] text-ink">
        {title}
        {chip && <span className={`ml-2 text-[8px] ${chipTone}`}>[ {chip} ]</span>}
      </div>
      {sub && <div className="text-[10px] text-ink/70 mt-1 leading-snug normal-case tracking-normal">{sub}</div>}
    </button>
  );
}

export default function TitleScreen() {
  const [choosing, setChoosing] = useState(false); // false | 'mode' | 'fusion' | 'fission' | 'career'
  /** Daily plant: same as-built machine for everyone today, so runs compare. */
  const [daily, setDaily] = useState(false);
  const hasSave = useReactorStore((s) => s.hasSave);
  const saves = useReactorStore((s) => s.saves);
  const newGame = useReactorStore((s) => s.newGame);
  const newCareerGame = useReactorStore((s) => s.newCareerGame);
  const continueGame = useReactorStore((s) => s.continueGame);
  const wipeSave = useReactorStore((s) => s.wipeSave);
  const saveError = useReactorStore((s) => s.saveError);
  const setSettingsOpen = useReactorStore((s) => s.setSettingsOpen);
  const careerPosting = saves.career ? getPosting(saves.career.careerPostingId) : null;
  const hasCareerSave = useCareerStore((s) => s.hasSave)();

  return (
    <div className="h-full relative overflow-hidden bg-base">
      {/* the machine, turning slowly in the dark */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <Suspense fallback={null}>
          <ReactorScene bare />
        </Suspense>
      </div>
      <div className="stage-scrim absolute inset-x-0 bottom-0 h-[75%]" />

      {/* top mono bar */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-6 sm:px-10 py-5 label-mono text-[10px] text-ink/70">
        <span className="text-ink text-[11px]">FUSION<span className="text-accent">CORE</span></span>
        <span className="hidden sm:block">[ An engineering simulation / every number cited ]</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-x-0 bottom-0 px-6 sm:px-10 pb-8 sm:pb-12"
      >
        <div className="max-w-6xl">
          <h1 className="display-caps text-5xl sm:text-7xl xl:text-8xl text-ink">
            Confine a star.
            <br />
            Power our world.
          </h1>
          <p className="label-mono text-[10px] text-ink/70 mt-4 max-w-xl">
            Fusion + fission reactor simulation / real tradeoffs, real limits,
            real incident reports
          </p>

          <div className="mt-8 grid gap-2 w-full max-w-sm">
            {choosing === 'mode' ? (
              <>
                <div className="label-mono text-[9px] text-ink/55">[ Choose your machine ]</div>
                <MenuCard
                  onClick={() => setChoosing('fusion')}
                  title="Fusion tokamak" chip="Start here"
                  sub="Confine a star. Guided 8-mission campaign. The future of energy."
                  tone="border-accent/60"
                />
                <MenuCard
                  onClick={() => useCareerStore.getState().startCreation()}
                  title="Engineering career" chip="Age 18 to retirement" chipTone="text-accent"
                  sub="A whole working life: choices, people who remember them, and five moments where you take the controls yourself."
                  tone="border-accent/50"
                />
                <MenuCard
                  onClick={() => setChoosing('fission')}
                  title="Fission PWR"
                  sub="Run a 3.4 GW pressurized-water reactor. Rods, xenon, decay heat. No training wheels."
                />
                <button onClick={() => setChoosing(false)} className="label-mono text-[9px] text-ink/55 hover:text-ink text-left px-1">
                  back
                </button>
              </>
            ) : choosing ? (
              <>
                <div className="label-mono text-[9px] text-ink/55">[ Choose the difficulty ]</div>
                {choosing !== 'career' && (
                  <button
                    type="button"
                    onClick={() => setDaily((v) => !v)}
                    aria-pressed={daily}
                    className={`w-full border px-3 py-2.5 text-left transition-colors ${
                      daily
                        ? 'border-accent/60 bg-accent/10'
                        : 'border-raise-hi/70 hover:border-raise-hi'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-bold text-ink">Daily plant</span>
                      <span className="label-mono text-[9px] text-ink/55">
                        {daily ? dailySeedKey() : 'off'}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-ink/70">
                      Everyone starting today gets the same as-built machine, tolerances and
                      all. Compare your final cost of power against anyone else who ran it.
                    </p>
                  </button>
                )}
                {Object.values(DIFFICULTIES).map((d) => (
                  <MenuCard
                    key={d.key}
                    onClick={() =>
                      choosing === 'career'
                        ? newCareerGame(d.key)
                        : newGame(d.key, choosing, 'pwr', { daily })
                    }
                    title={d.label}
                    chip={d.key === 'operator' ? 'Recommended' : undefined}
                    sub={d.tagline}
                    tone={d.key === 'operator' ? 'border-accent/60' : 'border-raise-hi/70'}
                  />
                ))}
                <button onClick={() => setChoosing('mode')} className="label-mono text-[9px] text-ink/55 hover:text-ink text-left px-1">
                  back
                </button>
              </>
            ) : (
              <button
                onClick={() => setChoosing('mode')}
                className="w-full py-3.5 bg-accent text-base label-mono text-[12px] font-medium hover:brightness-110"
              >
                {hasSave ? 'New campaign' : 'Start / first light'}
              </button>
            )}

            {!choosing && hasCareerSave && (
              <MenuCard
                onClick={() => useCareerStore.getState().load()}
                title="Continue career" chipTone="text-accent"
                tone="border-accent/50"
                sub="Pick up the life in progress."
              />
            )}
            {!choosing && saves.fusion && (
              <MenuCard
                onClick={() => continueGame('fusion')}
                title="Continue fusion"
                tone="border-accent/50"
                sub={`${saves.fusion.completed ? 'Sandbox' : `Mission ${saves.fusion.levelId} of 8`} · ${saves.fusion.difficulty}`}
              />
            )}
            {!choosing && saves.fission && (
              <MenuCard
                onClick={() => continueGame('fission')}
                title="Continue fission"
                tone="border-warn/50"
                sub={`${saves.fission.completed ? 'Sandbox' : `Mission ${saves.fission.levelId} of 4`} · ${saves.fission.difficulty}`}
              />
            )}
            {/* A failed Continue leaves the player here, where TopHUD's warning
                chip does not exist. Without this the button simply did nothing
                and there was no way to tell a dead save from a dead click. */}
            {saveError && (
              <p role="alert" className="text-[10px] text-crit border border-crit/40 bg-crit/10 px-3 py-2 leading-relaxed">
                {saveError}
              </p>
            )}

            <div className="flex items-center gap-4 px-1 mt-1">
              <button onClick={() => setSettingsOpen(true)} className="label-mono text-[9px] text-ink/70 hover:text-ink">
                Settings
              </button>
              {hasSave && !choosing && (
                <button
                  onClick={() => { if (window.confirm('Delete ALL saves: both campaigns and the career? This cannot be undone.')) wipeSave(); }}
                  className="label-mono text-[9px] text-ink/40 hover:text-crit"
                >
                  Delete saved games
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="label-mono text-[8px] text-ink/40 mt-8 max-w-lg leading-relaxed">
          Physics simplified for real-time play, calibrated against ITER Physics
          Basis, NRL Plasma Formulary, and ARIES systems studies.
        </p>
      </motion.div>
    </div>
  );
}
