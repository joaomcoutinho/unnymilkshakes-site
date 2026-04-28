import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import { Button } from './components/Button'
import { WaveDivider } from './components/WaveDivider'
import { scrollToId } from './lib/scroll'
import { BorelliShowcase } from './sections/BorelliShowcase'
import { HeroSection } from './sections/HeroSection'
import { AboutUsSection } from './sections/AboutUsSection'
import { MenuSection } from './sections/MenuSection'
import { borelliShowcaseItems, contact, franchise, stores } from './sections/data'
import { TiltCard } from './components/TiltCard'
import { asset } from './lib/asset'

function useOnceInView<T extends Element>(threshold = 0.2) {
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

function App() {
  const logoSrc = asset('/brand/unny-logo.png')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { ref: storesGridRef, inView: storesInView } = useOnceInView<HTMLDivElement>(0.2)

  // NOTE: We intentionally do NOT initialize Lenis on mount.
  // On some mobile browsers it can interfere with native scrolling.
  // Lenis is only created lazily when we need programmatic scroll.

  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [mobileMenuOpen])

  useEffect(() => {
    let io: IntersectionObserver | null = null
    let raf1 = 0
    let raf2 = 0

    const run = () => {
      // Global scroll reveal: adiciona .reveal-on uma vez por elemento
      // 1) Auto-tag de textos semânticos (para não precisar marcar manualmente)
      const sectionCounters = new Map<Element, number>()
      const textEls = Array.from(
        document.querySelectorAll<HTMLElement>('main h1, main h2, main h3, main h4, main p, main li'),
      )
      for (const el of textEls) {
        if (el.closest('[data-no-auto-reveal]')) continue
        if (el.dataset.reveal) continue
        // Evita animar textos dentro de botões/links (já têm microinterações próprias)
        if (el.closest('a, button')) continue
        el.classList.add('reveal')
        el.dataset.reveal = 'up'
        const group = el.closest('section') ?? el.parentElement ?? document.body
        const i = sectionCounters.get(group) ?? 0
        sectionCounters.set(group, i + 1)
        const delay = Math.min(360, i * 80)
        if (delay) el.dataset.revealDelay = String(delay)
      }

      // 2) Observa todos os elementos marcados para reveal
      const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
      if (!els.length) return
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue
            const el = e.target as HTMLElement
            const d = el.dataset.revealDelay
            if (d) el.style.setProperty('--reveal-delay', `${Number(d)}ms`)
            el.classList.add('reveal-on')
            io?.unobserve(el)
          }
        },
        { threshold: 0.18 },
      )

      // Para elementos já visíveis na viewport no momento do tagging, aplica
      // `.reveal-on` SINCRONAMENTE (no mesmo frame em que `.reveal` foi aplicada),
      // evitando o flicker de 520ms da transição translateY(18px) -> translateY(0)
      // que acontece quando o IntersectionObserver fira assíncrono no próximo tick.
      const vh = window.innerHeight || document.documentElement.clientHeight || 0
      for (const el of els) {
        const rect = el.getBoundingClientRect()
        const isAlreadyInViewport = rect.top < vh && rect.bottom > 0
        if (isAlreadyInViewport) {
          el.classList.add('reveal-on')
        } else {
          io.observe(el)
        }
      }
    }

    // Dois rAF: corre após layout/paint do React, mas muito antes do idle (que podia
    // disparar a meio do primeiro scroll e bloquear o main thread com o tagging reveal).
    raf1 = window.requestAnimationFrame(() => {
      raf1 = 0
      raf2 = window.requestAnimationFrame(() => {
        raf2 = 0
        run()
      })
    })

    return () => {
      if (raf1) window.cancelAnimationFrame(raf1)
      if (raf2) window.cancelAnimationFrame(raf2)
      io?.disconnect()
    }
  }, [])

  const nav = useMemo(
    () => [
      { id: 'sobre-nos', label: 'Sobre nós' },
      { id: 'cardapio', label: 'Cardápio' },
      { id: 'lojas', label: 'Lojas' },
      { id: 'franquia', label: 'Franquia' },
      { id: 'contato', label: 'Contato' },
    ],
    [],
  )

  const go = async (id: string) => {
    await scrollToId(id)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER — floating dock (modern, bold, on-brand) */}
      <header className="fixed inset-x-0 top-3 z-50 bg-transparent">
        <div className="aurum-container relative flex h-[88px] items-center">
          {/* Floating capsule */}
          <div
            className={clsx(
              'relative flex w-full items-center gap-3 rounded-full px-3 py-2 sm:px-4',
              'border-2 border-aurum-secondary-base/80 bg-aurum-primary-base/90 backdrop-blur',
              !mobileMenuOpen && 'shadow-[0_16px_40px_rgba(0,0,0,0.12)]',
            )}
            style={mobileMenuOpen ? { boxShadow: 'none' } : undefined}
          >


            <button
              type="button"
              onClick={() => go('topo')}
              className={clsx(
                'relative z-[50] flex min-h-[44px] items-center gap-3 rounded-full px-2 py-2 text-left',
                'transition-transform duration-300 ease-aurum hover:scale-[1.02]',
              )}
            >
              <img
                src={logoSrc}
                alt="UNNY Milk Shakes"
                className={clsx(
                  'h-12 w-auto object-contain sm:h-14',
                  mobileMenuOpen
                    ? 'max-md:drop-shadow-none'
                    : 'drop-shadow-[0_14px_26px_rgba(123,63,151,0.18)]',
                )}
                loading="eager"
                decoding="async"
              />
            </button>

            <nav className="relative z-[50] ml-auto hidden items-center gap-1 md:flex">
              {nav.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => go(n.id)}
                  className={clsx(
                    'group relative min-h-[48px] overflow-hidden rounded-full px-5 text-[15px] font-semibold',
                    'border-2 border-transparent',
                    'text-aurum-secondary-base transition-all duration-300 ease-aurum',
                    'hover:border-aurum-secondary-base hover:bg-aurum-secondary-base hover:text-aurum-primary-base',
                  )}
                >
                  <span className="relative z-10">{n.label}</span>
                  <span
                    className={clsx(
                      'pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ease-aurum',
                      'group-hover:opacity-100',
                    )}
                    style={{
                      background:
                        'linear-gradient(120deg, rgba(255,237,0,0) 0%, rgba(255,237,0,0.18) 45%, rgba(255,237,0,0) 100%)',
                    }}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </nav>

            <div className="relative z-[50] ml-auto flex items-center gap-2 md:ml-3">
              <button
                type="button"
                onClick={() => go('lojas')}
                className={clsx(
                  'inline-flex min-h-[48px] items-center justify-center rounded-full px-5',
                  'bg-aurum-secondary-base text-aurum-primary-base',
                  'text-[14px] font-bold uppercase tracking-[0.12em]',
                  'cta-shine transition-all duration-300 ease-aurum hover:-translate-y-0.5',
                  mobileMenuOpen
                    ? 'max-md:shadow-none'
                    : 'shadow-[0_10px_22px_rgba(123,63,151,0.25)] hover:shadow-[0_16px_32px_rgba(123,63,151,0.32)]',
                )}
              >
                <img
                  src={asset('/brand/ifood-logo.png')}
                  alt=""
                  className="mr-2 h-6 w-auto object-contain sm:h-7"
                  loading="eager"
                  decoding="async"
                />
                Peça agora
              </button>

              {/* Mobile menu button (right side) */}
              <button
                type="button"
                className={clsx(
                  'md:hidden',
                  'inline-flex min-h-[48px] items-center justify-center rounded-full px-4',
                  'border-2 border-aurum-secondary-base/30 bg-white/40 text-aurum-secondary-base backdrop-blur',
                  'transition-all duration-300 ease-aurum hover:bg-white/55',
                  'focus-visible:ring-2 focus-visible:ring-aurum-secondary-base/40',
                )}
                aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-header-menu"
                onClick={() => setMobileMenuOpen((v) => !v)}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {mobileMenuOpen ? (
                    <>
                      <path
                        d="M6 6L18 18"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </>
                  ) : (
                    <>
                      <path
                        d="M4 7H20"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M4 12H20"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M4 17H20"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </>
                  )}
                </svg>
              </button>
            </div>

            {/* Mobile dropdown — sem overlay full-screen (evita escurecimento sobre o header). Fechar: ícone ou item. */}
            {mobileMenuOpen ? (
              <div
                id="mobile-header-menu"
                className={clsx(
                  'md:hidden absolute left-0 right-0 top-[calc(100%+10px)] z-[55]',
                  'rounded-[22px] border-2 border-aurum-secondary-base/40 bg-aurum-primary-base/95 backdrop-blur',
                  'overflow-hidden',
                )}
                role="menu"
              >
                <div className="px-3 py-3">
                  <div className="grid gap-2">
                    {nav.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        role="menuitem"
                        className={clsx(
                          'w-full rounded-[16px] px-4 py-3 text-left font-semibold',
                          'text-aurum-secondary-base',
                          'border-2 border-aurum-secondary-base/15 bg-white/35',
                          'transition-all duration-300 ease-aurum',
                          'hover:bg-white/55 hover:border-aurum-secondary-base/30',
                          'focus-visible:ring-2 focus-visible:ring-aurum-secondary-base/40',
                        )}
                        onClick={async () => {
                          setMobileMenuOpen(false)
                          await go(n.id)
                        }}
                      >
                        {n.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main id="topo" className="pt-0">
        <HeroSection onCta={() => go('cardapio')} />

        <div id="conheca-produtos">
          <BorelliShowcase
            title="Conheça nossos produtos"
            highlight="artesanais"
            items={borelliShowcaseItems}
            onCta={() => go('cardapio')}
          />
        </div>

        <WaveDivider from="#7B2FBE" to="#FFED00" />

        <AboutUsSection />

        {/* MENU (new dark grid) */}
        {/* Transition: Nossa Jornada (purple) -> Cardápio (yellow) */}
        <WaveDivider from="#7B2FBE" to="#FFED00" />
        <MenuSection />

        {/* STORES */}
        {/* Overlap the wave into the next section to kill the 1px seam */}
        <WaveDivider from="#FFED00" to="#FFFFFF" className="-mb-[6px]" />
        <section
          id="lojas"
          className="relative z-[1] -mt-1 border-t-[3px] border-[#ffffff] bg-[#ffffff] pt-1"
        >
          <div className="aurum-container py-16 sm:py-20">
            <div className="reveal" data-reveal="up">
              <h2 className="font-heading text-[32px] font-bold leading-tight tracking-tighter text-aurum-secondary-base sm:text-[40px]">
                Lojas
              </h2>
              <p className="mt-2 text-[16px] leading-[1.6] text-aurum-text-muted">
                Unidades próprias, com horários claros e contato rápido.
              </p>
            </div>

            <div ref={storesGridRef} className="mt-8 grid gap-4 md:grid-cols-2">
              {stores.map((s, idx) => (
                <TiltCard
                  key={s.name}
                  className={clsx(
                    'reveal group',
                    'flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] p-6',
                    'border-[2.5px] border-unny-yellow bg-[#4A2480] text-white',
                    'shadow-[5px_5px_0px_#FFED00] max-md:shadow-[3px_3px_0px_#FFED00]',
                    'transition-[box-shadow] duration-[250ms] ease-in-out',
                    'hover:shadow-[8px_8px_0px_#FFED00]',
                  )}
                  strength={8}
                  glare
                  data-reveal="up"
                  data-reveal-delay={String(idx * 90)}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.14]"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 10px 10px, rgba(255,237,0,0.38) 1.2px, transparent 1.2px)',
                      backgroundSize: '22px 22px',
                    }}
                    aria-hidden="true"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(255,237,0,0.10)] via-transparent to-transparent" />

                  <div className="relative font-heading text-[24px] font-bold leading-tight tracking-tighter text-aurum-primary-base">
                    {s.name}
                  </div>
                  <div className="mt-2 text-[16px] leading-[1.6] text-white/90">{s.address}</div>
                  <div className="mt-2 text-[14px] font-semibold text-white/85">
                    Telefone: <span className="font-body font-medium">{s.phone}</span>
                  </div>
                  <ul className="mt-4 space-y-2 text-[14px] text-white/80">
                    {s.hours.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>

                  <div className="mt-auto flex justify-center pt-8">
                    <div className="flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          s.address,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className={clsx(
                          'inline-flex min-h-[44px] w-full items-center justify-center rounded-full px-5 sm:w-auto',
                          'border-2 border-aurum-secondary-base bg-aurum-primary-base',
                          'text-[14px] font-semibold uppercase tracking-[0.12em] text-aurum-secondary-base',
                          'cta-shine transition-all duration-300 ease-aurum hover:bg-aurum-secondary-base hover:text-aurum-primary-base',
                        )}
                      >
                        Ver no Google Maps
                      </a>

                      {s.ifoodUrl ? (
                        <a
                          href={s.ifoodUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={clsx(
                            'group/ifood inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-5 sm:w-auto',
                            'border-2 border-aurum-secondary-base bg-aurum-primary-base',
                            'text-[14px] font-semibold uppercase tracking-[0.12em] text-aurum-secondary-base',
                            'cta-shine transition-all duration-300 ease-aurum hover:bg-aurum-secondary-base hover:text-aurum-primary-base',
                          )}
                        >
                          <span className="relative h-5 w-[34px]">
                            {/* base (bg amarelo): logo roxa */}
                            <img
                              src={asset('/brand/ifood-logo-purple.png')}
                              alt=""
                              className="absolute inset-0 h-5 w-auto object-contain opacity-100 transition-opacity duration-200 ease-aurum group-hover/ifood:opacity-0"
                              loading="lazy"
                              decoding="async"
                            />
                            {/* hover (bg roxo): logo amarela */}
                            <img
                              src={asset('/brand/ifood-logo.png')}
                              alt=""
                              className="absolute inset-0 h-5 w-auto object-contain opacity-0 transition-opacity duration-200 ease-aurum group-hover/ifood:opacity-100"
                              loading="lazy"
                              decoding="async"
                            />
                          </span>
                          Fazer pedido
                        </a>
                      ) : null}
                    </div>
                  </div>
                </TiltCard>
              ))}

              {/* filler card to avoid empty grid slot */}
              <div
                className={clsx(
                  'reveal',
                  'group relative flex h-full min-h-0 flex-col overflow-hidden rounded-[20px] p-6',
                  'border-[2.5px] border-unny-purple bg-aurum-primary-base text-unny-purple',
                  'shadow-[5px_5px_0px_#7B2FBE] max-md:shadow-[3px_3px_0px_#7B2FBE]',
                  'transition-all duration-[250ms] ease-in-out',
                  'hover:translate-y-[-4px] hover:rotate-[1deg] hover:shadow-[8px_8px_0px_#7B2FBE]',
                  storesInView && 'anim-fade-up',
                )}
                data-reveal="up"
                style={{ animationDelay: storesInView ? `${stores.length * 0.08}s` : undefined }}
                aria-label="Suporte e SAC"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 10px 10px, rgba(123,47,190,0.32) 1.2px, transparent 1.2px)',
                    backgroundSize: '22px 22px',
                  }}
                  aria-hidden="true"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(123,47,190,0.10)] via-transparent to-transparent" />

                <div className="relative">
                  <div className="inline-flex items-center rounded-full bg-unny-purple px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-aurum-primary-base">
                    Suporte / SAC
                  </div>

                  <div className="mt-5 text-[18px] font-extrabold leading-snug tracking-tight text-unny-purple">
                    Dúvidas ou sugestões?
                  </div>
                  <div className="mt-1 text-[15px] font-semibold leading-relaxed text-unny-purple/85">
                    Fale conosco via WhatsApp
                  </div>
                </div>

                <div className="mt-auto pt-8">
                  <a
                    href="https://wa.me/5581992621221"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Abrir WhatsApp do suporte"
                    className={clsx(
                      'inline-flex min-h-[44px] w-full items-center justify-center rounded-full px-6',
                      'bg-unny-purple text-aurum-primary-base',
                      'text-[14px] font-bold uppercase tracking-[0.12em]',
                      'shadow-[0_12px_26px_rgba(123,47,190,0.30)]',
                      'cta-shine transition-all duration-300 ease-aurum hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(123,47,190,0.38)]',
                    )}
                  >
                    <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5" aria-hidden="true">
                      <path
                        fill="currentColor"
                        d="M12.05 2C6.5 2 2 6.3 2 11.6c0 2 .6 3.9 1.8 5.5L3 22l5.1-1.7a10.6 10.6 0 0 0 3.9.8c5.6 0 10.1-4.3 10.1-9.6C22.1 6.3 17.6 2 12 2h.05Zm0 17.4c-1.3 0-2.7-.3-3.8-.9l-.3-.1-3 .9.9-2.8-.2-.3a7.6 7.6 0 0 1-1.6-4.6c0-4.4 3.8-7.9 8.1-7.9 4.3 0 8.1 3.5 8.1 7.9 0 4.4-3.8 7.9-8.1 7.9Zm4.6-5.5c-.2-.1-1.2-.6-1.4-.7-.2-.1-.4-.1-.6.1-.2.2-.7.7-.9.9-.2.2-.3.2-.6.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.9-.2-.3 0-.5.1-.6l.4-.4c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.8-.9 2s.9 2.4 1 2.5c.1.1 1.8 2.7 4.4 3.8.6.3 1.1.5 1.5.6.6.2 1.1.2 1.5.1.5-.1 1.2-.5 1.4-1 .2-.5.2-1 0-1.1-.1-.1-.3-.2-.5-.3Z"
                      />
                    </svg>
                    Chamar no WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FRANCHISE (purple with wave + CTA contrast) */}
        <WaveDivider from="#FFFFFF" to="#7B2FBE" />
        <section
          id="franquia"
          className="relative z-[1] -mt-1 overflow-hidden border-t-[3px] border-[#7b2fbe] bg-[#7b2fbe] pt-1"
        >
          <div className="aurum-container py-16 sm:py-20">
            <div className="grid gap-10 md:grid-cols-12">
              <div
                className="reveal md:col-span-6 text-center md:text-left"
                data-reveal="left"
              >
                <h2 className="font-heading text-[32px] font-bold leading-tight tracking-tighter text-aurum-primary-base sm:text-[40px]">
                  {franchise.title}
                </h2>
                <div className="mx-auto mt-5 h-[3px] w-[56px] rounded-[3px] bg-aurum-primary-base md:mx-0" />
                <p className="mx-auto mt-4 max-w-[58ch] text-[16px] leading-[1.75] text-white/85 md:mx-0">
                  {franchise.lead}
                </p>
                <p className="mx-auto mt-4 max-w-[58ch] text-[16px] leading-[1.75] text-white/85 md:mx-0">
                  {franchise.body}
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="max-md:px-7 max-md:py-3.5"
                    onClick={() => go('contato')}
                  >
                    {franchise.cta}
                  </Button>
                </div>
              </div>

              <div
                className="reveal md:col-span-6 mx-auto w-full max-w-[600px] md:max-w-none"
                data-reveal="right"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    { k: 'Taxa de franquia', v: franchise.fee },
                    { k: 'Royalties', v: franchise.royalty },
                    { k: 'Investimento médio', v: franchise.investment },
                    { k: 'Prazo de retorno', v: franchise.payback },
                  ].map((x) => (
                    <div
                      key={x.k}
                      className="group flex flex-col items-center justify-center rounded-aurum bg-white/10 p-5 text-center backdrop-blur transition-transform duration-200 ease-out hover:-translate-y-1 hover:scale-[1.01] md:items-start md:text-left"
                    >
                      <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
                        {x.k}
                      </div>
                      <div className="mt-2 font-display text-[22px] tracking-tighter2 text-aurum-primary-base">
                        {x.v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <WaveDivider from="#7B2FBE" to="#FFFFFF" />
        <section id="contato" className="relative z-[1] -mt-[2px] bg-white pt-[2px]">
          <div className="aurum-container py-16 sm:py-20">
            <div className="grid gap-10 md:grid-cols-12">
              <div className="reveal md:col-span-5" data-reveal="left">
                <h2 className="font-heading text-[32px] font-bold leading-tight tracking-tighter text-aurum-secondary-base sm:text-[40px]">
                  Contato
                </h2>
                <p className="mt-3 text-[16px] leading-[1.6] text-aurum-text-muted">
                  Para pedidos, dúvidas sobre produtos, unidades ou franquias: fale com a UNNY e receba um retorno.
                </p>
              </div>
              <div className="reveal md:col-span-7" data-reveal="right" data-reveal-delay="80">
                <div className="rounded-aurum border border-black/5 bg-aurum-surface-light p-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-aurum-text-muted">
                        Telefones
                      </div>
                      <ul className="mt-2 space-y-2 text-[16px] font-semibold text-aurum-secondary-base">
                        {contact.phones.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-aurum-text-muted">
                        E-mail
                      </div>
                      <div className="mt-2 text-[16px] font-semibold text-aurum-secondary-base">
                        {contact.email}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-aurum-text-muted">
                      Endereço
                    </div>
                    <div className="mt-2 text-[16px] leading-[1.6] text-aurum-text-primary">
                      {contact.address}
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-aurum-text-muted">
                      Redes e atalhos
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <a
                        href="https://x.com/unnymilkshakes"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Abrir X (Twitter) da UNNY"
                        className={clsx(
                          'inline-flex h-12 w-12 items-center justify-center rounded-full',
                          'border-2 border-aurum-secondary-base bg-aurum-primary-base',
                          'text-aurum-secondary-base transition-all duration-300 ease-aurum',
                          'hover:-translate-y-0.5 hover:bg-aurum-secondary-base hover:text-aurum-primary-base',
                          'hover-lift soft-ring',
                        )}
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M18.9 2H22l-6.8 7.8L23.2 22h-6.5l-5.1-6.5L6 22H2.9l7.4-8.5L.8 2h6.7l4.6 5.9L18.9 2Zm-1.1 18h1.7L6.6 3.9H4.8L17.8 20Z"
                          />
                        </svg>
                      </a>

                      <a
                        href="https://www.instagram.com/unnymilkshakes/"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Abrir Instagram da UNNY"
                        className={clsx(
                          'inline-flex h-12 w-12 items-center justify-center rounded-full',
                          'border-2 border-aurum-secondary-base bg-aurum-primary-base',
                          'text-aurum-secondary-base transition-all duration-300 ease-aurum',
                          'hover:-translate-y-0.5 hover:bg-aurum-secondary-base hover:text-aurum-primary-base',
                          'hover-lift soft-ring',
                        )}
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4A5.8 5.8 0 0 1 16.2 22H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4A3.8 3.8 0 0 0 20 16.2V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm10.1 1.6a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
                          />
                        </svg>
                      </a>

                      <a
                        href="https://wa.me/5581992621221"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Abrir WhatsApp da UNNY"
                        className={clsx(
                          'inline-flex h-12 w-12 items-center justify-center rounded-full',
                          'border-2 border-aurum-secondary-base bg-aurum-primary-base',
                          'text-aurum-secondary-base transition-all duration-300 ease-aurum',
                          'hover:-translate-y-0.5 hover:bg-aurum-secondary-base hover:text-aurum-primary-base',
                          'hover-lift soft-ring',
                        )}
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M12.05 2C6.5 2 2 6.3 2 11.6c0 2 .6 3.9 1.8 5.5L3 22l5.1-1.7a10.6 10.6 0 0 0 3.9.8c5.6 0 10.1-4.3 10.1-9.6C22.1 6.3 17.6 2 12 2h.05Zm0 17.4c-1.3 0-2.7-.3-3.8-.9l-.3-.1-3 .9.9-2.8-.2-.3a7.6 7.6 0 0 1-1.6-4.6c0-4.4 3.8-7.9 8.1-7.9 4.3 0 8.1 3.5 8.1 7.9 0 4.4-3.8 7.9-8.1 7.9Zm4.6-5.5c-.2-.1-1.2-.6-1.4-.7-.2-.1-.4-.1-.6.1-.2.2-.7.7-.9.9-.2.2-.3.2-.6.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.9-.2-.3 0-.5.1-.6l.4-.4c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.8-.9 2s.9 2.4 1 2.5c.1.1 1.8 2.7 4.4 3.8.6.3 1.1.5 1.5.6.6.2 1.1.2 1.5.1.5-.1 1.2-.5 1.4-1 .2-.5.2-1 0-1.1-.1-.1-.3-.2-.5-.3Z"
                          />
                        </svg>
                      </a>

                      <a
                        href="tel:+558130942112"
                        aria-label="Ligar para a UNNY"
                        className={clsx(
                          'inline-flex h-12 w-12 items-center justify-center rounded-full',
                          'border-2 border-aurum-secondary-base bg-aurum-primary-base',
                          'text-aurum-secondary-base transition-all duration-300 ease-aurum',
                          'hover:-translate-y-0.5 hover:bg-aurum-secondary-base hover:text-aurum-primary-base',
                          'hover-lift soft-ring',
                        )}
                      >
                        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M6.6 10.8c1.5 2.9 3.8 5.2 6.7 6.7l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.4.7 3.7.7.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.1 21 3 13.9 3 5c0-.6.4-1 1-1h3.6c.6 0 1 .4 1 1 0 1.3.2 2.5.7 3.7.1.4 0 .8-.2 1.1l-2.5 2.5Z"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Button size="lg" variant="primary" onClick={() => go('cardapio')}>
                      Ver cardápio
                    </Button>
                    <Button size="lg" variant="secondary" onClick={() => go('lojas')}>
                      Ver lojas
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-black/10 bg-aurum-primary-base">
          <div className="aurum-container py-16">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div className="reveal" data-reveal="left">
                <img
                  src={logoSrc}
                  alt="UNNY"
                  className="h-14 w-auto object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="reveal flex flex-wrap items-center gap-3" data-reveal="right" data-reveal-delay="80">
                <a
                  href="https://x.com/unnymilkshakes"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Abrir X (Twitter) da UNNY"
                  className={clsx(
                    'inline-flex h-12 w-12 items-center justify-center rounded-full',
                    'border-2 border-aurum-secondary-base bg-transparent',
                    'text-aurum-secondary-base transition-all duration-300 ease-aurum',
                    'hover:-translate-y-0.5 hover:bg-aurum-secondary-base hover:text-aurum-primary-base',
                    'hover-lift soft-ring',
                  )}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M18.9 2H22l-6.8 7.8L23.2 22h-6.5l-5.1-6.5L6 22H2.9l7.4-8.5L.8 2h6.7l4.6 5.9L18.9 2Zm-1.1 18h1.7L6.6 3.9H4.8L17.8 20Z"
                    />
                  </svg>
                </a>

                <a
                  href="https://www.instagram.com/unnymilkshakes/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Abrir Instagram da UNNY"
                  className={clsx(
                    'inline-flex h-12 w-12 items-center justify-center rounded-full',
                    'border-2 border-aurum-secondary-base bg-transparent',
                    'text-aurum-secondary-base transition-all duration-300 ease-aurum',
                    'hover:-translate-y-0.5 hover:bg-aurum-secondary-base hover:text-aurum-primary-base',
                    'hover-lift soft-ring',
                  )}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4A5.8 5.8 0 0 1 16.2 22H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4A3.8 3.8 0 0 0 20 16.2V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm10.1 1.6a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
                    />
                  </svg>
                </a>

                <a
                  href="https://wa.me/5581992621221"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Abrir WhatsApp da UNNY"
                  className={clsx(
                    'inline-flex h-12 w-12 items-center justify-center rounded-full',
                    'border-2 border-aurum-secondary-base bg-transparent',
                    'text-aurum-secondary-base transition-all duration-300 ease-aurum',
                    'hover:-translate-y-0.5 hover:bg-aurum-secondary-base hover:text-aurum-primary-base',
                    'hover-lift soft-ring',
                  )}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M12.05 2C6.5 2 2 6.3 2 11.6c0 2 .6 3.9 1.8 5.5L3 22l5.1-1.7a10.6 10.6 0 0 0 3.9.8c5.6 0 10.1-4.3 10.1-9.6C22.1 6.3 17.6 2 12 2h.05Zm0 17.4c-1.3 0-2.7-.3-3.8-.9l-.3-.1-3 .9.9-2.8-.2-.3a7.6 7.6 0 0 1-1.6-4.6c0-4.4 3.8-7.9 8.1-7.9 4.3 0 8.1 3.5 8.1 7.9 0 4.4-3.8 7.9-8.1 7.9Zm4.6-5.5c-.2-.1-1.2-.6-1.4-.7-.2-.1-.4-.1-.6.1-.2.2-.7.7-.9.9-.2.2-.3.2-.6.1-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.9-.2-.3 0-.5.1-.6l.4-.4c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.8-.9 2s.9 2.4 1 2.5c.1.1 1.8 2.7 4.4 3.8.6.3 1.1.5 1.5.6.6.2 1.1.2 1.5.1.5-.1 1.2-.5 1.4-1 .2-.5.2-1 0-1.1-.1-.1-.3-.2-.5-.3Z"
                    />
                  </svg>
                </a>

                <a
                  href="tel:+558130942112"
                  aria-label="Ligar para a UNNY"
                  className={clsx(
                    'inline-flex h-12 w-12 items-center justify-center rounded-full',
                    'border-2 border-aurum-secondary-base bg-transparent',
                    'text-aurum-secondary-base transition-all duration-300 ease-aurum',
                    'hover:-translate-y-0.5 hover:bg-aurum-secondary-base hover:text-aurum-primary-base',
                    'hover-lift soft-ring',
                  )}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M6.6 10.8c1.5 2.9 3.8 5.2 6.7 6.7l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.4.7 3.7.7.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.1 21 3 13.9 3 5c0-.6.4-1 1-1h3.6c.6 0 1 .4 1 1 0 1.3.2 2.5.7 3.7.1.4 0 .8-.2 1.1l-2.5 2.5Z"
                    />
                  </svg>
                </a>
              </div>
              <div className="reveal flex flex-wrap gap-2" data-reveal="up" data-reveal-delay="120">
                {nav.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => go(n.id)}
                    className="min-h-[44px] rounded-full px-4 text-[14px] font-semibold text-aurum-secondary-base transition-colors duration-300 ease-aurum hover:bg-aurum-secondary-base/10 hover:text-aurum-secondary-dark"
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
