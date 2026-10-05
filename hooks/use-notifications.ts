"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

export function useNotifications(pollMs = 30000) {
  const [notifications, setNotifications] = useState<Record<string, unknown>[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications")
      const json = await res.json()
      if (res.ok) {
        setNotifications(json.data?.notifications ?? [])
        setUnreadCount(json.data?.unreadCount ?? 0)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, pollMs)
    return () => clearInterval(interval)
  }, [fetchNotifications, pollMs])

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" })
    await fetchNotifications()
  }

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "POST" })
    await fetchNotifications()
  }

  const deleteNotification = async (id: string) => {
    setDeletingId(id)
    const removed = notifications.find((n) => String(n._id) === id)
    const wasUnread = removed && !removed.read

    setNotifications((prev) => prev.filter((n) => String(n._id) !== id))
    if (wasUnread) {
      setUnreadCount((c) => Math.max(0, c - 1))
    }

    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to delete notification")
      toast.success("Notification deleted")
    } catch (e) {
      await fetchNotifications()
      toast.error(e instanceof Error ? e.message : "Failed to delete notification")
      throw e
    } finally {
      setDeletingId(null)
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    deletingId,
    markRead,
    markAllRead,
    deleteNotification,
    refresh: fetchNotifications,
  }
}
