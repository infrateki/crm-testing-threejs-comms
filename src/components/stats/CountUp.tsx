import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  target: number
  label?: string
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
}

export function CountUp({
  target,
  label,
  duration = 1500,
  prefix = '',
  suffix = '',
  decimals = 0,
}: CountUpProps) {
  const [current, setCurrent] = useState(0)
  const startedRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !startedRef.current) {
          startedRef.current = true

          const startTime = performance.now()
          const easeOutQuad = (t: number) => t * (2 - t)

          let rafId: number
          const animate = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            setCurrent(easeOutQuad(progress) * target)
            if (progress < 1) {
              rafId = requestAnimationFrame(animate)
            }
          }

          rafId = requestAnimationFrame(animate)
          return () => cancelAnimationFrame(rafId)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  const display =
    decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString()

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
        {prefix}
        {display}
        {suffix}
      </span>
      {label && (
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
      )}
    </div>
  )
}
