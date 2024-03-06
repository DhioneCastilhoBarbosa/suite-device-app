import { app, shell, BrowserWindow, autoUpdater, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import iconLinux from '../../resources/icon.png?asset'
import iconWin from '../../resources/icon.ico?asset'
import squirrelStartup from 'electron-squirrel-startup'

if (squirrelStartup) {
  app.quit()
}

const { updateElectronApp } = require('update-electron-app')
updateElectronApp({
  updateInterval: '5 minutes',
  logger: require('electron-log'),
  notifyUser: true
})

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    autoHideMenuBar: true,
    icon: join(__dirname, '../../resources/icon.ico?asset'),
    ...(process.platform === 'linux' ? { iconLinux } : { iconWin }),
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  //mainWindow.webContents.openDevTools()

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.

  mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
}

app.on('ready', function () {
  createWindow()
  autoUpdater.checkForUpdates()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

autoUpdater.on('update-downloaded', (releaseNotes, releaseName) => {
  const dialogOpts: any = {
    type: 'info',
    buttons: ['Reiniciar', 'Depois'],
    title: 'Application Update',
    message: process.platform === 'darwin' ? releaseNotes : releaseName,
    detail: 'A new version has been downloaded. Restart the application to apply the updates.'
  }

  dialog.showMessageBox(dialogOpts)
})
