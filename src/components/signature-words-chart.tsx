"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart"
import type { WortschatzDnaSignatureWord } from "@/lib/api/word-stats"

const POS_COLORS: Record<string, string> = {
  NOUN: "hsl(217 91% 60%)",
  VERB: "hsl(142 71% 45%)",
  ADJ: "hsl(32 95% 55%)",
  ADV: "hsl(280 68% 60%)",
}
const DEFAULT_POS_COLOR = "hsl(var(--muted-foreground))"

const POS_LABELS: Record<string, string> = {
  NOUN: "Nomen",
  VERB: "Verben",
  ADJ: "Adjektive",
  ADV: "Adverbien",
}

function getPosColor(pos: string): string {
  return POS_COLORS[pos] ?? DEFAULT_POS_COLOR
}

interface SignatureWordsChartProps {
  data: WortschatzDnaSignatureWord[]
  rapperName: string
  totalRappers?: number
}

export function SignatureWordsChart({ data, rapperName, totalRappers }: SignatureWordsChartProps) {
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
    return data
      .slice(0, maxItems)
      .map((w) => ({
        lemma: w.lemma,
        tfidf: w.tfidf,
        pos: w.pos,
        count: w.count,
        n_rappers: w.n_rappers,
      }))
      // Data arrives sorted by tfidf desc — first item = highest score = top of chart
  }, [data, maxItems])

  // Determine which POS tags appear in the data for the legend
  const activePosSet = useMemo(() => {
    const s = new Set<string>()
    for (const d of chartData) s.add(d.pos)
    return s
  }, [chartData])

  const chartConfig = {
    tfidf: {
      label: "Signatur-Score",
      color: "hsl(217 91% 60%)",
    },
  } satisfies ChartConfig

  const barHeight = 36
  const chartHeight = Math.max(200, chartData.length * barHeight + 80)

  return (
    <div className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm p-4 sm:p-6">
      <p className="text-xs text-muted-foreground mb-2">
        Top Signatur-Wörter — <span className="font-semibold text-foreground">{rapperName}</span>
      </p>

      {/* POS legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(POS_COLORS)
          .filter(([pos]) => activePosSet.has(pos))
          .map(([pos, color]) => (
            <div key={pos} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-[11px] text-muted-foreground">
                {POS_LABELS[pos] ?? pos}
              </span>
            </div>
          ))}
        {Array.from(activePosSet).some((p) => !(p in POS_COLORS)) && (
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: DEFAULT_POS_COLOR }}
            />
            <span className="text-[11px] text-muted-foreground">Andere</span>
          </div>
        )}
      </div>

      <ChartContainer
        config={chartConfig}
        className="w-full"
        style={{ height: chartHeight, aspectRatio: "unset" }}
      >
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 24, bottom: 4, left: 0 }}
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
            tickFormatter={(v: number) => Math.round(v).toString()}
          />
          <ChartTooltip
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0]?.payload
              if (!d) return null
              return (
                <div className="rounded-lg border border-border/40 bg-card px-3 py-2 text-sm shadow-md">
                  <p className="font-semibold mb-1">{d.lemma}</p>
                  <p className="text-muted-foreground">
                    <span
                      className="inline-block h-2 w-2 rounded-full mr-1.5"
                      style={{ backgroundColor: getPosColor(d.pos) }}
                    />
                    {POS_LABELS[d.pos] ?? d.pos}
                  </p>
                  <p className="font-mono text-xs mt-1">
                    Signatur-Score: {d.tfidf.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {d.count.toLocaleString("de-DE")}× verwendet · bei {d.n_rappers}{totalRappers ? ` von ${totalRappers}` : ""} Rappern
                  </p>
                </div>
              )
            }}
          />
          <Bar dataKey="tfidf" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {chartData.map((entry, idx) => (
              <Cell key={idx} fill={getPosColor(entry.pos)} />
            ))}
          </Bar>
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
