import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

function canUseWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.matchMedia('(pointer: coarse)').matches) {
    const dm = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (typeof dm === 'number' && dm < 4) return false;
  }
  if ((navigator.hardwareConcurrency ?? 4) < 4) return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return !!gl;
  } catch {
    return false;
  }
}

function buildLattice(cells: number, spacing: number): Float32Array {
  const basis: ReadonlyArray<readonly [number, number, number]> = [
    [0, 0, 0],
    [0, 0.5, 0.5],
    [0.5, 0, 0.5],
    [0.5, 0.5, 0],
    [0.25, 0.25, 0.25],
    [0.25, 0.75, 0.75],
    [0.75, 0.25, 0.75],
    [0.75, 0.75, 0.25],
  ];
  const out = new Float32Array(cells * cells * cells * basis.length * 3);
  const half = cells / 2;
  let w = 0;
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      for (let k = 0; k < cells; k++) {
        for (const [bx, by, bz] of basis) {
          out[w++] = (i + bx - half) * spacing;
          out[w++] = (j + by - half) * spacing;
          out[w++] = (k + bz - half) * spacing;
        }
      }
    }
  }
  return out;
}

function Lattice() {
  const ref = useRef<THREE.Points>(null);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const { size } = useThree();
  const positions = useMemo(() => buildLattice(5, 0.32), []);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      mouse.current.tx = (e.clientX / size.width) * 2 - 1;
      mouse.current.ty = (e.clientY / size.height) * 2 - 1;
    }
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [size.width, size.height]);

  useFrame((_, delta) => {
    const p = ref.current;
    if (!p) return;
    const m = mouse.current;
    m.x += (m.tx - m.x) * 0.05;
    m.y += (m.ty - m.y) * 0.05;
    p.rotation.y += delta * 0.08 + m.x * delta * 0.4;
    p.rotation.x = m.y * 0.25;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={positions.length / 3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#98cbff"
        sizeAttenuation
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function HeroCanvas() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(canUseWebGL());
  }, []);
  if (!ready) return null;
  return (
    <Canvas
      className="hero-canvas"
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 3.2], fov: 55 }}
      frameloop="always"
    >
      <Lattice />
    </Canvas>
  );
}
