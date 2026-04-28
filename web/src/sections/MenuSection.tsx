import { AnimatePresence, motion } from 'framer-motion'
import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { asset } from '../lib/asset'

type FilterId = 'Todos' | 'Shakes' | 'Sorvetes' | 'Sobremesas' | 'Diet/Zero'

type MenuItem = {
  title: string
  badge: string
  lines: string[]
  imageQuery: string
  imageSrc?: string
  filter: Exclude<FilterId, 'Todos'>
  flipText: string
  featured?: boolean
}

const FILTERS: FilterId[] = ['Todos', 'Shakes', 'Sorvetes', 'Sobremesas', 'Diet/Zero']

const ease = [0.4, 0, 0.2, 1] as [number, number, number, number]
const expandEase = 'cubic-bezier(0.4, 0, 0.2, 1)'

function useInView<T extends Element>(opts?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setInView(true)
      },
      { threshold: 0.2, ...opts },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [opts])
  return { ref, inView }
}

// Badge color themes removed (cards no longer render colored labels)

type BlockLabel = 'SABORES' | 'CALDAS' | 'COBERTURAS' | 'OPÇÕES' | 'PRODUTOS' | 'INFO'

function parseBlocks(lines: string[]): { label: BlockLabel; text: string }[] {
  return lines.map((ln) => {
    if (ln.startsWith('Sabores:')) return { label: 'SABORES', text: ln.slice('Sabores:'.length).trim() }
    if (ln.startsWith('Caldas:')) return { label: 'CALDAS', text: ln.slice('Caldas:'.length).trim() }
    if (/^Coberturas/i.test(ln)) {
      const i = ln.indexOf(':')
      return {
        label: 'COBERTURAS',
        text: (i >= 0 ? ln.slice(i + 1) : ln).trim(),
      }
    }
    if (ln.startsWith('Opções:')) return { label: 'OPÇÕES', text: ln.slice('Opções:'.length).trim() }
    if (ln.startsWith('Produtos disponíveis:'))
      return { label: 'PRODUTOS', text: ln.slice('Produtos disponíveis:'.length).trim() }
    if (ln.startsWith('Tamanhos:')) return { label: 'INFO', text: ln.trim() }
    return { label: 'INFO', text: ln.trim() }
  })
}

const SHORT_DESC: Record<string, string> = {
  'Milk Shake': 'Mais de 55 sabores · 300ml a 500ml',
  Casquinho: 'Sorvete soft clássico',
  'Cascão Simples': 'Sorvete soft com calda',
  Sundae: 'Tradicional com caldas variadas',
  'Sundae Turbinado': 'Com toppings extras',
  'Super Sundae': 'O mais completo da casa',
  'Cascão Trufado': 'Sorvete com cobertura trufada',
  Cup: 'Monte do seu jeito',
  'Na Colher': 'Leve e cremoso',
  'Açaí': 'Turbinado ou com sorvete',
  Zerado: 'Linha diet/zero',
}

function dotify(text: string) {
  return text.replace(/\s*\|\s*/g, ' · ')
}

function labelForToggle(open: boolean) {
  return open ? 'Fechar ↑' : 'Ver detalhes ↓'
}

const menuItems: MenuItem[] = [
  {
    title: 'Milk Shake',
    badge: '+55 sabores',
    lines: ['Mais de 55 sabores disponíveis', 'Tamanhos: 300ml | 400ml | 500ml'],
    imageQuery: 'milkshake',
    imageSrc: asset('/menu/milkshake-unny.png'),
    filter: 'Shakes',
    flipText: '',
    featured: true,
  },
  {
    title: 'Casquinho',
    badge: 'Clássicos',
    lines: ['Sabores: Baunilha | Chocolate | Misto'],
    imageQuery: 'ice-cream-cone',
    imageSrc: asset('/menu/casquinho-soft-500.png'),
    filter: 'Sorvetes',
    flipText: '🍦 Simples e irresistível. O clássico de sempre.',
  },
  {
    title: 'Cascão Simples',
    badge: 'Caldas',
    lines: [
      'Sabores: Baunilha | Chocolate | Misto',
      'Caldas: Amora | Chocolate | Doce de Leite | Kiwi | Leite Condensado | Maracujá | Morango',
    ],
    imageQuery: 'soft-serve',
    imageSrc: asset('/menu/casquinho-soft-500.png'),
    filter: 'Sorvetes',
    flipText: '🍫 Perfeito pra qualquer hora do dia.',
  },
  {
    title: 'Sundae',
    badge: 'Tradicional',
    lines: [
      'Sabores: Baunilha | Chocolate | Misto',
      'Caldas: Amora | Chocolate | Doce de Leite | Kiwi | Leite Condensado | Maracujá | Morango',
    ],
    imageQuery: 'sundae',
    imageSrc: asset('/menu/sundae-soft-500.png'),
    filter: 'Sobremesas',
    flipText: '🥄 Cremoso por dentro, delicioso por fora.',
  },
  {
    title: 'Sundae Turbinado',
    badge: 'Extra toppings',
    lines: [
      'Sabores: Baunilha | Chocolate | Misto',
      'Caldas: Amora | Brigadeiro | Chocolate | Confeti | Doce de Leite | Kiwi | Leite Condensado | Maracujá | Mini Chocoball | Morango | Ovomaltine',
    ],
    imageQuery: 'milkshake-toppings',
    imageSrc: asset('/menu/turbinado.png'),
    filter: 'Sobremesas',
    flipText: '🎉 Mais cobertura, mais alegria!',
  },
  {
    title: 'Super Sundae',
    badge: 'Mais completo',
    lines: [
      'Sabores: Baunilha | Chocolate | Misto',
      'Caldas: Amora | Chocolate | Doce de Leite | Kiwi | Leite Condensado | Maracujá | Morango',
    ],
    imageQuery: 'ice-cream-sundae',
    imageSrc: asset('/menu/super-sundae-500.png'),
    filter: 'Sobremesas',
    flipText: '👑 O maior da família. Pra quem não se contenta.',
  },
  {
    title: 'Cascão Trufado',
    badge: 'Trufado',
    lines: [
      'Sabores: Baunilha | Chocolate | Misto',
      'Caldas: Amora | Chocolate | Doce de Leite | Kiwi | Leite Condensado | Maracujá | Morango',
      'Coberturas trufadas: Brigadeiro | Confeti | Ovomaltine',
    ],
    imageQuery: 'chocolate-ice-cream',
    imageSrc: asset('/menu/cascao-trufado-unny.png'),
    filter: 'Sorvetes',
    flipText: '✨ O toque especial que faz toda diferença.',
  },
  {
    title: 'Cup',
    badge: 'Combinações',
    lines: [
      'Sabores: Amora | Confeti | Chocoball | Delícia de Abacaxi | Mini Chocoball | Morango | Nata Goiaba | Negresco | Nutella | Ovomaltine | Paçoca',
    ],
    imageQuery: 'dessert-cup',
    imageSrc: asset('/menu/cup.png'),
    filter: 'Sobremesas',
    flipText: '🛒 Monte do seu jeito. Cada colher é uma surpresa.',
  },
  {
    title: 'Na Colher',
    badge: 'Sobremesas',
    lines: [
      'Sabores: Abacaxi | Amora | Frutas Vermelhas | Morango | Ninho Trufado | Nutella com Ovomaltine',
    ],
    imageQuery: 'dessert-spoon',
    imageSrc: asset('/menu/na-colher-unny.png'),
    filter: 'Sobremesas',
    flipText: '🍓 Fresco, leve e cheio de sabor.',
  },
  {
    title: 'Açaí',
    badge: 'Energia',
    lines: ['Opções: Turbinado | Com sorvete'],
    imageQuery: 'acai-bowl',
    imageSrc: asset('/menu/acai-unny.png'),
    filter: 'Sobremesas',
    flipText: '💜 Energia e sabor em cada colherada.',
  },
  {
    title: 'Zerado',
    badge: 'Linha diet/zero',
    lines: ['Produtos disponíveis: Casquinho | Cascão | Sundae'],
    imageQuery: 'sugar-free-dessert',
    imageSrc: asset('/menu/milkshake-unny.png'),
    filter: 'Diet/Zero',
    flipText: '💚 Sem abrir mão do prazer. Linha diet/zero.',
  },
]

function filterVisible(filter: FilterId, item: MenuItem) {
  if (filter === 'Todos') return true
  return item.filter === filter
}

export function MenuSection() {
  const [activeFilter, setActiveFilter] = useState<FilterId>('Todos')
  const { ref: sectionRef, inView } = useInView<HTMLElement>({ threshold: 0.15 })
  const [openKey, setOpenKey] = useState<string | null>(null)
  const cardRefs = useRef<Record<string, HTMLElement | null>>({})

  const featured = useMemo(() => menuItems.find((m) => m.featured)!, [])
  const normals = useMemo(() => menuItems.filter((m) => !m.featured), [])

  const visibleFeatured = filterVisible(activeFilter, featured)
  const visibleNormals = useMemo(
    () => normals.filter((m) => filterVisible(activeFilter, m)),
    [normals, activeFilter],
  )

  useEffect(() => {
    // fecha qualquer card ao trocar de filtro
    setOpenKey(null)
  }, [activeFilter])

  const openCard = (key: string) => {
    setOpenKey((prev) => (prev === key ? null : key))
    window.setTimeout(() => {
      const el = cardRefs.current[key]
      if (!el) return
      const isMobile = window.matchMedia?.('(max-width: 768px)')?.matches ?? false
      el.scrollIntoView({ behavior: 'smooth', block: isMobile ? 'start' : 'nearest' })
    }, 100)
  }

  return (
    <section
      id="cardapio"
      ref={sectionRef}
      className="relative z-[1] -mt-1 overflow-hidden border-t-[3px] border-[#ffed00] bg-[#ffed00] pt-1 text-unny-purple"
    >
      <div className="aurum-container relative py-16 sm:py-20">
        <div className="reveal mx-auto max-w-3xl text-center sm:mx-0 sm:text-left" data-reveal="up">
          <h2 className="font-heading text-[40px] font-extrabold leading-tight tracking-tighter text-unny-purple sm:text-[56px]">
            Cardápio
          </h2>
          <p className="mt-4 text-[16px] leading-[1.8] text-unny-purple/80 sm:text-[18px]">
            Escolha seu favorito
          </p>
        </div>

        <div className="reveal mt-8 flex flex-wrap justify-center gap-3 sm:justify-start" data-reveal="up" data-reveal-delay="80">
          {FILTERS.map((id) => {
            const active = activeFilter === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setOpenKey(null)
                  setActiveFilter(id)
                }}
                className={clsx(
                  'rounded-full px-5 py-2 text-[14px] font-semibold transition-colors duration-200 ease-in-out',
                  active
                    ? 'border-2 border-transparent bg-unny-purple font-bold text-unny-yellow'
                    : 'border-2 border-unny-purple bg-transparent font-semibold text-unny-purple hover:bg-unny-purple/10',
                )}
              >
                {id === 'Diet/Zero' ? 'Diet/Zero' : id}
              </button>
            )
          })}
        </div>

        <div className="mt-10 grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visibleFeatured && (
              <FeaturedMilkShake
                key="featured-milk-shake"
                item={featured}
                open={openKey === featured.title}
                onToggle={() => openCard(featured.title)}
                setRef={(el) => {
                  cardRefs.current[featured.title] = el
                }}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 18, scale: 0.98 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25, ease } }}
                transition={{ duration: 0.7, ease, delay: 0.06 }}
                className="md:col-span-2 lg:col-span-2"
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {visibleNormals.map((c, idx) => (
              <MenuCard
                key={c.title}
                item={c}
                idx={idx}
                inView={inView}
                open={openKey === c.title}
                onToggle={() => openCard(c.title)}
                setRef={(el) => {
                  cardRefs.current[c.title] = el
                }}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.98 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25, ease } }}
                transition={{
                  opacity: { duration: 0.3, ease },
                  scale: { duration: 0.3, ease },
                  layout: { duration: 0.35, ease },
                  y: { duration: 0.35, ease },
                  delay: 0.08 + idx * 0.1,
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function FeaturedMilkShake({
  item,
  open,
  onToggle,
  setRef,
  className,
  ...motionProps
}: {
  item: MenuItem
  open: boolean
  onToggle: () => void
  setRef: (el: HTMLElement | null) => void
  className?: string
} & ComponentProps<typeof motion.article>) {
  const { ref: featRef, inView: featInView } = useInView<HTMLElement>({ threshold: 0.25 })
  const detailsRef = useRef<HTMLDivElement | null>(null)
  const [detailsMaxH, setDetailsMaxH] = useState<number>(0)

  useEffect(() => {
    const el = detailsRef.current
    if (!el) return
    setDetailsMaxH(open ? el.scrollHeight : 0)
  }, [open])

  // Mantém a borda inferior nivelada com os cards normais (closedH = 220).
  const closedH = 220
  const openMaxH = closedH + detailsMaxH + 260

  return (
    <motion.article
      ref={(el) => {
        featRef.current = el
        setRef(el)
      }}
      {...motionProps}
      className={clsx(
        className,
        'menu-card group overflow-hidden rounded-[20px] border-[2.5px] border-unny-yellow',
        'shadow-[5px_5px_0px_#FFED00] max-md:shadow-[3px_3px_0px_#FFED00]',
        'transition-all duration-[250ms] ease-in-out',
        !open && 'hover:translate-y-[-4px] hover:rotate-[-1deg] hover:shadow-[8px_8px_0px_#FFED00] cursor-pointer',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="relative block w-full overflow-hidden rounded-[20px] bg-[#4A2480] text-left"
      >
        <div
          className={clsx(
            'grid overflow-hidden rounded-[20px] bg-[#4A2480]',
            'transition-[max-height] duration-[400ms]',
          )}
          style={{
            maxHeight: open ? Math.max(openMaxH, 560) : closedH,
            height: open ? undefined : closedH,
            transitionTimingFunction: expandEase,
          }}
        >
          {!open && (
            <span className="pointer-events-none absolute bottom-4 right-5 z-20 text-[11px] font-bold uppercase tracking-[1.5px] text-[#FDE900] opacity-80">
              Ver detalhes ↓
            </span>
          )}
          <div className={clsx('grid md:grid-cols-2')} style={{ minHeight: closedH }}>
            {/* LEFT (sempre visível) */}
            <div className="relative z-10 flex flex-col justify-between bg-[#4A2480] px-7 py-7 md:px-10">
              <div>
                <div className={clsx('font-heading text-[26px] font-black leading-tight tracking-tighter text-white md:text-[34px]', featInView && 'anim-badge-pulse')}>
                  {item.title}
                </div>
                <div className="mt-2 text-[14px] font-semibold leading-[1.6] text-white/80">
                  {SHORT_DESC[item.title] ?? ''}
                </div>

                {/* Mobile hero image (left, below subtitle) */}
                <div className="mt-5 md:hidden">
                  <img
                    src={item.imageSrc ?? '/menu/milkshake.png'}
                    alt=""
                    className="block h-[170px] w-auto max-w-full object-contain drop-shadow-[0_22px_54px_rgba(0,0,0,0.28)]"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>

              <span className="sr-only">{labelForToggle(open)}</span>
            </div>

            {/* RIGHT — ilustração (permanece visível ao abrir) */}
            <div
              className={clsx(
                'relative flex items-center justify-center overflow-hidden max-md:hidden',
                'transition-[max-height,opacity] duration-300 ease-in-out',
              )}
              style={{
                minHeight: closedH,
                maxHeight: closedH,
                opacity: 1,
              }}
            >
              <div className="absolute inset-0 bg-[#4A2480]" />
              <div
                className="absolute inset-0 opacity-[0.14]"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 10px 10px, rgba(255,237,0,0.38) 1.2px, transparent 1.2px)',
                  backgroundSize: '22px 22px',
                }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-[rgba(255,237,0,0.12)] via-transparent to-transparent" />
              <img
                src={item.imageSrc ?? '/menu/milkshake.png'}
                alt=""
                className={clsx(
                  'relative z-[1] h-full w-full max-h-full object-contain px-3 py-2',
                  'drop-shadow-[0_24px_56px_rgba(0,0,0,0.28)]',
                )}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          {/* DETAILS (após expandir) */}
          <div
            className={clsx('bg-[#4A2480] px-7 pb-6 md:px-10', open ? 'opacity-100' : 'opacity-0')}
            style={{
              transition: 'opacity 0.3s ease',
              transitionDelay: open ? '0.15s' : '0s',
            }}
          >
            <div
              className="card-details overflow-hidden"
              style={{
                maxHeight: open ? detailsMaxH : 0,
                transition: `max-height 0.4s ${expandEase}`,
              }}
            >
              <div ref={detailsRef}>
                <div className="mt-4 border-t border-[rgba(253,233,0,0.15)] pt-4" />
                <div className="text-[10px] font-bold uppercase tracking-[2px] text-[#FDE900]">DESCRIÇÃO</div>
                <div className="mt-1 text-[13px] leading-[1.6] text-white/80">
                  {SHORT_DESC[item.title] ?? ''}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-[2px] text-[#FDE900]">SABORES</div>
                <div className="mt-1 text-[13px] leading-[1.6] text-white/80">{dotify('Mais de 55 sabores disponíveis')}</div>
                <div className="mt-4 text-[10px] font-bold uppercase tracking-[2px] text-[#FDE900]">INFO</div>
                <div className="mt-1 text-[13px] leading-[1.6] text-white/80">{dotify('Tamanhos: 300ml | 400ml | 500ml')}</div>
                <div className="mt-4 text-[13px] leading-[1.6] text-white/80">
                  Uma experiência intensa e cremosa, com escolha rápida e tamanhos ideais para qualquer fome.
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>
    </motion.article>
  )
}

function MenuCard({
  item,
  idx,
  inView,
  open,
  onToggle,
  setRef,
  ...motionProps
}: {
  item: MenuItem
  idx: number
  inView: boolean
  open: boolean
  onToggle: () => void
  setRef: (el: HTMLElement | null) => void
} & Omit<ComponentProps<typeof motion.article>, 'children'>) {
  const blocks = parseBlocks(item.lines)
  const detailsRef = useRef<HTMLDivElement | null>(null)
  const [detailsMaxH, setDetailsMaxH] = useState<number>(0)

  useEffect(() => {
    const el = detailsRef.current
    if (!el) return
    setDetailsMaxH(open ? el.scrollHeight : 0)
  }, [open, item.title])

  const closedH = 220
  const sundaeMenuThumb = item.title === 'Sundae'
  const zeradoMenuThumb = item.title === 'Zerado'

  return (
    <motion.article
      ref={setRef}
      {...motionProps}
      className={clsx(
        motionProps.className,
        'menu-card group overflow-hidden rounded-[20px]',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={clsx(
          'relative flex w-full flex-col rounded-[20px] border-[2.5px] border-unny-yellow bg-[#4A2480] text-left',
          'shadow-[5px_5px_0px_#FFED00] max-md:shadow-[3px_3px_0px_#FFED00]',
          'transition-all duration-[250ms] ease-in-out',
          !open && 'hover:translate-y-[-4px] hover:rotate-[-1deg] hover:shadow-[8px_8px_0px_#FFED00] cursor-pointer',
        )}
        style={{
          maxHeight: open ? 520 : 220,
          overflow: 'hidden',
          transition: `max-height 0.4s ${expandEase}`,
        }}
      >
        {!open && (
          <span className="pointer-events-none absolute bottom-4 right-5 z-10 text-[11px] font-bold uppercase tracking-[1.5px] text-[#FDE900] opacity-75">
            Ver detalhes ↓
          </span>
        )}
        <div
          className="flex items-start gap-5 px-6 py-6 sm:px-7"
          style={{ minHeight: closedH }}
        >
          <div className="min-w-0 flex-1">
            <div className="mt-4 font-heading text-[20px] font-black leading-tight tracking-tighter text-white">
              {item.title}
            </div>
            <div className="mt-1 text-[13px] font-semibold leading-[1.5] text-white/80">
              {SHORT_DESC[item.title] ?? ''}
            </div>
            <span className="sr-only">{labelForToggle(open)}</span>
          </div>

          <div
            className={clsx(
              'relative shrink-0',
              sundaeMenuThumb ? 'h-[182px] w-[182px]' : zeradoMenuThumb ? 'h-[142px] w-[142px]' : 'h-[150px] w-[150px]',
            )}
          >
            <img
              src={item.imageSrc ?? '/menu/casquinho.svg'}
              alt=""
              className={clsx(
                'absolute inset-0 m-auto object-contain',
                // Sundae: maior; Zerado: um pouco menor; resto: padrão
                sundaeMenuThumb ? 'h-[113%] w-[113%]' : zeradoMenuThumb ? 'h-[106%] w-[106%]' : 'h-[110%] w-[110%]',
                'drop-shadow-[0_18px_44px_rgba(0,0,0,0.28)]',
              )}
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        {/* DETAILS */}
        <div
          className={clsx('px-7 pb-7', open ? 'opacity-100' : 'opacity-0')}
          style={{
            transition: 'opacity 0.3s ease',
            transitionDelay: open ? '0.15s' : '0s',
          }}
        >
          <div
            className="card-details overflow-hidden"
            style={{
              maxHeight: open ? detailsMaxH : 0,
              transition: `max-height 0.4s ${expandEase}`,
            }}
          >
            <div ref={detailsRef}>
              <div className="border-t border-[rgba(253,233,0,0.15)] pt-4" />
              <div className="text-[10px] font-bold uppercase tracking-[2px] text-[#FDE900]">DESCRIÇÃO</div>
              <div className="mt-1 text-[13px] leading-[1.6] text-white/80">{SHORT_DESC[item.title] ?? ''}</div>
              {blocks.map((b, i) => (
                <div key={`${item.title}-${b.label}-${i}`} className={clsx(i > 0 && 'mt-4')}>
                  <div className="text-[10px] font-bold uppercase tracking-[2px] text-[#FDE900]">
                    {b.label === 'INFO' ? 'INFO' : b.label}
                  </div>
                  <div className="mt-1 text-[13px] leading-[1.6] text-white/80">{dotify(b.text)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </button>
    </motion.article>
  )
}
