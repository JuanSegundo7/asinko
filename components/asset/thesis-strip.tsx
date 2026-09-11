"use client"

import type { Thesis } from "@/lib/types"

/** Mobile (D4): sin sidebar, franja compacta bajo el header que hace scroll a la sección de tesis al tocarla. */
export function ThesisStrip({ theses }: { theses: Thesis[] }) {
  if (theses.length === 0) return null

  const open = theses.filter((t) => t.status === "OPEN").length
  const correct = theses.filter((t) => t.status === "CLOSED" && t.outcome === "CORRECT").length
  const incorrect = theses.filter((t) => t.status === "CLOSED" && t.outcome === "INCORRECT").length

  const parts = [`${theses.length} tesis`]
  if (open > 0) parts.push(`${open} abierta${open === 1 ? "" : "s"}`)
  if (correct > 0) parts.push(`${correct} acertada${correct === 1 ? "" : "s"}`)
  if (incorrect > 0) parts.push(`${incorrect} incorrecta${incorrect === 1 ? "" : "s"}`)

  return (
    <button
      type="button"
      onClick={() =>
        document.getElementById("tesis")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      className="flex min-h-11 w-full items-center justify-center border-b border-border bg-muted/40 text-sm font-medium text-foreground lg:hidden"
    >
      {parts.join(" · ")}
    </button>
  )
}
