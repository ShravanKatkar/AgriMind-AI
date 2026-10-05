import { MONGODB_DATABASE_NAME } from "@/lib/constants"
import { normalizeMongoEnvUri } from "@/lib/mongodb-uri"

/**
 * MongoDB connection string from environment.
 * Set MONGODB_URI in `.env.local` (never commit real passwords).
 *
 * Atlas cluster: agrimind-ai.xyt2joj.mongodb.net
 * Example: mongodb+srv://USER:PASS@agrimind-ai.xyt2joj.mongodb.net/?appName=AgriMind-AI
 */
export function getMongoConnectionUri(): string {
  const raw = process.env.MONGODB_URI?.trim()
  if (!raw) {
    throw new Error(
      "MONGODB_URI is missing. Add it to .env.local (see .env.example), then restart npm run dev."
    )
  }
  return normalizeMongoEnvUri(raw)
}

export function getMongoDatabaseName(): string {
  return MONGODB_DATABASE_NAME
}
