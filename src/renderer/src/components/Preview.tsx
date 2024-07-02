import LinnimDbBorbulha from './LinnimDB-Borbulha/LinnimDbBorbulha'
import LinnimDbCap from './LinnimDB-Cap/LinnimDbCap'
import { Terminal } from './Terminal/Terminal'
import { Device } from '@renderer/Context/DeviceContext'

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
  } else {
    return undefined
  }
}
