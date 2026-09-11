import type { Currency, ExchangeRates } from "./types"

/** Fecha de referencia fija para que las fechas relativas del seed sean siempre consistentes. */
export const MOCK_NOW = new Date("2026-09-10T12:00:00.000Z")

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const MONTH = 30 * DAY

/** "hace 3h", "hace 2 días", "hace 3 meses" — relativo a MOCK_NOW. */
export function formatRelative(iso: string, now: Date = MOCK_NOW): string {
  const diff = now.getTime() - new Date(iso).getTime()

  if (diff < MINUTE) return "recién"
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE)
    return `hace ${mins}m`
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR)
    return `hace ${hours}h`
  }
  if (diff < MONTH) {
    const days = Math.floor(diff / DAY)
    return `hace ${days} día${days === 1 ? "" : "s"}`
  }
  const months = Math.floor(diff / MONTH)
  return `hace ${months} mes${months === 1 ? "" : "es"}`
}

/** "15 mar 2027" — para deadlines y fechas absolutas compactas. */
export function formatAbsolute(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso))
}

/** "15 de marzo de 2027, 00:00" — para el atributo title/tooltip con la fecha completa. */
export function formatAbsoluteFull(iso: string): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

/** Días restantes hasta el deadline (puede ser negativo si ya pasó). */
export function daysRemaining(deadlineIso: string, now: Date = MOCK_NOW): number {
  return Math.ceil((new Date(deadlineIso).getTime() - now.getTime()) / DAY)
}

const MINUS_SIGN = "−"

/** Signo real "−" (no guion), "0" sin signo cuando el score es neutro. */
export function formatScore(upvotes: number, downvotes: number): string {
  const net = upvotes - downvotes
  if (net === 0) return "0"
  if (net < 0) return `${MINUS_SIGN}${Math.abs(net)}`
  return `+${net}`
}

export function voteAriaLabel(upvotes: number, downvotes: number): string {
  return `${upvotes} votos a favor, ${downvotes} en contra, puntaje ${formatScore(upvotes, downvotes)}`
}

/** Shell de formato fijo (en-US) para que el símbolo/agrupación no dependa del locale del server vs. cliente; Intl igual respeta los decimales propios de cada divisa (JPY sin decimales). */
export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

/** "+35%" / "−12%" con el mismo signo real que el score (D6), redondeado al entero más cercano. */
export function formatPercent(value: number): string {
  const rounded = Math.round(value)
  if (rounded === 0) return "0%"
  if (rounded < 0) return `${MINUS_SIGN}${Math.abs(rounded)}%`
  return `+${rounded}%`
}

export function convertFromUSD(
  amountUsd: number,
  currency: Currency,
  rates: ExchangeRates
): number {
  if (currency === "USD") return amountUsd
  return amountUsd * rates[currency]
}
