import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

function SpinningCube() {
  const meshRef = useRef<Mesh>(null)

  useFrame(() => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += 0.02
    meshRef.current.rotation.x += 0.01
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#9CA3AF" wireframe />
    </mesh>
  )
}

export function ThreeSpinner() {
  return (
    <div style={{ width: 80, height: 80 }}>
      <Canvas
        frameloop="always"
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        camera={{ position: [0, 0, 2.5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <SpinningCube />
      </Canvas>
    </div>
  )
}
