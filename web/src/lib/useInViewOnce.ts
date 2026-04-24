import { useEffect, useRef, useState } from 'react'

export function useInViewOnce<T extends Element>(threshold = 0.18) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        setInView(true)
        io.disconnect()
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [inView, threshold])

  return { ref, inView }
}

