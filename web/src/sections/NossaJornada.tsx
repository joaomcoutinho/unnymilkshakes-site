import clsx from 'clsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './NossaJornada.module.css'
import { asset } from '../lib/asset'

export interface Milestone {
  id: string
  date: string // "Maio 2015"
  year: string // "2015"
  title: string
  description: string
  imageSrc: string
  imageAlt: string
}

export type NossaJornadaProps = {
  milestones?: Milestone[]
  title?: string
  subtitle?: string
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

export function NossaJornada({
  milestones,
  title = 'Nossa Jornada',
  subtitle = 'Cada loja, um novo capítulo.',
}: NossaJornadaProps) {
  const resolved = useMemo<Milestone[]>(
    () =>
      milestones ?? [
        {
          id: 'm1',
          date: 'Maio 2015',
          year: '2015',
          title: 'O Começo',
          description:
            'A UNNY Milk Shakes foi constituída em 04 de Maio de 2015, com o objetivo de produzir e comercializar milk shakes, sorvetes soft, sobremesas e derivados, vindo a se tornar uma referência no setor de alimentos. Nossa primeira loja está localizada no bairro de Jardim Piedade, Jaboatão dos Guararapes – PE.',
          imageSrc: asset('/about/jornada-1.png'),
          imageAlt: 'Milk shake artesanal da UNNY',
        },
        {
          id: 'm2',
          date: 'Novembro 2015',
          year: '2015',
          title: 'Expansão',
          description:
            'Em novembro de 2015, inauguramos nosso segundo estabelecimento no Bairro de Jaboatão Centro. Continuando nosso processo de expansão, em junho de 2016 abrimos nossa terceira loja, dessa vez localizada no Bairro de Cajueiro Seco, Jaboatão dos Guararapes – PE.',
          imageSrc: asset('/about/jornada-2.png'),
          imageAlt: 'Cliente consumindo um milk shake da UNNY',
        },
        {
          id: 'm3',
          date: 'Junho 2016',
          year: '2016',
          title: 'Consolidação',
          description:
            'Com a consolidação da marca e retorno no investimento, a quarta loja foi inaugurada em Agosto 2017 em Dom Helder, Jaboatão dos Guararapes – PE.',
          imageSrc: asset('/about/jornada-3.png'),
          imageAlt: 'Interior de uma loja da UNNY Milk Shakes',
        },
      ],
    [milestones],
  )

  const reducedMotion = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement | null>(null)
  const [fillOn, setFillOn] = useState(false)

  const [selectedId, setSelectedId] = useState<string>(resolved[0]?.id ?? '')
  const [openId, setOpenId] = useState<string>(resolved[0]?.id ?? '')
  const [contentId, setContentId] = useState<string>(resolved[0]?.id ?? '')
  const [phase, setPhase] = useState<'idle' | 'closing' | 'opening'>('idle')
  const closeTimer = useRef<number | null>(null)

  const active = resolved.find((m) => m.id === (contentId || openId || selectedId)) ?? resolved[0]

  useEffect(() => {
    // IntersectionObserver: anima o "preenchimento" da linha uma vez.
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        setFillOn(true)
        io.disconnect()
      },
      { threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    // Teclado: Esc fecha o painel ativo.
    if (!openId) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpenId('')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [openId])

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current)
    }
  }, [])

  const toggle = (id: string) => {
    setSelectedId(id)

    if (openId === id) {
      setOpenId('')
      setPhase('idle')
      return
    }

    if (!openId) {
      setOpenId(id)
      setContentId(id)
      setPhase('idle')
      return
    }

    // Transição sequencial: fecha (200ms) -> abre (300ms).
    // Mantém o painel montado para evitar "travadas" de layout (max-height).
    setPhase('closing')
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(
      () => {
        setContentId(id)
        setOpenId(id)
        setPhase('opening')
        window.setTimeout(() => setPhase('idle'), reducedMotion ? 0 : 300)
      },
      reducedMotion ? 0 : 200,
    )
  }

  const motionClass = clsx(styles.section, reducedMotion && styles.reduced)

  return (
    <section
      id="nossa-jornada"
      ref={sectionRef}
      className={clsx(
        'relative z-[1] -mt-1 overflow-hidden border-t-[3px] border-[#7b2fbe] bg-[#7b2fbe] pt-1',
        motionClass,
      )}
      aria-label="Nossa Jornada"
    >
      <div className="aurum-container py-16 sm:py-20">
        <div className="reveal text-center" data-reveal="up">
          <h2 className="font-heading text-[32px] font-extrabold leading-tight tracking-tighter text-unny-yellow sm:text-[48px]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-3 text-[16px] font-semibold text-white/70">{subtitle}</p>
          ) : null}
          <div className="mx-auto mt-5 h-[3px] w-[60px] rounded-[3px] bg-unny-yellow" />
        </div>

        <div className="mt-10">
          {/* Tablet: overflow-x auto (sem scrollbar), Desktop centralizado, Mobile vertical via CSS */}
          <div
            className={clsx('reveal mx-auto max-w-full overflow-x-auto px-1', styles.trackScroller)}
            data-reveal="up"
            data-reveal-delay="80"
            aria-label="Linha do tempo"
          >
            <div className={styles.track}>
              <div className={styles.trackLine} aria-hidden="true" />
              <div className={clsx(styles.trackFill, fillOn && styles.fillOn)} aria-hidden="true" />

              <div
                className={clsx(
                  styles.nodes,
                  'lg:min-w-0',
                )}
                role="list"
                aria-label="Marcos da história"
              >
                {resolved.map((m, idx) => {
                  const isActive = (openId || selectedId) === m.id
                  const isOpen = openId === m.id
                  return (
                    <div key={m.id} className={styles.nodeWrap} role="listitem">
                      <button
                        type="button"
                        onClick={() => toggle(m.id)}
                        aria-label={`Ver detalhes: ${m.date}`}
                        aria-expanded={isOpen}
                        className={clsx(styles.nodeBtn, isActive && styles.nodeActive)}
                      >
                        {idx + 1}
                      </button>
                      <div className={styles.nodeLabel}>{m.date}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Painel */}
          <div
            className={clsx('reveal', styles.panelOuter, openId && styles.panelOpen)}
            data-reveal="up"
            data-reveal-delay="120"
            aria-live="polite"
            role="region"
            aria-labelledby={contentId ? `milestone-title-${contentId}` : undefined}
          >
            {active ? (
              <div
                className={clsx(
                  styles.panelSwap,
                  phase === 'closing' && styles.panelClosing,
                  phase === 'opening' && styles.panelOpening,
                )}
              >
                <div className={styles.panel}>
                <div className={styles.panelMedia}>
                  <div className={styles.panelImgFrame}>
                    <div className="relative">
                      <img
                        src={active.imageSrc}
                        alt={active.imageAlt}
                        className={styles.panelImg}
                        loading="lazy"
                        decoding="async"
                        width={900}
                        height={560}
                      />
                      <span className={styles.imgBadge}>{active.date}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.panelBody}>
                  <span className={styles.badge}>{active.date}</span>
                  <h3 id={`milestone-title-${active.id}`} className={styles.title}>
                    {active.title}
                  </h3>
                  <div className={styles.rule} aria-hidden="true" />
                  <p className={styles.desc}>{active.description}</p>
                </div>
              </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

