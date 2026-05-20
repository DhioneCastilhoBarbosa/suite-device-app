import { ElectronAPI } from '@electron-toolkit/preload'

export interface PluvidbFirmwareResult {
  success: boolean
  error?: string
  canceled?: boolean
  filePath?: string
}

export interface SuiteDeviceApi {
  showSaveDialog: () => Promise<Electron.SaveDialogReturnValue>
  runUpdater: () => Promise<void>
  getAppVersion: () => Promise<string>
  checkForUpdates: () => Promise<{ ok: boolean; reason?: 'dev' | 'disabled'; message?: string }>
}

export interface PluvidbUpdaterApi {
  selectFile: () => Promise<PluvidbFirmwareResult>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: SuiteDeviceApi
    pluvidbUpdater: PluvidbUpdaterApi
  }
}
