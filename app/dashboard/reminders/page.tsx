"use client"

import { useState } from "react"
import {
  Bell,
  Plus,
  Trash2,
  Calendar,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useReminders } from "@/hooks/use-reminders"
import { WhatsAppSupportButton } from "@/components/dashboard/whatsapp-support-button"
import { buildReminderWhatsAppUrl } from "@/services/whatsapp.service"
import { toast } from "sonner"
import type { ReminderType } from "@/types/crop"
import Link from "next/link"
import { MessageCircle } from "lucide-react"

const TYPES: ReminderType[] = [
  "watering",
  "fertilizer",
  "pesticide",
  "harvest",
  "inspection",
  "other",
]

export default function RemindersPage() {
  const { reminders, loading, createReminder, toggleComplete, removeReminder } =
    useReminders(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "watering" as ReminderType,
    dueDate: new Date().toISOString().slice(0, 10),
    dueTime: "06:00",
    cropName: "",
    notifyWhatsapp: true,
  })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const dueIso = new Date(`${form.dueDate}T${form.dueTime}`).toISOString()
      await createReminder({
        title: form.title,
        description: form.cropName
          ? `Crop: ${form.cropName}. ${form.description}`.trim()
          : form.description,
        type: form.type,
        dueDate: dueIso,
        dueTime: form.dueTime,
        notifyChannels: form.notifyWhatsapp ? ["app", "whatsapp"] : ["app"],
      })
      setOpen(false)
      setForm({
        title: "",
        description: "",
        type: "watering",
        dueDate: new Date().toISOString().slice(0, 10),
        dueTime: "06:00",
        cropName: "",
        notifyWhatsapp: true,
      })
      toast.success("Reminder created")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create")
    }
  }

  const pending = reminders.filter((r) => !r.completed)
  const done = reminders.filter((r) => r.completed)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reminders</h1>
          <p className="text-muted-foreground">
            Farm tasks and schedules — saved to your account.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <WhatsAppSupportButton label="Officer WhatsApp" />
          <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New reminder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) =>
                      setForm({ ...form, type: v as ReminderType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Crop (optional)</Label>
                  <Input
                    value={form.cropName}
                    onChange={(e) => setForm({ ...form, cropName: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={form.dueTime}
                    onChange={(e) => setForm({ ...form, dueTime: e.target.value })}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.notifyWhatsapp}
                  onChange={(e) =>
                    setForm({ ...form, notifyWhatsapp: e.target.checked })
                  }
                  className="rounded border-border"
                />
                Notify via WhatsApp (opens chat with AgriMind officer)
              </label>
              <Button type="submit" className="w-full">
                Create
              </Button>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Bell className="h-5 w-5" />
          <CardTitle>Upcoming ({pending.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending reminders</p>
          ) : (
            pending.map((r) => (
              <div
                key={String(r._id)}
                className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border"
              >
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => toggleComplete(String(r._id), true)}
                  >
                    <CheckCircle className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <div>
                    <p className="font-medium">{String(r.title)}</p>
                    {r.description ? (
                      <p className="text-sm text-muted-foreground">{String(r.description)}</p>
                    ) : null}
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(String(r.dueDate)).toLocaleString()}
                      {r.cropName ? ` · ${String(r.cropName)}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {(r.notifyChannels as string[] | undefined)?.includes("whatsapp") ? (
                    <Button variant="ghost" size="icon" asChild>
                      <Link
                        href={buildReminderWhatsAppUrl({
                          title: String(r.title),
                          dueDate: new Date(String(r.dueDate)).toLocaleString(),
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="h-4 w-4 text-[#25D366]" />
                      </Link>
                    </Button>
                  ) : null}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeReminder(String(r._id))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {done.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {done.map((r) => (
              <div
                key={String(r._id)}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50 opacity-70"
              >
                <p className="text-sm line-through">{String(r.title)}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleComplete(String(r._id), false)}
                >
                  Undo
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
