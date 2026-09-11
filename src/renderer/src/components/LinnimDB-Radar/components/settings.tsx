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
  const { mode }: any = Device()
  const [fileContent, setFileContent] = useState<string>('')
  const [inptsData, setInptsData] = useState<number[]>([1, 7, 0, 0])
  const [sendData, setSendData] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [titleLoading, setTitleLoading] = useState(t('Baixando informações do dispositivo!'))

  const fetchData = async () => {
    setModbusData([])
    setTitleLoading(t('Baixando informações do dispositivo!'))
    setIsLoading(true)
    try {
      // Espera 500 millsegundo antes de fazer a chamada Modbus

      await new Promise((resolve) => setTimeout(resolve, 500))

      // Array de chamadas Modbus com argumentos específicos
      const modbusCalls = [
        { address: 255, register: 1, Int16: true, float32: false }, //
        { address: 336, register: 1, Int16: true, float32: false }, //
        { address: 352, register: 2, Int16: false, float32: true }, //
        { address: 368, register: 2, Int16: false, float32: true } //
      ]

      // Função para fazer chamadas Modbus em sequência
      const makeModbusCalls = async (calls) => {
        for (let i = 0; i < calls.length; i++) {
          const { address, register, Int16, float32 } = calls[i]
          const data = await readModbusData(address, register, Int16, float32, 250)
          setModbusData((prevData) => [...prevData, data as string])
          await new Promise((resolve) => setTimeout(resolve, 300)) // Aguarda 200ms antes de fazer a próxima chamada
        }
      }

      // Chama a função para fazer as chamadas Modbus
      await makeModbusCalls(modbusCalls)
    } catch (error) {
      //console.error('Erro ao fazer chamadas Modbus:', error);
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
      for (let i = 0; i < modbusData.length; i++) {
        updateValueInputs(i, modbusData[i])
      }
      setTimeout(() => setIsLoading(false), 1000)
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

    //console.log(inptsData[3], inptsData[2], inptsData[1], inptsData[0])
    //console.log(coefB, coefA, unit, address)

    setSendData(true)
  }

  useEffect(() => {
    //console.log(address, unit, coefA, coefB)
    if (sendData === true) {
      WriteCoil()
    }
  }, [address, unit, coefA, coefB])

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-5 sm:px-6">
      <div className="rounded-md border border-zinc-200 bg-white p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
              {t('Endereço MODBUS')}
            </label>
            <input
              type="number"
              className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-center text-sm text-zinc-700 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-300"
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
              value={inptsData[1].toString()}
              onChange={(event) => updateData(1, event)}
              className="h-9 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-700 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-300"
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
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
            {t('Coeficiente')}
          </label>
          <div className="flex items-end justify-center gap-3 rounded-md border border-zinc-200 bg-zinc-50/80 px-4 py-3">
            <div className="flex w-28 flex-col gap-1">
              <span className="text-center text-xs font-medium text-zinc-500">Ax</span>
              <input
                type="number"
                className="h-9 w-full rounded-md border border-zinc-300 bg-white text-center text-sm text-zinc-700 outline-none focus:border-sky-400"
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
                className="h-9 w-full rounded-md border border-zinc-300 bg-white text-center text-sm text-zinc-700 outline-none focus:border-sky-400"
                min={-9999}
                value={inptsData[3].toFixed(2)}
                onChange={(event) => updateData(3, event)}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-row flex-wrap justify-center gap-3">
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
