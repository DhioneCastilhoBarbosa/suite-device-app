import SerialManagerRS232 from './serial'
import { McumgrClient } from './mcumgr'

let mcumgrClient: McumgrClient | null = null

function getOpenPort(serial: SerialManagerRS232) {
  const port = serial.getRawPort()
  if (!port || !serial.isPortOpen()) {
    throw new Error('Porta serial não está aberta.')
  }
  return port
}

export function createPluviFirmwareService(serial: SerialManagerRS232) {
  return {
    isPortOpen: (): boolean => serial.isPortOpen(),
    getPortName: (): string | null => serial.getCurrentPath(),

    dispose(): void {
      mcumgrClient?.dispose()
      mcumgrClient = null
    },

    async checkRecovery(): Promise<boolean> {
      serial.prepareRawSerialAccess()
      mcumgrClient?.dispose()
      mcumgrClient = new McumgrClient(getOpenPort(serial))
      return mcumgrClient.checkRecoveryModeQuick()
    },

    async upload(filePath: string, onProgress: (off: number, total: number) => void): Promise<void> {
      if (!serial.isPortOpen()) {
        throw new Error('Porta serial não está aberta.')
      }

      // Limpa parsers do modo normal, depois recria o cliente mcumgr (prepareRawSerialAccess
      // remove listeners — não pode ser chamado com cliente mcumgr já ativo).
      serial.prepareRawSerialAccess()
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
