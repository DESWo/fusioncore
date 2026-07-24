import { motion } from 'framer-motion';
import { useCareerStore } from '../careerStore.js';
import { STATS, STAT_LABELS, STAT_BLURBS, REPUTATION_LABELS } from '../engine/balance.js';
import { tierOf, TIER_BLURB } from '../engine/relationships.js';

const TIER_COLOR = {
  hostile: 'var(--c-bad)',
  cold: 'var(--c-faint)',
  neutral: 'var(--c-muted)',
  warm: 'var(--c-accent)',
  ally: 'var(--c-good)',
};

const TITLES = {
  relationships: 'The people',
  log: 'What happened',
  stats: 'Where you stand',
};

export default function CareerPanels() {
  const panel = useCareerStore((s) => s.panel);
  const setPanel = useCareerStore((s) => s.setPanel);
  const relationships = useCareerStore((s) => s.relationships);
  const careerLog = useCareerStore((s) => s.careerLog);
  const player = useCareerStore((s) => s.player);
  const reputation = useCareerStore((s) => s.reputation);
  if (!panel) return null;

  const met = relationships.filter((r) => r.history.length > 0 || r.score !== 50);

  return (
    <div className="absolute inset-0 z-40 flex justify-end">
      <button
        aria-label="Close"
        onClick={() => setPanel(null)}
        className="absolute inset-0 cursor-pointer"
        style={{ background: 'rgba(10, 7, 5, 0.75)' }}
      />
      <motion.div
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full flex flex-col"
        style={{ background: 'var(--c-surface)', borderLeft: '1px solid var(--c-line)' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--c-line)' }}
        >
          <span className="c-display text-[20px]" style={{ color: 'var(--c-ink)' }}>
            {TITLES[panel]}
          </span>
          <button onClick={() => setPanel(null)} className="c-btn-ghost px-4 py-2 text-[12px]">
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {panel === 'relationships' && (
            met.length === 0
              ? <p className="c-prose italic" style={{ color: 'var(--c-faint)' }}>
                  Nobody has made an impression yet. Give it a few years.
                </p>
              : <div className="grid gap-4">
                  {met.sort((a, b) => b.score - a.score).map((r) => {
                    const tier = tierOf(r.score);
                    return (
                      <div key={r.id} style={{ borderBottom: '1px solid var(--c-line)', paddingBottom: 14 }}>
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="c-display text-[17px]" style={{ color: 'var(--c-ink)' }}>
                            {r.name}
                          </span>
                          <span className="c-label shrink-0" style={{ color: TIER_COLOR[tier] }}>
                            {tier}
                          </span>
                        </div>
                        <div className="text-[11px] capitalize mt-0.5" style={{ color: 'var(--c-faint)' }}>
                          {r.role} · met at {r.met_age}
                        </div>
                        <p className="text-[13px] mt-1.5 italic" style={{ color: 'var(--c-muted)' }}>
                          {TIER_BLURB[tier]}
                        </p>
                        {r.history.slice(-2).map((h, i) => (
                          <div key={i} className="text-[11px] mt-1" style={{ color: 'var(--c-faint)' }}>{h}</div>
                        ))}
                      </div>
                    );
                  })}
                </div>
          )}

          {panel === 'log' && (
            careerLog.length === 0
              ? <p className="c-prose italic" style={{ color: 'var(--c-faint)' }}>
                  The log starts filling the moment you do something.
                </p>
              : <div className="grid gap-4">
                  {[...careerLog].reverse().map((e, i) => (
                    <div key={i} style={{ borderBottom: '1px solid var(--c-line)', paddingBottom: 14 }}>
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="c-display text-[16px]" style={{ color: 'var(--c-ink)' }}>
                          {e.event_title}
                        </span>
                        <span className="c-num text-[12px] shrink-0" style={{ color: 'var(--c-faint)' }}>
                          {e.age}
                        </span>
                      </div>
                      {e.choice_made && (
                        <div className="text-[12px] mt-1" style={{ color: 'var(--c-accent)' }}>
                          {e.choice_made}
                        </div>
                      )}
                      <p className="c-prose mt-1" style={{ fontSize: 13, color: 'var(--c-muted)' }}>
                        {e.result_text}
                      </p>
                    </div>
                  ))}
                </div>
          )}

          {panel === 'stats' && (
            <div className="grid gap-4">
              {STATS.map((k) => (
                <div key={k}>
                  <div className="flex justify-between items-baseline">
                    <span className="c-display text-[17px]" style={{ color: 'var(--c-ink)' }}>
                      {STAT_LABELS[k]}
                    </span>
                    <span className="c-num text-[16px]" style={{ color: 'var(--c-accent)' }}>
                      {player.stats[k].toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[12px] mt-1 italic" style={{ color: 'var(--c-faint)' }}>
                    {STAT_BLURBS[k]}
                  </p>
                </div>
              ))}

              <div className="c-rule my-1"><span style={{ fontSize: 10 }}>◆</span></div>

              <div className="grid gap-2">
                {Object.entries(REPUTATION_LABELS).map(([k, label]) => (
                  <div key={k} className="flex justify-between items-baseline">
                    <span className="text-[14px]" style={{ color: 'var(--c-muted)' }}>{label}</span>
                    <span className="c-num text-[16px]" style={{ color: 'var(--c-ink)' }}>{reputation[k]}</span>
                  </div>
                ))}
              </div>

              <div className="c-rule my-1"><span style={{ fontSize: 10 }}>◆</span></div>

              <div className="grid gap-2">
                {[
                  ['Papers published', player.publications],
                  ['Breakthroughs', player.breakthroughs],
                  ['People trained', player.mentees_count],
                  ['Experiments run', player.reactor_sims_completed],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-baseline">
                    <span className="text-[14px]" style={{ color: 'var(--c-muted)' }}>{k}</span>
                    <span className="c-num text-[16px]" style={{ color: 'var(--c-ink)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
