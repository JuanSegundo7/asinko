import { useSyncExternalStore } from "react"

const CAME_FROM_FEED_KEY = "asinko:cameFromFeed"

/** Se marca al hacer click en una card, antes de navegar al detalle, para que BackLink sepa si puede usar router.back() (restaura scroll) o si tiene que caer a un <Link> plano (entrada directa por URL, sin historial propio). */
export function markCameFromFeed() {
  try {
    sessionStorage.setItem(CAME_FROM_FEED_KEY, "1")
  } catch {
    // sessionStorage inaccesible (modo privado, etc.) — BackLink cae al <Link> plano.
  }
}

export function hasCameFromFeed(): boolean {
  try {
    return sessionStorage.getItem(CAME_FROM_FEED_KEY) === "1"
  } catch {
    return false
  }
}

const noopSubscribe = () => () => {}

/** Lee sessionStorage (fuente externa al render de React) sin el anti-patrón setState-en-effect; en el server siempre "false". */
export function useCameFromFeed(): boolean {
  return useSyncExternalStore(noopSubscribe, hasCameFromFeed, () => false)
}
