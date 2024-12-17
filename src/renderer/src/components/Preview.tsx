import LinnimDbBorbulha from './LinnimDB-Borbulha/LinnimDbBorbulha'
import LinnimDbCap from './LinnimDB-Cap/LinnimDbCap'
import TecladoSDI12 from './Teclado-SDI12/Teclado'
import { Terminal } from './Terminal/Terminal'
import { Device } from '@renderer/Context/DeviceContext'
import TSatDB from './TSatDB/Teclado'

export default function Preview() {
  const { device, port, PortOpen }: any = Device()

  if (device.name === 'terminal') {
    return <Terminal isConect={PortOpen.state} portCom={port} PortStatus={PortOpen} />
  }

  if (device.name === 'linnimDB-Borbulha') {
    return <LinnimDbBorbulha isConect={PortOpen.state} portCom={port} PortStatus={PortOpen} />
  }
  if (device.name === 'linnimDB-cap') {
    return <LinnimDbCap isConect={PortOpen.state} portCom={port} PortStatus={PortOpen} />
  }
  if (device.name === 'teclado-sdi12') {
    return <TecladoSDI12 isConect={PortOpen.state} portCom={port} PortStatus={PortOpen} />
  }
  if (device.name === 'TSatDB') {
    return <TSatDB isConect={PortOpen.state} portCom={port} PortStatus={PortOpen} />
  } else {
    return undefined
  }
}
