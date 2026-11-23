export type TelemetryEventType = 'update_check' | 'download' | 'installation' | 'failure'

export type FailureStage = 'check' | 'download' | 'install'

export type TelemetryPayload = {
  application: string
  channel: string
  type: TelemetryEventType
  version: string
  outcome?: 'requested' | 'completed'
  range?: boolean
  version_from?: string
  stage?: FailureStage
  event_id?: string
}

export type TelemetryConfig = {
  enabled: boolean
  url: string
  token: string
  application: string
}

/** Extrai o canal do path do feed generic (.../{slug}/{channel}). */
export function channelFromFeedUrl(feedUrl: string): string {
  try {
    const path = new URL(feedUrl).pathname.replace(/\/+$/, '')
    const parts = path.split('/').filter(Boolean)
    const channel = parts[parts.length - 1]
    if (channel === 'stable' || channel === 'beta') return channel
  } catch {
    /* ignore */
  }
  return 'stable'
}

export function buildTelemetryPayload(
  config: Pick<TelemetryConfig, 'application'>,
  feedUrl: string,
  partial: Omit<TelemetryPayload, 'application' | 'channel'>
): TelemetryPayload {
  return {
    application: config.application,
    channel: channelFromFeedUrl(feedUrl),
    ...partial
  }
}
