import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { Mesh } from 'three'

function SpinningIcosahedron() {
  const meshRef = useRef<Mesh>(null)
  const { invalidate } = useThree()

  useFrame(() => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += 0.02
    meshRef.current.rotation.x += 0.01
    invalidate()
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#9CA3AF" wireframe />
    </mesh>
  )
}

export function ThreeSpinner() {
  return (
    <div style={{ width: 60, height: 60 }}>
      <Canvas
        frameloop="demand"
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        camera={{ position: [0, 0, 2.5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <SpinningIcosahedron />
      </Canvas>
    </div>
  )
}
