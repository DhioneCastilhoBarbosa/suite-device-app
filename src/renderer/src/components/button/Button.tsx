import { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

interface ButtonProps extends ComponentProps<'button'> {
  filled?: boolean
  size?: string
}

export default function ({ filled, size, className, ...props }: ButtonProps) {
  const sizeClass =
    size === 'small'
      ? 'min-w-[5.5rem] w-auto px-3'
      : size === 'medium'
        ? 'min-w-[7rem] w-auto max-w-full px-3'
        : size === 'large'
          ? 'min-w-[8rem] w-auto max-w-full px-4'
          : 'px-3'

  return filled ? (
    <button
      {...props}
      className={twMerge(
        'inline-flex flex-row items-center justify-center gap-1.5 rounded-md border border-sky-400 bg-sky-400 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-sky-500 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 h-8 px-3 leading-none',
        sizeClass,
        className
      )}
    >
      {props.children}
    </button>
  ) : (
    <button
      {...props}
      className={twMerge(
        'inline-flex flex-row items-center justify-center gap-1.5 rounded-md border border-sky-400 bg-white text-sm font-semibold text-sky-500 shadow-sm transition-all duration-150 hover:bg-sky-500 hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 h-8 px-3 leading-none',
        sizeClass,
        className
      )}
    >
      {props.children}
    </button>
  )
}
