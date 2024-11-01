import { DownloadSimple, FolderOpen, UploadSimple } from '@phosphor-icons/react'
import { Device } from '@renderer/Context/DeviceContext'
import Button from '@renderer/components/button/Button'
import LoadingData from '@renderer/components/loading/loadingData'
import { selectFile } from '@renderer/utils/fileUtils'
import { IdModBus, WriteModbus, readModbusData } from '@renderer/utils/modbusRTU'
import { useEffect, useState } from 'react'

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
  const [titleLoading, setTitleLoading] = useState('Baixando informações do dispositivo!')

  const fetchData = async () => {
    setModbusData([])
    setTitleLoading('Baixando informações do dispositivo!')
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
      setTitleLoading('Enviando informações para o dispositivo!')
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
    <div className="flex flex-col items-center justify-center ">
      <div className="grid grid-cols-2  gap-2 h-full mt-4">
        <div className="flex flex-col w-52">
          <label>Endereço MODBUS</label>
          <input
            type="number"
            className="border border-zinc-400 w-48 rounded-md h-6 outline-none text-center"
            min={1}
            value={inptsData[0] === 0 ? '' : inptsData[0]}
            onChange={(event) => updateData(0, event)}
            inputMode="numeric"
          />
        </div>

        <div className="flex flex-col w-56">
          <label>Unidade</label>
          <select
            name="unidade"
            id="unidade"
            value={inptsData[1].toString()}
            onChange={(event) => updateData(1, event)}
            className="w-48 rounded-md h-6 border border-zinc-400 "
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

        <div className="flex flex-col">
          <label>Coeficiente</label>
          <div className=" flex flex-row w-52 items-center justify-center border border-zinc-400 rounded-md p-2 gap-2">
            <div className="w-auto flex flex-col items-center pb-5">
              <label>Ax</label>
              <input
                type="number"
                className="w-full border border-zinc-400 rounded-md h-6 outline-none text-center"
                min={-9999}
                value={inptsData[2].toFixed(2)}
                onChange={(event) => updateData(2, event)}
              />
            </div>
            <div className="w-6 flex flex-col justify-center">
              <span>+</span>
            </div>
            <div className="w-auto flex flex-col items-center pb-5">
              <label>B</label>
              <input
                type="number"
                className="w-full border border-zinc-400 rounded-md h-6 outline-none text-center"
                min={-9999}
                value={inptsData[3].toFixed(2)}
                onChange={(event) => updateData(3, event)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className=" flex flex-row gap-5 h-14 my-10 pr-10 ">
        {/*<Button size={'large'} onClick={handleSelectFile}>
          <FolderOpen size={24} />
          Selecione o arquivo
  </Button>*/}
        <Button size={'large'} onClick={fetchData}>
          <DownloadSimple size={24} />
          Baixa informações
        </Button>
        <Button size={'large'} onClick={handleSendSettings}>
          <UploadSimple size={24} />
          Enviar configurações
        </Button>
      </div>
      <LoadingData visible={isLoading} title={titleLoading} />
    </div>
  )
}
