import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      showSaveDialog: () => Promise<Electron.SaveDialogReturnValue>
      runUpdater: () => Promise<void>
    }
    mqttAPI: {
      onMessage: (key: string, callback: (topic: string, message: string) => void) => void
      removeListener: (channel: string, listener: (...args: unknown[]) => void) => void // 🔥 Novo método
      offMessage: (key: string) => void
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
      send: (channel: string, ...args: unknown[]) => void
    }
  }
}

export {}
