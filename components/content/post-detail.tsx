"use client"

import { cn } from "cn"
import { BackLink } from "@/components/back-link"
import { UserAvatar } from "@/components/shell/user-avatar"
import { VoteControl } from "@/components/content/vote-control"
import { CommentList } from "@/components/comments/comment-list"
import { PanelWidgets } from "@/components/asset/panel-widgets"
import { NotFoundPanel } from "@/components/not-found-panel"
import { MobileActionBar } from "@/components/detail/mobile-action-bar"
import { DetailSkeleton } from "@/components/detail/detail-skeleton"
import { useAssetContentQuery, useAssetQuery, usePostQuery, useVoteMutation } from "@/lib/queries"
import { formatAbsoluteFull, formatRelative } from "@/lib/format"
import type { VoteDirection } from "@/lib/types"

/**
 * D2: contenido de detalle de un posteo, compartido entre la página completa (variant="page",
 * siempre con "← Ticker" propio) y el panel interceptado (variant="panel", donde el "← Ticker"
 * solo hace falta por debajo de xl — a partir de ahí el panel ya tiene su propio botón "✕").
 *
 * En variant="page" reusa el mismo shell de 3 columnas que el feed (D4: `max-w-[100rem]` +
 * `PanelWidgets` a la derecha) en vez de quedar como una columna angosta y suelta — así la página
 * completa se siente parte de la misma app y no una vista aparte. En variant="panel" es una sola
 * columna `max-w-3xl`: el drawer (components/detail/detail-panel.tsx) ya limita el ancho real desde
 * afuera (640–720px), no hay lugar para una columna de widgets ahí.
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
  const { data: asset } = useAssetQuery(ticker)
  const { data: content } = useAssetContentQuery(ticker)
  const voteMutation = useVoteMutation()

  if (isPending) return <DetailSkeleton variant={variant} contentType="post" />

  if (!post) {
    return (
      <NotFoundPanel
        message="We couldn't find that post."
        backHref={`/assets/${ticker}`}
        backLabel={`Back to ${ticker.toUpperCase()}`}
      />
    )
  }

  function handleVote(direction: VoteDirection) {
    voteMutation.mutate({ id: post!.id, assetTicker: post!.assetTicker, direction })
  }

  return (
    <div className="flex flex-1 flex-col pb-[calc(5rem+env(safe-area-inset-bottom))] xl:pb-0">
      <div
        className={cn(
          "mx-auto w-full px-4 py-4",
          variant === "page" ? "max-w-[100rem] 2xl:px-8" : "max-w-3xl",
          variant === "panel" && "xl:hidden"
        )}
      >
        <BackLink href={`/assets/${ticker}`} label={post.assetTicker} />
      </div>

      <div
        className={cn(
          "mx-auto w-full flex-1 px-4",
          variant === "page"
            ? "max-w-[100rem] xl:grid xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start xl:gap-8 2xl:px-8"
            : "max-w-3xl"
        )}
      >
        <div className="flex min-w-0 flex-col gap-8 pb-8">
          <article>
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

          <CommentList contentId={post.id} />
        </div>

        {variant === "page" && asset && content && (
          <PanelWidgets asset={asset} posts={content.posts} theses={content.theses} />
        )}
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
