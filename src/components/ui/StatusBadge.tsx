export type StatusType = 'tracking' | 'pursuing' | 'submitted' | 'won' | 'lost'

const STATUS_COLORS: Record<StatusType, string> = {
  tracking: '#6B7280',
  pursuing: '#2563EB',
  submitted: '#D97706',
  won: '#059669',
  lost: '#DC2626',
}

interface StatusBadgeProps {
  status: StatusType
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const color = STATUS_COLORS[status]
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-body)',
        fontSize: '12px',
        fontWeight: 700,
        color,
        backgroundColor: hexToRgba(color, 0.1),
        borderRadius: '3px',
        padding: '2px 8px',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {status}
    </span>
  )
}
