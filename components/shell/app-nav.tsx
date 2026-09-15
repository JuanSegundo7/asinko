"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "cn"
import { Compass, Home, LineChart, Star, UserRound } from "lucide-react"
import { NavItem } from "./nav-item"
import { UserAvatar } from "./user-avatar"
import { isDetailRoute } from "@/lib/routes"
import { useMediaQuery } from "@/lib/use-media-query"

const RAIL_WIDTH = 72
const EXPANDED_WIDTH = 256

/**
 * D4 (revisado): nav lateral colapsada a íconos por default en md+ (tablet y desktop, ya no solo
 * tablet), oculta en mobile (la reemplaza TabBar). Se expande con el hover del mouse mostrando
 * labels — no empuja el feed: el `<nav>` real es `fixed` y flota por encima del contenido al
 * crecer, mientras un placeholder a su lado (`aria-hidden`, mismo ancho que el rail colapsado)
 * es lo único que participa del layout en flex, para que el feed nunca se reacomode.
 *
 * Solo "Activos" está en el alcance del mockup; el resto queda deshabilitado a propósito en vez
 * de omitirse, para no sugerir que el producto real no las tiene. En una ruta de detalle por
 * debajo de xl, el panel a pantalla completa ya la tapa visualmente (z-50 opaco), pero igual se
 * saca del flujo/tab order acá para no dejarla enfocable por teclado detrás del panel.
 *
 * Ancho vía spring de `motion` (no `transition-width` de CSS): es una superficie con la que el
 * usuario interactúa activamente (no una entrada pasiva al montar), así que corresponde el mismo
 * lenguaje de movimiento que el drawer — crítico (`bounce: 0`, sin rebote: nada "tira" del ancho,
 * es un hover, no un gesto con momentum) pero con el resorte real, no un ease-out lineal. El hover
 * solo dispara el spring en punteros finos con hover real (`hover: hover` + `pointer: fine`) —
 * en touch, `onMouseEnter` puede disparar igual al tocar y quedaría "trabado" expandido.
 */
export function AppNav() {
  const pathname = usePathname()
  const activosActive = pathname.startsWith("/assets")
  const detailRoute = isDetailRoute(pathname)
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)")
  const reducedMotion = useReducedMotion()
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <div
        aria-hidden="true"
        className={cn("hidden w-[72px] shrink-0", detailRoute ? "xl:block" : "md:block")}
      />
      <motion.nav
        aria-label="Main navigation"
        onMouseEnter={() => canHover && setExpanded(true)}
        onMouseLeave={() => canHover && setExpanded(false)}
        animate={{ width: expanded ? EXPANDED_WIDTH : RAIL_WIDTH }}
        transition={reducedMotion ? { duration: 0 } : { type: "spring", bounce: 0, duration: 0.4 }}
        className={cn(
          "group glass-surface-dense fixed top-16 left-0 z-30 hidden h-[calc(100vh-4rem)] flex-col overflow-hidden border-r border-border/60 transition-[border-radius] duration-200",
          expanded && "rounded-r-2xl border-r-transparent",
          detailRoute ? "xl:flex" : "md:flex"
        )}
        style={{
          // Highlight de borde: sugiere el canto del vidrio atrapando luz, en vez de un corte
          // recto — visible solo expandido, donde el borde derecho queda flotando sobre el feed.
          boxShadow: expanded
            ? "var(--shadow-elevation-3), inset -1px 0 0 rgb(255 255 255 / 0.07)"
            : undefined,
        }}
      >
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-2 py-3">
          <NavItem icon={Home} label="Home" />
          <NavItem icon={Compass} label="Explore" />
          <NavItem icon={LineChart} label="Assets" href="/assets/nvda" active={activosActive} />
          <NavItem icon={UserRound} label="My Activity" />

          <p className="mt-4 max-w-0 overflow-hidden whitespace-nowrap px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground opacity-0 transition-[max-width,opacity] duration-200 group-hover:max-w-40 group-hover:opacity-100">
            Favorites
          </p>
          <NavItem icon={Star} label="NVDA" href="/assets/nvda" />
        </div>

        <div className="border-t border-border p-3">
          <div className="flex min-h-11 items-center gap-2">
            <UserAvatar handle="demo" className="shrink-0" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium text-foreground opacity-0 transition-[max-width,opacity] duration-200 group-hover:max-w-40 group-hover:opacity-100">
              @demo
            </span>
          </div>
        </div>
      </motion.nav>
    </>
  )
}
