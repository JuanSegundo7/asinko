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
        "flex min-h-11 items-center justify-center gap-3 rounded-md px-3 text-sm font-medium transition-colors xl:justify-start",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground",
        disabled ? "cursor-not-allowed opacity-50" : "hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      <span className="hidden xl:inline">{label}</span>
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
        {disabled ? "Fuera del alcance del mockup" : label}
      </TooltipContent>
    </Tooltip>
  )
}
