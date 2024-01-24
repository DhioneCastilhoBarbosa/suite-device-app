import LinnimDB from './LinnimDB/LinnimDB'
import Terminal from './Terminal/Terminal'
import { Device } from '@renderer/Context/DeviceContext'

export default function Preview() {
  const { device, setDevice, port, setPort, PortOpen, SetPortOpen }: any = Device()

  //console.log(device.name)
  //console.log('is preview', port.name)

  if (device.name === 'terminal') {
    return <Terminal isConect={true} portCom={port} PortStatus={PortOpen} />
  }

  if (device.name === 'linnidb') {
    //return <LinnimDB />
  }
}
