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
  const { viewport } = useThree();
  const texture = useTexture(dataURL);

  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const targetRef = useRef({ x: 0, y: 0 });

  useFrame(() => {
    if (!meshRef.current) return;
    if (!mouseRef.current) return;

    targetRef.current.x = mouseRef.current.x * parallaxFactor * intensity * viewport.width;
    targetRef.current.y = mouseRef.current.y * parallaxFactor * intensity * viewport.height;

    meshRef.current.position.x += (targetRef.current.x - meshRef.current.position.x) * 0.08;
    meshRef.current.position.y += (targetRef.current.y - meshRef.current.position.y) * 0.08;
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
