import { cn } from "cn"
import { formatScore } from "@/lib/format"

export function Score({
  upvotes,
  downvotes,
  className,
}: {
  upvotes: number
  downvotes: number
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("font-medium tabular-nums text-muted-foreground", className)}
    >
      {formatScore(upvotes, downvotes)}
    </span>
  )
}
