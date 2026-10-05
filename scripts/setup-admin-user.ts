/**
 * Create or update Firebase admin user + MongoDB admin role.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/setup-admin-user.ts [email] [password] [displayName]
 *
 * Example:
 *   npx tsx --env-file=.env.local scripts/setup-admin-user.ts admin@gamil.com admin "Admin User"
 */

import mongoose from "mongoose"
import { getAdminAuth } from "../lib/firebase/admin"
import { connectDB } from "../lib/mongodb"
import User from "../models/User"

async function main() {
  const email = (process.argv[2] ?? "admin@gamil.com").trim().toLowerCase()
  const password = process.argv[3] ?? "admin"
  const displayName = process.argv[4] ?? "Admin User"

  if (password.length < 6) {
    console.error("Password must be at least 6 characters (Firebase rule).")
    process.exit(1)
  }

  const auth = getAdminAuth()
  let firebaseUser

  try {
    firebaseUser = await auth.getUserByEmail(email)
    await auth.updateUser(firebaseUser.uid, { password, displayName })
    console.log("Updated Firebase user:", firebaseUser.uid, email)
  } catch (err: unknown) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: string }).code)
        : ""
    if (code === "auth/user-not-found") {
      firebaseUser = await auth.createUser({
        email,
        password,
        displayName,
      })
      console.log("Created Firebase user:", firebaseUser.uid, email)
    } else {
      throw err
    }
  }

  await connectDB()

  const user = await User.findOneAndUpdate(
    { firebaseUid: firebaseUser.uid },
    {
      $set: {
        email,
        displayName,
        role: "admin",
        isActive: true,
      },
      $setOnInsert: { firebaseUid: firebaseUser.uid },
    },
    { upsert: true, new: true }
  )

  console.log("MongoDB admin ready:", user.email, "role:", user.role)
  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
