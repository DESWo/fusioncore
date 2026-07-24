import { motion } from 'framer-motion';
import { useReactorStore } from '../../store/reactorStore.js';
import { fmtMoney } from '../../utils/format.js';
import Cite from '../common/Cite.jsx';
import SpeakerIcon from '../common/SpeakerIcon.jsx';

/** Unskippable SCRAM damage diagnostics report (spec §4). */
export default function GameOverModal() {
  const gameOver = useReactorStore((s) => s.gameOver);
  const funds = useReactorStore((s) => s.econ.funds);
  const stats = useReactorStore((s) => s.stats);
  const levelId = useReactorStore((s) => s.level.id);
  const repair = useReactorStore((s) => s.repairReactor);
  if (!gameOver) return null;

  const canAfford = funds >= gameOver.fee;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-panel border-2 border-crit rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
        role="alertdialog"
        aria-modal="true"
        aria-label="Reactor SCRAM damage report"
      >
        <div className="text-[10px] uppercase tracking-[0.3em] text-crit font-bold">
          Emergency Safety SCRAM: Damage Diagnostics Report
        </div>
        <h2 className="text-xl font-black mt-2 text-crit flex items-center gap-2">
          {gameOver.title}
          <SpeakerIcon text={`Reactor scram. ${gameOver.title}. ${gameOver.text}`} />
        </h2>

        <div className="mt-4 grid gap-3 text-xs leading-relaxed">
          <p className="text-slate-200">
            {gameOver.text} {gameOver.cite && <Cite id={gameOver.cite} />}
          </p>

          {gameOver.report && (
            <div className="rounded-md bg-slate-900 p-3 border border-slate-700">
              <div className="text-[9px] uppercase tracking-widest text-crit mb-1.5 font-bold">Failure Analysis</div>
              <div className="text-[9px] uppercase tracking-widest text-slate-500">Primary cause</div>
              <p className="text-[11px] text-slate-200 mt-0.5">{gameOver.report.primary}</p>
              <div className="text-[9px] uppercase tracking-widest text-slate-500 mt-2">Contributing factors</div>
              <ul className="mt-0.5 grid gap-0.5">
                {gameOver.report.factors.map((f) => (
                  <li key={f} className="text-[11px] text-slate-300 flex gap-1.5">
                    <span className="text-crit shrink-0">•</span><span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="text-[9px] uppercase tracking-widest text-slate-500 mt-2">Recommendation</div>
              <p className="text-[11px] text-accent mt-0.5">{gameOver.report.recommendation}</p>
            </div>
          )}

          <div className="rounded-md bg-slate-900 p-3 border border-slate-700">
            <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Historical precedent</div>
            <p className="text-[11px] text-slate-400">{gameOver.historical}</p>
          </div>
          <div className="rounded-md bg-slate-900 p-3 border border-slate-700 font-mono text-[11px] grid grid-cols-2 gap-1">
            <span className="text-slate-500">Disruptions this run</span><span className="text-right">{stats.disruptions}</span>
            <span className="text-slate-500">Magnet quenches</span><span className="text-right">{stats.quenches}</span>
            <span className="text-slate-500">Peak Q achieved</span><span className="text-right">{stats.maxQ.toFixed(2)}</span>
            <span className="text-slate-500">Prior repairs</span><span className="text-right">{stats.repairs}</span>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-700 pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Full repair &amp; component replacement</span>
            <span className="font-mono font-bold text-warn">{fmtMoney(gameOver.fee)}</span>
          </div>
          <div className="flex justify-between text-[11px] mt-1">
            <span className="text-slate-500">Capital reserves</span>
            <span className={`font-mono ${canAfford ? 'text-slate-300' : 'text-crit'}`}>{fmtMoney(funds)}</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Authorizing repairs restores all structural systems to 100%, flushes the vacuum
            chamber, and resets controls to the Level {levelId} safe baseline.
          </p>
          <button
            onClick={repair}
            autoFocus
            className={`mt-4 w-full py-2.5 rounded-lg font-bold text-sm tracking-widest ${
              canAfford
                ? 'bg-warn text-base hover:brightness-110'
                : 'bg-crit text-white hover:brightness-110'
            }`}
          >
            {canAfford ? 'AUTHORIZE REPAIR FEE' : 'AUTHORIZE EMERGENCY DEBT FINANCING'}
          </button>
          {!canAfford && (
            <p className="text-[9px] text-crit mt-1.5 text-center">
              Reserves insufficient. The board approves high-interest financing. Funds will go negative.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
