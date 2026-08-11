import { useReactorStore } from '../../store/reactorStore.js';
import Cite from '../common/Cite.jsx';

/**
 * One operational input. Locks itself during onboarding unless it is the
 * highlighted step control; respects level-gated availability.
 */
export default function ControlSlider({
  controlKey, label, unit, min, max, step, format, cite, disabled = false, highlight = false, danger,
}) {
  const value = useReactorStore((s) => s.sim.controls[controlKey]);
  const setControl = useReactorStore((s) => s.setControl);
  const shown = format ? format(value) : value.toFixed(1);
  const dangerous = danger !== undefined && value > danger;

  return (
    <div className={`px-3 py-2 bg-panel ${highlight ? 'ui-highlight' : ''} ${disabled ? 'ui-locked' : ''}`}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={`ctl-${controlKey}`} className="text-[10px] uppercase tracking-wider text-ink/70 flex items-center gap-1">
          {label} {cite && <Cite id={cite} />}
        </label>
        <span className={`font-mono text-xs font-bold ${dangerous ? 'text-warn' : 'text-accent'}`}>
          {shown} {unit}
        </span>
      </div>
      <input
        id={`ctl-${controlKey}`}
        type="range"
        className="w-full mt-1"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-label={`${label}: ${shown} ${unit}`}
        onChange={(e) => setControl(controlKey, parseFloat(e.target.value))}
      />
      <div className="flex justify-between text-[8px] text-ink/55 font-mono">
        <span>{min}</span>
        {danger !== undefined && <span className="text-warn">⚠ {danger}+</span>}
        <span>{max}</span>
      </div>
    </div>
  );
}
