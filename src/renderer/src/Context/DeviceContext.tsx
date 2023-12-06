import React, { useState } from 'react'

export const DeviceContext = React.createContext({})

export const DeviceProvider = (props: any) => {
  const [device, setDevice] = useState({ name: 'linnidb' })
  const [port, setPort] = useState({ name: 'selecionar' })
  return (
    <DeviceContext.Provider value={{ device, setDevice, port, setPort }}>
      {props.children}
    </DeviceContext.Provider>
  )
}

export const Device = () => React.useContext(DeviceContext)
