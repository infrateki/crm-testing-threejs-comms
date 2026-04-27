import { useState } from 'react'
import { SettingsPanel } from '@/components/panels/SettingsPanel'

export function Footer() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <footer style={styles.footer}>
        <div style={styles.inner}>
          <span style={{ width: '32px' }} aria-hidden />
          <p style={styles.text}>
            BIMSEARCH Command Center v2.0 · PDBM Consulting · INFRATEK LLC
          </p>
          <button
            onClick={() => setSettingsOpen(true)}
            aria-label="Settings"
            title="Settings"
            style={styles.gearBtn}
          >
            <GearIcon />
          </button>
        </div>
      </footer>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}

function GearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <circle cx="8" cy="8" r="2" />
      <path d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8L3.4 3.4" />
    </svg>
  )
}

const styles = {
  footer: {
    borderTop: '1px solid var(--border)',
    backgroundColor: 'var(--bg-primary)',
  },
  inner: {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '14px var(--content-padding)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  text: {
    fontFamily: 'var(--font-body)',
    fontSize: '11px',
    fontWeight: 400,
    color: 'var(--ink-muted)',
    textAlign: 'center' as const,
    flex: 1,
  },
  gearBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--ink-muted)',
    padding: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '3px',
    transition: 'color 0.15s, background 0.15s',
    width: '32px',
    height: '32px',
  },
} as const
