const MAX_LINES = 400

const lines: string[] = []
const listeners = new Set<() => void>()
let panelOpen = false

function notify(): void {
  listeners.forEach((listener) => {
    try {
      listener()
    } catch {
      /* o painel não pode derrubar a conexão */
    }
  })
}

function stamp(date = new Date()): string {
  const pad = (value: number, width = 2) => String(value).padStart(width, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`
}

function pushDebugLine(tag: string, message: string): void {
  const line = `${stamp()} [${tag}] ${message}`
  lines.push(line)
  if (lines.length > MAX_LINES) lines.splice(0, lines.length - MAX_LINES)
  console.log(line)
  notify()
}

export function limniLog(message: string): void {
  pushDebugLine('LIMNI', message)
}

export function tsatLog(message: string): void {
  pushDebugLine('TSAT', message)
}

export function subscribeLimniDebug(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getLimniDebugLines(): string[] {
  return lines.slice()
}

export function getLimniDebugText(): string {
  return lines.join('\n')
}

export function clearLimniDebug(): void {
  lines.length = 0
  notify()
}

export function isLimniDebugOpen(): boolean {
  return panelOpen
}

export function setLimniDebugOpen(open: boolean): void {
  panelOpen = open
  notify()
}

export function isLimniDevice(name: string | undefined | null): boolean {
  return name === 'linnimDB-cap' || name === 'linnimDB-Borbulha' || name === 'linnimDB-radar'
}

export function showsDiagnosticDock(name: string | undefined | null): boolean {
  return isLimniDevice(name) || name === 'TSatDB'
}

export function limniDeviceLabel(name: string): string {
  if (name === 'linnimDB-cap') return 'LimniDB-CAP'
  if (name === 'linnimDB-Borbulha') return 'LimniDB-BORBULHA'
  if (name === 'linnimDB-radar') return 'LimniDB-RADAR'
  return name
}

export function describeSerialError(error: unknown): string {
  const err = error as { message?: string; name?: string; errno?: number | string; code?: number | string }
  const message = err?.message ?? String(error ?? '')
  const name = err?.name ?? ''
  const fromText = String(message).match(/unknown error code\s*(\d+)/i)
  const numeric = [err?.errno, err?.code].find(
    (value) => typeof value === 'number' || (typeof value === 'string' && /^-?\d+$/.test(value))
  )
  const code = numeric ?? fromText?.[1] ?? ''
  return `message=${message} name=${name} code=${code}`
}

export function isPortBusyError(error: unknown): boolean {
  const err = error as { message?: string; code?: number | string; errno?: number | string }
  const code = err?.code ?? err?.errno
  if (code === 121 || code === '121' || code === 'EBUSY' || code === 'EACCES') return true
  const text = `${err?.message ?? ''} ${code ?? ''} ${String(error ?? '')}`
  return /access denied|acesso negado|semaphore timeout|unknown error code\s*121|\bEBUSY\b|\bEACCES\b/i.test(text)
}

export function copyLimniDebug(): boolean {
  const text = getLimniDebugText()
  try {
    const { clipboard } = window.require('electron')
    clipboard.writeText(text)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', 'true')
      area.style.position = 'fixed'
      area.style.left = '-9999px'
      document.body.appendChild(area)
      area.select()
      const copied = document.execCommand('copy')
      area.remove()
      return copied
    } catch {
      return false
    }
  }
}

function suggestedFileName(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `limni-diagnostico-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(date.getHours())}-${pad(date.getMinutes())}.txt`
}

export async function saveLimniDebug(): Promise<'downloads' | 'chosen' | 'cancelled' | 'failed'> {
  const content = getLimniDebugText()
  const fileName = suggestedFileName()
  try {
    const fs = window.require('fs')
    const path = window.require('path')
    const os = window.require('os')
    const dir = path.join(os.homedir(), 'Downloads')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, fileName), content, 'utf8')
    return 'downloads'
  } catch {
    try {
      const { ipcRenderer } = window.require('electron')
      const result = await ipcRenderer.invoke('save-logs-file', { fileName, content })
      if (result?.success) return 'chosen'
      return 'cancelled'
    } catch {
      return 'failed'
    }
  }
}
