export type CropStage =
  | "preparation"
  | "planting"
  | "growing"
  | "flowering"
  | "fruiting"
  | "harvesting"

export type CropStatus = "healthy" | "warning" | "critical"

export type ReminderType =
  | "watering"
  | "fertilizer"
  | "pesticide"
  | "harvest"
  | "inspection"
  | "other"

export type ReminderPriority = "low" | "medium" | "high"

export type NotificationType =
  | "reminder"
  | "diagnosis"
  | "weather"
  | "crop"
  | "system"
