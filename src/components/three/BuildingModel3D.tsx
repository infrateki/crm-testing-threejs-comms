import { useMemo, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Group } from 'three'
import type { Opportunity } from '@/types/opportunity'
import { useIsMobile } from '@/hooks/useIsMobile'

export type BuildingScene = 'mia' | 'lga' | 'dfw' | 'mco' | 'federal' | 'generic'

const STD_COLOR = '#2C3E50'

function resolveScene(opportunity?: Opportunity, geographyTag?: string): BuildingScene {
  const tag = (geographyTag ?? '').toLowerCase().trim()
  if (tag) {
    if (tag.includes('mia') || tag.includes('miami')) return 'mia'
    if (tag.includes('lga') || tag.includes('laguardia') || tag.includes('new york') || tag.includes('nyc')) return 'lga'
    if (tag.includes('dfw') || tag.includes('dallas') || tag.includes('fort worth')) return 'dfw'
    if (tag.includes('mco') || tag.includes('orlando')) return 'mco'
    if (tag.includes('federal') || tag.includes('sam') || tag.includes('usace') || tag.includes('court')) return 'federal'
  }

  if (!opportunity) return 'generic'

  const text = `${opportunity.title} ${opportunity.agency} ${(opportunity.tags ?? []).join(' ')}`.toLowerCase()
  if (text.match(/\bmia\b|miami/)) return 'mia'
  if (text.match(/\blga\b|laguardia/)) return 'lga'
  if (text.match(/\bdfw\b|dallas|fort worth/)) return 'dfw'
  if (text.match(/\bmco\b|orlando/)) return 'mco'
  if (text.match(/federal|courthouse|navfac|navy|army|usace|u\.s\. marshals/)) return 'federal'
  if (text.match(/airport|terminal|runway|aviation|jet/)) return 'mia'        // default airport → curved roof
  if (text.match(/port|maritime|cargo|dock|dredg/)) return 'lga'              // default port → angular
  if (text.match(/highway|bridge|road|pavement/)) return 'dfw'                // infrastructure → flat
  if (text.match(/water|aqueduct|pipeline|utility/)) return 'mco'             // utility → tower
  return 'generic'
}

function MIABuilding() {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3, 0, 0),
        new THREE.Vector3(-2, 1.4, 0),
        new THREE.Vector3(0, 1.9, 0),
        new THREE.Vector3(2, 1.4, 0),
        new THREE.Vector3(3, 0, 0),
      ]),
    [],
  )

  return (
    <group>
      {/* Base concourse */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[7, 0.4, 2.6]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      {/* Curved TubeGeometry roof */}
      <mesh position={[0, -0.3, 0]}>
        <tubeGeometry args={[curve, 30, 0.16, 8, false]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      {/* Mirror curved tube on opposite Z for depth */}
      <mesh position={[0, -0.3, -1]}>
        <tubeGeometry args={[curve, 30, 0.12, 8, false]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      {/* Jet bridges */}
      {[-2, 0, 2].map((x) => (
        <mesh key={x} position={[x, -0.7, 1.8]}>
          <boxGeometry args={[0.3, 0.15, 1.4]} />
          <meshStandardMaterial color={STD_COLOR} wireframe />
        </mesh>
      ))}
    </group>
  )
}

function LGABuilding() {
  // Angular faceted boxes
  return (
    <group>
      <mesh position={[-2, 0, 0]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[2, 2.2, 1.8]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      <mesh position={[0, 0.3, 0.5]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[2.4, 2.6, 2]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      <mesh position={[2, -0.1, -0.3]} rotation={[0, 0.6, 0]}>
        <boxGeometry args={[2, 1.8, 1.6]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      <mesh position={[0, -1.05, 0]}>
        <boxGeometry args={[6.5, 0.2, 3.2]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
    </group>
  )
}

function DFWBuilding() {
  // Wide elongated flat terminal with control tower
  return (
    <group>
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[8, 1, 1.6]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[8, 0.2, 1.6]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      {/* Gate piers */}
      {[-2.5, 0, 2.5].map((x) => (
        <mesh key={x} position={[x, -0.5, 1.4]}>
          <boxGeometry args={[1, 1, 1.4]} />
          <meshStandardMaterial color={STD_COLOR} wireframe />
        </mesh>
      ))}
      {/* Control tower */}
      <mesh position={[3.5, 1.4, 0]}>
        <boxGeometry args={[0.4, 3, 0.4]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      <mesh position={[3.5, 3.2, 0]}>
        <boxGeometry args={[0.9, 0.4, 0.9]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
    </group>
  )
}

function MCOBuilding() {
  // Cylinder atrium tower with satellite wings
  return (
    <group>
      {/* Central cylinder tower */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 3.5, 24]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      {/* Cylinder cap */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[1.5, 1.4, 0.25, 24]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      {/* Curved atrium ring */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[2.4, 0.08, 8, 32]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      {/* Satellite wings */}
      <mesh position={[-2.8, -0.3, 0]}>
        <boxGeometry args={[1.6, 1.4, 1.2]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      <mesh position={[2.8, -0.3, 0]}>
        <boxGeometry args={[1.6, 1.4, 1.2]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      {/* Connecting tram tracks */}
      <mesh position={[-1.7, -0.6, 0]}>
        <boxGeometry args={[1.3, 0.08, 0.4]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      <mesh position={[1.7, -0.6, 0]}>
        <boxGeometry args={[1.3, 0.08, 0.4]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
    </group>
  )
}

function FederalBuilding() {
  // Box body + cylinder columns + prism (4-sided pyramid) pediment
  return (
    <group>
      {/* Main building box */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[5, 2.5, 2.8]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      {/* Pediment / triangular pyramid roof */}
      <mesh position={[0, 1.85, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[3.0, 1.2, 4]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      {/* Cylinder columns across the front */}
      {[-1.8, -0.9, 0, 0.9, 1.8].map((x) => (
        <mesh key={x} position={[x, -0.3, 1.55]}>
          <cylinderGeometry args={[0.16, 0.16, 2.2, 12]} />
          <meshStandardMaterial color={STD_COLOR} wireframe />
        </mesh>
      ))}
      {/* Steps */}
      <mesh position={[0, -1.4, 1.6]}>
        <boxGeometry args={[5.6, 0.18, 0.8]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      <mesh position={[0, -1.6, 2.0]}>
        <boxGeometry args={[6.2, 0.18, 0.8]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
    </group>
  )
}

function GenericBuilding() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 2.5, 2]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[1.4, 1.2, 1.4]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      <mesh position={[0, 2.65, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.0, 0.9, 4]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
    </group>
  )
}

function BuildingByScene({ scene }: { scene: BuildingScene }) {
  const groupRef = useRef<Group>(null)
  let body: React.ReactNode
  switch (scene) {
    case 'mia':     body = <MIABuilding />; break
    case 'lga':     body = <LGABuilding />; break
    case 'dfw':     body = <DFWBuilding />; break
    case 'mco':     body = <MCOBuilding />; break
    case 'federal': body = <FederalBuilding />; break
    default:        body = <GenericBuilding />
  }
  return <group ref={groupRef}>{body}</group>
}

interface BuildingModel3DProps {
  opportunity?: Opportunity
  geographyTag?: string
  /** Legacy / convenience — derives from NAICS if no opportunity provided */
  naicsCode?: string | null
  style?: React.CSSProperties
}

export function BuildingModel3D({ opportunity, geographyTag, naicsCode, style }: BuildingModel3DProps) {
  const isMobile = useIsMobile()
  const scene = useMemo(() => {
    const explicit = resolveScene(opportunity, geographyTag)
    if (explicit !== 'generic') return explicit
    // Legacy NAICS fallback
    if (naicsCode) {
      const code = naicsCode.slice(0, 4)
      if (code === '2373') return 'dfw'
      if (code === '2379') return 'lga'
      if (code === '2371') return 'mco'
      if (code === '5616') return 'federal'
    }
    return 'generic'
  }, [opportunity, geographyTag, naicsCode])

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
          <BuildingByScene scene={scene} />
          <gridHelper args={[14, 14, '#E5E7EB', '#F3F4F6']} position={[0, -1.7, 0]} />
          <OrbitControls
            enablePan={false}
            minDistance={4}
            maxDistance={14}
            autoRotate
            autoRotateSpeed={0.6}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
