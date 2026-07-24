// Procedural reactor soundscape (spec §11): no audio assets, everything is
// synthesized on a Web Audio node graph hung off Howler's shared context.
import { Howler } from 'howler';

let ctx = null;
let nodes = null;

function buildGraph() {
  const master = ctx.createGain();
  master.connect(ctx.destination);

  // -- Core baseline hum: low-passed 50 Hz sawtooth (ventilation + iron) --
  const humOsc = ctx.createOscillator();
  humOsc.type = 'sawtooth';
  humOsc.frequency.value = 50;
  const humFilter = ctx.createBiquadFilter();
  humFilter.type = 'lowpass';
  humFilter.frequency.value = 120;
  humFilter.Q.value = 0.7;
  const humGain = ctx.createGain();
  humGain.gain.value = 0;
  humOsc.connect(humFilter).connect(humGain).connect(master);
  humOsc.start();

  // -- Magnetic resonance tone: sine tracking the Tesla setting --
  const magOsc = ctx.createOscillator();
  magOsc.type = 'sine';
  magOsc.frequency.value = 150;
  const magFilter = ctx.createBiquadFilter();
  magFilter.type = 'bandpass';
  magFilter.Q.value = 8; // high-Q sweep
  magFilter.frequency.value = 150;
  const magGain = ctx.createGain();
  magGain.gain.value = 0;
  magOsc.connect(magFilter).connect(magGain).connect(master);
  magOsc.start();

  // -- Alarm: square wave, LFO-gated. warn = 1 Hz pulse, crit = 4 Hz --
  const alarmOsc = ctx.createOscillator();
  alarmOsc.type = 'square';
  alarmOsc.frequency.value = 440;
  const alarmGate = ctx.createGain();
  alarmGate.gain.value = 0;
  const lfo = ctx.createOscillator();
  lfo.type = 'square';
  lfo.frequency.value = 1;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = 0; // 0 = silent, >0 = pulsing
  lfo.connect(lfoDepth).connect(alarmGate.gain);
  const alarmVol = ctx.createGain();
  alarmVol.gain.value = 0.9;
  alarmOsc.connect(alarmGate).connect(alarmVol).connect(master);
  alarmOsc.start();
  lfo.start();

  // -- "Music": slow beating pad from two detuned sines --
  const padA = ctx.createOscillator();
  const padB = ctx.createOscillator();
  padA.type = 'sine'; padB.type = 'sine';
  padA.frequency.value = 110;
  padB.frequency.value = 110.7;
  const padGain = ctx.createGain();
  padGain.gain.value = 0;
  padA.connect(padGain); padB.connect(padGain);
  padGain.connect(master);
  padA.start(); padB.start();

  return { master, humGain, magOsc, magFilter, magGain, alarmOsc, lfo, lfoDepth, alarmVol, padGain };
}

/** Must be called from a user gesture (browser autoplay policy). */
export function initAudio() {
  if (nodes) return true;
  try {
    Howler.volume(1); // forces Howler to stand up its AudioContext
    ctx = Howler.ctx ?? new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    nodes = buildGraph();
    return true;
  } catch {
    return false;
  }
}

export function audioReady() {
  return !!nodes;
}

/** Push volume settings into the graph. */
export function applyVolumes(settings) {
  if (!nodes) return;
  const on = settings.audioEnabled ? 1 : 0;
  const t = ctx.currentTime;
  nodes.master.gain.setTargetAtTime(settings.volumes.master * on, t, 0.1);
  nodes.padGain.gain.setTargetAtTime(0.04 * settings.volumes.music, t, 0.5);
}

/** Called on every store change with the bits of state the soundscape tracks. */
export function updateSoundscape({ B, pFusionMW, plasmaOn, alarmLevel, screen, speed, settings }) {
  if (!nodes) return;
  const t = ctx.currentTime;
  const running = screen === 'game' && speed > 0;
  const amb = settings.volumes.ambient * (settings.audioEnabled ? 1 : 0);
  const alerts = settings.volumes.alerts * (settings.audioEnabled ? 1 : 0);

  // hum swells with fusion output
  const humLevel = running ? amb * (0.05 + Math.min(pFusionMW / 2000, 1) * 0.08) : 0;
  nodes.humGain.gain.setTargetAtTime(humLevel, t, 0.4);

  // magnet tone: 100–300 Hz mapped to the field slider (spec §11)
  const f = 100 + (Math.min(B, 20) / 20) * 200;
  nodes.magOsc.frequency.setTargetAtTime(f, t, 0.15);
  nodes.magFilter.frequency.setTargetAtTime(f, t, 0.15);
  nodes.magGain.gain.setTargetAtTime(running && plasmaOn ? amb * 0.05 : 0, t, 0.4);

  // alarms
  if (screen === 'game' && alarmLevel === 'crit') {
    nodes.alarmOsc.frequency.setTargetAtTime(880, t, 0.05);
    nodes.lfo.frequency.setTargetAtTime(4, t, 0.05);
    nodes.lfoDepth.gain.setTargetAtTime(alerts * 0.12, t, 0.1);
  } else if (screen === 'game' && alarmLevel === 'warn') {
    nodes.alarmOsc.frequency.setTargetAtTime(440, t, 0.05);
    nodes.lfo.frequency.setTargetAtTime(1, t, 0.05);
    nodes.lfoDepth.gain.setTargetAtTime(alerts * 0.08, t, 0.1);
  } else {
    nodes.lfoDepth.gain.setTargetAtTime(0, t, 0.2);
  }
}
