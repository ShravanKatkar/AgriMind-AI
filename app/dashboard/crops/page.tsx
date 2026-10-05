"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import {
  Sprout,
  Plus,
  Search,
  MoreVertical,
  Calendar,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useCrops } from "@/hooks/use-crops"
import { toast } from "sonner"
import type { CropStage, CropStatus } from "@/types/crop"

const stageColors: Record<CropStage, string> = {
  preparation: "bg-muted-foreground",
  planting: "bg-chart-5",
  growing: "bg-primary",
  flowering: "bg-accent",
  fruiting: "bg-chart-4",
  harvesting: "bg-chart-3",
}

const stageLabels: Record<CropStage, string> = {
  preparation: "Land Prep",
  planting: "Planting",
  growing: "Growing",
  flowering: "Flowering",
  fruiting: "Fruiting",
  harvesting: "Harvesting",
}

export default function CropsPage() {
  const { crops, loading, deleteCrop } = useCrops()
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | CropStatus>("all")

  const filteredCrops = crops.filter((crop) => {
    const name = String(crop.name ?? "").toLowerCase()
    const type = String(crop.cropType ?? "").toLowerCase()
    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      type.includes(searchQuery.toLowerCase())
    const status = String(crop.status ?? "healthy") as CropStatus
    const matchesFilter = filter === "all" || status === filter
    return matchesSearch && matchesFilter
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Archive this crop?")) return
    try {
      await deleteCrop(id)
      toast.success("Crop removed")
    } catch {
      toast.error("Failed to delete crop")
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Crops</h1>
          <p className="text-muted-foreground">
            Manage and track all your crops from planting to harvest.
          </p>
        </div>
        <Button className="gap-2" asChild>
          <Link href="/dashboard/crops/new">
            <Plus className="h-4 w-4" />
            Add Crop
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search crops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "healthy", "warning", "critical"] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCrops.map((crop, index) => {
          const id = String(crop._id)
          const stage = String(crop.stage ?? "growing") as CropStage
          const status = String(crop.status ?? "healthy") as CropStatus
          const health = Number(crop.health ?? 0)

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Card className="hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                          status === "healthy"
                            ? "bg-primary/10"
                            : status === "warning"
                              ? "bg-accent/10"
                              : "bg-destructive/10"
                        }`}
                      >
                        <Sprout
                          className={`h-6 w-6 ${
                            status === "healthy"
                              ? "text-primary"
                              : status === "warning"
                                ? "text-accent"
                                : "text-destructive"
                          }`}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-base">{String(crop.name)}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">
                          {String(crop.cropType)}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/crops/${id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/diagnosis">AI Diagnosis</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${stageColors[stage]} text-primary-foreground`}
                    >
                      {stageLabels[stage]}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {String(crop.area)} {String(crop.areaUnit ?? "acres")}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Health</span>
                      <span className="font-medium">{health}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${
                          health >= 80
                            ? "bg-primary"
                            : health >= 60
                              ? "bg-accent"
                              : "bg-destructive"
                        }`}
                        style={{ width: `${health}%` }}
                      />
                    </div>
                  </div>

                  {crop.plantedDate ? (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        Planted{" "}
                        {new Date(String(crop.plantedDate)).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  ) : null}

                  {crop.nextTask ? (
                    <p className="text-sm text-muted-foreground border-t border-border pt-3">
                      Next: {String(crop.nextTask)}
                    </p>
                  ) : null}

                  <Button variant="outline" className="w-full gap-2" asChild>
                    <Link href={`/dashboard/crops/${id}`}>
                      View Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {filteredCrops.length === 0 && (
        <div className="text-center py-12">
          <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No crops found</h3>
          <p className="text-muted-foreground mb-4">
            {crops.length === 0
              ? "Add your first crop to start tracking."
              : "Try adjusting your search or filter."}
          </p>
          <Button asChild>
            <Link href="/dashboard/crops/new">Add Your First Crop</Link>
          </Button>
        </div>
      )}
    </motion.div>
  )
}

