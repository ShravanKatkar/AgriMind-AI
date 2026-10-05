import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { sanitizeImageUrlForDb } from "@/lib/images/parse-data-uri"
import {
  getCropById,
  updateCrop,
  archiveCrop,
  getLifecycleEvents,
} from "@/services/crop.service"
import {
  isImageStorageConfigured,
  uploadImageFromBase64,
} from "@/services/upload.service"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const crop = await getCropById(session.uid, id)
    if (!crop) {
      return NextResponse.json({ success: false, error: "Crop not found" }, { status: 404 })
    }

    const lifecycle = await getLifecycleEvents(session.uid, id)
    return NextResponse.json({ success: true, data: { crop, lifecycle } })
  } catch (error) {
    console.error("[crops/id GET]", error)
    return NextResponse.json({ success: false, error: "Failed to load crop" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    let imageUrl = sanitizeImageUrlForDb(body.imageUrl)
    if (body.imageBase64?.trim() && isImageStorageConfigured()) {
      const uploaded = await uploadImageFromBase64(body.imageBase64.trim(), {
        folder: "agrimind/crops",
        userId: session.uid,
      })
      imageUrl = sanitizeImageUrlForDb(uploaded.url)
    }

    const { imageBase64: _drop, ...rest } = body as Record<string, unknown>
    const crop = await updateCrop(session.uid, id, {
      ...rest,
      imageUrl,
      plantedDate: body.plantedDate ? new Date(body.plantedDate) : undefined,
      expectedHarvestDate: body.expectedHarvestDate
        ? new Date(body.expectedHarvestDate)
        : undefined,
      nextTaskDate: body.nextTaskDate ? new Date(body.nextTaskDate) : undefined,
    })

    if (!crop) {
      return NextResponse.json({ success: false, error: "Crop not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: crop })
  } catch (error) {
    console.error("[crops/id PATCH]", error)
    return NextResponse.json({ success: false, error: "Failed to update crop" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const ok = await archiveCrop(session.uid, id)
    if (!ok) {
      return NextResponse.json({ success: false, error: "Crop not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[crops/id DELETE]", error)
    return NextResponse.json({ success: false, error: "Failed to delete crop" }, { status: 500 })
  }
}
