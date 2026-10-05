/**
 * List databases/collections and document counts on the configured cluster.
 * Usage: npx tsx --env-file=.env.local scripts/inspect-db.ts
 */
import mongoose from "mongoose"
import { connectDB } from "../lib/mongodb"

async function main() {
  await connectDB()
  const db = mongoose.connection.db
  if (!db) {
    console.error("FAIL: no database handle")
    process.exit(1)
  }

  const dbName = db.databaseName
  console.log("Connected database:", dbName)

  const admin = mongoose.connection.getClient().db().admin()
  const { databases } = await admin.listDatabases()
  console.log("\nAll databases on cluster:")
  for (const d of databases) {
    const sizeKb = d.sizeOnDisk ? (d.sizeOnDisk / 1024).toFixed(1) : "0"
    console.log(`  - ${d.name} (${sizeKb} KB)`)
  }

  const collections = await db.listCollections().toArray()
  console.log(`\nCollections in "${dbName}":`)
  if (collections.length === 0) {
    console.log("  (none yet — log in via the app to create users)")
  } else {
    for (const c of collections) {
      const count = await db.collection(c.name).countDocuments()
      console.log(`  - ${c.name}: ${count} documents`)
    }
  }

  await mongoose.disconnect()
  process.exit(0)
}

main().catch((e) => {
  console.error("FAIL:", e.message)
  process.exit(1)
})
