"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useNotifications } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    deletingId,
    markRead,
    markAllRead,
    deleteNotification,
  } = useNotifications()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const pendingNotification = notifications.find(
    (n) => String(n._id) === pendingDeleteId
  )

  const confirmDelete = async () => {
    if (!pendingDeleteId) return
    try {
      await deleteNotification(pendingDeleteId)
    } finally {
      setPendingDeleteId(null)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                className="text-xs text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">No notifications yet</p>
          ) : (
            notifications.slice(0, 8).map((n) => {
              const id = String(n._id)
              const read = Boolean(n.read)
              const isDeleting = deletingId === id

              return (
                <DropdownMenuItem
                  key={id}
                  className="cursor-default p-0 focus:bg-transparent"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex w-full items-start gap-1 p-2">
                    <Link
                      href={String(n.link ?? "/dashboard")}
                      className="min-w-0 flex-1 rounded-md px-2 py-1 hover:bg-muted/80"
                      onClick={() => {
                        if (!read) markRead(id)
                      }}
                    >
                      <span
                        className={`block text-sm font-medium ${!read ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {String(n.title)}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-2">
                        {String(n.message)}
                      </span>
                      <span className="mt-1 block text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(String(n.createdAt)), {
                          addSuffix: true,
                        })}
                      </span>
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={isDeleting}
                      aria-label="Delete notification"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setPendingDeleteId(id)
                      }}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </DropdownMenuItem>
              )
            })
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this notification?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingNotification ? (
                <>
                  <span className="font-medium text-foreground">
                    {String(pendingNotification.title)}
                  </span>
                  {" — "}
                  {String(pendingNotification.message)}
                </>
              ) : (
                "This notification will be removed permanently."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(deletingId)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={Boolean(deletingId)}
              onClick={(e) => {
                e.preventDefault()
                void confirmDelete()
              }}
            >
              {deletingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

