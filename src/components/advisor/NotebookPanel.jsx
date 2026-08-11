import { useReactorStore } from '../../store/reactorStore.js';

const KIND_STYLE = {
  decision: { mark: '»', color: 'text-ink' },
  event: { mark: '⚠', color: 'text-warn' },
  milestone: { mark: '◆', color: 'text-accent' },
  praise: { mark: '★', color: 'text-safe' },
  career: { mark: '✦', color: 'text-accent' },
};

function fmtClock(simSeconds) {
  const d = Math.floor(simSeconds / 86400);
  const h = Math.floor((simSeconds % 86400) / 3600);
  const m = Math.floor((simSeconds % 3600) / 60);
  return `${d}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * The engineering notebook: every decision the player makes, with the reason
 * it was made and what happened next. By the end of a campaign this reads as
 * a complete shift log, and it exports as one.
 */
export default function NotebookPanel() {
  const notebook = useReactorStore((s) => s.notebook);
  const exportNotebook = useReactorStore((s) => s.exportNotebook);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="px-3 py-1.5 flex items-center justify-between border-b border-panel shrink-0">
        <span className="text-[9px] text-ink/55">
          {notebook.length} entries · decisions, reasons, outcomes
        </span>
        <button
          onClick={exportNotebook}
          disabled={notebook.length === 0}
          title="Download the full log as a text file"
          className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${
            notebook.length ? 'bg-raise text-ink hover:bg-raise-hi' : 'bg-panel text-ink/40 cursor-not-allowed'
          }`}
        >
          Export log
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2 min-h-0" role="log" aria-label="Engineering notebook">
        {notebook.length === 0 && (
          <p className="text-[10px] text-ink/55 leading-relaxed">
            Empty log. Move a control, service a part, or buy an upgrade:
            every decision is recorded here with its reason and its outcome.
          </p>
        )}
        {[...notebook].reverse().map((e) => {
          const st = KIND_STYLE[e.kind] ?? KIND_STYLE.decision;
          return (
            <div key={e.id} className="mb-2 terminal-line">
              <span className="text-ink/40">[{fmtClock(e.simTime)}] </span>
              <span className={st.color}>{st.mark} {e.text}</span>
              {e.reason && (
                <div className="text-[10px] text-ink/55 pl-4">Reason: {e.reason}</div>
              )}
              {e.outcome && (
                <div className="text-[10px] text-accent/80 pl-4">Outcome: {e.outcome}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
