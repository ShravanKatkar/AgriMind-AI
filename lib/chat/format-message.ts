/**
 * Convert assistant markdown to plain words for text-to-speech.
 * Strips #, *, bullets, links, etc. so the voice reads only the message.
 */
export function stripMarkdownForSpeech(text: string): string {
  let s = text.replace(/\r\n/g, "\n")

  // Code blocks (skip code — often not useful aloud)
  s = s.replace(/```[\s\S]*?```/g, " ")
  s = s.replace(/`([^`]+)`/g, "$1")

  // Images and links → label text only
  s = s.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
  s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
  s = s.replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1")

  // HTML tags
  s = s.replace(/<[^>]+>/g, " ")

  // Headings at line start (### Title)
  s = s.replace(/^#{1,6}\s+/gm, "")

  // Bold / italic (repeat for nested)
  for (let i = 0; i < 3; i++) {
    s = s.replace(/\*\*\*([^*]+)\*\*\*/g, "$1")
    s = s.replace(/\*\*([^*]+)\*\*/g, "$1")
    s = s.replace(/\*([^*\n]+)\*/g, "$1")
    s = s.replace(/___([^_]+)___/g, "$1")
    s = s.replace(/__([^_\n]+)__/g, "$1")
    s = s.replace(/_([^_\n]+)_/g, "$1")
    s = s.replace(/~~([^~]+)~~/g, "$1")
  }

  // Blockquotes and list markers
  s = s.replace(/^>\s?/gm, "")
  s = s.replace(/^\s*[-*+•]\s+/gm, "")
  s = s.replace(/^\s*\d+[.)]\s+/gm, "")

  // Horizontal rules
  s = s.replace(/^[-*_]{3,}\s*$/gm, " ")

  // Tables: pipe cells → spaces
  s = s.replace(/\|/g, " ")

  // Leftover markdown symbols TTS often reads aloud
  s = s.replace(/[#*_`~\\]/g, " ")
  s = s.replace(/\[|\]|\(|\)/g, " ")

  // Bare URLs (hard to listen to)
  s = s.replace(/https?:\/\/\S+/gi, " ")

  // Line breaks → pauses
  s = s.replace(/\n{2,}/g, ". ")
  s = s.replace(/\n/g, " ")
  s = s.replace(/\s+/g, " ")

  return s.trim()
}

/** Plain text for TTS; optional cap for very long chat messages */
export function textForSpeech(text: string, maxChars?: number): string {
  const plain = stripMarkdownForSpeech(text)
  if (!maxChars || plain.length <= maxChars) return plain
  return `${plain.slice(0, maxChars)}`
}
