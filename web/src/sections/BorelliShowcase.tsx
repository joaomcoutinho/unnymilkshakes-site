import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { fadeInUp, motionEase, motionDur, staggerChildren } from '../lib/motion'

type ShowcaseItem = {
  title: string
  image: string
  ctaLabel?: string
}

export function BorelliShowcase({
  title,
  highlight,
  items,
  onCta,
}: {
  title: string
  highlight: string
  items: ShowcaseItem[]
  onCta?: (item: ShowcaseItem) => void
}) {
  const [active, setActive] = useState(0)

  const safeItems = useMemo(() => (items.length ? items : []), [items])
  const activeItem = safeItems[active]
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  const scrollToIndex = (idx: number) => {
    const el = scrollerRef.current
    if (!el) return
    const child = el.children.item(idx) as HTMLElement | null
    if (!child) return
    child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    setActive(idx)
  }

  useEffect(() => {
    // Mobile: atualiza o "active" conforme o snap/scroll (sem depender de hover)
    const el = scrollerRef.current
    if (!el) return
    let raf = 0
    const onScroll = () => {
      window.cancelAnimationFrame(raf)
      raf = window.requestAnimationFrame(() => {
        const children = Array.from(el.children) as HTMLElement[]
        if (!children.length) return
        const center = el.scrollLeft + el.clientWidth / 2
        let best = 0
        let bestDist = Number.POSITIVE_INFINITY
        for (let i = 0; i < children.length; i++) {
          const c = children[i]
          const cCenter = c.offsetLeft + c.clientWidth / 2
          const d = Math.abs(cCenter - center)
          if (d < bestDist) {
            bestDist = d
            best = i
          }
        }
        setActive(best)
      })
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section aria-label="Conheça nossos produtos artesanais">
      {/* Title block (centered) */}
      <div className="aurum-container py-16 sm:py-20">
        <motion.div
          className="text-center"
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
        >
          <h2 className="font-heading text-[32px] font-extrabold leading-tight tracking-tighter text-aurum-primary-base sm:text-[44px]">
            {title}{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-white">{highlight}</span>
              <span className="absolute -bottom-1 left-0 right-0 z-0 h-3 rounded-full bg-white/20" />
            </span>
          </h2>
        </motion.div>

        {/* Desktop interactive grid */}
        <div className="mt-10 hidden md:block [@media(hover:none)]:hidden [@media(pointer:coarse)]:hidden">
          <motion.div
            className="flex h-[420px] w-full overflow-hidden rounded-[28px]"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={{
              hidden: {},
              show: staggerChildren(0.08, 0.08),
            }}
          >
            {safeItems.map((it, idx) => {
              const isActive = idx === active
              return (
                <motion.article
                  key={it.title}
                  className={clsx(
                    'relative min-w-0 cursor-pointer overflow-hidden',
                    'outline-none focus-visible:ring-2 focus-visible:ring-aurum-secondary-base/40',
                  )}
                  variants={fadeInUp}
                  role="button"
                  tabIndex={0}
                  aria-label={`Categoria: ${it.title}`}
                  onMouseEnter={() => setActive(idx)}
                  onFocus={() => setActive(idx)}
                  onClick={() => setActive(idx)}
                  animate={{ flexGrow: isActive ? 3.2 : 1.1 }}
                  transition={{ duration: 0.42, ease: motionEase }}
                  style={{ flexBasis: 0 }}
                >
                  {/* Background image (GPU-friendly scale) */}
                  <motion.div
                    className={clsx(
                      'absolute inset-0 bg-cover bg-center will-change-transform',
                      'bg-aurum-primary-base',
                    )}
                    style={{ backgroundImage: `url(${it.image})` }}
                    animate={{ scale: isActive ? 1.06 : 1.0 }}
                    transition={{ duration: 0.42, ease: motionEase }}
                  />

                  {/* Overlay */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      backgroundColor: isActive
                        ? 'rgba(90,46,111,0.42)'
                        : 'rgba(90,46,111,0.26)',
                    }}
                    transition={{ duration: 0.42, ease: motionEase }}
                  />

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-7">
                    <motion.div
                      animate={{
                        y: isActive ? 0 : 10,
                        opacity: isActive ? 1 : 0.85,
                      }}
                      transition={{ duration: 0.36, ease: motionEase }}
                      className="text-white"
                    >
                      <div className="font-heading text-[22px] font-bold leading-tight tracking-tighter sm:text-[26px]">
                        {it.title}
                      </div>

                      <motion.button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onCta?.(it)
                        }}
                        className={clsx(
                          'mt-4 inline-flex items-center justify-center rounded-full',
                          'bg-aurum-primary-base px-6 py-3 text-[14px] font-semibold text-aurum-secondary-base',
                          'shadow-sm transition-all duration-300 ease-aurum',
                          'hover:bg-aurum-primary-light hover:shadow-md hover:scale-[1.03]',
                          'active:scale-[1.0]',
                        )}
                        initial={false}
                        animate={{
                          opacity: isActive ? 1 : 0,
                          y: isActive ? 0 : 10,
                          pointerEvents: isActive ? 'auto' : 'none',
                        }}
                        transition={{ duration: motionDur.hover, ease: motionEase }}
                      >
                        {it.ctaLabel ?? 'Conheça'}
                      </motion.button>
                    </motion.div>
                  </div>

                  {/* Subtle divider to keep “colado” feel */}
                  <div className="absolute right-0 top-0 h-full w-px bg-white/10" />
                </motion.article>
              )
            })}
          </motion.div>

          {activeItem ? <div className="mt-4" /> : null}
        </div>

        {/* Mobile / Tablet: horizontal scroll (no expansion) */}
        <div className="mt-10 md:hidden [@media(hover:none)]:block [@media(pointer:coarse)]:block">
          <div className="relative">
            <div
              ref={scrollerRef}
              className={clsx(
                'no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3',
                'scroll-px-4 overscroll-x-contain',
                '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
              )}
            >
              {safeItems.map((it, idx) => (
                <motion.div
                  key={it.title}
                  className={clsx(
                    'relative h-[360px] w-[88vw] max-w-[520px] snap-center overflow-hidden rounded-[24px]',
                    'shrink-0',
                    idx === active && 'ring-2 ring-white/25',
                  )}
                  initial={false}
                  animate={{
                    scale: idx === active ? 1 : 0.97,
                  }}
                  transition={{ duration: 0.28, ease: motionEase }}
                >
                <div
                  className={clsx(
                    'absolute inset-0 bg-cover bg-center',
                    'bg-aurum-primary-base',
                  )}
                  style={{ backgroundImage: `url(${it.image})` }}
                />
                <div className="absolute inset-0 bg-aurum-secondary-dark/30" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <motion.div
                      initial={false}
                      animate={{
                        y: idx === active ? 0 : 6,
                        opacity: idx === active ? 1 : 0.92,
                      }}
                      transition={{ duration: 0.28, ease: motionEase }}
                    >
                      <div className="font-heading text-[26px] font-bold leading-tight tracking-tighter">
                        {it.title}
                      </div>
                      <button
                        type="button"
                        className="mt-4 inline-flex items-center justify-center rounded-full bg-aurum-primary-base px-6 py-3 text-[14px] font-semibold text-aurum-secondary-base"
                        onClick={() => {
                          setActive(idx)
                          onCta?.(it)
                        }}
                      >
                        {it.ctaLabel ?? 'Conheça'}
                      </button>
                    </motion.div>
                </div>
                </motion.div>
              ))}
            </div>

            {/* Arrows (mobile) */}
            <button
              type="button"
              aria-label="Anterior"
              onClick={() => scrollToIndex(Math.max(0, active - 1))}
              className={clsx(
                'md:hidden absolute left-2 top-1/2 -translate-y-1/2',
                'h-11 w-11 rounded-full',
                'border-2 border-white/25 bg-aurum-primary-base/95 text-aurum-secondary-base',
                'shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur',
                'transition-transform duration-200 ease-aurum active:scale-95',
                active === 0 && 'pointer-events-none opacity-40',
              )}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M14.5 6L8.5 12L14.5 18"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Próximo"
              onClick={() => scrollToIndex(Math.min(safeItems.length - 1, active + 1))}
              className={clsx(
                'md:hidden absolute right-2 top-1/2 -translate-y-1/2',
                'h-11 w-11 rounded-full',
                'border-2 border-white/25 bg-aurum-primary-base/95 text-aurum-secondary-base',
                'shadow-[0_10px_24px_rgba(0,0,0,0.18)] backdrop-blur',
                'transition-transform duration-200 ease-aurum active:scale-95',
                active === safeItems.length - 1 && 'pointer-events-none opacity-40',
              )}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9.5 6L15.5 12L9.5 18"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Dots (mobile) */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {safeItems.map((it, idx) => (
              <button
                key={it.title}
                type="button"
                aria-label={`Ir para ${it.title}`}
                className={clsx(
                  'h-2.5 w-2.5 rounded-full transition-all duration-200 ease-aurum',
                  idx === active ? 'bg-white' : 'bg-white/35 hover:bg-white/55',
                )}
                onClick={() => {
                  scrollToIndex(idx)
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

