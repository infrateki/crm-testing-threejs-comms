import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface SlideOverProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  width?: number
}

export function SlideOver({ open, onClose, title, subtitle, children, width = 480 }: SlideOverProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.32)',
              zIndex: 200,
            }}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: `${width}px`,
              maxWidth: '100vw',
              background: 'var(--bg-primary)',
              borderLeft: '1px solid var(--border)',
              boxShadow: '-12px 0 40px rgba(0,0,0,0.08)',
              zIndex: 201,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <header
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                flexShrink: 0,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: '22px',
                    fontWeight: 900,
                    color: 'var(--ink-primary)',
                    letterSpacing: '-0.01em',
                    margin: 0,
                  }}
                >
                  {title}
                </h2>
                {subtitle && (
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '12px',
                      color: 'var(--ink-muted)',
                      margin: '4px 0 0 0',
                    }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                aria-label="Close panel"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  lineHeight: 1,
                  color: 'var(--ink-muted)',
                  padding: '4px 8px',
                }}
              >
                ×
              </button>
            </header>
            <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
