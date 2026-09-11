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
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h1 className="text-xl font-semibold text-foreground">{asset.ticker}</h1>
        <span className="text-muted-foreground">· {asset.name}</span>
        <span className="text-lg font-medium tabular-nums text-foreground">· {price}</span>
      </div>
      <CurrencySelector />
    </header>
  )
}
