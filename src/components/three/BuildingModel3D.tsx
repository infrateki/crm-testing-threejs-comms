import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { Group } from 'three'

function getGeometryForNaics(naicsCode: string | null | undefined) {
  if (!naicsCode) return 'generic'
  const code = naicsCode.slice(0, 4)
  if (code === '2373') return 'infrastructure' // transportation
  if (code === '2379') return 'port'           // maritime/port
  if (code === '2371') return 'pipeline'        // utility pipeline
  if (code === '2381' || code === '2382') return 'industrial'
  if (code === '5616') return 'government'
  return 'generic'
}

function BuildingGeometry({ type }: { type: string }) {
  const groupRef = useRef<Group>(null)

  useFrame(() => {
    // no auto-rotation — OrbitControls handles it
  })

  const mat = <meshBasicMaterial color="#2C3E50" wireframe />

  if (type === 'infrastructure') {
    return (
      <group ref={groupRef}>
        {/* Long runway slab */}
        <mesh position={[0, -1, 0]}>
          <boxGeometry args={[8, 0.2, 2]} />
          {mat}
        </mesh>
        {/* Control tower */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.6, 3, 0.6]} />
          {mat}
        </mesh>
        <mesh position={[0, 2, 0]}>
          <boxGeometry args={[1.2, 0.4, 1.2]} />
          {mat}
        </mesh>
      </group>
    )
  }

  if (type === 'port') {
    return (
      <group ref={groupRef}>
        {/* Dock platform */}
        <mesh position={[0, -1, 0]}>
          <boxGeometry args={[6, 0.3, 3]} />
          {mat}
        </mesh>
        {/* Crane vertical */}
        <mesh position={[1.5, 0.5, 0]}>
          <boxGeometry args={[0.2, 3, 0.2]} />
          {mat}
        </mesh>
        {/* Crane arm */}
        <mesh position={[2.5, 2, 0]}>
          <boxGeometry args={[2.5, 0.2, 0.2]} />
          {mat}
        </mesh>
        {/* Warehouses */}
        <mesh position={[-1.5, -0.2, 0]}>
          <boxGeometry args={[2, 1.5, 2]} />
          {mat}
        </mesh>
      </group>
    )
  }

  if (type === 'pipeline') {
    return (
      <group ref={groupRef}>
        {/* Storage tanks */}
        <mesh position={[-1.5, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 2.5, 12]} />
          {mat}
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 2.5, 12]} />
          {mat}
        </mesh>
        <mesh position={[1.5, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 2.5, 12]} />
          {mat}
        </mesh>
        {/* Connecting pipe */}
        <mesh position={[0, -0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
          {mat}
        </mesh>
      </group>
    )
  }

  if (type === 'government') {
    return (
      <group ref={groupRef}>
        {/* Main building */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[4, 2, 2.5]} />
          {mat}
        </mesh>
        {/* Pediment / roof triangle */}
        <mesh position={[0, 1.4, 0]}>
          <coneGeometry args={[2.5, 1, 4]} />
          {mat}
        </mesh>
        {/* Columns */}
        {[-1.5, -0.5, 0.5, 1.5].map((x) => (
          <mesh key={x} position={[x, -0.2, 1.4]}>
            <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
            {mat}
          </mesh>
        ))}
      </group>
    )
  }

  // generic building
  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 2.5, 2]} />
        {mat}
      </mesh>
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[1.2, 1.0, 1.2]} />
        {mat}
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[0.85, 0.8, 4]} />
        {mat}
      </mesh>
    </group>
  )
}

interface BuildingModel3DProps {
  naicsCode?: string | null
  style?: React.CSSProperties
}

export function BuildingModel3D({ naicsCode, style }: BuildingModel3DProps) {
  const type = getGeometryForNaics(naicsCode)

  return (
    <div style={{ width: '100%', height: '100%', ...style }}>
      <Canvas
        frameloop="demand"
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        camera={{ position: [5, 3, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: '#FAF8F3' }}
      >
        <Suspense fallback={null}>
          <BuildingGeometry type={type} />
          <gridHelper args={[10, 10, '#E5E7EB', '#F3F4F6']} position={[0, -1.1, 0]} />
          <OrbitControls
            enablePan={false}
            minDistance={3}
            maxDistance={12}
            autoRotate
            autoRotateSpeed={0.6}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
