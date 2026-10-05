import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { diagnoseCrop } from "@/services/ai.service"
import { saveDiagnosisReport } from "@/services/diagnosis.service"
import {
  isImageStorageConfigured,
  uploadImageFromBase64,
} from "@/services/upload.service"
import { createNotification } from "@/services/notification.service"
import { sanitizeImageUrlForDb } from "@/lib/images/parse-data-uri"
import type { SupportedLanguage } from "@/types"

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { imageBase64, cropType, description, language } = body as {
      imageBase64?: string
      cropType?: string
      description?: string
      language?: SupportedLanguage
    }

    if (!imageBase64?.trim()) {
      return NextResponse.json(
        { success: false, error: "Crop image is required" },
        { status: 400 }
      )
    }

    if (!cropType?.trim()) {
      return NextResponse.json(
        { success: false, error: "Crop type is required" },
        { status: 400 }
      )
    }

    const lang: SupportedLanguage = language ?? "en"
    const trimmedImage = imageBase64.trim()

    let imageUrl: string | undefined
    let storageProvider: string | undefined

    if (isImageStorageConfigured()) {
      try {
        const uploaded = await uploadImageFromBase64(trimmedImage, {
          folder: "agrimind/diagnosis",
          userId: user.uid,
        })
        imageUrl = sanitizeImageUrlForDb(uploaded.url)
        storageProvider = uploaded.provider
      } catch (uploadErr) {
        console.warn(
          "[ai/diagnose] Cloud upload failed, continuing diagnosis without saved photo:",
          uploadErr
        )
      }
    } else {
      console.warn(
        "[ai/diagnose] No image storage configured — diagnosis runs but photo will not appear in history"
      )
    }

    const diagnosis = await diagnoseCrop({
      imageBase64: trimmedImage,
      imageUrl,
      cropType: cropType.trim(),
      description: description?.trim(),
      language: lang,
    })

    const report = await saveDiagnosisReport({
      firebaseUid: user.uid,
      cropType: cropType.trim(),
      description: description?.trim(),
      imageUrl,
      language: lang,
      diagnosis,
    })

    const isPlant = diagnosis.isValidPlantImage !== false
    await createNotification({
      firebaseUid: user.uid,
      type: "diagnosis",
      title: isPlant ? "Diagnosis complete" : "Upload a plant photo",
      message: isPlant
        ? `${diagnosis.disease} detected on ${cropType} (${diagnosis.confidence}% confidence)`
        : `We could not analyze ${cropType} — image is not a clear plant photo.`,
      link: `/dashboard/diagnosis/history?id=${report._id}`,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      data: {
        ...diagnosis,
        reportId: String(report._id),
        imageUrl,
        storageProvider,
      },
    })
  } catch (error) {
    console.error("[ai/diagnose]", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Diagnosis failed",
      },
      { status: 500 }
    )
  }
}
