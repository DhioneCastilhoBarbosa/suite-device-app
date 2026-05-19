import { app, shell, BrowserWindow, dialog, screen, ipcMain } from 'electron'
import type { Server } from 'http'
import { autoUpdater } from 'electron-updater'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import appIcon from '../../resources/icon.png?asset'
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
let localHttpServer: Server | null = null

/** True after o utilizador pediu "Verificar atualizações" até tratar feedback (sem nova versão ou erro). */
let pendingManualUpdateFeedback = false
let pendingUpdateVersion: string | null = null
let downloadProgressWindow: BrowserWindow | null = null
let autoUpdateCheckDone = false
const LOCAL_HTTP_PORT = 3000

autoUpdater.autoDownload = false
autoUpdater.autoInstallOnAppQuit = false
autoUpdater.fullChangelog = false

function getUpdateAvailableDialogText(version: string): { message: string; detail: string } {
  return {
    message: `A versão ${version} está disponível.`,
    detail:
      'Existe uma nova atualização do Suite Device. Deseja transferir e instalar agora? A aplicação será fechada durante a instalação.'
  }
}

function shutdownAppForUpdate(): void {
  if (localHttpServer) {
    localHttpServer.close()
    localHttpServer = null
  }
  BrowserWindow.getAllWindows().forEach((win) => {
    if (!win.isDestroyed()) {
      win.removeAllListeners('close')
      win.destroy()
    }
  })
  mainWindow = null
}

function runQuitAndInstall(): void {
  shutdownAppForUpdate()
  autoUpdater.quitAndInstall(true, true)
}

function showDownloadProgressWindow(): void {
  if (downloadProgressWindow && !downloadProgressWindow.isDestroyed()) {
    downloadProgressWindow.focus()
    return
  }

  downloadProgressWindow = new BrowserWindow({
    width: 480,
    height: 200,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    show: false,
    parent: mainWindow ?? undefined,
    modal: true,
    autoHideMenuBar: true,
    title: 'Fazendo download',
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true }
  })

  const html = [
    '<!DOCTYPE html><html><head><meta charset="utf-8"><style>',
    '*{box-sizing:border-box}',
    "body{font-family:'Segoe UI',system-ui,sans-serif;margin:0;padding:28px 32px;background:#f8fafc;color:#0f172a}",
    '.track{position:relative;height:32px;background:#e2e8f0;border-radius:16px;overflow:hidden;box-shadow:inset 0 1px 3px rgba(15,23,42,.12)}',
    '.fill{height:100%;width:0%;background:linear-gradient(90deg,#0369a1,#0ea5e9);border-radius:16px;transition:width .2s ease}',
    '.pct{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#0f172a}',
    '#detail{margin:14px 0 0;font-size:12px;color:#64748b;text-align:center}',
    '</style></head><body>',
    '<div class="track"><div class="fill" id="fill"></div><div class="pct" id="pct">0%</div></div>',
    '<p id="detail">Preparando download…</p>',
    '</body></html>'
  ].join('')

  void downloadProgressWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
  )
  downloadProgressWindow.once('ready-to-show', () => downloadProgressWindow?.show())
}

function updateDownloadProgressWindow(percent: number, transferred: number, total: number): void {
  if (!downloadProgressWindow || downloadProgressWindow.isDestroyed()) return
  const pct = Math.round(percent)
  const clamped = Math.min(100, Math.max(0, pct))
  const detail =
    total > 0
      ? `${(transferred / 1024 / 1024).toFixed(1)} MB / ${(total / 1024 / 1024).toFixed(1)} MB`
      : 'Baixando…'
  void downloadProgressWindow.webContents
    .executeJavaScript(
      `document.getElementById('fill').style.width=${JSON.stringify(`${clamped}%`)};` +
        `document.getElementById('pct').textContent=${JSON.stringify(`${pct}%`)};` +
        `document.getElementById('detail').textContent=${JSON.stringify(detail)};`
    )
    .catch(() => {})
}

function closeDownloadProgressWindow(): void {
  if (downloadProgressWindow && !downloadProgressWindow.isDestroyed()) {
    downloadProgressWindow.close()
  }
  downloadProgressWindow = null
}

function scheduleUpdateCheckAfterAppOpen(): void {
  if (is.dev || autoUpdateCheckDone || !mainWindow) return
  autoUpdateCheckDone = true

  const runCheck = (): void => {
    if (!mainWindow || mainWindow.isDestroyed()) return
    autoUpdater.checkForUpdates().catch((err) => {
      console.error('Erro ao verificar atualizações após abrir:', err)
    })
  }

  if (mainWindow.isVisible()) {
    setTimeout(runCheck, 2500)
  } else {
    mainWindow.once('ready-to-show', () => setTimeout(runCheck, 2500))
  }
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
    icon: appIcon,
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

  server.use(express.static(distPath))

  server.get('*', (req, res) => {
    const indexFile = path.join(distPath, 'index.html')
    console.log(`Servindo index.html de: ${indexFile}`)
    res.sendFile(indexFile)
  })

  const httpServer = server.listen(LOCAL_HTTP_PORT, () => {
    console.log(`🌐 Servidor rodando em http://localhost:${LOCAL_HTTP_PORT}`)
    console.log(`✅ distPath usado: ${distPath}`)

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      mainWindow!.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      mainWindow!.loadFile(join(__dirname, '../renderer/index.html'))
    }

    mainWindow!.on('ready-to-show', () => {
      mainWindow!.show()
      scheduleUpdateCheckAfterAppOpen()
    })

    mainWindow!.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url)
      return { action: 'deny' }
    })

    mainWindow!.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error(`❌ Erro ao carregar renderer: ${errorDescription} (Código ${errorCode})`)
    })
  })

  localHttpServer = httpServer
  httpServer.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      void showAppMessageBox({
        type: 'error',
        title: 'Suite Device já está em execução',
        message: `A porta ${LOCAL_HTTP_PORT} já está em uso.`,
        detail:
          'Outra instância do Suite Device pode estar aberta, ou uma atualização ainda está a instalar.\n\n' +
          'Feche a outra janela no Gestor de tarefas (suite-device-app.exe) e abra novamente.'
      }).then(() => app.quit())
      return
    }
    console.error('Erro ao iniciar servidor local:', err)
    app.quit()
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
  const gotSingleInstanceLock = app.requestSingleInstanceLock()
  if (!gotSingleInstanceLock) {
    app.quit()
  } else {
    app.on('second-instance', () => {
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })
  }

  if (gotSingleInstanceLock) app.on('before-quit', () => {
    if (localHttpServer) {
      localHttpServer.close()
      localHttpServer = null
    }
  })

  if (gotSingleInstanceLock) app.on('ready', () => {
    ensureAppUpdateYml()
    createWindow()

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

  if (gotSingleInstanceLock) {
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
    pendingUpdateVersion = info.version
    const { message, detail } = getUpdateAvailableDialogText(info.version)
    const { response } = await showAppMessageBox({
      type: 'info',
      buttons: ['Baixar e instalar', 'Agora não'],
      defaultId: 0,
      cancelId: 1,
      title: 'Nova atualização',
      message,
      detail
    })
    if (response !== 0) return
    showDownloadProgressWindow()
    try {
      await autoUpdater.downloadUpdate()
    } catch (e) {
      console.error('Falha ao baixar atualização:', e)
      closeDownloadProgressWindow()
      await showAppMessageBox({
        type: 'error',
        title: 'Erro ao baixar',
        message: 'Não foi possível baixar a atualização.',
        detail: e instanceof Error ? e.message : String(e)
      })
    }
  })

  autoUpdater.on('download-progress', (progress) => {
    updateDownloadProgressWindow(progress.percent, progress.transferred, progress.total)
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
    closeDownloadProgressWindow()
    pendingUpdateVersion = info.version
    void showAppMessageBox({
      type: 'info',
      buttons: ['Reiniciar e instalar', 'Mais tarde'],
      defaultId: 0,
      cancelId: 1,
      title: 'Atualização concluída',
      message: `A versão ${info.version} foi baixada com sucesso.`,
      detail:
        'Para finalizar a instalação, salve seu trabalho e reinicie o aplicativo.\n\n' +
        'O Suite Device será fechado durante a instalação. Não abra o aplicativo novamente até concluir.'
    }).then((returnValue) => {
      if (returnValue.response === 0) {
        runQuitAndInstall()
      }
    })
  })

  autoUpdater.on('checking-for-update', () => {
    // Opcional: telemetria ou estado de UI
  })

  autoUpdater.on('error', (err) => {
    closeDownloadProgressWindow()
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
}
