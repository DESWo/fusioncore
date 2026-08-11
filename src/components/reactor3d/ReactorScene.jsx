import { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import CustomShaderMaterial from 'three-custom-shader-material';
import Plasma from './Plasma.jsx';
import FusionProcess from './FusionProcess.jsx';
import AnalysisOverlay from './AnalysisOverlay.jsx';
import Effects from './Effects.jsx';
import { heatColor, hazardPulse } from './heatmap.js';
import { DIVERTOR_BASE_C } from '../../engine/constants.js';
import { useReactorStore } from '../../store/reactorStore.js';

const R0 = 2.0;    // major radius (scene units)
const A = 0.62;    // plasma minor radius

// Machine is modeled in the torus' natural XY plane, then the whole group is
// laid flat (rotation-x -90°) so the donut hole faces up.

function TFCoils() {
  const groupRef = useRef();
  const coils = useMemo(() => Array.from({ length: 9 }, (_, i) => (i / 9) * Math.PI * 2), []);
  useFrame((state) => {
    const s = useReactorStore.getState();
    if (!groupRef.current) return;
    const load = Math.max(
      (s.sim.controls.B / s.sim.physics.magnetSafeB) ** 2 * 0.85,
      1 - s.sim.structure.magnets / 100,
    );
    const pulse = hazardPulse(state.clock.elapsedTime, s.sim.hazards?.magnets !== 0);
    groupRef.current.children.forEach((grp) => {
      const m = grp.children[0]?.material;
      if (!m) return;
      if (s.analysisView) {
        heatColor(m.color, load);
        m.emissive.copy(m.color).multiplyScalar(0.4 + pulse * 0.8);
      } else {
        // Normal view used to blank the coils to flat grey, which made the
        // magnetic field slider the one control with no visible effect
        // anywhere in the scene. Energise them instead: the same `load` the
        // stress view already computes, as a cool blue glow.
        m.color.set('#4A5568');
        m.emissive.setRGB(0.05, 0.16, 0.42).multiplyScalar(Math.min(load, 1) * 1.6);
      }
    });
  });
  return (
    <group ref={groupRef}>
      {coils.map((phi, i) => (
        <group key={i} rotation-z={phi}>
          <mesh position={[R0, 0, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[1.12, 0.09, 12, 40]} />
            <meshStandardMaterial color="#4A5568" metalness={0.85} roughness={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function PFCoils() {
  const rings = [
    { r: 2.9, z: 1.15 }, { r: 2.9, z: -1.15 },
    { r: 1.35, z: 1.5 }, { r: 1.35, z: -1.5 },
  ];
  return rings.map((ring, i) => (
    <mesh key={i} position={[0, 0, ring.z]}>
      <torusGeometry args={[ring.r, 0.07, 10, 60]} />
      <meshStandardMaterial color="#7C8DA6" metalness={0.8} roughness={0.4} />
    </mesh>
  ));
}

// The divertor is where the exhaust heat actually lands, and the engine
// already models that unevenness: `divertorPeaking` is 1.0 in L-mode and 1.15
// once H-mode ELMs focus the exhaust (constants.js). Shading it as a uniform
// glow hid the one thing the component is about. These shaders keep the
// standard lighting and only add the non-uniformity: a poloidal strike band
// that narrows and brightens as peaking rises, plus a thermal shimmer that
// grows with load. Colour and intensity still come from the useFrame below,
// so the temperature ramp and the stress-view heatmap are untouched.
const DIV_VERT = /* glsl */ `
  uniform float uHeat;
  uniform float uTime;
  varying vec2 vHeatUv;
  void main() {
    vHeatUv = uv;
    // thermal swell: a readable cue, not a deformation (tube radius is 0.11)
    float w = sin(position.x * 9.0 + uTime * 2.0) * sin(position.y * 8.0 - uTime * 1.7);
    csm_Position = position + normal * w * uHeat * 0.008;
  }
`;

const DIV_FRAG = /* glsl */ `
  uniform float uHeat;      // divertor temperature against its limit, 0..1
  uniform float uPeaking;   // 1.0 L-mode, 1.15 once ELMs focus the exhaust
  uniform float uTime;
  uniform float uPattern;   // 0 in the stress view, which must read flat
  varying vec2 vHeatUv;
  void main() {
    // exhaust lands on a poloidal band; peaking narrows it and raises the peak
    float width = 6.0 * uPeaking;
    float band = exp(-pow((vHeatUv.y - 0.5) * width, 2.0));
    float ripple  = 0.85 + 0.15 * sin(vHeatUv.x * 18.0 + uTime * 1.5);
    float flicker = 0.92 + 0.08 * sin(uTime * 9.0 + vHeatUv.x * 30.0);
    float strike = band * ripple * flicker * uPeaking;
    // cold plant keeps its flat look; the pattern arrives with the heat
    float hot = mix(1.0, strike, uHeat * uPattern);
    csm_Emissive = emissive * hot;
  }
`;

function Divertor() {
  const ref = useRef();
  const reducedMotion = useReactorStore((s) => s.settings.reducedMotion);
  const uniforms = useMemo(
    () => ({
      uHeat: { value: 0 },
      uPeaking: { value: 1 },
      uTime: { value: 0 },
      uPattern: { value: 1 },
    }),
    [],
  );
  useFrame((state, delta) => {
    const s = useReactorStore.getState();
    const p = s.sim.physics;
    if (!ref.current) return;
    const u = uniforms;
    u.uTime.value += delta * (reducedMotion ? 0 : 1);
    u.uPeaking.value = p.divertorPeaking ?? 1;
    u.uHeat.value = Math.min(Math.max(p.divertorTempC / p.divertorLimitC, 0), 1);
    if (s.analysisView) {
      // the stress view is a load readout: keep it flat and comparable
      u.uPattern.value = 0;
      const load = Math.max(p.divertorTempC / p.divertorLimitC, 1 - s.sim.structure.divertor / 100);
      const pulse = hazardPulse(state.clock.elapsedTime, s.sim.hazards?.divertor !== 0);
      heatColor(ref.current.emissive, load);
      ref.current.color.copy(ref.current.emissive);
      ref.current.emissiveIntensity = 0.5 + pulse * 1.6;
      return;
    }
    u.uPattern.value = 1;
    ref.current.color.set('#3F4B5F');
    // Glow orange -> white as the target heats, measured against THIS
    // divertor's own limit rather than a fixed 500-2300 window. The old window
    // ignored divertorLimitC, which is the number the tungsten upgrade raises,
    // so buying tungsten changed the physics and nothing on screen. It also
    // kept t near zero through most of the cooling slider's useful range.
    const t = Math.min(
      Math.max((p.divertorTempC - DIVERTOR_BASE_C) / (p.divertorLimitC - DIVERTOR_BASE_C), 0),
      1,
    );
    ref.current.emissive.setRGB(t * 1.0, t * 0.55 + t * t * 0.4, t * t * 0.5);
    ref.current.emissiveIntensity = 0.2 + t * 2.2;
  });
  return (
    <mesh position={[0, 0, -0.66]}>
      <torusGeometry args={[R0 * 0.88, 0.11, 10, 90]} />
      <CustomShaderMaterial
        ref={ref}
        baseMaterial={THREE.MeshStandardMaterial}
        vertexShader={DIV_VERT}
        fragmentShader={DIV_FRAG}
        uniforms={uniforms}
        color="#3F4B5F"
        metalness={0.7}
        roughness={0.5}
        emissive="#000000"
      />
    </mesh>
  );
}

function Vessel() {
  const wallRef = useRef();
  useFrame(() => {
    const s = useReactorStore.getState();
    const st = s.sim.structure;
    if (!wallRef.current) return;
    if (s.analysisView) {
      const load = Math.max(s.sim.physics.pFusionMW / 3500, 1 - st.firstWall / 100);
      heatColor(wallRef.current.color, load);
      wallRef.current.emissive.copy(wallRef.current.color).multiplyScalar(0.35);
      return;
    }
    wallRef.current.emissive?.set?.('#000000');
    // fracture tint as first-wall health erodes
    const dmg = 1 - st.firstWall / 100;
    wallRef.current.color.setRGB(0.16 + dmg * 0.25, 0.2 - dmg * 0.05, 0.26 - dmg * 0.1);
  });
  return (
    <group>
      {/* breeding blanket modules (inner): 3/4 arc leaves a cutaway view */}
      <mesh rotation-z={Math.PI * 0.25}>
        <torusGeometry args={[R0, 0.88, 24, 90, Math.PI * 1.5]} />
        <meshStandardMaterial ref={wallRef} color="#293445" metalness={0.6} roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
      {/* vacuum vessel shell (outer) */}
      <mesh rotation-z={Math.PI * 0.25}>
        <torusGeometry args={[R0, 1.0, 24, 90, Math.PI * 1.5]} />
        <meshStandardMaterial color="#1B2534" metalness={0.75} roughness={0.4} transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function CoolingLoops() {
  return [1.35, 1.5].map((r, i) => (
    <mesh key={i} position={[0, 0, i === 0 ? 0.9 : -0.9]}>
      <torusGeometry args={[R0 + 1.15, 0.035, 8, 80]} />
      <meshStandardMaterial color="#0E7490" metalness={0.6} roughness={0.4} />
    </mesh>
  ));
}

function Solenoid() {
  return (
    <mesh rotation-x={Math.PI / 2}>
      <cylinderGeometry args={[0.42, 0.42, 2.6, 24, 1, false]} />
      <meshStandardMaterial color="#8A97AB" metalness={0.9} roughness={0.3} />
    </mesh>
  );
}

function NBIInjectors() {
  return [0.6, 2.7].map((phi, i) => (
    <group key={i} rotation-z={phi}>
      <mesh position={[R0 + 1.7, 0.75, 0]} rotation-z={-0.42}>
        <boxGeometry args={[1.5, 0.34, 0.34]} />
        <meshStandardMaterial color="#313A49" metalness={0.7} roughness={0.45} />
      </mesh>
    </group>
  ));
}

function QuenchSparks() {
  const [active, setActive] = useState(false);
  useFrame(() => {
    const s = useReactorStore.getState();
    const recent = s.sim.time.ticks - s.uiFx.shakeTick < 25;
    if (recent !== active) setActive(recent);
  });
  if (!active) return null;
  return <Sparkles count={140} scale={[5.5, 5.5, 2.5]} size={7} speed={3.5} color="#FFD9A0" />;
}

function CameraRig() {
  const shakeRef = useRef(0);
  useFrame(({ camera }) => {
    const s = useReactorStore.getState();
    const recent = s.sim.time.ticks - s.uiFx.shakeTick < 12;
    if (recent && !s.settings.reducedMotion) {
      shakeRef.current = 0.06;
    }
    if (shakeRef.current > 0.001) {
      camera.position.x += (Math.random() - 0.5) * shakeRef.current;
      camera.position.y += (Math.random() - 0.5) * shakeRef.current;
      shakeRef.current *= 0.9;
    }
  });
  return null;
}

/** Full-screen white flash on disruption, rendered in DOM above the canvas. */
function DisruptionFlash() {
  const [opacity, setOpacity] = useState(0);
  const lastRef = useRef(-1);
  useEffect(() => {
    const unsub = useReactorStore.subscribe((s) => {
      if (s.uiFx.flashTick !== lastRef.current && s.uiFx.flashTick > 0) {
        lastRef.current = s.uiFx.flashTick;
        setOpacity(s.settings.reducedMotion ? 0.25 : 0.85);
      }
    });
    return unsub;
  }, []);
  useEffect(() => {
    if (opacity <= 0) return;
    const id = setTimeout(() => setOpacity((o) => (o > 0.05 ? o * 0.7 : 0)), 40);
    return () => clearTimeout(id);
  }, [opacity]);
  if (opacity === 0) return null;
  return <div className="absolute inset-0 bg-white pointer-events-none z-10" style={{ opacity }} />;
}

function StatusOverlay() {
  const T = useReactorStore((s) => s.sim.physics.T);
  const plasmaOn = useReactorStore((s) => s.sim.physics.plasmaOn);
  const ignition = useReactorStore((s) => s.sim.physics.ignition);
  const stability = useReactorStore((s) => s.sim.physics.stability);
  return (
    <div className="absolute top-2 left-2 z-10 text-[10px] font-mono pointer-events-none">
      <div className={plasmaOn ? 'text-safe' : 'text-ink/55'}>
        ● PLASMA {plasmaOn ? 'CONFINED' : 'OFFLINE'}
      </div>
      {ignition && <div className="text-accent font-bold">★ IGNITION: SELF-HEATING</div>}
      <div className="text-ink/70">T = {T.toFixed(1)} keV · stability {stability}%</div>
    </div>
  );
}

/** bare: hero-backdrop use (title screen): machine only, no HUD overlays. */
export default function ReactorScene({ bare = false }) {
  const reducedMotion = useReactorStore((s) => s.settings.reducedMotion);
  const autoRotate = useReactorStore((s) => s.settings.autoRotate !== false);
  // Physics view: strip the machine down to the reaction itself. Coils,
  // injectors, and plumbing would hide the very particles the view is for.
  const processView = useReactorStore((s) => s.viewMode === 'process') && !bare;
  return (
    <div className="relative w-full h-full bg-base">
      <Canvas
        camera={{ position: [4.6, 3.4, 4.6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: true }} // allows canvas screenshots
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 8, 4]} intensity={0.7} />
        <group rotation-x={-Math.PI / 2}>
          <Plasma majorR={R0} minorR={A} />
          <FusionProcess majorR={R0} />
          {!processView && <Vessel />}
          {!processView && <TFCoils />}
          {!processView && <PFCoils />}
          {!processView && <Solenoid />}
          {!processView && <Divertor />}
          {!processView && <CoolingLoops />}
          {!processView && <NBIInjectors />}
          <QuenchSparks />
        </group>
        <CameraRig />
        <Effects />
        <OrbitControls
          enablePan={false}
          minDistance={3.2}
          maxDistance={12}
          maxPolarAngle={Math.PI * 0.85}
          autoRotate={autoRotate && !reducedMotion}
          autoRotateSpeed={0.35}
        />
      </Canvas>
      {!bare && <DisruptionFlash />}
      {!bare && <StatusOverlay />}
      {!bare && <AnalysisOverlay />}
      {!bare && (
        <div className="absolute bottom-1.5 left-2 label-mono text-[8px] text-ink/55 pointer-events-none">
          drag to orbit / scroll to zoom
        </div>
      )}
    </div>
  );
}
