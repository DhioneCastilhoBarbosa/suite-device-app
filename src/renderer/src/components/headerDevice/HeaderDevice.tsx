import { ComponentProps, ReactNode } from 'react'

interface HeaderDeviceProps extends ComponentProps<'header'> {
  DeviceName: string
  rightSlot?: ReactNode
}

export default function HeaderDevice({
  DeviceName,
  rightSlot,
  children,
  ...props
}: HeaderDeviceProps) {
  return (
    <header
      {...props}
      className="top-0 flex max-h-11 min-h-11 w-full shrink-0 items-center justify-between rounded-t-lg bg-[#1769A0]"
    >
      <div className="flex min-w-0 items-center">
        <div className="mb-4 ml-2 mt-4 flex w-9 items-center justify-center rounded-b-lg rounded-e-lg bg-white text-[#1769A0]">
          {children}
        </div>
        <h2 className="pl-2 font-semibold text-white">{DeviceName}</h2>
      </div>
      {rightSlot ? <div className="mr-2 flex shrink-0 items-center">{rightSlot}</div> : null}
    </header>
  )
}
