import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const pluvidbUpdater = {
  selectFile: () => ipcRenderer.invoke('pluvidb-fw:selectFile')
}

// Custom APIs for renderer
const api = {
  showSaveDialog: (): Promise<Electron.SaveDialogReturnValue> =>
    ipcRenderer.invoke('show-save-dialog'),

  runUpdater: (): Promise<void> => ipcRenderer.invoke('run-updater'),

  getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),

  checkForUpdates: (): Promise<{ ok: boolean; reason?: 'dev' | 'disabled'; message?: string }> =>
    ipcRenderer.invoke('check-for-updates')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('pluvidbUpdater', pluvidbUpdater)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.pluvidbUpdater = pluvidbUpdater
}
