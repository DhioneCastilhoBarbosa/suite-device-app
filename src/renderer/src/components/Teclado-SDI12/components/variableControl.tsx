import { useEffect, useState } from 'react'
import VariableInput from './variableInput'

type Props = {
  informations: string | undefined
  clear: boolean | undefined
  onClearReset: (newValue: boolean) => void
}

export default function VariableControl({ informations, clear, onClearReset }: Props) {
  // Correção da tipagem no Array.from
  const [data, setData] = useState<string[]>([])
  const inputs = Array.from({ length: 8 }, (_, index: number) => index + 1)

  useEffect(() => {
    console.log(informations)
    if (informations) {
      setData(informations.split(',').map((item) => item.trim()))
    } else {
      setData([])
    }
  }, [informations])

  useEffect(() => {
    if (clear) {
      setData([])
      onClearReset(false)
    }
  }, [clear, onClearReset])

  const handleInputChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newData = [...data] // Faz uma cópia do estado atual
    newData[4 + index] = event.target.value // Atualiza o valor do input correspondente
    setData(newData) // Atualiza o estado com os novos dados
  }

  return (
    <div className="flex flex-col">
      <header className="flex items-start justify-between mr-8 ml-8 mt-10 border-b-[1px] border-sky-500 ">
        <div className="flex gap-4">
          <label>Variáveis Controle</label>
        </div>
      </header>

      <div className="grid grid-cols-5 gap-4  mr-8 ml-8">
        {inputs.map((input: number, index: number) => (
          <VariableInput
            key={index}
            addres={input}
            value={data[14 + index]}
            onChange={handleInputChange(index)}
          />
        ))}
      </div>

      <div className="flex items-center justify-end mt-6 mr-10 gap-1">
        <label> Variáveis de controle em uso:</label>
        <input
          className=" text-center text-white w-10 bg-sky-500 border rounded-md"
          type="text"
          readOnly
          value={data[22] && data[22].includes('%') ? data[22].replace('%', '') : data[22] || ''}
        />
      </div>
    </div>
  )
}
