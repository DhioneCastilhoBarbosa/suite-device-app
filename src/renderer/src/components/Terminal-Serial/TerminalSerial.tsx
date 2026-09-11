import { TerminalWindow } from '@phosphor-icons/react'
import Button from '../button/Button'
import { useEffect, useRef, useState } from 'react'
import { saveAs } from 'file-saver'
import SerialManagerRS232 from '@renderer/utils/serial'
import TerminalSDI12Banner from '../../assets/TerminalSDI12-banner.png'
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

const serialManagerSerialTerminal = new SerialManagerRS232()

let serialTerminalBaud: number = 9600

export function getSerialTerminalBaud(): number {
  return serialTerminalBaud
}

export function setSerialTerminalBaud(baud: number): void {
  serialTerminalBaud = baud
}

export function OpenPortSerialTerminal({ portName, bauld }: SerialProps): Promise<void> {
  return serialManagerSerialTerminal.openPortRS232(portName, bauld)
}

export async function ReopenPortSerialTerminal({ portName, bauld }: SerialProps): Promise<void> {
  await serialManagerSerialTerminal.reopenSafe(portName, bauld)
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

function appendRxChunk(prev: string[], chunk: string): string[] {
  const last = prev[prev.length - 1]
  if (last?.startsWith('RX: ')) {
    const next = [...prev]
    next[next.length - 1] = last + chunk
    return next
  }
  return [...prev, `RX: ${chunk}`]
}

function formatLogForFile(lines: string[]): string {
  return lines.join('\n')
}

function BaudrateSelect({
  value,
  disabled,
  onChange
}: {
  value: number
  disabled?: boolean
  onChange: (baud: number) => void
}): JSX.Element {
  return (
    <label className="flex items-center gap-2 text-xs font-semibold text-white">
      <span>{t('Baudrate')}</span>
      <select
        className="h-7 rounded-md border border-sky-200 bg-white px-1.5 text-xs font-semibold text-sky-700 outline-none disabled:cursor-not-allowed disabled:opacity-60"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {SERIAL_TERMINAL_BAUDRATES.map((baud) => (
          <option key={baud} value={baud}>
            {baud}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function TerminalSerial(props: TerminalSerialProps): JSX.Element {
  const { port, mode }: any = Device()
  const [baud, setBaud] = useState(getSerialTerminalBaud())
  const [changingBaud, setChangingBaud] = useState(false)
  const [listenKey, setListenKey] = useState(0)
  const [dataTerminal, setDataTerminal] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const portName = resolvePortName(props.portCom, port?.name)

  const handleBaudChange = async (nextBaud: number): Promise<void> => {
    if (nextBaud === baud) return
    setSerialTerminalBaud(nextBaud)
    if (!props.isConect || mode?.state) {
      setBaud(nextBaud)
      return
    }
    if (!portName) {
      setBaud(nextBaud)
      return
    }
    const previous = baud
    setChangingBaud(true)
    try {
      await ReopenPortSerialTerminal({ portName, bauld: nextBaud })
      setBaud(nextBaud)
      setListenKey((key) => key + 1)
    } catch (error: any) {
      setSerialTerminalBaud(previous)
      try {
        await ReopenPortSerialTerminal({ portName, bauld: previous })
        setListenKey((key) => key + 1)
      } catch {
        // keep previous baud in UI; user can disconnect/reconnect
      }
      toast.error(error?.message ?? t('Erro serial: {{message}}', { message: String(error) }))
    } finally {
      setChangingBaud(false)
    }
  }

  const handleSendComand = async (): Promise<void> => {
    const command = inputValue
    if (!command) return
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
    setDataTerminal([])
  }

  const handleSaveToFile = (): void => {
    const headerFile = t('Dados gerado do Terminal Serial - ')
    const date = new Date().toLocaleString()
    const Data = headerFile + date + '\n \n' + formatLogForFile(dataTerminal)
    const blob = new Blob([Data], { type: 'text/plain;charset=utf-8' })
    const dateObj = new Date()
    const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}${(dateObj.getMonth() + 1).toString().padStart(2, '0')}${dateObj.getFullYear().toString().slice(-2)}-${dateObj.getHours().toString().padStart(2, '0')}${dateObj.getMinutes().toString().padStart(2, '0')}${dateObj.getSeconds().toString().padStart(2, '0')}`
    saveAs(blob, `Terminal-Serial_${formattedDate}.txt`)
  }

  useEffect(() => {
    if (!props.isConect || mode?.state) return
    const unsubscribe = subscribeRawDataSerialTerminal((chunk) => {
      if (!chunk) return
      setDataTerminal((prev) => appendRxChunk(prev, chunk))
    })
    return unsubscribe
  }, [props.isConect, mode?.state, listenKey])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [dataTerminal])

  const baudSlot = (
    <BaudrateSelect value={baud} disabled={changingBaud} onChange={(next) => void handleBaudChange(next)} />
  )

  return props.isConect ? (
    <ContainerDevice>
      <HeaderDevice DeviceName={t('Terminal Serial')} rightSlot={baudSlot}>
        <TerminalWindow size={30} />
      </HeaderDevice>

      <div className="box-border mx-auto mb-3 w-full min-w-0 max-w-2xl px-1 py-3 sm:px-2">
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

          <div className="p-3 sm:p-4">
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
    </ContainerDevice>
  ) : (
    <ContainerDevice>
      <HeaderDevice DeviceName={t('Terminal Serial')} rightSlot={baudSlot}>
        <TerminalWindow size={30} />
      </HeaderDevice>
      <ImageDevice image={TerminalSDI12Banner} link="https://dualbase.com.br/produtos/" fit="contain" />

      <div className="flex flex-col items-center justify-center rounded-b-lg bg-[#EDF4FB] pt-3">
        <CardInformation title={t('VISÃO GERAL')}>
          <p>
            <RichText i18nKey="O <b>Terminal Serial</b> é uma ferramenta genérica para comunicação serial RS-232/USB. Permite enviar e receber dados em texto, ajustar o baudrate, limpar a tela e salvar o histórico em arquivo TXT." />
          </p>
        </CardInformation>

        <CardInformation title={t('DESTAQUES')}>
          <p>
            • <RichText i18nKey="<b>Comunicação serial simples (TX/RX);</b>" />
          </p>
          <p>
            • <RichText i18nKey="<b>Seleção de baudrate;</b>" />
          </p>
          <p>
            • <RichText i18nKey="<b>Limpar tela e salvar histórico em TXT.</b>" />
          </p>
        </CardInformation>

        <CardInformation title={t('APLICAÇÕES')}>
          <p>
            {t('Testes em bancada, diagnóstico de equipamentos seriais e suporte técnico.')}
          </p>
        </CardInformation>
      </div>
    </ContainerDevice>
  )
}
