import { connectDB } from "@/lib/mongodb"
import User, { type IUser } from "@/models/User"
import type { UserRole, SupportedLanguage } from "@/types"

export interface UpsertUserInput {
  firebaseUid: string
  email: string
  displayName: string
  photoURL?: string
  role?: UserRole
  preferredLanguage?: SupportedLanguage
}

export async function upsertUserFromAuth(
  input: UpsertUserInput
): Promise<IUser> {
  await connectDB()

  const user = await User.findOneAndUpdate(
    { firebaseUid: input.firebaseUid },
    {
      $set: {
        email: input.email,
        displayName: input.displayName,
        photoURL: input.photoURL,
        lastLoginAt: new Date(),
      },
      $setOnInsert: {
        firebaseUid: input.firebaseUid,
        role: input.role ?? "farmer",
        preferredLanguage: input.preferredLanguage ?? "en",
        primaryCrops: [],
        isActive: true,
      },
    },
    { upsert: true, new: true, runValidators: true }
  )

  return user
}

export async function getUserByFirebaseUid(
  firebaseUid: string
): Promise<IUser | null> {
  await connectDB()
  return User.findOne({ firebaseUid })
}

export async function isAdminUser(firebaseUid: string): Promise<boolean> {
  const user = await getUserByFirebaseUid(firebaseUid)
  return user?.role === "admin" && user.isActive === true
}

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  whatsapp: boolean
  push: boolean
}

export interface UpdateProfileInput {
  displayName?: string
  phone?: string
  district?: string
  farmSize?: string
  primaryCrops?: string[]
  preferredLanguage?: SupportedLanguage
  notificationPreferences?: NotificationPreferences
}

export async function updateUserProfile(
  firebaseUid: string,
  updates: UpdateProfileInput
): Promise<IUser | null> {
  await connectDB()
  return User.findOneAndUpdate(
    { firebaseUid },
    { $set: updates },
    { new: true, runValidators: true }
  ).lean()
}

export function toFarmerProfile(user: IUser) {
  return {
    uid: user.firebaseUid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL ?? null,
    phone: user.phone ?? "",
    district: user.district ?? "",
    farmSize: user.farmSize ?? "",
    primaryCrops: user.primaryCrops ?? [],
    preferredLanguage: user.preferredLanguage,
    notificationPreferences: user.notificationPreferences ?? {
      email: true,
      sms: false,
      whatsapp: true,
      push: true,
    },
    role: user.role,
    memberSince: user.createdAt,
  }
}
