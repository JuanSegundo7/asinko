"use client"

import { useState } from "react"
import { CommentSort } from "./comment-sort"
import { CommentInput } from "./comment-input"
import { CommentItem, CommentItemSkeleton } from "./comment-item"
import { useCommentsInfiniteQuery } from "@/lib/queries"
import type { CommentSort as CommentSortValue } from "@/lib/types"

/** Sección de comentarios del detalle (D3): primeros 5 + "Ver N más" paginado, toggle de sort, input de alta. */
export function CommentList({ contentId }: { contentId: string }) {
  const [sort, setSort] = useState<CommentSortValue>("TOP")
  const { data, isPending, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useCommentsInfiniteQuery(contentId, sort)

  const comments = data?.pages.flatMap((page) => page.items) ?? []
  const total = data?.pages[0]?.total ?? 0

  return (
    <section id="comentarios" className="scroll-mt-16">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">
          Comentarios{isPending ? "" : ` (${total})`}
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
      ) : comments.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Todavía no hay comentarios. Sé el primero.
        </p>
      ) : (
        <ul className="mt-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
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
          {isFetchingNextPage ? "Cargando…" : `Ver ${total - comments.length} comentarios más`}
        </button>
      )}
    </section>
  )
}
