import LinnimDB from './LinnimDB/LinnimDB'
import Terminal from './Terminal/Terminal'
import { Device } from '@renderer/Context/DeviceContext'

export default function Preview() {
  const { device } = Device()

  console.log(device.name)

  if (device.name === 'terminal') {
    return <Terminal isConect={true} />
  }

  if (device.name === 'linnidb') {
    return <LinnimDB />
  }
}
