import { useReactorStore } from '../../store/reactorStore.js';
import { useTTS, ttsSupported } from '../../hooks/useTTS.js';
import Icon from '../common/Icon.jsx';

// A real <label>, not a styled div: every row holds exactly one form control,
// and wrapping it is what gives that control its accessible name. Before this,
// five checkboxes, the palette select and the UI-scale slider in the
// accessibility panel itself were anonymous to a screen reader. It also makes
// the row text a click target for the checkbox, which is the convention anyway.
function Row({ label, children }) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-xs text-ink/85">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </label>
  );
}

function VolumeSlider({ label, value, onChange }) {
  return (
    <Row label={label}>
      <input
        type="range" min={0} max={1} step={0.05} value={value}
        aria-label={`${label} volume`}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-36"
      />
      <span className="font-mono text-[10px] w-8 text-right">{Math.round(value * 100)}%</span>
    </Row>
  );
}

export default function SettingsModal() {
  const settings = useReactorStore((s) => s.settings);
  const update = useReactorStore((s) => s.updateSettings);
  const close = () => useReactorStore.getState().setSettingsOpen(false);
  const screen = useReactorStore((s) => s.screen);
  const quitToTitle = useReactorStore((s) => s.quitToTitle);
  const saveGame = useReactorStore((s) => s.saveGame);
  const { voices, speak } = useTTS();
  const tts = ttsSupported();

  const setVolume = (key) => (v) => update({ volumes: { ...settings.volumes, [key]: v } });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={close}>
      <div
        className="bg-panel max-w-md w-full p-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-label="Settings"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold tracking-widest text-accent text-sm">SETTINGS</h2>
          <button onClick={close} aria-label="Close settings" className="text-ink/70 hover:text-ink px-2 inline-flex items-center">
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-[10px] uppercase tracking-widest text-ink/55 mt-4 mb-1 border-b border-raise pb-1">Audio</h3>
        <Row label="Audio enabled">
          <input type="checkbox" checked={settings.audioEnabled} onChange={(e) => update({ audioEnabled: e.target.checked })} className="accent-accent" />
        </Row>
        <VolumeSlider label="Master" value={settings.volumes.master} onChange={setVolume('master')} />
        <VolumeSlider label="Ambient loop" value={settings.volumes.ambient} onChange={setVolume('ambient')} />
        <VolumeSlider label="Sound effects" value={settings.volumes.sfx} onChange={setVolume('sfx')} />
        <VolumeSlider label="Critical alerts" value={settings.volumes.alerts} onChange={setVolume('alerts')} />
        <VolumeSlider label="Music" value={settings.volumes.music} onChange={setVolume('music')} />

        <h3 className="text-[10px] uppercase tracking-widest text-ink/55 mt-4 mb-1 border-b border-raise pb-1">Accessibility</h3>
        {tts ? (
          <>
            <Row label="Text-to-speech buttons">
              <input type="checkbox" checked={settings.ttsEnabled} onChange={(e) => update({ ttsEnabled: e.target.checked })} className="accent-accent" />
            </Row>
            {settings.ttsEnabled && (
              <>
                <Row label="Voice profile">
                  <select
                    value={settings.ttsVoice ?? ''}
                    onChange={(e) => update({ ttsVoice: e.target.value || null })}
                    className="bg-base border border-raise-hi rounded text-xs p-1 max-w-44"
                  >
                    <option value="">System default</option>
                    {voices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
                    ))}
                  </select>
                </Row>
                <Row label="Speech rate">
                  <input type="range" min={0.5} max={2} step={0.1} value={settings.ttsRate} onChange={(e) => update({ ttsRate: parseFloat(e.target.value) })} className="w-28" />
                  <span className="font-mono text-[10px] w-8 text-right">{settings.ttsRate.toFixed(1)}x</span>
                </Row>
                <Row label="Speech pitch">
                  <input type="range" min={0.5} max={2} step={0.1} value={settings.ttsPitch} onChange={(e) => update({ ttsPitch: parseFloat(e.target.value) })} className="w-28" />
                  <span className="font-mono text-[10px] w-8 text-right">{settings.ttsPitch.toFixed(1)}</span>
                </Row>
                <button onClick={() => speak('FusionCore text to speech is operating normally.')} className="text-[10px] text-accent underline">
                  test voice
                </button>
              </>
            )}
          </>
        ) : (
          <p className="text-[10px] text-ink/55 italic py-1">
            Text-to-speech is not available: this browser does not expose a speech synthesis engine.
          </p>
        )}
        <Row label="Colorblind palette">
          <select
            value={settings.colorblind}
            onChange={(e) => update({ colorblind: e.target.value })}
            className="bg-base border border-raise-hi rounded text-xs p-1"
          >
            <option value="none">Off</option>
            <option value="protanopia">Protanopia</option>
            <option value="deuteranopia">Deuteranopia</option>
            <option value="tritanopia">Tritanopia</option>
          </select>
        </Row>
        <Row label="Reduced motion">
          <input type="checkbox" checked={settings.reducedMotion} onChange={(e) => update({ reducedMotion: e.target.checked })} className="accent-accent" />
        </Row>
        <Row label="Spin the machine">
          <input type="checkbox" checked={settings.autoRotate !== false} onChange={(e) => update({ autoRotate: e.target.checked })} className="accent-accent" />
        </Row>
        <Row label="OpenDyslexic font">
          <input type="checkbox" checked={settings.dyslexicFont} onChange={(e) => update({ dyslexicFont: e.target.checked })} className="accent-accent" />
        </Row>

        <h3 className="text-[10px] uppercase tracking-widest text-ink/55 mt-4 mb-1 border-b border-raise pb-1">Interface</h3>
        <Row label="UI scale">
          <input type="range" min={0.75} max={1.5} step={0.05} value={settings.uiScale} onChange={(e) => update({ uiScale: parseFloat(e.target.value) })} className="w-32" />
          <span className="font-mono text-[10px] w-10 text-right">{Math.round(settings.uiScale * 100)}%</span>
        </Row>

        {screen === 'game' && (
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button onClick={() => { saveGame(); close(); }} className="py-2 rounded bg-raise hover:bg-raise-hi text-xs font-semibold">
              Save Game
            </button>
            <button onClick={() => { close(); quitToTitle(); }} className="py-2 rounded bg-raise hover:bg-raise-hi text-xs font-semibold">
              Save &amp; Quit to Title
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
