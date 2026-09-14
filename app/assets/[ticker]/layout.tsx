"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { isDetailRoute } from "@/lib/routes"
import { consumeFeedScroll, usePanelIntentPath } from "@/lib/scroll-restoration"

/**
 * D2: layout mínimo — solo expone el slot @panel (el drawer de detalle, ver DetailPanel) como
 * overlay junto a `children`. El resto de cada página (header, grid, columna derecha) vive en su
 * propia ruta: el drawer flota por encima sin necesitar compartir celda de grid con nada.
 *
 * Bug de Next.js (confirmado en dev y en build de producción, Next 16.3.4): en una entrada
 * directa/hard-refresh a una URL de detalle, @panel debería resolver a default.tsx (sin ninguna
 * navegación de la que interceptar), pero en la práctica también resuelve la ruta interceptada
 * — abriendo el drawer fantasma encima de la página completa. `usePanelIntentPath` guarda el
 * path exacto al que se navegó desde una card (lib/scroll-restoration.ts); si no coincide con la
 * ruta actual, se ignora lo que @panel haya resuelto.
 *
 * También restaura el scroll del feed: Next resetea la ventana a (0,0) en la navegación
 * interceptada del panel aun con `scroll={false}` en el Link, así que se guarda a mano en el
 * click (markCameFromFeed) y se restaura acá al volver a una ruta que no es de detalle.
 *
 * (La animación de cierre del drawer — D10 — la maneja DetailPanel con su propio estado local,
 * no este layout: Next desmonta el segmento @panel antes de que un AnimatePresence a este nivel
 * llegue a animar la salida, así que el spring de cierre vive adentro de DetailPanel mismo.)
 */
export default function TickerLayout({
  children,
  panel,
}: {
  children: React.ReactNode
  panel: React.ReactNode
}) {
  const pathname = usePathname()
  const detailRoute = isDetailRoute(pathname)
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
