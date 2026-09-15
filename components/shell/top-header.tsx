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
 *
 * Logo: SVG propio del usuario (public/asinko-logo.svg, wordmark real, no un placeholder). Es un
 * `<img>` plano, no `next/image` — Next desoptimiza SVGs por default (riesgo de contenido activo
 * embebido) y acá no aporta nada optimizar un vector chico de todos modos. Reemplaza al texto +
 * punto de acento de antes: el logo ya ES la marca completa, repetir "Asinko" al lado sería
 * redundante — minimalismo real es una sola marca, no una marca y su etiqueta.
 */
export function TopHeader() {
  const pathname = usePathname()
  const detailRoute = isDetailRoute(pathname)

  return (
    <header
      className={cn(
        "glass-surface sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between px-4 xl:px-5",
        detailRoute && "hidden xl:flex"
      )}
      // Sin border-b duro: un borde de 1px sobre vidrio se lee como un corte. En su lugar, una
      // sombra suave hacia el contenido (separa sin marcar línea) + un highlight interno arriba
      // de 1px, casi invisible — la luz "atrapada" en el canto superior del material, no un
      // adorno: es lo que hace que el vidrio se sienta como una superficie real, no una capa lisa.
      style={{ boxShadow: "var(--shadow-elevation-1), inset 0 1px 0 rgb(255 255 255 / 0.06)" }}
    >
      <Link href="/assets/nvda" className="flex items-center py-4">
        <img src="/asinko-logo.svg" alt="Asinko" className="h-6 w-auto" />
      </Link>

      <Tooltip>
        <TooltipTrigger render={<span aria-disabled="true" />}>
          <span className="flex min-h-11 min-w-11 cursor-not-allowed items-center justify-center rounded-md text-muted-foreground opacity-50">
            <Bell className="size-5" aria-hidden="true" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="left">Out of scope for this mockup</TooltipContent>
      </Tooltip>
    </header>
  )
}
