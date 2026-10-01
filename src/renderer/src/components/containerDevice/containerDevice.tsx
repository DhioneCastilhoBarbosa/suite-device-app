import { ComponentProps } from 'react'
import { twMerge } from 'tailwind-merge'

interface ContainerDeviceProps extends ComponentProps<'div'> {
  heightScreen?: boolean
}

export default function ContainerDevice({
  heightScreen,
  ...props
}: ContainerDeviceProps): JSX.Element {
  return (
    <div
      {...props}
      className={twMerge(
        'device-panel-scroll h-full min-h-0 min-w-0 w-full rounded-lg bg-[#FFFFFF]',
        heightScreen ? 'flex flex-col items-center bg-[#EDF4FB]' : ''
      )}
    >
      {props.children}
    </div>
  )
}
