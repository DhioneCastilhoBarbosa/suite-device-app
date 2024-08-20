import { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

interface ContainerDeviceProps extends ComponentProps<'div'> {
  heightScreen?: boolean
}

export default function ContainerDevice({ heightScreen, ...props }: ContainerDeviceProps) {
  return (
    <div
      {...props}
      className={twMerge(
        'w-full mt-16 ml-4 mr-[1px] bg-[#FFFFFF] rounded-lg overflow-y-auto',
        heightScreen ? ' bg-[#EDF4FB] flex flex-col items-center h-screen' : ''
      )}
    >
      {props.children}
    </div>
  )
}
