"use client"

import { MessageSquare } from "lucide-react"
import { VoteControl } from "@/components/content/vote-control"
import type { UserVote, VoteDirection } from "@/lib/types"

/** D2: en mobile, barra de votos + acceso al comentario sticky abajo, al alcance del pulgar. */
export function MobileActionBar({
  upvotes,
  downvotes,
  userVote,
  disabled,
  disabledReason,
  scoreVariant,
  onVote,
}: {
  upvotes: number
  downvotes: number
  userVote: UserVote
  disabled?: boolean
  disabledReason?: string
  scoreVariant?: "neutral" | "signed"
  onVote: (direction: VoteDirection) => void
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between border-t border-border bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 [padding-bottom:calc(0.5rem+env(safe-area-inset-bottom))] xl:hidden">
      <VoteControl
        upvotes={upvotes}
        downvotes={downvotes}
        userVote={userVote}
        disabled={disabled}
        disabledReason={disabledReason}
        scoreVariant={scoreVariant}
        onVote={onVote}
      />
      <a
        href="#comment-input"
        className="flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <MessageSquare className="size-4" aria-hidden="true" />
        Comment
      </a>
    </div>
  )
}
