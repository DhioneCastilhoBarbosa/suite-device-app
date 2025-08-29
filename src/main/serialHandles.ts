import { BrowserWindow, ipcMain } from 'electron'
import { SerialPort } from 'serialport' // mantém como você usou

let win: BrowserWindow | null = null
let prevPorts: string[] = []
let busy = false
let timer: NodeJS.Timeout | null = null
const INTERVAL = 2000

function now() {
  return new Date().toISOString()
}
function log(...a: any[]) {
  console.log('[SERIAL:MAIN]', now(), ...a)
}
function warn(...a: any[]) {
  console.warn('[SERIAL:MAIN]', now(), ...a)
}
function err(...a: any[]) {
  console.error('[SERIAL:MAIN]', now(), ...a)
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
    } catch (e: any) {
      err('snapshot erro:', e?.message || e)
      return []
    }
  })

  if (timer) clearInterval(timer)
  timer = setInterval(checkPorts, INTERVAL)
  log('monitor iniciado: interval=', INTERVAL, 'ms')

  // primeira leitura imediata
  checkPorts().catch((e) => err('checkPorts initial erro:', e?.message || e))
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

    // diff
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
  } catch (e: any) {
    err('checkPorts erro:', e?.message || e)
    // opcional: notificar renderer
    try {
      win?.webContents.send('serial:error', String(e?.message || e))
    } catch {}
  }
}
