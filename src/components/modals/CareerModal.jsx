import { motion } from 'framer-motion';
import { useReactorStore, levelsFor } from '../../store/reactorStore.js';
import { CAREER_POSTINGS, getPosting, nextPosting, CAREER_EPILOGUE } from '../../engine/career.js';
import { CASE_FILES } from '../../data/case_files.js';
import Icon from '../common/Icon.jsx';
import SpeakerIcon from '../common/SpeakerIcon.jsx';

const GRADE_COLOR = {
  A: 'text-safe border-safe/60',
  B: 'text-accent border-accent/60',
  C: 'text-warn border-warn/60',
  D: 'text-crit border-crit/60',
};

/** One rung on the 7-step career ladder. */
function LadderRung({ posting, state, grade }) {
  const dim = state === 'future';
  return (
    <div className={`flex items-start gap-2 ${dim ? 'opacity-45' : ''}`}>
      <div
        className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold border ${
          state === 'done' ? 'bg-safe/20 border-safe text-safe'
          : state === 'current' ? 'bg-violet-400/20 border-violet-300 text-violet-200'
          : 'bg-slate-800 border-slate-600 text-slate-500'
        }`}
      >
        {state === 'done' ? <Icon name="check" className="w-3 h-3" />
          : state === 'future' ? <Icon name="lock" className="w-2.5 h-2.5" />
          : posting.rung}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold leading-tight flex items-center gap-1.5 flex-wrap">
          {posting.title}
          {state === 'current' && (
            <span className="text-[8px] font-bold tracking-widest text-violet-300 bg-violet-400/15 rounded px-1 py-px">CURRENT</span>
          )}
          {state === 'next' && (
            <span className="text-[8px] font-bold tracking-widest text-slate-400 bg-slate-700 rounded px-1 py-px">NEXT</span>
          )}
          {state === 'past' && (
            <span className="text-[8px] font-bold tracking-widest text-slate-500 bg-slate-800 rounded px-1 py-px">JOINED ABOVE THIS RUNG</span>
          )}
          {state === 'future' && (
            <span className="text-[8px] font-bold tracking-widest text-slate-500 bg-slate-800 rounded px-1 py-px">IN DEVELOPMENT</span>
          )}
          {grade && (
            <span className={`text-[9px] font-mono font-bold border rounded px-1 ${GRADE_COLOR[grade]}`}>
              {grade}
            </span>
          )}
        </div>
        <div className="text-[9px] text-slate-500 leading-snug">{posting.org}. {posting.tagline}</div>
      </div>
    </div>
  );
}

/** Recommended reading before taking the controls: the relevant case files. */
function RecommendedCases({ posting }) {
  const setCaseFilesOpen = useReactorStore((s) => s.setCaseFilesOpen);
  const caseNotes = useReactorStore((s) => s.caseNotes);
  if (!posting.caseFiles?.length) return null;
  return (
    <div className="mt-3">
      <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">
        Recommended reading before you take the controls
      </div>
      <div className="flex flex-wrap gap-1.5">
        {posting.caseFiles.map((id) => {
          const cf = CASE_FILES.find((c) => c.id === id);
          if (!cf) return null;
          const read = caseNotes[id] !== undefined;
          return (
            <button
              key={id}
              onClick={() => setCaseFilesOpen(true)}
              className={`text-[10px] px-2 py-1 rounded border ${
                read ? 'border-safe/40 text-safe bg-safe/5' : 'border-slate-600 text-slate-300 hover:bg-slate-700'
              }`}
              title={`Open the case files (${cf.year}, ${cf.place})`}
            >
              {read ? '✓ ' : '▸ '}{cf.title} ({cf.year})
            </button>
          );
        })}
      </div>
      {posting.mandateNote && (
        <p className="text-[9px] text-slate-500 mt-1.5 leading-snug italic">{posting.mandateNote}</p>
      )}
    </div>
  );
}

/** The point of a promotion: the job changes, not just the machine. */
function ResponsibilityBlock({ posting }) {
  const r = posting.responsibilities;
  if (!r) return null;
  return (
    <div className="mt-2.5 pt-2 border-t border-slate-700">
      <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">
        How your responsibilities change
      </div>
      {posting.roleLine && (
        <p className="label-mono text-[9px] text-violet-300 mb-1.5">{posting.roleLine}</p>
      )}
      <div className="grid gap-0.5">
        {r.gained.map((g) => (
          <p key={g} className="text-[10px] text-safe/90 leading-snug">+ {g}</p>
        ))}
        {r.shed.map((g) => (
          <p key={g} className="text-[10px] text-slate-500 leading-snug">− {g}</p>
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ posting, review }) {
  return (
    <div className="rounded-lg border border-slate-600 bg-slate-900/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Performance review</div>
          <div className="text-sm font-bold mt-0.5 flex items-center gap-2">
            {posting.title}
            <SpeakerIcon text={`Performance review, ${posting.title}. Grade ${review.grade}, ${review.gradeWord}. ${review.summary}`} />
          </div>
        </div>
        <div className={`w-12 h-12 shrink-0 rounded-lg border-2 flex flex-col items-center justify-center ${GRADE_COLOR[review.grade]}`}>
          <span className="text-2xl font-black leading-none">{review.grade}</span>
          <span className="text-[7px] uppercase tracking-wider">{review.gradeWord}</span>
        </div>
      </div>

      <p className="text-[11px] text-slate-300 italic mt-2 leading-relaxed">
        “{review.summary}”
        {posting.boss && (
          <span className="not-italic text-slate-500"> · {posting.boss.name}, {posting.boss.role}</span>
        )}
      </p>

      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-3 rounded-md bg-slate-950/60 border border-slate-700 p-2">
        {review.metrics.map(([k, v]) => (
          <div key={k} className="flex justify-between text-[10px]">
            <span className="text-slate-500">{k}</span>
            <span className="font-mono text-slate-200">{v}</span>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mt-3">
        <div>
          <div className="text-[9px] uppercase tracking-widest text-safe mb-1">Strengths</div>
          {review.strengths.map((t) => (
            <p key={t} className="text-[10px] text-slate-300 leading-snug mb-1">+ {t}</p>
          ))}
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-widest text-warn mb-1">To work on</div>
          {review.improvements.map((t) => (
            <p key={t} className="text-[10px] text-slate-300 leading-snug mb-1">△ {t}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * The career file: arrival briefs when you land a posting, the performance
 * review and promotion offer when you finish one, and the 7-rung ladder so
 * the whole arc is visible from day one (docs/CAREER_MODE.md).
 */
export default function CareerModal() {
  const career = useReactorStore((s) => s.career);
  const mode = useReactorStore((s) => s.mode);
  const levelId = useReactorStore((s) => s.level.id);
  const completed = useReactorStore((s) => s.level.completed);
  const setCareerOpen = useReactorStore((s) => s.setCareerOpen);
  const advancePosting = useReactorStore((s) => s.advancePosting);
  const exportNotebook = useReactorStore((s) => s.exportNotebook);
  const reducedMotion = useReactorStore((s) => s.settings.reducedMotion);
  if (!career) return null;

  const posting = getPosting(career.postingId);
  const review = career.completed.find((c) => c.postingId === career.postingId)?.review;
  const next = nextPosting(career.postingId);
  const offer = completed && review; // posting finished: review + what comes next
  const missionCount = levelsFor(mode, posting.plant ?? 'pwr').length;
  const gradeFor = (id) => career.completed.find((c) => c.postingId === id)?.review?.grade;

  return (
    <div className="fixed inset-0 z-40 bg-black/85 flex items-center justify-center p-4">
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-panel border border-violet-400/40 rounded-xl max-w-xl w-full p-5 max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-label="Engineering career file"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-violet-300 font-bold">
              Engineering Career
            </div>
            <div className="text-[9px] text-slate-500">One engineer, many machines. The notebook follows you.</div>
          </div>
          <button
            onClick={() => setCareerOpen(false)}
            aria-label="Close the career file"
            className="p-1.5 rounded bg-slate-700 hover:bg-slate-600"
          >
            <Icon name="x" className="w-3.5 h-3.5" />
          </button>
        </div>

        {offer ? (
          <div className="mt-4 grid gap-3">
            <ReviewCard posting={posting} review={review} />
            {next ? (
              <div className="rounded-lg border border-violet-400/40 bg-violet-400/5 p-4">
                <div className="text-[9px] uppercase tracking-[0.25em] text-violet-300">Promotion offer</div>
                <div className="text-sm font-bold mt-0.5">{next.title}</div>
                <div className="text-[10px] text-slate-400">{next.org}</div>
                <div className="mt-2 grid gap-1">
                  {next.mandate.map((m) => (
                    <p key={m} className="text-[10px] text-slate-300 leading-snug">▸ {m}</p>
                  ))}
                </div>
                <ResponsibilityBlock posting={next} />
                <button
                  onClick={advancePosting}
                  autoFocus
                  className="mt-3 w-full py-2.5 rounded-lg bg-violet-400 text-base font-bold text-sm tracking-widest hover:brightness-110"
                >
                  ACCEPT PROMOTION
                </button>
                <p className="text-[9px] text-slate-500 mt-1.5 text-center">
                  Or close this file and keep operating the current plant. The offer stays on your desk.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-600 bg-slate-900/70 p-4">
                <div className="text-[9px] uppercase tracking-[0.25em] text-accent">Top of the ladder, for now</div>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-1.5">{CAREER_EPILOGUE}</p>
                <button
                  onClick={() => setCareerOpen(false)}
                  autoFocus
                  className="mt-3 w-full py-2 rounded-lg bg-accent text-base font-bold text-xs tracking-widest hover:brightness-110"
                >
                  CONTINUE OPERATING
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-slate-600 bg-slate-900/70 p-4">
            <div className="text-[9px] uppercase tracking-[0.25em] text-slate-500">Posting brief</div>
            <div className="text-sm font-bold mt-0.5 flex items-center gap-2">
              {posting.title}
              <SpeakerIcon text={`Posting brief. ${posting.title}. ${posting.org}. ${posting.mandate?.join(' ') ?? ''}`} />
            </div>
            <div className="text-[10px] text-slate-400">{posting.org} · Mission {levelId} of {missionCount}</div>
            <div className="mt-2 grid gap-1">
              {posting.mandate?.map((m) => (
                <p key={m} className="text-[10px] text-slate-300 leading-snug">▸ {m}</p>
              ))}
            </div>
            <ResponsibilityBlock posting={posting} />
            <RecommendedCases posting={posting} />
            <button
              onClick={() => setCareerOpen(false)}
              autoFocus
              className="mt-3 w-full py-2.5 rounded-lg bg-violet-400 text-base font-bold text-sm tracking-widest hover:brightness-110"
            >
              REPORT FOR DUTY
            </button>
          </div>
        )}

        <div className="mt-4">
          <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-2">The ladder</div>
          <div className="grid gap-2">
            {CAREER_POSTINGS.map((p) => {
              const currentRung = getPosting(career.postingId)?.rung ?? 1;
              const state = gradeFor(p.id) ? 'done'
                : p.id === career.postingId ? 'current'
                : p.playable ? (p.rung < currentRung ? 'past' : p.id === next?.id ? 'next' : 'ahead')
                : 'future';
              return <LadderRung key={p.id} posting={p} state={state} grade={gradeFor(p.id)} />;
            })}
          </div>
        </div>

        {career.completed.some((c) => c.postingId !== career.postingId) && (
          <div className="mt-4">
            <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">Reviews on file</div>
            {career.completed.filter((c) => c.postingId !== career.postingId).map((c) => (
              <p key={c.postingId} className="text-[10px] text-slate-400 leading-snug mb-0.5">
                <span className={`font-mono font-bold ${GRADE_COLOR[c.review.grade].split(' ')[0]}`}>{c.review.grade}</span>
                {' '}· {getPosting(c.postingId)?.title}: {c.review.summary}
              </p>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between">
          <button
            onClick={exportNotebook}
            className="text-[10px] px-2.5 py-1 rounded-full font-semibold bg-slate-700 text-slate-200 hover:bg-slate-600"
            title="Download the full career log as a text file"
          >
            Export career log
          </button>
          <span className="text-[9px] text-slate-600">Grades go in the file, never in your way.</span>
        </div>
      </motion.div>
    </div>
  );
}
