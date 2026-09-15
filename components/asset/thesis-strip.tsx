"use client"

import { Skeleton } from "@/components/ui/skeleton"
import type { Thesis } from "@/lib/types"

/** Mobile (D4): sin sidebar, franja compacta bajo el header que hace scroll a la sección de tesis al tocarla. */
export function ThesisStrip({ theses }: { theses: Thesis[] }) {
  if (theses.length === 0) return null

  const open = theses.filter((t) => t.status === "OPEN").length
  const correct = theses.filter((t) => t.status === "CLOSED" && t.outcome === "CORRECT").length
  const incorrect = theses.filter((t) => t.status === "CLOSED" && t.outcome === "INCORRECT").length

  const parts = [`${theses.length} theses`]
  if (open > 0) parts.push(`${open} open`)
  if (correct > 0) parts.push(`${correct} correct`)
  if (incorrect > 0) parts.push(`${incorrect} incorrect`)

  return (
    <button
      type="button"
      onClick={() =>
        document.getElementById("theses")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      className="flex min-h-11 w-full items-center justify-center border-b border-border bg-muted/40 text-sm font-medium text-foreground transition-colors active:bg-muted xl:hidden"
    >
      {parts.join(" · ")}
    </button>
  )
}

/** Misma franja compacta, sin el conteo real todavía. */
export function ThesisStripSkeleton() {
  return (
    <div className="flex min-h-11 w-full items-center justify-center border-b border-border bg-muted/40 xl:hidden">
      <Skeleton className="h-4 w-40" />
    </div>
  )
}
