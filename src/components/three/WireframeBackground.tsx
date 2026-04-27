import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { Group } from 'three'
import { useIsMobile } from '@/hooks/useIsMobile'

function CameraSetup() {
  const { camera } = useThree()
  useEffect(() => {
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

function CityScene() {
  const groupRef = useRef<Group>(null)
  const { invalidate } = useThree()

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += 0.001
    invalidate()
  })

  // 4 wireframe BoxGeometry buildings, varied heights, spread across the scene
  return (
    <>
      <gridHelper args={[40, 40, '#E5E7EB', '#E5E7EB']} position={[0, 0, 0]} />
      <group ref={groupRef}>
        <mesh position={[-6, 1.5, -2]}>
          <boxGeometry args={[2.5, 3, 2.5]} />
          <meshBasicMaterial color="#D1D5DB" wireframe transparent opacity={0.12} depthWrite={false} />
        </mesh>
        <mesh position={[-1, 2.25, 1]}>
          <boxGeometry args={[2, 4.5, 2]} />
          <meshBasicMaterial color="#D1D5DB" wireframe transparent opacity={0.12} depthWrite={false} />
        </mesh>
        <mesh position={[3, 1.0, -1]}>
          <boxGeometry args={[2.4, 2, 2.4]} />
          <meshBasicMaterial color="#D1D5DB" wireframe transparent opacity={0.12} depthWrite={false} />
        </mesh>
        <mesh position={[6.5, 1.75, 1.5]}>
          <boxGeometry args={[2.2, 3.5, 2.2]} />
          <meshBasicMaterial color="#D1D5DB" wireframe transparent opacity={0.12} depthWrite={false} />
        </mesh>
      </group>
    </>
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
        width: '100%',
        height: '300px',
        zIndex: -1,
        pointerEvents: 'none',
        overflow: 'hidden',
        ...style,
      }}
    >
      <Canvas
        orthographic
        frameloop="demand"
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        camera={{
          // 30° elevation: position at sin(30°)=0.5, cos(30°)≈0.866 normalized
          position: [8.66, 5, 8.66],
          zoom: 28,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <CameraSetup />
        <CityScene />
      </Canvas>
    </div>
  )
}
