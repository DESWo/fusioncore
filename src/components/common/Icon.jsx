// Shared inline SVG icon set (Lucide-style geometry, 24x24 viewBox) so no
// unicode/emoji glyphs serve as UI icons.
const PATHS = {
  pause: <><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>,
  play: <path d="M6 4.5v15a1 1 0 0 0 1.52.86l12.2-7.5a1 1 0 0 0 0-1.72L7.52 3.64A1 1 0 0 0 6 4.5z" />,
  gear: (
    <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7zm7.43-2.53c.04-.32.07-.64.07-.97s-.03-.66-.07-.97l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.3 7.3 0 0 0-1.68-.98l-.38-2.65A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.5.43l-.38 2.65c-.6.25-1.17.58-1.68.98l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46a.5.5 0 0 0 .12.64L4.57 11c-.04.32-.07.65-.07.98s.03.66.07.97l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46c.14.24.42.34.68.24l2.49-1c.51.4 1.08.73 1.68.98l.38 2.65A.5.5 0 0 0 10 22h4c.25 0 .46-.18.5-.43l.38-2.65c.6-.25 1.17-.58 1.68-.98l2.49 1c.26.1.54 0 .68-.24l2-3.46a.5.5 0 0 0-.12-.64l-2.18-1.63z" />
  ),
  x: <path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />,
  chevronDown: <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />,
  chevronRight: <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />,
  check: <path d="M4.5 12.5l5 5 10-11" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />,
  warn: <path d="M12 3.3L22.4 20.4a1 1 0 0 1-.86 1.5H2.46a1 1 0 0 1-.86-1.5L12 3.3zm0 5.2a1 1 0 0 0-1 1v4.5a1 1 0 0 0 2 0V9.5a1 1 0 0 0-1-1zm0 8.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4z" />,
  lock: <path d="M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1zm2 0h6V7a3 3 0 0 0-6 0v3z" />,
};

export default function Icon({ name, className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" focusable="false">
      {PATHS[name]}
    </svg>
  );
}
