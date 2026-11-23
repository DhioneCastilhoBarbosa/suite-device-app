/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { SerialManager } from './serialManager'
import { describeSerialError, isPortBusyError, limniLog } from './limniDebug'

'use strict'

//==============================================================
// ★ CHANGED: em vez de um client global fixo, criamos e destruímos sob demanda.
//             Isso evita reuso de handle “morto” após desconexão física.
const ModbusRTU = window.require('modbus-serial')
let client: any /* ModbusRTU */ = null // ★ CHANGED: antes era const client = new ModbusRTU()

let mbsStatus = 'Initializing...'

// Modbus 'state' constants
const MBS_STATE_INIT = 'State init'
const MBS_STATE_GOOD_READ = 'State good (read)'
const MBS_STATE_FAIL_READ = 'State fail (read)'
const MBS_STATE_GOOD_CONNECT = 'State good (port)'
const MBS_STATE_FAIL_CONNECT = 'State fail (port)'

// eslint-disable-next-line no-unused-vars
let mbsId = 1
let mbsTimeout = 250
// eslint-disable-next-line no-unused-vars
let mbsState = MBS_STATE_INIT

// ★ ADDED: util
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const OPEN_ATTEMPTS = 4
const OPEN_RETRY_WAIT_MS = 450

// ★ ADDED: cria um client novo SEM reusar instância anterior
function newClient() {
  const c = new ModbusRTU()
  c.on('error', (error: any) => {
    console.log('SerialPort Error: ', error)
  })
  return c
}

// Fecha só o client capturado no pedido. Um close atrasado não pode
// ler o client global e derrubar a conexão que abriu depois.
let closeChain: Promise<void> = Promise.resolve()

let inflightReads = 0
const inflightIdleWaiters: Array<() => void> = []

function trackInflight<T>(work: Promise<T>): Promise<T> {
  inflightReads += 1
  return work.finally(() => {
    inflightReads = Math.max(0, inflightReads - 1)
    if (inflightReads === 0) {
      const waiters = inflightIdleWaiters.splice(0)
      waiters.forEach((resolve) => resolve())
    }
  })
}

function waitInflight(maxMs: number): Promise<void> {
  if (inflightReads === 0) return Promise.resolve()
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, maxMs)
    inflightIdleWaiters.push(() => {
      clearTimeout(timer)
      resolve()
    })
  })
}

function closeWithTimeout(close: (done: () => void) => void, maxMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false
    const done = (timedOut: boolean) => {
      if (settled) return
      settled = true
      resolve(timedOut)
    }
    try {
      close(() => done(false))
    } catch {
      done(false)
    }
    setTimeout(() => done(true), maxMs)
  })
}

// Mantém o objeto vivo até o callback de close. Se o prazo estourar,
// a próxima conexão tenta fechar de novo. Não solta o handle no meio.
const retainedPorts: any[] = []

function retain(obj: any) {
  if (obj && !retainedPorts.includes(obj)) retainedPorts.push(obj)
}

function releaseRetain(obj: any) {
  const index = retainedPorts.indexOf(obj)
  if (index >= 0) retainedPorts.splice(index, 1)
}

function endPendingModbus(target: any) {
  const transactions = target?._transactions
  if (!transactions) return
  for (const id of Object.keys(transactions)) {
    const tx = transactions[id]
    if (!tx) continue
    if (tx._timeoutHandle) {
      clearTimeout(tx._timeoutHandle)
      tx._timeoutHandle = undefined
    }
    const next = tx.next
    tx.next = null
    delete transactions[id]
    if (typeof next === 'function') {
      try {
        const err = new Error('Transação encerrada')
        ;(err as { errno?: string }).errno = 'ECANCELED'
        next(err)
      } catch {
        /* a promise da varredura só precisa resolver */
      }
    }
  }
}

function pauseSerial(target: any) {
  const serial = target?._port?._client ?? (typeof target?.pause === 'function' ? target : null)
  try {
    serial?.pause?.()
  } catch {
    /* pausar leituras novas não pode impedir o close */
  }
  return serial
}

async function closeSerialObject(serial: any, maxMs: number): Promise<boolean> {
  if (!serial || typeof serial.close !== 'function') return false
  if (!serial.isOpen) {
    releaseRetain(serial)
    return false
  }
  retain(serial)
  const timedOut = await closeWithTimeout((done) => {
    try {
      serial.close(() => done())
    } catch {
      done()
    }
  }, maxMs)
  if (!timedOut && !serial.isOpen) releaseRetain(serial)
  return timedOut
}

async function retryRetainedCloses(): Promise<boolean> {
  let timedOut = false
  const pending = retainedPorts.slice()
  for (const obj of pending) {
    const serial = obj?._port?._client ?? obj
    if (serial?.isOpen && typeof serial.close === 'function') {
      if (await closeSerialObject(serial, 700)) timedOut = true
    } else {
      releaseRetain(obj)
      if (serial && serial !== obj) releaseRetain(serial)
    }
  }
  return timedOut
}

async function closeTarget(target: any): Promise<boolean> {
  if (!target) return false
  retain(target)
  const serial = pauseSerial(target)
  if (serial) retain(serial)
  endPendingModbus(target)
  await waitInflight(800)
  let timedOut = false
  if (typeof target.close === 'function') {
    retain(target)
    if (await closeWithTimeout((done) => {
      try {
        target.close(done)
      } catch {
        done()
      }
    }, 1000)) {
      timedOut = true
    }
  }
  if (serial?.isOpen) {
    if (await closeSerialObject(serial, 700)) timedOut = true
  }
  if (!timedOut) {
    releaseRetain(target)
    if (serial) releaseRetain(serial)
  }
  return timedOut
}

function hardCloseClient(): Promise<void> {
  const target = client
  if (client === target) client = null
  const job = closeChain.then(async () => {
    const hasWork = Boolean(target) || retainedPorts.length > 0
    if (hasWork) limniLog('close: início')
    let timedOut = false
    try {
      if (target) timedOut = await closeTarget(target)
      if (await retryRetainedCloses()) timedOut = true
    } catch (error) {
      limniLog(`close: erro ${describeSerialError(error)}`)
    }
    if (hasWork) limniLog(`close: fim prazo estourado=${timedOut ? 'sim' : 'não'}`)
  })
  closeChain = job.then(
    () => undefined,
    () => undefined
  )
  return job
}

let releaseChain: Promise<void> = Promise.resolve()
let attemptGate: Promise<void> = Promise.resolve()

export function waitForPortRelease(): Promise<void> {
  return attemptGate.then(() => releaseChain).then(() => closeChain)
}

export function isModbusClientOpen() {
  try {
    return Boolean(client && client.isOpen)
  } catch {
    return false
  }
}

export function modbusDebugSnapshot() {
  return { cancelScan, connectGeneration, inflightReads }
}

export function IdModBus(address) {
  if (!client) return
  client.setID(address)
}

export function prepareFirmwareBoot() {
  if (!client) return
  client.setID(0)
  if (typeof client.setTimeout === 'function') client.setTimeout(1000)
}

interface ModBusConectProps {
  SerialName: String
  BaudRate: number
}

let cancelScan = false
let connectGeneration = 0
let attemptSeq = 0
let activeAttemptId = 0
const MAX_ADDRESS = 247
let deviceFound = false
let lastSerialName: string | null = null
const scanErrorCounts = new Map<string, number>()
let scanMisses = 0

function isScanMiss(label: string) {
  return /^timed out$/i.test(label) || label === 'Tempo de leitura esgotado'
}

function scanErrorLabel(error: unknown): string {
  const message = (error as { message?: string })?.message ?? String(error ?? 'erro')
  return message.replace(/\s+/g, ' ').slice(0, 120)
}

function logScanSummary(address: number) {
  const parts = [...scanErrorCounts.entries()].map(([message, count]) => `${message} x${count}`)
  if (scanMisses > 0) parts.unshift(`sem resposta x${scanMisses}`)
  limniLog(
    `tentativa ${activeAttemptId} varredura: resumo no endereço ${address}: ${
      parts.length > 0 ? parts.join(' | ') : 'sem erros distintos'
    }`
  )
}

function withReadDeadline<T>(work: Promise<T>, maxMs: number, target: any): Promise<T> {
  return new Promise((resolve, reject) => {
    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      endPendingModbus(target)
      reject(new Error('Tempo de leitura esgotado'))
    }, maxMs)
    work.then(
      (value) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        reject(error)
      }
    )
  })
}

const scanAddress = async (address: number): Promise<number | null> => {
  if (cancelScan || deviceFound) return null
  const current = client
  if (!current) return null
  try {
    current.setID(address)
    if (cancelScan || deviceFound || client !== current) return null
    await trackInflight(
      withReadDeadline(current.readHoldingRegisters(255, 1), mbsTimeout + 400, current)
    )
    if (cancelScan || deviceFound || client !== current) return null
    deviceFound = true
    limniLog(`tentativa ${activeAttemptId} varredura: endereço ${address} respondeu`)
    return address
  } catch (error) {
    const label = scanErrorLabel(error)
    if (isScanMiss(label)) {
      scanMisses += 1
      return null
    }
    const seen = scanErrorCounts.get(label) ?? 0
    scanErrorCounts.set(label, seen + 1)
    if (seen === 0) {
      limniLog(`tentativa ${activeAttemptId} varredura: erro distinto: ${label}`)
    }
    return null
  }
}

export const scanNextAddress = async (): Promise<boolean> => {
  // Uma leitura por vez. O RTU usa um único slot de transação: leituras
  // sobrepostas trocam o ID e a tela abre sem os dados do sensor.
  for (let address = 1; address <= MAX_ADDRESS; address++) {
    if (cancelScan) return false
    const found = await scanAddress(address)
    if (address % 25 === 0) logScanSummary(address)
    if (cancelScan || client == null) return false
    if (found !== null) {
      client.setID(found)
      return true
    }
  }
  return false
}

// Para cancelar a varredura
export const cancelScanProcess = () => {
  cancelScan = true
  mbsId = 1
}

export type ConnectResult = boolean | 'cancelled'

async function openWithRetry(serialName: String, baudRate: number, aborted: () => boolean) {
  let lastError: unknown
  for (let attempt = 1; attempt <= OPEN_ATTEMPTS; attempt++) {
    if (aborted()) return 'cancelled' as const
    const created = newClient()
    created.setTimeout(mbsTimeout)
    try {
      await created.connectRTUBuffered(serialName, {
        baudRate,
        parity: 'none',
        dataBits: 8,
        stopBits: 1
      })
      client = created
      limniLog(`abrir porta ${serialName}: sucesso`)
      return 'opened' as const
    } catch (openError) {
      client = created
      limniLog(`abrir porta ${serialName}: erro ${describeSerialError(openError)}`)
      await hardCloseClient()
      lastError = openError
      if (aborted()) return 'cancelled' as const
      if (!isPortBusyError(openError) || attempt === OPEN_ATTEMPTS) throw openError
      limniLog(`retry de porta ocupada (${attempt}): ${describeSerialError(openError)}`)
      limniLog(`abertura recebeu acesso negado, 121 ou EBUSY: ${describeSerialError(openError)}`)
      await sleep(OPEN_RETRY_WAIT_MS)
      if (aborted()) return 'cancelled' as const
    }
  }
  throw lastError
}

async function runConnect({ SerialName, BaudRate }: ModBusConectProps): Promise<ConnectResult> {
  const myGen = ++connectGeneration
  const attemptId = ++attemptSeq
  activeAttemptId = attemptId
  lastSerialName = String(SerialName)
  limniLog(
    `tentativa ${attemptId} início porta ${SerialName} baud ${BaudRate} connectGeneration=${myGen}`
  )
  let outcome = 'erro'
  const aborted = () => cancelScan || myGen !== connectGeneration

  try {
    if (aborted()) {
      outcome = 'cancelada'
      return 'cancelled'
    }
    cancelScan = false
    deviceFound = false
    scanErrorCounts.clear()
    scanMisses = 0

    await hardCloseClient()
    if (aborted()) {
      outcome = 'cancelada'
      return 'cancelled'
    }

    await sleep(800)
    if (aborted()) {
      outcome = 'cancelada'
      return 'cancelled'
    }

    const opened = await openWithRetry(SerialName, BaudRate, aborted)
    if (opened === 'cancelled' || aborted()) {
      await hardCloseClient()
      outcome = 'cancelada'
      return 'cancelled'
    }

    mbsState = MBS_STATE_GOOD_CONNECT
    mbsStatus = 'Connected, wait for reading...'
    console.log(mbsStatus)

    limniLog(`tentativa ${attemptId} varredura: início`)
    const ok = await scanNextAddress()
    limniLog(
      `tentativa ${attemptId} varredura: fim ${
        ok ? 'dispositivo encontrado' : aborted() ? 'cancelada' : 'não encontrado'
      }`
    )

    if (aborted() || !ok) {
      await hardCloseClient()
      if (aborted()) {
        outcome = 'cancelada'
        return 'cancelled'
      }
      outcome = 'não encontrado'
      return false
    }

    outcome = 'dispositivo encontrado'
    return true
  } catch (e) {
    mbsState = MBS_STATE_FAIL_CONNECT
    mbsStatus = (e as Error).message
    console.log('Erro Modbus:', e)
    limniLog(`tentativa ${attemptId} erro ${describeSerialError(e)}`)
    await hardCloseClient()
    if (aborted()) {
      outcome = 'cancelada'
      return 'cancelled'
    }
    outcome = 'erro'
    throw e
  } finally {
    limniLog(`tentativa ${attemptId} fim ${outcome}`)
  }
}

async function runFirmwareConnect({ SerialName, BaudRate }: ModBusConectProps): Promise<ConnectResult> {
  const myGen = ++connectGeneration
  const attemptId = ++attemptSeq
  activeAttemptId = attemptId
  lastSerialName = String(SerialName)
  limniLog(
    `tentativa ${attemptId} início porta ${SerialName} baud ${BaudRate} connectGeneration=${myGen} modo atualização`
  )
  let outcome = 'erro'
  const aborted = () => cancelScan || myGen !== connectGeneration

  try {
    if (aborted()) {
      outcome = 'cancelada'
      return 'cancelled'
    }
    cancelScan = false
    deviceFound = false

    await hardCloseClient()
    if (aborted()) {
      outcome = 'cancelada'
      return 'cancelled'
    }

    await sleep(800)
    if (aborted()) {
      outcome = 'cancelada'
      return 'cancelled'
    }

    const opened = await openWithRetry(SerialName, BaudRate, aborted)
    if (opened === 'cancelled' || aborted()) {
      await hardCloseClient()
      outcome = 'cancelada'
      return 'cancelled'
    }

    if (client) client.setID(0)
    mbsState = MBS_STATE_GOOD_CONNECT
    mbsStatus = 'Connected, firmware recovery'
    limniLog(`modo atualização: porta ${SerialName} aberta sem procurar endereço`)
    outcome = 'porta aberta sem varredura'
    return true
  } catch (e) {
    mbsState = MBS_STATE_FAIL_CONNECT
    mbsStatus = (e as Error).message
    limniLog(`tentativa ${attemptId} erro ${describeSerialError(e)}`)
    await hardCloseClient()
    if (aborted()) {
      outcome = 'cancelada'
      return 'cancelled'
    }
    outcome = 'erro'
    throw e
  } finally {
    limniLog(`tentativa ${attemptId} fim ${outcome}`)
  }
}

async function withAttempt(work: () => Promise<ConnectResult>): Promise<ConnectResult> {
  const previous = attemptGate
  let finishAttempt = () => {}
  const mine = new Promise<void>((resolve) => {
    finishAttempt = resolve
  })
  attemptGate = previous.then(() => mine)
  try {
    await previous
    if (cancelScan) return 'cancelled'
    return await work()
  } finally {
    finishAttempt()
  }
}

export async function connectFirmwareRecovery(props: ModBusConectProps): Promise<ConnectResult> {
  return withAttempt(() => runFirmwareConnect(props))
}

export async function connectClient(props: ModBusConectProps): Promise<ConnectResult> {
  return withAttempt(() => runConnect(props))
}

let portOwner: string | null = null
let notFoundModalFor: string | null = null

export function setPortOwner(name: string | null) {
  portOwner = name
}

export function getPortOwner() {
  return portOwner
}

export function armNotFoundModal(deviceName: string) {
  notFoundModalFor = deviceName
}

export function disarmNotFoundModal() {
  notFoundModalFor = null
}

export function notFoundModalTarget() {
  return notFoundModalFor
}

export function beginConnection() {
  cancelScan = false
}

export function cancelConnection(opts?: { reason?: 'parar' }): Promise<void> {
  cancelScan = true
  connectGeneration += 1
  deviceFound = false
  portOwner = null
  notFoundModalFor = null
  mbsId = 1
  const portName = lastSerialName
  const reason = opts?.reason
  const job = releaseChain.then(async () => {
    try {
      await hardCloseClient()
      await sleep(500)
      if (reason === 'parar' && portName) {
        try {
          const list = (await SerialManager.snapshot()) ?? []
          const still = list.includes(portName)
          limniLog(
            `Parar: depois do close ${portName} ${
              still ? 'ainda aparece na lista' : 'não aparece na lista'
            }: ${list.join(', ') || '(nenhuma)'}`
          )
        } catch (error) {
          limniLog(`Parar: não foi possível listar as portas depois do close ${describeSerialError(error)}`)
        }
      }
    } catch (e) {
      console.log('Erro ao liberar a porta COM:', e)
      limniLog(`Parar: erro ao liberar a porta ${describeSerialError(e)}`)
    }
  })
  releaseChain = job.then(
    () => undefined,
    () => undefined
  )
  return job
}

function valueSnippet(value: unknown): string {
  const text = String(value ?? '')
    .replace(/[\u0000-\u001f]/g, ' ')
    .trim()
  return text.slice(0, 24) || '(vazio)'
}

//==============================================================
export function readModbusData(
  address: number,
  register: number,
  Int16: boolean,
  Float32LE: boolean,
  timeout: number
) {
  const started = Date.now()
  const current = client
  if (!current) {
    const error = new Error('Cliente Modbus não conectado')
    limniLog(
      `readModbusData registrador ${address} erro=${error.message} em ${Date.now() - started}ms`
    )
    return Promise.reject(error)
  }

  const work = new Promise((resolve, reject) => {
    let settled = false
    const finishOk = (value: unknown) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      limniLog(
        `readModbusData registrador ${address} ok valor=${valueSnippet(value)} em ${Date.now() - started}ms`
      )
      resolve(value)
    }
    const finishErr = (error: unknown) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      mbsState = MBS_STATE_FAIL_READ
      mbsStatus = (error as { message?: string })?.message ?? String(error)
      limniLog(
        `readModbusData registrador ${address} erro=${scanErrorLabel(error)} em ${Date.now() - started}ms`
      )
      reject(error)
    }
    const timer = setTimeout(() => {
      endPendingModbus(current)
      finishErr(new Error('Tempo de leitura esgotado'))
    }, Math.max(0, Number(timeout) || 0) + 500)

    try {
      current.setTimeout(timeout)
      current
        .readHoldingRegisters(address, register)
        .then(function (data) {
          mbsState = MBS_STATE_GOOD_READ
          mbsStatus = 'success'

          let Data = data.buffer
          let asciiData = ''

          for (let i = 0; i < Data.length; i++) {
            asciiData += String.fromCharCode(Data[i])
          }

          if (Int16 === true) {
            finishOk(Data.readInt16BE())
          } else if (Float32LE === true) {
            finishOk(Data.readFloatBE(0))
          } else {
            finishOk(asciiData)
          }
        })
        .catch(function (e) {
          finishErr(e)
        })
    } catch (error) {
      finishErr(error)
    }
  })

  return trackInflight(work)
}

function floatToRegisters(float) {
  const buffer = Buffer.alloc(4)
  buffer.writeFloatBE(float, 0)
  return [buffer.readUInt16BE(0), buffer.readUInt16BE(2)]
}

export const WriteModbus = async (register, value, type = 'int') => {
  try {
    if (!client) throw new Error('Cliente Modbus não conectado') // ★ ADDED
    if (type === 'float') {
      const registers = floatToRegisters(value)
      await client.writeRegisters(register, registers)
      console.log(`Valor float ${value} gravado nos endereços ${register} e ${register + 1}`)
    } else {
      await client.writeRegister(register, value)
      console.log(`Valor inteiro ${value} gravado no endereço ${register}`)
    }
  } catch (error) {
    console.error('Erro ao gravar no Modbus:', error)
    throw error // ★ ADDED: propaga para UI decidir
  }
}

export async function CloseModBus() {
  // ★ CHANGED: fechamento agressivo e assíncrono para liberar handle antes da próxima conexão
  await hardCloseClient()
  console.log('Conexão fechada com sucesso.')
  deviceFound = false
}
/* eslint-enable no-unused-vars */
//==============================================================
