
import {Terminal} from './Terminal/Terminal'
import { Device} from '@renderer/Context/DeviceContext'

export default function Preview() {
  const { device, port, PortOpen,}:any = Device()

  if (device.name === 'terminal') {
    return <Terminal isConect={PortOpen.state} portCom={port} PortStatus={PortOpen} />
  }


  if (device.name === 'linnidb') {
    //return <LinnimDB />
    return undefined;
  }
  else{
    return undefined;
  }


}
