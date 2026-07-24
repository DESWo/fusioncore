import { useState } from 'react';
import sources from '../../data/sources.json';

/**
 * Inline citation marker. Hover / tap / focus opens a popover with the full
 * bibliographic entry from sources.json (spec §12).
 */
export default function Cite({ id, className = '' }) {
  const [open, setOpen] = useState(false);
  const src = sources[id];
  if (!src) return null;
  return (
    <span
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        aria-label={`Source: ${src.title}`}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-700 text-accent text-[9px] font-bold align-middle hover:bg-slate-600"
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full right-0 mb-1.5 w-72 max-w-[80vw] rounded-lg border border-slate-600 bg-slate-900 p-3 text-left shadow-2xl block"
        >
          <span className="block text-xs font-semibold text-ink">{src.title}</span>
          <span className="block text-[10px] text-accent mt-0.5">{src.source}</span>
          {src.note && <span className="block text-[10px] text-slate-400 mt-1 leading-snug">{src.note}</span>}
          <a
            href={src.url}
            target="_blank"
            rel="noreferrer"
            className="block text-[10px] text-sky-500 underline mt-1 truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {src.url}
          </a>
        </span>
      )}
    </span>
  );
}
