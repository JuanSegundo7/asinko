"use client"

import { useSearchParams } from "next/navigation"
import type { Currency } from "./types"

const VALID_CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "JPY"]

/** La divisa activa vive únicamente en el search param (D7) — nunca en un store de cliente. */
export function useCurrency(): Currency {
  const searchParams = useSearchParams()
  const raw = searchParams.get("currency")?.toUpperCase()
  return (VALID_CURRENCIES as string[]).includes(raw ?? "") ? (raw as Currency) : "USD"
}
