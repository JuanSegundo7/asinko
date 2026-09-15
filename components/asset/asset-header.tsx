"use client"

import Image from "next/image"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { SquircleSurface } from "@/components/ui/squircle-surface"
import { Skeleton } from "@/components/ui/skeleton"
import { CurrencySelector } from "./currency-selector"
import { PriceChart, PriceChartSkeleton } from "./price-chart"
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
    <div className="mx-auto w-full max-w-[100rem] px-4 py-4 2xl:px-8">
      <SquircleSurface cornerRadius={28} elevation={2} className="p-4">
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

        <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-stretch xl:gap-8">
          <div className="flex flex-col gap-4 xl:flex-1 xl:justify-between">
            <div className="flex flex-wrap items-baseline gap-x-2.5 xl:mt-3">
              <span className="font-mono text-3xl xl:text-4xl font-semibold tabular-nums text-foreground">{price}</span>
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

            {/*
              `grid-cols-3` (versión anterior) fuerza columnas de ancho IGUAL sin importar el
              contenido — con "MARKET CAP $4.5T" mucho más corto que el ancho de su columna, el
              separador quedaba lejos del valor, pegado al borde de la columna en vez de al
              contenido real. `flex` con columnas al ancho de su contenido (sin `flex-1`, así no
              se estiran) + padding simétrico a cada lado del separador (`pr-4`/`px-4`/`pl-4`,
              16px de cada lado) es lo que realmente centra la línea entre los valores.
              `flex-wrap` como red de seguridad si alguna vez no entran los 3 en una fila angosta.
            */}
            <div className="grid grid-cols-1 gap-y-2 sm:flex sm:flex-wrap sm:items-start sm:divide-x sm:divide-border">
              <Stat label="Market Cap" value={formatCompactUsd(marketCap)} className="sm:pr-4" />
              <Stat label="24h Volume" value={formatCompactUsd(asset.volume24h)} className="sm:px-4" />
              <Stat
                label="ATH"
                value={formatCurrency(asset.athPrice, "USD")}
                sub={formatAbsolute(asset.athDate)}
                className="sm:pl-4"
              />
            </div>
          </div>

          <div className="w-full xl:w-96 xl:shrink-0">
            {history ? <PriceChart history={history} /> : <PriceChartSkeleton />}
          </div>
        </div>
      </SquircleSurface>
    </div>
  )
}

/** Calca la forma real de `AssetHeader`: ticker/badge, selector de moneda, precio, grilla de 3 stats y gráfico. */
export function AssetHeaderSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[100rem] px-4 py-4 2xl:px-8">
      <SquircleSurface cornerRadius={28} elevation={2} className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>

        <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-stretch xl:gap-8">
          <div className="flex flex-col gap-4 xl:flex-1 xl:justify-between">
            <div className="flex items-baseline gap-x-2.5 xl:mt-3">
              <Skeleton className="h-9 w-32 xl:h-10" />
              <Skeleton className="h-4 w-20" />
            </div>

            <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-3 sm:gap-x-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={cn("flex flex-col gap-1", i > 0 && "sm:pl-4")}>
                  <Skeleton className="h-2.5 w-20" />
                  <Skeleton className="h-6 w-16 sm:h-7" />
                </div>
              ))}
            </div>
          </div>

          <div className="w-full xl:w-96 xl:shrink-0">
            <PriceChartSkeleton />
          </div>
        </div>
      </SquircleSurface>
    </div>
  )
}

function Stat({
  label,
  value,
  sub,
  className,
}: {
  label: string
  value: string
  sub?: string
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="flex items-baseline gap-2">
        <span className="font-mono text-lg font-semibold tabular-nums text-foreground sm:text-2xl">{value}</span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </span>
    </div>
  )
}
