export function Footer() {
  return (
    <footer style={styles.footer}>
      <p style={styles.text}>
        BIMSEARCH Command Center v2.0 · PDBM Consulting · INFRATEK LLC
      </p>
    </footer>
  )
}

const styles = {
  footer: {
    borderTop: '1px solid var(--border)',
    padding: '16px var(--content-padding)',
    backgroundColor: 'var(--bg-primary)',
  },
  text: {
    fontFamily: 'var(--font-body)',
    fontSize: '11px',
    fontWeight: 400,
    color: 'var(--ink-muted)',
    textAlign: 'center' as const,
  },
} as const
