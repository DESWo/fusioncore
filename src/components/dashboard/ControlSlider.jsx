import { useReactorStore } from '../../store/reactorStore.js';
import Cite from '../common/Cite.jsx';

/**
 * One operational input. Locks itself during onboarding unless it is the
 * highlighted step control; respects level-gated availability.
 *
 * Wears `.ctl` (raised, grab rail, reacts to hover and focus) and `.ctl-range`
 * (carved track, knurled handle). Passive telemetry wears `.readout` and gets
 * neither, which is the whole of the "can I touch this" distinction.
 */
export default function ControlSlider({
  controlKey, label, unit, min, max, step, format, cite, disabled = false, highlight = false, danger,
}) {
  const value = useReactorStore((s) => s.sim.controls[controlKey]);
  const setControl = useReactorStore((s) => s.setControl);
  const shown = format ? format(value) : value.toFixed(1);
  const dangerous = danger !== undefined && value > danger;

  return (
    <div className={`ctl px-3 py-2 ${highlight ? 'ui-highlight' : ''} ${disabled ? 'ui-locked' : ''}`}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={`ctl-${controlKey}`} className="text-[10px] uppercase tracking-wider text-ink/85 flex items-center gap-1">
          {label} {cite && <Cite id={cite} />}
        </label>
        {/* tabular figures: a value that jiggles sideways as you drag reads as
            noise, and this is the number you are steering by */}
        <span className={`font-mono text-xs font-bold tabular-nums ${dangerous ? 'text-warn' : 'text-accent'}`}>
          {shown} {unit}
        </span>
      </div>
      <input
        id={`ctl-${controlKey}`}
        type="range"
        className="ctl-range w-full mt-1.5"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={`${label}: ${shown} ${unit}`}
        onChange={(e) => setControl(controlKey, parseFloat(e.target.value))}
      />
      <div className="flex justify-between text-[8px] text-ink/55 font-mono mt-0.5">
        <span>{min}</span>
        {danger !== undefined && <span className="text-warn">⚠ {danger}+</span>}
        <span>{max}</span>
      </div>
    </div>
  );
}
