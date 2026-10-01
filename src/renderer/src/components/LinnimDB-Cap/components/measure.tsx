import Button from '@renderer/components/button/Button'
import LoadingData from '@renderer/components/loading/loadingData'
import { Device } from '../../../Context/DeviceContext'
import { readModbusData } from '../../../utils/modbusRTU'
import { useState } from 'react'
import { t } from 'i18next'
import { Gauge, Thermometer } from '@phosphor-icons/react'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatMeasure(value: number) {
  return value.toFixed(3).replace('.', ',')
}

export default function Measure() {
  const [readPressure, setReadPressure] = useState<number>(0)
  const [readTemperature, setReadTemperature] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const { mode }: any = Device()

  async function handleModbus() {
    if (mode.state) return
    try {
      setIsLoading(true)
      // DB Setup: Read Holding 0x03, endereço 2, 2 registradores (float) → pressão
      const pressure = await readModbusData(2, 2, false, true, 1000)
      setReadPressure(pressure as number)

      await delay(200)

      // DB Setup: Read Holding 0x03, endereço 6, 2 registradores (float) → temperatura °C
      const temperature = await readModbusData(6, 2, false, true, 1000)
      setReadTemperature(temperature as number)
    } catch (error) {
      console.error('Erro ao ler dados Modbus:', error)
    } finally {
      setTimeout(() => setIsLoading(false), 1000)
    }
  }

  return (
    <div className="mx-auto mb-2 w-full max-w-2xl px-4 pt-2 sm:px-6">
      <div className="mb-2 border-b border-sky-500 pb-0.5">
        <label className="text-sm font-semibold text-sky-700">{t('Leitura')}</label>
      </div>

      <div className="flex w-full min-w-0 flex-col items-stretch gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex shrink-0 items-center gap-1.5 text-sky-600">
            <Gauge size={18} weight="duotone" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
              {t('Pressão')}
            </span>
          </div>
          <input
            type="text"
            value={formatMeasure(readPressure)}
            disabled={true}
            className="h-8 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-center text-sm font-semibold text-zinc-700 outline-none tabular-nums"
          />
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="flex shrink-0 items-center gap-1.5 text-sky-600">
            <Thermometer size={18} weight="duotone" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
              {t('Temperatura')}
            </span>
          </div>
          <input
            type="text"
            value={formatMeasure(readTemperature)}
            disabled={true}
            className="h-8 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-center text-sm font-semibold text-zinc-700 outline-none tabular-nums"
          />
          <span className="shrink-0 text-xs font-semibold text-zinc-500">°C</span>
        </div>

        <Button
          filled={true}
          size="medium"
          className="w-full shrink-0 sm:w-auto"
          onClick={handleModbus}
          disabled={isLoading || mode.state}
        >
          {t('Medir')}
        </Button>
      </div>

      <LoadingData visible={isLoading} title={t('Solicitando dados de medição ao dispositivo!')} />
    </div>
  )
}
