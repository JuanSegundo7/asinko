"use client"

import { ArrowBigDown, ArrowBigUp } from "lucide-react"
import { cn } from "cn"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Score } from "./score"
import { voteAriaLabel } from "@/lib/format"
import type { UserVote, VoteDirection } from "@/lib/types"

type VoteControlProps = {
  upvotes: number
  downvotes: number
  userVote: UserVote
  onVote: (direction: VoteDirection) => void
  disabled?: boolean
  disabledReason?: string
  size?: "default" | "compact"
  /** D6/D14: "neutral" (default) en todo lo que tenga un resultado con el que el color pueda contradecirse (tesis); "signed" en posteos/comentarios, donde no hay ese riesgo. Ver components/content/score.tsx. */
  scoreVariant?: "neutral" | "signed"
  className?: string
}

export function VoteControl({
  upvotes,
  downvotes,
  userVote,
  onVote,
  disabled = false,
  disabledReason = "Votación cerrada",
  size = "default",
  scoreVariant = "neutral",
  className,
}: VoteControlProps) {
  const iconSize = size === "compact" ? 16 : 20

  const control = (
    <div
      role="group"
      aria-label={voteAriaLabel(upvotes, downvotes)}
      className={cn("inline-flex items-center gap-1.5", className)}
    >
      <div className="inline-flex items-center overflow-hidden rounded-full border border-border bg-muted">
        <VoteButton
          direction="UP"
          active={userVote === "UP"}
          count={upvotes}
          disabled={disabled}
          iconSize={iconSize}
          onClick={() => onVote("UP")}
        />
        <span aria-hidden="true" className="h-5 w-px shrink-0 bg-border" />
        <VoteButton
          direction="DOWN"
          active={userVote === "DOWN"}
          count={downvotes}
          disabled={disabled}
          iconSize={iconSize}
          onClick={() => onVote("DOWN")}
        />
      </div>
      <Score upvotes={upvotes} downvotes={downvotes} variant={scoreVariant} />
    </div>
  )

  if (!disabled) return control

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>{control}</TooltipTrigger>
      <TooltipContent>{disabledReason}</TooltipContent>
    </Tooltip>
  )
}

function VoteButton({
  direction,
  active,
  count,
  disabled,
  iconSize,
  onClick,
}: {
  direction: VoteDirection
  active: boolean
  count: number
  disabled: boolean
  iconSize: number
  onClick: () => void
}) {
  const Icon = direction === "UP" ? ArrowBigUp : ArrowBigDown
  const label = direction === "UP" ? "Votar a favor" : "Votar en contra"
  const activeClasses = direction === "UP" ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      aria-disabled={disabled}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault()
          return
        }
        onClick()
      }}
      className={cn(
        "relative z-10 flex min-h-11 min-w-11 items-center justify-center gap-1 px-2 text-sm text-muted-foreground transition-colors",
        !disabled && !active && "press-feedback hover:bg-accent hover:text-accent-foreground",
        !disabled && active && "press-feedback",
        disabled && "cursor-not-allowed opacity-50",
        active && activeClasses
      )}
    >
      <Icon size={iconSize} fill={active ? "currentColor" : "none"} aria-hidden="true" />
      <span aria-hidden="true" className="font-mono tabular-nums">
        {count}
      </span>
    </button>
  )
}
