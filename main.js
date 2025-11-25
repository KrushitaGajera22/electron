const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(__dirname, "./renderer/index.html"));
}

app.whenReady().then(() => {
  console.log("Saving chunks to:", app.getPath("userData"));
  createWindow();
});

// Save chunk handler
ipcMain.handle("saveChunk", async (event, uint8, index) => {
  try {
    const buffer = Buffer.from(uint8);

    const saveDir = path.join(__dirname, "./audios");
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir, { recursive: true });
    }

    const filePath = path.join(saveDir, `chunk_${index}.webm`);
    await fs.promises.writeFile(filePath, buffer);

    console.log("Saved:", filePath);
    return true;
  } catch (err) {
    console.error("Error saving chunk:", err);
    return false;
  }
});
