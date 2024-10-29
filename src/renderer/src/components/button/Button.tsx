import { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

interface ButtonProps extends ComponentProps<'button'> {
  filled?: boolean
  size?: string
}

export default function ({ filled, size, className, ...props }: ButtonProps) {
  return filled ? (
    <button
      {...props}
      className={twMerge(
        ' bg-sky-400 rounded-md text-sm text-white font-bold hover:bg-transparent hover:text-sky-400 hover:border-[1px] border-sky-400 delay-75 h-7 whitespace-nowrap',
        size === 'small' ? 'w-24' : size === 'medium' ? 'w-44' : size === 'large' ? 'w-52' : '',
        className
      )}
    >
      {props.children}
    </button>
  ) : (
    <button
      {...props}
      className={twMerge(
        ' flex flex-row items-center justify-center mb-2 p-4 gap-1 border-[1px] border-sky-400 rounded-md text-sm text-sky-400 font-bold hover:bg-sky-400 hover:text-white delay-75 h-7',
        size === 'small' ? 'w-24' : size === 'medium' ? 'w-44' : size === 'large' ? 'w-52' : '',
        className
      )}
    >
      {props.children}
    </button>
  )
}
