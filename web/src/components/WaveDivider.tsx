import clsx from 'clsx'
import { useId } from 'react'

export function WaveDivider({
  from,
  to,
  className,
  flip,
}: {
  from: string
  to: string
  className?: string
  flip?: boolean
}) {
  const gid = useId()
  return (
    <svg
      className={clsx('block w-full -mt-px -mb-px', flip && 'rotate-180', className)}
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      style={{ backgroundColor: from }}
    >
      <defs>
        {/* Gradiente com transparência no topo para suavizar a união "from -> to" */}
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={to} stopOpacity="0.05" />
          <stop offset="55%" stopColor={to} stopOpacity="0.72" />
          <stop offset="100%" stopColor={to} stopOpacity="1" />
        </linearGradient>
      </defs>
      <path
        d="M0,64 C240,128 480,0 720,64 C960,128 1200,0 1440,64 L1440,120 L0,120 Z"
        fill={`url(#${gid})`}
      />
    </svg>
  )
}

