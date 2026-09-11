"use client"

import Link from "next/link"
import { cn } from "cn"
import { VoteControl } from "./vote-control"
import { ThesisStatusBadge } from "./thesis-status-badge"
import { ThesisDataGrid } from "./thesis-data-grid"
import { ConsensusVsOutcome } from "./consensus-vs-outcome"
import { CommentPreview, CommentPreviewSkeleton } from "@/components/comments/comment-preview"
import {
  useAssetQuery,
  useCommentPreviewQuery,
  useExchangeRatesQuery,
  useVoteMutation,
} from "@/lib/queries"
import { useCurrency } from "@/lib/use-currency"
import { formatAbsoluteFull, formatRelative } from "@/lib/format"
import { markCameFromFeed } from "@/lib/scroll-restoration"
import type { Thesis } from "@/lib/types"

export function ThesisCard({ thesis, className }: { thesis: Thesis; className?: string }) {
  const voteMutation = useVoteMutation()
  const { data: previewComments, isPending: previewPending } = useCommentPreviewQuery(thesis.id)
  const { data: asset } = useAssetQuery(thesis.assetTicker)
  const { data: rates } = useExchangeRatesQuery()
  const currency = useCurrency()
  const href = `/assets/${thesis.assetTicker.toLowerCase()}/theses/${thesis.id}`
  const isClosed = thesis.status === "CLOSED"

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
        aria-label={`Ver tesis completa de @${thesis.author.handle}`}
        className="absolute inset-0 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />

      <header className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <ThesisStatusBadge status={thesis.status} outcome={thesis.outcome} />
        <span className="font-medium text-foreground">@{thesis.author.handle}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={thesis.createdAt} title={formatAbsoluteFull(thesis.createdAt)}>
          {formatRelative(thesis.createdAt)}
        </time>
      </header>

      <p className="mt-2 text-base font-semibold leading-snug text-foreground">
        {thesis.claim}
      </p>

      {asset && rates ? (
        <ThesisDataGrid
          thesis={thesis}
          assetPriceUsd={asset.price}
          currency={currency}
          rates={rates}
          className="mt-3"
        />
      ) : (
        <div className="mt-3 h-20 animate-pulse rounded-lg bg-muted" />
      )}

      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
        {thesis.reasoning}
      </p>

      {isClosed && (
        <div className="mt-3">
          <ConsensusVsOutcome thesis={thesis} />
        </div>
      )}

      {previewPending ? (
        <CommentPreviewSkeleton />
      ) : (
        <CommentPreview comments={previewComments ?? []} />
      )}

      <div className="relative z-10 mt-3 flex items-center justify-between border-t border-border pt-3">
        <VoteControl
          upvotes={thesis.upvotes}
          downvotes={thesis.downvotes}
          userVote={thesis.userVote}
          disabled={isClosed}
          onVote={(direction) =>
            voteMutation.mutate({ id: thesis.id, assetTicker: thesis.assetTicker, direction })
          }
        />
        <Link
          href={`${href}#comentarios`}
          onClick={markCameFromFeed}
          className="relative z-10 flex min-h-11 items-center rounded px-2 text-sm text-muted-foreground hover:text-foreground"
        >
          {thesis.commentCount} comentarios
        </Link>
      </div>
    </article>
  )
}
