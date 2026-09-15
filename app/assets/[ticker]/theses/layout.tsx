"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { consumeFeedScroll, usePanelIntentPath } from "@/lib/scroll-restoration"

/**
 * Regex local, solo detalle de tesis (`/assets/[ticker]/theses/[id]`) — a diferencia de
 * `isDetailRoute` (lib/routes.ts), que matchea posts|theses en cualquier nivel y sirve para
 * ocultar chrome global (TopHeader, TabBar, AppNav). Acá interesa solo distinguir el detalle del
 * propio listado (`/theses`), porque son los dos únicos hijos de este layout.
 */
const THESIS_DETAIL_ROUTE = /^\/assets\/[^/]+\/theses\/[^/]+$/

/**
 * D2 (scopeado a tesis): el slot @panel vivía en `[ticker]/layout.tsx` y por eso interceptaba
 * clicks en CUALQUIER card del feed principal. Según la semántica de rutas interceptadas de
 * Next.js, `(.)folder` declarado en un layout solo intercepta navegaciones que se originan DESDE
 * DENTRO del subárbol de ese layout — así que moviendo @panel a este layout (montado en
 * `/assets/[ticker]/theses`), la interceptación queda scopeada al listado de tesis: click en una
 * tesis desde `/theses` abre el panel, click desde el feed principal o desde ThesisTracker
 * (columna derecha, fuera de este subárbol) navega en frío a la página completa
 * (`theses/[id]/page.tsx`). Los posteos nunca interceptan: no tienen @panel en ningún nivel.
 *
 * Mismo bug de Next.js 16.3.4 que tenía `[ticker]/layout.tsx` (confirmado en dev y build de
 * producción): en una entrada directa/hard-refresh a `/theses/[id]`, @panel debería resolver
 * `default.tsx` (nada de qué interceptar) pero en la práctica también resuelve la ruta
 * interceptada. `usePanelIntentPath` guarda el path exacto al que se navegó desde una card
 * (lib/scroll-restoration.ts, sin cambios); si no coincide con la ruta actual, se ignora lo que
 * @panel haya resuelto.
 *
 * También restaura el scroll de la lista de tesis: Next resetea la ventana a (0,0) en la
 * navegación interceptada del panel aun con `scroll={false}` en el Link, así que se guarda a mano
 * en el click (markCameFromFeed, sin cambios) y se restaura acá al volver a `/theses`.
 */
export default function ThesesLayout({
  children,
  panel,
}: {
  children: React.ReactNode
  panel: React.ReactNode
}) {
  const pathname = usePathname()
  const detailRoute = THESIS_DETAIL_ROUTE.test(pathname)
  const panelIntentPath = usePanelIntentPath()
  const trustPanelSlot = !detailRoute || panelIntentPath === pathname

  useEffect(() => {
    if (!detailRoute) {
      const savedY = consumeFeedScroll()
      if (savedY !== null) window.scrollTo(0, savedY)
    }
  }, [pathname, detailRoute])

  return (
    <>
      {children}
      {trustPanelSlot && panel}
    </>
  )
}
