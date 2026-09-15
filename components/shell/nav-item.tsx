"use client"

import Link from "next/link"
import { cn } from "cn"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { LucideIcon } from "lucide-react"

/** D4: item de nav lateral / tab bar. Sin href = fuera del alcance del mockup (aria-disabled + tooltip), nunca un link muerto. */
export function NavItem({
  icon: Icon,
  label,
  href,
  active,
}: {
  icon: LucideIcon
  label: string
  href?: string
  active?: boolean
}) {
  const disabled = !href

  const inner = (
    <span
      className={cn(
        "relative flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground",
        disabled ? "cursor-not-allowed opacity-50" : "hover:bg-accent hover:text-foreground"
      )}
    >
      {active && (
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary"
        />
      )}
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      {/* max-width (no width: auto) para que sea transicionable — el rail arranca en 72px y
          crece con el hover del <nav> ancestro (group), este label lo acompaña en vez de
          aparecer de golpe cuando ya terminó de crecer. */}
      <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-200 group-hover:max-w-40 group-hover:opacity-100">
        {label}
      </span>
    </span>
  )

  const triggerRender = disabled ? (
    <span aria-disabled="true" />
  ) : (
    <Link href={href} aria-current={active ? "page" : undefined} />
  )

  return (
    <Tooltip>
      <TooltipTrigger render={triggerRender}>{inner}</TooltipTrigger>
      <TooltipContent side="right">
        {disabled ? "Out of scope for this mockup" : label}
      </TooltipContent>
    </Tooltip>
  )
}
