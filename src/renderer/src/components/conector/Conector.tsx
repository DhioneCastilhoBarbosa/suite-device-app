import * as Switch from '@radix-ui/react-switch'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Openport, ClosePort } from '../Terminal/Terminal'
import { Device } from '../../Context/DeviceContext'
import {
  CloseModBus,
  armNotFoundModal,
  beginConnection,
  cancelConnection,
  connectClient,
  disarmNotFoundModal,
  notFoundModalTarget,
  setPortOwner,
  waitForPortRelease,
  type ConnectResult
} from '../../utils/modbusRTU'
import Loading from '../loading/loading'
import NoDeviceFoundModbus from '../modal/noDeviceFoundModbus'
import { ClosePortRS232, OpenPortRS232 } from '../Teclado-SDI12/Teclado'
import { ClosePortTSatDB, OpenPortTSatDB } from '../TSatDB/TSatDB'
import { ClosePortPluviIoT, OpenPortPluviIoT } from '../PluviDB-Iot/PluviDBIot'
import { ClosePortPcdPluvi, OpenPortPcdPluvi } from '../PCD-Pluviometrica/PcdPluviometrica'
import {
  ClosePortSerialTerminal,
  OpenPortSerialTerminal,
  getSerialTerminalSettings
} from '../Terminal-Serial/TerminalSerial'
import { toast } from 'react-toastify'
import { SerialManager } from '../../utils/serialManager'
import { t } from 'i18next'

const PORT_PLACEHOLDER = 'Selecione'

function translateSerialDetail(detail: string): string {
  const text = detail.trim()
  if (/access denied/i.test(text)) return t('Acesso negado')
  if (/file not found/i.test(text) || /no such file or directory/i.test(text)) {
    return t('Arquivo não encontrado')
  }
  const unknownCode = text.match(/unknown error code\s*(\d+)/i)
  if (unknownCode) return t('Código de erro desconhecido {{code}}', { code: unknownCode[1] })
  if (/device attached to the system is not functioning/i.test(text)) {
    return t('O dispositivo conectado não está funcionando')
  }
  if (/semaphore timeout/i.test(text)) return t('Tempo limite da porta serial excedido')
  return text
}

function translateNativeSerialMessage(raw: string): string {
  const cleaned = raw.replace(/^Error:\s*/i, '').trim()
  const opening = cleaned.match(/^Opening\s+(\S+):\s*(.+)$/i)
  if (opening) {
    return t('Abrindo {{port}}: {{detail}}', {
      port: opening[1],
      detail: translateSerialDetail(opening[2])
    })
  }
  return translateSerialDetail(cleaned)
}

function serialOpenErrorToast(raw?: string): string {
  const message = (raw ?? '').trim()
  const opening = message.replace(/^Error:\s*/i, '').match(/^Opening\s+(\S+):\s*(.+)$/i)
  const port = opening?.[1]
  const detail = opening?.[2] ?? message

  if (/access denied/i.test(detail)) {
    return port
      ? t(
          'Acesso negado à porta {{port}}. Verifique se o dispositivo está sendo usado por outro programa.',
          { port }
        )
      : t(
          'Acesso negado à porta serial. Verifique se o dispositivo está sendo usado por outro programa.'
        )
  }

  return t('Erro ao abrir a porta serial: {{message}}', {
    message: message ? translateNativeSerialMessage(message) : t('desconhecido')
  })
}

interface ConectorProps {
  portDevice: (port: string) => void
  isOnline: boolean
  PortStatus: (status: boolean) => void
}

export default function Conector({ portDevice, isOnline, PortStatus }: ConectorProps) {
  const [availablePorts, setAvailablePorts] = useState<string[]>([])
  const [OfflineMode, setOfflineMode] = useState(false)
  const [valorSelecionado, setValorSelecionado] = useState(PORT_PLACEHOLDER)
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
  const stopRequested = useRef(false)
  const connectAttempt = useRef(0)
  const deviceNameRef = useRef(device.name)
  deviceNameRef.current = device.name
  const [hideNotFound, setHideNotFound] = useState(false)
  const [notFoundOn, setNotFoundOn] = useState<string | null>(null)

  const safeCloseAll = async (physical = false) => {
    try {
      await ClosePortTSatDB({ physical })
    } catch {}
    try {
      ClosePort()
    } catch {}
    try {
      ClosePortRS232()
    } catch {}
    try {
      ClosePortPluviIoT()
    } catch {}
    try {
      ClosePortPcdPluvi()
    } catch {}
    try {
      ClosePortSerialTerminal()
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
            t('Porta {{port}} removida fisicamente. Desconectado.', {
              port: valorSelecionado
            }),
            toastId ? { toastId } : undefined
          )
        }
        SerialManager.setBusy()
        SetPortOpen({ state: false })
        setConected(false)
        setIsConnected(false)
        PortStatus(false)

        registerConnectorDisconnect(null)
        await safeCloseAll(Boolean(reason))

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
    connectAttempt.current += 1
    stopRequested.current = true
    setHideNotFound(true)
    setDeviceFound(null)
    setNotFoundOn(null)
    setPortOwner(null)
    setIsLoading(false)
    setIsConnected(false)
    setConected(false)
    SetPortOpen({ state: false })
    PortStatus(false)
    if (!latestOffline.current) setMode({ state: false })
    void cancelConnection()
  }, [device.name])

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
        setValorSelecionado(PORT_PLACEHOLDER)
        setButtonAbility(true)
        setCooldownUntil(Date.now() + 2500)
      }
    })

    const offErr = SerialManager.onError((m) =>
      toast.error(t('Erro serial: {{message}}', { message: translateNativeSerialMessage(m) }))
    )

    return () => {
      offAdd?.()
      offRem?.()
      offErr?.()
    }
  }, []) // sem deps

  const handleChange = (event) => {
    const v = event.target.value
    setValorSelecionado(v)
    setButtonAbility(v === PORT_PLACEHOLDER)
  }

  const releaseCancelledConnect = () => {
    SetPortOpen({ state: false })
    setIsLoading(false)
    setIsConnected(false)
    setConected(false)
    PortStatus(false)
    setDeviceFound(null)
    setMode({ state: false })
  }

  const handleClickConect = async () => {
    const attempt = ++connectAttempt.current
    const startedOn = device.name
    const attemptActive = () =>
      connectAttempt.current === attempt &&
      !stopRequested.current &&
      deviceNameRef.current === startedOn &&
      notFoundModalTarget() === startedOn
    armNotFoundModal(startedOn)
    stopRequested.current = false
    setHideNotFound(false)
    setNotFoundOn(null)
    SerialManager.setBusy()
    let loadingTimeout: NodeJS.Timeout | null = null
    try {
      if (Date.now() < cooldownUntil) await sleep(cooldownUntil - Date.now())

      if (!OfflineMode) {
        if (!availablePorts.includes(valorSelecionado)) {
          disarmNotFoundModal()
          toast.error(t('Porta não disponível. Reconecte o cabo e selecione novamente.'))
          return
        }
      }

      portDevice(valorSelecionado)
      const ModBusProps = { SerialName: valorSelecionado, BaudRate: 9600 }

      await waitForPortRelease()
      if (!attemptActive()) {
        disarmNotFoundModal()
        return
      }

      if (!OfflineMode) {
        try {
          if (device.name === 'terminal') {
            await Openport({ portName: valorSelecionado, bauld: 1200 })
            if (!attemptActive()) return
            setPortOwner(startedOn)
            SetPortOpen({ state: true })
            registerSilentDisconnect()
          } else if (device.name === 'terminal-serial') {
            await OpenPortSerialTerminal({
              portName: valorSelecionado,
              bauld: getSerialTerminalSettings().baud
            })
            if (!attemptActive()) return
            setPortOwner(startedOn)
            SetPortOpen({ state: true })
            registerSilentDisconnect()
          } else if (device.name === 'teclado-sdi12') {
            await OpenPortRS232({ portName: valorSelecionado, bauld: 9600 })
            if (!attemptActive()) return
            setPortOwner(startedOn)
            SetPortOpen({ state: true })
            registerSilentDisconnect()
          } else if (device.name === 'TSatDB') {
            await OpenPortTSatDB({ portName: valorSelecionado, bauld: 9600 })
            if (!attemptActive()) {
              void ClosePortTSatDB()
              return
            }
            setPortOwner(startedOn)
            SetPortOpen({ state: true })
            registerSilentDisconnect()
          } else if (device.name === 'PluviDB-Iot') {
            await OpenPortPluviIoT({ portName: valorSelecionado, bauld: 115200 })
            if (!attemptActive()) return
            setPortOwner(startedOn)
            SetPortOpen({ state: true })
            registerSilentDisconnect()
          } else if (device.name === 'PCD-Pluviometrica') {
            await OpenPortPcdPluvi({ portName: valorSelecionado, bauld: 115200 })
            if (!attemptActive()) return
            setPortOwner(startedOn)
            SetPortOpen({ state: true })
            registerSilentDisconnect()
          } else {
            beginConnection()
            loadingTimeout = setTimeout(() => setIsLoading(true), 200)
            const stopped = (result?: ConnectResult) =>
              stopRequested.current || result === 'cancelled'
            let ok: ConnectResult = await connectClient(ModBusProps)
            if (!attemptActive() || stopped(ok)) {
              if (connectAttempt.current === attempt) releaseCancelledConnect()
              return
            }
            if (ok === false) {
              await sleep(400)
              if (!attemptActive() || stopped()) {
                if (connectAttempt.current === attempt) releaseCancelledConnect()
                return
              }
              ok = await connectClient(ModBusProps)
            }
            if (!attemptActive() || stopped(ok)) {
              if (connectAttempt.current === attempt) releaseCancelledConnect()
              return
            }
            if (ok !== true) {
              if (!attemptActive()) return
              SetPortOpen({ state: false })
              setIsLoading(false)
              setConected(false)
              setNotFoundOn(startedOn)
              setDeviceFound(false)
              return
            }
            if (!attemptActive()) return
            setPortOwner(startedOn)
            SetPortOpen({ state: true })
            setDeviceFound(true)
            setIsLoading(false)
            setMode({ state: false })
            registerSilentDisconnect()
          }

          if (!attemptActive()) return
          setIsConnected(true)
          PortStatus(true)
          setConected(true)
        } catch (error: any) {
          if (!attemptActive()) return
          setIsLoading(false)
          SetPortOpen({ state: false })
          setIsConnected(false)
          setConected(false)
          setDeviceFound(null)
          toast.error(serialOpenErrorToast(error?.message))
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
        setButtonAbility(true)
        setValorSelecionado(PORT_PLACEHOLDER)
      } else {
        setButtonAbility(false)
      }
      return next
    })
  }

  const closeNoDeviceFoundModal = () => {
    setDeviceFound(null)
    setNotFoundOn(null)
  }

  const handleStop = () => {
    connectAttempt.current += 1
    stopRequested.current = true
    setHideNotFound(true)
    setNotFoundOn(null)
    setPortOwner(null)
    void cancelConnection()
    releaseCancelledConnect()
  }

  const handleClick = () => {
    setIsActive((prev) => !prev)
    setDevice((prev) => {
      if (prev.name === 'PluviDB-Iot' || prev.name === 'PluviDB-Iot-Remote') {
        return {
          ...prev,
          name: prev.name === 'PluviDB-Iot' ? 'PluviDB-Iot-Remote' : 'PluviDB-Iot'
        }
      }
      if (prev.name === 'PCD-Pluviometrica' || prev.name === 'PCD-Pluviometrica-Remote') {
        return {
          ...prev,
          name:
            prev.name === 'PCD-Pluviometrica'
              ? 'PCD-Pluviometrica-Remote'
              : 'PCD-Pluviometrica'
        }
      }
      return prev
    })
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
      {notFoundOn !== null && notFoundOn === device.name && !hideNotFound && (
        <NoDeviceFoundModbus onClose={closeNoDeviceFoundModal} />
      )}
      <div className="flex flex-col items-center bg-white rounded-lg m-1 pt-2 pb-2 pr-3 pl-3">
        <div className="w-full border-[1px] border-[#336B9E] p-1 rounded-lg">
          <form>
            <div className="flex items-center justify-between pr-2 pl-2">
              <label className=" text-[10px] text-blue-950" htmlFor="airplane-mode">
                {t('Modo offline')}
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
          {(device.name === 'PluviDB-Iot' ||
            device.name === 'PluviDB-Iot-Remote' ||
            device.name === 'PCD-Pluviometrica' ||
            device.name === 'PCD-Pluviometrica-Remote') && (
            <button
              onClick={handleClick}
              disabled={isConnected}
              className={`w-full rounded-md px-2 py-1.5 text-white font-semibold shadow-sm transition-all duration-150 ${
                isActive ? 'bg-red-600 hover:bg-red-500' : 'bg-green-500 hover:bg-green-400'
              } ${isConnected ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isActive ? t('Conectar local') : t('Conectar remoto')}
            </button>
          )}

          <span className=" text-[#336B9E] text-[10px] font-bold pl-2 pr-2">
            {t('Selecionar a porta COM:')}
          </span>
          <select
            className={`mt-2 w-full rounded-md border border-[#336B9E] p-1.5 text-center text-[#336B9E] outline-none ${isActive ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            value={valorSelecionado}
            onChange={handleChange}
            disabled={OfflineMode || isActive}
          >
            <option value={PORT_PLACEHOLDER}>{t('Selecione')}</option>
            {availablePorts.map((port, index) => (
              <option key={index} value={port}>
                {port}
              </option>
            ))}
          </select>
        </div>

        {isConnected ? (
          <button
            className={`mt-3 w-full rounded-md px-2 py-1.5 font-semibold text-white shadow-sm transition-all duration-150 ${
              disconnectDisabled
                ? 'cursor-not-allowed bg-red-300'
                : 'cursor-pointer bg-red-500 hover:bg-red-600'
            }`}
            onClick={handleClickDisconect}
            disabled={disconnectDisabled}
          >
            {t('Desconectar')}
          </button>
        ) : (
          <button
            className={`mt-3 w-full rounded-md bg-green-500 px-2 py-1.5 font-semibold text-white shadow-sm outline-none transition-all duration-150 ${
              connectDisabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-green-400'
            }`}
            onClick={handleClickConect}
            disabled={connectDisabled}
          >
            {t('Conectar')}
          </button>
        )}
      </div>
    </>
  )
}
