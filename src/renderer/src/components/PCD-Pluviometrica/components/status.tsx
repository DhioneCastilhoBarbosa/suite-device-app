import { ArrowsClockwise, CellSignalX, DownloadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { ModalSaveReport } from '@renderer/components/modal/modalSaveReport'
import { useEffect, useState } from 'react'
import { saveAs } from 'file-saver'
import { t } from 'i18next'
import { sanitizePcdTxtExport } from '../sanitizePcdTxt'

type Props = {
  receivedDataStatus: string | undefined
  receivedDataGeolocation: string | undefined
  handleUpdateStatus: () => void
  handleSendDownReport: (valuer: string) => void
  handleSendInfoReport: (valuer: string) => void
  receivedDataDownReport: string | undefined
  receivedInfoMemory: string | undefined
  handleClearDataMemory: () => void
}

export default function Status({
  receivedDataStatus,
  receivedDataGeolocation,
  handleUpdateStatus,
  handleSendDownReport,
  handleSendInfoReport,
  receivedDataDownReport,
  receivedInfoMemory,
  handleClearDataMemory
}: Props): JSX.Element {
  const [arrayData, setArrayData] = useState(Array(21).fill('N/A'))
  const [arrayDataGL, setArrayDataGL] = useState(Array(3).fill('N/A'))
  const [showModalSaveReport, setShowModalSaveReport] = useState(false)
  const [isLoadingModalSaveReport, setIsLoadingModalSaveReport] = useState(false)
  const [isLoadingAll, setIsLoadingAll] = useState(false)
  const [dataSave, setDataSave] = useState<string[]>([])
  const [limit, setLimit] = useState('0')
  const data = [
    { id: 1, name: t('Nome:'), value: arrayData[1] },
    { id: 2, name: t('Patrimônio:'), value: arrayData[19] },
    { id: 3, name: t('Número de série:'), value: arrayData[14] },
    {
      id: 4,
      name: t('Latitude,Longitude,Altitude:'),
      value: `${arrayDataGL[0]}, ${arrayDataGL[1]}, ${arrayDataGL[2]}`
    },
    { id: 5, name: t('Data e hora:'), value: arrayData[15] },

    { id: 6, name: t('IP:'), value: arrayData[17].replace(/^"(.*)"$/, '$1') },
    { id: 7, name: t('ICCID:'), value: arrayData[16] },
    { id: 8, name: t('IMEI:'), value: arrayData[8] },
    { id: 9, name: t('Versão do Firmware:'), value: arrayData[9] },
    { id: 10, name: t('Versão do Hardware:'), value: arrayData[10] },
    { id: 11, name: t('ProgSig:'), value: arrayData[20] },
    { id: 12, name: t('Contador de boot:'), value: arrayData[18] },
    { id: 13, name: t('Start time:'), value: arrayData[11] }
  ]

  function handleSaveReport(number: number, all: boolean): void {
    console.log('Salvando relatório com', number, 'registro')
    setDataSave([])

    if (all) {
      setIsLoadingAll(true)
    } else {
      setIsLoadingModalSaveReport(true)
    }
    handleSendDownReport(number.toString())
  }

  function handleDowReport(): void {
    handleSendInfoReport('info')
    setShowModalSaveReport(true)
  }

  const handleSaveToFile = (): void => {
    setShowModalSaveReport(false)
    const headerFile = t('Dados do relatório da PCD Pluviométrica - ')
    const date = new Date().toLocaleString()
    const Data = sanitizePcdTxtExport(
      headerFile + date + '\n \n' + dataSave.join('').replace(/!/g, '')
    )
    const blob = new Blob([Data], { type: 'text/plain;charset=utf-8' })
    const dateObj = new Date(
      date.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:$6')
    )
    // Formatando a data no formato desejado
    const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}${(dateObj.getMonth() + 1).toString().padStart(2, '0')}${dateObj.getFullYear().toString().slice(-2)}-${dateObj.getHours().toString().padStart(2, '0')}${dateObj.getMinutes().toString().padStart(2, '0')}${dateObj.getSeconds().toString().padStart(2, '0')}`
    console.log(formattedDate)

    saveAs(blob, sanitizePcdTxtExport(t(`relatorio-PCD-Pluviometrica_${formattedDate}.txt`)))
    setDataSave([])
    handleClearDataMemory()
  }

  function handleCloseModal(): void {
    setShowModalSaveReport(false)
  }

  const getSignalBars = (): number => {
    const signal = parseInt(arrayData[2])

    // Valores que indicam desconectado
    if (isNaN(signal) || signal === 0 || signal === 255) return 0

    // 0 barras: pior que -130 dBm
    if (signal < -130) return 0

    // 1 barra: entre -130 e -120
    if (signal >= -130 && signal < -120) return 1

    // 2 barras: entre -120 e -110
    if (signal >= -120 && signal < -110) return 2

    // 3 barras: entre -110 e -100
    if (signal >= -110 && signal < -100) return 3

    // 4 barras: entre -100 e -90
    if (signal >= -100 && signal < -90) return 4

    // 5 barras: melhor que -90
    return 5
  }

  const getBatteryBars = (): number => {
    const voltage = parseFloat(arrayData[3])
    if (isNaN(voltage)) return 0
    if (voltage < 3.1) return 1
    if (voltage < 3.2) return 2
    if (voltage < 3.3) return 3
    if (voltage < 3.4) return 4
    return 5 // 3.4 ou mais sempre mostra 5 barras
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleUpdateStatus()
      console.log('dado de geolocalizacao', receivedDataGeolocation)
    }, 500) // Aguarda 500ms antes de executar a função

    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (!receivedDataStatus) return

    // Divide a string por "!" e remove itens vazios
    const valuesArray = receivedDataStatus.split('!').filter(Boolean)

    // Extraímos apenas os valores após "="
    const extractedValues = valuesArray.map((item) => item.split('=')[1] || '')

    //console.log('extractedValues:', extractedValues)

    setArrayData((prevData) =>
      prevData.map((_, index) => extractedValues[index] ?? prevData[index])
    )

    if (receivedDataDownReport) {
      //console.log('receivedDataDownReport:', receivedDataDownReport)
      setIsLoadingModalSaveReport(false)
      setIsLoadingAll(false)
      setDataSave(receivedDataDownReport.split('!'))
    }

    if (!receivedDataGeolocation) return
    console.log('receivedDataGeolocation:', receivedDataGeolocation)
    const valuesArrayGL = receivedDataGeolocation?.split('!').filter(Boolean)
    const extractedValuesGL = valuesArrayGL?.flatMap((item) => {
      const afterEqual = item.split('gl=')[1] || ''
      return afterEqual.split(';').filter(Boolean)
    })
    console.log('extractedValuesGL', extractedValuesGL)

    setArrayDataGL((prevDataGL) =>
      prevDataGL.map((_, index) => extractedValuesGL[index] ?? prevDataGL[index])
    )
    console.log('extractedValuesGL', arrayDataGL)

    if (receivedInfoMemory) {
      //console.log('receivedInfoMemory:', receivedInfoMemory)
      const match = receivedInfoMemory.match(/used:(\d+)/)
      console.log('match:', match ? match[1] : 0)
      setLimit(match ? match[1] : '0')
    }
  }, [receivedDataStatus, receivedInfoMemory, receivedDataDownReport, receivedDataGeolocation])

  useEffect(() => {
    if (Array.isArray(dataSave) && dataSave.length > 0) {
      //console.log('Salvar arquivo')
      handleSaveToFile()
      teste()
    }
  }, [dataSave])

  function teste(): void {
    setDataSave([])
    handleClearDataMemory()
  }

  return (
    <div className="mt-1 flex flex-col">
      <div className="flex h-16 flex-row justify-around rounded-md border border-sky-100 bg-gradient-to-br from-[#F7FBFF] to-white">
        <div className="m-0.5 flex w-64 flex-row items-center overflow-hidden rounded-md border border-sky-200 bg-white">
          <div className="flex h-full w-full flex-row items-center justify-center gap-8 p-1">
            <div className="flex flex-col items-center text-sky-600">
              <span className="ml-2 flex flex-row items-baseline justify-center text-base font-bold">
                {arrayData[4]}
              </span>
              <div className="flex flex-row items-center justify-center gap-1.5">
                <div className="relative flex h-[24px] w-[28px] flex-row items-end gap-[2px]">
                  {getSignalBars() === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-red-500">
                      <CellSignalX weight="bold" size={36} />
                    </div>
                  ) : (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className={`w-[3px] rounded-sm transition-all ${
                          index < getSignalBars() ? 'bg-sky-400' : 'bg-sky-100'
                        }`}
                        style={{ height: `${(index + 1) * 20}%` }}
                      />
                    ))
                  )}
                </div>
                <span className="mt-1 text-[12px] font-bold">{`${arrayData[2]} dBm`}</span>
              </div>
            </div>
          </div>
          <div className="flex h-full w-full flex-col items-center justify-center rounded-r-md border-l border-sky-100 bg-[#E8F4FC]">
            <span className="text-[12px] font-medium text-sky-700">{arrayData[6]}</span>
            <span className="text-[12px] font-medium text-sky-700">{arrayData[5]}</span>
          </div>
        </div>
        <div className="m-0.5 flex flex-col justify-center overflow-hidden rounded-md border border-sky-200 bg-white">
          <div className="flex h-full w-auto flex-col justify-start gap-1 p-1">
            <div>
              <span className="ml-2 flex flex-row items-baseline justify-center text-base font-bold text-sky-800">
                {t('Transmissão')}
              </span>

              <div className="flex flex-row items-center gap-4">
                <div className="flex flex-row items-center justify-center gap-2 text-[12px] text-zinc-600">
                  <span>{t('Protocolo utilizado:')}</span>
                  <span className="font-bold text-sky-700">{arrayData[0].toUpperCase()}</span>
                </div>

                <div className="flex flex-row items-center justify-center gap-2 text-[12px] text-zinc-600">
                  <span>{t('Última transmissão:')}</span>
                  <span className="font-bold text-sky-700">{arrayData[7]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="m-0.5 flex flex-col justify-center overflow-hidden rounded-md border border-sky-200 bg-white">
          <div className="flex h-full w-auto flex-col items-center justify-center p-1">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center">
                <div className="flex h-[24px] w-[48px] flex-row items-center gap-[3px] rounded-md border border-sky-300 p-[3px]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-full w-[5px] rounded-sm ${
                        index < getBatteryBars() ? 'bg-sky-400' : 'bg-sky-100'
                      }`}
                    />
                  ))}
                </div>
                <div className="ml-[2px] h-[12px] w-[4px] rounded-sm bg-sky-300" />
              </div>
              <span className="mt-1 text-[12px] font-bold text-sky-700">{`${arrayData[3]} Volts`}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="my-2">
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-lg border border-sky-100 bg-white shadow-sm">
            <thead>
              <tr className="border-b border-sky-600 bg-sky-500 text-sm uppercase leading-normal">
                <th className="px-4 py-1 text-left text-xs font-bold tracking-wide text-white">
                  {t('Informações do dispositivo')}
                </th>
                <th className="px-4 py-1 text-left"></th>
              </tr>
            </thead>
            <tbody className="text-sm font-light text-zinc-600">
              {data.map((item) => (
                <tr key={item.id} className="border-b border-sky-100 hover:bg-sky-50/60">
                  <td className="px-4 py-0.5 text-left font-bold text-zinc-500">{item.name}</td>
                  <td className="px-4 py-0.5 text-left font-semibold text-sky-700/80">
                    {item.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex h-auto flex-col justify-evenly overflow-hidden rounded-md border border-sky-100 bg-white shadow-sm">
        <div className="border-b border-sky-600 bg-sky-500 px-2 py-1">
          <span className="text-xs font-bold uppercase tracking-wide text-white">
            {t('Relatório:')}
          </span>
        </div>
        <div className="mx-2 my-1 flex flex-row items-center justify-between">
          <div className="flex flex-col items-start justify-center gap-2 text-zinc-600">
            <div className="flex flex-row gap-2">
              <span className="font-bold text-zinc-500">{t('Número de registros:')}</span>
              <span className="font-semibold text-sky-700">{arrayData[12]}</span>
            </div>
            <div className="flex flex-row gap-2">
              <span>{t('Memória utilizada:')}</span>
              <span className="font-semibold text-sky-700">{arrayData[13]}%</span>
            </div>
          </div>
          <Button size="medium" className="px-3 py-2.5" onClick={handleDowReport}>
            <DownloadSimple size={22} />
            {t('Coletar relatórios')}
          </Button>
        </div>
      </div>
      <div className="mt-1 flex w-full justify-end gap-4 border-t border-sky-100 pb-4 pt-2">
        <Button onClick={handleUpdateStatus}>
          <ArrowsClockwise size={24} />
          {t('Atualizar')}
        </Button>
      </div>
      <ModalSaveReport
        show={showModalSaveReport}
        onClose={handleCloseModal}
        limit={limit}
        handleSaveToFile={handleSaveReport}
        isLoading={isLoadingModalSaveReport}
        isLoadingAll={isLoadingAll} // Add the appropriate value for isLoadingAll
      />
    </div>
  )
}
