const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveChunk: (data, index) => ipcRenderer.invoke("saveChunk", data, index),
});
