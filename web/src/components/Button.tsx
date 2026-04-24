import { type ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'md' | 'lg'

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
}) {
  return (
    <button
      {...props}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-[0.12em]',
        'transition-all duration-300 ease-aurum focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'min-h-[44px] px-5',
        'pressable',
        variant !== 'ghost' && 'cta-shine',
        size === 'lg' && 'min-h-[48px] px-6 text-[16px]',
        size === 'md' && 'text-[14px]',
        variant === 'primary' && [
          'bg-aurum-secondary-base text-white shadow-sm',
          'hover:bg-aurum-secondary-dark hover:-translate-y-0.5',
          'active:translate-y-0',
          'focus-visible:outline-aurum-secondary-base',
        ],
        variant === 'secondary' && [
          'bg-aurum-primary-base text-aurum-secondary-base shadow-sm',
          'hover:bg-aurum-primary-light hover:-translate-y-0.5',
          'active:bg-aurum-primary-dark active:translate-y-0',
          'focus-visible:outline-aurum-secondary-base',
        ],
        variant === 'ghost' && [
          'bg-transparent text-aurum-secondary-base',
          'hover:text-aurum-secondary-dark',
          'relative',
        ],
        className,
      )}
    />
  )
}

