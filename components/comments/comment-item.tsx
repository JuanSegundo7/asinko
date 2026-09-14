"use client"

import { VoteControl } from "@/components/content/vote-control"
import { UserAvatar } from "@/components/shell/user-avatar"
import { useVoteCommentMutation } from "@/lib/queries"
import { formatAbsoluteFull, formatRelative } from "@/lib/format"
import type { Comment } from "@/lib/types"

export function CommentItem({ comment }: { comment: Comment }) {
  const voteMutation = useVoteCommentMutation()

  return (
    <li className="flex gap-2.5 border-b border-border py-3 last:border-b-0">
      <UserAvatar handle={comment.author.handle} size={28} className="mt-0.5" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">@{comment.author.handle}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={comment.createdAt} title={formatAbsoluteFull(comment.createdAt)}>
            {formatRelative(comment.createdAt)}
          </time>
        </div>
        <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{comment.body}</p>
        <VoteControl
          size="compact"
          upvotes={comment.upvotes}
          downvotes={comment.downvotes}
          userVote={comment.userVote}
          scoreVariant="signed"
          onVote={(direction) =>
            voteMutation.mutate({ id: comment.id, contentId: comment.contentId, direction })
          }
        />
      </div>
    </li>
  )
}

export function CommentItemSkeleton() {
  return (
    <li className="flex flex-col gap-2 border-b border-border py-3 last:border-b-0">
      <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
      <div className="h-4 w-full animate-pulse rounded bg-muted" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
    </li>
  )
}
