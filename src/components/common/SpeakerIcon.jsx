import { useTTS } from '../../hooks/useTTS.js';

/** Small speaker button that reads `text` aloud. Hidden when TTS is off/unsupported. */
export default function SpeakerIcon({ text, className = '' }) {
  const { enabled, speak } = useTTS();
  if (!enabled) return null;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); speak(text); }}
      aria-label="Read aloud"
      title="Read aloud"
      tabIndex={0}
      className={`inline-flex items-center justify-center w-5 h-5 rounded text-ink/70 hover:text-accent shrink-0 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
      </svg>
    </button>
  );
}
