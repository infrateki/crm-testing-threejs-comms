import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { Group } from 'three'
import type { Opportunity } from '@/types/opportunity'

export type BuildingScene = 'mia' | 'lga' | 'dfw' | 'mco' | 'federal' | 'generic'

export const STD_COLOR = '#2C3E50'
const ACCENT_COLOR = '#5C7C6B'
const GLASS_COLOR = '#94A3B8'

// eslint-disable-next-line react-refresh/only-export-components
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

// ── Shared materials / primitives ───────────────────────────────────────
function Wire({ opacity }: { opacity?: number }) {
  return (
    <meshStandardMaterial
      color={STD_COLOR}
      wireframe
      transparent={opacity != null && opacity < 1}
      opacity={opacity ?? 1}
    />
  )
}

function GlassWire() {
  return (
    <meshStandardMaterial
      color={GLASS_COLOR}
      wireframe
      transparent
      opacity={0.55}
    />
  )
}

function AccentWire() {
  return <meshStandardMaterial color={ACCENT_COLOR} wireframe />
}

/** Aircraft: fuselage cylinder + wing box + tail box. ~3 meshes. */
function Aircraft({
  position,
  rotation = [0, 0, 0],
  scale = 1,
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: number
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Fuselage */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 1.2, 10]} />
        <Wire />
      </mesh>
      {/* Wings */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[0.32, 0.04, 1.1]} />
        <Wire />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.5, 0.12, 0]}>
        <boxGeometry args={[0.18, 0.22, 0.04]} />
        <Wire />
      </mesh>
    </group>
  )
}

/** Palm tree: 1 trunk cylinder + 1 cone for fronds. 2 meshes. */
function PalmTree({
  position,
  scale = 1,
}: {
  position: [number, number, number]
  scale?: number
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.9, 6]} />
        <Wire />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <coneGeometry args={[0.42, 0.45, 8]} />
        <AccentWire />
      </mesh>
    </group>
  )
}

/** Tree: spherical canopy + trunk. 2 meshes. */
function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.5, 6]} />
        <Wire />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.28, 10, 8]} />
        <AccentWire />
      </mesh>
    </group>
  )
}

// ── MIA: Curved Terminal (Miami) ───────────────────────────────────────
export function MIABuilding() {
  const roofCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3, 0, 0),
        new THREE.Vector3(-2, 1.2, 0),
        new THREE.Vector3(0, 1.7, 0),
        new THREE.Vector3(2, 1.2, 0),
        new THREE.Vector3(3, 0, 0),
      ]),
    [],
  )
  const roofCurveBack = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3, 0, -1.4),
        new THREE.Vector3(-2, 1.0, -1.4),
        new THREE.Vector3(0, 1.4, -1.4),
        new THREE.Vector3(2, 1.0, -1.4),
        new THREE.Vector3(3, 0, -1.4),
      ]),
    [],
  )

  const ribXs = useMemo(() => {
    const out: number[] = []
    for (let i = 0; i < 11; i++) out.push(-2.7 + i * 0.54)
    return out
  }, [])

  const heightAt = (x: number) => {
    const t = (x + 3) / 6
    return Math.sin(t * Math.PI) * 1.65
  }

  return (
    <group position={[0, -1, 0]}>
      {/* Ground / tarmac */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[7.5, 0.04, 5]} />
        <Wire opacity={0.6} />
      </mesh>

      {/* Taxiway markings (3 thin strips) */}
      {[1.6, 1.9, 2.2].map((z, i) => (
        <mesh key={`tx-${i}`} position={[0, -0.025, z]}>
          <boxGeometry args={[6.5, 0.012, 0.04]} />
          <AccentWire />
        </mesh>
      ))}

      {/* Main concourse base */}
      <mesh position={[0, 0.15, -0.7]}>
        <boxGeometry args={[6.5, 0.4, 1.4]} />
        <Wire />
      </mesh>

      {/* Curved swooping roof — front and back rails */}
      <mesh position={[0, 0.4, 0]}>
        <tubeGeometry args={[roofCurve, 40, 0.07, 8, false]} />
        <Wire />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <tubeGeometry args={[roofCurveBack, 40, 0.07, 8, false]} />
        <Wire />
      </mesh>

      {/* 11 structural ribs along the curve */}
      {ribXs.map((x, i) => (
        <mesh key={`rib-${i}`} position={[x, 0.4 + heightAt(x) / 2, -0.7]}>
          <boxGeometry args={[0.05, heightAt(x), 0.05]} />
          <Wire />
        </mesh>
      ))}

      {/* Glass curtain wall — 2 rows × 6 cols of tinted panels */}
      {[0, 1].map((row) =>
        [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((x, c) => (
          <mesh key={`gw-${row}-${c}`} position={[x, 0.4 + 0.45 * row, 0.0]}>
            <boxGeometry args={[0.85, 0.4, 0.05]} />
            <GlassWire />
          </mesh>
        )),
      )}

      {/* Curtain wall horizontal mullions */}
      {[0.18, 0.65, 1.1].map((y, i) => (
        <mesh key={`mull-${i}`} position={[0, y, 0.03]}>
          <boxGeometry args={[6.4, 0.04, 0.02]} />
          <Wire />
        </mesh>
      ))}

      {/* 4 jet bridges extending from the terminal toward camera (north) */}
      {[-2.2, -0.8, 0.6, 2.0].map((x, i) => (
        <group key={`jb-${i}`} position={[x, 0.0, 0.9]}>
          <mesh>
            <boxGeometry args={[0.3, 0.18, 0.7]} />
            <Wire />
          </mesh>
          <mesh position={[0.18, 0, 0.45]} rotation={[0, 0.4, 0]}>
            <boxGeometry args={[0.18, 0.18, 0.4]} />
            <Wire />
          </mesh>
        </group>
      ))}

      {/* Control tower */}
      <mesh position={[3.6, 0.6, -0.5]}>
        <cylinderGeometry args={[0.12, 0.14, 1.6, 12]} />
        <Wire />
      </mesh>
      <mesh position={[3.6, 1.55, -0.5]}>
        <boxGeometry args={[0.5, 0.32, 0.5]} />
        <Wire />
      </mesh>
      <mesh position={[3.6, 1.78, -0.5]}>
        <coneGeometry args={[0.05, 0.3, 8]} />
        <Wire />
      </mesh>

      {/* 2 aircraft on tarmac */}
      <Aircraft position={[-1.8, 0.05, 1.7]} rotation={[0, 0.3, 0]} scale={0.9} />
      <Aircraft position={[1.6, 0.05, 1.7]} rotation={[0, -0.4, 0]} scale={0.9} />

      {/* 3 palm trees by the entrance */}
      <PalmTree position={[-3.5, 0, 1.4]} />
      <PalmTree position={[-3.7, 0, 0.4]} scale={0.85} />
      <PalmTree position={[3.4, 0, 1.5]} scale={0.95} />
    </group>
  )
}

// ── LGA: Modern Angular Composition (NYC) ──────────────────────────────
export function LGABuilding() {
  const roadCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3.5, -0.95, 2.2),
        new THREE.Vector3(-1, -0.95, 1.5),
        new THREE.Vector3(1.5, -0.95, 1.0),
        new THREE.Vector3(3.5, -0.95, 1.8),
      ]),
    [],
  )

  return (
    <group position={[0, -1, 0]}>
      {/* Ground plane */}
      <mesh position={[0, -1.0 + 0.02, 0]}>
        <boxGeometry args={[8, 0.04, 4]} />
        <Wire opacity={0.55} />
      </mesh>

      {/* 3 angular volumes at different rotations */}
      <mesh position={[-2.1, 0.3, 0.1]} rotation={[0, 0.45, 0]}>
        <boxGeometry args={[1.9, 2.4, 1.7]} />
        <Wire />
      </mesh>
      <mesh position={[0.1, 0.5, -0.3]} rotation={[0, -0.18, 0]}>
        <boxGeometry args={[2.4, 2.8, 2.0]} />
        <Wire />
      </mesh>
      <mesh position={[2.2, 0.15, 0.3]} rotation={[0, 0.55, 0]}>
        <boxGeometry args={[2.0, 2.0, 1.6]} />
        <Wire />
      </mesh>

      {/* Cantilevered canopy on the central volume */}
      <mesh position={[0.1, 1.92, 0.95]} rotation={[0, -0.18, 0]}>
        <boxGeometry args={[3.0, 0.08, 1.4]} />
        <Wire />
      </mesh>

      {/* Pedestrian sky bridge between volumes 1 and 2 */}
      <mesh position={[-1.0, 0.95, 0.3]} rotation={[0, 0.13, 0]}>
        <boxGeometry args={[1.4, 0.18, 0.45]} />
        <Wire />
      </mesh>

      {/* Steel cross-bracing — X bracing on the central facade */}
      {[
        { p: [0.9, 0.9, 0.7] as [number, number, number], r: [0, -0.18, 0.6] as [number, number, number] },
        { p: [0.9, 0.9, 0.7] as [number, number, number], r: [0, -0.18, -0.6] as [number, number, number] },
        { p: [-0.7, 0.9, 0.7] as [number, number, number], r: [0, -0.18, 0.6] as [number, number, number] },
        { p: [-0.7, 0.9, 0.7] as [number, number, number], r: [0, -0.18, -0.6] as [number, number, number] },
      ].map((b, i) => (
        <mesh key={`brc-${i}`} position={b.p} rotation={b.r}>
          <boxGeometry args={[0.06, 2.1, 0.06]} />
          <Wire />
        </mesh>
      ))}

      {/* Window grid on central facade — 4 rows × 5 cols of tinted glass */}
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => (
          <mesh
            key={`w-${row}-${col}`}
            position={[
              -0.7 + col * 0.4 + 0.05,
              -0.4 + row * 0.55,
              0.92,
            ]}
            rotation={[0, -0.18, 0]}
          >
            <boxGeometry args={[0.28, 0.32, 0.04]} />
            <GlassWire />
          </mesh>
        )),
      )}

      {/* Curved approach road (Tube along curve) */}
      <mesh>
        <tubeGeometry args={[roadCurve, 30, 0.06, 6, false]} />
        <AccentWire />
      </mesh>

      {/* NYC skyline backdrop — 7 box towers at varying heights */}
      {[
        { x: -3.8, h: 1.4 },
        { x: -3.0, h: 2.0 },
        { x: -2.2, h: 1.6 },
        { x: -1.0, h: 2.6 },
        { x: 0.4, h: 1.8 },
        { x: 1.6, h: 2.2 },
        { x: 3.2, h: 1.5 },
      ].map((t, i) => (
        <mesh key={`sk-${i}`} position={[t.x, -1 + t.h / 2 + 0.05, -2.4]}>
          <boxGeometry args={[0.5, t.h, 0.4]} />
          <Wire opacity={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ── DFW: Wide Flat Terminal (Dallas) ──────────────────────────────────
export function DFWBuilding() {
  return (
    <group position={[0, -1, 0]}>
      {/* Ground / vehicle road */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[8.4, 0.04, 5]} />
        <Wire opacity={0.55} />
      </mesh>
      {/* Lane marking lines on road */}
      {[1.7, 2.0, 2.3].map((z, i) => (
        <mesh key={`lane-${i}`} position={[0, -0.025, z]}>
          <boxGeometry args={[7, 0.012, 0.04]} />
          <AccentWire />
        </mesh>
      ))}

      {/* Long horizontal base */}
      <mesh position={[0, 0.1, -0.4]}>
        <boxGeometry args={[8, 0.55, 1.4]} />
        <Wire />
      </mesh>

      {/* Upper level / glazing band */}
      <mesh position={[0, 0.55, -0.35]}>
        <boxGeometry args={[7.8, 0.3, 1.3]} />
        <GlassWire />
      </mesh>

      {/* Canopy overhang */}
      <mesh position={[0, 0.78, 0.2]}>
        <boxGeometry args={[8.4, 0.06, 0.9]} />
        <Wire />
      </mesh>

      {/* 8 gate pier boxes along the front */}
      {[-3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].map((x, i) => (
        <mesh key={`gp-${i}`} position={[x, 0.2, 0.45]}>
          <boxGeometry args={[0.6, 0.7, 0.25]} />
          <Wire />
        </mesh>
      ))}

      {/* Control tower */}
      <mesh position={[3.7, 0.85, -0.6]}>
        <boxGeometry args={[0.32, 1.6, 0.32]} />
        <Wire />
      </mesh>
      <mesh position={[3.7, 1.7, -0.6]}>
        <boxGeometry args={[0.7, 0.32, 0.7]} />
        <Wire />
      </mesh>
      <mesh position={[3.7, 1.92, -0.6]}>
        <coneGeometry args={[0.04, 0.2, 6]} />
        <Wire />
      </mesh>

      {/* People mover elevated track parallel to terminal */}
      <mesh position={[0, 0.25, 1.05]}>
        <boxGeometry args={[7.8, 0.06, 0.06]} />
        <AccentWire />
      </mesh>
      {[-3, -1.5, 0, 1.5, 3].map((x, i) => (
        <mesh key={`pm-${i}`} position={[x, 0.05, 1.05]}>
          <boxGeometry args={[0.06, 0.4, 0.06]} />
          <AccentWire />
        </mesh>
      ))}

      {/* 3 jet bridges at varying angles */}
      {[
        { x: -2.4, r: 0.2 },
        { x: 0.0, r: -0.1 },
        { x: 2.6, r: 0.3 },
      ].map((j, i) => (
        <mesh key={`jb-${i}`} position={[j.x, 0.15, 0.78]} rotation={[0, j.r, 0]}>
          <boxGeometry args={[0.22, 0.18, 0.5]} />
          <Wire />
        </mesh>
      ))}

      {/* Aircraft parked at gates */}
      <Aircraft position={[-2.4, 0.0, 1.4]} rotation={[0, Math.PI / 2 + 0.2, 0]} scale={0.85} />
      <Aircraft position={[0.0, 0.0, 1.4]} rotation={[0, Math.PI / 2 - 0.1, 0]} scale={0.85} />
      <Aircraft position={[2.6, 0.0, 1.4]} rotation={[0, Math.PI / 2 + 0.3, 0]} scale={0.85} />
    </group>
  )
}

// ── MCO: Cylindrical Tower (Orlando) ───────────────────────────────────
export function MCOBuilding() {
  return (
    <group position={[0, -1, 0]}>
      {/* Ground plane */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[8, 0.04, 5]} />
        <Wire opacity={0.55} />
      </mesh>

      {/* Approach road curving around */}
      <mesh position={[0, -0.025, 1.8]}>
        <torusGeometry args={[2.6, 0.04, 6, 24, Math.PI]} />
        <AccentWire />
      </mesh>

      {/* Central cylinder tower */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[1.2, 1.3, 3.3, 28]} />
        <Wire />
      </mesh>

      {/* 10 floor band rings (toruses) */}
      {Array.from({ length: 10 }).map((_, i) => {
        const y = 0.4 + i * 0.27
        const r = 1.21 + (i / 10) * 0.04
        return (
          <mesh key={`fb-${i}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, 0.02, 5, 24]} />
            <AccentWire />
          </mesh>
        )
      })}

      {/* Observation deck cap (wider cylinder) */}
      <mesh position={[0, 2.85, 0]}>
        <cylinderGeometry args={[1.45, 1.2, 0.3, 28]} />
        <Wire />
      </mesh>
      {/* Observation deck railing */}
      <mesh position={[0, 3.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.45, 0.025, 5, 32]} />
        <AccentWire />
      </mesh>
      {/* Spire on top */}
      <mesh position={[0, 3.35, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.4, 6]} />
        <Wire />
      </mesh>

      {/* 3 radiating concourse arms */}
      {[
        { angle: 0, len: 2.2 },
        { angle: (2 * Math.PI) / 3, len: 2.0 },
        { angle: (4 * Math.PI) / 3, len: 2.1 },
      ].map((arm, i) => {
        const x = Math.cos(arm.angle) * (1.2 + arm.len / 2)
        const z = Math.sin(arm.angle) * (1.2 + arm.len / 2)
        return (
          <mesh
            key={`arm-${i}`}
            position={[x, 0.05, z]}
            rotation={[0, -arm.angle, 0]}
          >
            <boxGeometry args={[arm.len, 0.5, 0.5]} />
            <Wire />
          </mesh>
        )
      })}

      {/* 3 satellite terminal pods at the ends of arms */}
      {[
        { angle: 0, dist: 3.4 },
        { angle: (2 * Math.PI) / 3, dist: 3.2 },
        { angle: (4 * Math.PI) / 3, dist: 3.3 },
      ].map((sat, i) => {
        const x = Math.cos(sat.angle) * sat.dist
        const z = Math.sin(sat.angle) * sat.dist
        return (
          <mesh key={`sat-${i}`} position={[x, 0.2, z]}>
            <cylinderGeometry args={[0.5, 0.55, 0.7, 12]} />
            <Wire />
          </mesh>
        )
      })}

      {/* People mover tracks (low rails along arms) */}
      {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, i) => {
        const x = Math.cos(angle) * 2.0
        const z = Math.sin(angle) * 2.0
        return (
          <mesh
            key={`pm-${i}`}
            position={[x, -0.1, z]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[2.0, 0.04, 0.06]} />
            <AccentWire />
          </mesh>
        )
      })}

      {/* Tropical landscaping — 5 palm trees */}
      <PalmTree position={[2.2, -1, 1.6]} scale={0.85} />
      <PalmTree position={[-2.2, -1, 1.6]} scale={0.9} />
      <PalmTree position={[2.6, -1, -1.6]} scale={0.8} />
      <PalmTree position={[-2.6, -1, -1.6]} scale={0.85} />
      <PalmTree position={[0, -1, 2.2]} scale={0.8} />
    </group>
  )
}

// ── Federal: Classical Government Building ────────────────────────────
export function FederalBuilding() {
  // Triangular pediment shape
  const pedimentShape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-2.6, 0)
    s.lineTo(2.6, 0)
    s.lineTo(0, 1.0)
    s.closePath()
    return s
  }, [])

  return (
    <group position={[0, -1, 0]}>
      {/* Ground */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[8.5, 0.04, 5]} />
        <Wire opacity={0.55} />
      </mesh>

      {/* Main building box */}
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[5, 2.4, 2.6]} />
        <Wire />
      </mesh>

      {/* Symmetrical wing buildings */}
      <mesh position={[-3.3, 0.6, 0]}>
        <boxGeometry args={[1.8, 1.7, 2.0]} />
        <Wire />
      </mesh>
      <mesh position={[3.3, 0.6, 0]}>
        <boxGeometry args={[1.8, 1.7, 2.0]} />
        <Wire />
      </mesh>

      {/* 8 Corinthian columns (cylinders + capitals) */}
      {[-2.2, -1.6, -1.0, -0.4, 0.4, 1.0, 1.6, 2.2].map((x, i) => (
        <group key={`col-${i}`} position={[x, 0.85, 1.45]}>
          {/* Column shaft */}
          <mesh>
            <cylinderGeometry args={[0.13, 0.14, 2.1, 12]} />
            <Wire />
          </mesh>
          {/* Capital */}
          <mesh position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.2, 0.13, 0.18, 12]} />
            <Wire />
          </mesh>
          {/* Base */}
          <mesh position={[0, -1.05, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.1, 12]} />
            <Wire />
          </mesh>
        </group>
      ))}

      {/* Triangular pediment (extruded triangle) above columns */}
      <mesh position={[0, 2.1, 1.45]} rotation={[0, 0, 0]}>
        <extrudeGeometry args={[pedimentShape, { depth: 0.25, bevelEnabled: false }]} />
        <Wire />
      </mesh>

      {/* Architrave / entablature beam below pediment */}
      <mesh position={[0, 2.0, 1.45]}>
        <boxGeometry args={[5.4, 0.18, 0.32]} />
        <Wire />
      </mesh>

      {/* Window grid on main facade — 3 rows × 6 cols */}
      {Array.from({ length: 3 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => (
          <mesh
            key={`fw-${row}-${col}`}
            position={[
              -1.4 + col * 0.56,
              0.4 + row * 0.55,
              1.31,
            ]}
          >
            <boxGeometry args={[0.32, 0.4, 0.04]} />
            <GlassWire />
          </mesh>
        )),
      )}

      {/* Grand entrance — recessed door */}
      <mesh position={[0, 0.18, 1.32]}>
        <boxGeometry args={[0.7, 1.2, 0.05]} />
        <Wire />
      </mesh>

      {/* 5 steps progressively wider */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={`st-${i}`} position={[0, -0.42 + i * 0.08, 1.7 + i * 0.12]}>
          <boxGeometry args={[2.4 + i * 0.4, 0.08, 0.16]} />
          <Wire />
        </mesh>
      ))}

      {/* 2 flag poles + flags */}
      <mesh position={[-2.0, 0.4, 2.0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 6]} />
        <Wire />
      </mesh>
      <mesh position={[-1.85, 0.95, 2.0]}>
        <boxGeometry args={[0.32, 0.2, 0.02]} />
        <AccentWire />
      </mesh>
      <mesh position={[2.0, 0.4, 2.0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.6, 6]} />
        <Wire />
      </mesh>
      <mesh position={[2.15, 0.95, 2.0]}>
        <boxGeometry args={[0.32, 0.2, 0.02]} />
        <AccentWire />
      </mesh>

      {/* Formal landscaping — 4 box hedges in a row in front */}
      {[-2.5, -1.5, 1.5, 2.5].map((x, i) => (
        <mesh key={`hd-${i}`} position={[x, -0.35, 2.4]}>
          <boxGeometry args={[0.7, 0.25, 0.3]} />
          <AccentWire />
        </mesh>
      ))}
    </group>
  )
}

// ── Generic: Modern Mixed-Use Building ─────────────────────────────────
export function GenericBuilding() {
  return (
    <group position={[0, -1, 0]}>
      {/* Ground */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[7, 0.04, 5]} />
        <Wire opacity={0.55} />
      </mesh>

      {/* L-shaped footprint — two intersecting boxes */}
      <mesh position={[-0.6, 1.0, 0]}>
        <boxGeometry args={[2.6, 2.4, 1.8]} />
        <Wire />
      </mesh>
      <mesh position={[1.0, 0.6, 0.6]}>
        <boxGeometry args={[1.6, 1.6, 1.6]} />
        <Wire />
      </mesh>

      {/* Window strips on main facade — 4 horizontal bands */}
      {[0.4, 1.0, 1.6, 2.0].map((y, i) => (
        <mesh key={`ws-${i}`} position={[-0.6, y, 0.92]}>
          <boxGeometry args={[2.4, 0.18, 0.04]} />
          <GlassWire />
        </mesh>
      ))}

      {/* Window strips on second volume — 3 bands */}
      {[0.3, 0.8, 1.2].map((y, i) => (
        <mesh key={`ws2-${i}`} position={[1.0, y, 1.42]}>
          <boxGeometry args={[1.4, 0.14, 0.04]} />
          <GlassWire />
        </mesh>
      ))}

      {/* Rooftop mechanical room */}
      <mesh position={[-1.1, 2.35, 0]}>
        <boxGeometry args={[0.9, 0.3, 0.9]} />
        <Wire />
      </mesh>

      {/* Solar panels on roof */}
      <mesh position={[0.1, 2.25, -0.3]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[1.0, 0.04, 0.5]} />
        <AccentWire />
      </mesh>
      <mesh position={[0.1, 2.25, 0.3]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[1.0, 0.04, 0.5]} />
        <AccentWire />
      </mesh>

      {/* HVAC unit */}
      <mesh position={[1.0, 1.5, 0.2]}>
        <boxGeometry args={[0.4, 0.2, 0.3]} />
        <Wire />
      </mesh>

      {/* Communication antenna with sphere ball */}
      <mesh position={[-1.2, 2.85, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.7, 6]} />
        <Wire />
      </mesh>
      <mesh position={[-1.2, 3.25, 0]}>
        <sphereGeometry args={[0.06, 8, 6]} />
        <AccentWire />
      </mesh>

      {/* Building entrance overhang */}
      <mesh position={[-0.6, 0.2, 0.95]}>
        <boxGeometry args={[1.0, 0.06, 0.4]} />
        <Wire />
      </mesh>

      {/* Loading dock — recessed at back */}
      <mesh position={[-0.6, -0.05, -0.95]}>
        <boxGeometry args={[0.9, 0.4, 0.18]} />
        <Wire />
      </mesh>

      {/* Parking structure adjacent */}
      <mesh position={[2.6, 0.4, -0.4]}>
        <boxGeometry args={[1.2, 1.4, 1.6]} />
        <Wire />
      </mesh>
      {/* Parking structure floor lines */}
      {[0.0, 0.5, 1.0].map((y, i) => (
        <mesh key={`pl-${i}`} position={[2.6, y - 0.2, 0.42]}>
          <boxGeometry args={[1.18, 0.04, 0.02]} />
          <AccentWire />
        </mesh>
      ))}
      {/* Parking structure side */}
      {[0.0, 0.5, 1.0].map((y, i) => (
        <mesh key={`pls-${i}`} position={[3.21, y - 0.2, -0.4]}>
          <boxGeometry args={[0.02, 0.04, 1.55]} />
          <AccentWire />
        </mesh>
      ))}

      {/* 3 deciduous trees */}
      <Tree position={[-2.8, -1, 1.5]} />
      <Tree position={[-2.8, -1, -0.4]} scale={0.85} />
      <Tree position={[2.6, -1, 1.6]} scale={0.9} />
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
