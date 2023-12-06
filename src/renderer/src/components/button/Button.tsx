import React, { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  texto: string
}

const Button: React.FC<ButtonProps> = ({ texto, ...rest }) => {
  return (
    <button
      {...rest}
      className="w-24 mb-2 border-[1px] border-sky-400 rounded-md text-sm text-sky-400 font-bold hover:bg-sky-400 hover:text-white delay-75 h-7"
    >
      {texto}
    </button>
  )
}

export default Button
