import { Fragment } from 'react'
import type { StatItem } from '@/types/opportunity'

interface StatsBarProps {
  stats: StatItem[]
  theme?: 'light' | 'cream'
}

export function StatsBar({ stats, theme = 'light' }: StatsBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        background: theme === 'cream' ? 'var(--bg-cream)' : 'var(--bg-primary)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {stats.map((stat, i) => (
        <Fragment key={`${stat.label}-${i}`}>
          {i > 0 && (
            <div
              style={{
                width: '1px',
                background: 'var(--border)',
                flexShrink: 0,
                alignSelf: 'stretch',
              }}
            />
          )}
          <div
            style={{
              flex: 1,
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--ink-primary)',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {stat.value}
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
              {stat.label}
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  )
}
