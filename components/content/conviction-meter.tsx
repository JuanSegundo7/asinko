import { cn } from "cn"
import type { Conviction } from "@/lib/types"

const LEVELS: Conviction[] = ["LOW", "MEDIUM", "HIGH", "EXTREME"]

const LABELS: Record<Conviction, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  EXTREME: "Extrema",
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
            className={cn(
              "h-1.5 w-4 rounded-full",
              i <= activeIndex ? "bg-foreground" : "bg-muted"
            )}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        Convicción {LABELS[conviction]}
      </span>
    </div>
  )
}
