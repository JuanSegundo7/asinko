"use client"

import { usePathname } from "next/navigation"
import { cn } from "cn"
import { Compass, Home, LineChart, Star, UserRound } from "lucide-react"
import { NavItem } from "./nav-item"
import { UserAvatar } from "./user-avatar"
import { isDetailRoute } from "@/lib/routes"

/**
 * D4: nav lateral — completa en desktop (≥1280), colapsada a íconos en tablet (768-1279), oculta
 * en mobile (la reemplaza TabBar). Solo "Activos" está en el alcance del mockup; el resto queda
 * deshabilitado a propósito en vez de omitirse, para no sugerir que el producto real no las tiene.
 * En una ruta de detalle por debajo de xl, el panel a pantalla completa ya la tapa visualmente
 * (z-50 opaco), pero igual se saca del flujo/tab order acá para no dejarla enfocable por teclado
 * detrás del panel. El logo se mudó a TopHeader — el nav ahora arranca directo con los items.
 */
export function AppNav() {
  const pathname = usePathname()
  const activosActive = pathname.startsWith("/assets")
  const detailRoute = isDetailRoute(pathname)

  return (
    <nav
      aria-label="Navegación principal"
      className={cn(
        "glass-surface sticky top-16 hidden h-[calc(100vh-4rem)] shrink-0 flex-col border-r border-border",
        detailRoute ? "xl:flex xl:w-64" : "md:flex md:w-[72px] xl:w-64"
      )}
    >
      <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-2 py-3">
        <NavItem icon={Home} label="Inicio" />
        <NavItem icon={Compass} label="Explorar" />
        <NavItem icon={LineChart} label="Activos" href="/assets/nvda" active={activosActive} />
        <NavItem icon={UserRound} label="Mi actividad" />

        <p className="mt-4 hidden px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground xl:block">
          Favoritos
        </p>
        <NavItem icon={Star} label="NVDA" href="/assets/nvda" />
      </div>

      <div className="border-t border-border p-3">
        <div className="flex min-h-11 items-center justify-center gap-2 xl:justify-start">
          <UserAvatar handle="demo" />
          <span className="hidden text-sm font-medium text-foreground xl:inline">@demo</span>
        </div>
      </div>
    </nav>
  )
}
