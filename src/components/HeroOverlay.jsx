import NumberFlow from '@number-flow/react';
import { useReactorStore, levelFor } from '../store/reactorStore.js';
import { fissionPlantOf } from '../engine/fission.js';
import { powerParts } from '../utils/format.js';
import ObjectiveHUD from './ObjectiveHUD.jsx';

// The cinematic reading of the machine: mission as a single giant caption,
// the three numbers that matter in display type, the advisor as a ticker.
// Pointer events stay off so the stage underneath keeps orbit control.

const TYPE_COLOR = { info: 'text-ink/85', warning: 'text-warn', critical: 'text-crit' };

function Metric({ label, value, digits = 0, unit, signed = false, tone = 'text-ink', revealIndex = 0 }) {
  const reducedMotion = useReactorStore((s) => s.settings.reducedMotion);
  const format = {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: signed ? 'always' : 'auto',
  };
  return (
    <div className="reveal" style={{ '--reveal-i': revealIndex }}>
      <div className={`hero-number font-medium text-4xl xl:text-5xl ${tone}`}>
        {/* digits roll rather than snap, so a ramping machine reads as moving.
            The plant can change unit under us (kW to MW), which NumberFlow
            handles as a plain value change because the unit lives outside. */}
        <NumberFlow
          value={value}
          format={format}
          animated={!reducedMotion}
          willChange
        />
        {unit && <span className="text-lg xl:text-xl text-ink/70 ml-1.5 font-normal">{unit}</span>}
      </div>
      <div className="label-mono text-[10px] text-ink/70 mt-1.5">{label}</div>
    </div>
  );
}

function useMetrics() {
  const mode = useReactorStore((s) => s.mode);
  const p = useReactorStore((s) => s.sim.physics);
  const sim = useReactorStore((s) => s.sim);
  if (mode === 'fusion') {
    const fusionPower = powerParts(p.pFusionMW ?? 0);
    const grid = powerParts(p.netElecMW ?? 0);
    return [
      {
        label: 'Energy gain Q', value: p.Q ?? 0, digits: 2,
        tone: p.Q >= 1 ? 'text-safe' : 'text-ink',
      },
      { label: 'Fusion power', ...fusionPower },
      {
        label: 'To the grid', ...grid, signed: true,
        tone: p.netElecMW > 0 ? 'text-safe' : 'text-ink/70',
      },
    ];
  }
  const plant = fissionPlantOf(sim);
  const rho = p.reactivityPcm ?? 0;
  const rhoTone = rho > 400 ? 'text-crit' : rho > 100 ? 'text-warn' : 'text-ink';
  if (!plant.gridConnected) {
    const hot = (p.P ?? 0) >= 0.1;
    return [
      {
        label: 'Reactor power',
        value: hot ? (p.P ?? 0) : (p.P ?? 0) * 1000,
        digits: hot ? 1 : 0, unit: hot ? 'MW' : 'kW',
      },
      { label: 'Reactivity', value: rho, digits: 0, unit: 'pcm', signed: true, tone: rhoTone },
      {
        label: 'Of license', value: (p.P / plant.nominalMW) * 100, digits: 1, unit: '%',
        tone: p.P <= plant.nominalMW ? 'text-ink' : 'text-warn',
      },
    ];
  }
  const thermal = powerParts((p.P ?? 0) + (p.decayMW ?? 0));
  const grid = powerParts(p.netElecMW ?? 0);
  return [
    { label: 'Thermal power', ...thermal },
    { label: 'Reactivity', value: rho, digits: 0, unit: 'pcm', signed: true, tone: rhoTone },
    {
      label: 'To the grid', ...grid, signed: true,
      tone: p.netElecMW > 0 ? 'text-safe' : 'text-ink/70',
    },
  ];
}

export default function HeroOverlay() {
  const mode = useReactorStore((s) => s.mode);
  const plantKey = useReactorStore((s) => s.sim.plantKey);
  const levelId = useReactorStore((s) => s.level.id);
  const sustain = useReactorStore((s) => s.level.sustain);
  const completed = useReactorStore((s) => s.level.completed);
  const career = useReactorStore((s) => s.career);
  const feed = useReactorStore((s) => s.advisorFeed);
  const metrics = useMetrics();
  const level = levelFor(mode, levelId, plantKey);
  const progress = Math.min(sustain / level.sustainTicks, 1);
  const last = feed[0];

  return (
    <div className="hidden lg:block absolute inset-0 z-10 pointer-events-none">
      <div className="stage-scrim absolute inset-x-0 bottom-0 h-[48%]" />
      {/* Keyed on the mission so the sequence replays when the brief changes,
          not on every physics tick. */}
      <div
        key={`${mode}-${level.id}-${completed}`}
        className="absolute inset-x-0 bottom-0 px-8 pb-7 pr-[440px] flex flex-col gap-5"
      >
        {/* The mission caption and its hold bar moved to ObjectiveHUD, which
            also shows the threshold you are measured against. Two components
            each telling half of "what am I doing and how close am I" was the
            duplication; this one keeps the campaign-complete state, which has
            no target to draw. */}
        <div>
          {completed ? (
            <>
              <div className="reveal label-mono text-[11px] text-accent mb-2" style={{ '--reveal-i': 0 }}>
                {career ? '[ POSTING COMPLETE ]' : '[ CAMPAIGN COMPLETE / SANDBOX ]'}
              </div>
              <h2 className="reveal display-caps text-3xl xl:text-4xl max-w-2xl text-ink" style={{ '--reveal-i': 1 }}>
                {career ? 'The review is on your desk.' : 'The machine is yours.'}
              </h2>
            </>
          ) : (
            <ObjectiveHUD />
          )}
        </div>

        {/* hero numbers */}
        <div className="flex items-end gap-12">
          {metrics.map((m, i) => (
            <Metric key={m.label} {...m} revealIndex={2 + i} />
          ))}
        </div>

        {/* advisor ticker */}
        {last && (
          <div
            className={`reveal label-mono text-[11px] max-w-2xl truncate ${TYPE_COLOR[last.type] ?? 'text-ink/85'}`}
            style={{ '--reveal-i': 5 }}
          >
            {'>'} {last.text}
          </div>
        )}
      </div>
    </div>
  );
}
