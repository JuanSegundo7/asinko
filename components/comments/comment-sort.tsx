"use client"

import { cn } from "cn"
import type { CommentSort as CommentSortValue } from "@/lib/types"

export function CommentSort({
  value,
  onChange,
}: {
  value: CommentSortValue
  onChange: (value: CommentSortValue) => void
}) {
  return (
    <div className="flex items-center gap-1 text-sm" role="group" aria-label="Ordenar comentarios">
      <SortButton active={value === "TOP"} onClick={() => onChange("TOP")}>
        Más votados
      </SortButton>
      <span aria-hidden="true" className="text-muted-foreground">
        ·
      </span>
      <SortButton active={value === "RECENT"} onClick={() => onChange("RECENT")}>
        Recientes
      </SortButton>
    </div>
  )
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "press-feedback min-h-11 rounded-md px-2 font-medium",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
