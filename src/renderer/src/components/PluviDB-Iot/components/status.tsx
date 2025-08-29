import { ArrowsClockwise, CellSignalX, DownloadSimple } from '@phosphor-icons/react'
import Button from '@renderer/components/button/Button'
import { ModalSaveReport } from '@renderer/components/modal/modalSaveReport'
import { useEffect, useState } from 'react'
import { saveAs } from 'file-saver'

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
    { id: 1, name: 'Nome:', value: arrayData[1] },
    { id: 2, name: 'Patrimônio:', value: arrayData[19] },
    { id: 3, name: 'Número de série:', value: arrayData[14] },
    {
      id: 4,
      name: 'Latitude,Longitude,Altitude:',
      value: `${arrayDataGL[0]}, ${arrayDataGL[1]}, ${arrayDataGL[2]}`
    },
    { id: 5, name: 'Data e hora:', value: arrayData[15] },

    { id: 6, name: 'IP:', value: arrayData[17].replace(/^"(.*)"$/, '$1') },
    { id: 7, name: 'ICCID:', value: arrayData[16] },
    { id: 8, name: 'IMEI:', value: arrayData[8] },
    { id: 9, name: 'Versão do Firmware:', value: arrayData[9] },
    { id: 10, name: 'Versão do Hardware:', value: arrayData[10] },
    { id: 11, name: 'ProgSig:', value: arrayData[20] },
    { id: 12, name: 'Contador de boot:', value: arrayData[18] },
    { id: 13, name: 'Start time:', value: arrayData[11] }
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
    const headerFile = 'Dados do relatório do PluviDB-IoT - '
    const date = new Date().toLocaleString()
    const Data = headerFile + date + '\n \n' + dataSave.join('').replace(/!/g, '')
    const blob = new Blob([Data], { type: 'text/plain;charset=utf-8' })
    const dateObj = new Date(
      date.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/, '$3-$2-$1T$4:$5:$6')
    )
    // Formatando a data no formato desejado
    const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}${(dateObj.getMonth() + 1).toString().padStart(2, '0')}${dateObj.getFullYear().toString().slice(-2)}-${dateObj.getHours().toString().padStart(2, '0')}${dateObj.getMinutes().toString().padStart(2, '0')}${dateObj.getSeconds().toString().padStart(2, '0')}`
    console.log(formattedDate)

    saveAs(blob, `relatorio-PluviDB-IoT_${formattedDate}.txt`)
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
    <div className="flex flex-col mt-1">
      <div className="flex flex-row justify-around bg-sky-500 h-16 rounded-md ">
        <div className="flex flex-row items-center  bg-white m-0.5 rounded-md border-2 border-white w-64">
          <div className="flex flex-row justify-center items-center gap-8 p-1 border-2 border-sky-500 rounded-l-md w-full h-full">
            <div className="flex flex-col items-center text-sky-500 ">
              <span className="flex flex-row justify-center items-baseline font-bold text-base ml-2 ">
                {arrayData[4]}
              </span>
              <div className="flex flex-row items-center justify-center gap-1.5">
                <div className="relative flex flex-row items-end gap-[2px] w-[28px] h-[24px]">
                  {getSignalBars() === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-red-500 text-xs font-bold">
                      <CellSignalX weight="bold" size={36} />
                    </div>
                  ) : (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className={`w-[3px] transition-all rounded-sm ${
                          index < getSignalBars() ? 'bg-sky-500' : 'bg-gray-300'
                        }`}
                        style={{ height: `${(index + 1) * 20}%` }}
                      />
                    ))
                  )}
                </div>
                <span className="text-[12px] font-bold mt-1">{`${arrayData[2]} dBm`}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center  bg-sky-500  rounded-r-md w-full h-full ">
            <span className=" font-light text-white text-[12px]">{arrayData[6]}</span>
            <span className=" font-light text-white text-[12px]">{arrayData[5]}</span>
          </div>
        </div>
        <div className="flex flex-col justify-center  bg-white m-0.5 rounded-md border-2 border-white">
          <div className="flex flex-col justify-start  gap-1 p-1 border-2 border-sky-500 rounded-md h-full w-auto">
            <div>
              <span className="flex flex-row justify-center items-baseline font-bold text-base ml-2 text-sky-500 ">
                Transmissão
              </span>

              <div className="flex flex-row items-center gap-4">
                <div className="flex flex-row justify-center items-center gap-2 text-[12px] ">
                  <span>Protocolo utilizado:</span>
                  <span className="font-bold">{arrayData[0].toUpperCase()}</span>
                </div>

                <div className="flex flex-row justify-center items-center gap-2 text-[12px]">
                  <span>Última transmissão:</span>
                  <span className="font-bold">{arrayData[7]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center  bg-white m-0.5 rounded-md border-2 border-white">
          <div className="flex flex-col justify-center items-center p-1 border-2 border-sky-500 rounded-md h-full w-auto">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center ">
                {/* Corpo da bateria */}
                <div className="flex flex-row items-center gap-[3px] border-2 border-sky-500 rounded-md p-[3px] w-[48px] h-[24px]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-[5px] h-full rounded-sm ${
                        index < getBatteryBars() ? 'bg-sky-500' : ''
                      }`}
                    />
                  ))}
                </div>
                {/* Terminal da bateria */}
                <div className="w-[4px] h-[12px] bg-sky-500 ml-[2px] rounded-sm" />
              </div>
              <span className="text-[12px] font-bold mt-1">{`${arrayData[3]} Volts`}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="my-2">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-900 uppercase text-sm leading-normal">
                <th className="py-0.5 px-4 text-left">Informações do dispositivo</th>
                <th className="py-0.5 px-4 text-left"></th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {data.map((item) => (
                <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-0.5 px-4 text-left font-bold text-gray-500">{item.name}</td>
                  <td className="py-0.5 px-4 text-left font-semibold text-gray-400">
                    {item.value}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-200 text-gray-700 text-sm leading-normal rounded-b-lg ">
                <td className="py-2 px-4 text-left rounded-bl-lg" colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <div className="flex flex-col justify-evenly bg-white h-auto rounded-md  border-2 border-sky-500">
        <div className="bg-sky-500 text-white p-0.5 ">
          <span className="font-bold">Relatório:</span>
        </div>
        <div className="flex flex-row justify-between items-center my-1 mx-2">
          <div className="flex flex-col justify-center items-start gap-2">
            <div className="flex flex-row gap-2">
              <span className="font-bold">Número de registros:</span>
              <span>{arrayData[12]}</span>
            </div>
            <div className="flex flex-row gap-2">
              <span>Memória utilizada:</span>
              <span>{arrayData[13]}%</span>
            </div>
          </div>
          <Button
            size={'medium'}
            className="bg-white text-sky-500 px-1 py-5"
            onClick={handleDowReport}
          >
            <DownloadSimple size={24} />
            Coletar relatórios
          </Button>
        </div>
      </div>
      <div className="flex justify-end mt-1 border-t-[1px] border-gray-200 pt-2 w-full gap-4">
        <Button onClick={handleUpdateStatus}>
          <ArrowsClockwise size={24} />
          Atualizar
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
