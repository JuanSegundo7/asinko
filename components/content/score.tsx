import { cn } from "cn"
import { formatScore } from "@/lib/format"

/**
 * D6/D14: el score es **neutro por defecto** — la regla original (D6) es a propósito: un score
 * negativo no es "malo" (T2 tiene −49 y acertó contra el consenso), así que colorearlo por signo
 * en una tesis mandaría la señal contraria a la que el producto quiere mostrar. `variant="signed"`
 * es la excepción, pedida explícitamente para posteos y comentarios — ahí no hay un "resultado"
 * con el que el color pueda contradecirse, así que sí puede leerse como una señal más de un
 * vistazo. Las tesis se quedan en `variant="neutral"` (default) sin excepción.
 */
export function Score({
  upvotes,
  downvotes,
  variant = "neutral",
  className,
}: {
  upvotes: number
  downvotes: number
  variant?: "neutral" | "signed"
  className?: string
}) {
  const net = upvotes - downvotes
  const signedColorClass = net > 0 ? "text-positive" : net < 0 ? "text-negative" : "text-muted-foreground"

  return (
    <span
      aria-hidden="true"
      className={cn(
        "font-mono font-medium tabular-nums",
        variant === "signed" ? cn("text-xs", signedColorClass) : "text-sm text-muted-foreground",
        className
      )}
    >
      {formatScore(upvotes, downvotes)}
    </span>
  )
}
