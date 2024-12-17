import { Device } from '@renderer/Context/DeviceContext'
import Button from '@renderer/components/button/Button'
import LoadingData from '@renderer/components/loading/loadingData'
import NoDeviceFoundModbus from '@renderer/components/modal/noDeviceFoundModbus'
import { useEffect, useState } from 'react'

type Props = {
  informations: string | undefined
  clear: boolean | undefined
  onClearReset: (newValue: boolean) => void
  changeInformations: (value: string) => void
  isloading: boolean | undefined
}

export default function Settings({
  informations,
  clear,
  onClearReset,
  changeInformations,
  isloading
}: Props) {
  const [isLoading, setIsLoading] = useState(true)
  const [titleLoading, setTitleLoading] = useState('Aguardando dispositivo')
  const [inputValueSDI12, setInputValueSDI12] = useState<string>('0')
  const [inputValueDisplay, setInputValueDisplay] = useState<string>('30')
  const [inputValueData, setInputValueData] = useState<string>('60')
  const [data, setData] = useState<string[]>([])

  useEffect(() => {
    isloading ? setIsLoading(true) : setIsLoading(false)
  }, [isloading])

  useEffect(() => {
    if (informations) {
      setData(informations.split(',').map((item) => item.trim()))
      setInputValueSDI12[data[1]]
    } else {
      setData([])
    }
  }, [informations])

  useEffect(() => {
    if (clear) {
      setInputValueSDI12('0')
      setInputValueDisplay('30')
      setInputValueData('60')
      setData([])
      onClearReset(false) // Chama o callback para redefinir `clear` externamente
    }
  }, [clear, onClearReset])

  useEffect(() => {
    if (data.length > 0) {
      const addresSDI12 = data[0].replace(/!(?=[a-zA-Z0-9])/, '')
      const TimerDisplay = data[1].replace(/^0+/, '')
      const TimerData = data[2].replace(/^0+/, '')

      setInputValueSDI12(addresSDI12)
      setInputValueDisplay(TimerDisplay)
      setInputValueData(TimerData)
      const valueInputs = `!${addresSDI12},${TimerDisplay.padStart(3, '0')},${TimerData.padStart(4, '0')},`

      changeInformations(valueInputs)
    }
  }, [data])

  useEffect(() => {
    const valueInputs = `!${inputValueSDI12},${inputValueDisplay.padStart(3, '0')},${inputValueData.padStart(4, '0')},`
    changeInformations(valueInputs)
  }, [inputValueSDI12, inputValueData, inputValueDisplay])

  const handleChangeSDI12 = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    //const numericValue = value === '' ? '' : parseFloat(value) // Converte para número ou mantém como string vazia

    // Permitir apenas 1 caractere e restringir a letras ou números
    if (/^[a-zA-Z0-9]?$/.test(value)) {
      setInputValueSDI12(value) // Atualiza o estado diretamente
    }
  }

  const handleChangeDisplay = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    const numericValue = value === '' ? '' : parseFloat(value) // Converte para número ou mantém como string vazia
    setInputValueDisplay(numericValue.toString()) // Atualiza o estado
  }

  const handleChangeData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const numericValue = value === '' ? '' : parseFloat(value) // Converte para número ou mantém como string vazia
    setInputValueData(numericValue.toString()) // Atualiza o estado
  }

  return (
    <div className="flex flex-col items-center justify-center ">
      <div className="grid grid-cols-3 gap-2 h-full mt-4">
        <div className="flex flex-col w-52">
          <label>Endereço SDI-12</label>
          <input
            type="text"
            className="border border-zinc-400 w-48 rounded-md h-6 outline-none text-center"
            min={0}
            maxLength={1}
            value={inputValueSDI12}
            onChange={handleChangeSDI12}
            inputMode="text"
          />
        </div>

        <div className="flex flex-col w-52">
          <label>Tempo de Display</label>
          <select
            className="border border-zinc-400 w-48 rounded-md h-6 outline-none text-center"
            value={inputValueDisplay}
            onChange={(event) => handleChangeDisplay(event)}
          >
            <option value={30}>30</option>
            <option value={60}>60</option>
            <option value={120}>120</option>
            <option value={300}>300</option>
            <option value={600}>600</option>
          </select>
        </div>

        <div className="flex flex-col w-52">
          <label>Tempo de Dados (min)</label>
          <input
            type="number"
            className="border border-zinc-400 w-48 rounded-md h-6 outline-none text-center"
            min={1}
            value={inputValueData}
            onChange={handleChangeData}
            inputMode="numeric"
          />
        </div>
      </div>

      <LoadingData visible={isLoading} title={titleLoading} />
    </div>
  )
}
