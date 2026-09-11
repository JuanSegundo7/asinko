"use client"

import Link from "next/link"
import { ArrowDown, ArrowUp } from "lucide-react"
import { ThesisStatusBadge } from "@/components/content/thesis-status-badge"
import { getConsensus, getConsensusMismatchLabel } from "@/lib/consensus"
import { daysRemaining, formatAbsolute, formatCurrency, formatPercent } from "@/lib/format"
import { markCameFromFeed } from "@/lib/scroll-restoration"
import type { Asset, Thesis } from "@/lib/types"

/** Sidebar sticky desktop (D4): no duplica las cards, una línea compacta por tesis con el dato que la card no muestra a simple vista. */
export function ThesisTracker({ theses, asset }: { theses: Thesis[]; asset: Asset }) {
  if (theses.length === 0) return null

  return (
    <nav aria-label="Tracker de tesis" className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-muted-foreground">Tesis ({theses.length})</h2>
      <ul className="flex flex-col gap-1">
        {theses.map((thesis) => (
          <li key={thesis.id}>
            <TrackerRow thesis={thesis} assetPriceUsd={asset.price} />
          </li>
        ))}
      </ul>
      <Link
        href={`/assets/${asset.ticker.toLowerCase()}/theses`}
        onClick={markCameFromFeed}
        className="mt-1 flex min-h-11 items-center text-sm font-medium text-foreground hover:underline"
      >
        Ver todas →
      </Link>
    </nav>
  )
}

function TrackerRow({ thesis, assetPriceUsd }: { thesis: Thesis; assetPriceUsd: number }) {
  const href = `/assets/${thesis.assetTicker.toLowerCase()}/theses/${thesis.id}`
  const DirectionIcon = thesis.direction === "ABOVE" ? ArrowUp : ArrowDown

  return (
    <Link
      href={href}
      onClick={markCameFromFeed}
      className="flex flex-col gap-1 rounded-md p-2 text-sm hover:bg-accent"
    >
      <ThesisStatusBadge status={thesis.status} outcome={thesis.outcome} />
      {thesis.status === "OPEN" ? (
        <p className="text-muted-foreground">
          <DirectionIcon className="mr-0.5 inline size-3.5" aria-hidden="true" />
          {formatCurrency(thesis.targetPrice, "USD")} · {formatAbsolute(thesis.deadline)}
          <br />
          <span className="tabular-nums">
            {formatPercent(((thesis.targetPrice - assetPriceUsd) / assetPriceUsd) * 100)} ·{" "}
            {daysRemaining(thesis.deadline)} días
          </span>
        </p>
      ) : (
        <p className="text-muted-foreground">
          <DirectionIcon className="mr-0.5 inline size-3.5" aria-hidden="true" />
          {formatCurrency(thesis.targetPrice, "USD")} · {formatAbsolute(thesis.deadline)}
          <br />
          {getConsensus(thesis) === "FOR" ? "Consenso a favor" : "Consenso en contra"}
          {getConsensusMismatchLabel(thesis) && (
            <span> · {getConsensusMismatchLabel(thesis)?.toLowerCase()}</span>
          )}
        </p>
      )}
    </Link>
  )
}
