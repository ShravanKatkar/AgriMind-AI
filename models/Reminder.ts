import mongoose, { Schema, type Document, type Model, Types } from "mongoose"
import type { ReminderPriority, ReminderType } from "@/types/crop"

export interface IReminder extends Document {
  firebaseUid: string
  cropId?: Types.ObjectId
  title: string
  description?: string
  type: ReminderType
  priority: ReminderPriority
  dueDate: Date
  dueTime?: string
  repeat: "none" | "daily" | "weekly" | "monthly"
  notifyChannels: ("app" | "sms" | "whatsapp" | "email")[]
  completed: boolean
  completedAt?: Date
  lastNotifiedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ReminderSchema = new Schema<IReminder>(
  {
    firebaseUid: { type: String, required: true, index: true },
    cropId: { type: Schema.Types.ObjectId, ref: "Crop" },
    title: { type: String, required: true, trim: true },
    description: String,
    type: {
      type: String,
      enum: ["watering", "fertilizer", "pesticide", "harvest", "inspection", "other"],
      default: "other",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: { type: Date, required: true, index: true },
    dueTime: String,
    repeat: {
      type: String,
      enum: ["none", "daily", "weekly", "monthly"],
      default: "none",
    },
    notifyChannels: {
      type: [String],
      default: ["app"],
    },
    completed: { type: Boolean, default: false },
    completedAt: Date,
    lastNotifiedAt: Date,
  },
  { timestamps: true }
)

ReminderSchema.index({ firebaseUid: 1, completed: 1, dueDate: 1 })

const Reminder: Model<IReminder> =
  mongoose.models.Reminder ??
  mongoose.model<IReminder>("Reminder", ReminderSchema)

export default Reminder
