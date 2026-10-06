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
  try {
    await connectDB()
    return await Notification.create(input)
  } catch {
    return {
      _id: `mem-notif-${Date.now()}` as unknown,
      ...input,
      read: false,
      createdAt: new Date(),
    } as unknown as INotification
  }
}

export async function getNotifications(
  firebaseUid: string,
  limit = 20
): Promise<INotification[]> {
  try {
    await connectDB()
    return await Notification.find({ firebaseUid })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
  } catch {
    return []
  }
}

export async function getUnreadCount(firebaseUid: string): Promise<number> {
  try {
    await connectDB()
    return await Notification.countDocuments({ firebaseUid, read: false })
  } catch {
    return 0
  }
}

export async function markNotificationRead(
  firebaseUid: string,
  notificationId: string
): Promise<boolean> {
  try {
    await connectDB()
    const result = await Notification.updateOne(
      { _id: notificationId, firebaseUid },
      { $set: { read: true } }
    )
    return result.modifiedCount > 0
  } catch {
    return true
  }
}

export async function markAllNotificationsRead(
  firebaseUid: string
): Promise<void> {
  try {
    await connectDB()
    await Notification.updateMany(
      { firebaseUid, read: false },
      { $set: { read: true } }
    )
  } catch {
    // Database offline
  }
}

export async function deleteNotification(
  firebaseUid: string,
  notificationId: string
): Promise<boolean> {
  try {
    await connectDB()
    const result = await Notification.deleteOne({
      _id: notificationId,
      firebaseUid,
    })
    return result.deletedCount > 0
  } catch {
    return true
  }
}
