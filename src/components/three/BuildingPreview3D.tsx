import { useEffect, useMemo } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import type { Opportunity } from '@/types/opportunity'
import { useIsMobile } from '@/hooks/useIsMobile'
import { resolveScene, SpinningBuilding, type BuildingScene } from './BuildingScenes'

function CameraSetup() {
  const { camera } = useThree()
  useEffect(() => {
    camera.lookAt(0, 0.3, 0)
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

interface BuildingPreview3DProps {
  opportunity?: Opportunity
  geographyTag?: string
  naicsCode?: string | null
  hovered?: boolean
  showGrid?: boolean
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
          fontSize: '40px',
          color: '#D1D5DB',
          letterSpacing: '0.04em',
          ...style,
        }}
      >
        {SCENE_GLYPH[scene]}
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', ...style }}>
      <Canvas
        orthographic
        frameloop="demand"
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        camera={{
          position: [8.66, 5, 8.66],
          zoom: 22,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: transparent ? 'transparent' : '#FAF8F3' }}
      >
        <CameraSetup />
        <ambientLight intensity={0.5} />
        <directionalLight position={[8, 10, 5]} intensity={0.7} />
        <SpinningBuilding
          scene={scene}
          speed={hovered ? 0.0055 : 0.0035}
          scale={0.8}
          position={[0, -0.3, 0]}
        />
        {showGrid && (
          <gridHelper
            args={[14, 14, '#E5E7EB', '#F3F4F6']}
            position={[0, -1.7, 0]}
          />
        )}
      </Canvas>
    </div>
  )
}
