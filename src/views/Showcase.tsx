import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SearchInput } from '@/components/ui/SearchInput'
import { OpportunityCard } from '@/components/cards/OpportunityCard'
import { CreateOpportunityPanel } from '@/components/panels/CreateOpportunityPanel'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { useOpportunityStore } from '@/store/useOpportunityStore'
import { PIPELINE_STAGES } from '@/types/pipeline'
import type { OpportunityStatus } from '@/types/opportunity'

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
  const opportunities = useOpportunityStore((s) => s.opportunities)
  const bulkDelete = useOpportunityStore((s) => s.bulkDeleteOpportunities)
  const bulkUpdateStatus = useOpportunityStore((s) => s.bulkUpdateStatus)

  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState<OpportunityStatus[]>([])
  const [tierFilters, setTierFilters] = useState<number[]>([])
  const [ownerFilter, setOwnerFilter] = useState('')
  const [sortBy, setSortBy] = useState('deadline')
  const [createOpen, setCreateOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [bulkStatus, setBulkStatus] = useState<OpportunityStatus | ''>('')

  const displayed = useMemo(() => {
    let result = [...opportunities]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.agency.toLowerCase().includes(q) ||
          (o.description?.toLowerCase().includes(q) ?? false) ||
          o.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }
    if (statusFilters.length > 0) {
      result = result.filter((o) => statusFilters.includes(o.status))
    }
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
        result.sort((a, b) => (SCORE_ORDER[b.score] ?? 0) - (SCORE_ORDER[a.score] ?? 0))
        break
      case 'updated':
        result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
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
  }, [opportunities, search, statusFilters, tierFilters, ownerFilter, sortBy])

  const toggleStatus = (s: OpportunityStatus) =>
    setStatusFilters((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  const toggleTier = (t: number) =>
    setTierFilters((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const handleBulkDelete = () => {
    bulkDelete(Array.from(selected))
    setSelected(new Set())
    setConfirmDelete(false)
  }

  const handleBulkMove = () => {
    if (!bulkStatus) return
    bulkUpdateStatus(Array.from(selected), bulkStatus)
    setSelected(new Set())
    setBulkStatus('')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <SectionLabel>Opportunities</SectionLabel>
          <h1 style={titleStyle}>Showcase</h1>
        </div>
        <button onClick={() => setCreateOpen(true)} style={primaryBtn}>
          + New Opportunity
        </button>
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          padding: '16px',
          background: 'var(--bg-cream)',
          border: '1px solid var(--border)',
          borderRadius: '3px',
        }}
      >
        <SearchInput value={search} onChange={setSearch} placeholder="Search opportunities…" />

        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => toggleStatus(value)}
              style={{
                padding: '4px 10px',
                borderRadius: '3px',
                border: statusFilters.includes(value) ? '1px solid var(--accent-sage)' : '1px solid var(--border)',
                background: statusFilters.includes(value) ? 'var(--accent-sage)' : 'var(--bg-primary)',
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

        <div style={{ display: 'flex', gap: '4px', borderLeft: '1px solid var(--border)', paddingLeft: '12px' }}>
          {TIER_OPTIONS.map((t) => (
            <button
              key={t}
              onClick={() => toggleTier(t)}
              style={{
                padding: '4px 8px',
                borderRadius: '3px',
                border: tierFilters.includes(t) ? '1px solid var(--accent-slate)' : '1px solid var(--border)',
                background: tierFilters.includes(t) ? 'var(--accent-slate)' : 'var(--bg-primary)',
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

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-muted)' }}>Sort:</span>
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

      {displayed.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: 'var(--grid-gap)',
          }}
        >
          {displayed.map((opp, index) => {
            const isSelected = selected.has(opp.id)
            return (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.35, ease: 'easeOut' }}
                style={{ position: 'relative' }}
                className="opportunity-card-wrapper"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSelect(opp.id)
                  }}
                  aria-label={isSelected ? 'Deselect' : 'Select'}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    zIndex: 5,
                    width: '22px',
                    height: '22px',
                    borderRadius: '3px',
                    border: isSelected ? '1px solid var(--accent-slate)' : '1px solid var(--border)',
                    background: isSelected ? 'var(--accent-slate)' : 'rgba(255,255,255,0.92)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isSelected ? 1 : 0,
                    transition: 'opacity 0.15s, background 0.15s, border-color 0.15s',
                  }}
                  className="card-checkbox"
                >
                  {isSelected ? '✓' : ''}
                </button>
                <OpportunityCard opportunity={opp} onClick={() => navigate(`/opportunities/${opp.id}`)} />
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 40px' }}>
          <p style={{ fontFamily: 'var(--font-headline)', fontSize: '28px', fontWeight: 900, color: 'var(--ink-tertiary)', marginBottom: '12px' }}>
            No opportunities found
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink-muted)' }}>
            Try adjusting your filters or create a new one
          </p>
        </div>
      )}

      {/* CSS to show checkbox on hover */}
      <style>{`
        .opportunity-card-wrapper:hover .card-checkbox { opacity: 1 !important; }
      `}</style>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            background: 'var(--ink-primary)',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: '3px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>
            {selected.size} selected
          </span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value as OpportunityStatus | '')}
            style={{
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: '3px',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <option value="" style={{ color: '#000' }}>Move to status…</option>
            {PIPELINE_STAGES.map((s) => (
              <option key={s} value={s} style={{ color: '#000' }}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          <button
            onClick={handleBulkMove}
            disabled={!bulkStatus}
            style={{
              padding: '6px 12px',
              background: bulkStatus ? 'var(--accent-sage)' : 'rgba(255,255,255,0.06)',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: bulkStatus ? 'pointer' : 'not-allowed',
            }}
          >
            Apply
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            style={{
              padding: '6px 12px',
              background: '#DC2626',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Delete
          </button>
          <button
            onClick={() => setSelected(new Set())}
            style={{
              padding: '6px 10px',
              background: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              border: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </motion.div>
      )}

      <CreateOpportunityPanel
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => navigate(`/opportunities/${id}`)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${selected.size} ${selected.size === 1 ? 'opportunity' : 'opportunities'}?`}
        message="This will permanently remove the selected opportunities and their notes from your local data."
        confirmLabel="Delete"
        danger
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}

const titleStyle = {
  fontFamily: 'var(--font-headline)',
  fontSize: '36px',
  fontWeight: 900,
  color: 'var(--ink-primary)',
  letterSpacing: '-0.02em',
  marginTop: '4px',
}

const primaryBtn = {
  padding: '10px 18px',
  background: 'var(--accent-slate)',
  color: '#fff',
  border: 'none',
  borderRadius: '3px',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  letterSpacing: '0.02em',
}
