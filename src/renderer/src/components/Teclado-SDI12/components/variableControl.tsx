import { useEffect, useState } from 'react'
import VariableInput from './variableInput'

type Props = {
  informations: string | undefined
  clear: boolean | undefined
  onClearReset: (newValue: boolean) => void
  changeVariableMain: (value: string) => void
}

export default function VariableControl({
  informations,
  clear,
  onClearReset,
  changeVariableMain
}: Props) {
  // Correção da tipagem no Array.from
  const [data, setData] = useState<string[]>([])
  const inputs = Array.from({ length: 8 }, (_, index: number) => index + 1)
  const [variableControlerInUse, setVariableControlerInUse] = useState<number>(0)

  const [enabledInputs, setEnabledInputs] = useState([
    true,
    ...Array(inputs.length - 1).fill(false)
  ])

  function handleChangeVariableMain(): void {
    const formattedData = data.map((item) => item.toString().padEnd(11, ' '))
    const newData = `,${formattedData.join()},${variableControlerInUse}%`
    changeVariableMain(newData)
  }

  useEffect(() => {
    console.log('imformation controler:', informations)
    if (informations) {
      const loadedData = informations.split(',').map((item) => item.trim())
      setData(loadedData.slice(14, 22))
    } else {
      setData(Array(8).fill(''))
    }
  }, [informations])

  useEffect(() => {
    if (clear) {
      setData(Array(8).fill(''))
      onClearReset(false)
    }
  }, [clear, onClearReset])

  useEffect(() => {
    handleChangeVariableMain()
    console.log('data:', data)
    if (data.length === 0) {
      setVariableControlerInUse(0) // Se data estiver vazio, setar para 0
    } else {
      const nonEmptyCount = data.filter((item) => item.trim() !== '').length // Conta apenas os itens não vazios
      setVariableControlerInUse(nonEmptyCount) // Define o contador com base nos itens não vazios
    }
  }, [data])

  useEffect(() => {
    handleChangeVariableMain()
    setEnabledInputs((prev) => {
      const newEnabled = [...prev]
      for (let i = 0; i < data.length; i++) {
        // Habilita o input se o atual não estiver vazio e o anterior também estiver preenchido
        if (i === 0 || (data[i - 1] && data[i - 1].trim() !== '')) {
          newEnabled[i] = true
        } else {
          newEnabled[i] = false // Desabilita se o anterior estiver vazio
        }
      }
      return newEnabled
    })
  }, [data, variableControlerInUse])

  const handleInputChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const newData = [...data] // Faz uma cópia do estado atual
    newData[index] = value // Atualiza o valor do input correspondente
    setData(newData) // Atualiza o estado com os novos dados

    setEnabledInputs((prev) => {
      const newEnabledInputs = [...prev]
      if (value) {
        // Se o valor atual não estiver vazio, habilita o próximo input
        if (index + 1 < newEnabledInputs.length) {
          newEnabledInputs[index + 1] = true // Habilita o próximo input
        }
      } else {
        // Se o valor estiver vazio, desabilita todos os inputs após o atual
        for (let i = index + 1; i < newEnabledInputs.length; i++) {
          newEnabledInputs[i] = false
        }
      }
      return newEnabledInputs
    })
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
            value={data[index]}
            onChange={handleInputChange(index)}
            disabled={!enabledInputs[index]} // Desabilita o input se não estiver habilitado
          />
        ))}
      </div>

      <div className="flex items-center justify-end mt-6 mr-10 gap-1">
        <label> Variáveis de controle em uso:</label>
        <input
          className=" text-center text-white w-10 bg-sky-500 border rounded-md"
          type="text"
          readOnly
          value={
            data[22] && data[22].includes('%')
              ? data[22].replace('%', '')
              : data[22] || variableControlerInUse.toString()
          }
        />
      </div>
    </div>
  )
}
