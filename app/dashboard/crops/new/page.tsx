"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CropForm } from "@/components/dashboard/crop-form"
import { useCrops } from "@/hooks/use-crops"
import { useLanguage } from "@/contexts/language-context"
import {
  FARM_CROP_SEEDS,
  farmCropSeedToFormValues,
} from "@/lib/crops/seed-data"
import { toast } from "sonner"

export default function NewCropPage() {
  const router = useRouter()
  const { createCrop } = useCrops()
  const { t } = useLanguage()
  const [formKey, setFormKey] = useState(0)
  const [formInitial, setFormInitial] = useState<Record<string, unknown> | undefined>()

  const loadTemplate = (index: number) => {
    const seed = FARM_CROP_SEEDS[index]
    if (!seed) return
    setFormInitial(farmCropSeedToFormValues(seed))
    setFormKey((k) => k + 1)
    toast.message(`Loaded ${seed.cropType} template`)
  }

  return (
    <div className="max-w-2xl space-y-6" data-no-translate>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/crops">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("crops.addTitle")}</h1>
          <p className="text-muted-foreground">{t("crops.addSubtitle")}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>{t("crops.detailsTitle")}</CardTitle>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t("crops.sampleTemplates")}</p>
            <div className="flex flex-wrap gap-2">
              {FARM_CROP_SEEDS.map((seed, index) => (
                <Button
                  key={seed.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => loadTemplate(index)}
                >
                  {seed.cropType}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CropForm
            key={formKey}
            initial={formInitial}
            submitLabelKey="crops.createCrop"
            onSubmit={async (data) => {
              try {
                const crop = await createCrop(data)
                toast.success("Crop created")
                router.push(`/dashboard/crops/${String(crop._id)}`)
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed to create crop")
                throw e
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
