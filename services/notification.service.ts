import { connectDB } from "@/lib/mongodb"
import Notification, { type INotification } from "@/models/Notification"
import type { NotificationType } from "@/types/crop"

export async function createNotification(input: {
  firebaseUid: string
  type: NotificationType
  title: string
  message: string
  link?: string
  metadata?: Record<string, unknown>
}): Promise<INotification> {
  await connectDB()
  return Notification.create(input)
}

export async function getNotifications(
  firebaseUid: string,
  limit = 20
): Promise<INotification[]> {
  await connectDB()
  return Notification.find({ firebaseUid })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
}

export async function getUnreadCount(firebaseUid: string): Promise<number> {
  await connectDB()
  return Notification.countDocuments({ firebaseUid, read: false })
}

export async function markNotificationRead(
  firebaseUid: string,
  notificationId: string
): Promise<boolean> {
  await connectDB()
  const result = await Notification.updateOne(
    { _id: notificationId, firebaseUid },
    { $set: { read: true } }
  )
  return result.modifiedCount > 0
}

export async function markAllNotificationsRead(
  firebaseUid: string
): Promise<void> {
  await connectDB()
  await Notification.updateMany(
    { firebaseUid, read: false },
    { $set: { read: true } }
  )
}

export async function deleteNotification(
  firebaseUid: string,
  notificationId: string
): Promise<boolean> {
  await connectDB()
  const result = await Notification.deleteOne({
    _id: notificationId,
    firebaseUid,
  })
  return result.deletedCount > 0
}
