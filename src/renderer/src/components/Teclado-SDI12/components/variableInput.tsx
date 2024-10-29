import { ComponentProps } from 'react'

interface VariableInputProps extends ComponentProps<'input'> {
  addres: number
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export default function VariableInput({ addres, value, onChange }: VariableInputProps) {
  return (
    <div className=" flex mr-2 ml-2 mt-4">
      <label className="flex items-center justify-center  text-white w-10 bg-sky-500 border-l rounded-s-md">
        {addres}
      </label>
      <input
        className="border-r border-y border-zinc-400 w-36 rounded-e-md h-6 outline-none text-center"
        value={value || ''}
        type="text"
        onChange={onChange} // Adiciona o manipulador `onChange`
      />
    </div>
  )
}
