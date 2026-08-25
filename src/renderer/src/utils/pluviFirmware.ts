import SerialManagerRS232 from './serial'
import { classifyMcumgrProbeFailure, McumgrClient } from './mcumgr'

let mcumgrClient: McumgrClient | null = null

const PLUVI_FIRMWARE_BAUD = 115200
const RECOVERY_PROBE_ATTEMPTS = 3
const RECOVERY_REOPEN_SETTLE_MS = 750

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getOpenPort(serial: SerialManagerRS232) {
  const port = serial.getRawPort()
  if (!port || !serial.isPortOpen()) {
    throw new Error('Porta serial não está aberta.')
  }
  return port
}

export type RecoveryFailReason = 'serial_io' | 'timeout' | 'not_recovery' | 'port_closed'

export type RecoveryCheckResult =
  | { ok: true }
  | { ok: false; detail: string; reason: RecoveryFailReason }

export function createPluviFirmwareService(serial: SerialManagerRS232) {
  return {
    isPortOpen: (): boolean => serial.isPortOpen(),
    getPortName: (): string | null => serial.getCurrentPath(),

    dispose(): void {
      mcumgrClient?.dispose()
      mcumgrClient = null
    },

    /**
     * Reabre a COM, prepara sessão raw e faz probe SMP Image State.
     * Em falha de I/O flush/drain (Windows), reabre e repete o probe.
     */
    async checkRecovery(): Promise<RecoveryCheckResult> {
      const path = serial.getCurrentPath()
      if (!path || !serial.isPortOpen()) {
        return { ok: false, detail: 'Porta serial não está aberta.', reason: 'port_closed' }
      }

      let lastFail: RecoveryCheckResult = {
        ok: false,
        detail: 'Falha ao verificar recovery',
        reason: 'not_recovery'
      }

      for (let attempt = 0; attempt < RECOVERY_PROBE_ATTEMPTS; attempt++) {
        try {
          await serial.reopenSafe(path, PLUVI_FIRMWARE_BAUD)
          if (attempt > 0) {
            await sleep(RECOVERY_REOPEN_SETTLE_MS)
          }
          await serial.prepareMcumgrSession()

          mcumgrClient?.dispose()
          mcumgrClient = new McumgrClient(getOpenPort(serial), {
            initialTimeoutS: 3,
            subsequentTimeoutMs: 2000,
            nbRetry: 4
          })

          const result = await mcumgrClient.checkRecoveryMode({ initialTimeoutS: 3 })
          if (result.ok) {
            return { ok: true }
          }

          const reason = classifyMcumgrProbeFailure(result.detail)
          lastFail = { ok: false, detail: result.detail, reason }

          if (reason === 'serial_io' && attempt < RECOVERY_PROBE_ATTEMPTS - 1) {
            console.warn(
              `[pluviFirmware] probe falhou por I/O serial (tentativa ${attempt + 1}), reabrindo COM...`
            )
            continue
          }

          // Timeout / fora de recovery: não insiste em reopen além do necessário
          break
        } catch (err) {
          mcumgrClient?.dispose()
          mcumgrClient = null
          const detail = err instanceof Error ? err.message : String(err)
          const reason = classifyMcumgrProbeFailure(detail)
          lastFail = { ok: false, detail, reason }

          if (reason === 'serial_io' && attempt < RECOVERY_PROBE_ATTEMPTS - 1) {
            console.warn(
              `[pluviFirmware] exceção I/O serial (tentativa ${attempt + 1}), reabrindo COM...`
            )
            continue
          }
          break
        }
      }

      // Mantém a COM aberta se o probe derrubou o estado por engano
      if (path && !serial.isPortOpen()) {
        try {
          await serial.reopenSafe(path, PLUVI_FIRMWARE_BAUD)
        } catch {
          /* mantém lastFail */
        }
      }

      return lastFail
    },

    async upload(filePath: string, onProgress: (off: number, total: number) => void): Promise<void> {
      if (!serial.isPortOpen()) {
        throw new Error('Porta serial não está aberta.')
      }

      const path = serial.getCurrentPath()
      if (path) {
        await serial.reopenSafe(path, PLUVI_FIRMWARE_BAUD)
      }

      await serial.prepareMcumgrSession()
      mcumgrClient?.dispose()
      mcumgrClient = new McumgrClient(getOpenPort(serial), {
        initialTimeoutS: 60,
        subsequentTimeoutMs: 3000,
        nbRetry: 4
      })

      await mcumgrClient.imageUpload(filePath, 0, onProgress)
    },

    async reset(): Promise<void> {
      if (!mcumgrClient) return
      await mcumgrClient.resetDevice()
      mcumgrClient.dispose()
      mcumgrClient = null
    }
  }
}

export type PluviFirmwareService = ReturnType<typeof createPluviFirmwareService>
