"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
  Legend,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { VocabDuelWord } from "@/lib/api/word-stats"

type DuelMode = "absolute" | "normalized" | "perBattle"

interface VocabDuelChartProps {
  data: VocabDuelWord[]
  rapperAName: string
  rapperBName: string
  mode: DuelMode
  onModeChange: (mode: DuelMode) => void
  rapperATotalBattles?: number
  rapperBTotalBattles?: number
}

export function VocabDuelChart({
  data,
  rapperAName,
  rapperBName,
  mode,
  onModeChange,
  rapperATotalBattles,
  rapperBTotalBattles,
}: VocabDuelChartProps) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)")
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const maxItems = isMobile ? 10 : 15

  const chartData = useMemo(() => {
    // Compute display values based on mode
    const withValues = data.map((w) => {
      let valA: number
      let valB: number
      if (mode === "absolute") {
        valA = w.count_a
        valB = w.count_b
      } else if (mode === "perBattle") {
        valA = rapperATotalBattles && rapperATotalBattles > 0 ? w.count_a / rapperATotalBattles : 0
        valB = rapperBTotalBattles && rapperBTotalBattles > 0 ? w.count_b / rapperBTotalBattles : 0
      } else {
        valA = w.rate_a
        valB = w.rate_b
      }
      return { ...w, valA, valB }
    })

    // Re-sort by biggest difference in active mode
    withValues.sort((a, b) => Math.abs(b.valA - b.valB) - Math.abs(a.valA - a.valB))

    return withValues.slice(0, maxItems).map((w) => ({
      lemma: w.lemma,
      rapperA: -w.valA,
      rapperB: w.valB,
      _valA: w.valA,
      _valB: w.valB,
      _countA: w.count_a,
      _countB: w.count_b,
    })).reverse() // largest diff at top
  }, [data, maxItems, mode, rapperATotalBattles, rapperBTotalBattles])

  const chartConfig = {
    rapperA: {
      label: rapperAName,
      color: "hsl(217 91% 60%)",
    },
    rapperB: {
      label: rapperBName,
      color: "hsl(0 84% 60%)",
    },
  } satisfies ChartConfig

  const barHeight = 36
  const chartHeight = Math.max(200, chartData.length * barHeight + 80)

  const modeLabel = mode === "absolute" ? "absolut" : mode === "perBattle" ? "pro Battle" : "pro 1.000 Wörter"
  const formatVal = (v: number) => {
    if (mode === "absolute") return Math.abs(v).toLocaleString("de-DE")
    if (mode === "perBattle") return Math.abs(v).toFixed(2)
    return Math.abs(v).toFixed(1)
  }

  return (
    <div className="mt-6 rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <p className="text-xs text-muted-foreground">
          Gemeinsame Wörter mit dem größten Unterschied ({modeLabel})
        </p>
        <Tabs
          value={mode}
          onValueChange={(v) => onModeChange(v as DuelMode)}
          className="shrink-0"
        >
          <TabsList className="h-7">
            <TabsTrigger value="absolute" className="text-[11px] px-2.5 h-6">
              Absolut
            </TabsTrigger>
            <TabsTrigger value="normalized" className="text-[11px] px-2.5 h-6">
              Pro 1k
            </TabsTrigger>
            <TabsTrigger value="perBattle" className="text-[11px] px-2.5 h-6">
              Pro Battle
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ChartContainer
        config={chartConfig}
        className="w-full"
        style={{ height: chartHeight, aspectRatio: "unset" }}
      >
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 24, bottom: 20, left: 0 }}
          stackOffset="sign"
        >
          <CartesianGrid
            horizontal={false}
            stroke="hsl(var(--border))"
            strokeDasharray="3 3"
          />
          <YAxis
            dataKey="lemma"
            type="category"
            width={100}
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <XAxis
            type="number"
            tick={{
              fontSize: 11,
              fill: "hsl(var(--muted-foreground))",
              fontFamily: "var(--font-code, monospace)",
            }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatVal}
            label={{
              value: `← ${rapperAName}  |  ${rapperBName} →`,
              position: "insideBottom",
              offset: -10,
              style: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
            }}
          />
          <ReferenceLine x={0} stroke="hsl(var(--border))" />
          <ChartTooltip
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0]?.payload
              if (!d) return null
              return (
                <div className="rounded-lg border border-border/40 bg-card px-3 py-2 text-sm shadow-md">
                  <p className="font-semibold mb-1">{d.lemma}</p>
                  <p style={{ color: "hsl(217 91% 60%)" }}>
                    {rapperAName}: {mode === "absolute" ? `${d._countA.toLocaleString("de-DE")}×` : `${d._valA.toFixed(2)} ${modeLabel} (${d._countA.toLocaleString("de-DE")}×)`}
                  </p>
                  <p style={{ color: "hsl(0 84% 60%)" }}>
                    {rapperBName}: {mode === "absolute" ? `${d._countB.toLocaleString("de-DE")}×` : `${d._valB.toFixed(2)} ${modeLabel} (${d._countB.toLocaleString("de-DE")}×)`}
                  </p>
                </div>
              )
            }}
          />
          <Legend
            verticalAlign="top"
            height={30}
            formatter={(value: string) => (
              <span className="text-xs text-muted-foreground">
                {value === "rapperA" ? rapperAName : rapperBName}
              </span>
            )}
          />
          <Bar
            dataKey="rapperA"
            fill="var(--color-rapperA)"
            radius={[4, 0, 0, 4]}
            maxBarSize={28}
            stackId="stack"
          />
          <Bar
            dataKey="rapperB"
            fill="var(--color-rapperB)"
            radius={[0, 4, 4, 0]}
            maxBarSize={28}
            stackId="stack"
          />
        </BarChart>
      </ChartContainer>

      {data.length > maxItems && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          und {data.length - maxItems} weitere Wörter
        </p>
      )}
    </div>
  )
}
