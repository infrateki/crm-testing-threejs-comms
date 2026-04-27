import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { CompactKanbanCard } from '@/components/cards/CompactKanbanCard'
import { KanbanCardMenu } from '@/components/cards/KanbanCardMenu'
import { ConfirmDialog } from '@/components/modals/ConfirmDialog'
import { useOpportunityStore } from '@/store/useOpportunityStore'
import { STAGE_METADATA, PIPELINE_STAGES } from '@/types/pipeline'
import type { PipelineStage } from '@/types/pipeline'
import type { Opportunity, OpportunityStatus } from '@/types/opportunity'
import { formatCurrency } from '@/utils/format'

const OWNER_OPTIONS = ['jorge', 'sergio', 'julio', 'shami']

export function Pipeline() {
  const navigate = useNavigate()
  const allOpps = useOpportunityStore((s) => s.opportunities)
  const updateOpportunity = useOpportunityStore((s) => s.updateOpportunity)
  const createOpportunity = useOpportunityStore((s) => s.createOpportunity)
  const deleteOpportunity = useOpportunityStore((s) => s.deleteOpportunity)

  const [ownerFilter, setOwnerFilter] = useState('')
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null)
  const [addingTo, setAddingTo] = useState<PipelineStage | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newAgency, setNewAgency] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<Opportunity | null>(null)

  const opportunities = ownerFilter
    ? allOpps.filter((o) => o.owner === ownerFilter)
    : allOpps

  const kanbanOpps = opportunities.filter((o) =>
    PIPELINE_STAGES.includes(o.status as PipelineStage),
  )

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stage)
  }

  const handleDragLeave = () => setDragOverStage(null)

  const handleDrop = (e: React.DragEvent, newStage: PipelineStage) => {
    e.preventDefault()
    if (!draggedId) return
    updateOpportunity(draggedId, { status: newStage as OpportunityStatus })
    setDraggedId(null)
    setDragOverStage(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverStage(null)
  }

  const startAdding = (stage: PipelineStage) => {
    setAddingTo(stage)
    setNewTitle('')
    setNewAgency('')
  }

  const cancelAdding = () => {
    setAddingTo(null)
    setNewTitle('')
    setNewAgency('')
  }

  const submitAdding = (stage: PipelineStage) => {
    if (!newTitle.trim() || !newAgency.trim()) return
    createOpportunity({
      title: newTitle.trim(),
      agency: newAgency.trim(),
      status: stage as OpportunityStatus,
    })
    cancelAdding()
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '24px',
        }}
      >
        <div>
          <SectionLabel>Kanban</SectionLabel>
          <h1 style={titleStyle}>Pipeline</h1>
        </div>

        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          style={{
            padding: '8px 12px',
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
      </div>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '16px',
          alignItems: 'flex-start',
        }}
      >
        {PIPELINE_STAGES.map((stage) => {
          const meta = STAGE_METADATA[stage]
          const stageOpps = kanbanOpps.filter((o) => o.status === stage)
          const isOver = dragOverStage === stage
          const color = meta.color
          const total = stageOpps.reduce((sum, o) => sum + (o.value ?? 0), 0)
          const isAdding = addingTo === stage
          const isEmpty = stageOpps.length === 0 && !isAdding

          return (
            <div
              key={stage}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage)}
              style={{
                minWidth: '258px',
                maxWidth: '258px',
                background: isOver ? `${color}18` : `${color}0C`,
                borderRadius: '3px',
                border: isOver ? `1px solid ${color}50` : `1px solid ${color}28`,
                transition: 'background 0.15s, border-color 0.15s',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 'calc(100vh - 220px)',
              }}
            >
              <div
                style={{
                  padding: '10px 12px',
                  borderBottom: `1px solid ${color}28`,
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--ink-primary)',
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.06em',
                      flex: 1,
                    }}
                  >
                    {meta.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--ink-muted)',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: '3px',
                      padding: '0px 5px',
                    }}
                  >
                    {stageOpps.length}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: total > 0 ? 'var(--ink-primary)' : 'var(--ink-muted)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {total > 0 ? formatCurrency(total) : '—'}
                </div>
              </div>

              <div
                style={{
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  overflowY: 'auto',
                  flex: 1,
                  minHeight: '120px',
                }}
              >
                {stageOpps.map((opp) => (
                  <div
                    key={opp.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, opp.id)}
                    onDragEnd={handleDragEnd}
                    style={{ position: 'relative' }}
                  >
                    <CompactKanbanCard
                      opportunity={opp}
                      onClick={() => navigate(`/opportunities/${opp.id}`)}
                      isDragging={draggedId === opp.id}
                    />
                    <KanbanCardMenu
                      opportunity={opp}
                      onUpdate={(updates) => updateOpportunity(opp.id, updates)}
                      onEdit={() => navigate(`/opportunities/${opp.id}`)}
                      onDelete={() => setConfirmDelete(opp)}
                    />
                  </div>
                ))}

                {isEmpty && (
                  <button
                    onClick={() => startAdding(stage)}
                    style={{
                      flex: 1,
                      minHeight: '80px',
                      border: `1.5px dashed ${color}48`,
                      borderRadius: '3px',
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-body)',
                      fontSize: '24px',
                      fontWeight: 300,
                      color: `${color}90`,
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = color
                      ;(e.currentTarget as HTMLButtonElement).style.background = `${color}10`
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLButtonElement).style.borderColor = `${color}48`
                      ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                    }}
                  >
                    +
                  </button>
                )}

                {isAdding && (
                  <div
                    style={{
                      background: 'var(--bg-primary)',
                      border: `1px solid ${color}80`,
                      borderRadius: '3px',
                      padding: '10px',
                    }}
                  >
                    <input
                      autoFocus
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Title *"
                      style={miniInput}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') cancelAdding()
                      }}
                    />
                    <input
                      value={newAgency}
                      onChange={(e) => setNewAgency(e.target.value)}
                      placeholder="Agency *"
                      style={{ ...miniInput, marginTop: '6px' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTitle.trim() && newAgency.trim()) submitAdding(stage)
                        if (e.key === 'Escape') cancelAdding()
                      }}
                    />
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={cancelAdding} style={miniBtnSecondary}>
                        Cancel
                      </button>
                      <button
                        onClick={() => submitAdding(stage)}
                        disabled={!newTitle.trim() || !newAgency.trim()}
                        style={{
                          ...miniBtnPrimary,
                          background: newTitle.trim() && newAgency.trim() ? color : 'var(--ink-ghost)',
                          cursor: newTitle.trim() && newAgency.trim() ? 'pointer' : 'not-allowed',
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky bottom + button when not empty/adding */}
              {!isEmpty && !isAdding && (
                <button
                  onClick={() => startAdding(stage)}
                  style={{
                    margin: '0 8px 8px',
                    padding: '6px',
                    background: 'transparent',
                    border: `1px dashed ${color}40`,
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--ink-tertiary)',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = color
                    ;(e.currentTarget as HTMLButtonElement).style.color = color
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = `${color}40`
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-tertiary)'
                  }}
                >
                  + Add to {meta.label}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete this opportunity?"
        message={confirmDelete ? `"${confirmDelete.title}" will be permanently removed.` : ''}
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (confirmDelete) deleteOpportunity(confirmDelete.id)
          setConfirmDelete(null)
        }}
        onCancel={() => setConfirmDelete(null)}
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

const miniInput = {
  width: '100%',
  padding: '6px 8px',
  border: '1px solid var(--border)',
  borderRadius: '3px',
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--ink-primary)',
  background: 'var(--bg-primary)',
  outline: 'none',
}

const miniBtnSecondary = {
  padding: '4px 10px',
  background: 'var(--bg-primary)',
  color: 'var(--ink-secondary)',
  border: '1px solid var(--border)',
  borderRadius: '3px',
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  fontWeight: 500,
  cursor: 'pointer',
}

const miniBtnPrimary = {
  padding: '4px 10px',
  color: '#fff',
  border: 'none',
  borderRadius: '3px',
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'pointer',
}
