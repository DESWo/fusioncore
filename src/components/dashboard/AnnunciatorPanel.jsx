import { memo } from 'react';
import { useReactorStore } from '../../store/reactorStore.js';
import { tilesFor, STATE_CODES } from '../../engine/annunciator.js';

/**
 * The annunciator: hard tiles wired to plant state, never to scripted events.
 *
 * Control-room convention, and the whole point of it: a tile entering caution
 * or alarm latches and flashes until you acknowledge it, then stays lit at its
 * condition colour until the condition physically clears. Acknowledging
 * silences the flash; it does not clear the alarm. If the condition clears and
 * returns, it latches again rather than staying silently silenced.
 *
 * Styled in the existing instrument language (navy panel, semantic status
 * colours) rather than as a separate design. It sits above HazardBanner, which
 * complements it: the annunciator says which limits are in trouble, the banner
 * counts down the one about to bite.
 */

// Colour carries state, and so does the two-character code, because the app
// ships three colorblind overlays that swap these very variables. The dashed
// and doubled borders come from the existing status-* shape coding.
const TILE_STYLE = {
  off: 'bg-slate-800/50 border border-slate-700 text-slate-500',
  normal: 'bg-safe/10 border border-safe/50 text-safe',
  caution: 'status-warn bg-warn/15 text-warn',
  alarm: 'status-crit bg-crit/20 text-crit',
};

const STATE_WORD = {
  off: 'off', normal: 'normal', caution: 'caution', alarm: 'alarm',
};

// Four across at 404px leaves roughly 90px a tile, so the panel legends are
// shortened here rather than in the engine: the full text stays the tile's
// accessible name, which is what a screen reader reads out.
const SHORT = {
  greenwald: 'GREENWALD',
  beta: 'BETA',
  divertor: 'DIVERTOR',
  tfcoil: 'TF COIL',
  shinethrough: 'SHINE-THRU',
  firstwall: 'FIRST WALL',
  tritium: 'TRITIUM',
  netpower: 'NET POWER',
};

function Tile({ id, legend, state, latched }) {
  return (
    <div
      className={`rounded px-1 py-0.5 flex items-center justify-between gap-1 min-w-0 ${
        latched
          ? `annunciator-latched border ${state === 'alarm' ? 'status-crit' : state === 'caution' ? 'status-warn' : ''}`
          : TILE_STYLE[state] ?? TILE_STYLE.off
      }`}
      // Drives which flash keyframe runs, so a latched caution flashes amber
      // rather than critical red. The status-* class above keeps the border
      // shape-coding while latched, so severity survives without colour.
      data-state={state}
      role="status"
      aria-label={`${legend}: ${STATE_WORD[state] ?? 'off'}${latched ? ', unacknowledged' : ''}`}
      title={legend}
    >
      <span className="label-mono text-[7px] leading-tight truncate">{SHORT[id] ?? legend}</span>
      <span className="font-mono text-[7px] shrink-0 tabular-nums">
        {STATE_CODES[state] ?? '--'}
      </span>
    </div>
  );
}

const MemoTile = memo(Tile);

function AnnunciatorPanel() {
  const mode = useReactorStore((s) => s.mode);
  const ann = useReactorStore((s) => s.annunciator);
  const ack = useReactorStore((s) => s.ackAnnunciator);
  const tiles = tilesFor(mode);
  if (tiles.length === 0) return null;

  const unacked = Object.keys(ann.latched).length;

  return (
    <div className="bg-panel/70 border-b border-slate-700/60 px-2 py-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[8px] uppercase tracking-widest text-slate-400">
          Annunciator
        </span>
        <button
          type="button"
          onClick={ack}
          disabled={unacked === 0}
          aria-label={
            unacked === 0
              ? 'Acknowledge, no active alarms'
              : `Acknowledge ${unacked} ${unacked === 1 ? 'alarm' : 'alarms'}`
          }
          className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded ${
            unacked > 0
              ? 'bg-crit/25 text-crit hover:bg-crit/40'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          ACK{unacked > 0 ? ` ${unacked}` : ''}
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0.5">
        {tiles.map((t) => (
          <MemoTile
            key={t.id}
            id={t.id}
            legend={t.legend}
            state={ann.state[t.id] ?? 'off'}
            latched={Boolean(ann.latched[t.id])}
          />
        ))}
      </div>
    </div>
  );
}

export default memo(AnnunciatorPanel);
