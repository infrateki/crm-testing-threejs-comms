import { useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import type { Opportunity } from '@/types/opportunity'
import { useIsMobile } from '@/hooks/useIsMobile'
import { resolveScene, SpinningBuilding, type BuildingScene } from './BuildingScenes'

function CameraSetup() {
  const { camera } = useThree()
  useEffect(() => {
    camera.lookAt(0, 0.5, 0)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

const SCENE_GLYPH: Record<BuildingScene, string> = {
  mia: '⌒',
  lga: '◇',
  dfw: '─',
  mco: '○',
  federal: '⊓',
  generic: '◫',
}

export type BuildingPreviewSize = 'card' | 'hero'

interface BuildingPreview3DProps {
  opportunity?: Opportunity
  geographyTag?: string
  naicsCode?: string | null
  hovered?: boolean
  showGrid?: boolean
  /** 'card' (200px) → zoom 35; 'hero' (400px+) → zoom 25. Default 'card'. */
  size?: BuildingPreviewSize
  /** Set true to render canvas with transparent background (for hover overlays
   * stacked over an existing image). Default: cream background. */
  transparent?: boolean
  style?: React.CSSProperties
}

export function BuildingPreview3D({
  opportunity,
  geographyTag,
  naicsCode,
  hovered = false,
  showGrid = true,
  size = 'card',
  transparent = false,
  style,
}: BuildingPreview3DProps) {
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
          background: transparent ? 'transparent' : '#FAF8F3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: size === 'hero' ? '64px' : '40px',
          color: '#D1D5DB',
          letterSpacing: '0.04em',
          ...style,
        }}
      >
        {SCENE_GLYPH[scene]}
      </div>
    )
  }

  // Hero: lower zoom (camera frames more of the model + surroundings).
  // Card: higher zoom so the silhouette reads at small size.
  const zoom = size === 'hero' ? 25 : 35
  // Slightly slower default rotation for hero (the model is more detailed); a
  // touch faster on hover regardless of size.
  const baseSpeed = size === 'hero' ? 0.0028 : 0.0035
  const hoverSpeed = size === 'hero' ? 0.006 : 0.0055

  return (
    <div style={{ width: '100%', height: '100%', ...style }}>
      <Canvas
        orthographic
        frameloop="demand"
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        camera={{
          position: [5, 3.5, 6],
          zoom,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: transparent ? 'transparent' : '#FAF8F3' }}
      >
        <CameraSetup />
        {/* Improved lighting for wireframe legibility against cream bg */}
        <hemisphereLight args={['#ffffff', '#FAF8F3', 0.3]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[8, 10, 5]} intensity={1.0} />
        <directionalLight position={[-6, 4, -4]} intensity={0.3} />
        <SpinningBuilding
          scene={scene}
          speed={hovered ? hoverSpeed : baseSpeed}
          scale={size === 'hero' ? 1.0 : 0.85}
          position={[0, 0, 0]}
        />
        {showGrid && (
          <gridHelper
            args={[14, 14, '#E5E7EB', '#F3F4F6']}
            position={[0, -1.05, 0]}
          />
        )}
      </Canvas>
    </div>
  )
}
