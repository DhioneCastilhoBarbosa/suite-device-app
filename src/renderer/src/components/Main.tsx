import { DeviceProvider } from '@renderer/Context/DeviceContext'
import Menu from './Menu'
import Preview from './Preview'

export default function Main() {
  return (
    <div className=" flex flex-row max-h-screen p-1 w-full ">
      <DeviceProvider>
        <Menu />
        <Preview />
      </DeviceProvider>
    </div>
  )
}
