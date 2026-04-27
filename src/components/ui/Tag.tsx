import type { ReactNode } from 'react'

interface TagProps {
  children: ReactNode
}

export function Tag({ children }: TagProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-body)',
        fontSize: '11px',
        fontWeight: 500,
        color: 'var(--ink-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '3px',
        padding: '2px 8px',
        whiteSpace: 'nowrap' as const,
      }}
    >
      {children}
    </span>
  )
}
