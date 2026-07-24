import { useReactorStore } from '../store/reactorStore.js';
import { TUTORIALS, tutorialStep } from '../engine/tutorials.js';

/**
 * The guided checklist: one plain-language instruction at a time, front and
 * center, for someone who has never heard the word "criticality". Watch-steps
 * advance themselves when the plant does the thing; ack-steps wait for the
 * button. Skippable at any moment.
 */
export default function TutorialOverlay() {
  const onboarding = useReactorStore((s) => s.onboarding);
  const careerOpen = useReactorStore((s) => s.careerOpen);
  const caseFilesOpen = useReactorStore((s) => s.caseFilesOpen);
  const settingsOpen = useReactorStore((s) => s.settingsOpen);
  const pendingCutscene = useReactorStore((s) => s.pendingCutscene);
  const gameOver = useReactorStore((s) => s.gameOver);
  const advance = useReactorStore((s) => s.advanceTutorial);
  const skip = useReactorStore((s) => s.skipTutorial);

  const step = tutorialStep(onboarding);
  if (!step || careerOpen || caseFilesOpen || settingsOpen || pendingCutscene || gameOver) return null;
  const steps = TUTORIALS[onboarding.key] ?? [];

  return (
    <div className="absolute inset-x-3 bottom-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-6 sm:w-[440px] z-30">
      <div className="glass rounded-2xl border border-accent/40 p-4 sm:p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i < onboarding.step ? 'w-3 bg-safe'
                  : i === onboarding.step ? 'w-6 bg-accent'
                  : 'w-3 bg-slate-700'
                }`}
              />
            ))}
          </div>
          <button
            onClick={skip}
            className="label-mono text-[9px] text-slate-500 hover:text-slate-300"
            title="Skip the checklist; mission briefs remain available"
          >
            Skip
          </button>
        </div>

        <div className="label-mono text-[9px] text-accent mb-1.5">
          [ Checklist {onboarding.step + 1} / {steps.length} ]
        </div>
        <p className="text-[15px] font-semibold text-ink leading-snug">{step.say}</p>
        {step.detail && (
          <p className="text-[11px] text-slate-300 leading-relaxed mt-1.5">{step.detail}</p>
        )}

        {step.ack ? (
          <button
            onClick={advance}
            autoFocus
            className="mt-3 w-full py-2.5 rounded-xl bg-accent text-base font-bold text-[12px] tracking-widest hover:brightness-110"
          >
            CONTINUE
          </button>
        ) : (
          <div className="label-mono text-[9px] text-slate-400 mt-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Waiting on you: the checklist advances the moment it happens
          </div>
        )}
      </div>
    </div>
  );
}
