// Ventana de escritorio de El Último Almacén (Electron).
const { app, BrowserWindow, globalShortcut, Menu, ipcMain } = require('electron');
Menu.setApplicationMenu(null);
const path = require('path');
const coop = require('./coop-server');

// Cooperativo: el anfitrión abre un servidor en el puerto 27015.
ipcMain.handle('coop-host', async () => { try { return await coop.start(); } catch (e) { return { error: String(e && e.message || e) }; } });
ipcMain.handle('coop-stop', () => { coop.stop(); return true; });

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    minWidth: 1024,
    minHeight: 600,
    fullscreen: true,
    backgroundColor: '#0c100e',
    autoHideMenuBar: true,
    title: 'El Último Almacén',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, 'game', 'index.html'));

  // F11 alterna pantalla completa.
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      win.setFullScreen(!win.isFullScreen());
      event.preventDefault();
    }
  });
  // Los links externos no abren ventanas nuevas dentro del juego.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  coop.stop();
  globalShortcut.unregisterAll();
  app.quit();
});
