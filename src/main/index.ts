import { app, shell, BrowserWindow, dialog, screen, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import type { UpdateInfo } from 'builder-util-runtime'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import iconLinux from '../../resources/icon.png?asset'
import iconWin from '../../resources/icon.ico?asset'
import squirrelStartup from 'electron-squirrel-startup'
import { spawn, execFile } from 'child_process'
import '../db/db'
import { setupMQTTHandlers } from './mqttHandler'
import { initSerialHandles } from './serialHandles'
import express from 'express'

import {
  insertDevice,
  getAllDevices,
  updateDevice,
  deleteDevice,
  insertTerminalLog,
  getTerminalLogsByDevice,
  deleteTerminalLogsByDevice
} from '../db/db' // ajuste o caminho se necessário

const fs = require('fs')

/** Conteúdo mínimo se o YAML não vier no pacote (Forge antigo / cópia aninhada). */
const DEFAULT_APP_UPDATE_YML = `provider: github
owner: DhioneCastilhoBarbosa
repo: suite-device-app
updaterCacheDirName: suite-device-app-updater
`

/**
 * electron-updater lê sempre `process.resourcesPath/app-update.yml`.
 * Com extraResources `to: 'resources'`, o ficheiro acabava em `resources/resources/app-update.yml`.
 */
function ensureAppUpdateYml(): void {
  if (is.dev || !app.isPackaged) return
  const dest = path.join(process.resourcesPath, 'app-update.yml')
  if (fs.existsSync(dest)) return
  const nested = path.join(process.resourcesPath, 'resources', 'app-update.yml')
  try {
    if (fs.existsSync(nested)) {
      fs.copyFileSync(nested, dest)
      return
    }
  } catch (e) {
    console.warn('Não foi possível copiar app-update.yml da subpasta resources:', e)
  }
  try {
    fs.writeFileSync(dest, DEFAULT_APP_UPDATE_YML, 'utf8')
  } catch (e) {
    console.error('Não foi possível gravar app-update.yml em resources:', e)
  }
}

if (squirrelStartup) {
  app.quit()
}

/*const { updateElectronApp } = require('update-electron-app')
updateElectronApp({
  updateInterval: '5 minutes',
  notifyUser: true
})*/

let mainWindow: BrowserWindow | null

/** True after o utilizador pediu "Verificar atualizações" até tratar feedback (sem nova versão ou erro). */
let pendingManualUpdateFeedback = false

autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = false

function getReleaseNotesText(info: UpdateInfo): string {
  const { releaseNotes } = info
  if (typeof releaseNotes === 'string') return releaseNotes
  if (Array.isArray(releaseNotes)) {
    return releaseNotes.map((n) => (typeof n === 'object' && n && 'note' in n ? String(n.note) : '')).join('\n')
  }
  return ''
}

async function showAppMessageBox(options: Electron.MessageBoxOptions): Promise<Electron.MessageBoxReturnValue> {
  if (mainWindow) {
    return dialog.showMessageBox(mainWindow, options)
  }
  return dialog.showMessageBox(options)
}

const distPath = is.dev
  ? path.join(__dirname, '../renderer')
  : path.join(app.getAppPath(), 'renderer', 'dist')

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    show: false,
    autoHideMenuBar: true,
    icon: process.platform === 'linux' ? iconLinux : iconWin,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  setupMQTTHandlers(mainWindow)
  initSerialHandles(mainWindow)

  // 🌐 Servidor local ou prod com express
  const server = express()
  const port = 3000

  server.use(express.static(distPath))

  server.get('*', (req, res) => {
    const indexFile = path.join(distPath, 'index.html')
    console.log(`Servindo index.html de: ${indexFile}`)
    res.sendFile(indexFile)
  })

  server.listen(port, () => {
    console.log(`🌐 Servidor rodando em http://localhost:${port}`)
    console.log(`✅ distPath usado: ${distPath}`)

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      mainWindow!.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      //mainWindow!.loadURL(`http://localhost:${port}`)
      mainWindow!.loadFile(join(__dirname, '../renderer/index.html'))
    }

    mainWindow!.on('ready-to-show', () => mainWindow!.show())

    mainWindow!.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url)
      return { action: 'deny' }
    })

    mainWindow!.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error(`❌ Erro ao carregar renderer: ${errorDescription} (Código ${errorCode})`)
    })
  })

  screen.on('display-metrics-changed', () => {
    if (mainWindow) {
      const currentScreen = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
      const { width, height } = currentScreen.workAreaSize
      const [currentWidth, currentHeight] = mainWindow.getSize()
      mainWindow.setSize(
        Math.floor((currentWidth / width) * width),
        Math.floor((currentHeight / height) * height)
      )
    }
  })

  mainWindow.setTitle('Suite Device')
}

function handleSquirrelEvent(): boolean {
  if (process.argv.length === 1) return false

  const appFolder = path.resolve(process.execPath, '..')
  const rootAtomFolder = path.resolve(appFolder, '..')
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'))
  const exeName = path.basename(process.execPath)

  const spawnUpdate = (args: string[]): import('child_process').ChildProcess | null => {
    try {
      return spawn(updateDotExe, args, { detached: true })
    } catch {
      return null
    }
  }

  const squirrelEvent = process.argv[1]
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      spawnUpdate(['--createShortcut', exeName])
      setTimeout(app.quit, 1000)
      return true
    case '--squirrel-uninstall':
      spawnUpdate(['--removeShortcut', exeName])
      setTimeout(app.quit, 1000)
      return true
    case '--squirrel-obsolete':
      app.quit()
      return true
  }
  return false
}

if (!handleSquirrelEvent()) {
  app.on('ready', () => {
    ensureAppUpdateYml()
    createWindow()

    if (!is.dev) {
      autoUpdater.checkForUpdates().catch((err) => {
        console.error('Erro ao verificar atualizações no arranque:', err)
      })
    }

    ipcMain.handle('get-app-version', () => app.getVersion())

    ipcMain.handle(
      'check-for-updates',
      async (): Promise<{ ok: boolean; reason?: 'dev' | 'disabled'; message?: string }> => {
        if (is.dev) {
          return { ok: false, reason: 'dev' }
        }
        pendingManualUpdateFeedback = true
        try {
          const result = await autoUpdater.checkForUpdates()
          if (result === null) {
            pendingManualUpdateFeedback = false
            return { ok: false, reason: 'disabled', message: 'Atualizações não estão disponíveis.' }
          }
          return { ok: true }
        } catch (err) {
          pendingManualUpdateFeedback = false
          const message = err instanceof Error ? err.message : String(err)
          return { ok: false, message }
        }
      }
    )

    ipcMain.handle('save-device', async (event, device) => {
      try {
        await insertDevice(device)
        return { success: true }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : String(err) }
      }
    })

    ipcMain.handle('get-all-devices', async () => {
      try {
        const devices = await getAllDevices()
        return devices
      } catch (error) {
        console.error('Erro ao buscar dispositivos:', error)
        return []
      }
    })

    ipcMain.handle('update-device', async (event, device) => {
      try {
        await updateDevice(device)
        return { success: true }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : String(err) }
      }
    })

    ipcMain.handle('delete-device', async (event, id: number) => {
      try {
        await deleteDevice(id)
        return { success: true }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : String(err) }
      }
    })

    ipcMain.handle('insertTerminalLog', async (event, logEntry) => {
      try {
        await insertTerminalLog(logEntry.deviceId, logEntry.message) // Corrigido aqui!
        return { success: true }
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : String(err) }
      }
    })

    ipcMain.handle('get-terminal-logs', async (event, deviceId) => {
      try {
        const logs = await getTerminalLogsByDevice(deviceId)
        return logs || [] // 🔥 Garante um array
      } catch (error) {
        console.error('Erro ao buscar logs do terminal:', error)
        return [] // 🔥 Retorna array vazio no erro
      }
    })

    ipcMain.handle('clear-terminal-logs', async (event, deviceId) => {
      try {
        await deleteTerminalLogsByDevice(deviceId)
        return { success: true }
      } catch (error) {
        console.error('Erro ao limpar logs do dispositivo:', error)
        return { success: false, error: error instanceof Error ? error.message : String(error) }
      }
    })

    ipcMain.handle('save-logs-file', async (event, { fileName, content }) => {
      try {
        const { canceled, filePath } = await dialog.showSaveDialog({
          title: 'Salvar Histórico',
          defaultPath: fileName,
          filters: [{ name: 'Text Files', extensions: ['txt'] }]
        })

        if (canceled || !filePath) {
          return { success: false, error: 'Operação cancelada.' }
        }

        fs.writeFileSync(filePath, content, 'utf-8')
        return { success: true, path: filePath }
      } catch (error) {
        console.error('Erro ao salvar o arquivo:', error)
        return { success: false, error: error instanceof Error ? error.message : String(error) }
      }
    })
  })

  // teste de executar .exe fora da aplicação

  ipcMain.handle('run-updater', () => {
    const exePath =
      process.env.NODE_ENV === 'development'
        ? path.join(__dirname, '..', 'resources', 'PluviDB-Updater.exe') // Para desenvolvimento
        : path.join(app.getAppPath(), 'resources', 'PluviDB-Updater.exe') // Para build

    console.log('Tentando executar:', exePath)

    return new Promise<string>((resolve, reject) => {
      execFile(exePath, (error, stdout, stderr) => {
        if (error) {
          reject(`Erro ao executar o .exe: ${error.message}`)
          return
        }
        if (stderr) {
          reject(`Erro do programa: ${stderr}`)
          return
        }
        resolve(stdout)
      })
    })
  })

  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.electron')

    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  autoUpdater.on('update-available', async (info) => {
    pendingManualUpdateFeedback = false
    const notes = getReleaseNotesText(info)
    const { response } = await showAppMessageBox({
      type: 'info',
      buttons: ['Baixar e instalar', 'Agora não'],
      defaultId: 0,
      cancelId: 1,
      title: 'Nova atualização',
      message: `A versão ${info.version} está disponível.`,
      detail: notes || 'Deseja baixar e instalar esta atualização agora?'
    })
    if (response !== 0) return
    try {
      await autoUpdater.downloadUpdate()
    } catch (e) {
      console.error('Falha ao baixar atualização:', e)
      await showAppMessageBox({
        type: 'error',
        title: 'Erro ao baixar',
        message: 'Não foi possível baixar a atualização.',
        detail: e instanceof Error ? e.message : String(e)
      })
    }
  })

  autoUpdater.on('update-not-available', () => {
    if (!pendingManualUpdateFeedback) return
    pendingManualUpdateFeedback = false
    void showAppMessageBox({
      type: 'info',
      title: 'Atualizações',
      message: 'Não há atualizações disponíveis.',
      detail: `A aplicação já está na versão mais recente (${app.getVersion()}).`
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    void showAppMessageBox({
      type: 'info',
      buttons: ['Reiniciar agora', 'Mais tarde'],
      defaultId: 0,
      cancelId: 1,
      title: 'Atualização pronta',
      message: info.releaseName || 'Atualização descarregada',
      detail:
        'A nova versão foi descarregada. Reinicie a aplicação para concluir a instalação da atualização.'
    }).then((returnValue) => {
      if (returnValue.response === 0) {
        autoUpdater.quitAndInstall(false, true)
      }
    })
  })

  autoUpdater.on('checking-for-update', () => {
    // Opcional: telemetria ou estado de UI
  })

  autoUpdater.on('error', (err) => {
    if (pendingManualUpdateFeedback) {
      pendingManualUpdateFeedback = false
      void showAppMessageBox({
        type: 'error',
        title: 'Erro nas atualizações',
        message: 'Não foi possível verificar ou obter atualizações.',
        detail: err.message
      })
    }
    console.error('Erro ao verificar atualizações:', err)
  })
}
