import { useState } from 'react'
import { SlideOver } from './SlideOver'
import { useOpportunityStore } from '@/store/useOpportunityStore'
import { PIPELINE_STAGES } from '@/types/pipeline'
import type { OpportunityStatus, Tier, Score } from '@/types/opportunity'

interface CreateOpportunityPanelProps {
  open: boolean
  onClose: () => void
  defaultStatus?: OpportunityStatus
  onCreated?: (id: string) => void
}

const OWNERS = ['jorge', 'sergio', 'julio', 'shami', 'jarvis']

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid var(--border)',
  borderRadius: '3px',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--ink-primary)',
  background: 'var(--bg-primary)',
  outline: 'none',
}

const labelStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  fontWeight: 500,
  color: 'var(--ink-tertiary)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  display: 'block',
  marginBottom: '6px',
}

export function CreateOpportunityPanel({
  open,
  onClose,
  defaultStatus = 'radar',
  onCreated,
}: CreateOpportunityPanelProps) {
  const createOpportunity = useOpportunityStore((s) => s.createOpportunity)

  const [title, setTitle] = useState('')
  const [agency, setAgency] = useState('')
  const [description, setDescription] = useState('')
  const [value, setValue] = useState('')
  const [deadline, setDeadline] = useState('')
  const [status, setStatus] = useState<OpportunityStatus>(defaultStatus)
  const [tier, setTier] = useState<Tier>(2)
  const [score, setScore] = useState<Score>('medium')
  const [owner, setOwner] = useState('sergio')
  const [naics, setNaics] = useState('')
  const [setAside, setSetAside] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const reset = () => {
    setTitle('')
    setAgency('')
    setDescription('')
    setValue('')
    setDeadline('')
    setStatus(defaultStatus)
    setTier(2)
    setScore('medium')
    setOwner('sergio')
    setNaics('')
    setSetAside('')
    setTags([])
    setTagInput('')
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const addTag = () => {
    const v = tagInput.trim()
    if (!v) return
    if (!tags.includes(v)) setTags([...tags, v])
    setTagInput('')
  }

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !agency.trim()) return
    const opp = createOpportunity({
      title: title.trim(),
      agency: agency.trim(),
      description: description.trim() || null,
      value: value ? parseFloat(value) : null,
      deadline: deadline || null,
      status,
      tier,
      score,
      owner,
      naics_code: naics.trim() || null,
      set_aside: setAside.trim() || null,
      tags,
    })
    onCreated?.(opp.id)
    reset()
    onClose()
  }

  const canSubmit = title.trim() && agency.trim()

  return (
    <SlideOver open={open} onClose={handleClose} title="New Opportunity" subtitle="Create a tracked pursuit">
      <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={labelStyle}>Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project title"
            autoFocus
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Agency *</label>
          <input
            value={agency}
            onChange={(e) => setAgency(e.target.value)}
            placeholder="Agency or client"
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Scope / Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Project scope, BIM requirements, PDBM angle…"
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-body)' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Value ($)</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="2500000"
              style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <div>
            <label style={labelStyle}>Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as OpportunityStatus)} style={inputStyle}>
              {PIPELINE_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Owner</label>
            <select value={owner} onChange={(e) => setOwner(e.target.value)} style={inputStyle}>
              {OWNERS.map((o) => (
                <option key={o} value={o}>
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(Number(e.target.value) as Tier)}
              style={inputStyle}
            >
              <option value={1}>Tier 1 — Strategic</option>
              <option value={2}>Tier 2 — Active</option>
              <option value={3}>Tier 3 — Monitor</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Score</label>
            <select value={score} onChange={(e) => setScore(e.target.value as Score)} style={inputStyle}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>NAICS Code</label>
            <input
              value={naics}
              onChange={(e) => setNaics(e.target.value)}
              placeholder="236220"
              style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
            />
          </div>
          <div>
            <label style={labelStyle}>Set-aside</label>
            <input
              value={setAside}
              onChange={(e) => setSetAside(e.target.value)}
              placeholder="Small Business"
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Tags</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
            {tags.map((t) => (
              <span
                key={t}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  background: 'var(--bg-cream)',
                  border: '1px solid var(--border)',
                  borderRadius: '3px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '11px',
                  color: 'var(--ink-secondary)',
                }}
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)', padding: 0, fontSize: '14px', lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
              placeholder="Add tag, press Enter"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="button"
              onClick={addTag}
              style={{
                padding: '8px 14px',
                background: 'var(--bg-cream)',
                border: '1px solid var(--border)',
                borderRadius: '3px',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: 'var(--ink-secondary)',
              }}
            >
              Add
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end',
            paddingTop: '12px',
            borderTop: '1px solid var(--border)',
            marginTop: '8px',
          }}
        >
          <button
            type="button"
            onClick={handleClose}
            style={{
              padding: '9px 16px',
              background: 'var(--bg-primary)',
              color: 'var(--ink-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '3px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              letterSpacing: '0.02em',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              padding: '9px 18px',
              background: canSubmit ? 'var(--accent-slate)' : 'var(--ink-ghost)',
              color: '#fff',
              border: 'none',
              borderRadius: '3px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              letterSpacing: '0.02em',
            }}
          >
            Create Opportunity
          </button>
        </div>
      </form>
    </SlideOver>
  )
}
