import type { Opportunity } from '@/types/opportunity'
import { TierBadge } from '@/components/ui/TierBadge'
import { DeadlineCountdown } from '@/components/ui/DeadlineCountdown'
import { formatCurrency } from '@/utils/format'

interface CompactKanbanCardProps {
  opportunity: Opportunity
  onClick?: (opportunity: Opportunity) => void
  isDragging?: boolean
}

export function CompactKanbanCard({
  opportunity,
  onClick,
  isDragging = false,
}: CompactKanbanCardProps) {
  return (
    <div
      onClick={() => onClick?.(opportunity)}
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: '3px',
        padding: '12px',
        cursor: isDragging ? 'grabbing' : 'pointer',
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.14)' : 'var(--card-shadow)',
        opacity: isDragging ? 0.8 : 1,
        transform: isDragging ? 'scale(1.02) rotate(1deg)' : 'none',
        transition: 'box-shadow 0.15s ease, opacity 0.15s ease, transform 0.15s ease',
        userSelect: 'none' as const,
      }}
    >
      {/* Title */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--ink-primary)',
          lineHeight: 1.35,
          marginBottom: '5px',
        }}
      >
        {opportunity.title}
      </p>

      {/* Agency */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          fontWeight: 400,
          color: 'var(--ink-tertiary)',
          marginBottom: '10px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap' as const,
        }}
      >
        {opportunity.agency}
      </p>

      {/* Value + Tier row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--ink-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {formatCurrency(opportunity.value)}
        </span>
        <TierBadge tier={`T${opportunity.tier}` as 'T1' | 'T2' | 'T3'} />
      </div>

      {/* Deadline + owner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {opportunity.deadline ? (
          <DeadlineCountdown deadline={opportunity.deadline} />
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--ink-muted)',
            }}
          >
            No deadline
          </span>
        )}
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--ink-muted)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
          }}
        >
          {opportunity.owner}
        </span>
      </div>
    </div>
  )
}
