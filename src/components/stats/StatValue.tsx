import type { StatItem } from '@/types/opportunity'

export function StatValue({ value, label }: StatItem) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--ink-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '11px',
          fontWeight: 400,
          color: 'var(--ink-muted)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase' as const,
        }}
      >
        {label}
      </span>
    </div>
  )
}
