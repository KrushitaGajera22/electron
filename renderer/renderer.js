let mediaRecorder;
let chunkIndex = 1;
let chunkTimer;

document.getElementById("start").onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  mediaRecorder = new MediaRecorder(stream, {
    mimeType: "audio/webm;codecs=opus",
  });

  // Called whenever we ask for data
  mediaRecorder.ondataavailable = async (e) => {
    if (e.data.size > 0) {
      const arrayBuf = await e.data.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuf);

      window.electronAPI.saveChunk(uint8, chunkIndex);

      console.log("Chunk saved:", chunkIndex);
      chunkIndex++;
    }
  };

  // Start continuous recording (no auto-chunk)
  mediaRecorder.start();
  console.log("Recording started...");

  // Every 30 seconds, ask for a new chunk
  chunkTimer = setInterval(() => {
    if (mediaRecorder.state === "recording") {
      mediaRecorder.requestData();
    }
  }, 30000);
};

document.getElementById("stop").onclick = () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    clearInterval(chunkTimer);
    mediaRecorder.stop();
    console.log("Recording stopped");
  }
};
