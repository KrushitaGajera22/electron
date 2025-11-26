const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  saveChunk: (data, index, chunkTimestamp) =>
    ipcRenderer.send("save-chunk", data, index, chunkTimestamp),
});
