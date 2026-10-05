import { randomUUID } from "crypto"
import { getCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary/client"
import {
  getFirebaseStorageBucket,
  isFirebaseStorageConfigured,
  uploadBufferToFirebaseStorage,
  buildStorageObjectPath,
} from "@/lib/firebase/storage-admin"
import {
  parseImageBase64,
  toDataUri,
  type ParsedImage,
} from "@/lib/images/parse-data-uri"

export type ImageStorageProvider = "cloudinary" | "firebase"

export type UploadImageResult = {
  url: string
  provider: ImageStorageProvider
}

export function isImageStorageConfigured(): boolean {
  return isCloudinaryConfigured() || isFirebaseStorageConfigured()
}

export function getImageStorageStatus(): {
  ready: boolean
  cloudinary: boolean
  firebase: boolean
  bucket?: string
} {
  return {
    ready: isImageStorageConfigured(),
    cloudinary: isCloudinaryConfigured(),
    firebase: isFirebaseStorageConfigured(),
    bucket: getFirebaseStorageBucket() ?? undefined,
  }
}

async function uploadToCloudinary(
  parsed: ParsedImage,
  folder: string
): Promise<string> {
  const cloudinary = getCloudinary()
  const dataUri = toDataUri(parsed)
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    public_id: `${Date.now()}-${randomUUID().slice(0, 8)}`,
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  })
  if (!result.secure_url) {
    throw new Error("Cloudinary did not return a URL")
  }
  return result.secure_url
}

/**
 * Upload base64 / data-URI image to cloud storage and return HTTPS URL for MongoDB.
 * Tries Cloudinary first, then Firebase Storage.
 */
export async function uploadImageFromBase64(
  imageBase64: string,
  options?: {
    folder?: string
    userId?: string
  }
): Promise<UploadImageResult> {
  const parsed = parseImageBase64(imageBase64)
  const folder = options?.folder ?? "agrimind/uploads"
  const userId = options?.userId ?? "anonymous"

  if (isCloudinaryConfigured()) {
    try {
      const url = await uploadToCloudinary(parsed, folder)
      return { url, provider: "cloudinary" }
    } catch (err) {
      console.error("[upload] Cloudinary failed:", err)
      if (!isFirebaseStorageConfigured()) throw err
    }
  }

  if (isFirebaseStorageConfigured()) {
    const objectPath = buildStorageObjectPath(
      folder,
      userId,
      parsed.extension
    )
    const url = await uploadBufferToFirebaseStorage(
      parsed.buffer,
      objectPath,
      parsed.mime
    )
    return { url, provider: "firebase" }
  }

  throw new Error(
    "Image storage is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET — or set FIREBASE_STORAGE_BUCKET with Firebase Admin keys — in .env.local and Vercel."
  )
}

/** @deprecated Use uploadImageFromBase64 — returns URL only */
export async function uploadCropImage(
  imageBase64: string,
  folder = "agrimind/crops",
  userId?: string
): Promise<string | null> {
  try {
    const result = await uploadImageFromBase64(imageBase64, { folder, userId })
    return result.url
  } catch (err) {
    console.error("[uploadCropImage]", err)
    return null
  }
}
