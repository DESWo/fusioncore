// Web Speech API wrapper with graceful degradation (spec §10).
import { useCallback, useEffect, useState } from 'react';
import { useReactorStore } from '../store/reactorStore.js';

export function ttsSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function useTTS() {
  const settings = useReactorStore((s) => s.settings);
  const [voices, setVoices] = useState([]);
  const supported = ttsSupported();

  useEffect(() => {
    if (!supported) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, [supported]);

  const speak = useCallback(
    (text) => {
      if (!supported || !text) return;
      const synth = window.speechSynthesis;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/\[Cite:[^\]]*\]/g, ''));
      u.rate = settings.ttsRate;
      u.pitch = settings.ttsPitch;
      const voice = voices.find((v) => v.voiceURI === settings.ttsVoice);
      if (voice) u.voice = voice;
      synth.speak(u);
    },
    [supported, voices, settings.ttsRate, settings.ttsPitch, settings.ttsVoice],
  );

  return { supported, voices, speak, enabled: settings.ttsEnabled && supported };
}
