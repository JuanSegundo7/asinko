"use client"

import { cn } from "cn"
import { BackLink } from "@/components/back-link"
import { UserAvatar } from "@/components/shell/user-avatar"
import { VoteControl } from "@/components/content/vote-control"
import { ThesisStatusBadge } from "@/components/content/thesis-status-badge"
import { ThesisDataGrid } from "@/components/content/thesis-data-grid"
import { ConsensusVsOutcome } from "@/components/content/consensus-vs-outcome"
import { ThesisDataGridSkeleton } from "@/components/content/thesis-data-grid"
import { CommentList } from "@/components/comments/comment-list"
import { PanelWidgets } from "@/components/asset/panel-widgets"
import { NotFoundPanel } from "@/components/not-found-panel"
import { MobileActionBar } from "@/components/detail/mobile-action-bar"
import { DetailSkeleton } from "@/components/detail/detail-skeleton"
import {
  useAssetContentQuery,
  useAssetQuery,
  useExchangeRatesQuery,
  useThesisQuery,
  useVoteMutation,
} from "@/lib/queries"
import { useCurrency } from "@/lib/use-currency"
import { formatAbsoluteFull, formatRelative } from "@/lib/format"
import type { VoteDirection } from "@/lib/types"

/**
 * D2: contenido de detalle de una tesis, compartido entre la página completa (variant="page")
 * y el panel interceptado (variant="panel"). Ver PostDetail para el razonamiento del variant y
 * del shell de 3 columnas (`max-w-[100rem]` + `PanelWidgets`) en variant="page" — inerte en
 * variant="panel", el drawer ya limita el ancho afuera.
 */
export function ThesisDetail({
  id,
  ticker,
  variant = "page",
}: {
  id: string
  ticker: string
  variant?: "page" | "panel"
}) {
  const { data: thesis, isPending } = useThesisQuery(id)
  const { data: asset } = useAssetQuery(ticker)
  const { data: content } = useAssetContentQuery(ticker)
  const { data: rates } = useExchangeRatesQuery()
  const currency = useCurrency()
  const voteMutation = useVoteMutation()

  if (isPending) return <DetailSkeleton variant={variant} contentType="thesis" />

  if (!thesis) {
    return (
      <NotFoundPanel
        message="We couldn't find that thesis."
        backHref={`/assets/${ticker}`}
        backLabel={`Back to ${ticker.toUpperCase()}`}
      />
    )
  }

  const isClosed = thesis.status === "CLOSED"

  function handleVote(direction: VoteDirection) {
    voteMutation.mutate({ id: thesis!.id, assetTicker: thesis!.assetTicker, direction })
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
        <BackLink href={`/assets/${ticker}`} label={thesis.assetTicker} />
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
          <article className="@container">
            <header className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <UserAvatar handle={thesis.author.handle} size={32} />
              <ThesisStatusBadge status={thesis.status} outcome={thesis.outcome} />
              <span className="font-medium text-foreground">@{thesis.author.handle}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={thesis.createdAt} title={formatAbsoluteFull(thesis.createdAt)}>
                {formatRelative(thesis.createdAt)}
              </time>
            </header>

            <p className="mt-3 text-2xl font-medium leading-snug text-foreground">
              {thesis.claim}
            </p>

            {asset && rates ? (
              <ThesisDataGrid
                thesis={thesis}
                assetPriceUsd={asset.price}
                currency={currency}
                rates={rates}
                className="mt-4"
              />
            ) : (
              <ThesisDataGridSkeleton className="mt-4" />
            )}

            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground">
              {thesis.reasoning}
            </p>

            {isClosed && (
              <div className="mt-4">
                <ConsensusVsOutcome thesis={thesis} />
              </div>
            )}

            <div className="mt-4 hidden xl:block">
              <VoteControl
                upvotes={thesis.upvotes}
                downvotes={thesis.downvotes}
                userVote={thesis.userVote}
                disabled={isClosed}
                onVote={handleVote}
              />
            </div>
          </article>

          <CommentList contentId={thesis.id} />
        </div>

        {variant === "page" && asset && content && (
          <PanelWidgets asset={asset} posts={content.posts} theses={content.theses} />
        )}
      </div>

      <MobileActionBar
        upvotes={thesis.upvotes}
        downvotes={thesis.downvotes}
        userVote={thesis.userVote}
        disabled={isClosed}
        onVote={handleVote}
      />
    </div>
  )
}
