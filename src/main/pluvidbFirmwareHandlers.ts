import { dialog, ipcMain } from 'electron'

export function registerPluvidbFirmwareHandlers(): void {
  ipcMain.handle('pluvidb-fw:selectFile', async () => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Selecionar firmware',
        filters: [{ name: 'Firmware PluviDB', extensions: ['dblos'] }],
        properties: ['openFile']
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, canceled: true }
      }

      return { success: true, filePath: result.filePaths[0] }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}

export function cleanupPluvidbFirmwareOnQuit(): void {
  // reservado para futura limpeza
}
