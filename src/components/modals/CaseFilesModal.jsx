import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReactorStore } from '../../store/reactorStore.js';
import { CASE_FILES } from '../../data/case_files.js';
import Cite from '../common/Cite.jsx';
import Icon from '../common/Icon.jsx';

/**
 * Historical case files: real accidents as investigations. Read the sequence,
 * answer the investigator's question, then take the lesson back to the
 * simulator. Not levels; nothing here is recreated or scored beyond the
 * investigation itself.
 */
export default function CaseFilesModal() {
  const setOpen = useReactorStore((s) => s.setCaseFilesOpen);
  const caseNotes = useReactorStore((s) => s.caseNotes);
  const answerCase = useReactorStore((s) => s.answerCaseFile);
  const mode = useReactorStore((s) => s.mode);
  const loadScenario = useReactorStore((s) => s.loadScenario);
  const [openId, setOpenId] = useState(null);
  const [picked, setPicked] = useState(null); // option index chosen this viewing

  const file = CASE_FILES.find((c) => c.id === openId);
  const answered = file ? caseNotes[file.id] !== undefined || picked !== null : false;

  const choose = (idx) => {
    if (picked !== null) return;
    setPicked(idx);
    answerCase(file.id, !!file.question.options[idx].correct);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-panel border border-slate-600 rounded-xl max-w-2xl w-full p-5 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Historical case files"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold">
              Case Files: Accident Investigations
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Real events, investigated rather than recreated. The physics in each one is running in your simulator.
            </p>
          </div>
          <button
            onClick={() => (file ? (setOpenId(null), setPicked(null)) : setOpen(false))}
            className="text-[10px] font-bold px-2.5 py-1.5 rounded bg-slate-700 hover:bg-slate-600 shrink-0"
          >
            {file ? '← ALL CASES' : 'CLOSE'}
          </button>
        </div>

        {!file && (
          <div className="grid gap-2 mt-4">
            {CASE_FILES.map((c) => {
              const done = caseNotes[c.id] !== undefined;
              return (
                <button
                  key={c.id}
                  onClick={() => { setOpenId(c.id); setPicked(null); }}
                  className="text-left rounded-lg border border-slate-600 hover:bg-slate-700/60 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">
                      {c.title} <span className="text-slate-500 font-normal">({c.year})</span>
                    </span>
                    {done && (
                      <span className="text-[9px] font-mono text-safe flex items-center gap-1">
                        <Icon name="check" className="w-3 h-3" /> INVESTIGATED
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{c.place} · {c.reactor}</div>
                </button>
              );
            })}
          </div>
        )}

        {file && (
          <div className="mt-4 grid gap-3 text-xs leading-relaxed">
            <div>
              <h2 className="text-lg font-black">{file.title} <span className="text-slate-500 font-normal text-sm">({file.year})</span> <Cite id={file.cite} /></h2>
              <div className="text-[10px] text-slate-400">{file.place} · {file.reactor}</div>
              <div className="text-[10px] text-warn mt-0.5">{file.toll}</div>
            </div>

            <p className="text-slate-200">{file.summary}</p>

            <div className="rounded-md bg-slate-900 p-3 border border-slate-700">
              <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1.5">Sequence of events</div>
              <div className="grid gap-1">
                {file.timeline.map(([t, ev]) => (
                  <div key={t + ev} className="grid grid-cols-[64px_1fr] gap-2 text-[11px]">
                    <span className="font-mono text-slate-500">{t}</span>
                    <span className="text-slate-300">{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md bg-slate-900 p-3 border border-accent/40">
              <div className="text-[9px] uppercase tracking-widest text-accent mb-1.5">Investigator's question</div>
              <p className="text-[11px] font-semibold text-slate-200">{file.question.prompt}</p>
              <div className="grid gap-1.5 mt-2">
                {file.question.options.map((opt, idx) => {
                  const chosen = picked === idx;
                  const reveal = picked !== null;
                  return (
                    <div key={opt.text}>
                      <button
                        onClick={() => choose(idx)}
                        disabled={reveal}
                        className={`w-full text-left text-[11px] px-2.5 py-1.5 rounded border ${
                          reveal && opt.correct ? 'border-safe bg-safe/10 text-safe'
                          : chosen ? 'border-crit bg-crit/10 text-crit'
                          : reveal ? 'border-slate-700 text-slate-500'
                          : 'border-slate-600 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {opt.text}
                      </button>
                      {reveal && (chosen || opt.correct) && (
                        <p className={`text-[10px] mt-1 px-1 ${opt.correct ? 'text-safe' : 'text-slate-400'}`}>
                          {opt.feedback}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {answered && (
              <div className="rounded-md bg-slate-900 p-3 border border-slate-700">
                <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">The engineering lesson</div>
                <p className="text-[11px] text-slate-200">{file.lesson}</p>
                <div className="mt-2 pt-2 border-t border-slate-700">
                  <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Take it to the simulator</div>
                  <p className="text-[11px] text-accent">{file.tryIt.text}</p>
                  {file.tryIt.scenario && file.tryIt.mode === mode && (
                    <button
                      onClick={() => {
                        if (window.confirm('Load this scenario? Campaign scoring ends for the current save.')) {
                          loadScenario(file.tryIt.scenario);
                          setOpen(false);
                        }
                      }}
                      className="mt-2 text-[10px] font-bold px-3 py-1.5 rounded bg-accent text-base hover:brightness-110"
                    >
                      LOAD SCENARIO
                    </button>
                  )}
                  {file.tryIt.mode !== 'any' && file.tryIt.mode !== mode && (
                    <p className="text-[9px] text-slate-500 mt-1">
                      This experiment lives in the {file.tryIt.mode} reactor. Switch from the title screen.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
