import { useEffect, useRef, useState } from 'react'
import type { Opportunity, OpportunityStatus, Tier } from '@/types/opportunity'
import { PIPELINE_STAGES, STAGE_METADATA } from '@/types/pipeline'

const OWNERS = ['jorge', 'sergio', 'julio', 'shami', 'jarvis']
const TIERS: Tier[] = [1, 2, 3]

interface KanbanCardMenuProps {
  opportunity: Opportunity
  onUpdate: (updates: Partial<Opportunity>) => void
  onEdit: () => void
  onDelete: () => void
}

type Submenu = 'status' | 'owner' | 'tier' | null

export function KanbanCardMenu({ opportunity, onUpdate, onEdit, onDelete }: KanbanCardMenuProps) {
  const [open, setOpen] = useState(false)
  const [submenu, setSubmenu] = useState<Submenu>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSubmenu(null)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const apply = <K extends keyof Opportunity>(key: K, value: Opportunity[K]) => {
    onUpdate({ [key]: value } as unknown as Partial<Opportunity>)
    setOpen(false)
    setSubmenu(null)
  }

  return (
    <div ref={ref} style={{ position: 'absolute', top: '6px', right: '6px' }}>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
          setSubmenu(null)
        }}
        aria-label="Card actions"
        style={{
          background: open ? 'var(--bg-cream)' : 'transparent',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
          padding: '2px 6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          fontWeight: 700,
          color: 'var(--ink-muted)',
          lineHeight: 1,
        }}
      >
        ⋯
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: '24px',
            right: 0,
            zIndex: 30,
            minWidth: '170px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: '3px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            padding: '4px',
          }}
        >
          {!submenu && (
            <>
              <Item onClick={() => setSubmenu('status')}>Change Status ▸</Item>
              <Item onClick={() => setSubmenu('owner')}>Change Owner ▸</Item>
              <Item onClick={() => setSubmenu('tier')}>Change Tier ▸</Item>
              <Sep />
              <Item onClick={() => { setOpen(false); onEdit() }}>Edit…</Item>
              <Item danger onClick={() => { setOpen(false); onDelete() }}>Delete</Item>
            </>
          )}
          {submenu === 'status' && (
            <>
              <Item onClick={() => setSubmenu(null)}>← Back</Item>
              <Sep />
              {PIPELINE_STAGES.map((s) => (
                <Item
                  key={s}
                  active={opportunity.status === s}
                  onClick={() => apply('status', s as OpportunityStatus)}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: STAGE_METADATA[s].color,
                      display: 'inline-block',
                      marginRight: '8px',
                    }}
                  />
                  {STAGE_METADATA[s].label}
                </Item>
              ))}
            </>
          )}
          {submenu === 'owner' && (
            <>
              <Item onClick={() => setSubmenu(null)}>← Back</Item>
              <Sep />
              {OWNERS.map((o) => (
                <Item key={o} active={opportunity.owner === o} onClick={() => apply('owner', o)}>
                  {o.charAt(0).toUpperCase() + o.slice(1)}
                </Item>
              ))}
            </>
          )}
          {submenu === 'tier' && (
            <>
              <Item onClick={() => setSubmenu(null)}>← Back</Item>
              <Sep />
              {TIERS.map((t) => (
                <Item key={t} active={opportunity.tier === t} onClick={() => apply('tier', t)}>
                  Tier {t}
                </Item>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function Item({
  children,
  onClick,
  active = false,
  danger = false,
}: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        textAlign: 'left',
        padding: '6px 10px',
        background: active ? 'var(--bg-cream)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: '12px',
        fontWeight: active ? 600 : 400,
        color: danger ? '#DC2626' : 'var(--ink-secondary)',
        borderRadius: '3px',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-cream)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.background = active ? 'var(--bg-cream)' : 'transparent'
      }}
    >
      {children}
    </button>
  )
}

function Sep() {
  return (
    <div
      style={{
        height: '1px',
        background: 'var(--border-subtle)',
        margin: '4px 0',
      }}
    />
  )
}
