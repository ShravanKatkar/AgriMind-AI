"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  Sprout,
  Calendar,
  MapPin,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CropForm } from "@/components/dashboard/crop-form"
import { useCrops } from "@/hooks/use-crops"
import { toast } from "sonner"
import type { CropStage } from "@/types/crop"
import { format } from "date-fns"

const STAGES: CropStage[] = [
  "preparation",
  "planting",
  "growing",
  "flowering",
  "fruiting",
  "harvesting",
]

export default function CropDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params.id)
  const { updateCrop, deleteCrop } = useCrops()

  const [crop, setCrop] = useState<Record<string, unknown> | null>(null)
  const [lifecycle, setLifecycle] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/crops/${id}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Not found")
      setCrop(json.data.crop)
      setLifecycle(json.data.lifecycle ?? [])
    } catch {
      toast.error("Failed to load crop")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const handleStageChange = async (stage: string) => {
    try {
      await updateCrop(id, { stage })
      await load()
      toast.success("Stage updated")
    } catch {
      toast.error("Failed to update stage")
    }
  }

  const handleDelete = async () => {
    if (!confirm("Archive this crop?")) return
    try {
      await deleteCrop(id)
      toast.success("Crop removed")
      router.push("/dashboard/crops")
    } catch {
      toast.error("Failed to delete")
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!crop) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Crop not found</p>
        <Button asChild>
          <Link href="/dashboard/crops">Back to crops</Link>
        </Button>
      </div>
    )
  }

  const health = Number(crop.health ?? 0)

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/crops">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{String(crop.name)}</h1>
            <p className="text-muted-foreground capitalize">{String(crop.cropType)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(!editing)}>
            {editing ? "Cancel" : "Edit"}
          </Button>
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Sprout className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Health</p>
              <p className="text-xl font-bold">{health}%</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Planted</p>
              <p className="text-sm font-medium">
                {crop.plantedDate
                  ? format(new Date(String(crop.plantedDate)), "MMM d, yyyy")
                  : "—"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <MapPin className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Area</p>
              <p className="text-sm font-medium">
                {String(crop.area)} {String(crop.areaUnit ?? "acres")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lifecycle stage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={String(crop.stage)} onValueChange={handleStageChange}>
            <SelectTrigger className="max-w-xs capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {lifecycle.length > 0 ? (
            <ol className="relative border-l border-border ml-3 space-y-4">
              {lifecycle.map((ev) => (
                <li key={String(ev._id)} className="ml-6">
                  <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary" />
                  <p className="text-sm font-medium capitalize">{String(ev.stage)}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(String(ev.createdAt)), "MMM d, yyyy · h:mm a")}
                  </p>
                  {ev.notes ? (
                    <p className="text-sm text-muted-foreground mt-1">{String(ev.notes)}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">Stage changes will appear here.</p>
          )}
        </CardContent>
      </Card>

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit crop</CardTitle>
          </CardHeader>
          <CardContent>
            <CropForm
              initial={crop}
              submitLabelKey="crops.saveCrop"
              onSubmit={async (data) => {
                try {
                  await updateCrop(id, data)
                  await load()
                  setEditing(false)
                  toast.success("Crop updated")
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : "Update failed")
                  throw e
                }
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      {crop.notes ? (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{String(crop.notes)}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
