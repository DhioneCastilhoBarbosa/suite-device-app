import { TerminalWindow } from '@phosphor-icons/react'
import Button from '../button/Button'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { saveAs } from 'file-saver'
import SerialManagerRS232 from '@renderer/utils/serial'
import TerminalSerialBanner from '../../assets/Terminal-Serial-banner.png'
import { CardInformation, RichText } from '../cardInfomation/CardInformation'
import { ImageDevice } from '../imageDevice/ImageDevice'
import { Device } from '../../Context/DeviceContext'
import HeaderDevice from '../headerDevice/HeaderDevice'
import ContainerDevice from '../containerDevice/containerDevice'
import { t } from 'i18next'
import { toast } from 'react-toastify'

interface TerminalSerialProps {
  isConect: boolean
  portCom?: string | { name?: string }
  PortStatus?: boolean
}

interface SerialProps {
  portName: string
  bauld: number
}

export const SERIAL_TERMINAL_BAUDRATES = [9600, 19200, 38400, 57600, 115200] as const
export const SERIAL_TERMINAL_DATA_BITS = [5, 6, 7, 8] as const
export const SERIAL_TERMINAL_PARITIES = ['none', 'even', 'odd', 'mark', 'space'] as const
export const SERIAL_TERMINAL_HANDSHAKES = ['none', 'rtscts', 'xonxoff', 'rtscts-xonxoff'] as const

export type SerialDataBits = (typeof SERIAL_TERMINAL_DATA_BITS)[number]
export type SerialParity = (typeof SERIAL_TERMINAL_PARITIES)[number]
export type SerialHandshake = (typeof SERIAL_TERMINAL_HANDSHAKES)[number]

export type SerialTerminalSettings = {
  baud: number
  dataBits: SerialDataBits
  parity: SerialParity
  handshake: SerialHandshake
}

const DEFAULT_SERIAL_TERMINAL_SETTINGS: SerialTerminalSettings = {
  baud: 9600,
  dataBits: 8,
  parity: 'none',
  handshake: 'none'
}

const serialManagerSerialTerminal = new SerialManagerRS232()

let serialTerminalSettings: SerialTerminalSettings = { ...DEFAULT_SERIAL_TERMINAL_SETTINGS }

export function getSerialTerminalBaud(): number {
  return serialTerminalSettings.baud
}

export function setSerialTerminalBaud(baud: number): void {
  serialTerminalSettings = { ...serialTerminalSettings, baud }
}

export function getSerialTerminalSettings(): SerialTerminalSettings {
  return { ...serialTerminalSettings }
}

export function setSerialTerminalSettings(next: SerialTerminalSettings): void {
  serialTerminalSettings = { ...next }
}

function handshakeToFlow(handshake: SerialHandshake) {
  return {
    rtscts: handshake === 'rtscts' || handshake === 'rtscts-xonxoff',
    xon: handshake === 'xonxoff' || handshake === 'rtscts-xonxoff',
    xoff: handshake === 'xonxoff' || handshake === 'rtscts-xonxoff'
  }
}

function toPortOptions(settings: SerialTerminalSettings) {
  return {
    dataBits: settings.dataBits,
    parity: settings.parity,
    stopBits: 1 as const,
    ...handshakeToFlow(settings.handshake)
  }
}

export function OpenPortSerialTerminal({ portName, bauld }: SerialProps): Promise<void> {
  const settings = { ...getSerialTerminalSettings(), baud: bauld }
  return serialManagerSerialTerminal.openPortRS232(portName, settings.baud, toPortOptions(settings))
}

export async function ReopenPortSerialTerminal({ portName, bauld }: SerialProps): Promise<void> {
  const settings = { ...getSerialTerminalSettings(), baud: bauld }
  await serialManagerSerialTerminal.reopenSafe(portName, settings.baud, toPortOptions(settings))
}

export async function ClosePortSerialTerminal(): Promise<void> {
  try {
    await serialManagerSerialTerminal.closePortRS232()
  } catch {
    // ignore close errors during disconnect
  }
}

export function subscribeRawDataSerialTerminal(listener: (chunk: string) => void): () => void {
  return serialManagerSerialTerminal.subscribeRawData(listener)
}

function resolvePortName(portCom?: string | { name?: string }, fallback?: string): string {
  if (typeof portCom === 'string' && portCom.trim()) return portCom
  if (portCom && typeof portCom === 'object' && portCom.name) return portCom.name
  return fallback ?? ''
}

function consumeRxText(text: string): { lines: string[]; carry: string } {
  const parts = text.split(/\r\n|\n|\r/)
  const carry = parts.pop() ?? ''
  const lines = parts.filter((line) => line.length > 0).map((line) => `RX: ${line}`)
  return { lines, carry }
}

function formatLogForFile(lines: string[]): string {
  return lines.join('\n')
}

const PARITY_LABELS: Record<SerialParity, string> = {
  none: 'None',
  even: 'Even',
  odd: 'Odd',
  mark: 'Mark',
  space: 'Space'
}

const HANDSHAKE_LABELS: Record<SerialHandshake, string> = {
  none: 'None',
  rtscts: 'RTS/CTS',
  xonxoff: 'XON/XOFF',
  'rtscts-xonxoff': 'RTS/CTS + XON/XOFF'
}

function SerialField({
  label,
  value,
  disabled,
  onChange,
  children
}: {
  label: string
  value: string | number
  disabled?: boolean
  onChange: (value: string) => void
  children: ReactNode
}): JSX.Element {
  return (
    <label className="flex w-full flex-col gap-1 text-xs font-semibold text-white">
      <span className="whitespace-nowrap">{label}</span>
      <select
        className="h-8 w-full rounded-md border border-sky-200 bg-white px-1.5 text-xs font-semibold text-sky-700 outline-none disabled:cursor-not-allowed disabled:opacity-60"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  )
}

function SerialConfigSidebar({
  settings,
  disabled,
  onChange
}: {
  settings: SerialTerminalSettings
  disabled?: boolean
  onChange: (next: SerialTerminalSettings) => void
}): JSX.Element {
  return (
    <div className="flex w-full shrink-0 flex-col gap-2.5 bg-sky-500 px-2 py-3 sm:w-36 sm:border-r sm:border-sky-600">
      <SerialField
        label={t('Baud rate')}
        value={settings.baud}
        disabled={disabled}
        onChange={(value) => onChange({ ...settings, baud: Number(value) })}
      >
        {SERIAL_TERMINAL_BAUDRATES.map((baud) => (
          <option key={baud} value={baud}>
            {baud}
          </option>
        ))}
      </SerialField>
      <SerialField
        label={t('Data Size')}
        value={settings.dataBits}
        disabled={disabled}
        onChange={(value) => onChange({ ...settings, dataBits: Number(value) as SerialDataBits })}
      >
        {SERIAL_TERMINAL_DATA_BITS.map((bits) => (
          <option key={bits} value={bits}>
            {bits}
          </option>
        ))}
      </SerialField>
      <SerialField
        label={t('Parity')}
        value={settings.parity}
        disabled={disabled}
        onChange={(value) => onChange({ ...settings, parity: value as SerialParity })}
      >
        {SERIAL_TERMINAL_PARITIES.map((parity) => (
          <option key={parity} value={parity}>
            {PARITY_LABELS[parity]}
          </option>
        ))}
      </SerialField>
      <SerialField
        label={t('Handshake')}
        value={settings.handshake}
        disabled={disabled}
        onChange={(value) => onChange({ ...settings, handshake: value as SerialHandshake })}
      >
        {SERIAL_TERMINAL_HANDSHAKES.map((handshake) => (
          <option key={handshake} value={handshake}>
            {HANDSHAKE_LABELS[handshake]}
          </option>
        ))}
      </SerialField>
    </div>
  )
}

export default function TerminalSerial(props: TerminalSerialProps): JSX.Element {
  const { port, mode }: any = Device()
  const [settings, setSettings] = useState(getSerialTerminalSettings())
  const [changingSettings, setChangingSettings] = useState(false)
  const [listenKey, setListenKey] = useState(0)
  const [dataTerminal, setDataTerminal] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const rxCarryRef = useRef('')
  const rxFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const portName = resolvePortName(props.portCom, port?.name)

  const flushRxCarry = (): void => {
    if (rxFlushTimerRef.current) {
      clearTimeout(rxFlushTimerRef.current)
      rxFlushTimerRef.current = null
    }
    const leftover = rxCarryRef.current
    if (!leftover) return
    rxCarryRef.current = ''
    setDataTerminal((prev) => [...prev, `RX: ${leftover}`])
  }

  const handleSettingsChange = async (next: SerialTerminalSettings): Promise<void> => {
    const previous = settings
    if (
      next.baud === previous.baud &&
      next.dataBits === previous.dataBits &&
      next.parity === previous.parity &&
      next.handshake === previous.handshake
    ) {
      return
    }
    setSerialTerminalSettings(next)
    if (!props.isConect || mode?.state) {
      setSettings(next)
      return
    }
    if (!portName) {
      setSettings(next)
      return
    }
    setChangingSettings(true)
    try {
      await ReopenPortSerialTerminal({ portName, bauld: next.baud })
      setSettings(next)
      setListenKey((key) => key + 1)
    } catch (error: any) {
      setSerialTerminalSettings(previous)
      try {
        await ReopenPortSerialTerminal({ portName, bauld: previous.baud })
        setListenKey((key) => key + 1)
      } catch {
        // keep previous settings in UI; user can disconnect/reconnect
      }
      toast.error(error?.message ?? t('Erro serial: {{message}}', { message: String(error) }))
    } finally {
      setChangingSettings(false)
    }
  }

  const handleSendComand = async (): Promise<void> => {
    const command = inputValue
    if (!command) return
    flushRxCarry()
    const payload = command.endsWith('\n') ? command : `${command}\r\n`
    setDataTerminal((prev) => [...prev, `TX: ${command}`])
    setInputValue('')
    try {
      await serialManagerSerialTerminal.writeRaw(payload)
    } catch (error: any) {
      toast.error(error?.message ?? t('Erro serial: {{message}}', { message: String(error) }))
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      void handleSendComand()
    }
  }

  const handleClear = (): void => {
    if (rxFlushTimerRef.current) {
      clearTimeout(rxFlushTimerRef.current)
      rxFlushTimerRef.current = null
    }
    rxCarryRef.current = ''
    setDataTerminal([])
  }

  const handleSaveToFile = (): void => {
    const headerFile = t('Dados gerados do Terminal Serial - ')
    const date = new Date().toLocaleString()
    const Data = headerFile + date + '\n \n' + formatLogForFile(dataTerminal)
    const blob = new Blob([Data], { type: 'text/plain;charset=utf-8' })
    const dateObj = new Date()
    const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}${(dateObj.getMonth() + 1).toString().padStart(2, '0')}${dateObj.getFullYear().toString().slice(-2)}-${dateObj.getHours().toString().padStart(2, '0')}${dateObj.getMinutes().toString().padStart(2, '0')}${dateObj.getSeconds().toString().padStart(2, '0')}`
    saveAs(blob, `Terminal-Serial_${formattedDate}.txt`)
  }

  useEffect(() => {
    if (!props.isConect || mode?.state) return
    rxCarryRef.current = ''
    const unsubscribe = subscribeRawDataSerialTerminal((chunk) => {
      if (!chunk) return
      const { lines, carry } = consumeRxText(rxCarryRef.current + chunk)
      rxCarryRef.current = carry
      if (lines.length) {
        setDataTerminal((prev) => [...prev, ...lines])
      }
      if (rxFlushTimerRef.current) {
        clearTimeout(rxFlushTimerRef.current)
        rxFlushTimerRef.current = null
      }
      if (carry) {
        rxFlushTimerRef.current = setTimeout(() => {
          const leftover = rxCarryRef.current
          if (!leftover) return
          rxCarryRef.current = ''
          setDataTerminal((prev) => [...prev, `RX: ${leftover}`])
        }, 80)
      }
    })
    return () => {
      if (rxFlushTimerRef.current) {
        clearTimeout(rxFlushTimerRef.current)
        rxFlushTimerRef.current = null
      }
      unsubscribe()
    }
  }, [props.isConect, mode?.state, listenKey])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [dataTerminal])

  return props.isConect ? (
    <ContainerDevice>
      <HeaderDevice DeviceName={t('Terminal Serial')}>
        <TerminalWindow size={30} />
      </HeaderDevice>

      <div className="box-border mx-auto mb-3 w-full min-w-0 max-w-4xl px-1 py-3 sm:px-2">
        <div className="box-border overflow-hidden rounded-md border border-sky-100 bg-gradient-to-br from-[#F7FBFF] to-white shadow-sm">
          <div className="mb-0 flex flex-row flex-wrap items-center justify-between gap-2 border-b border-sky-600 bg-sky-500 px-3 py-1.5 sm:px-4">
            <label className="text-xs font-bold uppercase tracking-wide text-white">{t('Terminal')}</label>
            <div className="flex flex-row flex-wrap gap-2">
              <Button size="small" onClick={handleClear}>
                {t('Limpar')}
              </Button>
              <Button size="small" onClick={handleSaveToFile}>
                {t('Salvar')}
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row">
            <SerialConfigSidebar
              settings={settings}
              disabled={changingSettings}
              onChange={(next) => void handleSettingsChange(next)}
            />

            <div className="min-w-0 flex-1 p-3 sm:p-4">
              <textarea
                ref={textareaRef}
                value={formatLogForFile(dataTerminal)}
                readOnly
                className="box-border h-56 w-full min-w-0 max-w-full resize-none overflow-y-auto whitespace-pre-wrap rounded-md border border-sky-200 bg-white px-3 py-2 text-sm leading-relaxed text-zinc-700 outline-none focus:border-sky-400"
              />

              <div className="mt-3 mb-4 flex w-full min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                <input
                  className="box-border h-10 min-w-0 flex-1 rounded-md border border-sky-200 bg-white px-3 text-sm text-sky-700 outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-300"
                  type="text"
                  placeholder={t('Digite o comando')}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={handleKeyPress}
                />
                <Button size="large" className="h-10 shrink-0" filled onClick={() => void handleSendComand()}>
                  {t('Enviar')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContainerDevice>
  ) : (
    <ContainerDevice>
      <HeaderDevice DeviceName={t('Terminal Serial')}>
        <TerminalWindow size={30} />
      </HeaderDevice>
      <ImageDevice image={TerminalSerialBanner} link="https://dualbase.com.br/produtos/" fit="contain" />

      <div className="flex flex-col items-center justify-center rounded-b-lg bg-[#EDF4FB] pt-3">
        <CardInformation title={t('VISÃO GERAL')}>
          <p>
            <RichText i18nKey="O <b>Terminal Serial</b> é uma ferramenta genérica para comunicação serial RS-232/USB. Permite enviar e receber dados em texto e ajustar baudrate, data size, parity e handshake." />
          </p>
        </CardInformation>

        <CardInformation title={t('DESTAQUES')}>
          <p>
            • <RichText i18nKey="<b>Comunicação serial simples (TX/RX);</b>" />
          </p>
          <p>
            • <RichText i18nKey="<b>Seleção de baudrate, data size, parity e handshake;</b>" />
          </p>
          <p>
            • <RichText i18nKey="<b>Limpar a tela do terminal.</b>" />
          </p>
        </CardInformation>

        <CardInformation title={t('APLICAÇÕES')}>
          <p>
            {t('Teste de equipamentos via porta serial.')}
          </p>
        </CardInformation>
      </div>
    </ContainerDevice>
  )
}
