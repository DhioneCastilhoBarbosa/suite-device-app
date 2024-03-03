import { DeviceProvider } from '@renderer/Context/DeviceContext'
import Menu from './Menu'
import Preview from './Preview'

export default function Main() {
  return (
    <div className=" flex flex-row h-max p-2 w-full">
      <DeviceProvider>
        <Menu />
        <Preview />
      </DeviceProvider>
    </div>
  )
}
