import { cn } from "cn"
import { Skeleton } from "@/components/ui/skeleton"
import { VoteControlSkeleton } from "@/components/content/vote-control"
import { ThesisDataGridSkeleton } from "@/components/content/thesis-data-grid"
import { PanelWidgetsSkeleton } from "@/components/asset/panel-widgets"

/**
 * Skeleton de `PostDetail`/`ThesisDetail` mientras carga la pieza. Reconstruido para calcar la
 * estructura REAL actual: shell de 3 columnas en `variant="page"` (`max-w-[100rem]` + grid
 * `xl:grid-cols-[minmax(0,1fr)_400px]` con `PanelWidgets` a la derecha) vs. columna única
 * `max-w-3xl` en `variant="panel"` (el drawer ya limita el ancho desde afuera). `contentType`
 * distingue el body corto de un posteo del claim + grilla + razonamiento de una tesis.
 */
export function DetailSkeleton({
  variant = "page",
  contentType = "post",
}: {
  variant?: "page" | "panel"
  contentType?: "post" | "thesis"
}) {
  return (
    <div className="flex flex-1 flex-col pb-[calc(5rem+env(safe-area-inset-bottom))] xl:pb-0">
      <div
        className={cn(
          "mx-auto w-full px-4 py-4",
          variant === "page" ? "max-w-[100rem] 2xl:px-8" : "max-w-3xl",
          variant === "panel" && "xl:hidden"
        )}
      >
        {/* BackLink ("← NVDA") */}
        <div className="inline-flex items-center gap-1.5">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-16" />
        </div>
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
          <article className={contentType === "thesis" ? "@container" : undefined}>
            <header className="flex flex-wrap items-center gap-2">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              {contentType === "thesis" && <Skeleton className="h-5 w-16 rounded-full" />}
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-12" />
            </header>

            {contentType === "thesis" ? (
              <>
                <div className="mt-3 flex flex-col gap-2">
                  <Skeleton className="h-7 w-full" />
                  <Skeleton className="h-7 w-4/5" />
                </div>
                <ThesisDataGridSkeleton className="mt-4" />
                <div className="mt-4 flex flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            )}

            <div className="mt-4 hidden xl:block">
              <VoteControlSkeleton />
            </div>
          </article>

          {/* Sección de comentarios (`CommentList`): título + sort, input, 3 items */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="mt-4 h-11 w-full rounded-md" />
            <ul className="mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="flex gap-2.5 border-b border-border py-3 last:border-b-0">
                  <Skeleton className="size-7 shrink-0 rounded-full" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-3.5 w-20" />
                      <Skeleton className="h-3.5 w-10" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {variant === "page" && <PanelWidgetsSkeleton />}
      </div>
    </div>
  )
}
