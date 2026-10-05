"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Users } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface FarmerRow {
  firebaseUid: string
  displayName: string
  email: string
  district?: string
  primaryCrops?: string[]
  isActive: boolean
  createdAt: string
  lastLoginAt?: string
}

export default function AdminFarmersPage() {
  const [farmers, setFarmers] = useState<FarmerRow[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchFarmers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page) })
      if (search.trim()) params.set("search", search.trim())
      const res = await fetch(`/api/admin/farmers?${params}`)
      const json = await res.json()
      if (res.ok) {
        setFarmers(json.data.items ?? [])
        setPages(json.data.pages ?? 1)
      }
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchFarmers()
  }, [fetchFarmers])

  const toggleActive = async (uid: string, isActive: boolean) => {
    const res = await fetch(`/api/admin/farmers/${uid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    })
    const json = await res.json()
    if (res.ok) {
      toast.success(isActive ? "Farmer activated" : "Farmer deactivated")
      fetchFarmers()
    } else {
      toast.error(json.error ?? "Update failed")
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Farmers"
        description="Manage registered farmer accounts across the platform."
        icon={Users}
      />

      <Card className="transition-all duration-200 hover:border-primary/25 hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>All farmers</CardTitle>
          <div className="flex gap-2 max-w-sm w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, district…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                onKeyDown={(e) => e.key === "Enter" && (setPage(1), fetchFarmers())}
              />
            </div>
            <Button variant="outline" onClick={() => { setPage(1); fetchFarmers() }}>
              Search
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Crops</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {farmers.map((f) => (
                    <TableRow key={f.firebaseUid}>
                      <TableCell className="font-medium">{f.displayName}</TableCell>
                      <TableCell>{f.email}</TableCell>
                      <TableCell>{f.district || "—"}</TableCell>
                      <TableCell className="max-w-[140px] truncate">
                        {f.primaryCrops?.join(", ") || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(f.createdAt), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={f.isActive}
                          onCheckedChange={(v) => toggleActive(f.firebaseUid, v)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {farmers.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">No farmers found</p>
              )}
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
