import { motion } from 'framer-motion';
import { useReactorStore } from '../../store/reactorStore.js';
import Cite from '../common/Cite.jsx';
import SpeakerIcon from '../common/SpeakerIcon.jsx';

/** Priority-1 events freeze the sim and demand explicit acknowledgement (spec §9). */
export default function AckModal() {
  const note = useReactorStore((s) => s.notifications.find((n) => n.requiresAck));
  const ack = useReactorStore((s) => s.ackNotification);
  if (!note) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="status-crit bg-panel max-w-md w-full p-5"
        role="alertdialog"
        aria-modal="true"
        aria-label={note.title}
      >
        <div className="text-crit font-black tracking-widest text-sm flex items-center gap-2">
          ⚠ PRIORITY 1: {note.title}
          <SpeakerIcon text={`Priority one alert. ${note.title}. ${note.text}`} />
        </div>
        <p className="text-xs text-ink mt-3 leading-relaxed">
          {note.text} {note.cite && <Cite id={note.cite} />}
        </p>
        <p className="text-[10px] text-ink/70 mt-2">Simulation frozen pending operator acknowledgement.</p>
        <button
          onClick={() => ack(note.id)}
          autoFocus
          className="mt-4 w-full py-2 bg-crit text-base font-bold text-sm hover:brightness-110"
        >
          ACKNOWLEDGE: RESUME OPERATIONS
        </button>
      </motion.div>
    </div>
  );
}
