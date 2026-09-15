"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

  function handleChange(value: string | null) {
    if (!value) return
    const params = new URLSearchParams(searchParams.toString())
    params.set("currency", value)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <Select value={current ?? "USD"} onValueChange={handleChange}>
      <SelectTrigger aria-label="Currency" className="min-h-11 font-medium">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((currency) => (
          <SelectItem key={currency} value={currency}>
            {currency}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
