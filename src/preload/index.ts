import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Abre o diálogo de salvamento
  showSaveDialog: (): Promise<Electron.SaveDialogReturnValue> =>
    ipcRenderer.invoke('show-save-dialog'),

  // Executa o atualizador que está na pasta resources
  runUpdater: (): Promise<void> => ipcRenderer.invoke('run-updater'),

  getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),

  checkForUpdates: (): Promise<{ ok: boolean; reason?: 'dev' | 'disabled'; message?: string }> =>
    ipcRenderer.invoke('check-for-updates')
}

// Expõe APIs para o renderer
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
