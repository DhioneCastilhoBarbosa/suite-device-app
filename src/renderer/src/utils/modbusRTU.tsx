/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */

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

// ★ ADDED: flag simples para evitar corrida durante varredura/conexão
let busy = false

// ★ ADDED: util
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ★ ADDED: cria um client novo SEM reusar instância anterior
function newClient() {
  const c = new ModbusRTU()
  // propaga erro para log
  c.on('error', (error: any) => {
    console.log('SerialPort Error: ', error)
  })
  return c
}

// ★ ADDED: fecha e limpa qualquer client antigo, em série, para um cancelamento
// atrasado não fechar a porta que a conexão seguinte acabou de abrir.
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

function closeWithTimeout(close: (done: () => void) => void, maxMs: number): Promise<void> {
  return new Promise((resolve) => {
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      resolve()
    }
    try {
      close(done)
    } catch {
      done()
    }
    setTimeout(done, maxMs)
  })
}

function portStillBusy(error: unknown): boolean {
  const text = String((error as { message?: string })?.message ?? error)
  return /access denied|acesso negado|semaphore timeout|unknown error code\s*121|ebusy|eacces/i.test(text)
}

function hardCloseClient(): Promise<void> {
  const job = closeChain.then(async () => {
    const current = client
    if (client === current) client = null
    mbsId = 1
    // Leituras do PARAR terminam (timeout de 250 ms) antes do close.
    // Fechar com ReadFile pendente deixa a COM presa em alguns drivers USB-serial.
    await waitInflight(800)
    if (!current) return
    try { current.removeAllListeners?.() } catch {}
    if (typeof current.close === 'function') {
      await closeWithTimeout((done) => current.close(done), 1000)
    }
    const serial = current._port?._client
    if (serial?.isOpen && typeof serial.close === 'function') {
      await closeWithTimeout((done) => serial.close(done), 500)
    }
  })
  closeChain = job.then(
    () => undefined,
    () => undefined
  )
  return job
}

let releaseChain: Promise<void> = Promise.resolve()

export function waitForPortRelease(): Promise<void> {
  return releaseChain
}

export function IdModBus(address) {
  if (!client) return
  client.setID(address)
}

interface ModBusConectProps {
  SerialName: String
  BaudRate: number
}

let cancelScan = false
let connectGeneration = 0
const MAX_ADDRESS = 247
let deviceFound = false

const scanAddress = async (address: number): Promise<number | null> => {
  if (cancelScan || deviceFound) return null
  const current = client
  if (!current) return null
  try {
    current.setID(address)
    if (cancelScan || deviceFound || client !== current) return null
    await trackInflight(current.readHoldingRegisters(255, 1))
    if (cancelScan || deviceFound || client !== current) return null
    deviceFound = true
    return address
  } catch {
    return null
  }
}

export const scanNextAddress = async (): Promise<boolean> => {
  // Uma leitura por vez. O RTU usa um único slot de transação: leituras
  // sobrepostas trocam o ID e a tela abre sem os dados do sensor.
  for (let address = 1; address <= MAX_ADDRESS; address++) {
    if (cancelScan) return false
    const found = await scanAddress(address)
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

export async function connectClient({
  SerialName,
  BaudRate
}: ModBusConectProps): Promise<ConnectResult> {
  if (cancelScan) return 'cancelled'
  if (busy) return false // ★ ADDED: evita chamada concorrente
  busy = true
  const myGen = ++connectGeneration
  if (cancelScan || myGen !== connectGeneration) {
    busy = false
    return 'cancelled'
  }
  cancelScan = false
  deviceFound = false
  const aborted = () => cancelScan || myGen !== connectGeneration

  const openRtu = async () => {
    client = newClient()
    client.setTimeout(mbsTimeout)
    await client.connectRTUBuffered(SerialName, {
      baudRate: BaudRate,
      parity: 'none',
      dataBits: 8,
      stopBits: 1
    })
  }

  try {
    // ★ ADDED: fecha qualquer client pendente antes de abrir novamente
    await hardCloseClient()
    if (aborted()) return 'cancelled'

    // ★ ADDED: cooldown curto após unplug/plug para Windows/FTDI
    await sleep(800)
    if (aborted()) return 'cancelled'

    try {
      await openRtu()
    } catch (openError) {
      await hardCloseClient()
      if (aborted() || !portStillBusy(openError)) throw openError
      await sleep(700)
      if (aborted()) return 'cancelled'
      await openRtu()
    }

    if (aborted()) {
      await hardCloseClient()
      return 'cancelled'
    }

    mbsState = MBS_STATE_GOOD_CONNECT
    mbsStatus = 'Connected, wait for reading...'
    console.log(mbsStatus)

    const ok = await scanNextAddress()
    if (aborted()) {
      await hardCloseClient()
      return 'cancelled'
    }
    return ok
  } catch (e) {
    mbsState = MBS_STATE_FAIL_CONNECT
    mbsStatus = (e as Error).message
    console.log('Erro Modbus:', e)
    // ★ ADDED: garante limpeza em falha para próxima tentativa ser “fresh”
    await hardCloseClient()
    if (aborted()) return 'cancelled'
    throw e // ★ CHANGED: manter propagação
  } finally {
    busy = false // ★ ADDED
  }
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

export function cancelConnection(): Promise<void> {
  cancelScan = true
  connectGeneration += 1
  deviceFound = false
  portOwner = null
  notFoundModalFor = null
  mbsId = 1
  const job = releaseChain.then(async () => {
    try {
      await hardCloseClient()
      await sleep(500)
    } catch (e) {
      console.log('Erro ao liberar a porta COM:', e)
    }
  })
  releaseChain = job.then(
    () => undefined,
    () => undefined
  )
  return job
}

//==============================================================
export function readModbusData(
  address: number,
  register: number,
  Int16: boolean,
  Float32LE: boolean,
  timeout: number
) {
  return new Promise((resolve, reject) => {
    if (!client) return reject(new Error('Cliente Modbus não conectado')) // ★ ADDED
    client.setTimeout(timeout)
    client
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
          let Int16Data = Data.readInt16BE()
          resolve(Int16Data)
        } else if (Float32LE === true) {
          let floatValue = Data.readFloatBE(0)
          resolve(floatValue)
        } else {
          resolve(asciiData)
        }
      })
      .catch(function (e) {
        mbsState = MBS_STATE_FAIL_READ
        mbsStatus = e.message
        reject(e)
      })
  })
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
