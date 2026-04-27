import type { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

interface ShellProps {
  children: ReactNode
  kpiBar?: ReactNode
}

export function Shell({ children, kpiBar }: ShellProps) {
  return (
    <div style={styles.shell}>
      <Header />
      {kpiBar}
      <main style={styles.main}>
        <div style={styles.content}>{children}</div>
      </main>
      <Footer />
    </div>
  )
}

const styles = {
  shell: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: 'var(--bg-primary)',
  },
  main: {
    flex: 1,
  },
  content: {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: 'var(--section-spacing) var(--content-padding)',
  },
} as const
