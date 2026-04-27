interface DeadlineCountdownProps {
  deadline: Date | string
}

function getDaysRemaining(deadline: Date | string): number {
  const target = typeof deadline === 'string' ? new Date(deadline) : deadline
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function getColor(days: number): string {
  if (days < 0) return '#DC2626'
  if (days < 7) return '#DC2626'
  if (days <= 30) return '#D97706'
  return '#059669'
}

export function DeadlineCountdown({ deadline }: DeadlineCountdownProps) {
  const days = getDaysRemaining(deadline)
  const color = getColor(days)

  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '4px' }}>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          fontWeight: 700,
          color,
        }}
      >
        {days < 0 ? 0 : days}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          fontWeight: 400,
          color: 'var(--ink-muted)',
        }}
      >
        {days === 1 ? 'day' : 'days'}
      </span>
    </span>
  )
}
