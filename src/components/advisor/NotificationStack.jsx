import { AnimatePresence, motion } from 'framer-motion';
import { useReactorStore } from '../../store/reactorStore.js';
import Cite from '../common/Cite.jsx';
import SpeakerIcon from '../common/SpeakerIcon.jsx';
import Icon from '../common/Icon.jsx';

const STYLE_BY_PRIORITY = {
  1: 'status-crit bg-crit/10',
  2: 'status-crit bg-crit/5',
  3: 'status-warn bg-warn/5',
  4: 'border border-safe/50 bg-safe/5',
  5: 'border border-raise-hi bg-panel/60',
};

export default function NotificationStack() {
  const notifications = useReactorStore((s) => s.notifications);
  const dismiss = useReactorStore((s) => s.dismissNotification);
  const visible = notifications.filter((n) => !n.requiresAck).slice(0, 4);

  return (
    <div className="px-2 grid gap-1.5">
      <AnimatePresence initial={false}>
        {visible.map((n) => (
          <motion.div
            key={n.id}
            layout
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className={`p-2 ${STYLE_BY_PRIORITY[n.priority] ?? STYLE_BY_PRIORITY[5]}`}
          >
            <div className="flex items-start justify-between gap-1">
              <span className="text-[10px] font-bold tracking-wide flex items-center gap-1">
                {n.title} {n.cite && <Cite id={n.cite} />}
                <SpeakerIcon text={`${n.title}. ${n.text}`} />
              </span>
              <button
                onClick={() => dismiss(n.id)}
                aria-label="Dismiss notification"
                className="text-ink/55 hover:text-ink px-1 inline-flex items-center"
              >
                <Icon name="x" className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[10px] text-ink/85 leading-snug mt-0.5">{n.text}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
