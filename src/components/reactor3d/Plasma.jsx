import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReactorStore } from '../../store/reactorStore.js';

// Custom emissive plasma shader: color ramps deep red -> orange -> blue-white
// with temperature; vertex wobble grows as confinement degrades (spec §13).
const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uWobble;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec3 p = position;
    float w = sin(p.x * 6.0 + uTime * 7.0) * sin(p.y * 7.0 - uTime * 5.0) * sin(p.z * 5.0 + uTime * 3.0);
    p += normal * w * uWobble * 0.13;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform float uTemp;    // 0..1 normalized core temperature
  uniform float uIgnite;  // 1 when ignited
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec3 red    = vec3(0.55, 0.06, 0.02);
    vec3 orange = vec3(1.00, 0.42, 0.05);
    vec3 hot    = vec3(1.00, 0.85, 0.55);
    vec3 blue   = vec3(0.65, 0.82, 1.00);
    vec3 c = mix(red, orange, smoothstep(0.0, 0.35, uTemp));
    c = mix(c, hot,  smoothstep(0.3, 0.65, uTemp));
    c = mix(c, blue, smoothstep(0.6, 1.0, uTemp));
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 1.6);
    float brightness = 0.35 + uTemp * 1.5 + uIgnite * 0.6;
    float shimmer = 1.0 + 0.06 * sin(uTime * 11.0) * (0.3 + uTemp);
    vec3 col = c * brightness * shimmer * (0.55 + fresnel * 1.2);
    float alpha = 0.5 + 0.4 * fresnel + uTemp * 0.15;
    gl_FragColor = vec4(col, min(alpha, 0.95));
  }
`;

export default function Plasma({ majorR, minorR }) {
  const matRef = useRef();
  const meshRef = useRef();
  const lightRef = useRef();
  const color = useMemo(() => new THREE.Color(), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTemp: { value: 0 },
      uWobble: { value: 0 },
      uIgnite: { value: 0 },
    }),
    [],
  );

  useFrame((state, delta) => {
    const s = useReactorStore.getState();
    const p = s.sim.physics;
    const tempN = Math.min(p.T / 25, 1); // 25 keV ~ full blue-white
    // wobble: rises near operational limits, calm in steady state
    const limitStress = Math.max(
      p.greenwaldFrac > 0.8 ? (p.greenwaldFrac - 0.8) * 4 : 0,
      p.beta / p.betaLimit > 0.8 ? (p.beta / p.betaLimit - 0.8) * 4 : 0,
    );
    const target = p.plasmaOn ? Math.min(limitStress, 1) : 0;
    const u = uniforms;
    u.uTime.value += delta * (s.speed > 0 ? 1 : 0.15);
    // frame-rate-independent easing: converges the same regardless of fps
    u.uTemp.value += (tempN - u.uTemp.value) * Math.min(delta * 3, 1);
    u.uWobble.value += (target - u.uWobble.value) * Math.min(delta * 5, 1);
    u.uIgnite.value = p.ignition ? 1 : 0;

    // hidden in stress view (structure visible) and process view (the glow
    // would wash out the individual ions and neutrons)
    if (meshRef.current) {
      meshRef.current.visible = s.viewMode === 'normal' && (p.plasmaOn || u.uTemp.value > 0.01);
    }
    if (lightRef.current) {
      color.setRGB(
        0.9,
        0.35 + tempN * 0.5,
        0.15 + tempN * 0.85,
      );
      lightRef.current.color = color;
      const dim = s.viewMode === 'process' ? 0.25 : 1; // let the particles read
      lightRef.current.intensity = (p.plasmaOn ? 2 + tempN * 22 : 0.2) * dim;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <torusGeometry args={[majorR, minorR, 48, 140]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0, 0]} distance={14} decay={1.6} />
    </group>
  );
}
