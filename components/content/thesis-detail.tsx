"use client"

import { cn } from "cn"
import { BackLink } from "@/components/back-link"
import { UserAvatar } from "@/components/shell/user-avatar"
import { VoteControl } from "@/components/content/vote-control"
import { ThesisStatusBadge } from "@/components/content/thesis-status-badge"
import { ThesisDataGrid } from "@/components/content/thesis-data-grid"
import { ConsensusVsOutcome } from "@/components/content/consensus-vs-outcome"
import { CommentList } from "@/components/comments/comment-list"
import { NotFoundPanel } from "@/components/not-found-panel"
import { MobileActionBar } from "@/components/detail/mobile-action-bar"
import { DetailSkeleton } from "@/components/detail/detail-skeleton"
import {
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
 * y el panel interceptado (variant="panel"). Ver PostDetail para el razonamiento del variant.
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
  const { data: rates } = useExchangeRatesQuery()
  const currency = useCurrency()
  const voteMutation = useVoteMutation()

  if (isPending) return <DetailSkeleton />

  if (!thesis) {
    return (
      <NotFoundPanel
        message="No encontramos esa tesis."
        backHref={`/assets/${ticker}`}
        backLabel={`Volver a ${ticker.toUpperCase()}`}
      />
    )
  }

  const isClosed = thesis.status === "CLOSED"

  function handleVote(direction: VoteDirection) {
    voteMutation.mutate({ id: thesis!.id, assetTicker: thesis!.assetTicker, direction })
  }

  return (
    <div className="flex flex-1 flex-col pb-20 xl:pb-0">
      <div
        className={cn(
          "mx-auto w-full max-w-2xl px-4 py-4",
          variant === "panel" && "xl:hidden"
        )}
      >
        <BackLink href={`/assets/${ticker}`} label={thesis.assetTicker} />
      </div>

      <article className="mx-auto w-full max-w-2xl @container px-4">
        <header className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <UserAvatar handle={thesis.author.handle} size={32} />
          <ThesisStatusBadge status={thesis.status} outcome={thesis.outcome} />
          <span className="font-medium text-foreground">@{thesis.author.handle}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={thesis.createdAt} title={formatAbsoluteFull(thesis.createdAt)}>
            {formatRelative(thesis.createdAt)}
          </time>
        </header>

        <p className="mt-3 font-serif text-2xl font-medium leading-snug text-foreground">
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
          <div className="mt-4 h-20 animate-pulse rounded-lg bg-muted" />
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

      <div className="mx-auto mt-8 w-full max-w-2xl px-4 pb-8">
        <CommentList contentId={thesis.id} />
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
