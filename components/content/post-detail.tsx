"use client"

import { cn } from "cn"
import { BackLink } from "@/components/back-link"
import { UserAvatar } from "@/components/shell/user-avatar"
import { VoteControl } from "@/components/content/vote-control"
import { CommentList } from "@/components/comments/comment-list"
import { NotFoundPanel } from "@/components/not-found-panel"
import { MobileActionBar } from "@/components/detail/mobile-action-bar"
import { DetailSkeleton } from "@/components/detail/detail-skeleton"
import { usePostQuery, useVoteMutation } from "@/lib/queries"
import { formatAbsoluteFull, formatRelative } from "@/lib/format"
import type { VoteDirection } from "@/lib/types"

/**
 * D2: contenido de detalle de un posteo, compartido entre la página completa (variant="page",
 * siempre con "← Ticker" propio) y el panel interceptado (variant="panel", donde el "← Ticker"
 * solo hace falta por debajo de xl — a partir de ahí el panel ya tiene su propio botón "✕").
 */
export function PostDetail({
  id,
  ticker,
  variant = "page",
}: {
  id: string
  ticker: string
  variant?: "page" | "panel"
}) {
  const { data: post, isPending } = usePostQuery(id)
  const voteMutation = useVoteMutation()

  if (isPending) return <DetailSkeleton />

  if (!post) {
    return (
      <NotFoundPanel
        message="No encontramos ese posteo."
        backHref={`/assets/${ticker}`}
        backLabel={`Volver a ${ticker.toUpperCase()}`}
      />
    )
  }

  function handleVote(direction: VoteDirection) {
    voteMutation.mutate({ id: post!.id, assetTicker: post!.assetTicker, direction })
  }

  return (
    <div className="flex flex-1 flex-col pb-20 xl:pb-0">
      <div
        className={cn(
          "mx-auto w-full max-w-2xl px-4 py-4",
          variant === "panel" && "xl:hidden"
        )}
      >
        <BackLink href={`/assets/${ticker}`} label={post.assetTicker} />
      </div>

      <article className="mx-auto w-full max-w-2xl px-4">
        <header className="flex items-center gap-2 text-sm text-muted-foreground">
          <UserAvatar handle={post.author.handle} size={32} />
          <span className="font-medium text-foreground">@{post.author.handle}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={post.createdAt} title={formatAbsoluteFull(post.createdAt)}>
            {formatRelative(post.createdAt)}
          </time>
        </header>

        <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-foreground">
          {post.body}
        </p>

        <div className="mt-4 hidden xl:block">
          <VoteControl
            upvotes={post.upvotes}
            downvotes={post.downvotes}
            userVote={post.userVote}
            scoreVariant="signed"
            onVote={handleVote}
          />
        </div>
      </article>

      <div className="mx-auto mt-8 w-full max-w-2xl px-4 pb-8">
        <CommentList contentId={post.id} />
      </div>

      <MobileActionBar
        upvotes={post.upvotes}
        downvotes={post.downvotes}
        userVote={post.userVote}
        scoreVariant="signed"
        onVote={handleVote}
      />
    </div>
  )
}
