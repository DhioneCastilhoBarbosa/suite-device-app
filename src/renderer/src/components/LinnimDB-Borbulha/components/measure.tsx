import Button from '@renderer/components/button/Button'
import LoadingData from '@renderer/components/loading/loadingData'
import { Device } from '../../../Context/DeviceContext'
import { readModbusData } from '../../../utils/modbusRTU'
import { useState } from 'react'
import { t } from 'i18next'
import { Gauge } from '@phosphor-icons/react'

export default function Measure() {
  const [readPressure, setReadPressure] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const { mode }: any = Device()

  async function handleModbus() {
    if (mode.state) return
    try {
      setIsLoading(true)
      const data = await readModbusData(2, 2, false, true, 60000)

      setReadPressure(data as number)
      console.log(data)
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
        <div className="flex shrink-0 items-center gap-2 text-sky-600">
          <Gauge size={22} weight="duotone" />
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
            {t('Pressão')}
          </span>
        </div>

        <input
          type="text"
          value={readPressure.toString()}
          disabled={true}
          className="h-10 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-center text-base font-semibold text-zinc-700 outline-none tabular-nums"
        />

        <Button
          filled={true}
          size="medium"
          className="h-10 w-full shrink-0 sm:w-auto"
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
