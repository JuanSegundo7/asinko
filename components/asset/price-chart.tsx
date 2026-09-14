"use client"

import { useMemo, useState } from "react"
import { cn } from "cn"
import { formatPercentPrecise } from "@/lib/format"
import type { PricePoint, PriceRange } from "@/lib/types"

const RANGES: { key: PriceRange; label: string; days: number }[] = [
  { key: "7D", label: "7D", days: 7 },
  { key: "1M", label: "1M", days: 30 },
  { key: "3M", label: "3M", days: 90 },
  { key: "1A", label: "1A", days: 365 },
  { key: "TODO", label: "Todo", days: Infinity },
]

function filterByRange(history: PricePoint[], days: number): PricePoint[] {
  if (!Number.isFinite(days)) return history
  return history.slice(-days)
}

/**
 * D4: gráfico de precio — SVG hecho a mano (sin sumar una librería de charts para un solo
 * sparkline), sobre la serie mock de `lib/mock-data.ts`. Rango default 1M; se ofrecen
 * 7D/1M/3M/1A/Todo — se descarta "1D" de la referencia porque no hay ninguna noción de intradía
 * en el modelo de datos (inventar granularidad horaria sí sería el tipo de dato sin base que el
 * CLAUDE.md pide evitar).
 *
 * Color: verde/rojo (positive/negative) es una excepción puntual a D8 ("ni score ni números
 * llevan color") — esa regla apunta al dominio de votos/score de la comunidad; la variación de
 * precio es un dominio de mercado distinto, sin ningún score en la misma vista, así que no diluye
 * la señal original.
 */
export function PriceChart({ history }: { history: PricePoint[] }) {
  const [range, setRange] = useState<PriceRange>("1M")
  const rangeDef = RANGES.find((r) => r.key === range)!
  const points = useMemo(() => filterByRange(history, rangeDef.days), [history, rangeDef.days])

  const { linePath, areaPath, isUp, changePct } = useMemo(() => {
    const closes = points.map((p) => p.close)
    const min = Math.min(...closes)
    const max = Math.max(...closes)
    const span = max - min || 1
    const width = 100
    const height = 32
    const coords = points.map((p, i) => {
      const x = (i / (points.length - 1 || 1)) * width
      const y = height - ((p.close - min) / span) * height
      return [x, y] as const
    })
    const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ")
    const areaPath = `${linePath} L${width},${height} L0,${height} Z`
    const first = closes[0] ?? 0
    const last = closes[closes.length - 1] ?? 0
    const changePct = first ? ((last - first) / first) * 100 : 0
    return { linePath, areaPath, isUp: changePct >= 0, changePct }
  }, [points])

  const colorClass = isUp ? "text-positive" : "text-negative"
  const gradientId = isUp ? "price-chart-up" : "price-chart-down"

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className={cn("font-mono text-sm font-medium tabular-nums", colorClass)}>
          {formatPercentPrecise(changePct)}
        </span>
        <span className="text-xs text-muted-foreground">{rangeDef.label}</span>
      </div>

      <svg
        viewBox="0 0 100 32"
        preserveAspectRatio="none"
        className={cn("mt-2 h-20 w-full overflow-visible", colorClass)}
        role="img"
        aria-label={`Precio de NVDA en el rango ${rangeDef.label}, variación ${formatPercentPrecise(changePct)}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
        <path d={linePath} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>

      <div role="group" aria-label="Rango del gráfico" className="mt-2 flex items-center gap-0.5 overflow-x-auto">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            aria-pressed={range === r.key}
            onClick={() => setRange(r.key)}
            className={cn(
              "press-feedback min-h-11 shrink-0 rounded-md px-2.5 text-xs font-medium",
              range === r.key
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}
