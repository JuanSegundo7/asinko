"use client"

import Image from "next/image"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { SquircleSurface } from "@/components/ui/squircle-surface"
import { CurrencySelector } from "./currency-selector"
import { PriceChart } from "./price-chart"
import { useExchangeRatesQuery, usePriceHistoryQuery } from "@/lib/queries"
import { useCurrency } from "@/lib/use-currency"
import {
  convertFromUSD,
  formatAbsolute,
  formatCompactUsd,
  formatCurrency,
  formatPercentPrecise,
} from "@/lib/format"
import type { Asset } from "@/lib/types"

/** D4: card flotante del activo (antes era una franja plana pegada al header) — ticker/precio como siempre (D7 sin cambios) + stats de mercado y gráfico de precio, todo derivado del mock (ver lib/mock-data.ts y DECISIONS.md para el porqué de cada número nuevo). */
export function AssetHeader({ asset }: { asset: Asset }) {
  const currency = useCurrency()
  const { data: rates } = useExchangeRatesQuery()
  const { data: history } = usePriceHistoryQuery(asset.ticker)

  const price = formatCurrency(asset.price, "USD")
  const secondaryPrice =
    currency !== "USD" && rates ? formatCurrency(convertFromUSD(asset.price, currency, rates), currency) : null

  const dayChangePct = (() => {
    if (!history || history.length < 2) return null
    const last = history[history.length - 1].close
    const prev = history[history.length - 2].close
    return prev ? ((last - prev) / prev) * 100 : null
  })()

  // Market cap se deriva de price * sharesOutstanding (no es un campo suelto que se pueda desincronizar del precio).
  const marketCap = asset.price * asset.sharesOutstanding

  return (
    <div className="mx-auto w-full max-w-[100rem] px-4 py-6 2xl:px-8">
      <SquircleSurface cornerRadius={28} elevation={2} className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <Image src="/nvidia.webp" alt="" width={32} height={32} className="rounded-full" />
            <h1 className="font-mono text-xl font-semibold tracking-tight text-foreground">{asset.ticker}</h1>
            <span className="font-serif italic text-muted-foreground">{asset.name}</span>
            <Badge variant="outline" className="font-normal text-muted-foreground">
              {asset.sector}
            </Badge>
          </div>
          <CurrencySelector />
        </div>

        <div className="mt-5 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="font-mono text-2xl font-semibold tabular-nums text-foreground">{price}</span>
              {secondaryPrice && (
                <span className="font-mono text-sm tabular-nums text-muted-foreground">≈ {secondaryPrice}</span>
              )}
              {dayChangePct !== null && (
                <span
                  className={cn(
                    "font-mono text-sm font-medium tabular-nums",
                    dayChangePct >= 0 ? "text-positive" : "text-negative"
                  )}
                >
                  {formatPercentPrecise(dayChangePct)}{" "}
                  <span className="font-sans font-normal text-muted-foreground">(24h)</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <Stat label="Market Cap" value={formatCompactUsd(marketCap)} />
              <Stat label="Volumen 24h" value={formatCompactUsd(asset.volume24h)} />
              <Stat
                label="ATH"
                value={formatCurrency(asset.athPrice, "USD")}
                sub={formatAbsolute(asset.athDate)}
              />
            </div>
          </div>

          <div className="w-full xl:w-96 xl:shrink-0">
            {history ? (
              <PriceChart history={history} />
            ) : (
              <div className="h-32 animate-pulse rounded-lg bg-muted" />
            )}
          </div>
        </div>
      </SquircleSurface>
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-sm tabular-nums text-foreground">{value}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  )
}
