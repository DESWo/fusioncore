import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReactorStore } from '../../store/reactorStore.js';

// Visible-physics view of the core: a population-controlled particle system
// whose neutron count tracks real flux, so criticality, trips, rod motion,
// the neutron source, and xenon all read directly off the screen. Each dot
// stands for ~3e13 real neutrons (see the legend in AnalysisOverlay).

const MAX_N = 160;      // neutron instance pool
const MAX_XE = 24;      // xenon motes
const MAX_COOL = 30;    // coolant streaks
const MAX_FLASH = 16;   // fission flash pool
const CORE_R = 0.76;    // interior radius the neutrons roam
const CORE_HH = 0.7;    // interior half-height
const FAST_SPEED = 2.3; // scene units/s, fresh from fission
const THERMAL_SPEED = 0.5;

// Fuel columns (fission sites); control columns must match RodBank's 3x3 grid
const FUEL_COLS = [];
for (let i = -1.5; i <= 1.5; i++) {
  for (let j = -1.5; j <= 1.5; j++) {
    const x = i * 0.36; const z = j * 0.36;
    if (Math.hypot(x, z) < 0.7) FUEL_COLS.push([x, z]);
  }
}
const ROD_COLS = [];
for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) ROD_COLS.push([i * 0.38, j * 0.38]);

/** Tip height of the visible control-rod bank (mirrors RodBank's motion). */
function rodTipY(rodFrac) {
  return 1.05 + (1 - rodFrac) * 1.15 - 1.2;
}

const rand = (a, b) => a + Math.random() * (b - a);

function spawnNeutron(list, x, z, y) {
  if (list.length >= MAX_N) return;
  const dir = new THREE.Vector3().randomDirection();
  list.push({
    pos: new THREE.Vector3(x, y ?? rand(-CORE_HH * 0.9, CORE_HH * 0.9), z),
    dir,
    age: 0,
  });
}

export default function FissionProcess() {
  const neutronRef = useRef();
  const xenonRef = useRef();
  const coolRef = useRef();
  const flashRef = useRef();
  // one shared material so every fuel column glows together
  const fuelMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#7B8794', metalness: 0.6, roughness: 0.45, emissive: '#1A2030',
  }), []);

  const sim = useMemo(() => ({
    neutrons: [],
    flashes: [], // { pos, t, color }
    xenon: Array.from({ length: MAX_XE }, () => ({
      pos: new THREE.Vector3(rand(-0.6, 0.6), rand(-CORE_HH, CORE_HH), rand(-0.6, 0.6)),
      drift: new THREE.Vector3().randomDirection().multiplyScalar(0.08),
    })),
    coolant: Array.from({ length: MAX_COOL }, (_, i) => {
      const a = (i / MAX_COOL) * Math.PI * 2;
      return { a, r: rand(0.92, 1.12), y: rand(-1.0, 1.0) };
    }),
    dummy: new THREE.Object3D(),
    color: new THREE.Color(),
  }), []);

  useFrame((_, delta) => {
    const s = useReactorStore.getState();
    if (s.viewMode !== 'process' || s.mode !== 'fission') {
      [neutronRef, xenonRef, coolRef, flashRef].forEach((r) => {
        if (r.current) r.current.count = 0;
      });
      return;
    }
    const p = s.sim.physics;
    const dt = Math.min(delta, 0.06) * (s.speed > 0 ? 1 : 0); // freeze with the sim
    const { neutrons, flashes, dummy, color } = sim;

    // Population target: tracks real flux. The source floor keeps a few dots
    // wandering even shut down (real cores keep a neutron source installed).
    const fluxFrac = Math.min(p.fluxFrac ?? 0, 1.2);
    const target = Math.max(3, Math.round(4 + fluxFrac * (MAX_N - 12)));
    const pressure = (target - neutrons.length) / Math.max(target, 1); // + grow, - shrink
    const rodFrac = (p.rodPos ?? 100) / 100;
    const tipY = rodTipY(rodFrac);
    const xenonBite = Math.min(p.xenonPcm / 6000, 0.5);

    if (dt > 0) {
      // ---- update neutrons ----
      for (let i = neutrons.length - 1; i >= 0; i--) {
        const n = neutrons[i];
        n.age += dt;
        const thermal = Math.min(n.age / 1.1, 1);
        const speed = FAST_SPEED + (THERMAL_SPEED - FAST_SPEED) * thermal;
        // thermal random-walk scatter (Brownian look once moderated)
        if (thermal > 0.7 && Math.random() < dt * 2.5) {
          n.dir.randomDirection();
        }
        n.pos.addScaledVector(n.dir, speed * dt);

        // leak out of the core: gone (water + reflector, abstracted)
        const r = Math.hypot(n.pos.x, n.pos.z);
        if (r > CORE_R || Math.abs(n.pos.y) > CORE_HH) {
          if (pressure > 0.3) { // conserve when the population needs to grow
            n.dir.negate();
            if (r > CORE_R) {
              const k = CORE_R / r;
              n.pos.x *= k;
              n.pos.z *= k;
            }
            n.pos.y = THREE.MathUtils.clamp(n.pos.y, -CORE_HH, CORE_HH);
          } else {
            neutrons.splice(i, 1);
            continue;
          }
        }

        // control-rod absorption: inside a rod column, above the bank tip
        if (n.pos.y > tipY) {
          for (const [cx, cz] of ROD_COLS) {
            if (Math.hypot(n.pos.x - cx, n.pos.z - cz) < 0.075) {
              if (Math.random() < dt * 9 * (1 - pressure)) {
                flashes.push({ pos: n.pos.clone(), t: 0, color: '#94A3B8' });
                neutrons.splice(i, 1);
              }
              break;
            }
          }
          if (neutrons[i] !== n) continue;
        }

        // xenon absorption: anywhere, scaled by poison worth
        if (xenonBite > 0.02 && Math.random() < dt * xenonBite * (1 - pressure) * 1.2) {
          flashes.push({ pos: n.pos.clone(), t: 0, color: '#C084FC' });
          neutrons.splice(i, 1);
          continue;
        }

        // fission: a THERMAL neutron near a fuel column splits a nucleus.
        // Probability leans with the population controller so the visual
        // multiplication factor mirrors the real k-effective.
        if (thermal > 0.85) {
          for (const [cx, cz] of FUEL_COLS) {
            if (Math.hypot(n.pos.x - cx, n.pos.z - cz) < 0.085) {
              const bias = THREE.MathUtils.clamp(1 + pressure * 2.2, 0.25, 3.2);
              if (Math.random() < dt * 2.6 * bias) {
                flashes.push({ pos: n.pos.clone(), t: 0, color: '#FCD34D' });
                const kids = Math.random() < 0.4 ? 3 : 2;
                for (let k = 0; k < kids; k++) spawnNeutron(neutrons, n.pos.x, n.pos.z, n.pos.y);
                neutrons.splice(i, 1);
              }
              break;
            }
          }
        }
      }

      // source neutrons keep the chain alive (and restart it after a trip)
      if (neutrons.length < target && Math.random() < dt * (2 + (target - neutrons.length) * 0.9)) {
        const [fx, fz] = FUEL_COLS[Math.floor(Math.random() * FUEL_COLS.length)];
        spawnNeutron(neutrons, fx, fz);
      }

      // ---- flashes age out ----
      for (let i = flashes.length - 1; i >= 0; i--) {
        flashes[i].t += dt * 3.2;
        if (flashes[i].t >= 1) flashes.splice(i, 1);
      }
      if (flashes.length > MAX_FLASH) flashes.splice(0, flashes.length - MAX_FLASH);

      // ---- xenon motes drift ----
      for (const m of sim.xenon) {
        m.pos.addScaledVector(m.drift, dt);
        if (m.pos.length() > 0.85) m.drift.negate();
      }

      // ---- coolant rises with pump flow ----
      const flow = Math.max((s.sim.controls.pumps ?? 100) / 100, 0.05);
      for (const c of sim.coolant) {
        c.y += dt * (0.5 + flow * 2.2);
        if (c.y > 1.05) c.y = -1.05;
      }
    }

    // ---- write instances ----
    const nMesh = neutronRef.current;
    if (nMesh) {
      neutrons.forEach((n, i) => {
        const thermal = Math.min(n.age / 1.1, 1);
        dummy.position.copy(n.pos);
        const sc = 0.055 - thermal * 0.02;
        dummy.scale.setScalar(sc);
        dummy.updateMatrix();
        nMesh.setMatrixAt(i, dummy.matrix);
        color.setRGB(1 - thermal * 0.6, 1 - thermal * 0.22, 1);
        nMesh.setColorAt(i, color);
      });
      nMesh.count = neutrons.length;
      nMesh.instanceMatrix.needsUpdate = true;
      if (nMesh.instanceColor) nMesh.instanceColor.needsUpdate = true;
    }

    const fMesh = flashRef.current;
    if (fMesh) {
      flashes.forEach((f, i) => {
        dummy.position.copy(f.pos);
        dummy.scale.setScalar(0.05 + f.t * 0.17);
        dummy.updateMatrix();
        fMesh.setMatrixAt(i, dummy.matrix);
        color.set(f.color).multiplyScalar(1 - f.t);
        fMesh.setColorAt(i, color);
      });
      fMesh.count = flashes.length;
      fMesh.instanceMatrix.needsUpdate = true;
      if (fMesh.instanceColor) fMesh.instanceColor.needsUpdate = true;
    }

    const xMesh = xenonRef.current;
    if (xMesh) {
      const xCount = Math.min(Math.round((p.xenonPcm / 2800) * MAX_XE), MAX_XE);
      for (let i = 0; i < xCount; i++) {
        dummy.position.copy(sim.xenon[i].pos);
        dummy.scale.setScalar(0.028);
        dummy.updateMatrix();
        xMesh.setMatrixAt(i, dummy.matrix);
      }
      xMesh.count = xCount;
      xMesh.instanceMatrix.needsUpdate = true;
    }

    const cMesh = coolRef.current;
    if (cMesh) {
      const tCool = THREE.MathUtils.clamp(((p.TcoolC ?? 290) - 290) / 60, 0, 1);
      sim.coolant.forEach((c, i) => {
        dummy.position.set(Math.cos(c.a) * c.r, c.y, Math.sin(c.a) * c.r);
        dummy.scale.set(0.02, 0.16, 0.02);
        dummy.updateMatrix();
        cMesh.setMatrixAt(i, dummy.matrix);
        // picks up heat on the way up: cyan inlet, warmer outlet
        const warm = THREE.MathUtils.clamp((c.y + 1) / 2, 0, 1) * tCool;
        color.setRGB(0.22 + warm * 0.75, 0.74 - warm * 0.25, 0.97 - warm * 0.55);
        cMesh.setColorAt(i, color);
      });
      cMesh.count = sim.coolant.length;
      cMesh.instanceMatrix.needsUpdate = true;
      if (cMesh.instanceColor) cMesh.instanceColor.needsUpdate = true;
    }

    // fuel lattice glows with fuel temperature
    const tFuel = THREE.MathUtils.clamp(((p.TfuelC ?? 290) - 290) / 1900, 0, 1);
    fuelMat.emissive.setRGB(0.9 * tFuel, 0.35 * tFuel, 0.08 * tFuel);
    fuelMat.emissiveIntensity = 0.3 + tFuel * 1.6;
  });

  const viewMode = useReactorStore((s) => s.viewMode);
  if (viewMode !== 'process') return null;

  return (
    <group>
      {/* fuel columns: the uranium the neutrons are splitting */}
      {FUEL_COLS.map(([x, z], i) => (
        <mesh key={i} position={[x, 0, z]} material={fuelMat}>
          <cylinderGeometry args={[0.03, 0.03, 1.4, 6]} />
        </mesh>
      ))}
      <instancedMesh ref={neutronRef} args={[undefined, undefined, MAX_N]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={flashRef} args={[undefined, undefined, MAX_FLASH]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={xenonRef} args={[undefined, undefined, MAX_XE]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color="#C084FC" toneMapped={false} transparent opacity={0.75} />
      </instancedMesh>
      <instancedMesh ref={coolRef} args={[undefined, undefined, MAX_COOL]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}
