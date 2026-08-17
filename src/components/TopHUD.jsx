import { useReactorStore, levelFor } from '../store/reactorStore.js';
import { RD_PER_STABLE_SIM_HOUR, RD_BONUS_Q1, RD_BONUS_LEVEL } from '../engine/constants.js';
import { getPosting, CAREER_POSTINGS } from '../engine/career.js';
import Icon from './common/Icon.jsx';

const SPEEDS = [0.25, 1, 2, 4, 8];

/**
 * Speed does not just fast-forward the clock. The loop ticks at TICK_MS/speed
 * and the background disruption roll happens once per tick, so running at 8x
 * spends eight times as much operating risk per second you sit there. That is
 * physically honest (risk is per unit of plant time, not per unit of yours) and
 * completely invisible unless someone says it out loud.
 */
function riskNote(sp) {
  if (sp > 1) return `. ${sp}x the plant time per second, and ${sp}x the disruption risk with it`;
  if (sp < 1) return '. Slower plant time, and less risk per second, for delicate manoeuvres';
  return '. Real time';
}

function fmtMoney(v) {
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

function fmtSimTime(sec) {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${String(m).padStart(2, '0')}m`;
}

function integrityClass(v) {
  if (v > 60) return 'text-safe';
  if (v > 30) return 'text-warn';
  return 'text-crit';
}

export default function TopHUD() {
  const levelId = useReactorStore((s) => s.level.id);
  const levelCompleted = useReactorStore((s) => s.level.completed);
  const funds = useReactorStore((s) => s.econ.funds);
  const rdPoints = useReactorStore((s) => s.rd.points);
  const integrity = useReactorStore((s) => s.sim.structure.integrity);
  const simSeconds = useReactorStore((s) => s.sim.time.simSeconds);
  const speed = useReactorStore((s) => s.speed);
  const setSpeed = useReactorStore((s) => s.setSpeed);
  const setSettingsOpen = useReactorStore((s) => s.setSettingsOpen);
  const setCaseFilesOpen = useReactorStore((s) => s.setCaseFilesOpen);
  const career = useReactorStore((s) => s.career);
  const setCareerOpen = useReactorStore((s) => s.setCareerOpen);
  const diffLabel = useReactorStore((s) => s.sim.difficulty?.label);
  const saveError = useReactorStore((s) => s.saveError);
  const mode = useReactorStore((s) => s.mode);
  const plantKey = useReactorStore((s) => s.sim.plantKey);
  const level = levelFor(mode, levelId, plantKey);

  return (
    <header className="h-11 shrink-0 glass border-b-0 flex items-center gap-4 px-4 text-xs overflow-x-auto z-30">
      {/* The page heading. Tailwind's preflight makes h1 inherit size and
          weight, so this renders identically to the div it replaced while
          giving assistive tech a page title to anchor on. */}
      <h1 className="label-mono text-[12px] font-medium text-ink whitespace-nowrap">
        FUSION<span className="text-accent">CORE</span>
      </h1>

      {career && (
        <button
          onClick={() => setCareerOpen(true)}
          title={`${getPosting(career.postingId)?.title ?? 'Engineer'}. Open the career file`}
          className="whitespace-nowrap px-2.5 h-7 rounded-full border border-accent/40 hover:bg-raise label-mono text-[9px] text-accent"
        >
          Career {getPosting(career.postingId)?.rung ?? '?'}/{CAREER_POSTINGS.length}
        </button>
      )}

      <div className="whitespace-nowrap label-mono text-[9px] text-ink/70">
        [ {levelCompleted ? (career ? 'Posting done' : 'Sandbox') : `M${levelId} / ${level.name}`}
        {diffLabel ? ` / ${diffLabel}` : ''} ]
      </div>

      <div className="whitespace-nowrap label-mono text-[9px]" title="Bank funds">
        <span className="text-ink/55">Funds </span>
        <span className={funds < 0 ? 'text-crit' : 'text-ink'}>{fmtMoney(funds)}</span>
      </div>

      <div
        className="whitespace-nowrap label-mono text-[9px]"
        title={`Research and development points. +${RD_PER_STABLE_SIM_HOUR} per hour of stable running, +${RD_BONUS_Q1} the first time Q passes 1.0, +${RD_BONUS_LEVEL} per mission completed. Spend them in Systems.`}
      >
        <span className="text-ink/55">R&amp;D </span>
        <span className="text-accent">{Math.floor(rdPoints)}</span>
      </div>

      <div className="whitespace-nowrap label-mono text-[9px]" title="Global structural integrity (worst component)">
        <span className="text-ink/55">Hull </span>
        <span className={integrityClass(integrity)}>{integrity.toFixed(0)}%</span>
      </div>

      {/* Plant time, not wall time. The SIM prefix plus the tooltip is the
          persistent answer to "is T+05M five real minutes?": no, and at 1x it
          is five real seconds. Speed buttons change playback, not physics. */}
      <div
        className="whitespace-nowrap label-mono text-[9px] text-ink/70"
        title="Plant time, not wall clock: 1 real second = 1 plant minute at 1x. Speed changes playback, never the physics."
      >
        <span className="text-ink/45">SIM </span>T+{fmtSimTime(simSeconds)}
      </div>

      {/* Only ever rendered when a write genuinely failed. It stays put rather
          than passing by as a toast: this is a condition, not an event, and it
          holds until a save succeeds. */}
      {saveError && (
        <div
          role="alert"
          title={saveError}
          className="whitespace-nowrap label-mono text-[9px] text-crit border border-crit/50 bg-crit/15 rounded-full px-2.5 h-6 inline-flex items-center gap-1.5"
        >
          <span aria-hidden="true">▲</span>
          <span>Not saving</span>
          <span className="sr-only">{saveError}</span>
        </div>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-0.5 whitespace-nowrap rounded-full border border-raise-hi/60 p-0.5">
        <button
          onClick={() => setSpeed(0)}
          aria-label="Pause simulation"
          className={`px-2 h-6 rounded-full font-mono text-[10px] inline-flex items-center justify-center ${speed === 0 ? 'bg-accent text-base font-bold' : 'text-ink/85 hover:bg-raise'}`}
        >
          <Icon name="pause" className="w-3 h-3" />
        </button>
        {SPEEDS.map((sp) => (
          <button
            key={sp}
            onClick={() => setSpeed(sp)}
            aria-label={`Set simulation speed ${sp}x${riskNote(sp)}`}
            title={`${sp}x sim speed${riskNote(sp)}`}
            className={`px-2 h-6 rounded-full font-mono text-[10px] inline-flex items-center justify-center ${speed === sp ? 'bg-accent text-base font-bold' : 'text-ink/85 hover:bg-raise'}`}
          >
            {sp}x
          </button>
        ))}
      </div>

      <button
        onClick={() => setCaseFilesOpen(true)}
        aria-label="Open historical case files"
        title="Case files: real accidents as investigations"
        className="px-2.5 h-7 rounded-full border border-raise-hi/60 hover:bg-raise label-mono text-[9px] text-ink/85 whitespace-nowrap"
      >
        Case files
      </button>

      <button
        onClick={() => setSettingsOpen(true)}
        aria-label="Open settings"
        className="px-2 h-7 rounded-full border border-raise-hi/60 hover:bg-raise inline-flex items-center justify-center"
      >
        <Icon name="gear" className="w-3.5 h-3.5" />
      </button>
    </header>
  );
}
