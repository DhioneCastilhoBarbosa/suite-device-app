import { DownloadSimple, FolderOpen, UploadSimple } from '@phosphor-icons/react'
import { Device } from '@renderer/Context/DeviceContext'
import Button from '@renderer/components/button/Button'
import LoadingData from '@renderer/components/loading/loadingData'
import { IdModBus, WriteModbus, readModbusData } from '@renderer/utils/modbusRTU'
import { useEffect, useState } from 'react'

type Props = {
  informations: string | undefined
  clear: boolean | undefined
  onClearReset: (newValue: boolean) => void
  changeInformations: (value: string) => void
}

export default function Settings({ informations, clear, onClearReset, changeInformations }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [titleLoading, setTitleLoading] = useState('Baixando informações do dispositivo!')
  const [inputValueSDI12, setInputValueSDI12] = useState<string>('')
  const [inputValueDisplay, setInputValueDisplay] = useState<string>('')
  const [inputValueData, setInputValueData] = useState<string>('')
  const [data, setData] = useState<string[]>([])

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
      setInputValueSDI12('')
      setInputValueDisplay('')
      setInputValueData('')
      setData([])
      onClearReset(false) // Chama o callback para redefinir `clear` externamente
    }
  }, [clear, onClearReset])

  useEffect(() => {
    if (data.length > 0) {
      const addresSDI12 = data[0].replace(/!(?=\d)/, '')
      const TimerDisplay = data[1].replace(/^0+/, '')
      const TimerData = data[2].replace(/^0+/, '')

      setInputValueSDI12(addresSDI12)
      setInputValueDisplay(TimerDisplay)
      setInputValueData(TimerData)
      const valueInputs = `!${addresSDI12},${TimerDisplay},${TimerData},`

      changeInformations(valueInputs)
    }
  }, [data])

  useEffect(() => {
    const valueInputs = `!${inputValueSDI12},${inputValueDisplay},${inputValueData},`
    changeInformations(valueInputs)
  }, [inputValueSDI12, inputValueData, inputValueDisplay])

  const handleChangeSDI12 = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    const numericValue = value === '' ? '' : parseFloat(value) // Converte para número ou mantém como string vazia
    setInputValueSDI12(numericValue.toString()) // Atualiza o estado
  }

  const handleChangeDisplay = (event: React.ChangeEvent<HTMLInputElement>) => {
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
            type="number"
            className="border border-zinc-400 w-48 rounded-md h-6 outline-none text-center"
            min={0}
            value={inputValueSDI12}
            onChange={handleChangeSDI12}
            inputMode="numeric"
          />
        </div>

        <div className="flex flex-col w-52">
          <label>Tempo de Display</label>
          <input
            type="number"
            className="border border-zinc-400 w-48 rounded-md h-6 outline-none text-center"
            min={1}
            value={inputValueDisplay}
            onChange={handleChangeDisplay}
            inputMode="numeric"
          />
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
