"use client"

import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "cn"
import { BackLink } from "@/components/back-link"
import { ThesisCard } from "@/components/content/thesis-card"
import { CardSkeleton } from "@/components/content/card-skeleton"
import { PanelWidgets, PanelWidgetsSkeleton } from "@/components/asset/panel-widgets"
import { useAssetContentQuery, useAssetQuery, useThesesQuery } from "@/lib/queries"

/**
 * Mismo shell de 3 columnas que post/thesis detail (`max-w-[100rem]` + `PanelWidgets` a la
 * derecha) — antes era una columna angosta suelta (`max-w-2xl`), la única página del ticker que
 * había quedado afuera de ese layout. Filtro Open/Closed como segmented control real (mismo
 * lenguaje visual que VoteControl: píldora con fondo, no texto subrayado con un punto separador).
 */
export default function ThesesListPage() {
  const { ticker } = useParams<{ ticker: string }>()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const statusParam = searchParams.get("status") === "closed" ? "closed" : "open"
  const status = statusParam === "closed" ? "CLOSED" : "OPEN"
  const { data: theses, isPending } = useThesesQuery(ticker, status)
  const { data: asset } = useAssetQuery(ticker)
  const { data: content } = useAssetContentQuery(ticker)

  function setFilter(value: "open" | "closed") {
    const params = new URLSearchParams(searchParams.toString())
    params.set("status", value)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-[100rem] px-4 py-4 2xl:px-8">
        <BackLink href={`/assets/${ticker}`} label={ticker.toUpperCase()} />
      </div>

      <div className="mx-auto w-full max-w-[100rem] flex-1 px-4 xl:grid xl:grid-cols-[minmax(0,1fr)_400px] xl:items-start xl:gap-8 2xl:px-8">
        <div className="flex min-w-0 flex-col gap-6 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-semibold text-foreground">
              {ticker.toUpperCase()} Theses
            </h1>
            <StatusFilter value={statusParam} onChange={setFilter} />
          </div>

          <div className="flex flex-col gap-3">
            {isPending ? (
              <>
                <CardSkeleton variant="thesis" />
                <CardSkeleton variant="thesis" />
              </>
            ) : theses && theses.length > 0 ? (
              theses.map((thesis, i) => (
                <div
                  key={thesis.id}
                  className="stagger-item"
                  style={{ "--stagger-index": i } as React.CSSProperties}
                >
                  <ThesisCard thesis={thesis} />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No {statusParam === "open" ? "open" : "closed"} theses for this asset.
              </p>
            )}
          </div>
        </div>

        {asset && content ? (
          <PanelWidgets asset={asset} posts={content.posts} theses={content.theses} />
        ) : (
          <PanelWidgetsSkeleton />
        )}
      </div>
    </div>
  )
}

function StatusFilter({
  value,
  onChange,
}: {
  value: "open" | "closed"
  onChange: (value: "open" | "closed") => void
}) {
  return (
    <div
      role="group"
      aria-label="Filter theses"
      className="inline-flex items-center rounded-full border border-border bg-muted p-0.5"
    >
      <SegmentButton active={value === "open"} onClick={() => onChange("open")}>
        Open
      </SegmentButton>
      <SegmentButton active={value === "closed"} onClick={() => onChange("closed")}>
        Closed
      </SegmentButton>
    </div>
  )
}

function SegmentButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "press-feedback min-h-11 rounded-full px-4 text-sm font-medium",
        active
          ? "bg-background text-foreground shadow-[var(--shadow-elevation-1)]"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
