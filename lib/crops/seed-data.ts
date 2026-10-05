import type { CropStage, CropStatus } from "@/types/crop"

/** Farmer crop plot templates — dates resolved from “today” when seeding */
export interface FarmCropSeed {
  name: string
  cropType: string
  variety?: string
  stage: CropStage
  health: number
  status: CropStatus
  /** Days before today */
  plantedDaysAgo: number
  /** Days after today */
  harvestDaysAhead?: number
  area: string
  areaUnit: "acres" | "hectares" | "perches"
  location: string
  waterLevel: number
  sunExposure: string
  nextTask: string
  nextTaskDaysAhead?: number
  notes?: string
}

export const FARM_CROP_SEEDS: FarmCropSeed[] = [
  {
    name: "Tomato Field — Pune Baramati Plot A",
    cropType: "Tomato",
    variety: "Abhinav Hybrid",
    stage: "flowering",
    health: 88,
    status: "healthy",
    plantedDaysAgo: 96,
    harvestDaysAhead: 11,
    area: "0.75",
    areaUnit: "acres",
    location: "Baramati, Pune, Maharashtra",
    waterLevel: 72,
    sunExposure: "Full sun (6–8 hrs)",
    nextTask: "Calcium spray for blossom-end rot",
    nextTaskDaysAhead: 3,
    notes:
      "Mulched beds; drip irrigation every 2 days. Wholesale reference ~₹32/kg at Pune APMC.",
  },
  {
    name: "Basmati Rice — Karnal Plot",
    cropType: "Rice",
    variety: "Pusa Basmati 1121",
    stage: "growing",
    health: 92,
    status: "healthy",
    plantedDaysAgo: 183,
    harvestDaysAhead: 90,
    area: "2.5",
    areaUnit: "acres",
    location: "Karnal, Haryana",
    waterLevel: 85,
    sunExposure: "Full sun",
    nextTask: "Top-dress urea at active tillering",
    nextTaskDaysAhead: 5,
    notes: "Paddy under canal irrigation; monitor leaf folder in late tillering.",
  },
  {
    name: "Red Onion — Lasalgaon Plot",
    cropType: "Onion",
    variety: "Gavran Red Onion",
    stage: "growing",
    health: 76,
    status: "warning",
    plantedDaysAgo: 73,
    harvestDaysAhead: 34,
    area: "1.2",
    areaUnit: "acres",
    location: "Lasalgaon, Nashik, Maharashtra",
    waterLevel: 58,
    sunExposure: "Full sun",
    nextTask: "Inspect for thrips; neem spray if count rises",
    nextTaskDaysAhead: 1,
    notes:
      "Some leaf curling observed — likely thrips. Market demand high (~₹26/kg reference).",
  },
  {
    name: "Kolhapur Lavangi Chili — Shirol",
    cropType: "Chili",
    variety: "Lavangi Hot",
    stage: "fruiting",
    health: 81,
    status: "healthy",
    plantedDaysAgo: 112,
    harvestDaysAhead: 19,
    area: "0.5",
    areaUnit: "acres",
    location: "Shirol, Kolhapur, Maharashtra",
    waterLevel: 65,
    sunExposure: "Full sun",
    nextTask: "Pick ripe red pods; shade-dry on tarpaulins",
    nextTaskDaysAhead: 2,
    notes: "First flush harvesting; avoid overhead irrigation during fruit set.",
  },
  {
    name: "Coconut Grove — Konkan Ratnagiri",
    cropType: "Coconut",
    variety: "Pratap Hybrid",
    stage: "fruiting",
    health: 95,
    status: "healthy",
    plantedDaysAgo: 3650,
    harvestDaysAhead: 45,
    area: "3",
    areaUnit: "acres",
    location: "Ratnagiri, Konkan, Maharashtra",
    waterLevel: 70,
    sunExposure: "Full sun",
    nextTask: "Collect fallen nuts; apply fertilizer ring per palm",
    nextTaskDaysAhead: 8,
    notes:
      "~120 bearing palms. Monthly farm gate buyer visit; nut price reference ~₹28/nut.",
  },
]

export function resolveFarmCropDates(seed: FarmCropSeed, base = new Date()) {
  const plantedDate = new Date(base)
  plantedDate.setHours(12, 0, 0, 0)
  plantedDate.setDate(plantedDate.getDate() - seed.plantedDaysAgo)

  let expectedHarvestDate: Date | undefined
  if (seed.harvestDaysAhead != null) {
    expectedHarvestDate = new Date(base)
    expectedHarvestDate.setHours(12, 0, 0, 0)
    expectedHarvestDate.setDate(
      expectedHarvestDate.getDate() + seed.harvestDaysAhead
    )
  }

  let nextTaskDate: Date | undefined
  if (seed.nextTaskDaysAhead != null) {
    nextTaskDate = new Date(base)
    nextTaskDate.setHours(12, 0, 0, 0)
    nextTaskDate.setDate(nextTaskDate.getDate() + seed.nextTaskDaysAhead)
  }

  return { plantedDate, expectedHarvestDate, nextTaskDate }
}

/** Values for the Add Crop form (ISO date strings) */
export function farmCropSeedToFormValues(seed: FarmCropSeed, base = new Date()) {
  const { plantedDate, expectedHarvestDate, nextTaskDate } =
    resolveFarmCropDates(seed, base)

  return {
    name: seed.name,
    cropType: seed.cropType,
    stage: seed.stage,
    health: seed.health,
    plantedDate: plantedDate.toISOString().slice(0, 10),
    expectedHarvestDate: expectedHarvestDate?.toISOString().slice(0, 10) ?? "",
    area: seed.area,
    areaUnit: seed.areaUnit,
    location: seed.location,
    status: seed.status,
    waterLevel: seed.waterLevel,
    sunExposure: seed.sunExposure,
    nextTask: seed.nextTask,
    nextTaskDate: nextTaskDate?.toISOString().slice(0, 10),
    notes: seed.notes ?? "",
  }
}
