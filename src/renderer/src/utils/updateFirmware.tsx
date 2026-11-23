/* eslint-disable @typescript-eslint/explicit-function-return-type */
const { SerialPort } = window.require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
import { WriteModbus, CloseModBus, prepareFirmwareBoot } from '../utils/modbusRTU'
import { SerialManager } from './serialManager'
import { describeSerialError, isPortBusyError, limniLog } from './limniDebug'

let serialPort
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let parser

const heldSerialPorts: any[] = []

function retainSerial(port: any) {
  if (port && !heldSerialPorts.includes(port)) heldSerialPorts.push(port)
}

function releaseSerial(port: any) {
  const index = heldSerialPorts.indexOf(port)
  if (index >= 0) heldSerialPorts.splice(index, 1)
}

function closePortObject(port: any, maxMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (!port) {
      resolve(true)
      return
    }
    retainSerial(port)
    if (!port.isOpen || typeof port.close !== 'function') {
      releaseSerial(port)
      resolve(true)
      return
    }
    let settled = false
    const done = (closed: boolean) => {
      if (settled) return
      settled = true
      if (closed) releaseSerial(port)
      resolve(closed)
    }
    try {
      port.pause?.()
    } catch {
      /* para leituras novas antes do close */
    }
    try {
      port.removeAllListeners?.('data')
    } catch {
      /* o close segue mesmo sem o listener */
    }
    try {
      port.close((err) => done(!err && !port.isOpen))
    } catch {
      done(false)
      return
    }
    setTimeout(() => done(!port.isOpen), maxMs)
  })
}

async function closeHeldSerialPorts(): Promise<boolean> {
  const pending = heldSerialPorts.slice()
  let allClosed = true
  for (const port of pending) {
    if (!(await closePortObject(port, 1000))) allClosed = false
  }
  return allClosed
}

async function openSerialPort(portName: string, baudRate: number): Promise<void> {
  await closeHeldSerialPorts()
  return new Promise((resolve, reject) => {
    const port = new SerialPort(
      {
        path: portName,
        baudRate: baudRate,
        parity: 'none',
        dataBits: 8,
        stopBits: 1
      },
      (err) => {
        if (err) {
          retainSerial(port)
          return reject(new Error(`Erro ao abrir a porta serial: ${err.message}`))
        }
        parser = port.pipe(new ReadlineParser({ delimiter: '*' }))
        port.set({ dtr: false, rts: false }, () => resolve())
      }
    )
    port.setMaxListeners(100)
    serialPort = port
    retainSerial(port)
  })
}

async function closeSerialPort(): Promise<boolean> {
  const current = serialPort
  serialPort = undefined
  parser = undefined
  const closedCurrent = await closePortObject(current, 1500)
  const closedHeld = await closeHeldSerialPorts()
  return closedCurrent && closedHeld
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function writeLineFast(port, text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let settled = false
    const finish = (error?: unknown) => {
      if (settled) return
      settled = true
      if (error) reject(error)
      else resolve()
    }
    try {
      const queued = port.write(text, (error) => {
        if (error) finish(error)
      })
      if (queued === false) port.once('drain', () => finish())
      else finish()
    } catch (error) {
      finish(error)
    }
  })
}

function lineGapMs(length: number, baud: number) {
  const rate = baud > 0 ? baud : 57600
  return Math.ceil((length * 10 * 1000) / rate) + 5
}

async function sendLine(port, text: string, baud: number) {
  await writeLineFast(port, text)
  await wait(lineGapMs(text.length, baud))
}

async function waitUntilQuiet(port, quietMs: number) {
  let last = Date.now()
  const mark = () => {
    last = Date.now()
  }
  port.on('data', mark)
  try {
    const limit = Date.now() + 1000
    while (Date.now() - limit < 0) {
      if (Date.now() - last >= quietMs) return
      await wait(10)
    }
  } finally {
    port.removeListener('data', mark)
  }
}

async function update(stateInfo, baud: number, onProgress?: (percent: number) => void): Promise<number> {
  const line = stateInfo[0].toString()
  const linearray = line.split('\n')
  const totalLines = linearray.filter((item) => item.length > 10).length
  let sentLines = 0
  let lastPercent = -1
  const reportProgress = () => {
    const percent = totalLines === 0 ? 100 : Math.min(100, Math.round((sentLines / totalLines) * 100))
    if (percent === lastPercent) return
    lastPercent = percent
    onProgress?.(percent)
  }
  let dataBuffer = ''
  let crcError = false

  const onData = (data) => {
    const text = data.toString()
    dataBuffer += text
    if (text.includes('ERRO NO CRC') || dataBuffer.includes('ERRO NO CRC')) crcError = true
  }
  serialPort.on('data', onData)

  const tempoInicial: Date = new Date()
  reportProgress()
  try {
    for (let i = 0; i < linearray.length; i++) {
      if (crcError || dataBuffer.includes('ERRO NO CRC')) throw new Error('ERRO NO CRC')
      const tt = linearray[i]
      const endsBlock = (i + 1) % 16 == 0 && tt.length === linearray[1].length
      const ackFrom = endsBlock ? dataBuffer.length : 0

      if (tt.length > 10) {
        await sendLine(serialPort, linearray[i], baud)
        sentLines += 1
        reportProgress()
      }

      if (endsBlock) {
        let quietSince = Date.now()
        let seen = dataBuffer.length
        while (!dataBuffer.slice(ackFrom).includes('.')) {
          if (crcError || dataBuffer.includes('ERRO NO CRC')) throw new Error('ERRO NO CRC')
          if (dataBuffer.length !== seen) {
            seen = dataBuffer.length
            quietSince = Date.now()
          } else if (Date.now() - quietSince > 3000) {
            throw new Error('Tempo esgotado aguardando ponto')
          }
          await wait(12)
        }
        await wait(50)
      }
    }
  } finally {
    try {
      serialPort?.removeListener?.('data', onData)
    } catch {
      /* a porta pode já ter caído */
    }
  }

  const tempoFinal: Date = new Date()
  return (tempoFinal.getTime() - tempoInicial.getTime()) / 1000
}

const aguardarRespostaSerial = async (port, response, timeout): Promise<void> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      try {
        port.removeAllListeners('data')
      } catch {
        /* segue para o erro de prazo */
      }
      reject(new Error('Tempo de espera excedido'))
    }, timeout)

    let pending = ''
    const onChunk = (data) => {
      pending += data.toString()
      if (!pending.includes(response)) return
      clearTimeout(timer)
      try {
        port.removeListener('data', onChunk)
      } catch {
        /* a porta pode já ter caído */
      }
      resolve()
    }
    port.on('data', onChunk)
  })
}

interface UpdateFirmwareProps {
  file: string
  portName: string
  baudRate: number
  synced: () => void
  finished: (seconds: number) => void
  fail: () => void
  onProgress?: (percent: number) => void
}

async function releaseFirmwarePorts(portName: string): Promise<{ serialClosed: boolean; modbusClosed: boolean }> {
  let serialClosed = false
  let modbusClosed = false
  try {
    serialClosed = await closeSerialPort()
  } catch {
    serialClosed = false
  }
  try {
    await CloseModBus()
    modbusClosed = true
  } catch {
    modbusClosed = false
  }
  limniLog(
    `firmware: serial fechada=${serialClosed ? 'sim' : 'não'} modbus fechado=${modbusClosed ? 'sim' : 'não'} porta ${portName}`
  )
  return { serialClosed, modbusClosed }
}

export async function atualizaFirmware({
  file,
  portName,
  baudRate,
  synced,
  finished,
  fail,
  onProgress
}: UpdateFirmwareProps) {
  const stateInfo = [file]
  let failed = false

  const reportFail = async (error: unknown) => {
    if (failed) return
    failed = true
    const message = (error as { message?: string })?.message ?? String(error ?? 'falha')
    limniLog(`firmware: falha ${message}`)
    if (isPortBusyError(error) || /acesso negado|access denied|EBUSY|EACCES|unknown error code\s*121/i.test(message)) {
      limniLog(`firmware: abertura da COM deu acesso negado ${describeSerialError(error)}`)
    }
    await releaseFirmwarePorts(portName)
    SerialManager.setIdle()
    fail()
  }

  limniLog(`firmware: início porta ${portName} baud ${baudRate}`)

  prepareFirmwareBoot()
  const bootWrite = WriteModbus(416, 1)
  bootWrite.then(
    () => undefined,
    () => undefined
  )
  let bootTimer: ReturnType<typeof setTimeout> | undefined
  try {
    await Promise.race([
      bootWrite,
      new Promise((_, reject) => {
        bootTimer = setTimeout(() => reject(new Error('Timeout')), 5000)
      })
    ])
  } catch (error) {
    limniLog(`firmware: falha ao gravar registrador 416 ${describeSerialError(error)}`)
  } finally {
    if (bootTimer) clearTimeout(bootTimer)
  }

  await wait(200)

  try {
    await CloseModBus()
  } catch (error) {
    limniLog(`firmware: falha ao fechar Modbus antes do bootloader ${describeSerialError(error)}`)
    await reportFail(error)
    return
  }

  try {
    await openSerialPort(portName, baudRate)
    await wait(100)
    await aguardarRespostaSerial(serialPort, 'BL2.0', 10000)
    await wait(200)
    serialPort.write('#')
    await aguardarRespostaSerial(serialPort, 'Recebendo arquivo...', 10000)
    await waitUntilQuiet(serialPort, 40)
    synced()
    await wait(100)
    const seconds = await update(stateInfo, baudRate, onProgress)
    const serialClosed = await closeSerialPort()
    if (!serialClosed) {
      await reportFail(new Error('Falha ao fechar a serial do bootloader'))
      return
    }
    if (failed) return
    finished(seconds)
  } catch (error: any) {
    await reportFail(error)
  }
}
