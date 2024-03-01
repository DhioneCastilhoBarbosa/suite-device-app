import * as Switch from '@radix-ui/react-switch'
import { useState, useEffect, useContext } from 'react'
import { Openport, ClosePort} from '../Terminal/Terminal'
import { Device } from '@renderer/Context/DeviceContext'


export default function Conector({ portDevice, isOnline, PortStatus }) {
  const [availablePorts, setAvailablePorts] = useState<string[]>([])
  const [OffllineMode, setOfflineMode] = useState('off')
  const [valorSelecionado, setValorSelecionado] = useState('')
  const [isConnected, setIsConnected] = useState(isOnline)

  const{SetPortOpen}:any= Device()



  const handleChange = (event) => {
    setValorSelecionado(event.target.value)
  }

  const handleClickConect = () => {
    portDevice(valorSelecionado)
    setIsConnected(!isConnected)
    PortStatus(isConnected)
    SetPortOpen({state:true})
    Openport({ portName: valorSelecionado, bauld: 1200 })

  }

  const handleClickDisconect = () => {
    portDevice(valorSelecionado)
    setIsConnected(!isConnected)
    PortStatus(isConnected)
    SetPortOpen({state:false})
    ClosePort()
  }

  const listSerialPorts = async () => {
    try {
      const { SerialPort } = window.require('serialport')
      const ports = await SerialPort.list()
      const portNames = ports.map((port) => port.path)
      setAvailablePorts(portNames)
    } catch (error: any) {
      console.error('Erro ao listar portas seriais:', error.message)
    }
  }

  const handleSwitchOfflineMode = (event) => {
    setOfflineMode(event.target.checked)
    console.log(OffllineMode)
  }

  useEffect(() => {
    listSerialPorts()
    const intervalId = setInterval(() => {
      listSerialPorts()
      console.log('atualisei as portas')
    }, 2000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="flex flex-col items-center bg-white rounded-lg m-1 pt-2 pb-2 pr-3 pl-3">
      <div className="w-full border-[1px] border-[#336B9E] p-1 rounded-lg">
        <form>
          <div className="flex items-center justify-between pr-2 pl-2">
            <label className=" text-[10px] text-blue-950" htmlFor="airplane-mode">
              Modo offline
            </label>
            <Switch.Root
              className="w-[49px] h-[22px] bg-gray-200 border-[1px] border-gray-300 rounded-full relative  data-[state=checked]:bg-green-500 outline-none cursor-default"
              defaultChecked={false}
              onCheckedChange={(checked: true) => handleSwitchOfflineMode}
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
        >
          Conectado
        </button>
      ) : (
        <button
          className="bg-zinc-600 w-full rounded-lg p-1 outline-none mt-3 text-white hover:bg-zinc-500 cursor-pointer"
          onClick={handleClickConect}
        >
          Conectar
        </button>
      )}
    </div>
  )
}
