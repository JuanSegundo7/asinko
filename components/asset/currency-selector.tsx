"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { Currency } from "@/lib/types"

const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "JPY"]

const REGION_CURRENCY: Record<string, Currency> = {
  US: "USD",
  GB: "GBP",
  JP: "JPY",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  IE: "EUR",
  PT: "EUR",
  AT: "EUR",
  BE: "EUR",
  FI: "EUR",
  GR: "EUR",
}

function detectDefaultCurrency(): Currency {
  try {
    const region = new Intl.Locale(navigator.language).maximize().region ?? ""
    return REGION_CURRENCY[region] ?? "USD"
  } catch {
    return "USD"
  }
}

export function CurrencySelector() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get("currency")

  useEffect(() => {
    if (current) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("currency", detectDefaultCurrency())
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    // Solo debe correr una vez al montar: fija el default, no reacciona a cambios posteriores del propio selector.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("currency", value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <label className="inline-flex items-center gap-1">
      <span className="sr-only">Divisa</span>
      <select
        value={current ?? "USD"}
        onChange={(e) => handleChange(e.target.value)}
        className="min-h-11 rounded-md border border-border bg-background px-2 text-sm font-medium text-foreground"
      >
        {CURRENCIES.map((currency) => (
          <option key={currency} value={currency}>
            {currency}
          </option>
        ))}
      </select>
    </label>
  )
}
