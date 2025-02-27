import * as Switch from '@radix-ui/react-switch'
import { useState, useEffect } from 'react'
import { Openport, ClosePort } from '../Terminal/Terminal'
import { Device } from '@renderer/Context/DeviceContext'
import { CloseModBus, cancelConnection, connectClient } from '@renderer/utils/modbusRTU'
import Loading from '../loading/loading'
import NoDeviceFoundModbus from '../modal/noDeviceFoundModbus'
import { ClosePortRS232, OpenPortRS232 } from '../Teclado-SDI12/Teclado'
import { ClosePortTSatDB, OpenPortTSatDB } from '../TSatDB/TSatDB'
import { ClosePortPluviIoT, OpenPortPluviIoT } from '../PluviDB-Iot/PluviDBIot'

export default function Conector({ portDevice, isOnline, PortStatus }) {
  const [availablePorts, setAvailablePorts] = useState<string[]>([])
  const [OfflineMode, setOfflineMode] = useState(false)
  const [valorSelecionado, setValorSelecionado] = useState('')
  const [isConnected, setIsConnected] = useState(isOnline)
  const [conected, setConected] = useState(false)

  const [deviceFound, setDeviceFound] = useState<boolean | null>(null) // null indica que a varredura ainda não foi iniciada
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const { PortOpen, SetPortOpen, setMode, device, resetUpdate, setResetUpdate }: any = Device()

  const [buttonAbility, setButtonAbility] = useState(true)

  const handleChange = (event) => {
    setValorSelecionado(event.target.value)
    setButtonAbility(false)

    if (event.target.value === 'Selecione') {
      setButtonAbility(true)
    }

    console.log(event.target.value)
  }

  const handleClickConect = async () => {
    portDevice(valorSelecionado)
    console.log('Porta Device:', valorSelecionado)
    setIsConnected(!isConnected)
    PortStatus(isConnected)
    setConected(true)

    const ModBusProps = {
      SerialName: valorSelecionado,
      BaudRate: 9600
    }

    if (OfflineMode === false) {
      if (device.name === 'terminal') {
        Openport({ portName: valorSelecionado, bauld: 1200 })
        SetPortOpen({ state: true })
      } else if (device.name === 'teclado-sdi12') {
        OpenPortRS232({ portName: valorSelecionado, bauld: 9600 })
        SetPortOpen({ state: true })
      } else if (device.name === 'TSatDB') {
        OpenPortTSatDB({ portName: valorSelecionado, bauld: 9600 })
        SetPortOpen({ state: true })
      } else if (device.name === 'PluviDB-Iot') {
        OpenPortPluviIoT({ portName: valorSelecionado, bauld: 115200 })
        SetPortOpen({ state: true })
      } else {
        setIsLoading(true)
        let result: boolean = await connectClient(ModBusProps)
        SetPortOpen({ state: true })
        setDeviceFound(result)
        setIsLoading(false)
        console.log('Result', result)
        result = false
        console.log('Result', result)
      }
    } else {
      setMode({ state: true })
      SetPortOpen({ state: true })
    }
  }

  const handleClickDisconect = async () => {
    portDevice(valorSelecionado)
    setIsConnected(!isConnected)
    PortStatus(isConnected)
    SetPortOpen({ state: false })

    setConected(false)
    //console.log('Device Name', device.name)
    if (OfflineMode === false) {
      //ClosePort()
      device.name === 'terminal'
        ? ClosePort()
        : device.name === 'teclado-sdi12'
          ? ClosePortRS232()
          : device.name === 'TSatDB'
            ? ClosePortTSatDB()
            : device.name === 'PluviDB-Iot'
              ? ClosePortPluviIoT()
              : CloseModBus()
    } else {
      setMode({ state: false })
    }
  }

  const listSerialPorts = async () => {
    try {
      const { SerialPort } = window.require('serialport')
      const ports = await SerialPort.list()
      const portNames = ports.map((port) => port.path)
      setAvailablePorts(portNames)
      //console.log(isConnected)
    } catch (error: any) {
      //console.error('Erro ao listar portas seriais:', error.message)
    }
  }

  const modeOffLine = () => {
    setOfflineMode(!OfflineMode)

    if (OfflineMode === false) {
      setButtonAbility(false)
      setValorSelecionado('Selecione')
    } else {
      setButtonAbility(true)
    }
  }

  const closeNoDeviceFoundModal = () => {
    setDeviceFound(null)
  }

  const handleStop = () => {
    cancelConnection()
    setIsLoading(false)
    setDeviceFound(null)
    setMode({ state: true })
  }

  useEffect(() => {
    if (conected === false) {
      listSerialPorts()
      const intervalId = setInterval(() => {
        listSerialPorts()
        //console.log('Atualizei as portas', PortOpen.state)
      }, 2000)

      return () => clearInterval(intervalId)
    }
    // Limpeza opcional, se necessário, quando PortOpen.state for true.
    return undefined
  }, [conected])

  useEffect(() => {
    if (resetUpdate.state === true) {
      setIsConnected(false)
      setResetUpdate({ state: false })
      setMode({ state: false })
      setConected(false)

      //console.log('ResetState:', resetUpdate.state)
    }
    //console.log('ResetState:', resetUpdate.state)
  }, [PortOpen.state])

  return (
    <>
      {isLoading && <Loading onStop={handleStop} />}
      {deviceFound !== null && !deviceFound && (
        <NoDeviceFoundModbus onClose={closeNoDeviceFoundModal} />
      )}
      <div className="flex flex-col items-center bg-white rounded-lg m-1 pt-2 pb-2 pr-3 pl-3">
        <div className="w-full border-[1px] border-[#336B9E] p-1 rounded-lg">
          <form>
            <div className="flex items-center justify-between pr-2 pl-2">
              <label className=" text-[10px] text-blue-950" htmlFor="airplane-mode">
                Modo offline
              </label>
              <Switch.Root
                className="w-[49px] h-[22px] bg-gray-200 border-[1px] border-gray-300 rounded-full relative  data-[state=checked]:bg-green-500 outline-none cursor-default"
                defaultChecked={OfflineMode}
                onCheckedChange={modeOffLine}
                disabled={isConnected ? true : false}
              >
                <Switch.Thumb className="block w-[18px] h-[18px] bg-white rounded-full shadow-[2px_1px_3px] shadow-black transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[26px]" />
              </Switch.Root>
            </div>
          </form>
        </div>
        <div className="pt-6">
          <span className=" text-[#336B9E] text-[10px] font-bold pl-2 pr-2">
            Selecionar a porta COM:
          </span>
          <select
            className="w-full mt-2 text-[#336B9E] text-center mt-1 p-1 border-[1px] border-[#336B9E] rounded-lg outline-none cursor-pointer"
            value={valorSelecionado}
            onChange={handleChange}
            disabled={OfflineMode}
          >
            <option value={'Selecione'}>Selecione</option>
            {availablePorts.map((port, index) => (
              <option key={index} value={port}>
                {port}
              </option>
            ))}
          </select>
        </div>
        {isConnected ? (
          <button
            className="bg-green-500 w-full rounded-lg p-1 outline-none mt-3 text-white hover:bg-green-400 cursor-pointer"
            onClick={handleClickDisconect}
            disabled={buttonAbility}
          >
            Conectado
          </button>
        ) : (
          <button
            className={`bg-zinc-600 w-full rounded-lg p-1 outline-none mt-3 text-white ${
              buttonAbility ? 'cursor-not-allowed' : ' hover:bg-zinc-500 cursor-pointer'
            } `}
            onClick={handleClickConect}
            disabled={buttonAbility}
          >
            Conectar
          </button>
        )}
      </div>
    </>
  )
}
