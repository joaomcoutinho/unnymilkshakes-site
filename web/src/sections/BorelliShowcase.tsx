import { useMemo, useState } from 'react'
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
        <div className="mt-10 hidden md:block">
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
        <div className="mt-10 md:hidden">
          <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3">
            {safeItems.map((it) => (
              <div
                key={it.title}
                className="relative h-[360px] w-[88vw] max-w-[520px] snap-start overflow-hidden rounded-[24px]"
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
                  <div className="font-heading text-[26px] font-bold leading-tight tracking-tighter">
                    {it.title}
                  </div>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-aurum-primary-base px-6 py-3 text-[14px] font-semibold text-aurum-secondary-base"
                    onClick={() => onCta?.(it)}
                  >
                    {it.ctaLabel ?? 'Conheça'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

