import LinnimDbBorbulha from './LinnimDB-Borbulha/LinnimDbBorbulha'
import LinnimDbCap from './LinnimDB-Cap/LinnimDbCap'
import TecladoSDI12 from './Teclado-SDI12/Teclado'
import { Terminal } from './Terminal/Terminal'
import { Device } from '../Context/DeviceContext'
import TSatDB from './TSatDB/TSatDB'
import PluviDBIot from './PluviDB-Iot/PluviDBIot'
import PluviDBIotRemote from './PluviDB-Iot/PluviDBIotRemote'

export default function Preview(): JSX.Element | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  }
  if (device.name === 'PluviDB-Iot') {
    return <PluviDBIot isConect={PortOpen.state} portCom={port} PortStatus={PortOpen} />
  }
  if (device.name === 'PluviDB-Iot-Remote') {
    return <PluviDBIotRemote />
  } else {
    return undefined
  }
}
