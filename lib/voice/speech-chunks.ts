import { stripMarkdownForSpeech } from "@/lib/chat/format-message"

const MAX_CHUNK_CHARS = 280
const FIRST_CHUNK_MAX = 200
/** Browser TTS practical limit per session */
const MAX_SPEECH_CHARS = 12_000

/** Full plain reply for speech (no markdown, no early cut-off) */
export function prepareSpeechText(text: string): string {
  const plain = stripMarkdownForSpeech(text)
  if (!plain) return ""
  if (plain.length <= MAX_SPEECH_CHARS) return plain
  return plain.slice(0, MAX_SPEECH_CHARS)
}

/** First sentence for early prefetch */
export function extractFirstSpeechChunk(text: string): string | null {
  const plain = prepareSpeechText(text)
  if (!plain) return null

  const match = plain.match(/^[\s\S]{20,}?[.!?।॥]\s*/)
  if (match?.[0]?.trim()) {
    return match[0].trim().slice(0, FIRST_CHUNK_MAX)
  }
  if (plain.length >= 40) {
    return plain.slice(0, FIRST_CHUNK_MAX).trim()
  }
  return null
}

export function hasSpeakableSentence(text: string): boolean {
  return extractFirstSpeechChunk(text) !== null
}

/** Split plain text into chunks — reads the full reply in order */
export function splitSpeechChunks(plainText: string): string[] {
  const plain = plainText.trim()
  if (!plain) return []

  const parts = plain
    .split(/(?<=[.!?।॥])\s+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const chunks: string[] = []
  let buffer = ""

  const flush = () => {
    const t = buffer.trim()
    if (t) chunks.push(t)
    buffer = ""
  }

  for (const part of parts.length ? parts : [plain]) {
    if (!buffer) {
      buffer = part
    } else if (`${buffer} ${part}`.length <= MAX_CHUNK_CHARS) {
      buffer = `${buffer} ${part}`
    } else {
      flush()
      buffer = part
    }
    if (buffer.length >= MAX_CHUNK_CHARS) flush()
  }
  flush()

  if (chunks.length === 0) return [plain]
  return chunks
}
