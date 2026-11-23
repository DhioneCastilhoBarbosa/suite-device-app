import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
import { join } from 'path'
import { compareVersions } from './version'

export type PendingInstall = {
  from: string
  to: string
  at: string
}

export function pendingInstallPath(userData: string): string {
  return join(userData, 'pending-install.json')
}

export function writePendingInstall(userData: string, from: string, to: string): void {
  const body: PendingInstall = { from, to, at: new Date().toISOString() }
  writeFileSync(pendingInstallPath(userData), JSON.stringify(body), 'utf8')
}

export function readPendingInstall(userData: string): PendingInstall | null {
  const path = pendingInstallPath(userData)
  if (!existsSync(path)) return null
  try {
    const raw = JSON.parse(readFileSync(path, 'utf8')) as PendingInstall
    if (typeof raw.from !== 'string' || typeof raw.to !== 'string') return null
    return raw
  } catch {
    return null
  }
}

export function clearPendingInstall(userData: string): void {
  const path = pendingInstallPath(userData)
  if (existsSync(path)) unlinkSync(path)
}

/** true se a versão atual confirma que a update pedida foi aplicada. */
export function installConfirmed(currentVersion: string, pending: PendingInstall): boolean {
  try {
    return compareVersions(currentVersion, pending.to) === 0
  } catch {
    return currentVersion === pending.to
  }
}
