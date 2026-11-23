import { randomUUID } from 'crypto'
import defaultTelemetry from '../../../config/default-telemetry.json'
import {
  buildTelemetryPayload,
  type FailureStage,
  type TelemetryConfig,
  type TelemetryEventType,
  type TelemetryPayload
} from './telemetry'

function envOrEmpty(key: string): string {
  const value = process.env[key]
  return typeof value === 'string' ? value.trim() : ''
}

function readConfig(): TelemetryConfig {
  const enabledEnv = envOrEmpty('TELEMETRY_ENABLED')
  const enabled =
    enabledEnv === 'true'
      ? true
      : enabledEnv === 'false'
        ? false
        : Boolean(defaultTelemetry.enabled)
  return {
    enabled,
    url: envOrEmpty('TELEMETRY_URL') || defaultTelemetry.url,
    token: envOrEmpty('TELEMETRY_TOKEN') || defaultTelemetry.token,
    application: envOrEmpty('TELEMETRY_APPLICATION') || defaultTelemetry.application
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
