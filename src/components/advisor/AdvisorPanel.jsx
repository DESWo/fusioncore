import { useState } from 'react';
import { useReactorStore } from '../../store/reactorStore.js';
import LawsonPlot from './LawsonPlot.jsx';
import NotebookPanel from './NotebookPanel.jsx';
import Cite from '../common/Cite.jsx';
import SpeakerIcon from '../common/SpeakerIcon.jsx';

const TYPE_COLOR = {
  info: 'text-slate-300',
  warning: 'text-warn',
  critical: 'text-crit',
};

function fmtClock(simSeconds) {
  const h = Math.floor(simSeconds / 3600);
  const m = Math.floor((simSeconds % 3600) / 60);
  const s = Math.floor(simSeconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function AdvisorPanel() {
  const feed = useReactorStore((s) => s.advisorFeed);
  const levelId = useReactorStore((s) => s.level.id);
  const completed = useReactorStore((s) => s.level.completed);
  const mode = useReactorStore((s) => s.mode);
  const [tab, setTab] = useState('advisor');
  const showLawson = mode === 'fusion' && (levelId >= 4 || completed);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-base">
      <div className="px-3 py-2 border-b border-slate-700 shrink-0 flex items-center gap-2">
        <button
          onClick={() => setTab('advisor')}
          className={`text-[10px] uppercase tracking-widest font-bold ${
            tab === 'advisor' ? 'text-accent' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          ▮ Chief Engineer
        </button>
        <button
          onClick={() => setTab('notebook')}
          className={`text-[10px] uppercase tracking-widest font-bold ${
            tab === 'notebook' ? 'text-accent' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          ✎ Notebook
        </button>
      </div>



      {tab === 'notebook' ? (
        <NotebookPanel />
      ) : (
        <div className="flex-1 overflow-y-auto px-3 py-2 min-h-0" role="log" aria-label="Advisor terminal feed">
          {feed.map((entry) => (
            <div key={entry.id} className="terminal-line mb-2">
              <span className="text-slate-600">[{fmtClock(entry.simTime)}] </span>
              <span className={TYPE_COLOR[entry.type] ?? 'text-slate-300'}>
                {entry.type === 'critical' ? '⚠ ' : entry.type === 'warning' ? '△ ' : '» '}
                {entry.text}
              </span>{' '}
              {entry.cite && <Cite id={entry.cite} />}
              <SpeakerIcon text={entry.text} className="align-middle ml-1" />
            </div>
          ))}
        </div>
      )}

      {tab === 'advisor' && showLawson && <LawsonPlot />}
    </div>
  );
}
