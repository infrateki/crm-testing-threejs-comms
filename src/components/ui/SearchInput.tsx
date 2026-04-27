interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
  return (
    <div style={styles.wrapper}>
      <svg style={styles.icon} width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" />
        <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  )
}

const styles = {
  wrapper: {
    position: 'relative' as const,
    display: 'inline-flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute' as const,
    left: '10px',
    color: 'var(--ink-muted)',
    pointerEvents: 'none' as const,
    flexShrink: 0,
  },
  input: {
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    fontWeight: 400,
    color: 'var(--ink-primary)',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: '3px',
    padding: '8px 12px 8px 32px',
    outline: 'none',
    width: '240px',
  },
} as const
