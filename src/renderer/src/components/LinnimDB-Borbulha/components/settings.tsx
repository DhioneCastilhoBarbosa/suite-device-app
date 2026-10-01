import { DownloadSimple, UploadSimple } from '@phosphor-icons/react'
import { Device } from '../../../Context/DeviceContext'
import Button from '@renderer/components/button/Button'
import LoadingData from '@renderer/components/loading/loadingData'
import { selectFile } from '@renderer/utils/fileUtils'
import { IdModBus, WriteModbus, readModbusData } from '../../../utils/modbusRTU'
import { useEffect, useState } from 'react'
import { t } from 'i18next'

export default function Settings() {
  const [modbusData, setModbusData] = useState<string[]>([])
  const [address, setAddress] = useState(0)
  const [unit, setUnit] = useState(0)
  const [coefA, setCoefA] = useState(0)
  const [coefB, setCoefB] = useState(0)
  const [timeStability, setTimeStability] = useState(0)
  const [timePumping, setTimePumping] = useState(0)
  const { mode }: any = Device()
  const [fileContent, setFileContent] = useState<string>('')
  const [inptsData, setInptsData] = useState<number[]>([1, 7, 0, 0, 1, 1])
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
        { address: 368, register: 2, Int16: false, float32: true },
        { address: 372, register: 1, Int16: true, float32: false },
        { address: 376, register: 1, Int16: true, float32: false }
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
        { address: 336, register: unit, type: 'int' },
        { address: 255, register: address, type: 'int' },
        { address: 372, register: timePumping, type: 'int' },
        { address: 376, register: timeStability, type: 'int' }
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
    if (modbusData.length >= 6) {
      for (let i = 0; i < modbusData.length; i++) {
        updateValueInputs(i, modbusData[i])
      }
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
    setUnit(inptsData[1])
    setCoefA(inptsData[2])
    setCoefB(inptsData[3])
    setTimePumping(inptsData[4])
    setTimeStability(inptsData[5])

    //console.log(inptsData[3], inptsData[2], inptsData[1], inptsData[0])
    //console.log(coefB, coefA, unit, address)

    setSendData(true)
  }

  useEffect(() => {
    //console.log(address, unit, coefA, coefB)
    if (sendData === true) {
      WriteCoil()
    }
  }, [address, unit, coefA, coefB, timePumping, timeStability])

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-2 sm:px-6">
      <div className="rounded-md border border-zinc-200 bg-white p-2.5">
        {/* Grid com coluna central para alinhar o eixo vertical */}
        <div className="grid grid-cols-1 items-end gap-y-2 sm:grid-cols-[1fr_2rem_1fr] sm:gap-x-0">
          {/* Endereço | Unidade */}
          <div className="flex min-w-0 flex-col gap-1">
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
          <div className="hidden sm:block" aria-hidden />
          <div className="flex min-w-0 flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
              {t('Unidade')}
            </label>
            <select
              name="unidade"
              id="unidade"
              value={inptsData[1].toString()}
              onChange={(event) => updateData(1, event)}
              className="h-8 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-300"
            >
              <option value="0">-</option>
              <option value="7">Bar</option>
              <option value="8">mbar</option>
              <option value="12">kPA</option>
              <option value="2">inHG</option>
              <option value="5">mmHG</option>
              <option value="14">atm</option>
              <option value="6">psi</option>
              <option value="171">mH20</option>
              <option value="170">cmH20</option>
              <option value="1">inH20</option>
              <option value="3">ftH20</option>
            </select>
          </div>

          {/* Coeficiente */}
          <div className="col-span-1 sm:col-span-3">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
              {t('Coeficiente')}
            </label>
          </div>

          <div className="flex min-w-0 flex-col gap-0.5 rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-2">
            <span className="text-center text-xs font-medium text-zinc-500">Ax</span>
            <input
              type="number"
              className="h-8 w-full rounded-md border border-zinc-300 bg-white text-center text-sm text-zinc-700 outline-none focus:border-sky-400"
              min={-9999}
              value={inptsData[2].toFixed(2)}
              onChange={(event) => updateData(2, event)}
            />
          </div>
          <div className="flex items-center justify-center pb-1 text-lg font-semibold text-sky-500">
            +
          </div>
          <div className="flex min-w-0 flex-col gap-0.5 rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-2">
            <span className="text-center text-xs font-medium text-zinc-500">B</span>
            <input
              type="number"
              className="h-8 w-full rounded-md border border-zinc-300 bg-white text-center text-sm text-zinc-700 outline-none focus:border-sky-400"
              min={-9999}
              value={inptsData[3].toFixed(2)}
              onChange={(event) => updateData(3, event)}
            />
          </div>

          {/* Tempos */}
          <div className="flex min-w-0 flex-col gap-1 rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-2">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
              {t('Tempo de Bombeamento')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="h-8 w-[70%] max-w-[10rem] rounded-md border border-zinc-300 bg-white text-center text-sm text-zinc-700 outline-none focus:border-sky-400"
                min={1}
                value={inptsData[4]}
                onChange={(event) => updateData(4, event)}
                inputMode="numeric"
              />
              <span className="text-xs text-zinc-500">{t('segundos')}</span>
            </div>
          </div>
          <div className="hidden sm:block" aria-hidden />
          <div className="flex min-w-0 flex-col gap-1 rounded-md border border-zinc-200 bg-zinc-50/80 px-3 py-2">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
              {t('Tempo de estabilização')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                className="h-8 w-[70%] max-w-[10rem] rounded-md border border-zinc-300 bg-white text-center text-sm text-zinc-700 outline-none focus:border-sky-400"
                min={1}
                value={inptsData[5]}
                onChange={(event) => updateData(5, event)}
                inputMode="numeric"
              />
              <span className="text-xs text-zinc-500">{t('segundos')}</span>
            </div>
          </div>
          <div className="mt-2 flex min-w-0 items-center justify-end">
            <Button size="large" onClick={fetchData}>
              <DownloadSimple size={22} />
              {t('Baixar informações')}
            </Button>
          </div>
          <div className="hidden sm:block" aria-hidden />
          <div className="flex min-w-0 items-center justify-start">
            <Button size="large" onClick={handleSendSettings}>
              <UploadSimple size={22} />
              {t('Enviar configurações')}
            </Button>
          </div>
        </div>
      </div>

      <LoadingData visible={isLoading} title={titleLoading} />
    </div>
  )
}
