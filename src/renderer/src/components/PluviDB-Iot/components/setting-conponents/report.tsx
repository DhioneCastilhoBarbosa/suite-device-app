import { ArrowsClockwise, UploadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { useEffect, useState } from 'react'
import { t } from 'i18next'

type Props = {
  handleUpdateSettingsReport: () => void
  handleSendSettingsReport?: (settings: string[]) => void
  receivedSettingsReport: string | undefined
}

export function Report({
  handleUpdateSettingsReport,
  receivedSettingsReport,
  handleSendSettingsReport
}: Props): JSX.Element {
  const [ArraySelected, setArraySelected] = useState<string[]>([
    'off',
    'off',
    'off',
    'off',
    'off',
    'off',
    'off'
  ])
  const options = [
    t('Pulso1'),
    t('Pulso2'),
    t('Geolocalização'),
    t('Bateria'),
    t('Sinal'),
    t('SDI-12'),
    t('Motivo da transmissão')
  ]
  const [switches, setSwitches] = useState<Record<string, boolean>>(
    options.reduce(
      (acc, option, index) => {
        acc[option] = ArraySelected[index] === 'on'
        return acc
      },
      {} as Record<string, boolean>
    )
  )

  const toggleSwitch = (option: string): void => {
    setSwitches((prev) => {
      const newSwitches = { ...prev, [option]: !prev[option] }
      setArraySelected(options.map((opt) => (newSwitches[opt] ? 'on' : 'off')))
      return newSwitches
    })
  }

  useEffect(() => {
    const cleanReceivedSettingsReport = receivedSettingsReport?.replace('rel=', '').replace('!', '')
    const valuesArray = cleanReceivedSettingsReport
      ? cleanReceivedSettingsReport.split(';').map((item) => item.split('>')[1])
      : []
    // console.log('Array de valores:', valuesArray)

    // Verifica se os arrays são diferentes antes de atualizar o estado
    if (
      valuesArray.length !== ArraySelected.length ||
      !valuesArray.every((value, index) => value === ArraySelected[index])
    ) {
      setArraySelected(valuesArray)
    }
  }, [receivedSettingsReport])

  // Atualiza switches quando ArraySelected muda
  useEffect(() => {
    setSwitches(() =>
      options.reduce(
        (acc, option, index) => {
          acc[option] = ArraySelected[index] === 'on'
          return acc
        },
        {} as Record<string, boolean>
      )
    )
    //console.log('ArraySelected mudou:', ArraySelected)
  }, [ArraySelected])

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleUpdateSettingsReport()
    }, 500) // Aguarda 500ms antes de executar a função
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="mt-2 flex flex-col gap-2">
      <ul className="space-y-2">
        {options.map((option) => (
          <li key={option} className="flex items-center justify-between">
            <span>{option}</span>
            <button
              onClick={() => toggleSwitch(option)}
              className={`relative w-12 h-6 flex items-center rounded-full transition-colors ${
                switches[option] ? 'bg-sky-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  switches[option] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex justify-end mt-6 border-t-[1px] border-gray-200 pt-4 gap-4">
        <Button onClick={() => handleUpdateSettingsReport()}>
          <ArrowsClockwise size={24} />
          {t('Atualizar')}
        </Button>
        <Button onClick={() => handleSendSettingsReport && handleSendSettingsReport(ArraySelected)}>
          <UploadSimple size={24} />
          {t('Enviar')}
        </Button>
      </div>
    </div>
  )
}
