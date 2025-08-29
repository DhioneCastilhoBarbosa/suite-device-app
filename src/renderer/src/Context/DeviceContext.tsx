import React, { useState } from 'react'

// Tipagem do estado
type DeviceState = { name: string }
type PortState = { name: string }
type BoolState = { state: boolean }

type ConnectorDisconnectFn = () => Promise<void>

type DeviceContextValue = {
  device: DeviceState
  setDevice: React.Dispatch<React.SetStateAction<DeviceState>>
  port: PortState
  setPort: React.Dispatch<React.SetStateAction<PortState>>
  PortOpen: BoolState
  SetPortOpen: React.Dispatch<React.SetStateAction<BoolState>>
  mode: BoolState
  setMode: React.Dispatch<React.SetStateAction<BoolState>>
  resetUpdate: BoolState
  setResetUpdate: React.Dispatch<React.SetStateAction<BoolState>>
  registerConnectorDisconnect: (fn: ConnectorDisconnectFn | null) => void
  connectorDisconnect?: ConnectorDisconnectFn
}

export interface DeviceProviderPros {
  children?: React.ReactNode
}

// Valor padrão seguro
const defaultCtx: DeviceContextValue = {
  device: { name: 'terminal' },
  setDevice: () => {},
  port: { name: 'selecionar' },
  setPort: () => {},
  PortOpen: { state: false },
  SetPortOpen: () => {},
  mode: { state: false },
  setMode: () => {},
  resetUpdate: { state: false },
  setResetUpdate: () => {},
  registerConnectorDisconnect: () => {},
  connectorDisconnect: undefined
}

export const DeviceContext = React.createContext<DeviceContextValue>(defaultCtx)

export const DeviceProvider = ({ children }: DeviceProviderPros) => {
  const [device, setDevice] = useState<DeviceState>({ name: 'terminal' })
  const [port, setPort] = useState<PortState>({ name: 'selecionar' })
  const [PortOpen, SetPortOpen] = useState<BoolState>({ state: false })
  const [mode, setMode] = useState<BoolState>({ state: false })
  const [resetUpdate, setResetUpdate] = useState<BoolState>({ state: false })

  const [connectorDisconnect, setConnectorDisconnect] = useState<
    ConnectorDisconnectFn | undefined
  >()

  const registerConnectorDisconnect = (fn: ConnectorDisconnectFn | null) => {
    setConnectorDisconnect(() => fn ?? undefined)
  }

  return (
    <DeviceContext.Provider
      value={{
        device,
        setDevice,
        port,
        setPort,
        PortOpen,
        SetPortOpen,
        mode,
        setMode,
        resetUpdate,
        setResetUpdate,
        registerConnectorDisconnect,
        connectorDisconnect
      }}
    >
      {children}
    </DeviceContext.Provider>
  )
}

export const Device = () => React.useContext(DeviceContext)
