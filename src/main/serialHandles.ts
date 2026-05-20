import { BrowserWindow, ipcMain } from 'electron'
import { SerialPort } from 'serialport'

let win: BrowserWindow | null = null
let prevPorts: string[] = []
let busy = false
let timer: NodeJS.Timeout | null = null
const INTERVAL = 2000

function now(): string {
  return new Date().toISOString()
}

function log(...args: unknown[]): void {
  console.log('[SERIAL:MAIN]', now(), ...args)
}

function warn(...args: unknown[]): void {
  console.warn('[SERIAL:MAIN]', now(), ...args)
}

function err(...args: unknown[]): void {
  console.error('[SERIAL:MAIN]', now(), ...args)
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

export function initSerialHandles(mainWindow: BrowserWindow): void {
  win = mainWindow
  log('initSerialHandles: attach window id=', win.id)

  ipcMain.on('serial:busy', () => {
    busy = true
    log('BUSY → true (pausando varredura)')
  })

  ipcMain.on('serial:idle', () => {
    busy = false
    log('BUSY → false (retomando varredura)')
  })

  ipcMain.handle('serial:snapshot', async () => {
    try {
      const t0 = performance.now()
      const ports = await SerialPort.list()
      log('snapshot → qtd=', ports.length, 'tempo(ms)=', (performance.now() - t0).toFixed(1))
      return ports.map((p) => p.path)
    } catch (e: unknown) {
      err('snapshot erro:', errorMessage(e))
      return []
    }
  })

  if (timer) clearInterval(timer)
  timer = setInterval(checkPorts, INTERVAL)
  log('monitor iniciado: interval=', INTERVAL, 'ms')

  checkPorts().catch((e: unknown) => err('checkPorts initial erro:', errorMessage(e)))
}

async function checkPorts(): Promise<void> {
  if (!win) {
    warn('sem BrowserWindow, abortando tick')
    return
  }
  if (busy) {
    log('tick ignorado (BUSY)')
    return
  }

  try {
    const t0 = performance.now()
    const ports = await SerialPort.list()
    const paths = ports.map((p) => p.path)
    const dt = (performance.now() - t0).toFixed(1)

    const added = paths.filter((p) => !prevPorts.includes(p))
    const removed = prevPorts.filter((p) => !paths.includes(p))

    if (added.length || removed.length) {
      log(
        'tick mudanças: added=',
        added,
        'removed=',
        removed,
        'qtd=',
        paths.length,
        'tempo(ms)=',
        dt
      )
    } else {
      log('tick sem mudanças: qtd=', paths.length, 'tempo(ms)=', dt)
    }

    for (const p of added) {
      log('→ emit serial:added', p)
      win.webContents.send('serial:added', { path: p })
    }
    for (const p of removed) {
      log('→ emit serial:removed', p)
      win.webContents.send('serial:removed', { path: p })
    }

    prevPorts = paths
  } catch (e: unknown) {
    err('checkPorts erro:', errorMessage(e))
    try {
      win?.webContents.send('serial:error', errorMessage(e))
    } catch (sendError: unknown) {
      err('falha ao notificar renderer:', errorMessage(sendError))
    }
  }
}
