import { useState } from 'react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { usePortals } from '@/api/portals'
import type { Portal } from '@/types/portal'
import { DEMO_PORTALS } from './_fixtures'

function rowBg(portal: Portal) {
  if (!portal.active) return '#F9FAFB'
  if (portal.last_scan_status === 'success') return '#F0FDF4'
  if (portal.last_scan_status === 'error') return '#FEF2F2'
  return '#FFFBEB'
}

function statusDot(portal: Portal) {
  if (!portal.active) return { color: '#9CA3AF', label: 'Inactive' }
  if (portal.last_scan_status === 'success') return { color: '#059669', label: 'OK' }
  if (portal.last_scan_status === 'error') return { color: '#DC2626', label: 'Error' }
  if (portal.last_scan_status === 'running') return { color: '#2563EB', label: 'Running' }
  return { color: '#D97706', label: 'Pending' }
}

function formatScanDate(dateStr: string | null) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const COL_WIDTHS = ['200px', '80px', '80px', '70px', '180px', '90px', '80px']
const COL_LABELS = ['Name', 'Method', 'Frequency', 'Active', 'Last Scan', 'Status', 'Opps Found']

export function PortalHealth() {
  const { data: portalsData } = usePortals()
  const portals = portalsData ?? DEMO_PORTALS
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id))

  return (
    <div>
      <SectionLabel>Portals</SectionLabel>
      <h1
        style={{
          fontFamily: 'var(--font-headline)',
          fontSize: '36px',
          fontWeight: 900,
          color: 'var(--ink-primary)',
          letterSpacing: '-0.02em',
          marginTop: '8px',
          marginBottom: '24px',
        }}
      >
        Portal Health
      </h1>

      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: '3px',
          overflow: 'hidden',
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: COL_WIDTHS.join(' '),
            background: 'var(--bg-cream)',
            borderBottom: '1px solid var(--border)',
            padding: '0 16px',
          }}
        >
          {COL_LABELS.map((label) => (
            <div
              key={label}
              style={{
                padding: '10px 8px',
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--ink-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase' as const,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {portals.map((portal) => {
          const dot = statusDot(portal)
          const isExpanded = expandedId === portal.id

          return (
            <div key={portal.id}>
              {/* Main row */}
              <div
                onClick={() => toggle(portal.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: COL_WIDTHS.join(' '),
                  background: rowBg(portal),
                  borderBottom: '1px solid var(--border)',
                  padding: '0 16px',
                  cursor: 'pointer',
                  transition: 'opacity 0.1s',
                }}
              >
                {/* Name */}
                <div style={{ padding: '14px 8px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--ink-primary)',
                    }}
                  >
                    {portal.name}
                  </span>
                </div>

                {/* Method */}
                <div style={{ padding: '14px 8px', display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '12px',
                      color: 'var(--ink-tertiary)',
                      textTransform: 'uppercase' as const,
                    }}
                  >
                    {portal.scan_method}
                  </span>
                </div>

                {/* Frequency */}
                <div style={{ padding: '14px 8px', display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: 'var(--ink-tertiary)',
                      textTransform: 'capitalize' as const,
                    }}
                  >
                    {portal.scan_frequency}
                  </span>
                </div>

                {/* Active */}
                <div style={{ padding: '14px 8px', display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: portal.active ? '#059669' : '#9CA3AF',
                    }}
                  >
                    {portal.active ? 'YES' : 'NO'}
                  </span>
                </div>

                {/* Last Scan */}
                <div style={{ padding: '14px 8px', display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--ink-muted)',
                    }}
                  >
                    {formatScanDate(portal.last_scan_at)}
                  </span>
                </div>

                {/* Status */}
                <div style={{ padding: '14px 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: dot.color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: dot.color,
                      fontWeight: 500,
                    }}
                  >
                    {dot.label}
                  </span>
                </div>

                {/* Opps Found */}
                <div style={{ padding: '14px 8px', display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--ink-primary)',
                    }}
                  >
                    {portal.opportunities_found.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div
                  style={{
                    background: 'var(--bg-cream)',
                    borderBottom: '1px solid var(--border)',
                    padding: '16px 24px',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '24px',
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '11px',
                          color: 'var(--ink-muted)',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase' as const,
                          marginBottom: '4px',
                        }}
                      >
                        URL
                      </p>
                      <a
                        href={portal.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          color: '#2563EB',
                          textDecoration: 'none',
                        }}
                      >
                        {portal.url}
                      </a>
                    </div>

                    {portal.next_scan_at && (
                      <div>
                        <p
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '11px',
                            color: 'var(--ink-muted)',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase' as const,
                            marginBottom: '4px',
                          }}
                        >
                          Next Scan
                        </p>
                        <p
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            color: 'var(--ink-secondary)',
                          }}
                        >
                          {formatScanDate(portal.next_scan_at)}
                        </p>
                      </div>
                    )}

                    {portal.error_message && (
                      <div>
                        <p
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '11px',
                            color: '#DC2626',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase' as const,
                            marginBottom: '4px',
                          }}
                        >
                          Error
                        </p>
                        <p
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: '13px',
                            color: '#DC2626',
                          }}
                        >
                          {portal.error_message}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
