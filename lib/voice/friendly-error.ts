const FRIENDLY_FALLBACK =
  "Sorry, I couldn't answer right now. Please try again in a moment."

export function voiceAssistantErrorMessage(raw?: string): string {
  if (!raw?.trim()) return FRIENDLY_FALLBACK

  const msg = raw.toLowerCase()

  if (msg.includes("unauthorized") || msg.includes("sign in")) {
    return "Your session expired. Please refresh the page and sign in again."
  }
  if (
    msg.includes("network") ||
    msg.includes("fetch") ||
    msg.includes("failed to fetch")
  ) {
    return "Connection problem. Check your internet, then tap Send to try again."
  }
  if (msg.includes("empty response") || msg.includes("empty")) {
    return "I didn't get a clear answer. Try asking your question in simpler words."
  }
  if (msg.includes("rate limit") || msg.includes("busy")) {
    return "The AI is busy right now. Wait a few seconds and try again."
  }
  if (msg.includes("timeout") || msg.includes("timed out")) {
    return "That took too long. Please try again with a shorter question."
  }
  if (msg.includes("openai") || msg.includes("api key")) {
    return "Voice assistant is temporarily unavailable. Please try again later."
  }

  return FRIENDLY_FALLBACK
}
