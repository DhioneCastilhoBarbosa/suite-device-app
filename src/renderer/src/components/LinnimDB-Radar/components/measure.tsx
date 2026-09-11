import Button from '@renderer/components/button/Button'
import LoadingData from '@renderer/components/loading/loadingData'
import { Device } from '../../../Context/DeviceContext'
import { readModbusData } from '../../../utils/modbusRTU'
import { useState, type ReactNode } from 'react'
import { t } from 'i18next'
import { Compass, Drop, Ruler, Thermometer, Vibrate, ArrowsOutCardinal } from '@phosphor-icons/react'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatFloat(value: number) {
  return value.toFixed(3).replace('.', ',')
}

function formatFlag(value: number) {
  return Number.isFinite(value) ? String(Math.round(value)) : '0'
}

type RadarReading = {
  key: 'distance' | 'axisX' | 'axisY' | 'temperature' | 'humidity' | 'vibration'
  label: string
  unit?: string
  icon: ReactNode
  address: number
}

export default function Measure() {
  const [values, setValues] = useState<Record<RadarReading['key'], number>>({
    distance: 0,
    axisX: 0,
    axisY: 0,
    temperature: 0,
    humidity: 0,
    vibration: 0
  })
  const [isLoading, setIsLoading] = useState(false)
  const { mode }: any = Device()

  const readings: RadarReading[] = [
    {
      key: 'distance',
      label: t('Distância'),
      icon: <Ruler size={18} weight="duotone" />,
      address: 2
    },
    {
      key: 'axisX',
      label: t('Eixo X'),
      icon: <Compass size={18} weight="duotone" />,
      address: 4
    },
    {
      key: 'axisY',
      label: t('Eixo Y'),
      icon: <ArrowsOutCardinal size={18} weight="duotone" />,
      address: 6
    },
    {
      key: 'temperature',
      label: t('Temperatura'),
      unit: '°C',
      icon: <Thermometer size={18} weight="duotone" />,
      address: 8
    },
    {
      key: 'humidity',
      label: t('Umidade'),
      unit: '%',
      icon: <Drop size={18} weight="duotone" />,
      address: 10
    },
    {
      key: 'vibration',
      label: t('Flag Vibração'),
      icon: <Vibrate size={18} weight="duotone" />,
      address: 12
    }
  ]

  async function handleModbus() {
    if (mode.state) return
    try {
      setIsLoading(true)
      const next = { ...values }
      for (const reading of readings) {
        // Mesma chamada do CAP (holding float, 2 registradores); só muda o endereço.
        const data = await readModbusData(reading.address, 2, false, true, 1000)
        next[reading.key] = data as number
        await delay(200)
      }
      setValues(next)
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

      <div className="rounded-md border border-zinc-200 bg-white px-3 py-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {readings.map((reading) => (
            <div key={reading.key} className="flex min-w-0 items-center gap-2">
              <div className="flex w-28 shrink-0 items-center gap-1.5 text-sky-600">
                {reading.icon}
                <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
                  {reading.label}
                </span>
              </div>
              <input
                type="text"
                value={
                  reading.key === 'vibration'
                    ? formatFlag(values[reading.key])
                    : formatFloat(values[reading.key])
                }
                disabled={true}
                className="h-8 min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-center text-sm font-semibold text-zinc-700 outline-none tabular-nums"
              />
              {reading.unit ? (
                <span className="w-6 shrink-0 text-xs font-semibold text-zinc-500">{reading.unit}</span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-3 flex justify-end">
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
      </div>

      <LoadingData visible={isLoading} title={t('Solicitando dados de medição ao dispositivo!')} />
    </div>
  )
}
