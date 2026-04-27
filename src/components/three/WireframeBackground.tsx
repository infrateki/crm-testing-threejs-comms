import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { useIsMobile } from '@/hooks/useIsMobile'

function ArchitecturalScene() {
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += 0.001
    groupRef.current.rotation.x = Math.sin(Date.now() * 0.0003) * 0.08
  })

  return (
    <group ref={groupRef}>
      {/* Base building box */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[4, 2, 2]} />
        <meshBasicMaterial color="#1a1a1a" wireframe transparent opacity={0.15} depthWrite={false} />
      </mesh>
      {/* Tower */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[1.5, 2, 1.5]} />
        <meshBasicMaterial color="#1a1a1a" wireframe transparent opacity={0.15} depthWrite={false} />
      </mesh>
      {/* Pitched roof */}
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[1.2, 1, 4]} />
        <meshBasicMaterial color="#1a1a1a" wireframe transparent opacity={0.15} depthWrite={false} />
      </mesh>
      {/* Side wings */}
      <mesh position={[-2.5, -0.8, 0]}>
        <boxGeometry args={[1, 1.2, 1.6]} />
        <meshBasicMaterial color="#1a1a1a" wireframe transparent opacity={0.10} depthWrite={false} />
      </mesh>
      <mesh position={[2.5, -0.8, 0]}>
        <boxGeometry args={[1, 1.2, 1.6]} />
        <meshBasicMaterial color="#1a1a1a" wireframe transparent opacity={0.10} depthWrite={false} />
      </mesh>
    </group>
  )
}

interface WireframeBackgroundProps {
  style?: React.CSSProperties
}

export function WireframeBackground({ style }: WireframeBackgroundProps) {
  const isMobile = useIsMobile()
  if (isMobile) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        ...style,
      }}
    >
      <Canvas
        frameloop="always"
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        camera={{ position: [0, 0, 8], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ArchitecturalScene />
      </Canvas>
    </div>
  )
}
