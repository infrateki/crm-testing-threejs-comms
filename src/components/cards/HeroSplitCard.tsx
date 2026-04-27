import { useEffect, useState } from 'react'
import type { Opportunity, OpportunityStatus } from '@/types/opportunity'
import type { CardConfig } from '@/types/card-config'
import type { StatusType } from '@/components/ui/StatusBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Tag } from '@/components/ui/Tag'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { IllustrationViewer } from '@/components/three/IllustrationViewer'
import { BuildingPreview3D } from '@/components/three/BuildingPreview3D'
import { StatsBar } from '@/components/stats/StatsBar'
import { formatCurrency } from '@/utils/format'
import type { StatItem } from '@/types/opportunity'

function toStatusType(status: OpportunityStatus): StatusType {
  if (status === 'won') return 'won'
  if (status === 'lost' || status === 'dismissed') return 'lost'
  if (status === 'submitted') return 'submitted'
  if (status === 'contact' || status === 'proposal') return 'pursuing'
  return 'tracking'
}

interface HeroSplitCardProps {
  opportunity: Opportunity
  config?: CardConfig
  onUploadPhoto?: () => void
}

export function HeroSplitCard({ opportunity, onUploadPhoto }: HeroSplitCardProps) {
  const [hovered, setHovered] = useState(false)
  const hasPhoto = Boolean(opportunity.illustration_url)

  // Mount the overlay 3D Canvas during hover and keep it mounted briefly after
  // mouseleave so the cross-fade can complete before unmount.
  const [mountOverlay, setMountOverlay] = useState(false)
  useEffect(() => {
    if (!hasPhoto) return
    if (hovered) {
      setMountOverlay(true)
      return
    }
    const t = window.setTimeout(() => setMountOverlay(false), 400)
    return () => window.clearTimeout(t)
  }, [hovered, hasPhoto])

  const stats: StatItem[] = [
    { label: 'Est. Value', value: formatCurrency(opportunity.value) },
    { label: 'Score', value: opportunity.score.toUpperCase() },
    { label: 'NAICS', value: opportunity.naics_code ?? '—' },
    {
      label: 'Stage',
      value: opportunity.status.replace(/_/g, ' ').toUpperCase(),
    },
    { label: 'Owner', value: opportunity.owner.toUpperCase() },
  ]

  return (
    <div
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: '3px',
        boxShadow: 'var(--card-shadow)',
        overflow: 'hidden',
      }}
    >
      {/* 50/50 split */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: '480px',
        }}
      >
        {/* Left: Illustration — 3D building always on; ink-sketch overlays
            on top when a processed photo exists, fading away on hover so the
            user can preview the underlying procedural model. */}
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: '400px',
            background: '#FAF8F3',
          }}
        >
          {/* Always-rendered 3D building — fills the panel */}
          <BuildingPreview3D
            opportunity={opportunity}
            hovered={hovered}
            size="hero"
            showGrid
            style={{ position: 'absolute', inset: 0 }}
          />

          {/* Ink-sketch parallax overlay (when photo uploaded). Cross-fades
              away on hover to reveal the 3D model underneath. */}
          {hasPhoto && (mountOverlay || !hovered) && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: hovered ? 0 : 1,
                transition: 'opacity 0.35s ease',
                pointerEvents: hovered ? 'none' : 'auto',
              }}
            >
              <IllustrationViewer
                data={{
                  id: opportunity.id,
                  illustration_url: opportunity.illustration_url,
                  geography_tag: opportunity.naics_code ?? undefined,
                }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                }}
              />
            </div>
          )}

          {/* Hint label when a photo is available */}
          {hasPhoto && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(255,255,255,0.88)',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                padding: '4px 8px',
                fontFamily: 'var(--font-body)',
                fontSize: '10px',
                fontWeight: 500,
                color: 'var(--ink-tertiary)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
                pointerEvents: 'none',
                opacity: hovered ? 0 : 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              Hover for 3D
            </div>
          )}

          {/* Upload Photo button */}
          {onUploadPhoto && (
            <button
              onClick={onUploadPhoto}
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                background: 'rgba(255,255,255,0.92)',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                padding: '8px 14px',
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--ink-secondary)',
                cursor: 'pointer',
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
              }}
            >
              Upload Photo
            </button>
          )}
        </div>

        {/* Right: Content */}
        <div
          style={{
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            overflow: 'auto',
          }}
        >
          <SectionLabel>{opportunity.agency}</SectionLabel>

          <h2
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '36px',
              fontWeight: 900,
              color: 'var(--ink-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {opportunity.title}
          </h2>

          {/* Status + set-aside */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <StatusBadge status={toStatusType(opportunity.status)} />
            {opportunity.set_aside && (
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  color: 'var(--ink-tertiary)',
                  border: '1px solid var(--border)',
                  borderRadius: '3px',
                  padding: '2px 8px',
                }}
              >
                {opportunity.set_aside}
              </span>
            )}
          </div>

          {/* Description */}
          {opportunity.description && (
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                color: 'var(--ink-secondary)',
                lineHeight: 1.6,
              }}
            >
              {opportunity.description}
            </p>
          )}

          {/* PDBM Advantage callout */}
          <div
            style={{
              borderLeft: '3px solid var(--accent-sage)',
              paddingLeft: '16px',
              paddingTop: '8px',
              paddingBottom: '8px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--accent-sage)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                marginBottom: '6px',
              }}
            >
              PDBM Advantage
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--ink-secondary)',
                lineHeight: 1.5,
              }}
            >
              Score: {opportunity.score} · Stage:{' '}
              {opportunity.status.replace(/_/g, ' ')} · Owner: {opportunity.owner}
            </p>
          </div>

          {/* Tags + NAICS */}
          <div style={{ marginTop: 'auto' }}>
            {opportunity.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                {opportunity.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            )}
            {opportunity.naics_code && (
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--ink-muted)',
                  letterSpacing: '0.02em',
                }}
              >
                NAICS {opportunity.naics_code}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar below */}
      <StatsBar stats={stats} theme="cream" />
    </div>
  )
}
