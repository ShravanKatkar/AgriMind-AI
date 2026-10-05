export const openaiConfig = {
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
  chatModel: process.env.GROQ_CHAT_MODEL ?? "openai/gpt-oss-120b",
  visionModel: process.env.GROQ_VISION_MODEL ?? "qwen/qwen3.8-27b",
  maxTokens: Number(process.env.GROQ_MAX_TOKENS ?? 1500),
  // TTS is now handled client-side via browser Web Speech API
  ttsModel: "browser-native",
  ttsVoice: (process.env.GROQ_TTS_VOICE ?? "nova") as
    | "alloy"
    | "echo"
    | "fable"
    | "onyx"
    | "nova"
    | "shimmer",
}

export function assertOpenAIConfigured() {
  if (!openaiConfig.apiKey) {
    throw new Error("GROQ_API_KEY is not set in .env.local — get a free key at https://console.groq.com")
  }
}
