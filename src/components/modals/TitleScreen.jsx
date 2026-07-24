import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReactorStore, levelsFor } from '../../store/reactorStore.js';
import { DIFFICULTIES } from '../../engine/constants.js';
import { getPosting, CAREER_POSTINGS } from '../../engine/career.js';
import { useCareerStore } from '../../career/careerStore.js';
import ReactorScene from '../reactor3d/ReactorScene.jsx';

// Helion-style hero: the machine full-bleed and slowly turning, one giant
// caption, a quiet mono menu. The reactor sells the game; the UI stays out
// of the way.

function MenuCard({ onClick, title, chip, chipTone = 'text-accent', sub, tone = 'border-slate-600/70' }) {
  return (
    <button
      onClick={onClick}
      className={`w-full py-3 px-4 rounded-xl text-left border glass hover:bg-raise/70 ${tone}`}
    >
      <div className="label-mono text-[11px] text-ink">
        {title}
        {chip && <span className={`ml-2 text-[8px] ${chipTone}`}>[ {chip} ]</span>}
      </div>
      {sub && <div className="text-[10px] text-slate-400 mt-1 leading-snug normal-case tracking-normal">{sub}</div>}
    </button>
  );
}

export default function TitleScreen() {
  const [choosing, setChoosing] = useState(false); // false | 'mode' | 'fusion' | 'fission' | 'career'
  const hasSave = useReactorStore((s) => s.hasSave);
  const saves = useReactorStore((s) => s.saves);
  const newGame = useReactorStore((s) => s.newGame);
  const newCareerGame = useReactorStore((s) => s.newCareerGame);
  const continueGame = useReactorStore((s) => s.continueGame);
  const wipeSave = useReactorStore((s) => s.wipeSave);
  const setSettingsOpen = useReactorStore((s) => s.setSettingsOpen);
  const careerPosting = saves.career ? getPosting(saves.career.careerPostingId) : null;
  const hasCareerSave = useCareerStore((s) => s.hasSave)();

  return (
    <div className="h-full relative overflow-hidden bg-base">
      {/* the machine, turning slowly in the dark */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <ReactorScene bare />
      </div>
      <div className="stage-scrim absolute inset-x-0 bottom-0 h-[75%]" />

      {/* top mono bar */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-6 sm:px-10 py-5 label-mono text-[10px] text-slate-400">
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
          <p className="label-mono text-[10px] text-slate-400 mt-4 max-w-xl">
            Fusion + fission reactor simulation / real tradeoffs, real limits,
            real incident reports
          </p>

          <div className="mt-8 grid gap-2 w-full max-w-sm">
            {choosing === 'mode' ? (
              <>
                <div className="label-mono text-[9px] text-slate-500">[ Choose your machine ]</div>
                <MenuCard
                  onClick={() => setChoosing('fusion')}
                  title="Fusion tokamak" chip="Start here"
                  sub="Confine a star. Guided 8-mission campaign. The future of energy."
                  tone="border-accent/60"
                />
                <MenuCard
                  onClick={() => useCareerStore.getState().startCreation()}
                  title="Engineering career" chip="Age 18 to retirement" chipTone="text-violet-300"
                  sub="A whole working life: choices, people who remember them, and five moments where you take the controls yourself."
                  tone="border-violet-400/50"
                />
                <MenuCard
                  onClick={() => setChoosing('fission')}
                  title="Fission PWR"
                  sub="Run a 3.4 GW pressurized-water reactor. Rods, xenon, decay heat. No training wheels."
                />
                <button onClick={() => setChoosing(false)} className="label-mono text-[9px] text-slate-500 hover:text-ink text-left px-1">
                  back
                </button>
              </>
            ) : choosing ? (
              <>
                <div className="label-mono text-[9px] text-slate-500">[ Choose the difficulty ]</div>
                {Object.values(DIFFICULTIES).map((d) => (
                  <MenuCard
                    key={d.key}
                    onClick={() => (choosing === 'career' ? newCareerGame(d.key) : newGame(d.key, choosing))}
                    title={d.label}
                    chip={d.key === 'operator' ? 'Recommended' : undefined}
                    sub={d.tagline}
                    tone={d.key === 'operator' ? 'border-accent/60' : 'border-slate-600/70'}
                  />
                ))}
                <button onClick={() => setChoosing('mode')} className="label-mono text-[9px] text-slate-500 hover:text-ink text-left px-1">
                  back
                </button>
              </>
            ) : (
              <button
                onClick={() => setChoosing('mode')}
                className="w-full py-3.5 rounded-xl bg-accent text-base label-mono text-[12px] font-medium hover:brightness-110"
              >
                {hasSave ? 'New campaign' : 'Start / first light'}
              </button>
            )}

            {!choosing && hasCareerSave && (
              <MenuCard
                onClick={() => useCareerStore.getState().load()}
                title="Continue career" chipTone="text-violet-300"
                tone="border-violet-400/50"
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
            <div className="flex items-center gap-4 px-1 mt-1">
              <button onClick={() => setSettingsOpen(true)} className="label-mono text-[9px] text-slate-400 hover:text-ink">
                Settings
              </button>
              {hasSave && !choosing && (
                <button
                  onClick={() => { if (window.confirm('Delete ALL saves: both campaigns and the career? This cannot be undone.')) wipeSave(); }}
                  className="label-mono text-[9px] text-slate-600 hover:text-crit"
                >
                  Delete saved games
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="label-mono text-[8px] text-slate-600 mt-8 max-w-lg leading-relaxed">
          Physics simplified for real-time play, calibrated against ITER Physics
          Basis, NRL Plasma Formulary, and ARIES systems studies.
        </p>
      </motion.div>
    </div>
  );
}
