import { motion, useReducedMotion } from 'framer-motion';
import { useReactorStore } from '../../store/reactorStore.js';
import { fmtMoney, fmtQ } from '../../utils/units.js';
import Cite from '../common/Cite.jsx';
import SpeakerIcon from '../common/SpeakerIcon.jsx';
import Icon from '../common/Icon.jsx';

/**
 * The incident report, read as a causal chain.
 *
 * `src/engine/failure.js` already derives a real report from live plant state:
 * a primary cause, contributing factors that only appear when the data
 * supports them, and one recommendation. What it could not do is make the
 * CAUSALITY visible: the modal named an outcome and then set a paragraph
 * against it, so "why did that happen" was something you had to reconstruct.
 *
 * Same data, laid out as the chain it already is:
 *
 *   1  conditions at failure    (the live factors)
 *   2  the component that went  (from gameOver.component)
 *   3  what that did next       (the immediate consequence)
 *   4  the outcome              (the run ends here)
 *
 * The chain assembles link by link over about a second, so the moment is held
 * long enough to be read rather than dismissed. Under reduced motion it is all
 * there at once, which is the same information without the theatre.
 *
 * Consolidated while here: `gameOver.text` restated the engine's primary cause
 * almost verbatim, so it now appears only when there is no report to show.
 * Run statistics dropped from a four-row grid to one mono line: they are
 * context, not the point.
 */

/** The link between "a component failed" and "the run is over". */
const CONSEQUENCE = {
  firstWall: { beat: 'FIRST WALL FRACTURED', next: 'VACUUM BOUNDARY LOST' },
  divertor: { beat: 'DIVERTOR ARMOR FAILED', next: 'TUNGSTEN INFLUX POISONED THE PLASMA' },
  magnets: { beat: 'COIL STRUCTURE CRACKED', next: 'FIELD COLLAPSED, NO MAGNETIC BOTTLE' },
  cladding: { beat: 'FUEL CLADDING RUPTURED', next: 'FISSION PRODUCTS INTO THE PRIMARY COOLANT' },
  vessel: { beat: 'PRESSURE VESSEL EMBRITTLED', next: 'FRACTURE MARGIN GONE, PLANT UNCERTIFIABLE' },
  steamGen: { beat: 'STEAM GENERATOR TUBES CRACKED', next: 'PRIMARY LEAKING TO THE SECONDARY SIDE' },
};

export default function GameOverModal() {
  const gameOver = useReactorStore((s) => s.gameOver);
  const funds = useReactorStore((s) => s.econ.funds);
  const stats = useReactorStore((s) => s.stats);
  const levelId = useReactorStore((s) => s.level.id);
  const repair = useReactorStore((s) => s.repairReactor);
  const settingStill = useReactorStore((s) => s.settings.reducedMotion);
  const osStill = useReducedMotion();
  const still = settingStill || osStill;
  if (!gameOver) return null;

  const canAfford = funds >= gameOver.fee;
  const report = gameOver.report;
  const link = CONSEQUENCE[gameOver.component];

  // Four links, each one only present when there is real data behind it.
  const chain = [];
  if (report?.factors?.length) {
    chain.push({ beat: 'CONDITIONS AT FAILURE', factors: report.factors });
  }
  if (link) chain.push({ beat: link.beat, detail: report?.primary, cite: gameOver.cite });
  else if (report?.primary) chain.push({ beat: 'PRIMARY CAUSE', detail: report.primary, cite: gameOver.cite });
  if (link) chain.push({ beat: link.next });
  chain.push({ beat: gameOver.title, detail: report ? null : gameOver.text, terminal: true });

  const spoken = [
    'Reactor scram.',
    ...chain.map((c, i) => `${i + 1}. ${c.beat}.${c.detail ? ` ${c.detail}` : ''}`),
    report ? `Recommendation. ${report.recommendation}` : '',
  ].join(' ');

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
      <motion.div
        initial={still ? false : { opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-panel border-2 border-crit max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="gameover-title"
        aria-describedby="gameover-chain"
      >
        <div className="label-mono text-[9px] text-crit">Emergency SCRAM · incident report</div>
        <h2 id="gameover-title" className="text-xl font-black mt-1.5 text-crit flex items-center gap-2">
          {gameOver.title}
          <SpeakerIcon text={spoken} />
        </h2>

        {/* The chain. This is the hero of the modal, not an appendix to it. */}
        <ol id="gameover-chain" className="mt-4 grid gap-0">
          {chain.map((c, i) => (
            <motion.li
              key={c.beat}
              className="relative pl-7 pb-3 last:pb-0"
              initial={still ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={still ? { duration: 0 } : { delay: 0.18 + i * 0.3, duration: 0.3 }}
            >
              <span
                className={`absolute left-0 top-0 w-[18px] h-[18px] flex items-center justify-center font-mono text-[9px] ${
                  c.terminal ? 'bg-crit text-base font-bold' : 'border border-crit/70 text-crit'
                }`}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              {i < chain.length - 1 && (
                <span className="absolute left-[9px] top-[20px] bottom-0 w-px bg-crit/35" aria-hidden="true" />
              )}
              <div className={`label-mono leading-tight ${c.terminal ? 'text-[11px] text-crit' : 'text-[10px] text-ink'}`}>
                {c.beat}
              </div>
              {c.detail && (
                <p className="text-[11px] text-ink/80 leading-snug mt-1">
                  {c.detail} {c.cite && <Cite id={c.cite} />}
                </p>
              )}
              {c.factors && (
                <ul className="mt-1 grid gap-0.5">
                  {c.factors.map((f) => (
                    <li key={f} className="text-[11px] text-ink/80 leading-snug flex gap-1.5">
                      <span className="text-crit shrink-0" aria-hidden="true">·</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.li>
          ))}
        </ol>

        {report && (
          <div className="mt-4 border-l-2 border-accent bg-base/60 pl-2.5 py-2 pr-2">
            <div className="label-mono text-[9px] text-ink/55">To prevent this</div>
            <p className="text-[11px] text-accent leading-snug mt-0.5">{report.recommendation}</p>
          </div>
        )}

        {/* Secondary by intent: true, worth knowing, not what you are here for. */}
        <p className="text-[10px] text-ink/55 leading-snug mt-3">
          <span className="label-mono text-[9px] text-ink/45">Precedent </span>
          {gameOver.historical}
        </p>
        <div className="font-mono text-[10px] text-ink/55 mt-2 flex flex-wrap gap-x-3 gap-y-0.5">
          <span>Disruptions {stats.disruptions}</span>
          <span>Quenches {stats.quenches}</span>
          <span>Peak Q {fmtQ(stats.maxQ)}</span>
          <span>Repairs {stats.repairs}</span>
        </div>

        <div className="mt-5 border-t border-raise pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-ink/85">Repair &amp; component replacement</span>
            <span className="font-mono font-bold text-warn">{fmtMoney(gameOver.fee)}</span>
          </div>
          <div className="flex justify-between text-[11px] mt-1">
            <span className="text-ink/55">Capital reserves</span>
            <span className={`font-mono ${canAfford ? 'text-ink/85' : 'text-crit'}`}>{fmtMoney(funds)}</span>
          </div>
          <p className="text-[10px] text-ink/55 mt-2">
            Repairs restore all structural systems to 100%, flush the vacuum chamber, and reset
            controls to the Level {levelId} safe baseline.
          </p>
          <button
            onClick={repair}
            autoFocus
            className={`mt-4 w-full py-2.5 font-bold text-sm tracking-widest ${
              canAfford ? 'bg-warn text-base hover:brightness-110' : 'bg-crit text-base hover:brightness-110'
            }`}
          >
            {canAfford ? 'AUTHORIZE REPAIR FEE' : 'AUTHORIZE EMERGENCY DEBT FINANCING'}
          </button>
          {!canAfford && (
            <p className="text-[9px] text-crit mt-1.5 text-center flex items-center justify-center gap-1">
              <Icon name="warn" className="w-3 h-3 shrink-0" />
              Reserves insufficient. The board approves high-interest financing; funds go negative.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
