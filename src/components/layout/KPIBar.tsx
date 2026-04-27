interface KPIStat {
  label: string
  value: string | number
}

interface KPIBarProps {
  stats: KPIStat[]
}

export function KPIBar({ stats }: KPIBarProps) {
  return (
    <div style={styles.bar}>
      <div style={styles.inner}>
        {stats.map((stat, i) => (
          <div key={stat.label} style={styles.stat}>
            {i > 0 && <div style={styles.divider} />}
            <span style={styles.value}>{stat.value}</span>
            <span style={styles.label}>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  bar: {
    backgroundColor: 'var(--bg-cream)',
    borderBottom: '1px solid var(--border)',
  },
  inner: {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '0 var(--content-padding)',
    display: 'flex',
    alignItems: 'center',
    gap: '0',
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 0',
    paddingRight: '32px',
  },
  divider: {
    width: '1px',
    height: '24px',
    backgroundColor: 'var(--border)',
    marginRight: '32px',
    flexShrink: 0,
  },
  value: {
    fontFamily: 'var(--font-mono)',
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--ink-primary)',
    letterSpacing: '-0.02em',
  },
  label: {
    fontFamily: 'var(--font-body)',
    fontSize: '11px',
    fontWeight: 400,
    color: 'var(--ink-muted)',
    letterSpacing: '0.04em',
  },
} as const
