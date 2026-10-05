/**
 * One-time script to promote a Firebase user to admin in MongoDB.
 *
 * Usage:
 *   1. Create user in Firebase Auth (email/password)
 *   2. Sign up once via /login OR create in Firebase Console
 *   3. Set MONGODB_URI in .env.local
 *   4. Run: npx tsx --env-file=.env.local scripts/create-admin.ts <firebase-uid> <email> [displayName]
 *
 * Example:
 *   npx tsx --env-file=.env.local scripts/create-admin.ts abc123 admin@agrimind.ai "Admin User"
 */

import mongoose from "mongoose"
import { connectDB } from "../lib/mongodb"
import User from "../models/User"

async function main() {
  const [, , uid, email, displayName] = process.argv

  if (!uid || !email) {
    console.error(
      "Usage: npx tsx --env-file=.env.local scripts/create-admin.ts <firebaseUid> <email> [displayName]"
    )
    process.exit(1)
  }

  await connectDB()

  const user = await User.findOneAndUpdate(
    { firebaseUid: uid },
    {
      $set: {
        email: email.toLowerCase(),
        displayName: displayName ?? "Admin",
        role: "admin",
        isActive: true,
      },
      $setOnInsert: { firebaseUid: uid },
    },
    { upsert: true, new: true }
  )

  console.log("Admin user ready:", user.email, "role:", user.role, "uid:", user.firebaseUid)
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
