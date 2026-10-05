"use client"

import { motion } from "framer-motion"
import { useState, useRef } from "react"
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  FileText,
  X,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAiChat } from "@/hooks/use-ai-chat"
import { buildExpertConsultUrl } from "@/services/whatsapp.service"
import { SUPPORTED_CROPS } from "@/lib/constants"
import { WhatsAppSupportButton } from "@/components/dashboard/whatsapp-support-button"
import type { CropDiagnosisResult } from "@/types/ai"
import { toast } from "sonner"
import { useLanguage } from "@/contexts/language-context"
import { LanguagePicker } from "@/components/i18n/language-picker"
import { useDiagnosisTranslation } from "@/hooks/use-diagnosis-translation"
import { DiagnosisResultsPanel } from "@/components/dashboard/diagnosis-results-panel"
import { CropCameraDialog } from "@/components/dashboard/crop-camera-dialog"

const cropTypes = [...SUPPORTED_CROPS, "Other"]

function prefersNativeCamera(): boolean {
  if (typeof navigator === "undefined") return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

export default function DiagnosisPage() {
  const router = useRouter()
  const { t, language } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [cropType, setCropType] = useState<string>("")
  const [otherCropName, setOtherCropName] = useState("")
  const [description, setDescription] = useState("")
  const [diagnosis, setDiagnosis] = useState<CropDiagnosisResult | null>(null)
  const [diagnosisLanguage, setDiagnosisLanguage] =
    useState<typeof language>("en")
  const [reportId, setReportId] = useState<string | null>(null)
  const { displayDiagnosis, translating } = useDiagnosisTranslation(
    diagnosis,
    diagnosisLanguage
  )
  const report = displayDiagnosis ?? diagnosis
  const isPlantImage = report?.isValidPlantImage !== false
  const [isTracked, setIsTracked] = useState(false)
  const [isTracking, setIsTracking] = useState(false)
  const [isSettingReminders, setIsSettingReminders] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const { diagnoseCrop, isLoading: isAnalyzing } = useAiChat(language)

  const applyImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (PNG or JPG)")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be 10MB or smaller")
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setSelectedImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) applyImageFile(file)
    e.target.value = ""
  }

  const handleTakePhoto = () => {
    if (prefersNativeCamera() && cameraInputRef.current) {
      cameraInputRef.current.click()
      return
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraInputRef.current?.click()
      return
    }
    setCameraOpen(true)
  }

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error("Please upload a crop image first")
      return
    }
    if (!cropType) {
      toast.error("Please select a crop type")
      return
    }

    const effectiveCropType =
      cropType === "other"
        ? otherCropName.trim() || "Other"
        : cropType

    const result = await diagnoseCrop({
      imageBase64: selectedImage,
      cropType: effectiveCropType,
      description: description.trim() || undefined,
    })

    if (result) {
      const data = result as CropDiagnosisResult & {
        reportId?: string
        imageUrl?: string
        storageProvider?: string
      }
      setDiagnosisLanguage(language)
      setDiagnosis(data)
      setReportId(data.reportId ?? null)
      if (data.imageUrl) {
        toast.success("Photo saved — you can view it in diagnosis history")
      } else {
        toast.message(
          "Diagnosis saved without photo URL. Add Cloudinary or Firebase Storage in server settings.",
          { duration: 5000 }
        )
      }
      if (data.isValidPlantImage === false) {
        toast.error(t("diagnosis.notPlantTitle"))
      }
    }
  }

  const resetForm = () => {
    setSelectedImage(null)
    setCropType("")
    setOtherCropName("")
    setDescription("")
    setDiagnosis(null)
    setDiagnosisLanguage("en")
    setReportId(null)
    setIsTracked(false)
  }

  const handleSetTreatmentReminders = async () => {
    if (!reportId) {
      toast.error("Run AI analysis first to save this diagnosis")
      return
    }
    setIsSettingReminders(true)
    try {
      const res = await fetch(`/api/diagnosis/${reportId}/treatment-reminders`, {
        method: "POST",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to create reminders")
      toast.success(`${json.data.created} treatment reminders added`)
      router.push("/dashboard/reminders")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to set reminders")
    } finally {
      setIsSettingReminders(false)
    }
  }

  const handleTrackIssue = async () => {
    if (!reportId) {
      toast.error("Run AI analysis first to save this diagnosis")
      return
    }
    setIsTracking(true)
    try {
      const res = await fetch(`/api/diagnosis/${reportId}/track`, { method: "POST" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to track issue")
      setIsTracked(true)
      toast.success(
        json.data.alreadyTracked
          ? "Already tracked â€” opening history"
          : "Issue tracked with a 3-day follow-up reminder"
      )
      router.push(`/dashboard/diagnosis/history?id=${reportId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to track issue")
    } finally {
      setIsTracking(false)
    }
  }

  const handleContactExpert = () => {
    if (!diagnosis || !cropType) {
      toast.error("Complete a diagnosis first")
      return
    }
    const url = buildExpertConsultUrl({
      cropType,
      diagnosis,
      reportId: reportId ?? undefined,
    })
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-1 flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Photo check
          </Badge>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("diagnosis.title")}</h1>
            <p className="text-muted-foreground">
              {t("diagnosis.subtitle")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/diagnosis/history">{t("diagnosis.viewHistory")}</Link>
            </Button>
            <WhatsAppSupportButton size="sm" />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <LanguagePicker />
        </div>
      </motion.div>

      {!diagnosis ? (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Upload Crop Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />
                
                {!selectedImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-foreground font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="Uploaded crop"
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => setSelectedImage(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4" />
                    Choose File
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={handleTakePhoto}
                  >
                    <Camera className="h-4 w-4" />
                    Take Photo
                  </Button>
                </div>

                <CropCameraDialog
                  open={cameraOpen}
                  onOpenChange={setCameraOpen}
                  onCapture={setSelectedImage}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Details Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t("diagnosis.issueDetails")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    {t("diagnosis.cropType")}
                  </label>
                  <Select
                    value={cropType}
                    onValueChange={(value) => {
                      setCropType(value)
                      if (value !== "other") setOtherCropName("")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select crop type" />
                    </SelectTrigger>
                    <SelectContent>
                      {cropTypes.map((crop) => (
                        <SelectItem key={crop} value={crop.toLowerCase()}>
                          {crop}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {cropType === "other" && (
                    <Input
                      type="text"
                      value={otherCropName}
                      onChange={(e) => setOtherCropName(e.target.value)}
                      placeholder={t("diagnosis.otherCropPh")}
                      className="mt-2 max-w-sm"
                      aria-label="Custom crop name"
                    />
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Describe the Problem
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you're seeing... e.g., 'Yellow spots on leaves, plants wilting'"
                    rows={5}
                  />
                </div>

                <div className="p-4 rounded-xl bg-muted/50">
                  <h4 className="font-medium text-foreground mb-2">Tips for Better Diagnosis:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Take clear, well-lit photos</li>
                    <li>• Include close-ups of affected areas</li>
                    <li>• Mention when the problem started</li>
                    <li>• Note any recent changes (weather, fertilizer)</li>
                  </ul>
                </div>

                <Button
                  className="w-full gap-2"
                  size="lg"
                  disabled={!selectedImage && !description}
                  onClick={handleAnalyze}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("diagnosis.analyzing")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {t("diagnosis.analyze")}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : report && diagnosis ? (
        <DiagnosisResultsPanel
          report={report}
          sourceDiagnosis={diagnosis}
          cropType={cropType}
          reportId={reportId}
          translating={translating}
          t={t}
          onReset={resetForm}
          onSetReminders={handleSetTreatmentReminders}
          onTrackIssue={handleTrackIssue}
          onContactExpert={handleContactExpert}
          isSettingReminders={isSettingReminders}
          isTracking={isTracking}
          isTracked={isTracked}
        />
      ) : null}
    </div>
  )
}
