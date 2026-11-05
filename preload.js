// Puente mínimo entre el juego y Electron: solo abre o cierra el servidor del cooperativo.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('coopNet', {
  host: () => ipcRenderer.invoke('coop-host'),
  stop: () => ipcRenderer.invoke('coop-stop'),
});
