import mongoose, { Schema, type Document, type Model } from "mongoose"
import type { NotificationType } from "@/types/crop"

export interface INotification extends Document {
  firebaseUid: string
  type: NotificationType
  title: string
  message: string
  link?: string
  read: boolean
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    firebaseUid: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["reminder", "diagnosis", "weather", "crop", "system"],
      default: "system",
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    link: String,
    read: { type: Boolean, default: false },
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true }
)

NotificationSchema.index({ firebaseUid: 1, read: 1, createdAt: -1 })

const Notification: Model<INotification> =
  mongoose.models.Notification ??
  mongoose.model<INotification>("Notification", NotificationSchema)

export default Notification
