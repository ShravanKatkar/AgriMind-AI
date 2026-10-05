"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Camera,
  Loader2,
  FileText,
  MessageCircle,
  AlertTriangle,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { useDiagnosisHistory } from "@/hooks/use-diagnosis-history"
import { useLanguage } from "@/contexts/language-context"
import { getLanguageDisplayLabel } from "@/lib/i18n/languages"
import { buildDiagnosisShareUrl } from "@/services/whatsapp.service"
import type { CropDiagnosisResult } from "@/types/ai"
import { format } from "date-fns"

const severityColor = {
  low: "bg-primary/10 text-primary",
  medium: "bg-accent/10 text-accent",
  high: "bg-destructive/10 text-destructive",
}

export function DiagnosisHistoryContent() {
  const searchParams = useSearchParams()
  const highlightId = searchParams.get("id")
  const { language } = useLanguage()
  const { reports, loading, deletingId, downloadPdf, deleteReport } =
    useDiagnosisHistory()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const pendingReport = pendingDeleteId
    ? reports.find((r) => String(r._id) === pendingDeleteId)
    : null

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return
    await deleteReport(pendingDeleteId)
    setPendingDeleteId(null)
  }

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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/diagnosis">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Diagnosis History</h1>
            <p className="text-muted-foreground">
              Past AI reports — download PDF or share with an officer via WhatsApp.
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/dashboard/diagnosis">
            <Camera className="h-4 w-4 mr-2" />
            New Diagnosis
          </Link>
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No diagnosis reports yet.</p>
            <Button asChild>
              <Link href="/dashboard/diagnosis">Run your first scan</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const id = String(report._id)
            const result = report.result as CropDiagnosisResult
            const severity = String(report.severity) as keyof typeof severityColor
            const whatsappUrl = buildDiagnosisShareUrl({
              cropType: String(report.cropType),
              diagnosis: result,
              reportId: id,
            })
            const isDeleting = deletingId === id

            return (
              <Card
                key={id}
                className={highlightId === id ? "ring-2 ring-primary" : undefined}
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg capitalize">
                        {String(report.cropType)} — {String(report.disease)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {format(new Date(String(report.createdAt)), "MMM d, yyyy · h:mm a")}
                        {" · "}
                        {Number(report.confidence)}% confidence
                      </p>
                    </div>
                    <Badge className={severityColor[severity] ?? severityColor.low}>
                      {severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {report.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={String(report.imageUrl)}
                      alt="Crop"
                      className="h-32 w-full max-w-xs rounded-lg object-cover border border-border"
                    />
                  ) : null}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {result?.cause ?? ""}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={isDeleting}
                      onClick={() => downloadPdf(id, language)}
                    >
                      <FileText className="h-4 w-4" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={isDeleting}
                      asChild
                    >
                      <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="h-4 w-4 text-[#25D366]" />
                        WhatsApp
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={isDeleting}
                      onClick={() => setPendingDeleteId(id)}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <AlertDialog
        open={Boolean(pendingDeleteId)}
        onOpenChange={(open) => {
          if (!open && !deletingId) setPendingDeleteId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this diagnosis report?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingReport ? (
                <>
                  This will permanently remove the report for{" "}
                  <span className="font-medium text-foreground capitalize">
                    {String(pendingReport.cropType)} — {String(pendingReport.disease)}
                  </span>
                  . This action cannot be undone.
                </>
              ) : (
                "This action cannot be undone."
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
                void handleConfirmDelete()
              }}
            >
              {deletingId ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete report"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
