import Lenis from 'lenis'

let lenisInstance: Lenis | null = null

export function getLenis() {
  return lenisInstance
}

export function ensureLenis() {
  if (lenisInstance) return lenisInstance

  lenisInstance = new Lenis({
    // Keep scrolling behavior "normal" on mouse/trackpad.
    // We only use Lenis to smooth programmatic scroll (nav/CTA).
    duration: 0.9,
    smoothWheel: false,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.0,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
  })

  const raf = (time: number) => {
    lenisInstance?.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  return lenisInstance
}

export async function scrollToId(id: string, opts?: { offset?: number }) {
  const el = document.getElementById(id)
  if (!el) return
  const lenis = ensureLenis()
  lenis.scrollTo(el, {
    offset: opts?.offset ?? -88, // account for sticky header
    duration: 1.05,
    immediate: false,
    lock: false,
  })
}

