import { Device } from '../../../Context/DeviceContext'
import Button from '@renderer/components/button/Button'
import LoadingData from '@renderer/components/loading/loadingData'
import NoDeviceFoundModbus from '@renderer/components/modal/noDeviceFoundModbus'
import { useEffect, useState } from 'react'
import { t } from 'i18next'
import { Hash, Monitor, Timer } from '@phosphor-icons/react'

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
    <div className="flex w-full min-w-0 flex-col items-center justify-center px-8">
      <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-start gap-3 rounded-md border border-sky-100 bg-gradient-to-br from-[#F7FBFF] to-white px-3.5 py-3 shadow-sm">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-600">
            <Hash size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              {t('Endereço SDI-12')}
            </p>
            <input
              type="text"
              className="mt-1.5 h-9 w-full rounded-md border border-sky-200 bg-white px-3 text-center text-sm font-semibold text-sky-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              min={0}
              maxLength={1}
              value={inputValueSDI12}
              onChange={handleChangeSDI12}
              inputMode="text"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-md border border-sky-100 bg-gradient-to-br from-[#F7FBFF] to-white px-3.5 py-3 shadow-sm">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-600">
            <Monitor size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              {t('Tempo de Display')}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <select
                className="h-9 min-w-0 flex-1 rounded-md border border-sky-200 bg-white px-3 text-center text-sm font-semibold text-sky-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                value={inputValueDisplay}
                onChange={(event) => handleChangeDisplay(event)}
              >
                <option value={30}>30</option>
                <option value={60}>60</option>
                <option value={120}>120</option>
                <option value={300}>300</option>
                <option value={600}>600</option>
              </select>
              <span className="shrink-0 text-xs font-medium text-zinc-500">s</span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-md border border-sky-100 bg-gradient-to-br from-[#F7FBFF] to-white px-3.5 py-3 shadow-sm">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-600">
            <Timer size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              {t('Tempo de Dados (min)')}
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <input
                type="number"
                className="h-9 min-w-0 flex-1 rounded-md border border-sky-200 bg-white px-3 text-center text-sm font-semibold text-sky-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                min={1}
                value={inputValueData}
                onChange={handleChangeData}
                inputMode="numeric"
              />
              <span className="shrink-0 text-xs font-medium text-zinc-500">min</span>
            </div>
          </div>
        </div>
      </div>

      <LoadingData visible={isLoading} title={titleLoading} />
    </div>
  )
}
