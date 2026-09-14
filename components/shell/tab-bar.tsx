"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Home, LineChart, UserRound } from "lucide-react"
import { cn } from "cn"
import { isDetailRoute } from "@/lib/routes"

const ITEMS = [
  { icon: Home, label: "Inicio", href: undefined },
  { icon: Compass, label: "Explorar", href: undefined },
  { icon: LineChart, label: "Activos", href: "/assets/nvda" },
  { icon: UserRound, label: "Mi actividad", href: undefined },
] as const

/** D4: tab bar inferior mobile (mismo criterio de deshabilitados que AppNav). Se oculta dentro del detalle (D2): el panel a pantalla completa ya ocupa ese espacio. */
export function TabBar() {
  const pathname = usePathname()

  if (isDetailRoute(pathname)) return null

  return (
    <nav
      aria-label="Navegación principal"
      className="glass-surface-dense fixed inset-x-0 bottom-0 z-30 flex border-t border-border [padding-bottom:env(safe-area-inset-bottom)] md:hidden"
    >
      {ITEMS.map((item) => {
        const active = item.href ? pathname.startsWith(item.href) : false
        const disabled = !item.href
        const content = (
          <span
            className={cn(
              "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
              active ? "text-primary" : "text-muted-foreground",
              disabled && "opacity-50"
            )}
          >
            <item.icon className="size-5" aria-hidden="true" />
            {item.label}
          </span>
        )

        if (disabled) {
          return (
            <span
              key={item.label}
              aria-disabled="true"
              title="Fuera del alcance del mockup"
              className="flex flex-1"
            >
              {content}
            </span>
          )
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-1"
            aria-current={active ? "page" : undefined}
          >
            {content}
          </Link>
        )
      })}
    </nav>
  )
}
