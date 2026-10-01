import { DownloadSimple, UploadSimple } from '@phosphor-icons/react'
import { Device } from '../../../Context/DeviceContext'
import Button from '@renderer/components/button/Button'
import LoadingData from '@renderer/components/loading/loadingData'
import { selectFile } from '@renderer/utils/fileUtils'
import { IdModBus, WriteModbus, readModbusData } from '../../../utils/modbusRTU'
import { useEffect, useState } from 'react'
import { t } from 'i18next'

const RADAR_DISPLAY_UNITS = ['mm', 'cm', 'm', 'in', 'ft'] as const
type RadarDisplayUnit = (typeof RADAR_DISPLAY_UNITS)[number]
/** Unidade real no Modbus (endereço 336): sempre mm. cm/m/in/ft são só de tela. */
const RADAR_DEVICE_UNIT_MM = 0

export default function Settings() {
  const [modbusData, setModbusData] = useState<string[]>([])
  const [address, setAddress] = useState(0)
  const [unit, setUnit] = useState(RADAR_DEVICE_UNIT_MM)
  const [coefA, setCoefA] = useState(0)
  const [coefB, setCoefB] = useState(0)
  const { mode }: any = Device()
  const [fileContent, setFileContent] = useState<string>('')
  const [inptsData, setInptsData] = useState<number[]>([1, 0, 0, 0])
  const [displayUnit, setDisplayUnit] = useState<RadarDisplayUnit>('mm')
  const [sendData, setSendData] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [titleLoading, setTitleLoading] = useState(t('Baixando informações do dispositivo!'))

  const fetchData = async () => {
    setTitleLoading(t('Baixando informações do dispositivo!'))
    setIsLoading(true)
    try {
      const modbusCalls = [
        { address: 255, register: 1, Int16: true, float32: false },
        { address: 336, register: 1, Int16: true, float32: false },
        { address: 352, register: 2, Int16: false, float32: true },
        { address: 368, register: 2, Int16: false, float32: true }
      ]

      const results: string[] = []
      for (const { address, register, Int16, float32 } of modbusCalls) {
        const data = await readModbusData(address, register, Int16, float32, 250)
        results.push(data as string)
      }
      setModbusData(results)
    } catch (error) {
      setIsLoading(false)
    }
  }

  const WriteCoil = async () => {
    try {
      setIsLoading(true)
      setTitleLoading(t('Enviando informações para o dispositivo!'))
      // Espera 500 milissegundos antes de fazer a chamada Modbus
      await new Promise((resolve) => setTimeout(resolve, 500))
      //console.log(inptsData[0], inptsData[1], inptsData[2], inptsData[3])

      // Array de chamadas Modbus com argumentos específicos
      const modbusCalls = [
        { address: 368, register: coefB, type: 'float' },
        { address: 352, register: coefA, type: 'float' },
        { address: 336, register: RADAR_DEVICE_UNIT_MM, type: 'int' },
        { address: 255, register: address, type: 'int' }
      ]

      // Função para fazer chamadas Modbus em sequência
      const makeModbusCalls = async (calls) => {
        for (let i = 0; i < calls.length; i++) {
          const { address, register, type } = calls[i]
          //console.log(`Writing to address ${address} with value ${register}`)
          await WriteModbus(address, register, type)
          await new Promise((resolve) => setTimeout(resolve, 300)) // Aguarda 300ms antes de fazer a próxima chamada
        }
      }

      // Chama a função para fazer as chamadas Modbus
      await makeModbusCalls(modbusCalls)

      // Chama a função para alterar o endereço do device
      await IdModBus(address)
      //console.log(`IdModBus called with address: ${address}`)
      setSendData(false)
    } catch (error) {
      console.error('Erro ao fazer chamadas Modbus:', error)
      setSendData(false)
    } finally {
      setTimeout(() => setIsLoading(false), 1000)
    }
  }

  useEffect(() => {
    if (!mode.state) {
      fetchData()
    }
  }, [])

  useEffect(() => {
    if (modbusData.length >= 4) {
      updateValueInputs(0, modbusData[0])
      updateValueInputs(2, modbusData[2])
      updateValueInputs(3, modbusData[3])
      setDisplayUnit('mm')
      setIsLoading(false)
    }
  }, [modbusData])

  useEffect(() => {
    if (fileContent === '') {
      // Não faz nada se fileContent está vazio
    } else {
      //console.log('conteúdo do arquivo', fileContent)
    }
  }, [fileContent])

  const updateData = (index, event) => {
    const newValue = Number(event.target.value)
    setInptsData((prevState) => {
      const newArray = [...prevState] // Cria uma cópia do array atual
      newArray[index] = newValue // Atualiza o valor no índice específico
      return newArray
    })
  }

  const updateValueInputs = (index, value) => {
    const newValue = value
    setInptsData((prevState) => {
      const newArray = [...prevState] // Cria uma cópia do array atual
      newArray[index] = newValue // Atualiza o valor no índice específico
      return newArray
    })
  }

  const handleSelectFile = () => {
    const handleFileContentLoad = (content) => {
      setFileContent(content)
    }

    selectFile(handleFileContentLoad, 'txt')
  }

  const handleSendSettings = async () => {
    setAddress(inptsData[0])
    setUnit(RADAR_DEVICE_UNIT_MM)
    setCoefA(inptsData[2])
    setCoefB(inptsData[3])

    setSendData(true)
  }

  useEffect(() => {
    //console.log(address, unit, coefA, coefB)
    if (sendData === true) {
      WriteCoil()
    }
  }, [address, unit, coefA, coefB])

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-3 sm:px-6">
      <div className="rounded-md border border-zinc-200 bg-white p-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
              {t('Endereço MODBUS')}
            </label>
            <input
              type="number"
              className="h-8 w-full rounded-md border border-zinc-300 bg-white px-3 text-center text-sm text-zinc-700 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-300"
              min={1}
              value={inptsData[0] === 0 ? '' : inptsData[0]}
              onChange={(event) => updateData(0, event)}
              inputMode="numeric"
            />
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
              {t('Unidade')}
            </label>
            <select
              name="unidade"
              id="unidade"
              value={displayUnit}
              onChange={(event) => setDisplayUnit(event.target.value as RadarDisplayUnit)}
              className="h-8 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-300"
            >
              {RADAR_DISPLAY_UNITS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-1">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
            {t('Coeficiente')}
          </label>
          <div className="flex items-end justify-center gap-3 rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-2">
            <div className="flex w-28 flex-col gap-1">
              <span className="text-center text-xs font-medium text-zinc-500">Ax</span>
              <input
                type="number"
                className="h-8 w-full rounded-md border border-zinc-300 bg-white text-center text-sm text-zinc-700 outline-none focus:border-sky-400"
                min={-9999}
                value={inptsData[2].toFixed(2)}
                onChange={(event) => updateData(2, event)}
              />
            </div>
            <span className="mb-2 text-lg font-semibold text-sky-500">+</span>
            <div className="flex w-28 flex-col gap-1">
              <span className="text-center text-xs font-medium text-zinc-500">B</span>
              <input
                type="number"
                className="h-8 w-full rounded-md border border-zinc-300 bg-white text-center text-sm text-zinc-700 outline-none focus:border-sky-400"
                min={-9999}
                value={inptsData[3].toFixed(2)}
                onChange={(event) => updateData(3, event)}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-row flex-wrap justify-center gap-2">
          <Button size="large" onClick={fetchData}>
            <DownloadSimple size={22} />
            {t('Baixar informações')}
          </Button>
          <Button size="large" onClick={handleSendSettings}>
            <UploadSimple size={22} />
            {t('Enviar configurações')}
          </Button>
        </div>
      </div>

      <LoadingData visible={isLoading} title={titleLoading} />
    </div>
  )
}
