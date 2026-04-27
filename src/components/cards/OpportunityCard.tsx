import { useEffect, useState } from 'react'
import type { Opportunity, OpportunityStatus } from '@/types/opportunity'
import type { StatusType } from '@/components/ui/StatusBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { TierBadge } from '@/components/ui/TierBadge'
import { Tag } from '@/components/ui/Tag'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { DeadlineCountdown } from '@/components/ui/DeadlineCountdown'
import { IllustrationViewer } from '@/components/three/IllustrationViewer'
import { BuildingPreview3D } from '@/components/three/BuildingPreview3D'
import { useInView } from '@/hooks/useInView'
import { formatCurrency } from '@/utils/format'

function toStatusType(status: OpportunityStatus): StatusType {
  if (status === 'won') return 'won'
  if (status === 'lost' || status === 'dismissed') return 'lost'
  if (status === 'submitted') return 'submitted'
  if (status === 'contact' || status === 'proposal') return 'pursuing'
  return 'tracking'
}

interface OpportunityCardProps {
  opportunity: Opportunity
  onClick?: (opportunity: Opportunity) => void
}

export function OpportunityCard({ opportunity, onClick }: OpportunityCardProps) {
  const [hovered, setHovered] = useState(false)
  const [previewRef, inView] = useInView<HTMLDivElement>({ rootMargin: '100px 0px' })

  // Photo-card overlay: mount the 3D Canvas while hovered AND keep it mounted
  // for ~400ms after mouseleave so the cross-fade can complete before unmount.
  const hasPhoto = Boolean(opportunity.illustration_url)
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

  return (
    <div
      onClick={() => onClick?.(opportunity)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minWidth: '380px',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: '3px',
        boxShadow: hovered
          ? '0 4px 16px rgba(0,0,0,0.10)'
          : 'var(--card-shadow)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: hovered ? 'scale(1.01)' : 'scale(1)',
        overflow: 'hidden',
      }}
    >
      {/* Illustration — visibility-gated; cards with a photo show ink-sketch
          parallax by default and cross-fade in a 3D model on hover. Cards
          without a photo show the rotating 3D model directly. */}
      <div
        ref={previewRef}
        style={{
          height: '200px',
          overflow: 'hidden',
          position: 'relative',
          background: '#FAF8F3',
        }}
      >
        {hasPhoto ? (
          <>
            <IllustrationViewer
              data={{
                id: opportunity.id,
                illustration_url: opportunity.illustration_url,
                geography_tag: opportunity.naics_code ?? undefined,
              }}
              intensity={hovered ? 0.02 : 0}
              style={{ position: 'absolute', inset: 0 }}
            />
            {inView && mountOverlay && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: hovered ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none',
                }}
              >
                <BuildingPreview3D
                  opportunity={opportunity}
                  hovered={hovered}
                  showGrid={false}
                  transparent
                />
              </div>
            )}
          </>
        ) : inView ? (
          <BuildingPreview3D
            opportunity={opportunity}
            hovered={hovered}
            showGrid
          />
        ) : (
          // Off-screen placeholder — reserves height without spawning a Canvas
          <div style={{ width: '100%', height: '100%' }} />
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <SectionLabel>{opportunity.agency}</SectionLabel>

        <h3
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '24px',
            fontWeight: 900,
            color: 'var(--ink-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            marginTop: '8px',
            marginBottom: '16px',
          }}
        >
          {opportunity.title}
        </h3>

        <div style={{ display: 'flex', gap: '24px', marginBottom: '14px' }}>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--ink-primary)',
                letterSpacing: '-0.01em',
              }}
            >
              {formatCurrency(opportunity.value)}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--ink-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase' as const,
                marginTop: '2px',
              }}
            >
              Est. Value
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--ink-primary)',
                textTransform: 'uppercase' as const,
              }}
            >
              {opportunity.score}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                color: 'var(--ink-muted)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase' as const,
                marginTop: '2px',
              }}
            >
              Score
            </div>
          </div>
          {opportunity.deadline && (
            <div>
              <DeadlineCountdown deadline={opportunity.deadline} />
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <StatusBadge status={toStatusType(opportunity.status)} />
          <TierBadge tier={`T${opportunity.tier}` as 'T1' | 'T2' | 'T3'} />
        </div>

        {opportunity.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {opportunity.tags.slice(0, 3).map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
