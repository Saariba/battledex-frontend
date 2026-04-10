"use client"

import { useState, useEffect } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export interface WordChartEntry {
  rapper_name: string
  count: number
  per1k?: number
  perBattle?: number
}

interface WordLookupChartProps {
  data: WordChartEntry[]
  mode: "absolute" | "normalized" | "perBattle"
}

const chartConfig = {
  count: {
    label: "Verwendungen",
    color: "hsl(var(--primary))",
  },
  per1k: {
    label: "Pro 1.000 Wörter",
    color: "hsl(var(--primary))",
  },
  perBattle: {
    label: "Pro Battle",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function WordLookupChart({ data, mode }: WordLookupChartProps) {
  const dataKey = mode === "perBattle" ? "perBattle" : mode === "normalized" ? "per1k" : "count"

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)")
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const maxItems = isMobile ? 10 : 20
  const chartData = data.slice(0, maxItems)

  // Dynamic height based on number of bars
  const barHeight = 32
  const chartHeight = Math.max(200, chartData.length * barHeight + 60)

  return (
    <div
      className="mt-6 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-4 sm:p-6"
    >
      <ChartContainer
        config={chartConfig}
        className="w-full"
        style={{ height: chartHeight, aspectRatio: "unset" }}
      >
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
        >
          <CartesianGrid
            horizontal={false}
            stroke="hsl(var(--border))"
            strokeDasharray="3 3"
          />
          <YAxis
            dataKey="rapper_name"
            type="category"
            width={120}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontFamily: "var(--font-code, monospace)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              mode === "absolute" ? v.toLocaleString("de-DE") : v.toFixed(1)
            }
          />
          <ChartTooltip
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
            content={
              <ChartTooltipContent
                formatter={(value, name) => {
                  const v = Number(value)
                  if (name === "perBattle" || mode === "perBattle") {
                    return `${v.toFixed(2)} pro Battle`
                  }
                  if (name === "per1k" || mode === "normalized") {
                    return `${v.toFixed(2)} pro 1.000 Wörter`
                  }
                  return `${v.toLocaleString("de-DE")} Verwendungen`
                }}
              />
            }
          />
          <Bar
            dataKey={dataKey}
            fill="var(--color-count)"
            radius={[0, 4, 4, 0]}
            maxBarSize={28}
          />
        </BarChart>
      </ChartContainer>

      {data.length > maxItems && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          und {data.length - maxItems} weitere Rapper
        </p>
      )}
    </div>
  )
}
