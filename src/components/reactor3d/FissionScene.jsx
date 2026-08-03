import { useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useReactorStore } from '../../store/reactorStore.js';
import { fissionPlantOf } from '../../engine/fission.js';
import AnalysisOverlay from './AnalysisOverlay.jsx';
import FissionProcess from './FissionProcess.jsx';
import Effects from './Effects.jsx';
import { heatColor, hazardPulse } from './heatmap.js';

// PWR cutaway: pressure vessel, fuel core (glows with power: Cherenkov blue),
// a control-rod bank that physically follows the rods slider, and coolant loops.

function Core() {
  const matRef = useRef();
  const lightRef = useRef();
  useFrame((state, delta) => {
    const s = useReactorStore.getState();
    const p = s.sim.physics;
    const f = Math.min((p.P + p.decayMW) / fissionPlantOf(s.sim).nominalMW, 1.2);
    if (matRef.current) {
      // process view: the shell goes glassy so the chain reaction inside reads
      const ghost = s.viewMode === 'process';
      matRef.current.opacity += ((ghost ? 0.1 : 1) - matRef.current.opacity) * Math.min(delta * 5, 1);
      if (s.analysisView) {
        // cladding load: fuel temperature vs damage threshold, or accumulated wear
        const load = Math.max(p.TfuelC / 2200, 1 - s.sim.structure.cladding / 100);
        const pulse = hazardPulse(state.clock.elapsedTime, s.sim.hazards?.fuelTemp !== 0);
        heatColor(matRef.current.emissive, load);
        matRef.current.emissiveIntensity = 0.8 + pulse * 1.4;
      } else {
        // dim steel -> Cherenkov blue-white with power
        const t = Math.min(f * 1.6, 1);
        const target = new THREE.Color(0.1 + t * 0.25, 0.15 + t * 0.55, 0.25 + t * 0.75);
        matRef.current.emissive.lerp(target, Math.min(delta * 3, 1));
        matRef.current.emissiveIntensity = (0.25 + t * 2.2) * (ghost ? 0.25 : 1);
      }
    }
    if (lightRef.current) {
      lightRef.current.intensity = s.analysisView ? 1
        : (0.3 + f * 16) * (s.viewMode === 'process' ? 0.25 : 1);
    }
  });
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.85, 0.85, 1.5, 24]} />
        <meshStandardMaterial ref={matRef} color="#31435C" emissive="#0A1830" metalness={0.4} roughness={0.5} transparent />
      </mesh>
      <pointLight ref={lightRef} color="#7DC4FF" distance={10} decay={1.8} />
    </group>
  );
}

function RodBank() {
  const groupRef = useRef();
  useFrame((_, delta) => {
    const st = useReactorStore.getState().sim;
    const rods = st.physics.rodPos ?? st.controls.rods ?? 100;
    if (!groupRef.current) return;
    // fully inserted: rods sit inside the core; withdrawn: raised above it
    const target = 1.05 + (1 - rods / 100) * 1.15;
    groupRef.current.position.y += (target - groupRef.current.position.y) * Math.min(delta * 4, 1);
  });
  const positions = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) positions.push([i * 0.38, j * 0.38]);
  }
  return (
    <group ref={groupRef} position={[0, 2.2, 0]}>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.5, 12]} />
        <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.05, 0.1, 1.05]} />
        <meshStandardMaterial color="#475569" metalness={0.75} roughness={0.4} />
      </mesh>
      {positions.map(([x, z], i) => (
        <mesh key={i} position={[x, -0.35, z]}>
          <cylinderGeometry args={[0.045, 0.045, 1.7, 8]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function Vessel() {
  const groupRef = useRef();
  useFrame(() => {
    const s = useReactorStore.getState();
    if (!groupRef.current) return;
    groupRef.current.children.forEach((mesh) => {
      const m = mesh.material;
      if (!m) return;
      if (s.analysisView) {
        // embrittlement: RT_NDT shift consumed vs the PTS screening limit
        const load = (160 * Math.sqrt(Math.max(1 - s.sim.structure.vessel / 100, 0))) / 132;
        heatColor(m.color, load);
        m.emissive.copy(m.color).multiplyScalar(0.3);
        m.opacity = 1;
      } else {
        m.color.set(mesh.userData.base);
        m.emissive.set('#000000');
        // process view: the steel goes glassy so the chain reaction inside
        // is visible from every angle
        m.opacity = s.viewMode === 'process' ? 0.12 : (mesh.userData.opacity ?? 1);
      }
    });
  });
  return (
    <group ref={groupRef}>
      {/* main pressure vessel, cutaway (3/4 shell) */}
      <mesh userData={{ base: '#233044' }}>
        <cylinderGeometry args={[1.25, 1.25, 3.4, 32, 1, true, Math.PI * 0.25, Math.PI * 1.5]} />
        <meshStandardMaterial color="#233044" metalness={0.75} roughness={0.4} side={THREE.DoubleSide} transparent />
      </mesh>
      <mesh position={[0, 1.95, 0]} userData={{ base: '#2B3A52' }}>
        <sphereGeometry args={[1.25, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2B3A52" metalness={0.75} roughness={0.4} transparent />
      </mesh>
      <mesh position={[0, -1.95, 0]} rotation-x={Math.PI} userData={{ base: '#2B3A52' }}>
        <sphereGeometry args={[1.25, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2B3A52" metalness={0.75} roughness={0.4} transparent />
      </mesh>
    </group>
  );
}

function SteamGenerators() {
  const hotRef = useRef();
  const groupRef = useRef();
  useFrame((state) => {
    const s = useReactorStore.getState();
    const p = s.sim.physics;
    const t = Math.min(Math.max((p.TcoolC - 290) / 60, 0), 1);
    if (hotRef.current) hotRef.current.emissiveIntensity = s.analysisView ? 0 : t * 0.9;
    if (!groupRef.current) return;
    // thermal load measured above the cold-leg baseline (290 °C), limit 345 °C
    const load = Math.max((p.TcoolC - 290) / 55, 1 - s.sim.structure.steamGen / 100);
    const pulse = hazardPulse(state.clock.elapsedTime, s.sim.hazards?.coolant !== 0);
    groupRef.current.children.forEach((grp) => {
      const m = grp.children[0]?.material; // the SG shell cylinder
      if (!m) return;
      if (s.analysisView) {
        heatColor(m.color, load);
        m.emissive.copy(m.color).multiplyScalar(0.35 + pulse * 0.8);
      } else {
        m.color.set('#3A4A63');
        m.emissive.set('#000000');
      }
    });
  });
  return <group ref={groupRef}>{[0, 1, 2, 3].map((i) => {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const x = Math.cos(a) * 3.1;
    const z = Math.sin(a) * 3.1;
    return (
      <group key={i} position={[x, 0.4, z]}>
        <mesh>
          <cylinderGeometry args={[0.55, 0.7, 3.2, 20]} />
          <meshStandardMaterial color="#3A4A63" metalness={0.7} roughness={0.45} />
        </mesh>
        {/* hot-leg pipe back to the vessel */}
        <mesh position={[-x * 0.32, -1.1, -z * 0.32]} rotation={[0, -a + Math.PI / 2, Math.PI / 2]}>
          <cylinderGeometry args={[0.14, 0.14, 1.9, 10]} />
          <meshStandardMaterial ref={i === 0 ? hotRef : undefined} color="#7A4A3A" emissive="#FF5A2A" emissiveIntensity={0} metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
    );
  })}</group>;
}

/** Open research pool: a translucent water tank instead of a pressure vessel. */
function PoolTank() {
  return (
    <group>
      {/* tank shell, open at the top */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1.7, 1.7, 4.2, 32, 1, true]} />
        <meshStandardMaterial color="#243244" metalness={0.5} roughness={0.6} side={THREE.DoubleSide} transparent opacity={0.45} />
      </mesh>
      {/* the water itself, glowing faintly blue */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[1.62, 1.62, 3.9, 32]} />
        <meshStandardMaterial color="#10314F" emissive="#0A2A4A" emissiveIntensity={0.5} transparent opacity={0.22} depthWrite={false} />
      </mesh>
      {/* pool floor */}
      <mesh position={[0, -1.72, 0]}>
        <cylinderGeometry args={[1.7, 1.7, 0.12, 32]} />
        <meshStandardMaterial color="#1B2534" metalness={0.6} roughness={0.6} />
      </mesh>
    </group>
  );
}

/**
 * Names the parts. Without these the plant is a set of dark cylinders and you
 * cannot tell the pressure vessel from a steam generator, let alone work out
 * that the rods you are driving are the thin stalks at the top.
 *
 * Anchored in world space so they track as you orbit, and deliberately NOT
 * occlusion-tested: a label you can only read from one angle is worse than no
 * label. They are hidden in the physics view, where the vessel is stripped away
 * and the point is the neutrons rather than the hardware.
 */
function Tag({ position, children, tone = 'slate' }) {
  const color = tone === 'accent' ? 'text-accent border-accent/50' : 'text-slate-300 border-slate-600';
  return (
    <Html position={position} center distanceFactor={9} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
      <div className={`label-mono text-[7px] whitespace-nowrap px-1 py-px rounded-sm border bg-slate-900/85 ${color}`}>
        {children}
      </div>
    </Html>
  );
}

function PartLabels({ research }) {
  if (research) {
    return (
      <group>
        <Tag position={[0, 2.9, 0]}>Control rod drives</Tag>
        <Tag position={[0, -0.2, 1.95]} tone="accent">Fuel core</Tag>
        <Tag position={[1.95, 1.4, 0]}>Open water pool · moderator + shield</Tag>
      </group>
    );
  }
  return (
    <group>
      <Tag position={[0, 3.15, 0]}>Control rod drives</Tag>
      <Tag position={[0, -0.25, 1.55]} tone="accent">Fuel core</Tag>
      <Tag position={[1.75, 1.5, 0]}>Pressure vessel</Tag>
      <Tag position={[2.35, 2.3, 2.35]}>Steam generator ×4</Tag>
      <Tag position={[1.5, -1.15, 1.5]}>Hot leg · core to steam</Tag>
    </group>
  );
}

function StatusOverlay() {
  const P = useReactorStore((s) => s.sim.physics.P);
  const critical = useReactorStore((s) => s.sim.physics.critical);
  const scrammed = useReactorStore((s) => s.sim.physics.scrammed);
  const rho = useReactorStore((s) => s.sim.physics.reactivityPcm);
  return (
    <div className="absolute top-2 left-2 z-10 text-[10px] font-mono pointer-events-none">
      <div className={critical ? 'text-safe' : scrammed ? 'text-crit' : 'text-slate-500'}>
        ● {critical ? 'CRITICAL' : scrammed ? 'TRIPPED' : 'SHUTDOWN'}
      </div>
      <div className="text-slate-400">
        {(P >= 1 ? `${(P / 1000).toFixed(2)} GW` : `${(P * 1000).toFixed(0)} kW`)} · ρ {rho >= 0 ? '+' : ''}{rho.toFixed(0)} pcm
      </div>
    </div>
  );
}

export default function FissionScene() {
  // Research pool: an open tank with no steam plant. The Cherenkov-blue core
  // and rod bank carry the scene; the PWR keeps its vessel and generators.
  const research = useReactorStore((s) => s.sim.plantKey === 'research');
  const reducedMotion = useReactorStore((s) => s.settings.reducedMotion);
  const autoRotate = useReactorStore((s) => s.settings.autoRotate !== false);
  // Physics view: only the reaction chamber. The vessel, pool, and steam
  // plant would stand between the camera and the neutrons.
  const processView = useReactorStore((s) => s.viewMode === 'process');
  const controlsRef = useRef();

  // Scroll-to-zoom has no obvious way back, and it is easy to end up nose-first
  // in the vessel with no idea how to recover. This is that way back.
  const resetView = useCallback(() => {
    const c = controlsRef.current;
    if (!c) return;
    c.object.position.set(5.4, 3.2, 5.4);
    c.target.set(0, 0, 0);
    c.update();
  }, []);

  return (
    <div className="relative w-full h-full bg-base">
      <Canvas
        camera={{ position: [5.4, 3.2, 5.4], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
      >
        {/* The shells are metalness 0.75. A metal reflects its surroundings, so
            with one directional light and nothing to reflect it renders as a
            near-black silhouette. The hemisphere light gives every metal a sky
            and a ground to pick up, and the two fills put an edge on the
            curved surfaces so the vessel reads as a cylinder rather than a
            blob. Lights only: no environment map, because an HDR would be a
            network fetch this app does not otherwise need. */}
        <hemisphereLight args={['#7FA8D0', '#0B1220', 1.1]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 9, 4]} intensity={1.1} />
        <directionalLight position={[-7, 3, -5]} intensity={0.5} color="#8FB6FF" />
        <directionalLight position={[0, -4, 6]} intensity={0.28} color="#9BB8D8" />
        <Core />
        <FissionProcess />
        <RodBank />
        {!processView && (research ? <PoolTank /> : <Vessel />)}
        {!processView && !research && <SteamGenerators />}
        {!processView && <PartLabels research={research} />}
        <Effects />
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={3.5}
          maxDistance={14}
          maxPolarAngle={Math.PI * 0.85}
          autoRotate={autoRotate && !reducedMotion}
          autoRotateSpeed={0.35}
        />
      </Canvas>
      <StatusOverlay />
      <AnalysisOverlay />
      <button
        type="button"
        onClick={resetView}
        // lg:right-[424px] clears the floating instrument column, the same
        // offset every sibling overlay in this container uses. Without it the
        // button sat underneath the column at >=1024px and could not be
        // clicked at all, on desktop, which is where it is most needed.
        // bottom-16 keeps it clear of AnalysisOverlay's legend at bottom-6.
        className="absolute bottom-16 right-2 lg:right-[424px] z-10 label-mono text-[9px] px-2 py-1 rounded bg-slate-800/80 border border-slate-600 text-slate-300 hover:text-ink hover:border-accent"
      >
        RESET VIEW
      </button>
      <div className="absolute bottom-1.5 left-2 text-[9px] text-slate-500 pointer-events-none">
        drag to orbit · scroll to zoom · rods move with your slider
      </div>
    </div>
  );
}
