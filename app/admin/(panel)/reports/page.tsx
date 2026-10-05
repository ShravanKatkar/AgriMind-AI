"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Sprout } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

interface ReportRow {
  _id: string
  cropType: string
  disease: string
  severity: string
  confidence: number
  createdAt: string
  farmer?: { displayName?: string; email?: string; district?: string } | null
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([])
  const [severity, setSeverity] = useState("all")
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (severity !== "all") params.set("severity", severity)
      const res = await fetch(`/api/admin/reports?${params}`)
      const json = await res.json()
      if (res.ok) {
        setReports(json.data.items ?? [])
        setPages(json.data.pages ?? 1)
      }
    } finally {
      setLoading(false)
    }
  }, [page, severity])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Crop Reports"
        description="AI disease diagnosis reports across the platform."
        icon={Sprout}
      />

      <Card className="transition-all duration-200 hover:border-primary/25 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Diagnosis reports</CardTitle>
          <Select
            value={severity}
            onValueChange={(v) => {
              setSeverity(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severity</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farmer</TableHead>
                    <TableHead>Crop</TableHead>
                    <TableHead>Disease</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{r.farmer?.displayName ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{r.farmer?.district}</p>
                        </div>
                      </TableCell>
                      <TableCell>{r.cropType}</TableCell>
                      <TableCell>{r.disease}</TableCell>
                      <TableCell>
                        <span
                          className={`capitalize text-xs font-medium px-2 py-0.5 rounded-full ${
                            r.severity === "high"
                              ? "bg-destructive/10 text-destructive"
                              : r.severity === "medium"
                                ? "bg-accent/10 text-accent"
                                : "bg-primary/10 text-primary"
                          }`}
                        >
                          {r.severity}
                        </span>
                      </TableCell>
                      <TableCell>{Math.round(r.confidence)}%</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
