/**
 * Seed 5 sample farm crops for a Firebase user in MongoDB.
 *
 * Usage (from project root, with MONGODB_URI in .env.local):
 *   npx tsx --env-file=.env.local scripts/seed-crops.ts <firebase-uid>
 *   npm run seed:crops -- <firebase-uid>
 *
 * Skips plots that already exist with the same field name for that user.
 */

import mongoose from "mongoose"
import { connectDB } from "../lib/mongodb"
import { seedSampleCropsForUser } from "../services/crop.service"

async function main() {
  const firebaseUid = process.argv[2]?.trim()
  if (!firebaseUid) {
    console.error("Usage: npm run seed:crops -- <firebase-uid>")
    process.exit(1)
  }

  await connectDB()
  const result = await seedSampleCropsForUser(firebaseUid)

  console.log(
    `Crop seed complete for ${firebaseUid}: ${result.created} created, ${result.skipped} skipped (already present).`
  )
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
