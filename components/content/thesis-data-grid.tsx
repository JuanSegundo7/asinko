import { ArrowDown, ArrowUp } from "lucide-react"
import { cn } from "cn"
import { ConvictionMeter } from "./conviction-meter"
import { Skeleton } from "@/components/ui/skeleton"
import {
  convertFromUSD,
  daysRemaining,
  formatAbsolute,
  formatCurrency,
  formatPercent,
} from "@/lib/format"
import type { Currency, ExchangeRates, Thesis } from "@/lib/types"

/** Grilla de 4 celdas del dato duro de la tesis. La 4ta celda es contextual: dentro de la página del activo, la celda "Activo" del modelo es redundante y se reemplaza por precio actual/cierre. */
export function ThesisDataGrid({
  thesis,
  assetPriceUsd,
  currency,
  rates,
  className,
}: {
  thesis: Thesis
  assetPriceUsd: number
  currency: Currency
  rates: ExchangeRates
  className?: string
}) {
  const secondary =
    currency !== "USD"
      ? formatCurrency(convertFromUSD(thesis.targetPrice, currency, rates), currency)
      : null

  const days = daysRemaining(thesis.deadline)
  const gapPct = ((thesis.targetPrice - assetPriceUsd) / assetPriceUsd) * 100
  const DirectionIcon = thesis.direction === "ABOVE" ? ArrowUp : ArrowDown
  // D15: dirección/variación de precio es dominio de mercado, no de voto/score — mismo criterio
  // ya establecido en D9 para el gráfico de precio, no pisa la regla de D6/D8 (esa es sobre
  // voto/consenso/resultado, no sobre hacia dónde apunta un precio).
  const directionColorClass = thesis.direction === "ABOVE" ? "text-positive" : "text-negative"
  const gapColorClass = gapPct === 0 ? "text-muted-foreground" : gapPct > 0 ? "text-positive" : "text-negative"

  return (
    <dl
      className={cn(
        // @container en el ancestro (ThesisCard/ThesisDetail): esto tiene que responder al ancho
        // real de la card, no al del viewport — con la card en un grid de 2 columnas, un breakpoint
        // de viewport (`sm:`) se activa igual aunque la card sea angosta, rompiendo la grilla.
        "grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border @[340px]:grid-cols-4",
        className
      )}
    >
      <Cell label="Target price">
        <span className={cn("inline-flex items-center gap-1", directionColorClass)}>
          <DirectionIcon className="size-4" aria-hidden="true" />
          <span className="text-foreground">{formatCurrency(thesis.targetPrice, "USD")}</span>
        </span>
        {secondary && <span className="text-xs text-muted-foreground">≈ {secondary}</span>}
      </Cell>

      <Cell label="Deadline" numeric={false}>
        {formatAbsolute(thesis.deadline)}
        {thesis.status === "OPEN" && (
          <span className="text-xs text-muted-foreground">
            {days >= 0 ? `${days} days left` : "past due"}
          </span>
        )}
      </Cell>

      <Cell label="Conviction" numeric={false}>
        <ConvictionMeter conviction={thesis.conviction} className="flex-col items-start gap-1" />
      </Cell>

      <Cell label={thesis.status === "OPEN" ? "Current price" : "Close"}>
        {thesis.status === "OPEN" ? (
          <>
            {formatCurrency(assetPriceUsd, "USD")}
            <span className={cn("text-xs", gapColorClass)}>{formatPercent(gapPct)} to go</span>
          </>
        ) : (
          formatCurrency(thesis.resolutionPrice ?? 0, "USD")
        )}
      </Cell>
    </dl>
  )
}

function Cell({
  label,
  children,
  numeric = true,
}: {
  label: string
  children: React.ReactNode
  numeric?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 bg-muted p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "flex flex-col text-sm font-medium text-foreground",
          numeric && "font-mono tabular-nums"
        )}
      >
        {children}
      </dd>
    </div>
  )
}

/** Mismo grid de 4 celdas (mismo `@container`/breakpoint `@[340px]:grid-cols-4`), para skeletons de card/detalle. */
export function ThesisDataGridSkeleton({ className }: { className?: string }) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border @[340px]:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 bg-muted p-3">
          <Skeleton className="h-3 w-12 bg-border" />
          <Skeleton className="h-4 w-16 bg-border" />
        </div>
      ))}
    </dl>
  )
}
