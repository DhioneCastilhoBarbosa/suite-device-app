import { Device } from '@renderer/Context/DeviceContext'

interface LoadingDataProps {
  visible: boolean
  title: string
}

export default function LoadingData({ visible, title }: LoadingDataProps): JSX.Element | null {
  const { mode }: any = Device()
  if (!visible || mode.state) return null
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white flex flex-col items-center justify-center p-6 rounded-md shadow-md">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1E9EF4]"></div>
        </div>
        <p className="mt-4 text-center text-lg font-medium text-gray-700">{title}</p>
      </div>
    </div>
  )
}
