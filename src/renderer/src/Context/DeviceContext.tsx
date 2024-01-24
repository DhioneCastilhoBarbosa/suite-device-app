import React, { useState } from 'react'

export const DeviceContext = React.createContext({})

export interface DeviceProviderPros {
  device: string
  setDevice: string
  port: String
  setPort: string
  children: any
  PortOpen: boolean
  SetPortOpen: boolean
}

export const DeviceProvider = (props: DeviceProviderPros) => {
  const [device, setDevice] = useState({ name: 'terminal' })
  const [port, setPort] = useState({ name: 'selecionar' })
  const [PortOpen, SetPortOpen] = useState({ state: false })
  return (
    <DeviceContext.Provider value={{ device, setDevice, port, setPort, PortOpen, SetPortOpen }}>
      {props.children}
    </DeviceContext.Provider>
  )
}

export const Device = () => React.useContext(DeviceContext)
