"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "cn"
import { Bell } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { isDetailRoute } from "@/lib/routes"

/**
 * D4: header de página global — logo (se mudó acá desde AppNav) + campana de notificaciones
 * deshabilitada (mismo patrón aria-disabled + tooltip que el resto del nav, nunca funcionalidad
 * simulada). Sin buscador: D4 lo prohíbe explícitamente ("sería funcionalidad falsa").
 * Se oculta en una ruta de detalle por debajo de xl, igual que AppNav/TabBar: el panel a pantalla
 * completa ya ocupa ese espacio.
 */
export function TopHeader() {
  const pathname = usePathname()
  const detailRoute = isDetailRoute(pathname)

  return (
    <header
      className={cn(
        "glass-surface sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border px-4 xl:px-5",
        detailRoute && "hidden xl:flex"
      )}
    >
      <Link href="/assets/nvda" className="font-serif text-lg font-semibold tracking-tight text-foreground">
        Asinko
      </Link>

      <Tooltip>
        <TooltipTrigger render={<span aria-disabled="true" />}>
          <span className="flex min-h-11 min-w-11 cursor-not-allowed items-center justify-center rounded-md text-muted-foreground opacity-50">
            <Bell className="size-5" aria-hidden="true" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="left">Fuera del alcance del mockup</TooltipContent>
      </Tooltip>
    </header>
  )
}
