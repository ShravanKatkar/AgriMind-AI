"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { SUPPORTED_CROPS } from "@/lib/constants"
import type { UiCatalogKey } from "@/lib/i18n/ui-catalog"
import type { CropStage } from "@/types/crop"

const STAGES: CropStage[] = [
  "preparation",
  "planting",
  "growing",
  "flowering",
  "fruiting",
  "harvesting",
]

const STAGE_KEYS: Record<CropStage, UiCatalogKey> = {
  preparation: "crops.stage.preparation",
  planting: "crops.stage.planting",
  growing: "crops.stage.growing",
  flowering: "crops.stage.flowering",
  fruiting: "crops.stage.fruiting",
  harvesting: "crops.stage.harvesting",
}

interface CropFormProps {
  initial?: Record<string, unknown>
  onSubmit: (data: Record<string, unknown>) => Promise<void>
  submitLabelKey?: UiCatalogKey
}

export function CropForm({
  initial,
  onSubmit,
  submitLabelKey = "crops.saveCrop",
}: CropFormProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: String(initial?.name ?? ""),
    cropType: String(initial?.cropType ?? ""),
    stage: String(initial?.stage ?? "preparation"),
    health: Number(initial?.health ?? 100),
    plantedDate: initial?.plantedDate
      ? new Date(String(initial.plantedDate)).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    expectedHarvestDate: initial?.expectedHarvestDate
      ? new Date(String(initial.expectedHarvestDate)).toISOString().slice(0, 10)
      : "",
    area: String(initial?.area ?? "1"),
    areaUnit: String(initial?.areaUnit ?? "acres"),
    location: String(initial?.location ?? ""),
    status: String(initial?.status ?? "healthy"),
    waterLevel: Number(initial?.waterLevel ?? 70),
    sunExposure: String(initial?.sunExposure ?? "Full sun"),
    nextTask: String(initial?.nextTask ?? ""),
    notes: String(initial?.notes ?? ""),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        ...form,
        health: Number(form.health),
        waterLevel: Number(form.waterLevel),
        expectedHarvestDate: form.expectedHarvestDate || undefined,
        nextTask: form.nextTask || undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-no-translate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("crops.fieldName")} *</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Tomato Field A"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>{t("crops.cropType")} *</Label>
          <Select
            value={form.cropType}
            onValueChange={(v) => setForm({ ...form, cropType: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("crops.selectCrop")} />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_CROPS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>{t("crops.stage")}</Label>
          <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(STAGE_KEYS[s])}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("crops.health")}</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={form.health}
            onChange={(e) => setForm({ ...form, health: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("crops.status")}</Label>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="healthy">{t("crops.status.healthy")}</SelectItem>
              <SelectItem value="warning">{t("crops.status.warning")}</SelectItem>
              <SelectItem value="critical">{t("crops.status.critical")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("crops.plantedDate")}</Label>
          <Input
            type="date"
            value={form.plantedDate}
            onChange={(e) => setForm({ ...form, plantedDate: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("crops.expectedHarvest")}</Label>
          <Input
            type="date"
            value={form.expectedHarvestDate}
            onChange={(e) =>
              setForm({ ...form, expectedHarvestDate: e.target.value })
            }
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>{t("crops.area")}</Label>
          <Input
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>{t("crops.unit")}</Label>
          <Select
            value={form.areaUnit}
            onValueChange={(v) => setForm({ ...form, areaUnit: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="acres">{t("crops.unit.acres")}</SelectItem>
              <SelectItem value="hectares">{t("crops.unit.hectares")}</SelectItem>
              <SelectItem value="perches">{t("crops.unit.perches")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("crops.location")}</Label>
          <Input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder={t("crops.fieldLocationPh")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("crops.nextTask")}</Label>
        <Input
          value={form.nextTask}
          onChange={(e) => setForm({ ...form, nextTask: e.target.value })}
          placeholder={t("crops.nextTaskPh")}
        />
      </div>

      <div className="space-y-2">
        <Label>{t("crops.notes")}</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t("common.saving") : t(submitLabelKey)}
      </Button>
    </form>
  )
}
