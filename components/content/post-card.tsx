"use client"

import Link from "next/link"
import { SquircleSurface } from "@/components/ui/squircle-surface"
import { UserAvatar } from "@/components/shell/user-avatar"
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
    <SquircleSurface
      as="article"
      cornerRadius={20}
      elevation={1}
      hoverElevation={2}
      outerClassName={className}
      className="relative p-5"
    >
      <Link
        href={href}
        scroll={false}
        onClick={() => markCameFromFeed(href)}
        aria-label={`View full post by @${post.author.handle}`}
        className="absolute inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      />

      <header className="flex items-center gap-2 text-sm text-muted-foreground">
        <UserAvatar handle={post.author.handle} size={28} />
        <span className="font-medium text-foreground">@{post.author.handle}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={post.createdAt} title={formatAbsoluteFull(post.createdAt)}>
          {formatRelative(post.createdAt)}
        </time>
      </header>

      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">
        {post.body}
      </p>

      <div className="relative z-10 mt-3 flex items-center justify-between border-t border-border pt-3">
        <VoteControl
          upvotes={post.upvotes}
          downvotes={post.downvotes}
          userVote={post.userVote}
          scoreVariant="signed"
          onVote={(direction) =>
            voteMutation.mutate({ id: post.id, assetTicker: post.assetTicker, direction })
          }
        />
        <Link
          href={`${href}#comments`}
          scroll={false}
          onClick={() => markCameFromFeed(href)}
          className="relative z-10 flex min-h-11 items-center rounded px-2 text-sm text-muted-foreground hover:text-foreground"
        >
          {post.commentCount} comments
        </Link>
      </div>

      {previewPending ? (
        <CommentPreviewSkeleton />
      ) : (
        <CommentPreview comments={previewComments ?? []} />
      )}
    </SquircleSurface>
  )
}
