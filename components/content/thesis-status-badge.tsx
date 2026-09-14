import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import type { ThesisOutcome, ThesisStatus } from "@/lib/types"

export function ThesisStatusBadge({
  status,
  outcome,
  className,
}: {
  status: ThesisStatus
  outcome: ThesisOutcome | null
  className?: string
}) {
  if (status === "OPEN") {
    return (
      <Badge variant="outline" className={cn("border-primary/30 bg-primary/10 text-primary", className)}>
        <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
        Abierta
      </Badge>
    )
  }

  const isCorrect = outcome === "CORRECT"

  return (
    <Badge
      variant="outline"
      className={cn(
        isCorrect ? "border-positive/30 bg-positive/10 text-positive" : "border-negative/30 bg-negative/10 text-negative",
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", isCorrect ? "bg-positive" : "bg-negative")} aria-hidden="true" />
      Cerrada · {isCorrect ? "Acertada" : "Incorrecta"}
    </Badge>
  )
}
