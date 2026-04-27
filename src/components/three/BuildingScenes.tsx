import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Group } from 'three'
import type { Opportunity } from '@/types/opportunity'

export type BuildingScene = 'mia' | 'lga' | 'dfw' | 'mco' | 'federal' | 'generic'

export const STD_COLOR = '#2C3E50'

export function resolveScene(
  opportunity?: Opportunity,
  geographyTag?: string,
  naicsCode?: string | null,
): BuildingScene {
  const tag = (geographyTag ?? '').toLowerCase().trim()
  if (tag) {
    if (tag.includes('mia') || tag.includes('miami')) return 'mia'
    if (tag.includes('lga') || tag.includes('laguardia') || tag.includes('new york') || tag.includes('nyc')) return 'lga'
    if (tag.includes('dfw') || tag.includes('dallas') || tag.includes('fort worth')) return 'dfw'
    if (tag.includes('mco') || tag.includes('orlando')) return 'mco'
    if (tag.includes('federal') || tag.includes('sam') || tag.includes('usace') || tag.includes('court')) return 'federal'
  }

  if (opportunity) {
    const text = `${opportunity.title} ${opportunity.agency} ${(opportunity.tags ?? []).join(' ')}`.toLowerCase()
    if (text.match(/\bmia\b|miami/)) return 'mia'
    if (text.match(/\blga\b|laguardia/)) return 'lga'
    if (text.match(/\bdfw\b|dallas|fort worth/)) return 'dfw'
    if (text.match(/\bmco\b|orlando/)) return 'mco'
    if (text.match(/federal|courthouse|navfac|navy|army|usace|u\.s\. marshals/)) return 'federal'
    if (text.match(/airport|terminal|runway|aviation|jet|apron/)) return 'mia'
    if (text.match(/port|maritime|cargo|dock|dredg|aqueduct/)) return 'lga'
    if (text.match(/highway|bridge|road|pavement|structural/)) return 'dfw'
    if (text.match(/water|pipeline|utility|tower/)) return 'mco'
    if (text.match(/security|courthouse|federal|congress|capitol/)) return 'federal'
  }

  if (naicsCode) {
    const code = naicsCode.slice(0, 4)
    if (code === '2373' || code === '2379') return 'dfw'
    if (code === '2371') return 'mco'
    if (code === '5616') return 'federal'
    if (code === '2362') return 'mia'
    if (code === '2382') return 'lga'
  }

  return 'generic'
}

export function MIABuilding() {
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
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[7, 0.4, 2.6]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <tubeGeometry args={[curve, 30, 0.16, 8, false]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      <mesh position={[0, -0.3, -1]}>
        <tubeGeometry args={[curve, 30, 0.12, 8, false]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      {[-2, 0, 2].map((x) => (
        <mesh key={x} position={[x, -0.7, 1.8]}>
          <boxGeometry args={[0.3, 0.15, 1.4]} />
          <meshStandardMaterial color={STD_COLOR} wireframe />
        </mesh>
      ))}
    </group>
  )
}

export function LGABuilding() {
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

export function DFWBuilding() {
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
      {[-2.5, 0, 2.5].map((x) => (
        <mesh key={x} position={[x, -0.5, 1.4]}>
          <boxGeometry args={[1, 1, 1.4]} />
          <meshStandardMaterial color={STD_COLOR} wireframe />
        </mesh>
      ))}
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

export function MCOBuilding() {
  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1.4, 1.4, 3.5, 24]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[1.5, 1.4, 0.25, 24]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[2.4, 0.08, 8, 32]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      <mesh position={[-2.8, -0.3, 0]}>
        <boxGeometry args={[1.6, 1.4, 1.2]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      <mesh position={[2.8, -0.3, 0]}>
        <boxGeometry args={[1.6, 1.4, 1.2]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
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

export function FederalBuilding() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[5, 2.5, 2.8]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      <mesh position={[0, 1.85, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[3.0, 1.2, 4]} />
        <meshStandardMaterial color={STD_COLOR} wireframe />
      </mesh>
      {[-1.8, -0.9, 0, 0.9, 1.8].map((x) => (
        <mesh key={x} position={[x, -0.3, 1.55]}>
          <cylinderGeometry args={[0.16, 0.16, 2.2, 12]} />
          <meshStandardMaterial color={STD_COLOR} wireframe />
        </mesh>
      ))}
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

export function GenericBuilding() {
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

export function BuildingByScene({ scene }: { scene: BuildingScene }) {
  switch (scene) {
    case 'mia':     return <MIABuilding />
    case 'lga':     return <LGABuilding />
    case 'dfw':     return <DFWBuilding />
    case 'mco':     return <MCOBuilding />
    case 'federal': return <FederalBuilding />
    default:        return <GenericBuilding />
  }
}

interface SpinningBuildingProps {
  scene: BuildingScene
  /** rad/frame; defaults to 0.0035 (~12s/turn at 60fps) */
  speed?: number
  scale?: number
  position?: [number, number, number]
}

/**
 * BuildingByScene wrapped in a self-rotating <group>. Drives invalidate() each
 * frame so it ticks under frameloop="demand".
 */
export function SpinningBuilding({
  scene,
  speed = 0.0035,
  scale = 1,
  position = [0, 0, 0],
}: SpinningBuildingProps) {
  const groupRef = useRef<Group>(null)
  const { invalidate } = useThree()
  const speedRef = useRef(speed)
  speedRef.current = speed

  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += speedRef.current
    invalidate()
  })

  return (
    <group ref={groupRef} scale={scale} position={position}>
      <BuildingByScene scene={scene} />
    </group>
  )
}
