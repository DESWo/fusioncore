import { useState, useId } from 'react';
import { defineTerm } from '../../data/glossary.js';

/**
 * A technical term that explains itself in one line on hover or focus.
 *
 * The three layers of explanation in this app, in order of how much they ask
 * of the player:
 *   1. this        one sentence, on hover, while your eyes are already there
 *   2. CalcDrawer  "how is this calculated", four layers with live numbers
 *   3. Cite        the actual literature
 *
 * Layer 1 was missing, so a player meeting "Greenwald fraction" for the first
 * time had a choice between guessing and opening a drawer mid-operation. The
 * point of a glance-level definition is that it costs nothing to read.
 *
 * Keyboard reachable on purpose: a definition only available to a mouse is not
 * available to everyone. The dotted underline is the affordance, so the term
 * does not have to move or change colour to advertise itself.
 */
export default function Term({ term, children, className = '' }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const def = defineTerm(term);
  const label = children ?? term;

  if (!def) return <>{label}</>;

  return (
    <span
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="cursor-help bg-transparent p-0 font-[inherit] text-[inherit] tracking-[inherit]
                   underline decoration-dotted decoration-from-font underline-offset-2
                   decoration-ink/40 hover:decoration-accent"
      >
        {label}
      </button>
      {open && (
        <span
          role="tooltip"
          id={id}
          className="absolute left-0 top-full z-50 mt-1 w-60 rounded border border-raise
                     bg-base/95 px-2 py-1.5 text-[10px] font-normal normal-case leading-snug
                     tracking-normal text-ink shadow-lg"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {def}
        </span>
      )}
    </span>
  );
}
