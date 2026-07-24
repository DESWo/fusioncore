import { useCareerStore } from '../careerStore.js';
import { BALANCE, STATS, STAT_LABELS } from '../engine/balance.js';
import { displayStat, segmentFill } from '../engine/stats.js';
import { stressBand, stressNote, STRESS_BAND } from '../engine/stress.js';
import { stageTitle } from '../engine/stages.js';
import { repNote } from '../engine/reputation.js';
import { healthBand, healthNote, lifeLine, HEALTH_BAND } from '../engine/life.js';
import { netWorth, fmtMoney, moneyNote } from '../engine/money.js';

const HEALTH_TONE = {
  [HEALTH_BAND.STRONG]: 'var(--c-good)',
  [HEALTH_BAND.FINE]: '#9BA86B',
  [HEALTH_BAND.WEARING]: 'var(--c-accent)',
  [HEALTH_BAND.FRAGILE]: 'var(--c-bad)',
};

const STRESS_TONE = {
  [STRESS_BAND.CALM]: 'var(--c-good)',
  [STRESS_BAND.ELEVATED]: '#C9A227',
  [STRESS_BAND.HIGH]: 'var(--c-accent)',
  [STRESS_BAND.CRITICAL]: 'var(--c-bad)',
};

/**
 * One stat. Filled against the whole 1..12 range so magnitude reads instantly
 * (the old version filled only inside the current integer segment, which made
 * a 9 and a 4 look identical). Hairline ticks mark whole points; the bright
 * cap shows how far into the current point you are.
 */
function Stat({ k, value }) {
  const pct = (value / BALANCE.STAT_MAX) * 100;
  const frac = segmentFill(value);
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="c-label shrink-0"
        style={{ width: 74, fontSize: 9, letterSpacing: '0.12em' }}
        title={STAT_LABELS[k]}
      >
        {STAT_LABELS[k]}
      </span>
      <div className="c-stat-track flex-1">
        <div className="c-stat-fill" style={{ width: `${pct}%` }} />
        {frac > 0.04 && value < BALANCE.STAT_MAX && (
          <div className="c-stat-cap" style={{ left: `calc(${pct}% - 3px)` }} />
        )}
        <div className="c-stat-ticks" aria-hidden="true">
          {Array.from({ length: BALANCE.STAT_MAX }, (_, i) => <span key={i} />)}
        </div>
      </div>
      <span className="c-num text-[15px] w-5 text-right" style={{ color: 'var(--c-ink)' }}>
        {displayStat(value)}
      </span>
    </div>
  );
}

export default function CareerHUD() {
  const player = useCareerStore((s) => s.player);
  const reputation = useCareerStore((s) => s.reputation);
  const setPanel = useCareerStore((s) => s.setPanel);
  const band = stressBand(player.stress);

  return (
    <div
      className="shrink-0 px-5 pt-4 pb-3"
      style={{ borderBottom: '1px solid var(--c-line)' }}
    >
      <div className="flex items-end justify-between mb-3">
        <div className="min-w-0">
          <div className="c-display text-[19px] truncate" style={{ color: 'var(--c-ink)' }}>
            {player.name || 'Unnamed'}
          </div>
          <div className="c-label mt-0.5 truncate">{stageTitle(player)}</div>
        </div>
        <div className="text-right shrink-0 ml-3 leading-none">
          <span className="c-num text-[30px]" style={{ color: 'var(--c-accent)' }}>
            {player.age}
          </span>
        </div>
      </div>

      <div className="grid gap-[7px]">
        {STATS.map((k) => (
          <Stat key={k} k={k} value={player.stats[k]} />
        ))}
      </div>

      <div className="mt-3">
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="c-label">Stress</span>
          <span
            className="text-[11px] italic"
            style={{ color: band === STRESS_BAND.CRITICAL ? 'var(--c-bad)' : 'var(--c-muted)' }}
          >
            {stressNote(player.stress)}
          </span>
        </div>
        <div className="c-stat-track">
          <div
            className="c-stat-fill"
            style={{ width: `${player.stress}%`, background: STRESS_TONE[band] }}
          />
        </div>
      </div>

      {/* the body and the bank account: the two things a career quietly spends */}
      <div className="flex gap-4 mt-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1">
            <span className="c-label">Health</span>
            <span className="c-num text-[13px]" style={{ color: 'var(--c-ink)' }}>
              {Math.round(player.health ?? 0)}
            </span>
          </div>
          <div className="c-stat-track">
            <div
              className="c-stat-fill"
              style={{ width: `${player.health ?? 0}%`, background: HEALTH_TONE[healthBand(player.health ?? 0)] }}
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1">
            <span className="c-label">Money</span>
            <span
              className="c-num text-[13px]"
              style={{ color: netWorth(player) < 0 ? 'var(--c-bad)' : 'var(--c-ink)' }}
            >
              {fmtMoney(netWorth(player))}
            </span>
          </div>
          <div className="text-[10px] italic truncate" style={{ color: 'var(--c-faint)' }}>
            {moneyNote(player)}
          </div>
        </div>
      </div>

      <div className="text-[11px] italic mt-2 truncate" style={{ color: 'var(--c-muted)' }}>
        {lifeLine(player)}
      </div>

      <button
        onClick={() => setPanel('stats')}
        className="w-full mt-2.5 flex gap-4 text-left cursor-pointer"
        aria-label="Open detailed standing"
      >
        {['SCI', 'PUB', 'NET'].map((t) => (
          <div key={t} className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="c-num text-[15px]" style={{ color: 'var(--c-ink)' }}>
                {reputation[t]}
              </span>
              <span className="c-label" style={{ fontSize: 8 }}>{t}</span>
            </div>
            <div
              className="text-[10px] italic truncate"
              style={{ color: 'var(--c-faint)' }}
            >
              {repNote(t, reputation[t])}
            </div>
          </div>
        ))}
      </button>
    </div>
  );
}
