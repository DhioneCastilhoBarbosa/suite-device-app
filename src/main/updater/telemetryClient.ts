import { randomUUID } from 'crypto'
import defaultTelemetry from '../../../config/default-telemetry.json'
import {
  buildTelemetryPayload,
  type FailureStage,
  type TelemetryConfig,
  type TelemetryEventType,
  type TelemetryPayload
} from './telemetry'

function readConfig(): TelemetryConfig {
  const enabledEnv = process.env.TELEMETRY_ENABLED
  const enabled =
    enabledEnv === 'true' ? true : enabledEnv === 'false' ? false : Boolean(defaultTelemetry.enabled)
  return {
    enabled,
    url: process.env.TELEMETRY_URL?.trim() || defaultTelemetry.url,
    token: process.env.TELEMETRY_TOKEN?.trim() || defaultTelemetry.token,
    application: process.env.TELEMETRY_APPLICATION?.trim() || defaultTelemetry.application
  }
}

export class TelemetryClient {
  private readonly config = readConfig()

  enabled(): boolean {
    return this.config.enabled && this.config.url.length > 0 && this.config.token.length >= 16
  }

  /** true se o POST foi aceito (created/duplicate). */
  async report(
    feedUrl: string,
    partial: {
      type: TelemetryEventType
      version: string
      outcome?: 'requested' | 'completed'
      range?: boolean
      version_from?: string
      stage?: FailureStage
      event_id?: string
    }
  ): Promise<boolean> {
    if (!this.enabled()) return false
    const payload: TelemetryPayload = buildTelemetryPayload(this.config, feedUrl, {
      ...partial,
      event_id: partial.event_id || randomUUID()
    })
    try {
      const response = await fetch(this.config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Telemetry-Token': this.config.token
        },
        body: JSON.stringify(payload)
      })
      if (!response.ok) {
        console.warn(`telemetria ${response.status}: ${await response.text().catch(() => '')}`)
        return false
      }
      return true
    } catch (error) {
      console.warn('telemetria indisponível', error instanceof Error ? error.message : error)
      return false
    }
  }
}
