import { app, shell, BrowserWindow, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { registerApiHandlers } from './ipc/apiHandlers'
import { registerAuthHandlers } from './ipc/userHandlers'
import { registerXmlHandlers } from './ipc/xmlHandlers'
import { registerValidacionHandlers } from './ipc/validacionHandlers'
import { migrateDatabase } from './db/migrator'
import { registerDbHandlers } from './ipc/dbHandlers'
import { autoUpdater } from 'electron-updater';
import { registerAppHandlers } from './ipc/appHandlers'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.facturabilidad.validador')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  autoUpdater.checkForUpdatesAndNotify();

  migrateDatabase();

  // Registering IPC handlers
  registerApiHandlers();
  registerAuthHandlers();
  registerXmlHandlers();
  registerValidacionHandlers();
  registerDbHandlers();
  registerAppHandlers();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

autoUpdater.on('update-downloaded', async (_info) => {
  const result = await dialog.showMessageBox({
    type: 'info',
    title: 'Actualización disponible',
    message: 'Se ha descargado una nueva versión. ¿Quieres reiniciar y actualizar ahora?',
    buttons: ['Sí', 'Más tarde'],
  });

  if (result.response === 0) { // 0 = primer botón ("Sí")
    autoUpdater.quitAndInstall(); // 🔥 Cierra y actualiza
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
