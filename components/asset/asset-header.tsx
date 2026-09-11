"use client"

import { CurrencySelector } from "./currency-selector"
import { useExchangeRatesQuery } from "@/lib/queries"
import { useCurrency } from "@/lib/use-currency"
import { convertFromUSD, formatCurrency } from "@/lib/format"
import type { Asset } from "@/lib/types"

export function AssetHeader({ asset }: { asset: Asset }) {
  const currency = useCurrency()
  const { data: rates } = useExchangeRatesQuery()

  const price = rates
    ? formatCurrency(convertFromUSD(asset.price, currency, rates), currency)
    : formatCurrency(asset.price, "USD")

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <h1 className="font-mono text-xl font-semibold tracking-tight text-foreground">
            {asset.ticker}
          </h1>
          <span className="font-serif italic text-muted-foreground">{asset.name}</span>
          <span className="font-mono text-lg font-medium tabular-nums text-foreground">
            {price}
          </span>
        </div>
        <CurrencySelector />
      </div>
    </header>
  )
}
