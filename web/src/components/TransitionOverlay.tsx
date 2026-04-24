import { AnimatePresence, motion } from 'framer-motion'

export function TransitionOverlay({
  active,
  label = 'UNNY',
  logoSrc,
  durationMs = 900,
}: {
  active: boolean
  label?: string
  logoSrc?: string
  durationMs?: number
}) {
  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          className="fixed inset-0 z-[60] bg-aurum-secondary-base"
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: durationMs / 1000, ease: [0.4, 0, 0.2, 1] }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="select-none text-center">
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt={label}
                  className="mx-auto h-[64px] w-auto object-contain sm:h-[84px]"
                />
              ) : (
                <div className="font-heading text-[44px] font-extrabold leading-tight tracking-tighter text-aurum-primary-base sm:text-[64px]">
                  {label}
                </div>
              )}
              <div className="mt-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/80">
                Carregando
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

