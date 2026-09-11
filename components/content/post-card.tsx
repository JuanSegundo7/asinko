"use client"

import Link from "next/link"
import { cn } from "cn"
import { VoteControl } from "./vote-control"
import { CommentPreview, CommentPreviewSkeleton } from "@/components/comments/comment-preview"
import { useCommentPreviewQuery, useVoteMutation } from "@/lib/queries"
import { formatAbsoluteFull, formatRelative } from "@/lib/format"
import { markCameFromFeed } from "@/lib/scroll-restoration"
import type { Post } from "@/lib/types"

export function PostCard({ post, className }: { post: Post; className?: string }) {
  const voteMutation = useVoteMutation()
  const { data: previewComments, isPending: previewPending } = useCommentPreviewQuery(post.id)
  const href = `/assets/${post.assetTicker.toLowerCase()}/posts/${post.id}`

  return (
    <article
      className={cn(
        "relative rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/30",
        className
      )}
    >
      <Link
        href={href}
        onClick={markCameFromFeed}
        aria-label={`Ver posteo completo de @${post.author.handle}`}
        className="absolute inset-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />

      <header className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">@{post.author.handle}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={post.createdAt} title={formatAbsoluteFull(post.createdAt)}>
          {formatRelative(post.createdAt)}
        </time>
      </header>

      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
        {post.body}
      </p>

      {previewPending ? (
        <CommentPreviewSkeleton />
      ) : (
        <CommentPreview comments={previewComments ?? []} />
      )}

      <div className="relative z-10 mt-3 flex items-center justify-between border-t border-border pt-3">
        <VoteControl
          upvotes={post.upvotes}
          downvotes={post.downvotes}
          userVote={post.userVote}
          onVote={(direction) =>
            voteMutation.mutate({ id: post.id, assetTicker: post.assetTicker, direction })
          }
        />
        <Link
          href={`${href}#comentarios`}
          onClick={markCameFromFeed}
          className="relative z-10 flex min-h-11 items-center rounded px-2 text-sm text-muted-foreground hover:text-foreground"
        >
          {post.commentCount} comentarios
        </Link>
      </div>
    </article>
  )
}
