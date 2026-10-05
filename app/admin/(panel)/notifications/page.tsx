"use client"

import { useEffect, useState } from "react"
import { Loader2, Bell } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

interface NotificationRow {
  _id: string
  firebaseUid: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<NotificationRow[]>([])
  const [unreadTotal, setUnreadTotal] = useState(0)
  const [byType, setByType] = useState<{ _id: string; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setItems(json.data.items ?? [])
          setUnreadTotal(json.data.unreadTotal ?? 0)
          setByType(json.data.byType ?? [])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notifications"
        description="Platform-wide notification feed and unread counts."
        icon={Bell}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="transition-all duration-200 hover:border-primary/25 hover:shadow-md">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Unread</p>
            <p className="text-3xl font-bold">{unreadTotal}</p>
          </CardContent>
        </Card>
        {byType.slice(0, 2).map((t) => (
          <Card key={t._id}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground capitalize">{t._id}</p>
              <p className="text-3xl font-bold">{t.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No notifications yet</p>
          ) : (
            <ul className="space-y-3">
              {items.map((n) => (
                <li
                  key={n._id}
                  className={`rounded-lg border p-3 ${n.read ? "opacity-70" : "border-primary/30 bg-primary/5"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 capitalize">
                      {n.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
