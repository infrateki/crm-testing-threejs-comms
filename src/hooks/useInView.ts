import { useEffect, useRef, useState } from 'react'

interface UseInViewOptions {
  rootMargin?: string
  threshold?: number | number[]
}

/**
 * Sticky IntersectionObserver hook. Returns [ref, inView] where `inView` flips
 * true the first time the element enters the viewport (within rootMargin) and
 * stays true thereafter — used to gate one-time mounting of expensive components
 * (e.g., Three.js canvases) without remount thrash on scroll.
 */
export function useInView<T extends Element>(
  options: UseInViewOptions = {},
): [React.RefObject<T>, boolean] {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  const rootMargin = options.rootMargin ?? '0px'
  const threshold = options.threshold ?? 0

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      // SSR or unsupported — default to visible so content renders
      setInView(true)
      return
    }

    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin, threshold])

  return [ref, inView]
}
