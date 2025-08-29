import * as Switch from '@radix-ui/react-switch'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Openport, ClosePort } from '../Terminal/Terminal'
import { Device } from '../../Context/DeviceContext'
import { CloseModBus, cancelConnection, connectClient } from '../../utils/modbusRTU'
import Loading from '../loading/loading'
import NoDeviceFoundModbus from '../modal/noDeviceFoundModbus'
import { ClosePortRS232, OpenPortRS232 } from '../Teclado-SDI12/Teclado'
import { ClosePortTSatDB, OpenPortTSatDB } from '../TSatDB/TSatDB'
import { ClosePortPluviIoT, OpenPortPluviIoT } from '../PluviDB-Iot/PluviDBIot'
import { toast } from 'react-toastify'
import { SerialManager } from '../../utils/serialManager'

interface ConectorProps {
  portDevice: (port: string) => void
  isOnline: boolean
  PortStatus: (status: boolean) => void
}

export default function Conector({ portDevice, isOnline, PortStatus }: ConectorProps) {
  const [availablePorts, setAvailablePorts] = useState<string[]>([])
  const [OfflineMode, setOfflineMode] = useState(false)
  const [valorSelecionado, setValorSelecionado] = useState('')
  const [isConnected, setIsConnected] = useState(isOnline)
  const [conected, setConected] = useState(false)
  const [isActive, setIsActive] = useState(false)

  const [deviceFound, setDeviceFound] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const {
    PortOpen,
    SetPortOpen,
    setMode,
    device,
    setDevice,
    resetUpdate,
    setResetUpdate,
    registerConnectorDisconnect,
    connectorDisconnect
  }: any = Device()

  const [buttonAbility, setButtonAbility] = useState(true)
  const [cooldownUntil, setCooldownUntil] = useState<number>(0)
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  // aceita motivo e se deve tostar
  type DisconnectOpts = { reason?: string; toast?: boolean }
  const latestDisconnect = useRef<(opts?: DisconnectOpts) => Promise<void>>(async () =>
    Promise.resolve()
  )
  const latestSelected = useRef<string>('')
  const latestOffline = useRef<boolean>(false)

  const safeCloseAll = () => {
    try {
      ClosePort()
    } catch {}
    try {
      ClosePortRS232()
    } catch {}
    try {
      ClosePortTSatDB()
    } catch {}
    try {
      ClosePortPluviIoT()
    } catch {}
    try {
      CloseModBus()
    } catch {}
    try {
      cancelConnection()
    } catch {}
  }

  // toast opcional e antes do teardown
  const forceDisconnect = useCallback(
    async (opts?: DisconnectOpts) => {
      const reason = opts?.reason && String(opts.reason).trim()
      const showToast = !!opts?.toast && !!reason
      const toastId = reason ? `phys-${valorSelecionado || 'porta'}` : undefined
      try {
        if (showToast) {
          toast.warn(
            `Porta ${valorSelecionado} ${reason}. Desconectado.`,
            toastId ? { toastId } : undefined
          )
        }
        SerialManager.setBusy()
        SetPortOpen({ state: false })
        setConected(false)
        setIsConnected(false)
        PortStatus(false)

        registerConnectorDisconnect(null)
        safeCloseAll()

        if (OfflineMode) setMode({ state: false })
      } finally {
        SerialManager.setIdle()
      }
    },
    [OfflineMode, PortStatus, SetPortOpen, setMode, valorSelecionado, registerConnectorDisconnect]
  )

  useEffect(() => {
    latestDisconnect.current = (opts?: DisconnectOpts) => forceDisconnect(opts)
  }, [forceDisconnect])

  // helper: registra callback silencioso (usado por PasswordModal, botão, etc.)
  const registerSilentDisconnect = useCallback(
    () => registerConnectorDisconnect(() => latestDisconnect.current()),
    [registerConnectorDisconnect]
  )

  useEffect(() => {
    latestSelected.current = valorSelecionado
  }, [valorSelecionado])
  useEffect(() => {
    latestOffline.current = OfflineMode
  }, [OfflineMode])

  useEffect(() => {
    SerialManager.snapshot().then((list) => setAvailablePorts(list ?? []))

    const offAdd = SerialManager.onAdded(({ path }) => {
      setAvailablePorts((prev) => (prev.includes(path) ? prev : [...prev, path]))
      if (path === latestSelected.current) setCooldownUntil(Date.now() + 500)
    })

    const offRem = SerialManager.onRemoved(async ({ path }) => {
      setAvailablePorts((prev) => prev.filter((p) => p !== path))
      if (latestOffline.current) return
      if (path === latestSelected.current) {
        // físico: com toast
        await latestDisconnect.current({ reason: 'removida fisicamente', toast: true })
        setValorSelecionado('Selecione')
        setButtonAbility(true)
        setCooldownUntil(Date.now() + 2500)
      }
    })

    const offErr = SerialManager.onError((m) => toast.error(`Serial error: ${m}`))

    return () => {
      offAdd?.()
      offRem?.()
      offErr?.()
    }
  }, []) // sem deps

  const handleChange = (event) => {
    const v = event.target.value
    setValorSelecionado(v)
    setButtonAbility(v === 'Selecione')
  }

  const handleClickConect = async () => {
    SerialManager.setBusy()
    let loadingTimeout: NodeJS.Timeout | null = null
    try {
      if (Date.now() < cooldownUntil) await sleep(cooldownUntil - Date.now())

      if (!OfflineMode) {
        if (!availablePorts.includes(valorSelecionado)) {
          toast.error('Porta não disponível. Reconecte o cabo e selecione novamente.')
          return
        }
      }

      portDevice(valorSelecionado)
      const ModBusProps = { SerialName: valorSelecionado, BaudRate: 9600 }

      if (!OfflineMode) {
        try {
          if (device.name === 'terminal') {
            await Openport({ portName: valorSelecionado, bauld: 1200 })
            SetPortOpen({ state: true })
            registerSilentDisconnect()
          } else if (device.name === 'teclado-sdi12') {
            await OpenPortRS232({ portName: valorSelecionado, bauld: 9600 })
            SetPortOpen({ state: true })
            registerSilentDisconnect()
          } else if (device.name === 'TSatDB') {
            await OpenPortTSatDB({ portName: valorSelecionado, bauld: 9600 })
            SetPortOpen({ state: true })
            registerSilentDisconnect()
          } else if (device.name === 'PluviDB-Iot') {
            await OpenPortPluviIoT({ portName: valorSelecionado, bauld: 115200 })
            SetPortOpen({ state: true })
            registerSilentDisconnect()
          } else {
            loadingTimeout = setTimeout(() => setIsLoading(true), 200)
            const tryOnce = async () => await connectClient(ModBusProps)
            let ok = await tryOnce()
            if (!ok) {
              await sleep(400)
              ok = await tryOnce()
            }
            if (!ok) {
              SetPortOpen({ state: false })
              setIsLoading(false)
              setConected(false)
              setDeviceFound(false)
              return
            }
            SetPortOpen({ state: true })
            setDeviceFound(true)
            setIsLoading(false)
            registerSilentDisconnect()
          }

          setIsConnected(true)
          PortStatus(true)
          setConected(true)
        } catch (error: any) {
          setIsLoading(false)
          SetPortOpen({ state: false })
          setIsConnected(false)
          setConected(false)
          setDeviceFound(true)
          toast.error(`Erro ao abrir a porta serial: ${error?.message ?? 'desconhecido'}`)
        } finally {
          if (loadingTimeout) clearTimeout(loadingTimeout)
          setIsLoading(false)
        }
      } else {
        setMode({ state: true })
        SetPortOpen({ state: true })
        setIsConnected(true)
        PortStatus(true)
        setConected(true)
        registerSilentDisconnect()
      }
    } finally {
      SerialManager.setIdle()
    }
  }

  const handleClickDisconect = async () => {
    // manual: silencioso, sem toast
    await latestDisconnect.current()
  }

  const modeOffLine = () => {
    setOfflineMode((prev) => {
      const next = !prev
      if (!next) {
        setButtonAbility(false)
        setValorSelecionado('Selecione')
      } else {
        setButtonAbility(true)
      }
      return next
    })
  }

  const closeNoDeviceFoundModal = () => setDeviceFound(null)

  const handleStop = () => {
    cancelConnection()
    setIsLoading(false)
    setDeviceFound(null)
    setMode({ state: true })
  }

  const handleClick = () => {
    setIsActive((prev) => !prev)
    setDevice((prev) => ({
      ...prev,
      name: prev.name === 'PluviDB-Iot' ? 'PluviDB-Iot-Remote' : 'PluviDB-Iot'
    }))
  }

  useEffect(() => {
    if (resetUpdate.state === true) {
      setIsConnected(false)
      setResetUpdate({ state: false })
      setMode({ state: false })
      setConected(false)
      registerConnectorDisconnect(null)
    }
  }, [PortOpen.state, resetUpdate.state, setMode, setResetUpdate, registerConnectorDisconnect])

  const connectDisabled = OfflineMode ? false : buttonAbility || isActive
  const disconnectDisabled = isActive
  return (
    <>
      {isLoading && <Loading onStop={handleStop} />}
      {deviceFound !== null && !deviceFound && (
        <NoDeviceFoundModbus onClose={closeNoDeviceFoundModal} />
      )}
      <div className="flex flex-col items-center bg-white rounded-lg m-1 pt-2 pb-2 pr-3 pl-3">
        <div className="w-full border-[1px] border-[#336B9E] p-1 rounded-lg">
          <form>
            <div className="flex items-center justify-between pr-2 pl-2">
              <label className=" text-[10px] text-blue-950" htmlFor="airplane-mode">
                Modo offline
              </label>
              <Switch.Root
                className="w-[49px] h-[22px] bg-gray-200 border-[1px] border-gray-300 rounded-full relative data-[state=checked]:bg-green-500 outline-none cursor-default"
                defaultChecked={OfflineMode}
                onCheckedChange={modeOffLine}
                disabled={isConnected || isActive}
              >
                <Switch.Thumb className="block w-[18px] h-[18px] bg-white rounded-full shadow-[2px_1px_3px] shadow-black transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[26px]" />
              </Switch.Root>
            </div>
          </form>
        </div>

        <div className="pt-6">
          {(device.name === 'PluviDB-Iot' || device.name === 'PluviDB-Iot-Remote') && (
            <button
              onClick={handleClick}
              disabled={isConnected}
              className={`w-full p-1 rounded-lg text-white font-semibold transition-colors duration-300 ${
                isActive ? 'bg-red-600 hover:bg-red-500' : 'bg-green-500 hover:bg-green-400'
              } ${isConnected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isActive ? 'Conectar local' : 'Conectar remoto'}
            </button>
          )}

          <span className=" text-[#336B9E] text-[10px] font-bold pl-2 pr-2">
            Selecionar a porta COM:
          </span>
          <select
            className={`w-full mt-2 text-[#336B9E] text-center mt-1 p-1 border-[1px] border-[#336B9E] rounded-lg outline-none ${isActive ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            value={valorSelecionado}
            onChange={handleChange}
            disabled={OfflineMode || isActive}
          >
            <option value={'Selecione'}>Selecione</option>
            {availablePorts.map((port, index) => (
              <option key={index} value={port}>
                {port}
              </option>
            ))}
          </select>
        </div>

        {isConnected ? (
          <button
            className={`w-full rounded-lg p-1 mt-3 text-white ${
              disconnectDisabled
                ? 'bg-red-300 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 cursor-pointer'
            }`}
            onClick={handleClickDisconect}
            disabled={disconnectDisabled}
          >
            Desconectar
          </button>
        ) : (
          <button
            className={`bg-green-500 w-full rounded-lg p-1 outline-none mt-3 text-white ${
              connectDisabled ? 'cursor-not-allowed' : 'hover:bg-green-400 cursor-pointer'
            }`}
            onClick={handleClickConect}
            disabled={connectDisabled}
          >
            Conectar
          </button>
        )}
      </div>
    </>
  )
}
