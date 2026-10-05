import mongoose from "mongoose"
import { atlasDnsLookup } from "../lib/mongodb-dns"

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error("FAIL: MONGODB_URI not set in .env.local")
    process.exit(1)
  }

  const host = uri.match(/@([^/]+)/)?.[1] ?? "unknown"
  console.log(`Connecting to cluster: ${host}`)

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
      lookup: atlasDnsLookup,
    } as mongoose.ConnectOptions)
    const dbName = mongoose.connection.db?.databaseName
    const collections = await mongoose.connection.db?.listCollections().toArray()
    console.log("OK: MongoDB connected")
    console.log(`Database: ${dbName}`)
    console.log(`Collections: ${collections?.length ?? 0}`)
    await mongoose.disconnect()
  } catch (err) {
    const e = err as Error & { code?: string; cause?: Error }
    console.error("FAIL:", e.message)
    if (e.message.includes("authentication failed") || e.message.includes("bad auth")) {
      console.error("Hint: Check Database Access username/password in Atlas matches MONGODB_URI")
    } else if (e.message.includes("whitelist") || e.message.includes("IP")) {
      console.error("Hint: Atlas → Network Access → ensure 0.0.0.0/0 is Active (can take 1–2 min)")
    } else if (e.message.includes("querySrv")) {
      console.error("Hint: DNS issue — restart dev server after saving .env.local")
    }
    process.exit(1)
  }
}

main()
