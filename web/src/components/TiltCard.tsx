import clsx from 'clsx'
import React, { type HTMLAttributes, useEffect, useMemo, useRef } from 'react'
import { useReducedMotionPref } from '../lib/useReducedMotionPref'

export type TiltCardProps = {
  className?: string
  strength?: number // degrees-ish
  glare?: boolean
  children?: React.ReactNode
} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>

export function TiltCard({
  className,
  strength = 10,
  glare = true,
  children,
  ...rest
}: TiltCardProps) {
  const reduced = useReducedMotionPref()
  const ref = useRef<HTMLDivElement | null>(null)
  const raf = useRef<number | null>(null)
  const state = useRef({
    rx: 0,
    ry: 0,
    tx: 0,
    ty: 0,
    /** Centro do glare em px relativos ao card; null = usar fallback 50% no CSS */
    glx: null as number | null,
    gly: null as number | null,
  })

  const isCoarsePointer = useMemo(() => {
    if (typeof window === 'undefined') return true
    return window.matchMedia?.('(pointer: coarse)').matches ?? true
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduced || isCoarsePointer) return

    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

    const apply = () => {
      raf.current = null
      const { rx, ry, tx, ty, glx, gly } = state.current
      el.style.setProperty('--rx', `${rx}deg`)
      el.style.setProperty('--ry', `${ry}deg`)
      el.style.setProperty('--tx', `${tx}px`)
      el.style.setProperty('--ty', `${ty}px`)
      if (glx != null && gly != null) {
        el.style.setProperty('--glx', `${glx}px`)
        el.style.setProperty('--gly', `${gly}px`)
      }
    }

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      const dx = px - 0.5
      const dy = py - 0.5

      state.current.ry = clamp(dx * strength, -strength, strength)
      state.current.rx = clamp(-dy * strength, -strength, strength)
      state.current.tx = clamp(dx * 6, -6, 6)
      state.current.ty = clamp(dy * 6, -6, 6)
      state.current.glx = e.clientX - r.left
      state.current.gly = e.clientY - r.top

      if (!raf.current) raf.current = requestAnimationFrame(apply)
    }

    const onLeave = () => {
      state.current.rx = 0
      state.current.ry = 0
      state.current.tx = 0
      state.current.ty = 0
      state.current.glx = null
      state.current.gly = null
      el.style.removeProperty('--glx')
      el.style.removeProperty('--gly')
      if (!raf.current) raf.current = requestAnimationFrame(apply)
    }

    el.addEventListener('pointerenter', onMove)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointerenter', onMove)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [glare, isCoarsePointer, reduced, strength])

  return (
    <div
      ref={ref}
      {...rest}
      className={clsx('tilt-card', className)}
      style={{
        transform: 'perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translate3d(var(--tx, 0px), var(--ty, 0px), 0)',
        transition: reduced || isCoarsePointer ? undefined : 'transform 220ms cubic-bezier(0.22,1,0.36,1)',
        ...(rest.style ?? {}),
      }}
    >
      {glare ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(circle at var(--glx, 50%) var(--gly, 50%), rgba(255,255,255,0.20), transparent 45%)',
          }}
        />
      ) : null}
      {children}
    </div>
  )
}

