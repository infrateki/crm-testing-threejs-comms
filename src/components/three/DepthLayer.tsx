import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface DepthLayerProps {
  dataURL: string;
  depth: number;
  parallaxFactor: number;
  mouseRef: React.RefObject<{ x: number; y: number }>;
  intensity?: number;
}

export function DepthLayer({
  dataURL,
  depth,
  parallaxFactor,
  mouseRef,
  intensity = 0.02,
}: DepthLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, invalidate } = useThree();
  const texture = useTexture(dataURL);

  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  useFrame(() => {
    if (!meshRef.current) return;
    if (!mouseRef.current) return;

    const targetX = mouseRef.current.x * parallaxFactor * intensity * viewport.width;
    const targetY = mouseRef.current.y * parallaxFactor * intensity * viewport.height;

    const dx = targetX - meshRef.current.position.x;
    const dy = targetY - meshRef.current.position.y;

    meshRef.current.position.x += dx * 0.08;
    meshRef.current.position.y += dy * 0.08;

    // Keep frame loop ticking until convergence (frameloop="demand" mode)
    if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
      invalidate();
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -depth]}>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}
