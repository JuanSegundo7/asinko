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

/** Días de calendario restantes hasta el deadline (puede ser negativo si ya pasó). Compara fechas UTC, ignorando la hora del día, para que la hora exacta del deadline no corra el conteo un día. */
export function daysRemaining(deadlineIso: string, now: Date = MOCK_NOW): number {
  const deadline = new Date(deadlineIso)
  const deadlineUtcDay = Date.UTC(deadline.getUTCFullYear(), deadline.getUTCMonth(), deadline.getUTCDate())
  const nowUtcDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  return Math.round((deadlineUtcDay - nowUtcDay) / DAY)
}

const MINUS_SIGN = "−"

/** Signo real "−" (no guion), "0" sin signo cuando el neto es 0. Compartido por formatScore (upvotes/downvotes de una pieza) y cualquier otro neto ya calculado (ej. score agregado de un contribuidor). */
export function formatNetScore(net: number): string {
  if (net === 0) return "0"
  if (net < 0) return `${MINUS_SIGN}${Math.abs(net)}`
  return `+${net}`
}

/** Signo real "−" (no guion), "0" sin signo cuando el score es neutro. */
export function formatScore(upvotes: number, downvotes: number): string {
  return formatNetScore(upvotes - downvotes)
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

/** Igual que formatPercent pero con 2 decimales — para variación diaria de precio ("+2.41%"), donde redondear al entero perdería toda la señal del día. */
export function formatPercentPrecise(value: number): string {
  const rounded = Math.round(value * 100) / 100
  if (rounded === 0) return "0%"
  const sign = rounded < 0 ? MINUS_SIGN : "+"
  return `${sign}${Math.abs(rounded).toFixed(2)}%`
}

/** "$4.5T" / "$28.4B" — para market cap y volumen, donde el valor completo en USD no cabe ni aporta nada. */
export function formatCompactUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(amount)
}

export function convertFromUSD(
  amountUsd: number,
  currency: Currency,
  rates: ExchangeRates
): number {
  if (currency === "USD") return amountUsd
  return amountUsd * rates[currency]
}
