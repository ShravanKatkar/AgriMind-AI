"use client"

import { useId } from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  type TooltipProps,
} from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"
import { ChartInView } from "@/components/dashboard/charts/chart-in-view"

const BAR_RISE = {
  isAnimationActive: true,
  animationEasing: "ease-out" as const,
  animationDuration: 800,
}

const TICK = { fontSize: 11, fill: "var(--muted-foreground)" }

function ChartTooltip({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md"
    >
      {label ? (
        <p className="mb-0.5 text-xs font-medium text-muted-foreground">{label}</p>
      ) : null}
      <p className="font-semibold text-foreground">
        <span className="text-agri-teal">{item?.value}</span>
        {item?.name ? (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            {item.name}
          </span>
        ) : null}
      </p>
    </motion.div>
  )
}

const SEVERITY_COLORS: Record<string, string> = {
  low: "var(--primary)",
  medium: "var(--accent)",
  high: "var(--destructive)",
}

function EmptyChart({ message }: { message: string }) {
  return (
    <p className="py-8 text-center text-sm text-muted-foreground">{message}</p>
  )
}

export function SignupTrendChart({
  data,
}: {
  data: { date: string; signups: number }[]
}) {
  const gradientId = useId().replace(/:/g, "")

  if (!data.length) {
    return <EmptyChart message="No signup data yet" />
  }

  return (
    <ChartInView>
      {(inView) => {
        const chartData = inView
          ? data
          : data.map((d) => ({ ...d, signups: 0 }))
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} key={inView ? "signup-rise" : "signup-idle"}>
              <defs>
                <linearGradient id={`${gradientId}-bar`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--agri-teal-light)" />
                  <stop offset="100%" stopColor="var(--agri-teal)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" className="stroke-border/60" />
              <XAxis dataKey="date" tick={TICK} />
              <YAxis tick={TICK} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="signups"
                fill={`url(#${gradientId}-bar)`}
                radius={[4, 4, 0, 0]}
                name="Signups"
                {...BAR_RISE}
              />
            </BarChart>
          </ResponsiveContainer>
        )
      }}
    </ChartInView>
  )
}

export function PlatformActivityChart({
  data,
}: {
  data: { date: string; diagnoses: number; voice: number }[]
}) {
  if (!data.length) {
    return <EmptyChart message="No activity data yet" />
  }

  return (
    <ChartInView>
      {(inView) => {
        const chartData = inView
          ? data
          : data.map((d) => ({ ...d, diagnoses: 0, voice: 0 }))
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} key={inView ? "activity-rise" : "activity-idle"}>
              <CartesianGrid strokeDasharray="4 4" className="stroke-border/60" />
              <XAxis dataKey="date" tick={TICK} />
              <YAxis tick={TICK} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="diagnoses"
                stroke="var(--agri-teal)"
                strokeWidth={2}
                dot={false}
                name="Diagnoses"
                animationDuration={inView ? 800 : 0}
              />
              <Line
                type="monotone"
                dataKey="voice"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
                name="Voice sessions"
                animationDuration={inView ? 800 : 0}
              />
            </LineChart>
          </ResponsiveContainer>
        )
      }}
    </ChartInView>
  )
}

export function SeverityPieChart({
  data,
}: {
  data: { severity: string; count: number }[]
}) {
  if (!data.length) {
    return <EmptyChart message="No diagnosis reports yet" />
  }

  return (
    <ChartInView>
      {() => (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="severity"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ severity, count }) => `${severity}: ${count}`}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.severity}
                  fill={SEVERITY_COLORS[entry.severity] ?? "var(--muted-foreground)"}
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartInView>
  )
}

export function DistrictBarChart({
  data,
}: {
  data: { district: string; farmers: number }[]
}) {
  const gradientId = useId().replace(/:/g, "")

  if (!data.length) {
    return <EmptyChart message="No district data yet" />
  }

  return (
    <ChartInView>
      {(inView) => {
        const chartData = inView
          ? data
          : data.map((d) => ({ ...d, farmers: 0 }))
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              key={inView ? "district-rise" : "district-idle"}
            >
              <defs>
                <linearGradient id={`${gradientId}-h`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--agri-teal-light)" />
                  <stop offset="100%" stopColor="var(--agri-teal-dark)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" className="stroke-border/60" />
              <XAxis type="number" tick={TICK} allowDecimals={false} />
              <YAxis dataKey="district" type="category" width={90} tick={TICK} />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="farmers"
                fill={`url(#${gradientId}-h)`}
                radius={[0, 4, 4, 0]}
                name="Farmers"
                {...BAR_RISE}
              />
            </BarChart>
          </ResponsiveContainer>
        )
      }}
    </ChartInView>
  )
}
