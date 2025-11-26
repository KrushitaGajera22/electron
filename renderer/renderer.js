let mediaRecorder;
let chunkIndex = 1;

function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, "-");
}

document.getElementById("start").onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      sampleRate: 48000,
      channelCount: 1,
    },
  });

  let options = {};
  mediaRecorder = new MediaRecorder(stream, options);
  let headerChunk = null;

  mediaRecorder.ondataavailable = async (e) => {
    if (e.data.size > 0) {
      const arrayBuf = await e.data.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuf);

      if (chunkIndex === 1) {
        headerChunk = uint8; // save first chunk header
      }

      let finalChunk = uint8;

      // For chunks after first → prepend header
      if (chunkIndex > 1 && headerChunk) {
        const combined = new Uint8Array(headerChunk.length + uint8.length);
        combined.set(headerChunk, 0);
        combined.set(uint8, headerChunk.length);
        finalChunk = combined;
      }

      const chunkTimestamp = getTimestamp();
      window.electronAPI.saveChunk(finalChunk, chunkIndex, chunkTimestamp);
      console.log("Chunk saved:", chunkIndex);

      chunkIndex++;
    }
  };
  console.log("Recording started...");
  mediaRecorder.start(30000); // <-- FIX: automatic 30-sec chunks
};

document.getElementById("stop").onclick = () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    console.log("Recording stopped.");
  }
};
