import { useSyncExternalStore } from "react"

const CAME_FROM_FEED_KEY = "asinko:cameFromFeed"
const FEED_SCROLL_KEY = "asinko:feedScrollY"
const PANEL_INTENT_KEY = "asinko:panelIntentPath"

/**
 * Se marca al hacer click en una card, antes de navegar al detalle, para que BackLink sepa si
 * puede usar router.back() (restaura scroll) o si tiene que caer a un <Link> plano (entrada
 * directa por URL, sin historial propio). También guarda el scroll actual del feed: Next.js
 * resetea el scroll a (0,0) en la navegación interceptada del panel (D2) aun con `scroll={false}`
 * en el Link, así que [ticker]/layout.tsx restaura este valor a mano al volver a la ruta del feed.
 *
 * `targetPath` (la ruta de detalle a la que se navega) queda guardado como "intención de panel":
 * en esta versión de Next, el slot @panel también resuelve la ruta interceptada en una entrada
 * directa/hard-refresh a esa misma URL (confirmado en dev y producción), no solo al navegar desde
 * una card como debería. [ticker]/layout.tsx solo confía en el contenido de @panel cuando el path
 * actual coincide con esta intención explícita; si no coincide (entrada directa real), ignora lo
 * que @panel haya resuelto y muestra la columna derecha por defecto en su lugar.
 */
export function markCameFromFeed(targetPath?: string) {
  try {
    sessionStorage.setItem(CAME_FROM_FEED_KEY, "1")
    sessionStorage.setItem(FEED_SCROLL_KEY, String(window.scrollY))
    if (targetPath) sessionStorage.setItem(PANEL_INTENT_KEY, targetPath)
  } catch {
    // sessionStorage inaccesible (modo privado, etc.) — BackLink cae al <Link> plano, sin scroll restore.
  }
}

/** Lee y consume (borra) el scroll guardado del feed. null si no hay nada pendiente de restaurar. */
export function consumeFeedScroll(): number | null {
  try {
    const raw = sessionStorage.getItem(FEED_SCROLL_KEY)
    if (raw === null) return null
    sessionStorage.removeItem(FEED_SCROLL_KEY)
    return Number(raw)
  } catch {
    return null
  }
}

export function hasCameFromFeed(): boolean {
  try {
    return sessionStorage.getItem(CAME_FROM_FEED_KEY) === "1"
  } catch {
    return false
  }
}

function getPanelIntentPath(): string | null {
  try {
    return sessionStorage.getItem(PANEL_INTENT_KEY)
  } catch {
    return null
  }
}

const noopSubscribe = () => () => {}

/** Lee sessionStorage (fuente externa al render de React) sin el anti-patrón setState-en-effect; en el server siempre "false"/null. */
export function useCameFromFeed(): boolean {
  return useSyncExternalStore(noopSubscribe, hasCameFromFeed, () => false)
}

export function usePanelIntentPath(): string | null {
  return useSyncExternalStore(noopSubscribe, getPanelIntentPath, () => null)
}
