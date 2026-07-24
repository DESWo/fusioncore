import { useState } from 'react';
import Cite from './Cite.jsx';
import Icon from './Icon.jsx';

/**
 * "How is this calculated?" drawer. Four layers, in order:
 * what it means, what changes it, the equation, the live substituted numbers.
 * The equation is earned, not the greeting.
 */
export default function CalcDrawer({ calc }) {
  const [open, setOpen] = useState(false);
  if (!calc) return null;
  return (
    <div className="mt-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-[9px] text-accent/80 hover:text-accent flex items-center gap-1"
        aria-expanded={open}
      >
        <Icon name={open ? 'chevronDown' : 'chevronRight'} className="w-2.5 h-2.5" />
        How is this calculated?
      </button>
      {open && (
        <div className="mt-1.5 rounded-md border border-slate-700 bg-slate-900/70 p-2.5 grid gap-2">
          <div>
            <div className="text-[8px] uppercase tracking-widest text-slate-500">What it means</div>
            <p className="text-[10px] text-slate-200 leading-snug">{calc.meaning}</p>
          </div>
          <div>
            <div className="text-[8px] uppercase tracking-widest text-slate-500">What changes it</div>
            <p className="text-[10px] text-slate-300 leading-snug">{calc.drivers}</p>
          </div>
          {calc.equation && (
            <div>
              <div className="text-[8px] uppercase tracking-widest text-slate-500">Equation</div>
              <div className="font-mono text-[11px] text-accent mt-0.5">{calc.equation}</div>
            </div>
          )}
          {calc.steps?.length > 0 && (
            <div>
              <div className="text-[8px] uppercase tracking-widest text-slate-500">Current calculation</div>
              <div className="grid gap-0.5 mt-0.5">
                {calc.steps.map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[10px]">
                    <span className="text-slate-400">{k}</span>
                    <span className="font-mono text-slate-200">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {calc.limitedBy?.length > 0 && (
            <div>
              <div className="text-[8px] uppercase tracking-widest text-slate-500">Currently limited by</div>
              <div className="grid gap-0.5 mt-0.5">
                {calc.limitedBy.map((l) => (
                  <div key={l} className="text-[10px] text-warn leading-snug flex gap-1.5">
                    <span className="shrink-0">•</span><span>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {calc.assumptions && (
            <p className="text-[9px] text-slate-500 leading-snug border-t border-slate-700 pt-1.5">
              Assumptions and limits: {calc.assumptions} {calc.cite && <Cite id={calc.cite} />}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
