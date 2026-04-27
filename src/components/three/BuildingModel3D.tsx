import { useMemo, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { Opportunity } from '@/types/opportunity'
import { useIsMobile } from '@/hooks/useIsMobile'
import { resolveScene, SpinningBuilding } from './BuildingScenes'

interface BuildingModel3DProps {
  opportunity?: Opportunity
  geographyTag?: string
  /** Legacy / convenience — derives scene from NAICS prefix if no opportunity */
  naicsCode?: string | null
  style?: React.CSSProperties
}

export function BuildingModel3D({
  opportunity,
  geographyTag,
  naicsCode,
  style,
}: BuildingModel3DProps) {
  const isMobile = useIsMobile()
  const scene = useMemo(
    () => resolveScene(opportunity, geographyTag, naicsCode),
    [opportunity, geographyTag, naicsCode],
  )

  if (isMobile) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#FAF8F3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: '#9CA3AF',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          ...style,
        }}
      >
        3D preview disabled on mobile
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', ...style }}>
      <Canvas
        frameloop="demand"
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        camera={{ position: [6, 4, 7], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: '#FAF8F3' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          {/* Self-rotating group — works under frameloop=demand. User can still
              drag to orbit camera; building keeps spinning underneath. */}
          <SpinningBuilding scene={scene} speed={0.002} />
          <gridHelper args={[14, 14, '#E5E7EB', '#F3F4F6']} position={[0, -1.7, 0]} />
          <OrbitControls
            enablePan={false}
            minDistance={4}
            maxDistance={14}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
