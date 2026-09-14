import { cn } from "cn"
import type { Conviction } from "@/lib/types"

const LEVELS: Conviction[] = ["LOW", "MEDIUM", "HIGH", "EXTREME"]

const LABELS: Record<Conviction, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  EXTREME: "Extrema",
}

/**
 * D15: escala de 4 colores, de rojo a verde — uno por nivel de convicción, pedido explícito del
 * usuario para diferenciarlos de un vistazo (antes todos los niveles usaban el mismo color
 * neutro, solo cambiaba cuántas barras estaban llenas). Único lugar de la UI con una escala de 4
 * colores: el resto de la app sigue la regla de D8 (un acento + verde/rojo reservados a
 * resultado/voto) — acá no hay ambigüedad posible con esa regla porque la convicción no es un
 * resultado ni un voto, es un dato propio de la tesis.
 */
const LEVEL_COLOR_CLASS: Record<Conviction, string> = {
  LOW: "bg-negative",
  MEDIUM: "bg-[#f59e0b]",
  HIGH: "bg-[#84cc16]",
  EXTREME: "bg-positive",
}

export function ConvictionMeter({
  conviction,
  className,
}: {
  conviction: Conviction
  className?: string
}) {
  const activeIndex = LEVELS.indexOf(conviction)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {LEVELS.map((level, i) => (
          <span
            key={level}
            className={cn("h-1.5 w-4 rounded-full", i <= activeIndex ? LEVEL_COLOR_CLASS[level] : "bg-muted")}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">{LABELS[conviction]}</span>
    </div>
  )
}
