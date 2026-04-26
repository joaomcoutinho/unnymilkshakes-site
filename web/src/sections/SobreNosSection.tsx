import { useEffect, useMemo, useRef, useState } from 'react'

type Metric =
  | { id: string; kind: 'numberPlus'; value: number; suffix: string; label: string; ariaLabel?: string }
  | { id: string; kind: 'number'; value: number; label: string; ariaLabel?: string }
  | { id: string; kind: 'stars'; value: number; label: string; ariaLabel?: string }

export type SobreNosSectionProps = {
  imageSrc?: string
  imageAlt?: string
  eyebrow?: string
  heading?: string
  quote?: string
  quoteAttribution?: string
  body?: string
  metrics?: Metric[]
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])
  return reduced
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function useOnceInView<T extends Element>(threshold = 0.3) {
  const ref = useRef<T | null>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // IntersectionObserver: dispara uma única vez ao entrar na viewport.
    const io = new IntersectionObserver(
      (entries) => {
        const entered = entries.some((e) => e.isIntersecting)
        if (!entered) return
        setActive(true)
        io.disconnect()
      },
      { threshold },
    )

    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return { ref, active }
}

function AnimatedMetricValue({
  metric,
  active,
  durationMs,
}: {
  metric: Metric
  active: boolean
  durationMs: number
}) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [progress, setProgress] = useState(0)
  const [rowH, setRowH] = useState(32)
  const wrapRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    if (!active) return
    if (prefersReducedMotion) {
      setProgress(1)
      return
    }

    // requestAnimationFrame: animação suave com easing-out.
    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = easeOutCubic(t)
      setProgress(eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, durationMs, metric.value, prefersReducedMotion])

  if (metric.kind === 'stars') {
    const n = Math.round(progress * metric.value)
    const clamped = Math.max(0, Math.min(metric.value, n))
    const stars = '★'.repeat(clamped)
    const rest = '★'.repeat(Math.max(0, metric.value - clamped))
    return (
      <span className="inline-flex items-center gap-1" aria-label={`${metric.value} estrelas`}>
        <span className="text-[#F5C800]">{stars}</span>
        <span className="text-[#F5C800]/35">{rest}</span>
      </span>
    )
  }

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const apply = () => setRowH(Math.max(18, Math.round(el.getBoundingClientRect().height)))
    apply()
    const ro = 'ResizeObserver' in window ? new ResizeObserver(apply) : null
    ro?.observe(el)
    window.addEventListener('resize', apply)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', apply)
    }
  }, [])

  const target = metric.value
  const current = Math.round(progress * target)
  const translateY = -(Math.min(target, Math.max(0, progress * target)) * rowH)

  return (
    <span className="relative inline-flex items-baseline tabular-nums text-[#F5C800]">
      <span className="sr-only">{current}</span>
      <span ref={wrapRef} className="relative inline-flex h-[1em] overflow-hidden leading-none">
        <span
          aria-hidden="true"
          className="flex flex-col leading-none will-change-transform"
          style={{ transform: `translateY(${translateY}px)` }}
        >
          {Array.from({ length: target + 1 }).map((_, i) => (
            <span key={i} className="flex h-[1em] items-center leading-none">
              {i}
            </span>
          ))}
        </span>
      </span>
      {metric.kind === 'numberPlus' ? <span aria-hidden="true">{metric.suffix}</span> : null}
    </span>
  )
}

export function SobreNosSection({
  imageSrc = '/about/historia-hero.png',
  imageAlt = 'Foto da loja da UNNY Milk Shakes',
  eyebrow = 'SOBRE NÓS',
  heading = 'Conheça Nossa História',
  quote = 'Cada shake é feito com ingredientes selecionados e muito carinho — desde o primeiro até o milionésimo.',
  quoteAttribution = '— Fundadores da UNNY, 2015',
  body = 'A UNNY Milk Shakes nasceu do sonho de transformar cada visita em uma experiência que vai além do sabor. Desde 2015, nossa missão é encantar clientes com milk shakes artesanais, sorvetes soft e sobremesas irresistíveis, preparados com ingredientes selecionados e muito carinho em cada detalhe. Somos uma referência no setor de alimentos em Jaboatão dos Guararapes, construída sobre a base de qualidade, atendimento e amor pelo que fazemos.',
  metrics,
}: SobreNosSectionProps) {
  const resolvedMetrics = useMemo<Metric[]>(
    () =>
      metrics ?? [
        { id: 'm1', kind: 'numberPlus', value: 10, suffix: '+', label: 'anos de história' },
        { id: 'm2', kind: 'number', value: 5, label: 'unidades abertas' },
        { id: 'm4', kind: 'stars', value: 5, label: 'avaliação dos clientes' },
      ],
    [metrics],
  )

  const { ref: metricsRef, active } = useOnceInView<HTMLDivElement>(0.3)

  return (
    <div className="relative overflow-hidden bg-aurum-primary-base">
      <div className="aurum-container relative py-14 sm:py-16 lg:py-20">
        {/* Sub-componente 1 — métricas */}
        <div ref={metricsRef}>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {resolvedMetrics.map((m, idx) => {
              const isOddLast = resolvedMetrics.length % 2 === 1 && idx === resolvedMetrics.length - 1
              return (
              <article
                key={m.id}
                className={[
                  isOddLast ? 'col-span-2' : 'col-span-1',
                  'lg:col-span-1',
                  'reveal group flex min-h-[88px] flex-col justify-center rounded-[18px] bg-unny-purple px-5 py-5',
                  'shadow-[0_10px_30px_rgba(123,47,190,0.20)]',
                  'transition-transform duration-200 ease-out will-change-transform',
                  '[@media(hover:hover)]:hover:translate-y-[-4px] [@media(hover:hover)]:hover:scale-[1.02] [@media(hover:hover)]:hover:rotate-[-0.6deg]',
                  'motion-reduce:transition-none motion-reduce:hover:transform-none',
                  active && 'anim-fade-up',
                ].join(' ')}
                data-reveal="up"
                aria-label={m.ariaLabel ?? m.label}
                style={{ animationDelay: active ? `${idx * 0.08}s` : undefined }}
              >
                <div className="text-[28px] font-extrabold leading-none sm:text-[32px]" aria-live="polite" aria-atomic="true">
                  <AnimatedMetricValue metric={m} active={active} durationMs={1800} />
                </div>
                {m.label ? (
                  <div className="mt-2 inline-flex w-fit items-center gap-2">
                    <span
                      className={[
                        'text-[13px] font-semibold leading-snug tracking-tight',
                        'text-[rgba(245,200,0,0.75)] transition-all duration-200 ease-out',
                        '[@media(hover:hover)]:group-hover:text-[rgba(245,200,0,0.92)] [@media(hover:hover)]:group-hover:translate-y-[-1px]',
                        'motion-reduce:transition-none',
                      ].join(' ')}
                    >
                      {m.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className={[
                        'h-[2px] w-0 rounded-full bg-[rgba(245,200,0,0.75)]',
                        'transition-all duration-200 ease-out',
                        '[@media(hover:hover)]:group-hover:w-6 [@media(hover:hover)]:group-hover:bg-[rgba(245,200,0,0.92)]',
                        'motion-reduce:transition-none',
                      ].join(' ')}
                    />
                  </div>
                ) : null}
              </article>
              )
            })}
          </div>
        </div>

        {/* Sub-componente 2 — pull quote + foto */}
        <div className="mt-10 grid items-start gap-8 lg:mt-12 lg:grid-cols-12 lg:gap-10">
          <div
            className="reveal mx-auto w-full max-w-[560px] px-2 text-center lg:col-span-6 lg:max-w-none lg:px-0 lg:text-left"
            data-reveal="left"
          >
            <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-unny-purple">{eyebrow}</div>
            <h2 className="mt-3 text-[34px] font-bold leading-tight tracking-tight text-unny-purple sm:text-[38px]">
              {heading}
            </h2>

            <blockquote className="mt-6 rounded-[14px] border-l-[4px] border-l-unny-purple bg-unny-purple/10 px-5 py-4 text-unny-purple">
              <p className="text-[16px] italic leading-relaxed">{quote}</p>
              <footer className="mt-2 text-[12px] font-semibold text-unny-purple/65">{quoteAttribution}</footer>
            </blockquote>

            <p className="mt-6 max-w-xl text-[15px] leading-[1.85] text-unny-purple/90 sm:text-[16px]">{body}</p>
          </div>

          <figure
            className="reveal mx-auto w-full max-w-[560px] px-2 lg:col-span-6 lg:max-w-none lg:px-0"
            data-reveal="right"
            data-reveal-delay="80"
          >
            <div className="relative overflow-hidden rounded-[16px] border-2 border-unny-purple/30 bg-white/20">
              <img
                src={imageSrc}
                alt={imageAlt}
                className="h-[320px] w-full object-cover object-center sm:h-[420px]"
                loading="lazy"
                decoding="async"
              />
              <figcaption className="sr-only">{imageAlt}</figcaption>

              <div className="pointer-events-none absolute bottom-4 left-4">
                <span className="inline-flex items-center rounded-full bg-unny-purple px-4 py-2 text-[12px] font-extrabold tracking-tight text-[#F5C800]">
                  Desde 2015 ✦
                </span>
              </div>
            </div>
          </figure>
        </div>
      </div>
    </div>
  )
}

