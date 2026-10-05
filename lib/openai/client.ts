import OpenAI from "openai"
import { assertOpenAIConfigured, openaiConfig } from "./config"

let client: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  assertOpenAIConfigured()
  if (!client) {
    client = new OpenAI({
      apiKey: openaiConfig.apiKey,
      baseURL: openaiConfig.baseURL,
    })
  }
  return client
}

export { openaiConfig }
