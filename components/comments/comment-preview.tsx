import { UserAvatar } from "@/components/shell/user-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import type { Comment } from "@/lib/types"

export function CommentPreview({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) return null

  return (
    <ul className="mt-3 flex flex-col gap-2 border-l-2 border-border pl-3 text-sm">
      {comments.map((comment) => (
        <li key={comment.id} className="flex items-start gap-1.5">
          <UserAvatar handle={comment.author.handle} size={20} className="mt-0.5" />
          <p className="line-clamp-2 text-muted-foreground">
            <span className="font-medium text-foreground">@{comment.author.handle}</span>{" "}
            {comment.body}
          </p>
        </li>
      ))}
    </ul>
  )
}

/**
 * Calca la forma real de `CommentPreview`: avatar 20px + texto por comentario. El texto real usa
 * `line-clamp-2` (hasta 2 líneas), así que el skeleton reserva DOS líneas por comentario — si
 * reservara una sola, la card crecería al llegar el preview real de 2 líneas (medido: ~36px de
 * salto por card), disparando un recálculo del clip-path del squircle a mitad de camino y el
 * "salto/rotura" visible al terminar de cargar. Reservar la altura máxima realista mata ese shift.
 */
export function CommentPreviewSkeleton() {
  return (
    <ul className="mt-3 flex flex-col gap-2 border-l-2 border-border pl-3">
      {[0, 1].map((i) => (
        <li key={i} className="flex items-start gap-1.5">
          <Skeleton className="mt-0.5 size-5 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/5" />
          </div>
        </li>
      ))}
    </ul>
  )
}
