import {
  Broadcast,
  CircleNotch,
  Compass,
  GearSix,
  Info,
  MapPin,
  PaperPlaneTilt,
  Rss,
  TerminalWindow,
  WarningCircle
} from '@phosphor-icons/react'
import { CardInformation, RichText } from '../cardInfomation/CardInformation'
import ImgTsatDb from '../../assets/TSatDB-banner.png'
import { ImageDevice } from '../imageDevice/ImageDevice'
import HeaderDevice from '../headerDevice/HeaderDevice'
import ContainerDevice from '../containerDevice/containerDevice'
import Settings from './components/settings'
import SerialManagerRS232 from '@renderer/utils/serial'
import NoDeviceFoundModbus from '../modal/noDeviceFoundModbus'
import { Device } from '../../Context/DeviceContext'
import Status from './components/status'
import Gps from './components/gps'
import { useEffect, useRef, useState } from 'react'
import { Terminal, type TerminalLogEntry } from './components/terminal'
import { TransmissionTest } from './components/transmitionTest'
import LoadingData from '../loading/loadingData'
import { AntenaPointing } from './components/antennapointing'
import { RFAdvanced } from './components/RFAdvanced'
import { t } from 'i18next'
import { getPortOwner, notFoundModalTarget } from '../../utils/modbusRTU'
import { describeSerialError, tsatLog } from '../../utils/limniDebug'
//import { set } from 'zod'

interface TSatDBProps {
  isConect: boolean
  portCom?: string
  PortStatus?: boolean
}

interface SerialProps {
  portName: string
  bauld: number
}

const serialManagerTsatDB = new SerialManagerRS232()
const READ_GAP_MS = 80

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type TestLogEntry = { kind: 'sent' | 'response' | 'info'; text: string }

function fttTestStamp(): string {
  const when = new Date(Date.now() + (2 * 60 + 20) * 1000)
  const minutes = String(when.getMinutes()).padStart(2, '0')
  const seconds = String(when.getSeconds()).padStart(2, '0')
  return `00:${minutes}:${seconds}`
}

function testResponseText(command: string, raw: string): string {
  const echo = command.trim().toLowerCase()
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && line !== '>')
    .filter((line) => line.replace(/^>+/, '').trim().toLowerCase() !== echo)
  return lines.join('\n')
}

function settingValue(raw: string, key: string): string {
  const line = raw
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${key}=`))
  return line ? line.slice(key.length + 1).trim() : ''
}

const TEST_LINE_SKIP = new Set(['NESID', 'TBR'])

function labeledValue(raw: string, label: string): string {
  const needle = label.toLowerCase()
  const line = raw
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item.toLowerCase().startsWith(needle))
  if (!line) return ''
  return line.slice(label.length).replace(/^[:\s]+/, '').trim()
}

function pwrlvlValue(raw: string): string {
  const lines = raw
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter((item) => item && item !== '>')
  const line =
    lines.find((item) => /PWRLVL\s*=/i.test(item)) ??
    lines.find((item) => /\d+(?:[.,]\d+)?\s*,/.test(item)) ??
    ''
  return line.replace(/.*PWRLVL\s*=\s*/i, '').replace(/>/g, '').trim()
}

function swrValue(raw: string): string {
  const match = raw.match(/(?:^|[^A-Za-z])SWR\s*[:=]?\s*([0-9]+(?:[.,][0-9]+)?)/im)
  return match?.[1] ?? ''
}

/** `Time To Next Tx: 00:00:02:09` → dias:horas:minutos:segundos. */
function secondsFromTimeToNextTx(raw: string): number | null {
  const match = raw.match(/Time To Next Tx:\s*(\d+):(\d+):(\d+)(?::(\d+))?/i)
  if (!match) return null
  const first = Number(match[1])
  const second = Number(match[2])
  const third = Number(match[3])
  if (match[4] === undefined) return first * 3600 + second * 60 + third
  return first * 86400 + second * 3600 + third * 60 + Number(match[4])
}

class TestCancelled extends Error {
  constructor() {
    super('cancel')
    this.name = 'TestCancelled'
  }
}

function buildTestTransmissionLine(
  rcfg: string,
  details: { ns: string; firmware: string; vbat: string; pwrlvl: string; swr: string },
  obs: string
): string {
  const config = rcfg
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter((item) => /^[A-Za-z][A-Za-z0-9]*=/.test(item))
    .filter((item) => !TEST_LINE_SKIP.has(item.slice(0, item.indexOf('=')).toUpperCase()))

  return [
    'TEST',
    ...config,
    `NS=${details.ns}`,
    `Firmware=${details.firmware}`,
    `VBat=${details.vbat}`,
    `Pwrlvl=${details.pwrlvl}`,
    `SWR=${details.swr}`,
    `Obs=${obs.trim().slice(0, 50)}`
  ].join(';')
}

/**
 * Só considera a resposta pronta quando a linha do marcador chegou inteira (com CRLF),
 * senão a leitura terminaria com o valor cortado no meio.
 */
function lineComplete(marker: string): (partial: string) => boolean {
  return (partial) => {
    const at = partial.indexOf(marker)
    return at >= 0 && partial.includes('\r\n', at + marker.length)
  }
}

function lineCompleteIgnoreCase(marker: string): (partial: string) => boolean {
  const needle = marker.toLowerCase()
  return (partial) => {
    const at = partial.toLowerCase().indexOf(needle)
    return at >= 0 && partial.includes('\r\n', at + needle.length)
  }
}

const VAISALA_DSU_PORTS = ['dsu232_0_0', 'dsu232_0_1', 'dsu232_1_0', 'dsu232_1_1'] as const
/** Sem Enter nos 10s finais do contador e nos 15s de transmissão que vêm depois. */
const VAISALA_TX_QUIET_BEFORE_MS = 10_000
const VAISALA_TX_QUIET_AFTER_MS = 15_000
/** O Enter pode levar até ~2s; segura o próximo para ele não cair dentro dos 10s finais. */
const VAISALA_KEEPALIVE_LEAD_MS = 2_000

function vaisalaReroutePhrase(port: string): string {
  return `Terminal I/O re-routed to ${port}`
}

/** Qualquer porta DSU com redirecionamento confirma a ponte. */
function confirmedVaisalaPort(response: string): string {
  const text = response.toLowerCase()
  return VAISALA_DSU_PORTS.find((port) => text.includes(vaisalaReroutePhrase(port).toLowerCase())) ?? ''
}

function vaisalaRerouteReady(partial: string): boolean {
  return VAISALA_DSU_PORTS.some((port) => lineCompleteIgnoreCase(vaisalaReroutePhrase(port))(partial))
}

function serviceConnectionOpened(response: string): boolean {
  return /Service connection opened/i.test(response)
}

function quoteSerial(raw: string): string {
  const flat = raw.replace(/\r/g, '\\r').replace(/\n/g, '\\n')
  if (!flat) return '(vazia)'
  return flat.length > 600 ? `${flat.slice(0, 600)}…` : flat
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function OpenPortTSatDB({ portName, bauld }: SerialProps): Promise<void> {
  return serialManagerTsatDB.openPortRS232(portName, bauld)
}

let vaisalaUsesService = false

export function tsatVaisalaServiceActive(): boolean {
  return vaisalaUsesService
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function ClosePortTSatDB(options?: { physical?: boolean }) {
  const hadService = vaisalaUsesService
  const shouldCloseService = vaisalaUsesService && !options?.physical
  vaisalaUsesService = false
  if (hadService) {
    tsatLog(
      options?.physical
        ? 'vaisala: desconectar físico, close do serviço não enviado'
        : 'vaisala: desconectar, TX close'
    )
  }
  try {
    if (shouldCloseService && serialManagerTsatDB.isPortOpen()) {
      try {
        await serialManagerTsatDB.sendCommandTSatDB('close')
        const response = await serialManagerTsatDB.receiveDataTSatDB({
          overallTimeoutMs: 1500,
          silenceMs: 400
        })
        tsatLog(`vaisala: close resposta=${quoteSerial(response)}`)
      } catch (error) {
        tsatLog(`vaisala: close sem resposta ${describeSerialError(error)}`)
      }
    }
    await serialManagerTsatDB.closePortRS232()
    if (hadService) tsatLog('vaisala: COM fechada')
  } catch {
    try {
      await serialManagerTsatDB.closePortRS232()
    } catch {
      // A porta já pode ter saído.
    }
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function TSatDB(props: TSatDBProps) {
  const [MenuName, setMenuName] = useState('status')
  const [colorConfig, setColorConfig] = useState(false)
  const [colorStatus, setColorStatus] = useState(true)
  const [colorGps, setColorGps] = useState(false)
  const [colorTerminal, setColorTerminal] = useState(false)
  const [colorRF, setColorRF] = useState(false)
  const [colorApontamento, setColorApontamento] = useState(false)
  const [colorTest, setColorTest] = useState(false)

  // variaveis de dados recebidos da porta serial ao enviar um determinado comanda
  const [dataReceivedComandVER, setDataReceivedComandVER] = useState<string>('')
  const [dataReceivedComandRST, setDataReceivedComandRST] = useState<string>('')
  const [dataReceivedComandTIME, setDataReceivedComandTIME] = useState<string>('')
  const [dataReceivedComandTEMP, setDataReceivedComandTEMP] = useState<string>('')
  const [dataReceivedComandLTXS, setDataReceivedComandLTXS] = useState<string>('')
  const [dataReceivedComandPOS, setDataReceivedComandPOS] = useState<string>('')
  const [dataReceivedComandGPS, setDataReceivedComandGPS] = useState<string>('')
  const [dataReceivedComandPowerTX, setDataReceivedComandPowerTx] = useState<string>('')
  const [dataReceivedComandRCFG, setDataReceivedComandRCFG] = useState<string>('')
  const [terminalLog, setTerminalLog] = useState<TerminalLogEntry[]>([])
  const [transmissionLog, setTransmissionLog] = useState<TestLogEntry[]>([])
  const [testStatus, setTestStatus] = useState('')
  const [testLedHint, setTestLedHint] = useState(false)
  const [testSecondsLeft, setTestSecondsLeft] = useState<number | null>(null)
  const [testSecondsTotal, setTestSecondsTotal] = useState<number | null>(null)
  const [messageIsLoading, setMessageIsLoading] = useState<string>(
    t('Baixando informações do dispositivo!')
  )

  //FIM
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [vaisalaSelected, setVaisalaSelected] = useState(false)
  const [vaisalaPhase, setVaisalaPhase] = useState<'idle' | 'searching' | 'not-found'>('idle')
  const [vaisalaBridged, setVaisalaBridged] = useState(false)
  const [vaisalaRetry, setVaisalaRetry] = useState(0)
  const restoreInProgress = useRef(false)
  const testInProgress = useRef(false)
  const testCancelRequested = useRef(false)
  const testConfigChanged = useRef(false)
  const testSerialLock = useRef(false)
  const vaisalaLastActivityAt = useRef(Date.now())
  const vaisalaCommandBusy = useRef(false)
  const vaisalaKeepaliveBusy = useRef(false)
  const vaisalaTxAt = useRef(0)
  const commandEpoch = useRef(0)
  const [deviceFound, setDeviceFound] = useState<boolean | null>(null) // null indica que a varredura ainda não foi iniciada
  const { mode, SetPortOpen, connectorDisconnect }: any = Device()

  function handleMenu(menu: string): void {
    setColorConfig(menu === 'config')
    setColorStatus(menu === 'status')
    setColorGps(menu === 'gps')
    setColorTerminal(menu === 'terminal')
    setColorRF(menu === 'rf')
    setColorApontamento(menu === 'apontamento')
    setColorTest(menu === 'teste')
    setMenuName(menu)
  }

  function closeNoDeviceFoundModal(): void {
    setDeviceFound(null)
  }

  function touchVaisalaActivity(): void {
    vaisalaLastActivityAt.current = Date.now()
  }

  function vaisalaTransmitQuiet(now = Date.now()): boolean {
    const txAt = vaisalaTxAt.current
    if (!txAt) return false
    const quietStart = txAt - VAISALA_TX_QUIET_BEFORE_MS - VAISALA_KEEPALIVE_LEAD_MS
    const quietEnd = txAt + VAISALA_TX_QUIET_AFTER_MS
    return now >= quietStart && now < quietEnd
  }

  function releaseVaisalaTxQuiet(): void {
    if (!vaisalaTransmitQuiet()) vaisalaTxAt.current = 0
  }

  async function handleComandSend(
    comand: string,
    options?: {
      optionalReply?: boolean
      timeoutMs?: number
      silenceMs?: number
      keepLoading?: boolean
      isComplete?: (response: string) => boolean
      skipLog?: boolean
      allowDuringTest?: boolean
    }
  ): Promise<string> {
    // Comandos sem resposta obrigatória ainda precisam de folga para o dispositivo
    // responder; encurtar demais fazia a resposta cair na leitura do comando seguinte.
    if (options?.allowDuringTest) {
      if (testSerialLock.current || vaisalaTransmitQuiet()) return ''
    } else if (testInProgress.current && !testSerialLock.current) {
      return ''
    }
    const overallTimeoutMs = options?.timeoutMs ?? (options?.optionalReply ? 1500 : 20000)
    const shouldLog = !options?.skipLog
    vaisalaCommandBusy.current = true
    touchVaisalaActivity()

    try {
      if (shouldLog) tsatLog(`TX ${comand}`)
      await serialManagerTsatDB.sendCommandTSatDB(comand)
      const response = await serialManagerTsatDB.receiveDataTSatDB({
        overallTimeoutMs,
        silenceMs: options?.silenceMs,
        isComplete: options?.isComplete
      })
      if (shouldLog) tsatLog(`RX ${quoteSerial(response)}`)
      touchVaisalaActivity()
      return response
    } catch (error) {
      if (shouldLog) tsatLog(`erro TX ${comand}: ${describeSerialError(error)}`)
      if (options?.optionalReply) return ''
      if (!options?.keepLoading) finishLoading()
      throw error
    } finally {
      vaisalaCommandBusy.current = false
      touchVaisalaActivity()
    }
  }

  function finishLoading(): void {
    if (restoreInProgress.current || testInProgress.current) return
    setIsLoading(false)
  }

  function handleSendComandTerminal(comand: string, showInTerminal = false): void {
    if (!(props.isConect && !mode.state)) return
    const command = comand.trim()
    if (showInTerminal && command) {
      setTerminalLog((prev) => [...prev, { kind: 'sent', text: command }])
    }
    handleComandSend(comand)
      .then((response) => {
        if (!showInTerminal || !response) return
        const reply = testResponseText(command, response)
        if (!reply) return
        setTerminalLog((prev) => [...prev, { kind: 'response', text: reply }])
      })
      .catch(() => {
        // Falha de envio não apaga o histórico.
      })
  }

  function configurationIsComplete(response: string): boolean {
    return response.includes('NESID=') && response.includes('IRC=')
  }

  async function readConfigurationAfterRestore(): Promise<void> {
    const shownAt = Date.now()
    setMessageIsLoading(t('Baixando informações do dispositivo!'))
    setIsLoading(true)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await handleComandSend('rcfg', {
          timeoutMs: 8000,
          silenceMs: 800,
          keepLoading: true,
          isComplete: lineComplete('IRC=')
        })
        if (configurationIsComplete(response)) {
          // Esvazia antes para o React aplicar de novo mesmo se o texto for igual ao último rcfg.
          setDataReceivedComandRCFG('')
          await wait(0)
          setDataReceivedComandRCFG(response)
          break
        }
      } catch {
        // Uma leitura incompleta não pode encerrar o restaurar sem nova tentativa.
      }
      await wait(400)
    }
    const elapsed = Date.now() - shownAt
    if (elapsed < 700) await wait(700 - elapsed)
  }

  async function handlesSettingsFactory(): Promise<void> {
    if (!props.isConect || mode.state || restoreInProgress.current || testInProgress.current) return
    commandEpoch.current += 1
    restoreInProgress.current = true
    setMessageIsLoading(t('Enviando informações para o dispositivo!'))
    setIsLoading(true)
    try {
      await handleComandSend('DEFAULT', { keepLoading: true })
      await wait(READ_GAP_MS)
      // SAVE nem sempre devolve resposta. Sem optionalReply o timeout cancelava o rcfg.
      await handleComandSend('SAVE', { optionalReply: true, timeoutMs: 2500, keepLoading: true })
      await wait(READ_GAP_MS)
      await handleComandSend('ETX', { optionalReply: true, timeoutMs: 2500, keepLoading: true })
      await wait(400)
      await readConfigurationAfterRestore()
    } catch {
      await readConfigurationAfterRestore()
    } finally {
      restoreInProgress.current = false
      setIsLoading(false)
    }
  }

  async function handleSettingsComandTx(): Promise<void> {
    if (!props.isConect || mode.state || testInProgress.current) return
    setMessageIsLoading(t('Baixando informações do dispositivo!'))
    setIsLoading(true)
    setDataReceivedComandPowerTx('')
    try {
      await handleComandSend('techmode alpha')
      await wait(READ_GAP_MS)
      const response = await handleComandSend('PWRLVL')
      setDataReceivedComandPowerTx(response)
      await wait(READ_GAP_MS)
      await handleComandSend('usermode', { optionalReply: true })
      await wait(READ_GAP_MS)
      await handleComandSend('save', { optionalReply: true })
    } catch {
      // handleComandSend já encerra o loading em caso de erro
    } finally {
      finishLoading()
    }
  }

  function handleSettingsComand(): void {
    if (!props.isConect || mode.state || restoreInProgress.current || testInProgress.current) return
    const epoch = commandEpoch.current
    setMessageIsLoading(t('Baixando informações do dispositivo!'))
    setIsLoading(true)
    setDataReceivedComandRCFG('')

    handleComandSend('rcfg')
      .then((response) => {
        if (epoch !== commandEpoch.current || restoreInProgress.current) return
        setDataReceivedComandRCFG(response)
        finishLoading()
      })
      .catch(() => {
        finishLoading()
      })
  }

  async function handleComandUdateGPS(): Promise<void> {
    if (!props.isConect || mode.state) return
    try {
      const gps = await handleComandSend('gps')
      setDataReceivedComandGPS(gps)
      await wait(READ_GAP_MS)
      const pos = await handleComandSend('pos')
      setDataReceivedComandPOS(pos)
      await wait(READ_GAP_MS)
      const rst = await handleComandSend('RST')
      setDataReceivedComandRST(rst)
    } catch {
      // handleComandSend já encerra o loading em caso de erro
    } finally {
      finishLoading()
    }
  }

  async function executeListCommand(scope: 'status' | 'all' | 'after-detect' = 'all'): Promise<void> {
    if (!props.isConect || mode.state) return
    const epoch = commandEpoch.current
    const stillCurrent = (): boolean => epoch === commandEpoch.current && !restoreInProgress.current
    try {
      if (!stillCurrent()) return
      if (scope !== 'after-detect') {
        const time = await handleComandSend('time', { isComplete: lineComplete('Time=') })
        setDataReceivedComandTIME(time)
        await wait(READ_GAP_MS)
      }
      if (!stillCurrent()) return
      const ver = await handleComandSend('ver')
      if (!stillCurrent()) return
      setDataReceivedComandVER(ver)
      await wait(READ_GAP_MS)
      const rst = await handleComandSend('RST')
      if (!stillCurrent()) return
      setDataReceivedComandRST(rst)
      await wait(READ_GAP_MS)
      const temp = await handleComandSend('rtemp', { isComplete: lineComplete('Temp') })
      if (!stillCurrent()) return
      setDataReceivedComandTEMP(temp)
      await wait(READ_GAP_MS)
      const ltxs = await handleComandSend('LTXS', { optionalReply: true, timeoutMs: 8000 })
      if (!stillCurrent()) return
      setDataReceivedComandLTXS(ltxs)
      if (scope !== 'status') {
        await wait(READ_GAP_MS)
        const pos = await handleComandSend('pos')
        setDataReceivedComandPOS(pos)
        await wait(READ_GAP_MS)
        const gps = await handleComandSend('gps')
        setDataReceivedComandGPS(gps)
      }
    } catch {
      // handleComandSend já encerra o loading em caso de erro
    } finally {
      finishLoading()
    }
  }

  /*function handleSendSetings(settings: string[]): void {
    const time = 200
    if (props.isConect && !mode.state) {
      setIsLoading(true)
      setMessageIsLoading('Enviando informações para o dispositivo!')
      handleComandSend('techmode alpha').then(() => {
        setTimeout(() => {
          handleComandSend('pwrlvl=' + settings[0] + ',' + settings[1] + ',' + settings[2]).then(
            () => {
              setTimeout(() => {
                handleComandSend('usermode').then(() => {
                  setTimeout(() => {
                    handleComandSend('save').then(() => {
                      setTimeout(() => {
                        handleComandSend('NESID=' + settings[3]).then(() => {
                          setTimeout(() => {
                            handleComandSend('TCH=' + settings[4]).then(() => {
                              setTimeout(() => {
                                handleComandSend('TBR=' + settings[5]).then(() => {
                                  setTimeout(() => {
                                    handleComandSend('TIN=' + settings[6]).then(() => {
                                      setTimeout(() => {
                                        handleComandSend('FTT=' + settings[7]).then(() => {
                                          setTimeout(() => {
                                            handleComandSend('TWL=' + settings[8]).then(() => {
                                              setTimeout(() => {
                                                handleComandSend('CMSG=' + settings[9]).then(() => {
                                                  setTimeout(() => {
                                                    handleComandSend('EBM=' + settings[10]).then(
                                                      () => {
                                                        setTimeout(() => {
                                                          handleComandSend(
                                                            'TPR=' + settings[11]
                                                          ).then(() => {
                                                            setTimeout(() => {
                                                              handleComandSend(
                                                                'TDF=' + settings[12]
                                                              ).then(() => {
                                                                setTimeout(() => {
                                                                  handleComandSend(
                                                                    'RCH=' + settings[13]
                                                                  ).then(() => {
                                                                    setTimeout(() => {
                                                                      handleComandSend(
                                                                        'RBR=' + settings[14]
                                                                      ).then(() => {
                                                                        setTimeout(() => {
                                                                          handleComandSend(
                                                                            'RIN=' + settings[15]
                                                                          ).then(() => {
                                                                            setTimeout(() => {
                                                                              handleComandSend(
                                                                                'RPC=' +
                                                                                  settings[16]
                                                                              ).then(() => {
                                                                                setTimeout(() => {
                                                                                  handleComandSend(
                                                                                    'RRC=' +
                                                                                      settings[17]
                                                                                  ).then(() => {
                                                                                    setTimeout(
                                                                                      () => {
                                                                                        handleComandSend(
                                                                                          'RDF=' +
                                                                                            settings[18]
                                                                                        ).then(
                                                                                          () => {
                                                                                            setTimeout(
                                                                                              () => {
                                                                                                handleComandSend(
                                                                                                  'RMC=' +
                                                                                                    settings[19]
                                                                                                ).then(
                                                                                                  () => {
                                                                                                    setTimeout(
                                                                                                      () => {
                                                                                                        handleComandSend(
                                                                                                          'IRC=' +
                                                                                                            settings[20]
                                                                                                        ).then(
                                                                                                          () => {
                                                                                                            setIsLoading(
                                                                                                              false
                                                                                                            )
                                                                                                          }
                                                                                                        )
                                                                                                      },
                                                                                                      time
                                                                                                    )
                                                                                                  }
                                                                                                )
                                                                                              },
                                                                                              time
                                                                                            )
                                                                                          }
                                                                                        )
                                                                                      },
                                                                                      time
                                                                                    )
                                                                                  })
                                                                                }, time)
                                                                              })
                                                                            }, time)
                                                                          })
                                                                        }, time)
                                                                      })
                                                                    }, time)
                                                                  })
                                                                }, time)
                                                              })
                                                            }, time)
                                                          })
                                                        }, time)
                                                      }
                                                    )
                                                  }, time)
                                                })
                                              }, time)
                                            })
                                          }, time)
                                        })
                                      }, time)
                                    })
                                  }, time)
                                })
                              }, time)
                            })
                          }, time)
                        })
                      }, time)
                    })
                  }, time)
                })
              }, time)
            }
          )
        }, time)
      })
    }
  }*/

  function handleSendTxSettings(settings: string[]): void {
    const time = 200
    if (props.isConect && !mode.state && !testInProgress.current) {
      setIsLoading(true)
      setMessageIsLoading(t('Enviando configurações iniciais para o dispositivo!'))

      handleComandSend(settings[3]).then(() => {
        setTimeout(() => {
          handleComandSend('pwrlvl=' + settings[0] + ',' + settings[1] + ',' + settings[2]).then(
            () => {
              setTimeout(() => {
                handleComandSend('usermode', { optionalReply: true }).finally(() => {
                  setTimeout(() => {
                    handleComandSend('save', { optionalReply: true }).finally(() => {
                      setTimeout(() => {
                        handleComandSend('ETX', { optionalReply: true }).finally(() => {
                          setIsLoading(false)
                        })
                      }, time)
                    })
                  }, time)
                })
              }, time)
            }
          )
        }, time)
      })
    }
  }

  function handleSendSetings(settings: string[]): void {
    const time = 200
    if (props.isConect && !mode.state && !testInProgress.current) {
      setIsLoading(true)
      setMessageIsLoading(t('Enviando informações para o dispositivo!'))

      handleComandSend('NESID=' + settings[0]).then(() => {
        setTimeout(() => {
          handleComandSend('TCH=' + settings[1]).then(() => {
            setTimeout(() => {
              handleComandSend('TBR=' + settings[2]).then(() => {
                setTimeout(() => {
                  handleComandSend('TIN=' + settings[3]).then(() => {
                    setTimeout(() => {
                      handleComandSend('FTT=' + settings[4]).then(() => {
                        setTimeout(() => {
                          handleComandSend('TWL=' + settings[5]).then(() => {
                            setTimeout(() => {
                              handleComandSend('CMSG=' + settings[6]).then(() => {
                                setTimeout(() => {
                                  handleComandSend('EBM=' + settings[7]).then(() => {
                                    setTimeout(() => {
                                      handleComandSend('TPR=' + settings[8]).then(() => {
                                        setTimeout(() => {
                                          handleComandSend('TDF=' + settings[9]).then(() => {
                                            setTimeout(() => {
                                              handleComandSend('RCH=' + settings[10]).then(() => {
                                                setTimeout(() => {
                                                  handleComandSend('RBR=' + settings[11]).then(
                                                    () => {
                                                      setTimeout(() => {
                                                        handleComandSend(
                                                          'RIN=' + settings[12]
                                                        ).then(() => {
                                                          setTimeout(() => {
                                                            handleComandSend(
                                                              'RPC=' + settings[13]
                                                            ).then(() => {
                                                              setTimeout(() => {
                                                                handleComandSend(
                                                                  'RRC=' + settings[14]
                                                                ).then(() => {
                                                                  setTimeout(() => {
                                                                    handleComandSend(
                                                                      'RDF=' + settings[15]
                                                                    ).then(() => {
                                                                      setTimeout(() => {
                                                                        handleComandSend(
                                                                          'RMC=' + settings[16]
                                                                        ).then(() => {
                                                                          setTimeout(() => {
                                                                            handleComandSend(
                                                                              'IRC=' + settings[17]
                                                                            ).then(() => {
                                                                              setTimeout(() => {
                                                                                handleComandSend('ETX', {
                                                                                  optionalReply: true
                                                                                }).finally(() => {
                                                                                  setIsLoading(false)
                                                                                })
                                                                              }, time)
                                                                            })
                                                                          }, time)
                                                                        })
                                                                      }, time)
                                                                    })
                                                                  }, time)
                                                                })
                                                              }, time)
                                                            })
                                                          }, time)
                                                        })
                                                      }, time)
                                                    }
                                                  )
                                                }, time)
                                              })
                                            }, time)
                                          })
                                        }, time)
                                      })
                                    }, time)
                                  })
                                }, time)
                              })
                            }, time)
                          })
                        }, time)
                      })
                    }, time)
                  })
                }, time)
              })
            }, time)
          })
        }, time)
      })
    }
  }

  function handleFileInformations(fileContent: string): void {
    //console.log('File content:', fileContent)
    try {
      const loadedDataSettings = fileContent.split('\r\n').map((item) => item.trim())
      if (loadedDataSettings.length < 2) {
        throw new Error(t('Conteúdo do arquivo insuficiente'))
      }

      let groupData = ''
      for (let i = 1; i < 19; i++) {
        groupData += loadedDataSettings[i] + '\r\n'
      }
      groupData = 'rcfg\r\n' + groupData

      setDataReceivedComandRCFG(groupData)
      //console.log(groupData)
    } catch (error) {
      if (error instanceof Error) {
        //console.error('Erro ao ler o arquivo:', error.message)
      } else {
        //console.error('Erro ao ler o arquivo:', error)
      }
    }
  }

  function appendTransmissionLog(kind: TestLogEntry['kind'], text: string): void {
    const line = text.trim()
    if (!line) return
    setTransmissionLog((prev) => [...prev, { kind, text: line }])
  }

  async function waitOutVaisalaKeepalive(): Promise<void> {
    while (vaisalaKeepaliveBusy.current) {
      await wait(50)
    }
  }

  async function sendLoggedTestCommand(command: string, timeoutMs = 2500): Promise<string> {
    if (vaisalaKeepaliveBusy.current) await waitOutVaisalaKeepalive()
    testSerialLock.current = true
    try {
      appendTransmissionLog('sent', command)
      const response = await handleComandSend(command, {
        keepLoading: true,
        optionalReply: true,
        timeoutMs,
        silenceMs: timeoutMs > 2500 ? 800 : 500
      })
      const reply = testResponseText(command, response)
      if (reply) appendTransmissionLog('response', reply)
      await wait(READ_GAP_MS)
      return response
    } finally {
      testSerialLock.current = false
    }
  }

  async function restoreOperationalConfig(ops: {
    nesid: string
    tdf: string
    tch: string
    tbr: string
    tin: string
    ftt: string
    twl: string
    cmsg: string
    ebm: string
  }): Promise<void> {
    setIsLoading(true)
    setMessageIsLoading(t('Restaurando configuração do dispositivo!'))
    const commands = [
      'RST',
      ops.nesid ? `NESID=${ops.nesid}` : '',
      ops.tdf ? `TDF=${ops.tdf}` : '',
      ops.tch ? `TCH=${ops.tch}` : '',
      ops.tbr ? `TBR=${ops.tbr}` : '',
      ops.tin ? `TIN=${ops.tin}` : '',
      ops.ftt ? `FTT=${ops.ftt}` : '',
      ops.twl ? `TWL=${ops.twl}` : '',
      ops.cmsg ? `CMSG=${ops.cmsg}` : '',
      ops.ebm ? `EBM=${ops.ebm}` : '',
      'ETX'
    ].filter((command) => command.length > 0)
    for (const command of commands) {
      try {
        await sendLoggedTestCommand(command, command === 'RST' ? 8000 : 2500)
      } catch {
        appendTransmissionLog('info', t('Não foi possível restaurar a configuração anterior.'))
      }
    }
  }

  function requestTestCancel(): void {
    if (!testInProgress.current || testCancelRequested.current) return
    testCancelRequested.current = true
    setTestStatus(t('Cancelando teste...'))
    if (testConfigChanged.current) {
      setMessageIsLoading(t('Restaurando configuração do dispositivo!'))
    }
  }

  async function handleTestTransmission(platformId: string, channel: string, message: string): Promise<void> {
    if (!props.isConect || mode.state || testInProgress.current) return
    testInProgress.current = true
    testCancelRequested.current = false
    testConfigChanged.current = false
    setIsLoading(true)
    setTransmissionLog([])
    setTestStatus(t('Preparando teste de transmissão…'))
    setTestLedHint(false)
    setTestSecondsLeft(null)
    setTestSecondsTotal(null)
    setMessageIsLoading(t('Baixando informações do dispositivo!'))
    let clock: ReturnType<typeof setInterval> | undefined
    let countdownActive = false
    let ops: {
      nesid: string
      tdf: string
      tch: string
      tbr: string
      tin: string
      ftt: string
      twl: string
      cmsg: string
      ebm: string
    } | null = null
    let changed = false
    const ensureNotCancelled = (): void => {
      if (testCancelRequested.current) throw new TestCancelled()
    }
    try {
      if (vaisalaKeepaliveBusy.current) await waitOutVaisalaKeepalive()
      testSerialLock.current = true
      appendTransmissionLog('sent', 'rcfg')
      const raw = await handleComandSend('rcfg', {
        keepLoading: true,
        timeoutMs: 8000,
        silenceMs: 800
      })
      testSerialLock.current = false
      const rcfgReply = testResponseText('rcfg', raw)
      if (rcfgReply) appendTransmissionLog('response', rcfgReply)
      const saved = {
        nesid: settingValue(raw, 'NESID'),
        tdf: settingValue(raw, 'TDF'),
        tch: settingValue(raw, 'TCH'),
        tbr: settingValue(raw, 'TBR'),
        tin: settingValue(raw, 'TIN'),
        ftt: settingValue(raw, 'FTT'),
        twl: settingValue(raw, 'TWL'),
        cmsg: settingValue(raw, 'CMSG'),
        ebm: settingValue(raw, 'EBM')
      }
      if (!saved.nesid || !settingValue(raw, 'IRC') || !saved.tch || !saved.tin || !saved.ftt || !saved.twl) {
        const missed = t('Não foi possível guardar a configuração atual. O teste não foi iniciado.')
        appendTransmissionLog('info', missed)
        setTestStatus(missed)
        return
      }
      ops = saved
      ensureNotCancelled()

      const verRaw = await sendLoggedTestCommand('ver', 8000)
      ensureNotCancelled()
      const rstRaw = await sendLoggedTestCommand('RST', 8000)
      ensureNotCancelled()
      const ltxsRaw = await sendLoggedTestCommand('LTXS', 8000)
      ensureNotCancelled()
      await sendLoggedTestCommand('techmode alpha')
      let pwrRaw = ''
      try {
        ensureNotCancelled()
        pwrRaw = await sendLoggedTestCommand('PWRLVL', 8000)
      } finally {
        await sendLoggedTestCommand('usermode')
      }
      ensureNotCancelled()
      const testLine = buildTestTransmissionLine(
        raw,
        {
          ns: labeledValue(verRaw, 'Serial Number:'),
          firmware: labeledValue(verRaw, 'Firmware Version:'),
          vbat: labeledValue(rstRaw, 'Supply voltage:'),
          pwrlvl: pwrlvlValue(pwrRaw),
          swr: swrValue(ltxsRaw)
        },
        message
      )

      setMessageIsLoading(t('Enviando informações para o dispositivo!'))
      const setup = [
        'TDF=A',
        `NESID=${platformId}`,
        `TCH=${saved.tch}`,
        `TBR=${saved.tbr || '300'}`,
        `TIN=${saved.tin}`,
        `FTT=${saved.ftt}`,
        `TWL=${saved.twl}`,
        'CMSG=Y',
        'EBM=Y',
        'ETX'
      ]
      changed = true
      testConfigChanged.current = true
      for (const command of setup) {
        ensureNotCancelled()
        await sendLoggedTestCommand(command)
      }

      setIsLoading(true)
      setTestStatus(t('Armando transmissão de teste...'))
      setMessageIsLoading(t('Armando transmissão de teste...'))
      const armed = [
        'TDT=B',
        `TCH=${channel}`,
        'ETX',
        'TDT=C',
        `TCH=${channel}`,
        'ETX',
        'TIN=00:01:00:00',
        'TWL=10',
        `FTT=${fttTestStamp()}`,
        'ETX',
        `TDT=${testLine}`,
        'RST'
      ]
      let armedRst = ''
      for (const command of armed) {
        ensureNotCancelled()
        const response = await sendLoggedTestCommand(command, command === 'RST' ? 8000 : 2500)
        if (command === 'RST') armedRst = response
      }

      const waitSeconds = secondsFromTimeToNextTx(armedRst)
      if (waitSeconds === null) {
        appendTransmissionLog('info', t('Não foi possível ler o tempo da próxima transmissão.'))
      } else if (waitSeconds > 0) {
        setIsLoading(false)
        setTestSecondsTotal(waitSeconds)
        setTestSecondsLeft(waitSeconds)
        if (waitSeconds <= 40) setTestStatus(t('Concluindo...'))
        else if (waitSeconds <= 60)
          setTestStatus(t("LED 'DATA' deve estar apagado. Verifique!"))
        else setTestStatus(t('Aguardando transmissão de teste...'))
        const endAt = Date.now() + waitSeconds * 1000
        vaisalaTxAt.current = endAt
        tsatLog('vaisala: silencio na transmissao, 10s antes do fim do contador e 15s depois')
        countdownActive = true
        clock = setInterval(() => {
          if (!countdownActive || testCancelRequested.current) return
          const left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
          setTestSecondsLeft(left)
          if (left <= 40) setTestStatus(t('Concluindo...'))
          else if (left <= 60)
            setTestStatus(t("LED 'DATA' deve estar apagado. Verifique!"))
          else setTestStatus(t('Aguardando transmissão de teste...'))
        }, 250)
        while (Date.now() < endAt) {
          ensureNotCancelled()
          if (!props.isConect || mode.state) throw new Error('offline')
          await wait(Math.min(250, Math.max(0, endAt - Date.now())))
        }
        countdownActive = false
        clearInterval(clock)
        clock = undefined
        setTestSecondsLeft(0)

        const transmitHoldSeconds = 15
        setTestStatus(t('Transmitindo...'))
        setTestSecondsTotal(transmitHoldSeconds)
        setTestSecondsLeft(transmitHoldSeconds)
        const transmitEndAt = Date.now() + transmitHoldSeconds * 1000
        countdownActive = true
        clock = setInterval(() => {
          if (!countdownActive || testCancelRequested.current) return
          setTestSecondsLeft(Math.max(0, Math.ceil((transmitEndAt - Date.now()) / 1000)))
          setTestStatus(t('Transmitindo...'))
        }, 250)
        while (Date.now() < transmitEndAt) {
          ensureNotCancelled()
          if (!props.isConect || mode.state) throw new Error('offline')
          await wait(Math.min(250, Math.max(0, transmitEndAt - Date.now())))
        }
        countdownActive = false
        clearInterval(clock)
        clock = undefined
        setTestSecondsLeft(0)
      }

      ensureNotCancelled()
      await restoreOperationalConfig(saved)
      ops = null
      changed = false
      testConfigChanged.current = false
      if (testCancelRequested.current) {
        setTestStatus(t('Teste cancelado. Configuração original restaurada.'))
      } else {
        setIsLoading(true)
        setMessageIsLoading(t('Baixando informações do dispositivo!'))
        await sendLoggedTestCommand('LTXS', 8000)
        const finishedAt = new Date().toLocaleString()
        setTestStatus(
          [
            `${t('Envio de Teste Encerrado')} | Data: ${finishedAt}`,
            t('Verifique no site da NOAA'),
            'https://dcs1.noaa.gov/Account/FieldTest',
            'https://dadds-dcs.data.nesdis.noaa.gov/messages'
          ].join('\n')
        )
        setTestLedHint(true)
      }
    } catch (error) {
      countdownActive = false
      if (clock) clearInterval(clock)
      const cancelled = error instanceof TestCancelled
      if (!cancelled) {
        appendTransmissionLog('info', t('Teste abortado, modem nao responde.'))
        setTestStatus(t('Teste abortado, modem nao responde.'))
      }
      if (changed && ops) {
        await restoreOperationalConfig(ops)
        ops = null
        if (cancelled) setTestStatus(t('Teste cancelado. Configuração original restaurada.'))
      } else if (cancelled) {
        setTestStatus(t('Teste cancelado.'))
      }
    } finally {
      countdownActive = false
      if (clock) clearInterval(clock)
      testSerialLock.current = false
      testInProgress.current = false
      testCancelRequested.current = false
      testConfigChanged.current = false
      releaseVaisalaTxQuiet()
      setTestSecondsLeft(null)
      setTestSecondsTotal(null)
      setIsLoading(false)
    }
  }

  function handleClickUpdateGPS(): void {
    if (testInProgress.current) return
    setMessageIsLoading(t('Baixando informações do dispositivo!'))
    setIsLoading(true)
    handleComandUdateGPS()
    //console.log('Atualizando informações do GPS')
  }
  function handleClickUpdateStatus(): void {
    if (testInProgress.current) return
    setMessageIsLoading(t('Baixando informações do dispositivo!'))
    setIsLoading(true)
    void executeListCommand('status')
  }

  useEffect(() => {
    if (MenuName !== 'teste' || !props.isConect || mode.state || restoreInProgress.current || testInProgress.current) return
    handleSettingsComand()
  }, [MenuName])

  useEffect(() => {
    if (!props.isConect) {
      setVaisalaBridged(false)
      setVaisalaPhase('idle')
      vaisalaUsesService = false
    }
  }, [props.isConect])

  async function closeVaisalaService(): Promise<void> {
    tsatLog('vaisala: TX close')
    try {
      const response = await handleComandSend('close', {
        optionalReply: true,
        timeoutMs: 2500,
        silenceMs: 500,
        keepLoading: true,
        skipLog: true
      })
      tsatLog(`vaisala: close resposta=${quoteSerial(response)}`)
    } catch (error) {
      tsatLog(`vaisala: close sem resposta ${describeSerialError(error)}`)
    }
  }

  async function openVaisalaService(): Promise<boolean> {
    tsatLog('vaisala: TX open')
    try {
      const response = await handleComandSend('open', {
        timeoutMs: 8000,
        silenceMs: 1500,
        keepLoading: true,
        optionalReply: true,
        skipLog: true,
        isComplete: lineCompleteIgnoreCase('Service connection opened')
      })
      const opened = serviceConnectionOpened(response)
      tsatLog(
        `vaisala: open resposta=${quoteSerial(response)} servico=${opened ? 'aberto' : 'sem Service connection opened'}`
      )
      return opened
    } catch (error) {
      tsatLog(`vaisala: open erro ${describeSerialError(error)}`)
      return false
    }
  }

  async function openVaisalaDsu(port: string): Promise<string> {
    tsatLog(`vaisala: TX open ${port}`)
    try {
      const response = await handleComandSend(`open ${port}`, {
        timeoutMs: 8000,
        silenceMs: 2000,
        keepLoading: true,
        optionalReply: true,
        skipLog: true,
        isComplete: vaisalaRerouteReady
      })
      const confirmed = confirmedVaisalaPort(response)
      tsatLog(`vaisala: RX ${quoteSerial(response)} redirecionou=${confirmed || 'não'}`)
      return confirmed
    } catch (error) {
      tsatLog(`vaisala: ${port} erro ${describeSerialError(error)}`)
      return ''
    }
  }

  async function probeVaisalaTime(): Promise<string> {
    tsatLog('vaisala: TX time')
    const deadline = Date.now() + 8000
    while (Date.now() < deadline) {
      try {
        const response = await handleComandSend('time', {
          optionalReply: true,
          timeoutMs: 1500,
          keepLoading: true,
          skipLog: true,
          isComplete: lineComplete('Time')
        })
        tsatLog(`vaisala: time resposta=${quoteSerial(response)}`)
        if (response.includes('Time')) return response
      } catch (error) {
        tsatLog(`vaisala: time erro ${describeSerialError(error)}`)
      }
      await wait(200)
    }
    tsatLog('vaisala: time não respondeu em 8 s')
    return ''
  }

  useEffect(() => {
    if (!props.isConect || !vaisalaSelected || mode.state) {
      if (!vaisalaSelected) setVaisalaPhase('idle')
      return
    }
    if (vaisalaBridged) return

    let cancelled = false
    setVaisalaPhase('searching')
    tsatLog('vaisala: busca automática nas 4 portas DSU')

    const timer = setTimeout(() => {
      void (async (): Promise<void> => {
        for (const port of VAISALA_DSU_PORTS) {
          if (cancelled) return
          tsatLog(`vaisala: tentando ${port}`)
          const serviceOk = await openVaisalaService()
          if (cancelled) return
          if (!serviceOk) {
            await closeVaisalaService()
            continue
          }
          vaisalaUsesService = true

          const confirmed = await openVaisalaDsu(port)
          if (cancelled) return
          if (!confirmed) {
            await closeVaisalaService()
            vaisalaUsesService = false
            continue
          }

          const timeResponse = await probeVaisalaTime()
          if (cancelled) return
          if (!timeResponse) {
            await closeVaisalaService()
            vaisalaUsesService = false
            continue
          }

          tsatLog(`vaisala: ponte pronta em ${confirmed}`)
          setDataReceivedComandTIME(timeResponse)
          setMessageIsLoading(t('Baixando informações do dispositivo!'))
          setIsLoading(true)
          setVaisalaBridged(true)
          setVaisalaPhase('idle')
          void executeListCommand('after-detect')
          return
        }

        if (cancelled) return
        tsatLog('vaisala: nenhuma das 4 portas encontrou o TSatDB')
        vaisalaUsesService = false
        setVaisalaPhase('not-found')
        setIsLoading(false)
      })()
    }, 250)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [props.isConect, vaisalaSelected, mode.state, vaisalaRetry, vaisalaBridged])

  useEffect(() => {
    if (!props.isConect || !vaisalaSelected || !vaisalaBridged || mode.state) return

    touchVaisalaActivity()
    const timer = window.setInterval(() => {
      if (
        !props.isConect ||
        mode.state ||
        restoreInProgress.current ||
        vaisalaCommandBusy.current ||
        vaisalaKeepaliveBusy.current ||
        testSerialLock.current ||
        vaisalaTransmitQuiet()
      ) {
        return
      }
      if (Date.now() - vaisalaLastActivityAt.current < 20000) return

      vaisalaKeepaliveBusy.current = true
      touchVaisalaActivity()
      // sendCommandTSatDB acrescenta \r\n; comando vazio é só a tecla Enter
      tsatLog('vaisala: ocioso >20s, TX Enter')
      void handleComandSend('', {
        optionalReply: true,
        timeoutMs: 1500,
        silenceMs: 400,
        skipLog: true,
        allowDuringTest: true
      })
        .then((response) => {
          if (response) tsatLog(`vaisala: Enter resposta=${quoteSerial(response)}`)
        })
        .catch((error) => {
          tsatLog(`vaisala: Enter erro ${describeSerialError(error)}`)
        })
        .finally(() => {
          vaisalaKeepaliveBusy.current = false
          touchVaisalaActivity()
        })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [props.isConect, vaisalaSelected, vaisalaBridged, mode.state])

  useEffect(() => {
    if (!props.isConect || mode.state || vaisalaSelected) {
      if (!props.isConect || mode.state) setDeviceFound(null)
      return
    }

    if (getPortOwner() !== 'TSatDB' || notFoundModalTarget() !== 'TSatDB') {
      setDeviceFound(null)
      SetPortOpen({ state: false })
      return
    }

    let cancelled = false
    setDeviceFound(null)
    setIsLoading(true)
    setMessageIsLoading(t('Procurando dispositivo!'))

    const timer = setTimeout(() => {
      if (cancelled) return
      const stillThisDevice = (): boolean =>
        !cancelled && getPortOwner() === 'TSatDB' && notFoundModalTarget() === 'TSatDB'

      void (async (): Promise<void> => {
        const deadline = Date.now() + 8000
        while (stillThisDevice() && Date.now() < deadline) {
          try {
            const response = await handleComandSend('time', {
              optionalReply: true,
              timeoutMs: 1500,
              isComplete: lineComplete('Time')
            })
            if (!stillThisDevice()) return
            if (response.includes('Time')) {
              setDataReceivedComandTIME(response)
              setMessageIsLoading(t('Baixando informações do dispositivo!'))
              void executeListCommand('after-detect')
              return
            }
          } catch {
            if (!stillThisDevice()) return
          }
          await wait(200)
        }
        if (!stillThisDevice()) return
        setIsLoading(false)
        setDeviceFound(false)
      })()
    }, 250)

    return (): void => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [props.isConect, mode.state, vaisalaSelected])

  const tabClass = (active: boolean): string =>
    `inline-flex items-center gap-1 overflow-visible whitespace-nowrap rounded-t-md px-1.5 py-2 text-[13px] font-medium leading-normal transition-colors duration-150 ${
      active
        ? 'border-b-2 border-sky-500 text-sky-600'
        : 'border-b-2 border-transparent text-zinc-500 hover:text-sky-500'
    }`

  const vaisalaCheckbox = (
    <label
      className={`flex items-center gap-1.5 rounded px-1.5 py-0.5 transition-colors ${
        props.isConect ? 'cursor-default' : 'cursor-pointer hover:bg-white/10'
      } ${vaisalaSelected ? 'bg-white/20' : ''}`}
    >
      <input
        type="checkbox"
        className="h-3.5 w-3.5 rounded border-white/60 text-[#1769A0] focus:ring-white/40 focus:ring-offset-0"
        checked={vaisalaSelected}
        disabled={props.isConect}
        onChange={() => setVaisalaSelected((prev) => !prev)}
      />
      <span className="text-xs font-semibold text-white/90">{t('Datalogger Vaisala')}</span>
    </label>
  )

  const vaisalaModal =
    props.isConect && vaisalaSelected && !vaisalaBridged ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
        <div
          className="w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80"
          role="dialog"
          aria-labelledby="vaisala-dialog-title"
        >
          <div className="relative bg-gradient-to-br from-sky-500 to-sky-600 px-6 pb-8 pt-6 text-white">
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
            <div className="absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-white/10" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/20 ring-1 ring-white/30">
                <Rss size={32} weight="fill" />
              </div>
              <div className="min-w-0 text-left">
                <h1 id="vaisala-dialog-title" className="text-lg font-bold tracking-tight">
                  {t('Datalogger Vaisala')}
                </h1>
                <p className="text-sm text-sky-100">{t('Acesso ao dispositivo')}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 px-6 py-5">
            {vaisalaPhase === 'not-found' ? (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
                <WarningCircle size={18} weight="fill" className="shrink-0" />
                {t('Dispositivo não encontrado.')}
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm font-medium text-sky-700">
                <CircleNotch size={18} className="shrink-0 animate-spin" />
                {t('Tentando encontrar o dispositivo')}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <button
                type="button"
                onClick={() => connectorDisconnect?.()}
                className="box-border min-h-[44px] flex-1 rounded-lg border-2 border-zinc-300 bg-white px-3 py-2.5 text-sm font-semibold text-zinc-600 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
              >
                {t('Cancelar')}
              </button>
              {vaisalaPhase === 'not-found' && (
                <button
                  type="button"
                  onClick={() => setVaisalaRetry((attempt) => attempt + 1)}
                  className="box-border min-h-[44px] flex-1 rounded-lg border-2 border-sky-500 bg-sky-500 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:border-sky-600 hover:bg-sky-600"
                >
                  {t('Tentar de novo')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    ) : null

  return props.isConect && (!vaisalaSelected || vaisalaBridged) ? (
    <ContainerDevice heightScreen={true}>
      <HeaderDevice DeviceName={'TSatDB'}>
        <Rss size={30} />
      </HeaderDevice>

      <div className="mx-4 mb-4 mt-4 flex w-full min-w-0 max-w-4xl flex-col justify-start overflow-visible rounded-lg bg-white pb-4 text-sm text-zinc-500 shadow-sm sm:mx-8">
        <header className="mx-2 mt-3 shrink-0 overflow-visible border-b border-sky-500 sm:mx-3">
          <div className="flex min-h-11 flex-nowrap items-end justify-between gap-0.5 overflow-visible">
            <button className={tabClass(colorStatus)} onClick={() => handleMenu('status')}>
              <Info size={16} />
              {t('Status')}
            </button>

            <button className={tabClass(colorGps)} onClick={() => handleMenu('gps')}>
              <MapPin size={16} />
              {t('GPS')}
            </button>

            <button className={tabClass(colorConfig)} onClick={() => handleMenu('config')}>
              <GearSix size={16} />
              {t('Configuração')}
            </button>

            <button className={tabClass(colorApontamento)} onClick={() => handleMenu('apontamento')}>
              <Compass size={16} />
              {t('Apontamento de Antena')}
            </button>

            <button className={tabClass(colorRF)} onClick={() => handleMenu('rf')}>
              <Broadcast size={16} />
              {t('RF Avançado')}
            </button>

            <button className={tabClass(colorTerminal)} onClick={() => handleMenu('terminal')}>
              <TerminalWindow size={16} />
              {t('Terminal')}
            </button>

            <button className={tabClass(colorTest)} onClick={() => handleMenu('teste')}>
              <PaperPlaneTilt size={16} />
              {t('Teste de transmissão')}
            </button>
          </div>
        </header>

        {
          <div className="mx-4 min-w-0 overflow-visible sm:mx-8">
            {MenuName === 'status' ? (
              <Status
                receiverVER={dataReceivedComandVER}
                receiverRST={dataReceivedComandRST}
                receiverTIME={dataReceivedComandTIME}
                receiverTEMP={dataReceivedComandTEMP}
                receiverLTXS={dataReceivedComandLTXS}
                refreshInformation={handleClickUpdateStatus}
              />
            ) : MenuName === 'gps' ? (
              <Gps
                receiverGPS={dataReceivedComandGPS}
                receiverPOS={dataReceivedComandPOS}
                receiverRST={dataReceivedComandRST}
                handleUpdateGPS={handleComandUdateGPS}
                handleClickUpdateGPS={handleClickUpdateGPS}
              />
            ) : MenuName === 'config' ? (
              <Settings
                receiverTxPowerLevel={dataReceivedComandPowerTX}
                receiverSettings={dataReceivedComandRCFG}
                handleUpdateSettings={handleSettingsComand}
                handleSendSettings={handleSendSetings}
                handlesRecoverSettingsFactory={handlesSettingsFactory}
                handleFileInformations={handleFileInformations}
                handleClearFailSafe={() => handleSendComandTerminal('CLRFS')}
              />
            ) : MenuName === 'teste' ? (
              <TransmissionTest
                savedPlatformId={settingValue(dataReceivedComandRCFG, 'NESID')}
                log={transmissionLog}
                busy={isLoading || testSecondsLeft !== null}
                status={testStatus}
                ledHint={testLedHint}
                secondsLeft={testSecondsLeft}
                secondsTotal={testSecondsTotal}
                onCancel={requestTestCancel}
                onSend={(platformId, channel, message) =>
                  void handleTestTransmission(platformId, channel, message)
                }
                onClearLog={() => {
                  if (testInProgress.current) return
                  setTransmissionLog([])
                  setTestStatus('')
                  setTestLedHint(false)
                }}
              />
            ) : MenuName === 'terminal' ? (
              <Terminal
                lines={terminalLog}
                onClear={() => setTerminalLog([])}
                handleSendComandTerminal={(comand) => handleSendComandTerminal(comand, true)}
              />
            ) : MenuName === 'rf' ? (
              <RFAdvanced
                receiverTxPowerLevel={dataReceivedComandPowerTX}
                handleSendSettings={handleSendTxSettings}
                handleUpdateSettings={handleSettingsComandTx}
              />
            ) : (
              MenuName === 'apontamento' && (
                <AntenaPointing
                  handlePositiom={handleComandUdateGPS}
                  receiverGPS={dataReceivedComandGPS}
                  receiverPOS={dataReceivedComandPOS}
                />
              )
            )}
          </div>
        }
      </div>
      {deviceFound !== null && !deviceFound && (
        <NoDeviceFoundModbus onClose={closeNoDeviceFoundModal} />
      )}

      <LoadingData visible={isLoading} title={messageIsLoading} />
    </ContainerDevice>
  ) : (
    <ContainerDevice>
      <HeaderDevice DeviceName={'TSatDB'} rightSlot={vaisalaCheckbox}>
        <Rss size={30} />
      </HeaderDevice>

      <ImageDevice
        image={ImgTsatDb}
        link="https://dualbase.com.br/produto/tsatdb/"
        fit="contain"
      />

      <div className="flex flex-col items-center justify-center rounded-b-lg bg-[#EDF4FB] pt-3">
        <CardInformation title={t('VISÃO GERAL')}>
          <p>
            <RichText i18nKey="O <b>TSatDB</b> é um transmissor via satélite GOES/METEOSAT projetado para aplicações hidrometeorológicas que exigem <b>confiabilidade, autonomia e compatibilidade com plataformas profissionais</b>. Possui certificação NESDIS e homologação ANATEL, além de compatibilidade com diferentes registradores de dados (<i>dataloggers</i>)." />
          </p>
        </CardInformation>

        <CardInformation title={t('DESTAQUES')}>
          <p>
            • <RichText i18nKey="<b>Transmissão confiável via satélite para áreas remotas</b>;" />
          </p>
          <p>
            •{' '}
            <RichText i18nKey="<b>Baixo consumo de energia em espera</b>, ideal para sistemas autônomos;" />
          </p>
          <p>
            • <RichText i18nKey="<b>Compatibilidade com diferentes registradores de dados.</b>" />
          </p>
        </CardInformation>

        <CardInformation title={t('APLICAÇÕES')}>
          <p>
            {t(
              'Redes hidrometeorológicas remotas, bacias hidrográficas, defesa civil e projetos institucionais.'
            )}
          </p>
        </CardInformation>
      </div>
      {vaisalaModal}
    </ContainerDevice>
  )
}
