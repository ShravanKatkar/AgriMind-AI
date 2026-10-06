import {
  FARM_CROP_SEEDS,
  resolveFarmCropDates,
} from "@/lib/crops/seed-data"
import { connectDB } from "@/lib/mongodb"
import Crop, { type ICrop } from "@/models/Crop"
import CropLifecycleEvent from "@/models/CropLifecycleEvent"
import { createNotification } from "@/services/notification.service"
import type { CropStage, CropStatus } from "@/types/crop"
import type { Types } from "mongoose"

export interface CreateCropInput {
  firebaseUid: string
  name: string
  cropType: string
  variety?: string
  stage?: CropStage
  health?: number
  plantedDate: Date
  expectedHarvestDate?: Date
  area?: string
  areaUnit?: string
  location?: string
  status?: CropStatus
  waterLevel?: number
  sunExposure?: string
  nextTask?: string
  nextTaskDate?: Date
  notes?: string
  imageUrl?: string
}

export async function listCrops(firebaseUid: string): Promise<ICrop[]> {
  try {
    await connectDB()
    const crops = await Crop.find({ firebaseUid, isArchived: false })
      .sort({ updatedAt: -1 })
      .lean()
    if (crops.length > 0) return crops as ICrop[]
  } catch (err) {
    console.warn("[crop.service] DB unavailable, showing sample crops:", (err as Error).message)
  }

  // Resilient fallback to farm crop templates so the panel is never empty
  return FARM_CROP_SEEDS.map((s, idx) => {
    const dates = resolveFarmCropDates(s)
    return {
      _id: `sample-crop-${idx}` as unknown as Types.ObjectId,
      firebaseUid,
      name: s.name,
      cropType: s.cropType,
      variety: s.variety,
      stage: s.stage,
      health: s.health,
      status: s.status,
      plantedDate: dates.plantedDate,
      expectedHarvestDate: dates.expectedHarvestDate,
      area: s.area,
      areaUnit: s.areaUnit,
      location: s.location,
      waterLevel: s.waterLevel,
      sunExposure: s.sunExposure,
      nextTask: s.nextTask,
      nextTaskDate: dates.nextTaskDate,
      notes: s.notes,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as ICrop
  })
}

export async function getCropById(
  firebaseUid: string,
  cropId: string
): Promise<ICrop | null> {
  try {
    await connectDB()
    const found = await Crop.findOne({ _id: cropId, firebaseUid, isArchived: false }).lean()
    if (found) return found as ICrop
  } catch {
    // Database offline
  }

  // Check fallback sample seeds
  const seedMatch = FARM_CROP_SEEDS.find((_, idx) => `sample-crop-${idx}` === cropId)
  if (seedMatch) {
    const dates = resolveFarmCropDates(seedMatch)
    return {
      _id: cropId as unknown as Types.ObjectId,
      firebaseUid,
      name: seedMatch.name,
      cropType: seedMatch.cropType,
      variety: seedMatch.variety,
      stage: seedMatch.stage,
      health: seedMatch.health,
      status: seedMatch.status,
      plantedDate: dates.plantedDate,
      expectedHarvestDate: dates.expectedHarvestDate,
      area: seedMatch.area,
      areaUnit: seedMatch.areaUnit,
      location: seedMatch.location,
      waterLevel: seedMatch.waterLevel,
      sunExposure: seedMatch.sunExposure,
      nextTask: seedMatch.nextTask,
      nextTaskDate: dates.nextTaskDate,
      notes: seedMatch.notes,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as ICrop
  }

  return null
}

export async function createCrop(input: CreateCropInput): Promise<ICrop> {
  await connectDB()
  const crop = await Crop.create(input)

  await CropLifecycleEvent.create({
    cropId: crop._id,
    firebaseUid: input.firebaseUid,
    stage: crop.stage,
    title: `Started ${crop.cropType} — ${crop.name}`,
    description: `Crop registered at ${crop.stage} stage`,
    eventType: "stage_change",
    completed: true,
    completedAt: new Date(),
  })

  await createNotification({
    firebaseUid: input.firebaseUid,
    type: "crop",
    title: "New crop added",
    message: `${crop.name} (${crop.cropType}) was added to your farm.`,
    link: `/dashboard/crops/${crop._id}`,
  })

  return crop
}

export async function updateCrop(
  firebaseUid: string,
  cropId: string,
  updates: Partial<CreateCropInput> & { stage?: CropStage }
): Promise<ICrop | null> {
  await connectDB()
  const existing = await Crop.findOne({ _id: cropId, firebaseUid })
  if (!existing) return null

  const stageChanged =
    updates.stage && updates.stage !== existing.stage

  const crop = await Crop.findOneAndUpdate(
    { _id: cropId, firebaseUid },
    { $set: updates },
    { new: true }
  )

  if (crop && stageChanged) {
    await CropLifecycleEvent.create({
      cropId: crop._id,
      firebaseUid,
      stage: updates.stage,
      title: `Stage updated to ${updates.stage}`,
      eventType: "stage_change",
      completed: true,
      completedAt: new Date(),
    })

    await createNotification({
      firebaseUid,
      type: "crop",
      title: "Crop stage updated",
      message: `${crop.name} moved to ${updates.stage} stage.`,
      link: `/dashboard/crops/${crop._id}`,
    })
  }

  return crop
}

export async function archiveCrop(
  firebaseUid: string,
  cropId: string
): Promise<boolean> {
  await connectDB()
  const result = await Crop.updateOne(
    { _id: cropId, firebaseUid },
    { $set: { isArchived: true } }
  )
  return result.modifiedCount > 0
}

export async function getLifecycleEvents(
  firebaseUid: string,
  cropId: string
) {
  await connectDB()
  return CropLifecycleEvent.find({ firebaseUid, cropId })
    .sort({ createdAt: -1 })
    .lean()
}

export async function addLifecycleEvent(input: {
  firebaseUid: string
  cropId: Types.ObjectId | string
  title: string
  description?: string
  stage?: CropStage
  eventType?: "stage_change" | "task" | "note" | "diagnosis"
  scheduledFor?: Date
}) {
  await connectDB()
  return CropLifecycleEvent.create({
    ...input,
    completed: false,
  })
}

export async function seedSampleCropsForUser(firebaseUid: string): Promise<{
  created: number
  skipped: number
  crops: ICrop[]
}> {
  await connectDB()
  const existing = await Crop.find({ firebaseUid, isArchived: false })
    .select("name")
    .lean()
  const existingNames = new Set(existing.map((c) => c.name))

  const crops: ICrop[] = []
  let created = 0
  let skipped = 0

  for (const seed of FARM_CROP_SEEDS) {
    if (existingNames.has(seed.name)) {
      skipped++
      continue
    }

    const { plantedDate, expectedHarvestDate, nextTaskDate } =
      resolveFarmCropDates(seed)

    const crop = await createCrop({
      firebaseUid,
      name: seed.name,
      cropType: seed.cropType,
      variety: seed.variety,
      stage: seed.stage,
      health: seed.health,
      plantedDate,
      expectedHarvestDate,
      area: seed.area,
      areaUnit: seed.areaUnit,
      location: seed.location,
      status: seed.status,
      waterLevel: seed.waterLevel,
      sunExposure: seed.sunExposure,
      nextTask: seed.nextTask,
      nextTaskDate,
      notes: seed.notes,
    })

    crops.push(crop)
    existingNames.add(seed.name)
    created++
  }

  return { created, skipped, crops }
}

export async function getCropStats(firebaseUid: string) {
  try {
    await connectDB()
    const crops = await Crop.find({ firebaseUid, isArchived: false }).lean()
    if (crops.length > 0) {
      const healthy = crops.filter((c) => c.status === "healthy").length
      const warning = crops.filter((c) => c.status === "warning").length
      const critical = crops.filter((c) => c.status === "critical").length
      const avgHealth = Math.round(crops.reduce((s, c) => s + c.health, 0) / crops.length)

      return {
        total: crops.length,
        healthy,
        warning,
        critical,
        avgHealth,
        byStage: crops.reduce(
          (acc, c) => {
            acc[c.stage] = (acc[c.stage] ?? 0) + 1
            return acc
          },
          {} as Record<string, number>
        ),
      }
    }
  } catch (err) {
    console.warn("[crop.service] DB unavailable for getCropStats, computing from sample data:", (err as Error).message)
  }

  const healthy = FARM_CROP_SEEDS.filter((c) => c.status === "healthy").length
  const warning = FARM_CROP_SEEDS.filter((c) => c.status === "warning").length
  const critical = FARM_CROP_SEEDS.filter((c) => c.status === "critical").length
  const avgHealth = Math.round(
    FARM_CROP_SEEDS.reduce((s, c) => s + c.health, 0) / FARM_CROP_SEEDS.length
  )

  return {
    total: FARM_CROP_SEEDS.length,
    healthy,
    warning,
    critical,
    avgHealth,
    byStage: FARM_CROP_SEEDS.reduce(
      (acc, c) => {
        acc[c.stage] = (acc[c.stage] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    ),
  }
}
