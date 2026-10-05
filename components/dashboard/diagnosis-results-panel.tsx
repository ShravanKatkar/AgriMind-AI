"use client"

import { motion } from "framer-motion"
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle,
  Clock,
  Loader2,
  Sparkles,
  Youtube,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DiagnosisReportActions } from "@/components/dashboard/diagnosis-report-actions"
import type { UiCatalogKey } from "@/lib/i18n/ui-catalog"
import type { CropDiagnosisResult } from "@/types/ai"

type DiagnosisResultsPanelProps = {
  report: CropDiagnosisResult
  sourceDiagnosis: CropDiagnosisResult
  cropType: string
  reportId: string | null
  translating: boolean
  t: (key: UiCatalogKey) => string
  onReset: () => void
  onSetReminders: () => void
  onTrackIssue: () => void
  onContactExpert: () => void
  isSettingReminders: boolean
  isTracking: boolean
  isTracked: boolean
}

export function DiagnosisResultsPanel({
  report,
  sourceDiagnosis,
  cropType,
  reportId,
  translating,
  t,
  onReset,
  onSetReminders,
  onTrackIssue,
  onContactExpert,
  isSettingReminders,
  isTracking,
  isTracked,
}: DiagnosisResultsPanelProps) {
  const isPlantImage = report.isValidPlantImage !== false

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      data-no-translate
    >
      {translating && (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("diagnosis.translating")}
        </p>
      )}

      <Card
        className={
          isPlantImage ? "border-primary/50" : "border-destructive/50 bg-destructive/5"
        }
      >
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                  isPlantImage
                    ? report.severity === "low"
                      ? "bg-primary/10"
                      : report.severity === "medium"
                        ? "bg-accent/10"
                        : "bg-destructive/10"
                    : "bg-destructive/10"
                }`}
              >
                <AlertTriangle
                  className={`h-7 w-7 ${
                    isPlantImage
                      ? report.severity === "low"
                        ? "text-primary"
                        : report.severity === "medium"
                          ? "text-accent"
                          : "text-destructive"
                      : "text-destructive"
                  }`}
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {isPlantImage
                    ? report.disease
                    : report.rejectionReason || t("diagnosis.notPlantTitle")}
                </h2>
                {isPlantImage ? (
                  <div className="flex items-center gap-4 mt-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        report.severity === "low"
                          ? "bg-primary/10 text-primary"
                          : report.severity === "medium"
                            ? "bg-accent/10 text-accent"
                            : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {report.severity} {t("diagnosis.severity")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {report.confidence}% {t("diagnosis.confidence")}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("diagnosis.notPlantHint")}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {reportId && isPlantImage ? (
                <DiagnosisReportActions
                  reportId={reportId}
                  cropType={cropType}
                  diagnosis={sourceDiagnosis}
                />
              ) : null}
              <Button variant="outline" onClick={onReset}>
                {t("diagnosis.newDiagnosis")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("diagnosis.causeAnalysis")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {report.cause}
          </p>
        </CardContent>
      </Card>

      {isPlantImage && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("diagnosis.symptoms")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {report.symptoms.map((symptom, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm leading-relaxed text-foreground">
                        {symptom}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {t("diagnosis.treatment")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  {report.treatment.map((step) => (
                    <div
                      key={step.step}
                      className="flex gap-4 rounded-xl border border-border/60 bg-muted/20 p-4"
                    >
                      <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary-foreground">
                          {step.step}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="font-semibold text-foreground">{step.action}</p>
                        <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          {step.timing}
                        </p>
                        {step.details ? (
                          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                            {step.details}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("diagnosis.prevention")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {report.prevention.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/15 p-3"
                    >
                      <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-primary">{index + 1}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground">{tip}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("diagnosis.recovery")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("diagnosis.estimatedRecovery")}
                  </p>
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                    {report.estimatedRecovery}
                  </p>
                </div>
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("diagnosis.treatmentCost")}
                  </p>
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                    {report.costEstimate}
                  </p>
                </div>
                {report.recoverySummary ? (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                    <p className="text-sm font-medium text-primary">
                      {t("diagnosis.recoveryOutlook")}
                    </p>
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                      {report.recoverySummary}
                    </p>
                  </div>
                ) : null}
                {report.irrigationNotes ? (
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("diagnosis.irrigation")}
                    </p>
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                      {report.irrigationNotes}
                    </p>
                  </div>
                ) : null}
                {report.followUpAdvice ? (
                  <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-4 space-y-2">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                      {t("diagnosis.followUp")}
                    </p>
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                      {report.followUpAdvice}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Youtube className="h-5 w-5 text-destructive" />
                  {t("diagnosis.videos")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(report.youtubeVideos ?? []).map((video, index) => (
                  <a
                    key={index}
                    href={
                      video.url ??
                      `https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-12 w-16 rounded bg-muted flex items-center justify-center shrink-0">
                      <Youtube className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {video.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {video.language ?? "YouTube"} • Tap to watch
                      </p>
                    </div>
                  </a>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-2">
                <Button
                  className="w-full gap-2"
                  disabled={!reportId || isSettingReminders}
                  onClick={onSetReminders}
                >
                  {isSettingReminders ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  Set Treatment Reminders
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={!reportId || isTracking || isTracked}
                  onClick={onTrackIssue}
                >
                  {isTracking ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isTracked ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : null}
                  {isTracked ? "Tracked" : "Track This Issue"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={onContactExpert}
                >
                  Contact Expert <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </motion.div>
  )
}
