import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotionPref } from '../lib/useReducedMotionPref'

/** Próxima seção (Borelli) — tom roxo AURUM */
const WAVE_FILL = '#7B3F97'

/** Degradê roxo → amarelo, transição suave (interpolação em oklab no lugar do mix sRGB) */
const gradientDesktop = 'linear-gradient(135deg in oklab, #7B2FBE, #FDE900)'
const gradientMobile = 'linear-gradient(180deg in oklab, #7B2FBE, #FDE900)'

function HeroDecorDesktop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[2] hidden h-full w-full select-none md:block"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Zona direita (amarela): ícones roxos — sem gráficos na zona roxa */}
      <g fill="none" opacity={0.07} stroke="#7B2FBE" strokeWidth={2}>
        <g transform="translate(980,140) rotate(15)">
          <rect x={-14} y={-24} width={28} height={36} rx={6} fill="#7B2FBE" stroke="none" />
          <line x1={10} y1={-32} x2={18} y2={-46} stroke="#7B2FBE" strokeWidth={3} strokeLinecap="round" />
        </g>
        <g transform="translate(1180,260) rotate(-8)">
          <polygon points="0,-20 8,6 -8,6" fill="#7B2FBE" stroke="none" />
        </g>
        <circle cx={1080} cy={480} r={18} />
        <g transform="translate(1260,420) rotate(22)">
          <polygon points="0,-16 5,4 -5,4" fill="#7B2FBE" stroke="none" />
        </g>
        <g transform="translate(900,380) rotate(-14)">
          <path
            d="M-20,8 Q0,-8 20,8"
            fill="none"
            stroke="#7B2FBE"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      </g>
    </svg>
  )
}

export function HeroSection({ onCta }: { onCta: () => void }) {
  const rootRef = useRef<HTMLElement | null>(null)
  const [anim, setAnim] = useState(false)
  const reducedMotion = useReducedMotionPref()
  const [parallax, setParallax] = useState(0)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setAnim(true)
          io.disconnect()
        }
      },
      { threshold: 0.04 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const el = rootRef.current
    if (!el || reducedMotion) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect()
        const vh = window.innerHeight || 1
        const center = r.top + r.height * 0.5
        const t = (center - vh * 0.5) / vh
        setParallax(Math.max(-1, Math.min(1, t)))
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [reducedMotion])

  return (
    <section
      ref={rootRef}
      data-no-auto-reveal
      className="relative isolate min-h-[100dvh] overflow-x-hidden overflow-y-visible pb-[52px] pt-[88px] md:min-h-[100vh] md:pb-[96px]"
    >
      {/* Camada 1 — apenas degradê (mascote = roxo / texto = amarelo) */}
      <div
        className={clsx('absolute inset-0 z-[1] md:hidden', anim && 'hero-bg-fade')}
        style={{ backgroundImage: gradientMobile }}
        aria-hidden
      />
      <div
        className={clsx('absolute inset-0 z-[1] hidden md:block', anim && 'hero-bg-fade')}
        style={{ backgroundImage: gradientDesktop }}
        aria-hidden
      />

      {/* Camada 3 — decor */}
      <HeroDecorDesktop />

      {/* Camada 4 — conteúdo */}
      <div className="relative z-[4] mx-auto flex w-full max-w-6xl flex-col px-6 pb-4 pt-10 md:min-h-[calc(100vh-88px)] md:flex-row md:items-stretch md:pb-8 md:pt-12 lg:pt-16">
        {/* Mascote (desktop): centralizado no meio exato da metade esquerda da viewport */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[3] hidden w-1/2 items-center justify-center overflow-visible md:flex">
          <div
            className={clsx(
              'relative flex w-full max-w-[520px] justify-center',
              anim && 'hero-anim-slide-left',
            )}
            style={reducedMotion ? undefined : { transform: `translate3d(0, ${parallax * 10}px, 0)` }}
          >
            <div className="hero-mascot-float relative z-10 w-[85%] max-w-[340px] md:ml-0 md:mr-[20px] md:w-auto md:max-w-none">
              {/* Escala a partir da base: personagem maior sem “subir” o ponto de apoio no hero */}
              <div className="origin-bottom scale-110 will-change-transform md:scale-[1.16]">
                <div
                  className="pointer-events-none absolute bottom-[30px] left-1/2 h-[22px] w-[180px] -translate-x-1/2 rounded-[50%] md:bottom-8"
                  style={{
                    background: 'rgba(74,26,140,0.25)',
                    filter: 'blur(10px)',
                  }}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute left-1/2 top-[44%] h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={
                    reducedMotion
                      ? undefined
                      : {
                          opacity: anim ? 0.18 : 0,
                          background: 'radial-gradient(circle, rgba(253,233,0,0.55), transparent 60%)',
                          filter: 'blur(10px)',
                          transform: `translate3d(-50%, -50%, 0) scale(${1 + Math.abs(parallax) * 0.08})`,
                          transition: 'opacity 600ms cubic-bezier(0.22,1,0.36,1)',
                        }
                  }
                  aria-hidden
                />
                <img
                  src="/hero/hero-mascot.png"
                  alt="Mascote UNNY"
                  className="relative mx-auto h-[min(50vh,320px)] w-auto max-w-full object-contain md:mx-0 md:mt-0 md:max-h-[min(95dvh,900px)] md:min-h-0 md:w-auto"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mascote (mobile): mantém no fluxo */}
        <div className="relative z-[2] flex min-h-[42vh] flex-[0_0_auto] items-end justify-center overflow-visible pl-0 md:hidden">
          <div
            className={clsx('relative flex w-full max-w-[420px] justify-center', anim && 'hero-anim-slide-left')}
          >
            <div className="hero-mascot-float relative z-10 w-[85%] max-w-[340px] -translate-y-3">
              <div className="origin-bottom scale-110 will-change-transform">
                <div
                  className="pointer-events-none absolute bottom-[30px] left-1/2 h-[22px] w-[180px] -translate-x-1/2 rounded-[50%]"
                  style={{
                    background: 'rgba(74,26,140,0.25)',
                    filter: 'blur(10px)',
                  }}
                  aria-hidden
                />
                <img
                  src="/hero/hero-mascot.png"
                  alt="Mascote UNNY"
                  className="relative -mt-3 mx-auto h-[min(50vh,320px)] w-auto max-w-full object-contain"
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Spacer (desktop): preserva o layout do texto à direita */}
        <div className="hidden md:block md:w-[40%] lg:w-[45%]" aria-hidden="true" />

        {/* Texto — direita ~55% */}
        <div className="relative z-[4] flex flex-1 flex-col justify-center pb-2 pt-4 text-center md:w-[60%] md:max-w-none md:pl-8 md:pt-0 md:text-left lg:w-[55%] lg:pl-14">
          <div
            className={clsx(
              'inline-flex items-center justify-center self-center rounded-full bg-[#7B2FBE] px-5 py-1.5 text-[11px] font-bold uppercase tracking-[1.5px] text-[#FFED00] opacity-0 shadow-[3px_3px_0px_rgba(74,26,140,0.4)] md:self-start',
              anim && 'hero-anim-fade-down',
            )}
            style={anim ? { animationDelay: '0.2s' } : undefined}
          >
            +55 SABORES • 300–500ML • 5 UNIDADES
          </div>

          <h1 className="mt-5 font-heading font-black leading-tight tracking-tighter">
            <span
              className={clsx(
                'block opacity-0',
                'text-[clamp(36px,5vw,58px)] text-[#7B2FBE]',
                '[text-shadow:2px_2px_0_rgba(74,26,140,0.15)]',
                anim && 'hero-anim-fade-up',
              )}
              style={anim ? { animationDelay: '0.35s' } : undefined}
            >
              OS MILKSHAKES
            </span>
            <span
              className={clsx(
                'mt-3 inline-block rounded-[12px] bg-[#7B2FBE] px-6 py-2 opacity-0 shadow-[4px_4px_0px_rgba(74,26,140,0.5)]',
                'text-[clamp(34px,4.8vw,56px)] font-black text-[#FFED00]',
                anim && 'hero-anim-fade-up',
              )}
              style={anim ? { animationDelay: '0.5s' } : undefined}
            >
              MAIS DESEJADOS
            </span>
          </h1>

          <div
            className={clsx('mt-8 flex justify-center opacity-0 md:justify-start', anim && 'hero-anim-fade-up-sub')}
            style={anim ? { animationDelay: '0.8s' } : undefined}
          >
            <button
              type="button"
              onClick={onCta}
              className={clsx(
                'hero-cta-pulse rounded-full bg-[#7B2FBE] px-[42px] py-4 text-[14px] font-bold uppercase tracking-[1px] text-[#FFED00]',
                'shadow-[5px_5px_0px_rgba(74,26,140,0.45)] transition-transform duration-200 ease-out',
                'hover:-translate-y-1 hover:scale-[1.03]',
              )}
            >
              Ver cardápio
            </button>
          </div>

          <div className="mt-8 flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-3 md:gap-5 md:overflow-visible [&::-webkit-scrollbar]:hidden">
            {[
              { k: '+55', v: 'Sabores', d: '0.9s' },
              { k: '300–500ml', v: 'Tamanhos', d: '1s' },
              { k: 'Franquia', v: 'Dados claros', d: '1.1s' },
            ].map((s) => (
              <div
                key={s.k}
                className={clsx(
                  'min-w-[200px] shrink-0 rounded-[14px] border-[1.5px] border-[rgba(255,237,0,0.3)] px-5 py-3.5 opacity-0 md:min-w-0',
                  'bg-[rgba(123,47,190,0.9)] backdrop-blur-[8px]',
                  'transition-[transform,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-[rgba(255,237,0,0.7)]',
                  anim && 'hero-anim-fade-up-sub',
                )}
                style={anim ? { animationDelay: s.d } : undefined}
              >
                <div className="font-heading text-[22px] font-black leading-tight tracking-tighter text-white">
                  {s.k}
                </div>
                <div className="mt-1 text-[11px] font-bold uppercase tracking-[1.2px] text-[#FFED00]">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Onda inferior — z acima do degradê, abaixo do conteúdo clicável em área segura */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[3] leading-none"
        aria-hidden
      >
        <svg
          className="block h-[50px] w-full md:h-[90px]"
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 C360,100 720,0 1080,50 C1260,75 1380,30 1440,50 L1440,90 L0,90 Z"
            fill={WAVE_FILL}
          />
        </svg>
      </div>
    </section>
  )
}
