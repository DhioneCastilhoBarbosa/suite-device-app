import { DeviceProvider } from '../Context/DeviceContext'
import Menu from './Menu'
import Preview from './Preview'

export default function Main() {
  return (
    <div className=" flex flex-row h-screen p-1 w-full">
      <DeviceProvider>
        <Menu />
        <Preview />
      </DeviceProvider>
    </div>
  )
}
