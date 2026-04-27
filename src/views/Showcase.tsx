import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SearchInput } from '@/components/ui/SearchInput'
import { OpportunityCard } from '@/components/cards/OpportunityCard'
import { useOpportunities } from '@/api/opportunities'
import type { OpportunityStatus } from '@/types/opportunity'
import { DEMO_OPPORTUNITIES } from './_fixtures'

const STATUS_OPTIONS: { value: OpportunityStatus; label: string }[] = [
  { value: 'radar', label: 'Radar' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'contact', label: 'Contact' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

const TIER_OPTIONS = [1, 2, 3] as const
const OWNER_OPTIONS = ['jorge', 'sergio', 'julio', 'shami']

const SORT_OPTIONS = [
  { value: 'deadline', label: 'Deadline' },
  { value: 'value', label: 'Value' },
  { value: 'score', label: 'Score' },
  { value: 'updated', label: 'Updated' },
]

const SCORE_ORDER = { high: 3, medium: 2, low: 1 }

export function Showcase() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState<OpportunityStatus[]>([])
  const [tierFilters, setTierFilters] = useState<number[]>([])
  const [ownerFilter, setOwnerFilter] = useState('')
  const [sortBy, setSortBy] = useState('deadline')

  const { data: oppsResponse } = useOpportunities({
    search: search || undefined,
    status: statusFilters.length > 0 ? statusFilters : undefined,
  })

  const allOpps = oppsResponse?.data ?? DEMO_OPPORTUNITIES

  const displayed = useMemo(() => {
    let result = [...allOpps]

    if (tierFilters.length > 0) {
      result = result.filter((o) => tierFilters.includes(o.tier))
    }
    if (ownerFilter) {
      result = result.filter((o) => o.owner === ownerFilter)
    }

    switch (sortBy) {
      case 'value':
        result.sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
        break
      case 'score':
        result.sort(
          (a, b) =>
            (SCORE_ORDER[b.score] ?? 0) - (SCORE_ORDER[a.score] ?? 0),
        )
        break
      case 'updated':
        result.sort(
          (a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
        )
        break
      case 'deadline':
      default:
        result.sort((a, b) => {
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        })
    }

    return result
  }, [allOpps, tierFilters, ownerFilter, sortBy])

  const toggleStatus = (s: OpportunityStatus) =>
    setStatusFilters((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    )

  const toggleTier = (t: number) =>
    setTierFilters((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t],
    )

  return (
    <div>
      <SectionLabel>Opportunities</SectionLabel>
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
        Showcase
      </h1>

      {/* Filter bar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '24px',
          flexWrap: 'wrap',
          padding: '16px',
          background: 'var(--bg-cream)',
          border: '1px solid var(--border)',
          borderRadius: '3px',
        }}
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Search opportunities…" />

        {/* Status toggles */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => toggleStatus(value)}
              style={{
                padding: '4px 10px',
                borderRadius: '3px',
                border: statusFilters.includes(value)
                  ? '1px solid var(--accent-sage)'
                  : '1px solid var(--border)',
                background: statusFilters.includes(value)
                  ? 'var(--accent-sage)'
                  : 'var(--bg-primary)',
                color: statusFilters.includes(value) ? '#fff' : 'var(--ink-secondary)',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                letterSpacing: '0.02em',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tier toggles */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            borderLeft: '1px solid var(--border)',
            paddingLeft: '12px',
          }}
        >
          {TIER_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => toggleTier(t)}
              style={{
                padding: '4px 8px',
                borderRadius: '3px',
                border: tierFilters.includes(t)
                  ? '1px solid var(--accent-slate)'
                  : '1px solid var(--border)',
                background: tierFilters.includes(t)
                  ? 'var(--accent-slate)'
                  : 'var(--bg-primary)',
                color: tierFilters.includes(t) ? '#fff' : 'var(--ink-tertiary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              T{t}
            </button>
          ))}
        </div>

        {/* Owner */}
        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          style={{
            padding: '6px 10px',
            border: '1px solid var(--border)',
            borderRadius: '3px',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--ink-secondary)',
            background: 'var(--bg-primary)',
            cursor: 'pointer',
          }}
        >
          <option value="">All Owners</option>
          {OWNER_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o.charAt(0).toUpperCase() + o.slice(1)}
            </option>
          ))}
        </select>

        {/* Sort */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--ink-muted)',
            }}
          >
            Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '6px 10px',
              border: '1px solid var(--border)',
              borderRadius: '3px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--ink-secondary)',
              background: 'var(--bg-primary)',
              cursor: 'pointer',
            }}
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: 'var(--ink-muted)',
          marginBottom: '16px',
        }}
      >
        {displayed.length} {displayed.length === 1 ? 'opportunity' : 'opportunities'}
      </div>

      {/* Card grid */}
      {displayed.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: 'var(--grid-gap)',
          }}
        >
          {displayed.map((opp, index) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.35, ease: 'easeOut' }}
            >
              <OpportunityCard
                opportunity={opp}
                onClick={() => navigate(`/opportunities/${opp.id}`)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 40px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '28px',
              fontWeight: 900,
              color: 'var(--ink-tertiary)',
              marginBottom: '12px',
            }}
          >
            No opportunities found
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--ink-muted)',
            }}
          >
            Try adjusting your filters
          </p>
        </div>
      )}
    </div>
  )
}
