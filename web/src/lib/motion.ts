import type { Variants } from 'framer-motion'

export const motionEase = [0.22, 1, 0.36, 1] as const

export const motionDur = {
  in: 0.75,
  out: 0.55,
  hover: 0.24,
} as const

export function staggerChildren(stagger = 0.1, delayChildren = 0.06) {
  return {
    transition: { staggerChildren: stagger, delayChildren },
  } as const
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: motionDur.in, ease: motionEase } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: motionDur.in, ease: motionEase } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: motionDur.in, ease: motionEase } },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -22 },
  show: { opacity: 1, x: 0, transition: { duration: motionDur.in, ease: motionEase } },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 22 },
  show: { opacity: 1, x: 0, transition: { duration: motionDur.in, ease: motionEase } },
}

