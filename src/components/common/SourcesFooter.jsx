import { useState } from 'react';
import sources from '../../data/sources.json';
import Icon from './Icon.jsx';

/** Persistent collapsible "Sources & Citations Index" (spec §12). */
export default function SourcesFooter() {
  const [open, setOpen] = useState(false);
  return (
    <div className="shrink-0 border-t border-slate-700 bg-panel">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-3 py-1.5 text-left text-[10px] uppercase tracking-widest text-slate-400 hover:text-accent flex items-center justify-between"
        aria-expanded={open}
      >
        <span>Sources &amp; Citations Index</span>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} className="w-3 h-3" />
      </button>
      {open && (
        <div className="max-h-40 overflow-y-auto px-3 pb-2 grid gap-1.5">
          {Object.entries(sources).map(([key, s]) => (
            <div key={key} className="text-[10px] leading-snug">
              <span className="text-ink">{s.title}</span>{' '}
              <span className="text-slate-500">, {s.source}</span>{' '}
              <a href={s.url} target="_blank" rel="noreferrer" className="text-sky-500 underline">
                link
              </a>
            </div>
          ))}
          <p className="text-[9px] text-slate-500 italic mt-1">
            Equations are slightly simplified for real-time gameplay. Each citation popover
            notes what the full analytical treatment adds.
          </p>
        </div>
      )}
    </div>
  );
}
