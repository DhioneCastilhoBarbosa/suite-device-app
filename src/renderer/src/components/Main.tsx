import { DeviceProvider } from '../Context/DeviceContext'
import Menu from './Menu'
import Preview from './Preview'

export default function Main() {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-row gap-2 p-1">
      <DeviceProvider>
        <Menu />
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
          <Preview />
        </div>
      </DeviceProvider>
    </div>
  )
}
