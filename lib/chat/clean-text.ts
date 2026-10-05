/**
 * Utility to remove asterisks from AI generated text across all chats, voice, and services.
 */
export function stripAsterisks(text: string): string {
  if (!text) return ""
  return text
    .replace(/^(\s*)\*\s+/gm, "$1- ")
    .replace(/\*{1,3}([\s\S]*?)\*{1,3}/g, (_match, content) => content)
    .replace(/\*/g, "")
}

/** Recursively strips asterisks from strings in objects or arrays (used for diagnosis/market payloads) */
export function deepStripAsterisks<T>(obj: T): T {
  if (typeof obj === "string") {
    return stripAsterisks(obj) as unknown as T
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => deepStripAsterisks(item)) as unknown as T
  }
  if (obj !== null && typeof obj === "object") {
    const cleaned: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      cleaned[key] = deepStripAsterisks(value)
    }
    return cleaned as T
  }
  return obj
}
