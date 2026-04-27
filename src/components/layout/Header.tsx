import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', to: '/' },
  { label: 'Showcase', to: '/showcase' },
  { label: 'Pipeline', to: '/pipeline' },
  { label: 'Portals', to: '/portals' },
  { label: 'Processor', to: '/processor' },
]

export function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <NavLink to="/" end style={{ textDecoration: 'none' }}>
          <div style={styles.brand}>
            <span style={styles.wordmark}>BIMSEARCH</span>
            <span style={styles.subtitle}>Command Center</span>
          </div>
        </NavLink>
        <nav style={styles.nav}>
          {navItems.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) =>
                isActive ? styles.navLinkActive : styles.navLink
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

const styles = {
  header: {
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--bg-primary)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '0 var(--content-padding)',
    height: '52px',
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1px',
    flexShrink: 0,
  },
  wordmark: {
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: 'var(--ink-primary)',
  },
  subtitle: {
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    fontWeight: 400,
    color: 'var(--ink-muted)',
    lineHeight: 1,
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
  },
  navLink: {
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    fontWeight: 400,
    color: 'var(--ink-muted)',
    padding: '6px 14px',
    borderRadius: '2px',
    transition: 'color 0.15s',
  },
  navLinkActive: {
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--ink-primary)',
    padding: '6px 14px',
    borderRadius: '2px',
  },
} as const
