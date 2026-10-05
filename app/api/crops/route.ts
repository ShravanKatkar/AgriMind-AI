import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth/session"
import { sanitizeImageUrlForDb } from "@/lib/images/parse-data-uri"
import { listCrops, createCrop } from "@/services/crop.service"
import {
  isImageStorageConfigured,
  uploadImageFromBase64,
} from "@/services/upload.service"

export async function GET() {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const crops = await listCrops(session.uid)
    return NextResponse.json({ success: true, data: crops })
  } catch (error) {
    console.error("[crops GET]", error)
    return NextResponse.json({ success: false, error: "Failed to load crops" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    if (!body.name?.trim() || !body.cropType?.trim()) {
      return NextResponse.json(
        { success: false, error: "Name and crop type are required" },
        { status: 400 }
      )
    }

    let imageUrl = sanitizeImageUrlForDb(body.imageUrl)

    if (body.imageBase64?.trim() && isImageStorageConfigured()) {
      const uploaded = await uploadImageFromBase64(body.imageBase64.trim(), {
        folder: "agrimind/crops",
        userId: session.uid,
      })
      imageUrl = sanitizeImageUrlForDb(uploaded.url)
    }

    const crop = await createCrop({
      firebaseUid: session.uid,
      name: body.name.trim(),
      cropType: body.cropType.trim(),
      variety: body.variety,
      stage: body.stage ?? "preparation",
      health: body.health ?? 100,
      plantedDate: new Date(body.plantedDate ?? Date.now()),
      expectedHarvestDate: body.expectedHarvestDate
        ? new Date(body.expectedHarvestDate)
        : undefined,
      area: body.area ?? "1",
      areaUnit: body.areaUnit ?? "acres",
      location: body.location,
      status: body.status ?? "healthy",
      waterLevel: body.waterLevel ?? 70,
      sunExposure: body.sunExposure ?? "Full sun",
      nextTask: body.nextTask,
      nextTaskDate: body.nextTaskDate ? new Date(body.nextTaskDate) : undefined,
      notes: body.notes,
      imageUrl,
    })

    return NextResponse.json({ success: true, data: crop }, { status: 201 })
  } catch (error) {
    console.error("[crops POST]", error)
    return NextResponse.json({ success: false, error: "Failed to create crop" }, { status: 500 })
  }
}
