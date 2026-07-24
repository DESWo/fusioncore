import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useReactorStore } from '../../store/reactorStore.js';

// Post-processing shared by both machines so a tokamak and a PWR are lit by
// the same rules. Bloom is thresholded, not global: the plasma shader, the
// Cherenkov core, fission flashes and quench sparks all drive their colours
// above the threshold, while the navy panels, grey coils and plumbing sit
// under it and stay matte. Raising the threshold is the knob that decides
// what counts as "hot enough to spill light".
//
// Off under reduced motion: the effect is a moving glare, and Plasma.jsx
// already carries its own fresnel rim, so the machine still reads without it.
const BLOOM = {
  threshold: 0.48,   // above this luminance a surface starts to spill
  smoothing: 0.3,    // soft knee, so a warming plasma fades in rather than pops
  intensity: 1.05,
  // Half-resolution bloom buffer. Bloom is a blur, so the lost detail is
  // invisible, and it roughly quarters the texture memory this pass costs.
  // The machine is drawn at dpr 2 on large displays and this game ships to
  // whatever GPU a browser hands it, so the cheap version is the shipped one.
  resolutionScale: 0.5,
};

export default function Effects() {
  const reducedMotion = useReactorStore((s) => s.settings.reducedMotion);
  if (reducedMotion) return null;
  return (
    <EffectComposer disableNormalPass multisampling={0}>
      <Bloom
        luminanceThreshold={BLOOM.threshold}
        luminanceSmoothing={BLOOM.smoothing}
        intensity={BLOOM.intensity}
        resolutionScale={BLOOM.resolutionScale}
        mipmapBlur
      />
      <Vignette offset={0.3} darkness={0.55} eskil={false} />
    </EffectComposer>
  );
}
