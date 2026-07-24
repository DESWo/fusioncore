import { useCareerStore } from '../careerStore.js';
import { STATS, STAT_LABELS } from '../engine/balance.js';
import { displayStat } from '../engine/stats.js';
import { fmtMoney } from '../engine/money.js';

/** Four-axis radar, plain SVG. Warm fill, hairline web, labels outside. */
function Radar({ axes }) {
  const keys = Object.keys(axes);
  const size = 220;
  const c = size / 2;
  const r = 70;
  const pad = 62;
  const pt = (i, frac) => {
    const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
    return [c + Math.cos(angle) * r * frac, c + Math.sin(angle) * r * frac];
  };
  const poly = keys.map((k, i) => pt(i, Math.max(axes[k], 2) / 100).join(',')).join(' ');

  return (
    <svg
      viewBox={`${-pad} ${-10} ${size + pad * 2} ${size + 20}`}
      className="w-full max-w-[320px] mx-auto"
      role="img"
      aria-label="A shape describing the career"
    >
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon
          key={f}
          points={keys.map((_, i) => pt(i, f).join(',')).join(' ')}
          fill="none"
          stroke="rgba(240,226,210,0.10)"
          strokeWidth="0.8"
        />
      ))}
      {keys.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="rgba(240,226,210,0.10)" strokeWidth="0.8" />;
      })}
      <polygon points={poly} fill="rgba(224,138,60,0.22)" stroke="#E08A3C" strokeWidth="1.8" />
      {keys.map((k, i) => {
        const v = Math.round(axes[k]);
        const [px, py] = pt(i, 1.4);
        return (
          <g key={k}>
            <text
              x={px} y={py - 5} textAnchor="middle" dominantBaseline="middle"
              fill="#A2907F"
              style={{ fontSize: 9, fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
            >
              {k.split(' ')[0]}
            </text>
            <text
              x={px} y={py + 8} textAnchor="middle" dominantBaseline="middle"
              fill="#F4EDE4"
              style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600 }}
            >
              {v}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Retrospective() {
  const retro = useCareerStore((s) => s.retrospective);
  const exit = useCareerStore((s) => s.exit);
  const startCreation = useCareerStore((s) => s.startCreation);
  if (!retro) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="c-label">The retrospective</div>
        <h1 className="c-display text-[38px] mt-2 leading-[1.02]" style={{ color: 'var(--c-ink)' }}>
          {retro.name}
        </h1>
        <div className="text-[13px] mt-2 italic" style={{ color: 'var(--c-muted)' }}>
          Retired at {retro.age} · {retro.motivationLabel}
        </div>

        <div className="c-rule my-6"><span style={{ fontSize: 10 }}>◆</span></div>

        <p className="c-prose" style={{ fontSize: 17, lineHeight: 1.7 }}>{retro.opening}</p>
        {retro.life && (
          <p className="c-prose mt-3" style={{ fontSize: 15, color: 'var(--c-muted)' }}>
            {retro.life}
          </p>
        )}

        <div className="my-7">
          <Radar axes={retro.axes} />
        </div>

        <div
          className="px-5 py-5"
          style={{
            background: 'var(--c-accent-soft)',
            borderLeft: '2px solid var(--c-accent)',
            borderRadius: '0 12px 12px 0',
          }}
        >
          <p className="c-prose" style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--c-ink)' }}>
            {retro.closing}
          </p>
        </div>

        <div className="c-rule my-6"><span style={{ fontSize: 10 }}>◆</span></div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-3">
          {[
            ['Papers', retro.publications],
            ['Breakthroughs', retro.breakthroughs],
            ['People trained', retro.mentees],
            ['Experiments run', retro.sims],
            ['Credibility', retro.reputation.SCI],
            ['Public profile', retro.reputation.PUB],
            ['Net worth', fmtMoney(retro.worth)],
            ['Health at the end', Math.round(retro.health ?? 0)],
            ['Children', retro.children],
            ['Lived up to it', `${retro.alignment}%`],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-baseline" style={{ borderBottom: '1px solid var(--c-line)', paddingBottom: 6 }}>
              <span className="text-[13px]" style={{ color: 'var(--c-muted)' }}>{k}</span>
              <span className="c-num text-[16px]" style={{ color: 'var(--c-ink)' }}>{v}</span>
            </div>
          ))}
        </div>

        <div className="mt-7">
          <div className="c-label mb-2.5">What you became</div>
          <div className="grid gap-2">
            {STATS.map((k) => (
              <div key={k} className="flex justify-between items-baseline">
                <span className="text-[14px]" style={{ color: 'var(--c-muted)' }}>{STAT_LABELS[k]}</span>
                <span className="c-num text-[16px]" style={{ color: 'var(--c-ink)' }}>
                  {displayStat(retro.stats[k])}
                </span>
              </div>
            ))}
          </div>
        </div>

        {retro.highlights?.length > 0 && (
          <div className="mt-7">
            <div className="c-label mb-3">The moments that stuck</div>
            <div className="grid gap-3">
              {retro.highlights.map((h, i) => (
                <div key={i} style={{ paddingLeft: 14, borderLeft: '2px solid rgba(224,138,60,0.35)' }}>
                  <div className="c-display text-[15px]" style={{ color: 'var(--c-ink)' }}>
                    {h.event_title}
                  </div>
                  <div className="text-[11px]" style={{ color: 'var(--c-faint)' }}>age {h.age}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 p-5 flex gap-2.5" style={{ borderTop: '1px solid var(--c-line)' }}>
        <button onClick={exit} className="c-btn-ghost px-5 py-3.5 text-[13px]">Done</button>
        <button onClick={startCreation} className="c-btn flex-1 py-3.5 text-[14px]">
          Live another one
        </button>
      </div>
    </div>
  );
}
