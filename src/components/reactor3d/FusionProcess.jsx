import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReactorStore } from '../../store/reactorStore.js';

// Visible-physics view of the tokamak: fuel ions gyrating along helical field
// lines (the magnetic bottle made literal), fusion flashes, alphas that stay
// bottled and re-heat the fuel, and neutrons that fly straight out because
// the field cannot hold anything without charge. All rates and speeds are
// driven by the live sim state; the legend translates dots to real numbers.

const MAX_IONS = 200;
const MAX_EVENTS = 10;   // concurrent fusion events (flash + alpha + neutron)
const Q_TWIST = 2.6;     // field-line twist (safety-factor look)
const MINOR_R = 0.42;    // guiding-center minor radius

const rand = (a, b) => a + Math.random() * (b - a);

/** Point on a helical field line, in the torus' natural XY plane. */
function fieldPoint(out, majorR, phi, theta0, minorR = MINOR_R, gyro = 0, gyroPhase = 0) {
  const theta = theta0 + phi * Q_TWIST;
  const r = minorR + gyro * Math.cos(gyroPhase);
  const ring = majorR + r * Math.cos(theta);
  out.set(
    ring * Math.cos(phi),
    ring * Math.sin(phi),
    r * Math.sin(theta) + gyro * Math.sin(gyroPhase) * 0.6,
  );
  return out;
}

function makeFieldLineGeometry(majorR, theta0) {
  const pts = [];
  const v = new THREE.Vector3();
  for (let i = 0; i <= 240; i++) {
    const phi = (i / 240) * Math.PI * 2;
    pts.push(fieldPoint(v, majorR, phi, theta0).clone());
  }
  const curve = new THREE.CatmullRomCurve3(pts, true);
  return new THREE.TubeGeometry(curve, 220, 0.008, 5, true);
}

export default function FusionProcess({ majorR = 2.0 }) {
  const ionRef = useRef();
  const flashRef = useRef();
  const alphaRef = useRef();
  const neutronRef = useRef();
  const lineMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#38BDF8', transparent: true, opacity: 0.12,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  }), []);
  const lineGeos = useMemo(
    () => [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((t0) => makeFieldLineGeometry(majorR, t0)),
    [majorR],
  );

  const sim = useMemo(() => ({
    ions: Array.from({ length: MAX_IONS }, () => ({
      phi: rand(0, Math.PI * 2),
      theta0: rand(0, Math.PI * 2),
      gyroPhase: rand(0, Math.PI * 2),
      jitter: rand(0.8, 1.25),
      shell: rand(0.45, 1.05), // nested flux surfaces fill the plasma volume
    })),
    events: [], // { t, pos, dir, phi0, theta0 }
    spawnAcc: 0,
    dummy: new THREE.Object3D(),
    color: new THREE.Color(),
    v: new THREE.Vector3(),
  }), []);

  useFrame((_, delta) => {
    const s = useReactorStore.getState();
    if (s.viewMode !== 'process' || s.mode === 'fission') {
      [ionRef, flashRef, alphaRef, neutronRef].forEach((r) => {
        if (r.current) r.current.count = 0;
      });
      if (lineMat.opacity !== 0) lineMat.opacity = 0;
      return;
    }
    const p = s.sim.physics;
    const c = s.sim.controls;
    const dt = Math.min(delta, 0.06) * (s.speed > 0 ? 1 : 0);
    const { ions, events, dummy, color, v } = sim;

    // field lines: visible with field strength, whether or not plasma is lit
    lineMat.opacity = 0.05 + (c.B / (c.bMax || 12)) * 0.25;

    const plasmaOn = p.plasmaOn;
    const tempN = Math.min(p.T / 25, 1);
    // stronger field = tighter spirals; the legend calls this out
    const gyroR = THREE.MathUtils.clamp(0.9 / Math.max(c.B, 1), 0.05, 0.28) * 0.35;
    const ionCount = plasmaOn
      ? Math.round(40 + (c.density / 5) * (MAX_IONS - 40))
      : 0;
    const tFrac = c.fuelMix ?? 0.5;

    if (dt > 0 && plasmaOn) {
      for (const ion of ions) {
        ion.phi += dt * (0.25 + Math.sqrt(tempN) * 0.9) * ion.jitter;
        ion.gyroPhase += dt * (14 + c.B * 1.6);
      }
      // fusion events: rate follows fusion power
      const rate = Math.min(p.pFusionMW / 30, 10) + (p.pFusionMW > 0.5 ? 0.3 : 0);
      sim.spawnAcc += dt * rate;
      while (sim.spawnAcc >= 1 && events.length < MAX_EVENTS) {
        sim.spawnAcc -= 1;
        const src = ions[Math.floor(Math.random() * ions.length)];
        const pos = fieldPoint(new THREE.Vector3(), majorR, src.phi, src.theta0);
        // neutron leaves radially outward from the plasma ring, uncharged
        const ringDir = new THREE.Vector3(Math.cos(src.phi), Math.sin(src.phi), 0);
        const dir = pos.clone().sub(ringDir.multiplyScalar(majorR)).normalize();
        if (dir.lengthSq() < 0.01) dir.set(0, 0, 1);
        events.push({ t: 0, pos, dir, phi0: src.phi, theta0: src.theta0 });
      }
      for (let i = events.length - 1; i >= 0; i--) {
        events[i].t += dt;
        if (events[i].t > 1.4) events.splice(i, 1);
      }
    }
    if (!plasmaOn) { events.length = 0; sim.spawnAcc = 0; }

    // ---- ions ----
    const iMesh = ionRef.current;
    if (iMesh) {
      for (let i = 0; i < ionCount; i++) {
        const ion = ions[i];
        fieldPoint(v, majorR, ion.phi, ion.theta0, MINOR_R * ion.shell, gyroR, ion.gyroPhase);
        dummy.position.copy(v);
        dummy.scale.setScalar(0.022);
        dummy.updateMatrix();
        iMesh.setMatrixAt(i, dummy.matrix);
        // deuterium cyan, tritium rose, split by the fuel-mix slider
        if (i / Math.max(ionCount, 1) < tFrac) color.set('#FCA5A5');
        else color.set('#7DD3FC');
        iMesh.setColorAt(i, color);
      }
      iMesh.count = ionCount;
      iMesh.instanceMatrix.needsUpdate = true;
      if (iMesh.instanceColor) iMesh.instanceColor.needsUpdate = true;
    }

    // ---- fusion flash / bottled alpha / escaping neutron ----
    const fMesh = flashRef.current;
    const aMesh = alphaRef.current;
    const nMesh = neutronRef.current;
    if (fMesh && aMesh && nMesh) {
      let fi = 0; let ai = 0; let ni = 0;
      for (const ev of events) {
        if (ev.t < 0.35) { // the flash itself
          dummy.position.copy(ev.pos);
          dummy.scale.setScalar(0.04 + ev.t * 0.5);
          dummy.updateMatrix();
          fMesh.setMatrixAt(fi, dummy.matrix);
          color.set('#FDE68A').multiplyScalar(1 - ev.t / 0.35);
          fMesh.setColorAt(fi, color);
          fi++;
        }
        // alpha: charged, so it stays on the field, spiraling and fading as
        // it hands its energy back to the fuel
        const at = ev.t / 1.4;
        fieldPoint(v, majorR, ev.phi0 + ev.t * 2.2, ev.theta0, MINOR_R * (1 - at * 0.4), gyroR * 2.2, ev.t * 26);
        dummy.position.copy(v);
        dummy.scale.setScalar(0.034 * (1 - at));
        dummy.updateMatrix();
        aMesh.setMatrixAt(ai, dummy.matrix);
        color.set('#FB923C').multiplyScalar(1 - at * 0.7);
        aMesh.setColorAt(ai, color);
        ai++;
        // neutron: no charge, straight line out through the blanket
        const dist = ev.t * 3.2;
        if (dist < 1.15) {
          v.copy(ev.pos).addScaledVector(ev.dir, dist);
          dummy.position.copy(v);
          dummy.scale.set(0.016, 0.016, 0.09);
          dummy.lookAt(v.clone().add(ev.dir));
          dummy.updateMatrix();
          nMesh.setMatrixAt(ni, dummy.matrix);
          color.set('#F8FAFC');
          nMesh.setColorAt(ni, color);
          ni++;
        } else if (dist < 1.45) { // absorbed: a little heat blooms in the blanket
          v.copy(ev.pos).addScaledVector(ev.dir, 1.15);
          dummy.position.copy(v);
          dummy.scale.setScalar(0.03 + (dist - 1.15) * 0.3);
          dummy.updateMatrix();
          fMesh.setMatrixAt(fi, dummy.matrix);
          color.set('#F59E0B').multiplyScalar(Math.max(1 - (dist - 1.15) / 0.3, 0));
          fMesh.setColorAt(fi, color);
          fi++;
        }
      }
      fMesh.count = fi; aMesh.count = ai; nMesh.count = ni;
      [fMesh, aMesh, nMesh].forEach((m) => {
        m.instanceMatrix.needsUpdate = true;
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
      });
    }
  });

  const viewMode = useReactorStore((s) => s.viewMode);
  if (viewMode !== 'process') return null;

  return (
    <group>
      {/* ghost of the vacuum chamber: the hardware is hidden in this view,
          but the wall still needs to exist for the escaping neutrons to hit */}
      <mesh>
        <torusGeometry args={[majorR, 0.95, 24, 96]} />
        <meshBasicMaterial
          color="#7DA7C9"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {lineGeos.map((geo, i) => (
        <mesh key={i} geometry={geo} material={lineMat} />
      ))}
      <instancedMesh ref={ionRef} args={[undefined, undefined, MAX_IONS]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.9} />
      </instancedMesh>
      <instancedMesh ref={flashRef} args={[undefined, undefined, MAX_EVENTS * 2]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={alphaRef} args={[undefined, undefined, MAX_EVENTS]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={neutronRef} args={[undefined, undefined, MAX_EVENTS]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}
