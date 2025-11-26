const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const FileType = require("file-type");

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";
function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    win.webContents.openDevTools();
  }
  win.removeMenu();
  win.loadFile(path.join(__dirname, "./renderer/index.html"));
}

app.whenReady().then(() => {
  console.log("Saving chunks to:", path.join(__dirname, "./audios"));
  createWindow();
});

// Save chunk handler
ipcMain.on("save-chunk", async (event, uint8, index, chunkTimestamp) => {
  console.log("uint8: ", Buffer.from(uint8));
  const baseDir = path.join(__dirname, "./audios");

  // Create base dir if not exists
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  // Chunk filename
  const fileName = `chunk_${chunkTimestamp}_${String(index).padStart(
    3,
    "0"
  )}.webm`;

  const filePath = path.join(baseDir, fileName);
  const filetypeData = await FileType.fromBuffer(Buffer.from(uint8));
  console.log("filetypeData: ", filetypeData);

  fs.writeFile(filePath, Buffer.from(uint8), (err) => {
    if (err) {
      console.error("Error saving chunk:", err);
    } else {
      console.log("Saved chunk:", fileName);
    }
  });
});
