import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { CompactKanbanCard } from '@/components/cards/CompactKanbanCard'
import { useOpportunities, useUpdateOpportunity } from '@/api/opportunities'
import { STAGE_METADATA, PIPELINE_STAGES } from '@/types/pipeline'
import type { PipelineStage } from '@/types/pipeline'
import type { Opportunity, OpportunityStatus } from '@/types/opportunity'
import { DEMO_OPPORTUNITIES } from './_fixtures'

const OWNER_OPTIONS = ['jorge', 'sergio', 'julio', 'shami']

export function Pipeline() {
  const navigate = useNavigate()
  const [ownerFilter, setOwnerFilter] = useState('')
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null)

  const { data: oppsResponse } = useOpportunities(
    ownerFilter ? { owner: [ownerFilter] } : undefined,
  )
  const updateMutation = useUpdateOpportunity()

  const baseOpps = oppsResponse?.data ?? DEMO_OPPORTUNITIES
  const [localOpps, setLocalOpps] = useState<Opportunity[]>(baseOpps)

  useEffect(() => {
    setLocalOpps(baseOpps)
  }, [baseOpps])

  const kanbanOpps = localOpps.filter((o) =>
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

  const handleDragLeave = () => {
    setDragOverStage(null)
  }

  const handleDrop = (e: React.DragEvent, newStage: PipelineStage) => {
    e.preventDefault()
    if (!draggedId) return

    const prevOpps = [...localOpps]

    setLocalOpps((prev) =>
      prev.map((o) =>
        o.id === draggedId ? { ...o, status: newStage as OpportunityStatus } : o,
      ),
    )

    updateMutation.mutate(
      { id: draggedId, updates: { status: newStage as OpportunityStatus } },
      {
        onError: () => setLocalOpps(prevOpps),
      },
    )

    setDraggedId(null)
    setDragOverStage(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverStage(null)
  }

  return (
    <div>
      {/* Header */}
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
          <h1
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '36px',
              fontWeight: 900,
              color: 'var(--ink-primary)',
              letterSpacing: '-0.02em',
              marginTop: '4px',
            }}
          >
            Pipeline
          </h1>
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

      {/* Kanban board */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '16px',
        }}
      >
        {PIPELINE_STAGES.map((stage) => {
          const meta = STAGE_METADATA[stage]
          const stageOpps = kanbanOpps.filter((o) => o.status === stage)
          const isOver = dragOverStage === stage
          const color = meta.color

          return (
            <div
              key={stage}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage)}
              style={{
                minWidth: '248px',
                maxWidth: '248px',
                background: isOver ? `${color}18` : `${color}0C`,
                borderRadius: '3px',
                border: isOver ? `1px solid ${color}50` : `1px solid ${color}28`,
                transition: 'background 0.15s, border-color 0.15s',
                flexShrink: 0,
              }}
            >
              {/* Column header */}
              <div
                style={{
                  padding: '10px 12px',
                  borderBottom: `1px solid ${color}28`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
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

              {/* Cards */}
              <div
                style={{
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  maxHeight: 'calc(100vh - 240px)',
                  overflowY: 'auto',
                }}
              >
                {stageOpps.map((opp) => (
                  <div
                    key={opp.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, opp.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <CompactKanbanCard
                      opportunity={opp}
                      onClick={() => navigate(`/opportunities/${opp.id}`)}
                      isDragging={draggedId === opp.id}
                    />
                  </div>
                ))}
                {stageOpps.length === 0 && (
                  <div
                    style={{
                      padding: '20px 8px',
                      textAlign: 'center',
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: `${color}70`,
                      letterSpacing: '0.02em',
                    }}
                  >
                    Drop here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
