import { useEffect, useRef, useState } from 'react';
import { useCareerStore } from '../careerStore.js';
import { createSimState, physicsTick } from '../../engine/physics.js';
import { createFissionState, fissionTick } from '../../engine/fission.js';
import { SIM_DT_S } from '../../engine/constants.js';
import { fmtPower } from '../../utils/format.js';

// The career set-pieces run the real physics engine (spec §8.2), with a
// control set trimmed to what the moment is actually about. Full-fat operation
// lives in the standalone reactor modes; here the question is narrower: can you
// hit the number before the clock runs out.

const TICK_MS = 100;

function metricValue(metric, sim, mode) {
  const p = sim.physics;
  if (mode === 'fission') {
    if (metric === 'stability') return p.scrammed ? 0 : 1;
    return p.P ?? 0;
  }
  if (metric === 'q_factor') return p.Q ?? 0;
  if (metric === 'burn_duration') return p.pFusionMW > 1 ? 1 : 0;
  return 0;
}

export default function CareerSim() {
  const pendingSim = useCareerStore((s) => s.pendingSim);
  const resolveSim = useCareerStore((s) => s.resolveSim);
  const preset = pendingSim?.preset;
  const isFission = preset?.mode === 'fission';

  const simRef = useRef(isFission ? createFissionState('pwr') : createSimState());
  const [, force] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [held, setHeld] = useState(0);        // seconds spent at or above target
  const [best, setBest] = useState(0);
  const [done, setDone] = useState(null);
  const faultRef = useRef(false);
  // The run clock also lives in a ref so the tick closure can read it without
  // `elapsed` being an effect dependency: with it in the deps the interval was
  // torn down and rebuilt on every tick, roughly 1800 times over a 180s run.
  const elapsedRef = useRef(0);

  // fission set-pieces start hot: the career moment is the transient, not the heatup
  useEffect(() => {
    if (!isFission) return;
    const s = simRef.current;
    s.controls = { ...s.controls, rods: 34, pumps: 100, heaters: true };
    s.physics = {
      ...s.physics, TcoolC: 305, TfuelC: 1200, P: 2600, avgP: 2600,
      rodPos: 34, critical: true, plasmaOn: true, hotStandbyNoted: true,
    };
  }, [isFission]);

  useEffect(() => {
    if (done) return undefined;
    const id = setInterval(() => {
      const sim = simRef.current;
      const r = isFission ? fissionTick(sim, Math.random) : physicsTick(sim, Math.random);
      simRef.current = {
        ...sim,
        controls: r.controls,
        physics: r.physics,
        structure: r.structure,
        fuel: r.fuel,
        hazards: r.hazards,
        time: { simSeconds: sim.time.simSeconds + SIM_DT_S, ticks: sim.time.ticks + 1 },
      };
      if (!isFission && simRef.current.fuel.tritium < 5) simRef.current.fuel.tritium += 20;

      // the crisis sim breaks something on you partway through (§8.4)
      if (preset.inject_fault && !faultRef.current && elapsedRef.current > 25) {
        faultRef.current = true;
        simRef.current.controls = { ...simRef.current.controls, pumps: 25 };
      }

      const v = metricValue(preset.target_metric, simRef.current, preset.mode);
      setBest((b) => Math.max(b, v));
      if (v >= preset.target_value) setHeld((h) => h + TICK_MS / 1000);
      elapsedRef.current += TICK_MS / 1000;
      setElapsed(elapsedRef.current);
      force((n) => n + 1);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [done, isFission, preset]);

  // resolve when the clock expires
  useEffect(() => {
    if (done || elapsed < preset.time_limit_seconds) return;
    const ratio = best / preset.target_value;
    const outcome = held >= 12 && ratio >= 1 ? 'excellent'
      : ratio >= 0.75 ? 'adequate'
      : 'failure';
    setDone(outcome);
  }, [elapsed, best, held, done, preset]);

  if (!pendingSim) return null;
  const sim = simRef.current;
  const p = sim.physics;
  const value = metricValue(preset.target_metric, sim, preset.mode);
  const pct = Math.min((value / preset.target_value) * 100, 100);
  const timeLeft = Math.max(preset.time_limit_seconds - elapsed, 0);

  const setControl = (key, v) => {
    simRef.current = { ...sim, controls: { ...sim.controls, [key]: v } };
    force((n) => n + 1);
  };

  const metricName = preset.target_metric === 'q_factor' ? 'Energy gain'
    : preset.target_metric === 'stability' ? 'The plant'
    : 'Sustained burn';

  return (
    <div className="flex-1 overflow-y-auto px-5 py-5 min-h-0">
      <div className="c-label" style={{ color: 'var(--c-accent)' }}>At the machine</div>
      <h2 className="c-display text-[24px] mt-1.5" style={{ color: 'var(--c-ink)' }}>
        {pendingSim.title}
      </h2>
      <p className="c-prose mt-2.5" style={{ fontSize: 14 }}>{pendingSim.narrative_setup}</p>

      {done ? (
        <div className="mt-6">
          <div className="c-rule mb-3"><span style={{ fontSize: 10 }}>◆</span></div>
          <div
            className="c-label mb-1.5"
            style={{ color: done === 'failure' ? 'var(--c-bad)' : done === 'excellent' ? 'var(--c-good)' : 'var(--c-accent)' }}
          >
            {done === 'excellent' ? 'Exceptional' : done === 'adequate' ? 'You got it' : 'The run failed'}
          </div>
          <p
            className="c-prose"
            style={{
              color: 'var(--c-ink)',
              paddingLeft: 14,
              borderLeft: `2px solid ${done === 'failure' ? 'var(--c-bad)' : 'var(--c-accent)'}`,
            }}
          >
            {pendingSim.effects[done].text}
          </p>
          <button
            onClick={() => resolveSim(pendingSim.sim_id, done)}
            autoFocus
            className="c-btn w-full mt-6 py-3.5 text-[14px]"
          >
            Go on
          </button>
        </div>
      ) : (
        <>
          <div className="c-card px-4 py-4 mt-5">
            <div className="flex justify-between items-baseline">
              <span className="c-label">{metricName}</span>
              <span
                className="c-num text-[13px]"
                style={{ color: timeLeft < 20 ? 'var(--c-bad)' : 'var(--c-faint)' }}
              >
                {timeLeft.toFixed(0)}s
              </span>
            </div>
            <div className="flex items-baseline gap-2.5 mt-1">
              <span className="c-num text-[38px] leading-none" style={{ color: 'var(--c-ink)' }}>
                {preset.target_metric === 'stability'
                  ? (p.scrammed ? 'tripped' : 'holding')
                  : value.toFixed(2)}
              </span>
              <span className="text-[12px] italic" style={{ color: 'var(--c-faint)' }}>
                need {preset.target_value}
              </span>
            </div>
            <div className="c-stat-track mt-3">
              <div
                className="c-stat-fill"
                style={{
                  width: `${pct}%`,
                  background: pct >= 100
                    ? 'linear-gradient(90deg,#6E9455,var(--c-good))'
                    : 'linear-gradient(90deg,#B4652A,var(--c-accent))',
                  transition: 'width 200ms linear',
                }}
              />
            </div>
            {faultRef.current && (
              <div className="text-[12px] mt-2.5 italic" style={{ color: 'var(--c-bad)' }}>
                A coolant pump just tripped. Compensate.
              </div>
            )}
          </div>

          <div className="grid gap-4 mt-5">
            {isFission ? (
              <>
                <Slider label="Control rods" unit="% in" min={0} max={100} step={1}
                  value={sim.controls.rods} onChange={(v) => setControl('rods', v)} />
                <Slider label="Coolant pumps" unit="%" min={10} max={100} step={1}
                  value={sim.controls.pumps} onChange={(v) => setControl('pumps', v)} />
                <Readout rows={[
                  ['Thermal power', fmtPower(p.P ?? 0)],
                  ['Fuel temperature', `${(p.TfuelC ?? 0).toFixed(0)} °C`],
                ]} />
              </>
            ) : (
              <>
                <Slider label="Magnetic field" unit="T" min={1} max={sim.controls.bMax ?? 12} step={0.1}
                  value={sim.controls.B} onChange={(v) => setControl('B', v)} />
                <Slider label="Heating" unit="MW" min={0} max={50} step={0.5}
                  value={sim.controls.heat} onChange={(v) => setControl('heat', v)} />
                <Slider label="Fuel density" unit="×10²⁰" min={0.1} max={5} step={0.05}
                  value={sim.controls.density} onChange={(v) => setControl('density', v)} />
                <Readout rows={[
                  ['Temperature', `${(p.T ?? 0).toFixed(1)} keV`],
                  ['Fusion power', fmtPower(p.pFusionMW ?? 0)],
                ]} />
              </>
            )}
          </div>

          <button
            onClick={() => resolveSim(pendingSim.sim_id, 'adequate')}
            className="c-btn-ghost w-full mt-6 py-3 text-[13px]"
          >
            Let the team finish it
          </button>
        </>
      )}
    </div>
  );
}

function Slider({ label, unit, min, max, step, value, onChange }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[14px]" style={{ color: 'var(--c-muted)' }}>{label}</span>
        <span className="c-num text-[15px]" style={{ color: 'var(--c-accent)' }}>
          {Number(value).toFixed(step < 1 ? 2 : 0)}
          <span className="text-[11px] ml-1" style={{ color: 'var(--c-faint)' }}>{unit}</span>
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        aria-label={label}
      />
    </div>
  );
}

function Readout({ rows }) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-1">
      {rows.map(([k, v]) => (
        <div key={k}>
          <div className="c-label" style={{ fontSize: 9 }}>{k}</div>
          <div className="c-num text-[17px] mt-0.5" style={{ color: 'var(--c-ink)' }}>{v}</div>
        </div>
      ))}
    </div>
  );
}
