"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import type { SupportedLanguage } from "@/types"

export function useDiagnosisHistory() {
  const [reports, setReports] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/diagnosis")
      const json = await res.json()
      if (res.ok) setReports(json.data ?? [])
    } catch {
      toast.error("Failed to load diagnosis history")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const downloadPdf = (reportId: string, language?: SupportedLanguage) => {
    const qs = language ? `?lang=${encodeURIComponent(language)}` : ""
    window.open(`/api/diagnosis/${reportId}/pdf${qs}`, "_blank")
  }

  const deleteReport = async (reportId: string) => {
    setDeletingId(reportId)
    try {
      const res = await fetch(`/api/diagnosis/${reportId}`, { method: "DELETE" })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to delete report")
      }
      setReports((prev) => prev.filter((r) => String(r._id) !== reportId))
      toast.success("Diagnosis report deleted")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete report")
    } finally {
      setDeletingId(null)
    }
  }

  return {
    reports,
    loading,
    deletingId,
    fetchHistory,
    downloadPdf,
    deleteReport,
  }
}
