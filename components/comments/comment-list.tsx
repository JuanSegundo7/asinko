"use client"

import { useEffect, useState } from "react"
import { CommentSort } from "./comment-sort"
import { CommentInput } from "./comment-input"
import { CommentItem, CommentItemSkeleton } from "./comment-item"
import { useCommentsInfiniteQuery } from "@/lib/queries"
import type { CommentSort as CommentSortValue } from "@/lib/types"

/**
 * Sección de comentarios del detalle (D3): primeros 5 + "Ver N más" paginado, toggle de sort,
 * input de alta. Las cards abren el detalle con foco en comentarios vía "#comentarios" (D5), pero
 * los links que lo hacen usan scroll={false} (D2: no reposicionar la ventana del feed al abrir el
 * panel interceptado) — por eso el salto se hace acá a mano, sobre el contenedor con overflow más
 * cercano (la ventana en la página completa, el propio panel en el modo interceptado).
 */
export function CommentList({ contentId }: { contentId: string }) {
  const [sort, setSort] = useState<CommentSortValue>("TOP")
  const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useCommentsInfiniteQuery(contentId, sort)

  useEffect(() => {
    // Solo al montar: es el foco inicial al abrir el detalle, no debe repetirse en cada re-render.
    if (window.location.hash === "#comments") {
      document.getElementById("comments")?.scrollIntoView({ block: "start" })
    }
  }, [])

  // `items` son comentarios de PRIMER NIVEL (cada uno con sus respuestas ya adentro, ver getComments).
  const topLevelComments = data?.pages.flatMap((page) => page.items) ?? []
  // Header "Comentarios (N)": total real, primer nivel + respuestas.
  const totalAll = data?.pages[0]?.totalAll ?? 0
  // "Ver N más": cuenta lo que falta cargar de PRIMER NIVEL únicamente (las respuestas de lo ya
  // cargado no pesan acá, ya están todas visibles).
  const totalTopLevel = data?.pages[0]?.totalTopLevel ?? 0

  return (
    <section id="comments" className="scroll-mt-16">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">
          Comments{isPending ? "" : ` (${totalAll})`}
        </h2>
        <CommentSort value={sort} onChange={setSort} />
      </div>

      <div className="mt-4">
        <CommentInput contentId={contentId} sort={sort} />
      </div>

      {isPending ? (
        <ul className="mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CommentItemSkeleton key={i} />
          ))}
        </ul>
      ) : topLevelComments.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No comments yet. Be the first.
        </p>
      ) : (
        <ul className="mt-4">
          {topLevelComments.map((comment, index) => (
            <CommentItem key={comment.id} comment={comment} sort={sort} index={index} />
          ))}
        </ul>
      )}

      {hasNextPage && (
        <button
          type="button"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="press-feedback mt-2 min-h-11 text-sm font-medium text-foreground hover:underline disabled:opacity-50"
        >
          {isFetchingNextPage
            ? "Loading…"
            : `See ${totalTopLevel - topLevelComments.length} more comments`}
        </button>
      )}
    </section>
  )
}
