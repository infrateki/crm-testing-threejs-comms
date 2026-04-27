export type TierLevel = 'T1' | 'T2' | 'T3'

interface TierBadgeProps {
  tier: TierLevel
}

export function TierBadge({ tier }: TierBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 400,
        color: 'var(--ink-tertiary)',
        border: '1px solid var(--border)',
        borderRadius: '3px',
        padding: '1px 6px',
        letterSpacing: '0.02em',
      }}
    >
      {tier}
    </span>
  )
}
