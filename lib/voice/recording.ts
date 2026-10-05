/** File extension for MediaRecorder MIME type */
export function audioFilenameForMime(mime: string): string {
  if (mime.includes("mp4") || mime.includes("m4a")) return "recording.m4a"
  if (mime.includes("ogg")) return "recording.ogg"
  if (mime.includes("wav")) return "recording.wav"
  return "recording.webm"
}

export function pickAudioMimeType(): string {
  if (typeof MediaRecorder !== "undefined") {
    if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
      return "audio/webm;codecs=opus"
    }
    if (MediaRecorder.isTypeSupported("audio/webm")) return "audio/webm"
    if (MediaRecorder.isTypeSupported("audio/mp4")) return "audio/mp4"
  }
  return "audio/webm"
}
