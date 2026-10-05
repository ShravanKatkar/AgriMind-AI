export type ParsedImage = {
  buffer: Buffer
  mime: string
  extension: string
}

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
}

export function parseImageBase64(imageBase64: string): ParsedImage {
  const trimmed = imageBase64.trim()

  if (trimmed.startsWith("data:")) {
    const match = /^data:([^;]+);base64,(.+)$/s.exec(trimmed)
    if (!match) {
      throw new Error("Invalid image data URI")
    }
    const mime = match[1] ?? "image/jpeg"
    const base64 = match[2].replace(/\s/g, "")
    const buffer = Buffer.from(base64, "base64")
    if (buffer.length < 100) {
      throw new Error("Image file is too small")
    }
    return {
      buffer,
      mime,
      extension: MIME_TO_EXT[mime] ?? "jpg",
    }
  }

  const buffer = Buffer.from(trimmed.replace(/\s/g, ""), "base64")
  if (buffer.length < 100) {
    throw new Error("Invalid image data")
  }
  return {
    buffer,
    mime: "image/jpeg",
    extension: "jpg",
  }
}

export function toDataUri(parsed: ParsedImage): string {
  return `data:${parsed.mime};base64,${parsed.buffer.toString("base64")}`
}

/** MongoDB should only store https URLs — never raw base64 */
export function isStorableImageUrl(value?: string | null): value is string {
  if (!value?.trim()) return false
  const v = value.trim()
  if (v.startsWith("data:")) return false
  if (v.length > 2048) return false
  return v.startsWith("https://") || v.startsWith("http://")
}

export function sanitizeImageUrlForDb(
  value?: string | null
): string | undefined {
  return isStorableImageUrl(value) ? value.trim() : undefined
}
