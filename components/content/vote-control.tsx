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
  className,
}: VoteControlProps) {
  const iconSize = size === "compact" ? 16 : 20

  const control = (
    <div
      role="group"
      aria-label={voteAriaLabel(upvotes, downvotes)}
      className={cn("inline-flex items-center gap-0.5", className)}
    >
      <VoteButton
        direction="UP"
        active={userVote === "UP"}
        count={upvotes}
        disabled={disabled}
        iconSize={iconSize}
        onClick={() => onVote("UP")}
      />
      <VoteButton
        direction="DOWN"
        active={userVote === "DOWN"}
        count={downvotes}
        disabled={disabled}
        iconSize={iconSize}
        onClick={() => onVote("DOWN")}
      />
      <Score upvotes={upvotes} downvotes={downvotes} className="ml-1.5 text-sm" />
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
  const activeColor =
    direction === "UP"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-red-600 dark:text-red-400"

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
        "relative z-10 flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-md text-sm text-muted-foreground transition-colors",
        !disabled && "hover:bg-accent hover:text-accent-foreground active:scale-95",
        disabled && "cursor-not-allowed opacity-50",
        active && activeColor,
        "transition-transform duration-100"
      )}
    >
      <Icon size={iconSize} fill={active ? "currentColor" : "none"} aria-hidden="true" />
      <span aria-hidden="true" className="tabular-nums">
        {count}
      </span>
    </button>
  )
}
