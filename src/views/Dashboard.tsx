import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { DeadlineCountdown } from '@/components/ui/DeadlineCountdown'
import { StatsBar } from '@/components/stats/StatsBar'
import { HeroSplitCard } from '@/components/cards/HeroSplitCard'
import { WireframeBackground } from '@/components/three/WireframeBackground'
import { usePortals } from '@/api/portals'
import { useOpportunityStore } from '@/store/useOpportunityStore'
import { formatCurrency } from '@/utils/format'
import type { StatItem } from '@/types/opportunity'
import { DEMO_PORTALS } from './_fixtures'

export function Dashboard() {
  const navigate = useNavigate()
  const opportunities = useOpportunityStore((s) => s.opportunities)
  const { data: portalsData } = usePortals()
  const portals = portalsData ?? DEMO_PORTALS

  const hotOpp = useMemo(
    () => opportunities.find((o) => o.tier === 1 && o.score === 'high') ?? opportunities[0],
    [opportunities],
  )

  const kpi = useMemo(() => {
    const closed = new Set(['won', 'lost', 'dismissed'])
    const won = opportunities.filter((o) => o.status === 'won').length
    const lost = opportunities.filter((o) => o.status === 'lost').length
    const active_pursuits = opportunities.filter((o) => !closed.has(o.status)).length
    const total_value = opportunities.reduce((s, o) => s + (o.value ?? 0), 0)
    const win_rate = won + lost > 0 ? won / (won + lost) : 0
    const now = Date.now()
    const monthMs = 30 * 86_400_000
    const deadlines_this_month = opportunities.filter((o) => {
      if (!o.deadline) return false
      const t = new Date(o.deadline).getTime()
      return t >= now && t <= now + monthMs
    }).length
    const by_owner: Record<string, number> = {}
    for (const o of opportunities) by_owner[o.owner] = (by_owner[o.owner] ?? 0) + 1
    return { active_pursuits, total_value, win_rate, deadlines_this_month, by_owner }
  }, [opportunities])

  const deadlines = useMemo(() => {
    const now = Date.now()
    const weekMs = 7 * 86_400_000
    return opportunities
      .filter((o) => {
        if (!o.deadline) return false
        const t = new Date(o.deadline).getTime()
        return t >= now - 86_400_000 && t <= now + weekMs
      })
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 6)
  }, [opportunities])

  const kpiStats: StatItem[] = [
    { label: 'Active Pursuits', value: kpi.active_pursuits },
    { label: 'Pipeline Value', value: formatCurrency(kpi.total_value) },
    { label: 'Win Rate', value: `${Math.round(kpi.win_rate * 100)}%` },
    { label: 'Deadlines This Month', value: kpi.deadlines_this_month },
  ]

  const workload = useMemo(() => {
    const owners = Object.entries(kpi.by_owner).sort((a, b) => b[1] - a[1])
    const maxCount = Math.max(...owners.map(([, n]) => n), 1)
    return owners.map(([owner, count]) => ({ owner, count, pct: Math.round((count / maxCount) * 100) }))
  }, [kpi.by_owner])

  const portalStatusIcon = (status: string, active: boolean) => {
    if (!active) return '○'
    if (status === 'success') return '✓'
    if (status === 'error') return '✕'
    return '◐'
  }

  const portalStatusColor = (status: string, active: boolean) => {
    if (!active) return 'var(--ink-ghost)'
    if (status === 'success') return '#059669'
    if (status === 'error') return '#DC2626'
    return '#D97706'
  }

  return (
    <div>
      {/* KPI Stats Bar with wireframe background */}
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: '300px', display: 'flex', alignItems: 'center' }}>
        <WireframeBackground />
        <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <StatsBar stats={kpiStats} theme="cream" />
        </div>
      </div>

      <div style={{ paddingTop: 'var(--section-spacing)' }}>
        {/* Hot Opportunity */}
        {hotOpp && (
          <section style={{ marginBottom: 'var(--section-spacing)' }}>
            <SectionLabel>Hot Opportunity</SectionLabel>
            <div style={{ marginTop: '16px' }}>
              <HeroSplitCard
                opportunity={hotOpp}
                onUploadPhoto={() => navigate('/processor')}
              />
            </div>
          </section>
        )}

        {/* Two-column lower section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'var(--grid-gap)',
            marginBottom: 'var(--section-spacing)',
          }}
        >
          {/* This Week's Deadlines */}
          <section>
            <SectionLabel>This Week's Deadlines</SectionLabel>
            <div
              style={{
                marginTop: '16px',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              {deadlines.length === 0 ? (
                <div
                  style={{
                    padding: '32px 16px',
                    textAlign: 'center',
                    fontFamily: 'var(--font-body)',
                    fontSize: '14px',
                    color: 'var(--ink-muted)',
                  }}
                >
                  No deadlines this week
                </div>
              ) : (
                deadlines.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/opportunities/${item.id}`)}
                    style={{
                      padding: '14px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-primary)',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-cream)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLElement).style.background = 'var(--bg-primary)'
                    }}
                  >
                    <div style={{ minWidth: 0, paddingRight: '16px' }}>
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--ink-primary)',
                          marginBottom: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap' as const,
                        }}
                      >
                        {item.title}
                      </p>
                      <p
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: '12px',
                          color: 'var(--ink-muted)',
                        }}
                      >
                        {item.agency}
                      </p>
                    </div>
                    {item.deadline && <DeadlineCountdown deadline={item.deadline} />}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Team Workload */}
          <section>
            <SectionLabel>Team Workload</SectionLabel>
            <div
              style={{
                marginTop: '16px',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              {workload.map(({ owner, count, pct }) => (
                <div
                  key={owner}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: 'var(--ink-primary)',
                        textTransform: 'capitalize' as const,
                      }}
                    >
                      {owner}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: 'var(--ink-muted)',
                      }}
                    >
                      {count}
                    </span>
                  </div>
                  <div
                    style={{
                      height: '4px',
                      background: 'var(--border-subtle)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'var(--accent-sage)',
                        borderRadius: '2px',
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Recent Portal Scans */}
        <section>
          <SectionLabel>Recent Portal Scans</SectionLabel>
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            {portals.slice(0, 5).map((portal) => (
              <div
                key={portal.id}
                onClick={() => navigate('/portals')}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '3px',
                  padding: '12px 16px',
                  background: 'var(--bg-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  minWidth: '180px',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: portalStatusColor(portal.last_scan_status, portal.active),
                    flexShrink: 0,
                  }}
                >
                  {portalStatusIcon(portal.last_scan_status, portal.active)}
                </span>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--ink-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    }}
                  >
                    {portal.name}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--ink-muted)',
                    }}
                  >
                    {portal.opportunities_found.toLocaleString()} found
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
