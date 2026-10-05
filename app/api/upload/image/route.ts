import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import {
  isImageStorageConfigured,
  uploadImageFromBase64,
} from "@/services/upload.service"
import { sanitizeImageUrlForDb } from "@/lib/images/parse-data-uri"

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (!isImageStorageConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Image storage is not configured. Add Cloudinary keys or Firebase Storage bucket to your environment variables.",
        },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { imageBase64, folder } = body as {
      imageBase64?: string
      folder?: string
    }

    if (!imageBase64?.trim()) {
      return NextResponse.json(
        { success: false, error: "Image data is required" },
        { status: 400 }
      )
    }

    const result = await uploadImageFromBase64(imageBase64.trim(), {
      folder: folder ?? "agrimind/uploads",
      userId: user.uid,
    })

    const url = sanitizeImageUrlForDb(result.url)
    if (!url) {
      return NextResponse.json(
        { success: false, error: "Upload did not return a valid URL" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { url, provider: result.provider },
    })
  } catch (error) {
    console.error("[upload/image]", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Image upload failed",
      },
      { status: 500 }
    )
  }
}
