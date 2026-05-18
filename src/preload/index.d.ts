import { ElectronAPI } from '@electron-toolkit/preload'

export interface SuiteDeviceApi {
  showSaveDialog: () => Promise<Electron.SaveDialogReturnValue>
  runUpdater: () => Promise<void>
  getAppVersion: () => Promise<string>
  checkForUpdates: () => Promise<{ ok: boolean; reason?: 'dev' | 'disabled'; message?: string }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: SuiteDeviceApi
  }
}
