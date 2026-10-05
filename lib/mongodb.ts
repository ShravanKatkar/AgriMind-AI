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
  serverSelectionTimeoutMS: 20000,
  lookup: atlasDnsLookup,
} as mongoose.ConnectOptions

export async function connectDB(): Promise<typeof mongoose> {
  const envUri = getMongoConnectionUri()

  if (cached.envUri && cached.envUri !== envUri) {
    cached.conn = null
    cached.promise = null
    await mongoose.disconnect().catch(() => {})
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.envUri = envUri
    cached.promise = (async () => {
      const resolved = await resolveMongoUri(envUri)
      return mongoose.connect(resolved, connectOptions)
    })()
  }

  cached.conn = await cached.promise
  return cached.conn
}
