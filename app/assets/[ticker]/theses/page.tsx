"use client"

import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { cn } from "cn"
import { BackLink } from "@/components/back-link"
import { ThesisCard } from "@/components/content/thesis-card"
import { CardSkeleton } from "@/components/content/card-skeleton"
import { useThesesQuery } from "@/lib/queries"

export default function ThesesListPage() {
  const { ticker } = useParams<{ ticker: string }>()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const statusParam = searchParams.get("status") === "closed" ? "closed" : "open"
  const status = statusParam === "closed" ? "CLOSED" : "OPEN"
  const { data: theses, isPending } = useThesesQuery(ticker, status)

  function setFilter(value: "open" | "closed") {
    const params = new URLSearchParams(searchParams.toString())
    params.set("status", value)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <BackLink href={`/assets/${ticker}`} label={ticker.toUpperCase()} />
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        Tesis de {ticker.toUpperCase()}
      </h1>

      <div role="group" aria-label="Filtrar tesis" className="mt-4 flex items-center gap-1 text-sm">
        <FilterButton active={statusParam === "open"} onClick={() => setFilter("open")}>
          Abiertas
        </FilterButton>
        <span aria-hidden="true" className="text-muted-foreground">
          ·
        </span>
        <FilterButton active={statusParam === "closed"} onClick={() => setFilter("closed")}>
          Cerradas
        </FilterButton>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {isPending ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : theses && theses.length > 0 ? (
          theses.map((thesis) => <ThesisCard key={thesis.id} thesis={thesis} />)
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay tesis {statusParam === "open" ? "abiertas" : "cerradas"} para este activo.
          </p>
        )}
      </div>
    </div>
  )
}

function FilterButton({
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
        "min-h-11 rounded-md px-2 font-medium",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
