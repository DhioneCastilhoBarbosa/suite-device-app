import { app, shell, BrowserWindow, autoUpdater, dialog } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import iconLinux from '../../resources/icon.png?asset'
import iconWin from '../../resources/icon.ico?asset'
import squirrelStartup from 'electron-squirrel-startup'
import { spawn } from 'child_process'

if (squirrelStartup) {
  app.quit()
}

const { updateElectronApp } = require('update-electron-app')
updateElectronApp({
  updateInterval: '5 minutes',
  notifyUser: true
})

let mainWindow: BrowserWindow | null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 830,
    minWidth: 1200,
    minHeight: 830,
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

  mainWindow.on('ready-to-show', () => {
    mainWindow!.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function handleSquirrelEvent(): boolean {
  if (process.argv.length === 1) {
    return false
  }

  const appFolder = path.resolve(process.execPath, '..')
  const rootAtomFolder = path.resolve(appFolder, '..')
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'))
  const exeName = path.basename(process.execPath)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spawnUpdate = (args: string[]): any => {
    try {
      return spawn(updateDotExe, args, { detached: true })
    } catch (error) {
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
    createWindow()
    if (is.dev) {
      mainWindow?.webContents.openDevTools()
    }
    autoUpdater.checkForUpdates()
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

  autoUpdater.on('update-downloaded', (releaseNotes, releaseName) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dialogOpts: any = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: process.platform === 'darwin' ? releaseNotes : releaseName,
      detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    }

    dialog.showMessageBox(dialogOpts)

    /*dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })*/
  })

  autoUpdater.on('checking-for-update', () => {
    // Aqui você pode adicionar qualquer lógica necessária quando o aplicativo está verificando por atualizações
  })

  autoUpdater.on('update-available', () => {
    // Aqui você pode adicionar qualquer lógica necessária quando uma atualização está disponível
  })

  autoUpdater.on('update-not-available', () => {
    // Aqui você pode adicionar qualquer lógica necessária quando uma atualização não está disponível
  })

  autoUpdater.on('error', () => {
    // Aqui você pode adicionar qualquer lógica necessária para lidar com erros de atualização
  })
}
