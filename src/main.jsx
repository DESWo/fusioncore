import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Last-resort boundary. Without it, one failed lazy chunk (a dropped
// connection while the 3D scene downloads, a deploy replacing hashed assets
// mid-session) unmounts the entire tree and leaves a permanently blank page
// with the only explanation in the console. Saves autosave every 60 seconds,
// so a reload is genuinely safe to offer.
class CrashScreen extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="h-full flex items-center justify-center bg-base text-ink p-6">
        <div className="max-w-md">
          <h1 className="label-mono text-[12px] text-crit">Something broke on this end</h1>
          <p className="text-sm text-ink/85 mt-3 leading-relaxed">
            Part of the game failed to load or crashed. This is usually a
            dropped connection or a stale tab after an update, not your save:
            progress autosaves every minute and reloading is safe.
          </p>
          <p className="font-mono text-[10px] text-ink/55 mt-3 break-all">
            {String(this.state.error?.message ?? this.state.error)}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-accent text-base label-mono text-[11px] font-medium hover:brightness-110"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CrashScreen>
      <App />
    </CrashScreen>
  </React.StrictMode>,
);
