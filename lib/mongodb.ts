import mongoose from "mongoose"
import { atlasDnsLookup } from "@/lib/mongodb-dns"
import { getMongoConnectionUri } from "@/lib/env/mongodb"
import { resolveMongoUri } from "@/lib/mongodb-uri"

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
  envUri: string | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
  envUri: null,
}

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

const connectOptions = {
  bufferCommands: false,
  serverSelectionTimeoutMS: 4000,
  lookup: atlasDnsLookup,
} as mongoose.ConnectOptions

let lastFailureTime = 0
const FAILURE_COOLDOWN_MS = 15000

export function isMongoConnected(): boolean {
  return mongoose.connection.readyState === 1
}

export async function connectDB(): Promise<typeof mongoose> {
  const envUri = getMongoConnectionUri()

  if (cached.envUri && cached.envUri !== envUri) {
    cached.conn = null
    cached.promise = null
    lastFailureTime = 0
    await mongoose.disconnect().catch(() => {})
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn
  }

  // If a recent connection attempt failed, fail fast during cooldown to prevent request hangs
  if (Date.now() - lastFailureTime < FAILURE_COOLDOWN_MS) {
    throw new Error(
      "MongoDB connection temporarily unavailable (cooling down after recent failure)"
    )
  }

  if (!cached.promise) {
    cached.envUri = envUri
    cached.promise = (async () => {
      try {
        const resolved = await resolveMongoUri(envUri)
        const conn = await mongoose.connect(resolved, connectOptions)
        lastFailureTime = 0
        return conn
      } catch (err) {
        lastFailureTime = Date.now()
        cached.promise = null
        cached.conn = null
        throw err
      }
    })()
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (err) {
    cached.promise = null
    cached.conn = null
    throw err
  }
}

