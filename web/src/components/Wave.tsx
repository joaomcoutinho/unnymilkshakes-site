import clsx from 'clsx'

export function Wave({
  className,
  flip,
}: {
  className?: string
  flip?: boolean
}) {
  return (
    <svg
      className={clsx('block w-full', flip && 'rotate-180', className)}
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M0,64 C240,128 480,0 720,64 C960,128 1200,0 1440,64 L1440,120 L0,120 Z"
        fill="currentColor"
      />
    </svg>
  )
}

