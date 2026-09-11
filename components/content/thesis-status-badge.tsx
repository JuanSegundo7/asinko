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
      <Badge variant="outline" className={className}>
        <span className="size-1.5 rounded-full bg-foreground" aria-hidden="true" />
        Abierta
      </Badge>
    )
  }

  const isCorrect = outcome === "CORRECT"

  return (
    <Badge
      variant="outline"
      className={cn(
        isCorrect
          ? "border-emerald-600/30 bg-emerald-600/10 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-400"
          : "border-red-600/30 bg-red-600/10 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-400",
        className
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isCorrect ? "bg-emerald-600 dark:bg-emerald-400" : "bg-red-600 dark:bg-red-400"
        )}
        aria-hidden="true"
      />
      Cerrada · {isCorrect ? "Acertada" : "Incorrecta"}
    </Badge>
  )
}
