import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs para renderer
const api = {
  showSaveDialog: (): Promise<Electron.SaveDialogReturnValue> =>
    ipcRenderer.invoke('show-save-dialog'),
  runUpdater: (): Promise<void> => ipcRenderer.invoke('run-updater')
}

// Gerenciamento de listeners por chave (único por callback)
const mqttListeners = new Map<
  string,
  (event: Electron.IpcRendererEvent, data: { topic: string; message: string }) => void
>()

const mqttAPI = {
  // Registra um callback identificado por uma chave única
  onMessage: (key: string, callback: (topic: string, message: string) => void): void => {
    // Se já existe com essa key, remove antes de adicionar novamente
    if (mqttListeners.has(key)) {
      const oldListener = mqttListeners.get(key)
      if (oldListener) {
        ipcRenderer.removeListener('mqtt-message', oldListener)
      }
    }

    const listener = (
      _event: Electron.IpcRendererEvent,
      { topic, message }: { topic: string; message: string }
    ): void => callback(topic, message)
    mqttListeners.set(key, listener)
    ipcRenderer.on('mqtt-message', listener)
  },

  // Remove o callback associado à chave
  offMessage: (key: string): void => {
    const listener = mqttListeners.get(key)
    if (listener) {
      ipcRenderer.removeListener('mqtt-message', listener)
      mqttListeners.delete(key)
    }
  },

  invoke: (channel: string, ...args: unknown[]): Promise<unknown> =>
    ipcRenderer.invoke(channel, ...args),
  send: (channel: string, ...args: unknown[]): void => ipcRenderer.send(channel, ...args)
}

// Expor ao renderer de forma segura
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('mqttAPI', mqttAPI)
  } catch (error) {
    console.error('Erro ao expor contextBridge:', error)
  }
} else {
  // Fallback sem isolamento (desenvolvimento)
  // @ts-ignore: Assigning to window for fallback when contextIsolation is disabled
  window.electron = electronAPI
  // @ts-ignore: Assigning to window for fallback when contextIsolation is disabled
  window.api = api
  // @ts-ignore: Assigning to window for fallback when contextIsolation is disabled
  window.mqttAPI = mqttAPI
}
