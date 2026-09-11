import LoadingData from '@renderer/components/loading/loadingData'
import Button from '@renderer/components/button/Button'
import { Device } from '../../../Context/DeviceContext'
import { readModbusData } from '../../../utils/modbusRTU'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { t } from 'i18next'
import {
  HardDrives,
  Cpu,
  Circuitry,
  Tag,
  Ruler,
  ArrowsClockwise
} from '@phosphor-icons/react'

type InfoItem = {
  label: string
  value?: string
  icon: ReactNode
}

function InfoField({ label, value, icon }: InfoItem) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-sky-100 bg-gradient-to-br from-[#F7FBFF] to-white px-3.5 py-3 shadow-sm">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sky-500/10 text-sky-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{label}</p>
        <p className="mt-1 truncate text-sm font-semibold text-sky-700 tabular-nums">
          {value || 'NAN'}
        </p>
      </div>
    </div>
  )
}

const MODBUS_CALLS = [
  { address: 288, register: 4, Int16: false, float32: false },
  { address: 256, register: 8, Int16: false, float32: false },
  { address: 320, register: 4, Int16: false, float32: false },
  { address: 304, register: 4, Int16: false, float32: false },
  { address: 272, register: 8, Int16: false, float32: false }
]

export default function Information() {
  const [modbusData, setModbusData] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { mode }: any = Device()

  const fetchData = useCallback(async () => {
    if (mode.state) return

    setIsLoading(true)
    setModbusData([])
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const results: string[] = []
      for (const { address, register, Int16, float32 } of MODBUS_CALLS) {
        const data = await readModbusData(address, register, Int16, float32, 250)
        results.push(data as string)
        await new Promise((resolve) => setTimeout(resolve, 300))
      }
      setModbusData(results)
    } catch (error) {
      // ignore
    } finally {
      setTimeout(() => setIsLoading(false), 500)
    }
  }, [mode.state])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const fields: InfoItem[] = [
    {
      label: t('Número de Série'),
      value: modbusData[0],
      icon: <HardDrives size={18} weight="duotone" />
    },
    {
      label: t('Modelo'),
      value: modbusData[1],
      icon: <Tag size={18} weight="duotone" />
    },
    {
      label: t('Versão do Firmware'),
      value: modbusData[2],
      icon: <Cpu size={18} weight="duotone" />
    },
    {
      label: t('Versão do Hardware'),
      value: modbusData[3],
      icon: <Circuitry size={18} weight="duotone" />
    },
    {
      label: t('Faixa de medição'),
      value: modbusData[4],
      icon: <Ruler size={18} weight="duotone" />
    }
  ]

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <InfoField key={field.label} {...field} />
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button size="medium" onClick={() => void fetchData()} disabled={isLoading || mode.state}>
          <ArrowsClockwise size={20} />
          {t('Atualizar')}
        </Button>
      </div>

      <LoadingData visible={isLoading} title={t('Baixando informações do dispositivo!')} />
    </div>
  )
}
