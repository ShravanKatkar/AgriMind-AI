import { randomUUID } from "crypto"
import { getStorage } from "firebase-admin/storage"
import { getAdminApp } from "@/lib/firebase/admin"

export function isFirebaseStorageConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      process.env.FIREBASE_ADMIN_PRIVATE_KEY &&
      getFirebaseStorageBucket()
  )
}

export function getFirebaseStorageBucket(): string | null {
  return (
    process.env.FIREBASE_STORAGE_BUCKET ??
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    (process.env.FIREBASE_ADMIN_PROJECT_ID
      ? `${process.env.FIREBASE_ADMIN_PROJECT_ID}.appspot.com`
      : null)
  )
}

/** Upload image bytes to Firebase Storage and return a public/signed HTTPS URL */
export async function uploadBufferToFirebaseStorage(
  buffer: Buffer,
  objectPath: string,
  contentType: string
): Promise<string> {
  const bucketName = getFirebaseStorageBucket()
  if (!bucketName) {
    throw new Error("Firebase Storage bucket is not configured")
  }

  const bucket = getStorage(getAdminApp()).bucket(bucketName)
  const file = bucket.file(objectPath)

  await file.save(buffer, {
    metadata: {
      contentType,
      cacheControl: "public, max-age=31536000, immutable",
    },
    resumable: false,
  })

  try {
    await file.makePublic()
    return `https://storage.googleapis.com/${bucketName}/${objectPath}`
  } catch {
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 10 * 365 * 24 * 60 * 60 * 1000,
    })
    return signedUrl
  }
}

export function buildStorageObjectPath(
  folder: string,
  userId: string,
  extension: string
): string {
  const safeFolder = folder.replace(/^\//, "").replace(/\/$/, "")
  const safeUser = userId.replace(/[^a-zA-Z0-9_-]/g, "_")
  return `${safeFolder}/${safeUser}/${Date.now()}-${randomUUID().slice(0, 8)}.${extension}`
}
