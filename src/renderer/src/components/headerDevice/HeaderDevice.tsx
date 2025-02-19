import { ComponentProps } from 'react'

interface HeaderDeviceProps extends ComponentProps<'header'> {
  DeviceName: string
}

export default function HeaderDevice({ DeviceName, ...props }: HeaderDeviceProps) {
  return (
    <header
      {...props}
      className="flex w-full items-center justify-start bg-[#1769A0] rounded-t-lg max-h-11 min-h-11 top-0"
    >
      <div className="flex w-9 items-center justify-center bg-white ml-2 mt-4 mb-4 rounded-b-lg rounded-e-lg text-[#1769A0] ">
        {props.children}
      </div>
      <h2 className="text-white  font-semibold pl-2">{DeviceName}</h2>
    </header>
  )
}
