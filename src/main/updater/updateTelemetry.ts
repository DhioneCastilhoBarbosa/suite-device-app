import { app } from 'electron'
import { readFileSync } from 'fs'
import { join } from 'path'
import defaultFeed from '../../../config/default-feed.json'
import {
  clearPendingInstall,
  installConfirmed,
  readPendingInstall,
  writePendingInstall
} from './pendingInstall'
import { TelemetryClient } from './telemetryClient'
import type { FailureStage, TelemetryEventType } from './telemetry'

/**
 * Telemetria fire-and-forget acoplada ao autoUpdater existente.
 * Não altera a UX — só reporta eventos e confirma instalação pendente após restart.
 */
export class UpdateTelemetry {
  private readonly client = new TelemetryClient()
  private feedUrl = defaultFeed.url
  private phase: FailureStage | null = null
  private versionBeforeUpdate: string | null = null
  private availableVersion: string | null = null

  /** Lê a URL do feed embutido (app-update.yml) quando empacotado. */
  resolveFeedUrl(resourcesPath: string): string {
    try {
      const yml = readFileSync(join(resourcesPath, 'app-update.yml'), 'utf8')
      const match = /^url:\s*(.+)\s*$/m.exec(yml)
      if (match?.[1]) {
        this.feedUrl = match[1].trim()
        return this.feedUrl
      }
    } catch {
      /* fallback abaixo */
    }
    this.feedUrl = defaultFeed.url
    return this.feedUrl
  }

  getFeedUrl(): string {
    return this.feedUrl
  }

  setPhase(phase: FailureStage | null): void {
    this.phase = phase
  }

  markAvailable(version: string): void {
    this.versionBeforeUpdate = app.getVersion()
    this.availableVersion = version
  }

  markDownloaded(version: string): void {
    this.availableVersion = version
  }

  /** Registra instalação pendente antes de quitAndInstall (confirma no próximo start). */
  recordPendingInstall(targetVersion: string): void {
    try {
      writePendingInstall(
        app.getPath('userData'),
        this.versionBeforeUpdate || app.getVersion(),
        targetVersion
      )
      console.log(`Instalação pendente registrada: → ${targetVersion}`)
    } catch (error) {
      console.warn(
        'Não foi possível gravar pending-install:',
        error instanceof Error ? error.message : error
      )
    }
  }

  async confirmPendingInstall(): Promise<void> {
    const userData = app.getPath('userData')
    const pending = readPendingInstall(userData)
    if (!pending) return
    const current = app.getVersion()
    if (installConfirmed(current, pending)) {
      await this.report('installation', {
        version: pending.to,
        version_from: pending.from
      })
      console.log(`Instalação confirmada: ${pending.from} → ${pending.to}`)
    } else {
      await this.report('failure', {
        version: pending.to,
        stage: 'install',
        version_from: pending.from
      })
      console.log(
        `Instalação não aplicada (continua ${current}; pendente era ${pending.from} → ${pending.to}).`
      )
    }
    clearPendingInstall(userData)
  }

  reportCheck(): void {
    this.phase = 'check'
    void this.report('update_check', { version: app.getVersion() })
  }

  reportDownloadRequested(version: string): void {
    this.phase = 'download'
    this.availableVersion = version
    void this.report('download', { version, outcome: 'requested', range: true })
  }

  reportDownloadCompleted(version: string): void {
    this.availableVersion = version
    void this.report('download', { version, outcome: 'completed' })
  }

  reportFailure(stage?: FailureStage): void {
    const resolved = stage ?? this.phase ?? 'check'
    const version = this.availableVersion || app.getVersion()
    void this.report('failure', {
      version,
      stage: resolved,
      version_from: this.versionBeforeUpdate || undefined
    })
    this.phase = null
  }

  private async report(
    type: TelemetryEventType,
    partial: {
      version: string
      outcome?: 'requested' | 'completed'
      range?: boolean
      version_from?: string
      stage?: FailureStage
    }
  ): Promise<void> {
    if (!this.client.enabled()) {
      console.log('Telemetria desligada ou sem token/URL.')
      return
    }
    const ok = await this.client.report(this.feedUrl, { type, ...partial })
    console.log(ok ? `Telemetria ok: ${type}` : `Telemetria falhou: ${type}`)
  }
}
