import { ArrowDown, ArrowUp } from "lucide-react"
import { cn } from "cn"
import { ConvictionMeter } from "./conviction-meter"
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

  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4",
        className
      )}
    >
      <Cell label="Precio objetivo">
        <span className="inline-flex items-center gap-1">
          {thesis.direction === "ABOVE" ? (
            <ArrowUp className="size-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ArrowDown className="size-4 text-muted-foreground" aria-hidden="true" />
          )}
          {formatCurrency(thesis.targetPrice, "USD")}
        </span>
        {secondary && <span className="text-xs text-muted-foreground">≈ {secondary}</span>}
      </Cell>

      <Cell label="Deadline">
        {formatAbsolute(thesis.deadline)}
        {thesis.status === "OPEN" && (
          <span className="text-xs text-muted-foreground">
            {days >= 0 ? `faltan ${days} días` : "vencida"}
          </span>
        )}
      </Cell>

      <Cell label="Convicción" numeric={false}>
        <ConvictionMeter conviction={thesis.conviction} className="flex-col items-start gap-1" />
      </Cell>

      <Cell label={thesis.status === "OPEN" ? "Precio actual" : "Cierre"}>
        {thesis.status === "OPEN" ? (
          <>
            {formatCurrency(assetPriceUsd, "USD")}
            <span className="text-xs text-muted-foreground">
              faltan {formatPercent(((thesis.targetPrice - assetPriceUsd) / assetPriceUsd) * 100)}
            </span>
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
    <div className="flex flex-col gap-1 bg-card p-3">
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
