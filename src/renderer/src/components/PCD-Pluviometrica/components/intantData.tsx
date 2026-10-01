import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  receivedDataInst: string | undefined
  //handleSendSettings?: (settings: string[]) => void
  handleUpdateInst: () => void
}

const INSTANT_LABELS = [
  { id: 1, nameKey: 'Chuva P1 instantânea(mm):' },
  { id: 2, nameKey: 'Chuva P1 diária(mm):' },
  { id: 3, nameKey: 'Chuva P1 mensal(mm):' },
  { id: 4, nameKey: 'Chuva P1 anual(mm):' },
  { id: 5, nameKey: 'Chuva P1 Total(mm):' },
  { id: 6, nameKey: 'Chuva P2 instantânea(mm):' },
  { id: 7, nameKey: 'Chuva P2 diária(mm):' },
  { id: 8, nameKey: 'Chuva P2 mensal(mm):' },
  { id: 9, nameKey: 'Chuva P2 anual(mm):' },
  { id: 10, nameKey: 'Chuva P2 Total(mm):' },
  { id: 11, nameKey: 'Bateria(V):' },
  { id: 12, nameKey: 'Sinal(dBm):' },
  { id: 13, nameKey: 'Contador de boot:' }
] as const

const DEFAULT_VALUES = [
  '0.00',
  '0.00',
  '0.00',
  '0.00',
  '0.00',
  '0.00',
  '0.00',
  '0.00',
  '0.00',
  '0.00',
  '0.0',
  '0',
  '0'
]

export function InstantData({ receivedDataInst, handleUpdateInst }: Props): JSX.Element {
  const { t } = useTranslation()
  const [selected] = useState('5')
  const [date, setDate] = useState('00/00/00 00:00:00')
  const [values, setValues] = useState<string[]>(DEFAULT_VALUES)

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleUpdateInst()
    }, 500) // Aguarda 500ms antes de executar a função
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const matchInst = receivedDataInst ? receivedDataInst.match(/inst=([\d.;-]+)!/) : null
    const valuesArray = matchInst ? matchInst[1].split(';') : []
    //console.log('valuesArray:', valuesArray.length)
    setValues((prevValues) =>
      prevValues.map((value, index) => valuesArray[index] ?? value)
    )

    const matchDate = receivedDataInst ? receivedDataInst.match(/dt=(.*)!/) : null
    const dateArray = matchDate ? matchDate[1] : ''
    setDate(dateArray)
  }, [receivedDataInst])

  useEffect(() => {
    const interval = setInterval(
      () => {
        handleUpdateInst()
      },
      Number(selected) * 1000
    )
    return () => clearInterval(interval)
  }, [selected])

  return (
    <div className="my-2">
      <div className="overflow-x-auto">
        <table className="min-w-full rounded-lg border border-sky-100 bg-white shadow-sm">
          <thead>
            <tr className="border-b border-sky-600 bg-sky-500 text-sm uppercase leading-normal">
              <th className="px-6 py-1 text-left text-xs font-bold tracking-wide text-white">
                {t('Dados Instantâneos')}
              </th>

              <th className="flex items-center justify-end gap-1">
                <label className="mt-1 text-xs font-medium text-white/90">
                  {t('Totalização a cada 60 segundos')}
                </label>
                <span className="ml-2"></span>
              </th>
            </tr>
          </thead>
          <tbody className="text-sm font-light text-zinc-600">
            <tr className="border-b border-sky-100 hover:bg-sky-50/60">
              <td className="px-6 py-1 text-left font-bold text-zinc-500">{t('Data/Hora:')}</td>
              <td className="flex items-end justify-center px-6 py-1.5 text-left text-md font-semibold text-sky-700/80">
                {date}
              </td>
            </tr>
            {INSTANT_LABELS.map((item, index) => (
              <tr key={item.id} className="border-b border-sky-100 hover:bg-sky-50/60">
                <td className="px-6 py-1 text-left font-bold text-zinc-500">{t(item.nameKey)}</td>
                <td className="flex items-end justify-center px-6 py-1.5 text-left text-md font-semibold text-sky-700/80">
                  {values[index]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
